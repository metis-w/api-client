import { APIConfig, APIResponse, RequestConfig } from "../types";

import { DataSerializer } from "../utils";
import { ResponseParser } from "../libs/parsers";
import { RequestBuilder } from "../libs/builders";

import { RetryManager, InterceptorManager } from "../libs/managers";

export class APIClient {
    private config: Required<APIConfig>;
    private interceptorManager = new InterceptorManager();

    /**
     * Returns the interceptor manager for adding request and response interceptors.
     * This allows modification of requests and responses globally.
     */
    public get interceptors() {
        return this.interceptorManager;
    }

    /**
     * Returns the current configuration.
     * This allows access to configuration from derived classes.
     */
    protected get apiConfig() {
        return this.config;
    }

    constructor(config: APIConfig) {
        this.config = {
            baseUrl: config.baseUrl,
            timeout: config.timeout || 5000,
            headers: config.headers || {},
            withCredentials: config.withCredentials ?? false,
            retries: config.retries || 3,
            retryDelay: config.retryDelay || 1000,
            useKebabCase: config.useKebabCase || false,
            defaultMethod: config.defaultMethod || "POST",
            methodRules: config.methodRules || {},
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

    /**
     * Destroys the APIClient instance, clearing all interceptors and references.
     * This is useful for cleanup when the client is no longer needed.
     */
    destroy(): void {
        this.config = null as any;
        this.interceptorManager.clearAllInterceptors();
    }

    /**
     * Sends an HTTP request with the specified configuration.
     * This method handles retries, interceptors, and error parsing.
     *
     * @param config - The request configuration object
     * @returns A Promise that resolves to an APIResponse object
     */
    protected async request<T = any>(
        config: RequestConfig
    ): Promise<APIResponse<T>> {
        let finalConfig = RequestBuilder.mergeConfig(config, this.config);

        for (const {
            interceptor,
        } of this.interceptorManager.getRequestInterceptors()) {
            finalConfig = RequestBuilder.mergeConfig(
                await interceptor(finalConfig),
                finalConfig
            );
        }
        let attempt = 0;
        const maxAttempts = finalConfig.retries! + 1;

        while (attempt < maxAttempts) {
            try {
                const response = await this.executeRequest<T>(finalConfig);

                let finalResponse = response;

                for (const {
                    interceptor,
                } of this.interceptorManager.getResponseInterceptors()) {
                    finalResponse = await interceptor(finalResponse);
                }
                return finalResponse;
            } catch (error) {
                attempt++;
                const clientError = ResponseParser.createClientError(error);

                if (
                    attempt >= maxAttempts ||
                    !RetryManager.shouldRetry(clientError)
                ) {
                    throw clientError;
                }
                const delay = RetryManager.calculateBackoffDelay(
                    attempt - 1,
                    finalConfig.retryDelay!
                );
                await RetryManager.delay(delay);
            }
        }
        throw new Error("Request failed after maximum retry attempts.");
    }

    /**
     * Executes the HTTP request using the Fetch API.
     * This method handles serialization, headers, and error parsing.
     *
     * @param config - The request configuration object
     * @returns A Promise that resolves to an APIResponse object
     */
    private async executeRequest<T>(
        config: Required<RequestConfig>
    ): Promise<APIResponse<T>> {
        const url = RequestBuilder.buildUrl(
            this.config.baseUrl,
            config.url,
            config.params,
            this.config.useKebabCase
        );
        const body = config.data
            ? DataSerializer.serialize(config.data)
            : undefined;
        const headers = RequestBuilder.buildHeaders(
            config.headers,
            config.data
        );
        const controller = config.signal ? null : new AbortController();
        const effectiveSignal = config.signal || controller?.signal;

        const timeoutId = setTimeout(() => {
            if (controller) controller.abort();
        }, config.timeout);
        try {
            const response = await fetch(url, {
                method: config.method,
                headers,
                body,
                credentials: config.withCredentials ? "include" : "omit",
                signal: effectiveSignal,
            });

            clearTimeout(timeoutId);
            return await ResponseParser.parseResponse<T>(response);
        } catch (error) {
            clearTimeout(timeoutId);
            throw ResponseParser.createClientError(error);
        }
    }
}
