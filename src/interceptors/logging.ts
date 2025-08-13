import { APIResponse, RequestConfig, ClientError } from "../types";

export interface LoggingOptions {
    logRequests?: boolean;
    logResponses?: boolean;
    logErrors?: boolean;
    logLevel?: "debug" | "info" | "warn" | "error";
}

/**
 * Request logging interceptor
 * @param options - Logging configuration
 */
export const requestLoggingInterceptor = (options: LoggingOptions = {}) => {
    const { logRequests = true, logLevel = "info" } = options;

    return (config: RequestConfig): RequestConfig => {
        if (logRequests) {
            console[logLevel](
                `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
                {
                    data: config.data,
                    params: config.params,
                    headers: config.headers,
                }
            );
        }
        return config;
    };
};

/**
 * Response logging interceptor
 * @param options - Logging configuration
 */
export const responseLoggingInterceptor = (options: LoggingOptions = {}) => {
    const { logResponses = true, logLevel = "info" } = options;

    return (response: APIResponse): APIResponse => {
        if (logResponses) {
            const status = response.success ? "✅" : "❌";
            console[logLevel](`${status} API Response:`, {
                success: response.success,
                data: response.data,
                error: response.error,
            });
        }
        return response;
    };
};

/**
 * Error logging interceptor
 * @param options - Logging configuration
 */
export const errorLoggingInterceptor = (options: LoggingOptions = {}) => {
    const { logErrors = true, logLevel = "error" } = options;

    return (error: ClientError): ClientError => {
        if (logErrors) {
            console[logLevel]("💥 API Error:", {
                message: error.message,
                type: error.type,
                originalError: error.originalError,
            });
        }
        return error;
    };
};
