export interface APIConfig {
    baseUrl: string;
    timeout?: number;
    headers?: Record<string, string>;
    withCredentials?: boolean;
    retries?: number;
    retryDelay?: number;
    useKebabCase?: boolean;
    defaultMethod?: HTTPMethod;
    methodRules?: Record<string, HTTPMethod>;
}

export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface RequestConfig extends Omit<APIConfig, "baseUrl"> {
    method?: HTTPMethod;
    url?: string;
    data?: any;
    params?: Record<string, any>;
    signal?: AbortSignal;
}
