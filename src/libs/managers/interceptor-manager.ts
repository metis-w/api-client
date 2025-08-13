import { APIResponse, RequestConfig } from "../../types";

interface InterceptorConfig {
    id: string;
    interceptor: (
        config: RequestConfig
    ) => RequestConfig | Promise<RequestConfig>;
}

interface ResponseInterceptorConfig {
    id: string;
    interceptor: (response: APIResponse) => APIResponse | Promise<APIResponse>;
}

export class InterceptorManager {
    private requestInterceptors: Set<InterceptorConfig> = new Set();
    private responseInterceptors: Set<ResponseInterceptorConfig> = new Set();

    /**
     * Adds a request interceptor to the client.
     * @param interceptor Adds a request interceptor to the client.
     */
    addRequestInterceptor(
        interceptor: (
            config: RequestConfig
        ) => RequestConfig | Promise<RequestConfig>
    ): void {
        const id = `auto-${Date.now()}-${Math.random()}`;
        this.requestInterceptors.add({ id, interceptor });
    }

    /**
     * Adds a response interceptor to the client.
     * Interceptors can modify the response before it is returned.
     * @param interceptor Adds a response interceptor to the client.
     */
    addResponseInterceptor(
        interceptor: (
            response: APIResponse
        ) => APIResponse | Promise<APIResponse>
    ): void {
        const id = `auto-${Date.now()}-${Math.random()}`;
        this.responseInterceptors.add({ id, interceptor });
    }

    /**
     * Adds a request interceptor with a specific ID.
     * @param id - Unique identifier for the interceptor
     * @param interceptor - The interceptor function to be added
     */
    addRequestInterceptorWithId(
        id: string,
        interceptor: (
            config: RequestConfig
        ) => RequestConfig | Promise<RequestConfig>
    ): void {
        this.requestInterceptors.add({ id, interceptor });
    }

    /**
     * Adds a response interceptor with a specific ID.
     * @param id - Unique identifier for the interceptor
     * @param interceptor - The interceptor function to be added
     */
    addResponseInterceptorWithId(
        id: string,
        interceptor: (
            response: APIResponse
        ) => APIResponse | Promise<APIResponse>
    ): void {
        this.responseInterceptors.add({ id, interceptor });
    }

    /**
     * Removes a request interceptor by its unique ID.
     * @param id - Unique identifier for the interceptor
     * @return True if the interceptor was removed, false if not found
     */
    removeRequestInterceptor(id: string): boolean {
        for (const config of this.requestInterceptors) {
            if (config.id === id) {
                return this.requestInterceptors.delete(config);
            }
        }
        return false;
    }

    /**
     * Removes a response interceptor by its unique ID.
     * @param id - Unique identifier for the interceptor
     * @return True if the interceptor was removed, false if not found
     */
    removeResponseInterceptor(id: string): boolean {
        for (const config of this.responseInterceptors) {
            if (config.id === id) {
                return this.responseInterceptors.delete(config);
            }
        }
        return false;
    }

    /**
     * Clears all request interceptors.
     */
    clearRequestInterceptors(): void {
        this.requestInterceptors.clear();
    }

    /**
     * Clears all response interceptors.
     */
    clearResponseInterceptors(): void {
        this.responseInterceptors.clear();
    }

    /**
     * Clears all request and response interceptors.
     */
    clearAllInterceptors(): void {
        this.clearRequestInterceptors();
        this.clearResponseInterceptors();
    }

    /**
     * Gets all request interceptors for execution
     * @return Set of request interceptors
     */
    getRequestInterceptors(): Set<InterceptorConfig> {
        return this.requestInterceptors;
    }

    /**
     * Gets all response interceptors for execution
     * @return Set of response interceptors
     */
    getResponseInterceptors(): Set<ResponseInterceptorConfig> {
        return this.responseInterceptors;
    }
}