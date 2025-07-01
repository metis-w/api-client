import { HTTPMethod, RequestConfig } from "./config";

export interface APIRequest {
    url: string;
    method: HTTPMethod;
    headers?: Record<string, string>;
    data?: any;
    params?: Record<string, any>;
    timeout?: number;
    withCredentials?: boolean;
    signal?: AbortSignal;
}

export interface RequestInterceptor {
    onRequest?: (request: RequestConfig) => RequestConfig | Promise<RequestConfig>;
    onError?: (error: Error) => Error | Promise<Error>;
}

export type RequestFunction = <T = any>(
    url: string,
    config?: RequestConfig
) => Promise<T>;