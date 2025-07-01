export interface APIResponse<T = any> {
    success: boolean;
    error?: {
        code?: number;
        message?: string;
    };
    data?: T;
}

export interface RawResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
}

export interface ClientError {
    message: string;
    type: "network" | "timeout" | "abort" | "parse";
    originalError?: Error;
    response?: RawResponse;
}

export interface ResponseInterceptor {
    onResponse?: <T>(response: APIResponse<T>) => APIResponse<T> | Promise<APIResponse<T>>;
    onError?: (error: ClientError) => ClientError | Promise<ClientError>;
}