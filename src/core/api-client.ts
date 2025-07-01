import { APIConfig, RequestConfig } from "../types/config";
import { APIResponse, ClientError } from "../types/response";
import { URLBuilder } from "../utils/url-builder";
import { DataSerializer } from "../utils/data-serializer";
import { camelToKebab, convertObjectKeys } from "../utils/case-converter";

export class APIClient {
    private config: Required<APIConfig>;
    private requestInterceptors: Array<
        (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
    > = [];
    private responseInterceptors: Array<
        (response: APIResponse) => APIResponse | Promise<APIResponse>
    > = [];

    constructor(config: APIConfig) {
        this.config = {
            baseUrl: config.baseUrl,
            timeout: config.timeout || 5000,
            headers: config.headers || {},
            withCredentials: config.withCredentials ?? true,
            retries: config.retries || 3,
            retryDelay: config.retryDelay || 1000,
            useKebabCase: config.useKebabCase || false,
        };
    }

    async get<T = any>(
        url: string,
        config?: RequestConfig
    ): Promise<APIResponse<T>> {
        return this.request<T>({ ...config, method: "GET", url });
    }

    async post<T = any>(
        url: string,
        data?: any,
        config?: RequestConfig
    ): Promise<APIResponse<T>> {
        return this.request<T>({ ...config, method: "POST", url, data });
    }

    async put<T = any>(
        url: string,
        data?: any,
        config?: RequestConfig
    ): Promise<APIResponse<T>> {
        return this.request<T>({ ...config, method: "PUT", url, data });
    }

    async delete<T = any>(
        url: string,
        config?: RequestConfig
    ): Promise<APIResponse<T>> {
        return this.request<T>({ ...config, method: "DELETE", url });
    }

    async patch<T = any>(
        url: string,
        data?: any,
        config?: RequestConfig
    ): Promise<APIResponse<T>> {
        return this.request<T>({ ...config, method: "PATCH", url, data });
    }

    private async request<T = any>(
        config: RequestConfig
    ): Promise<APIResponse<T>> {
        let finalConfig = this.mergeConfig(config);

        for (const interceptor of this.requestInterceptors) {
            finalConfig = this.mergeConfig(await interceptor(finalConfig));
        }

        let attempt = 0;
        const maxAttempts = finalConfig.retries! + 1;

        while (attempt < maxAttempts) {
            try {
                const response = await this.executeRequest<T>(finalConfig);

                let finalResponse = response;
                for (const interceptor of this.responseInterceptors) {
                    finalResponse = await interceptor(finalResponse);
                }
                return finalResponse;
            } catch (error) {
                attempt++;

                if (attempt >= maxAttempts || !this.shouldRetry(error)) {
                    throw error;
                }
                await this.delay(finalConfig.retryDelay!);
            }
        }
        throw new Error("Request failed after maximum retry attempts.");
    }

    private mergeConfig(config: RequestConfig): Required<RequestConfig> {
        return {
            method: config.method || "GET",
            url: config.url || "",
            data: config.data || null,
            params: config.params || {},
            signal:
                (config.signal as AbortSignal) || new AbortController().signal,
            timeout: config.timeout ?? this.config.timeout,
            headers: config.headers ?? this.config.headers,
            withCredentials:
                config.withCredentials ?? this.config.withCredentials,
            retries: config.retries ?? this.config.retries,
            retryDelay: config.retryDelay ?? this.config.retryDelay,
            useKebabCase: config.useKebabCase ?? this.config.useKebabCase,
        };
    }

    private async executeRequest<T>(
        config: Required<RequestConfig>
    ): Promise<APIResponse<T>> {
        const url = this.buildUrl(config.url, config.params);
        const body = config.data
            ? DataSerializer.serialize(config.data)
            : undefined;
        const headers = this.buildHeaders(config.headers, config.data);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        try {
            const response = await fetch(url, {
                method: config.method,
                headers,
                body,
                credentials: config.withCredentials ? "include" : "omit",
                signal: config.signal || controller.signal,
            });

            clearTimeout(timeoutId);
            return await this.parseResponse<T>(response);
        } catch (error) {
            clearTimeout(timeoutId);
            throw this.createClientError(error);
        }
    }

    private buildUrl(path: string, params?: Record<string, any>): string {
        const formattedPath = this.config.useKebabCase 
            ? this.convertPathToKebab(path) 
            : path;
        const builder = new URLBuilder(this.config.baseUrl).segment(formattedPath);
        
        if (params && Object.keys(params).length) {
            const formattedParams = this.config.useKebabCase 
                ? convertObjectKeys(params, camelToKebab) 
                : params;
            builder.query(formattedParams);
        }
        return builder.build();
    }

    private convertPathToKebab(path: string): string {
        return path
            .split("/")
            .map((segment) => camelToKebab(segment))
            .join("/");
    }

    private buildHeaders(
        configHeaders: Record<string, string>,
        data?: any
    ): Record<string, string> {
        const headers = { ...configHeaders };
        const contentType = DataSerializer.getContentType(data);
        
        if (contentType) {
            headers["Content-Type"] = contentType;
        }
        return headers;
    }

    private async parseResponse<T>(
        response: Response
    ): Promise<APIResponse<T>> {
        try {
            const data = await response.json();

            if (typeof data === "object" && "success" in data) {
                return data as APIResponse<T>;
            }
            return {
                success: response.ok,
                data: response.ok ? data : undefined,
                error: response.ok
                    ? undefined
                    : {
                          code: response.status,
                          message: response.statusText || "Request failed",
                      },
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: response.status,
                    message: "Failed to parse response",
                },
            };
        }
    }

    private createClientError(error: any): ClientError {
        if (error.name === "AbortError") {
            return {
                message: "Request was aborted",
                type: "abort",
                originalError: error,
            };
        }
        if (error.name === "TypeError") {
            return {
                message: "Network error",
                type: "network",
                originalError: error,
            };
        }
        return {
            message: error.message || "Unknown error",
            type: "network",
            originalError: error,
        };
    }

    private shouldRetry(error: any): boolean {
        if (error.type === "abort") return false;
        if (error.type === "timeout") return true;
        if (error.type === "network") return true;
        return false;
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    addRequestInterceptor(
        interceptor: (
            config: RequestConfig
        ) => RequestConfig | Promise<RequestConfig>
    ): void {
        this.requestInterceptors.push(interceptor);
    }

    addResponseInterceptor(
        interceptor: (
            response: APIResponse
        ) => APIResponse | Promise<APIResponse>
    ): void {
        this.responseInterceptors.push(interceptor);
    }
}
