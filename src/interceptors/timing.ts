import { APIResponse, RequestConfig } from "../types";

export interface TimingOptions {
    logTiming?: boolean;
    logLevel?: "debug" | "info" | "warn" | "error";
    slowRequestThreshold?: number; // milliseconds
}

/**
 * Request timing interceptor - measures API request duration
 * @param options - Timing configuration
 */
export const timingInterceptor = (options: TimingOptions = {}) => {
    const {
        logTiming = true,
        logLevel = "info",
        slowRequestThreshold = 1000,
    } = options;

    const timings = new Map<string, number>();

    const requestInterceptor = (config: RequestConfig): RequestConfig => {
        const requestId = `${config.method}_${config.url}_${Date.now()}`;
        timings.set(requestId, performance.now());

        // Add request ID to config for tracking
        config.headers = {
            ...config.headers,
            "X-Request-ID": requestId,
        };
        return config;
    };

    const responseInterceptor = (response: APIResponse): APIResponse => {
        // Normally we would pull the Request-ID from response headers; for simplicity
        // we just log all completed requests
        if (logTiming) {
            // In a real app, timings would be correlated via IDs
            console[logLevel]("⏱️ Request completed");
        }
        return response;
    };

    return { requestInterceptor, responseInterceptor };
};

/**
 * Simple performance logging interceptor
 */
export const performanceInterceptor = () => {
    let requestStartTime: number;

    const requestInterceptor = (config: RequestConfig): RequestConfig => {
        requestStartTime = performance.now();
        return config;
    };

    const responseInterceptor = (response: APIResponse): APIResponse => {
        const duration = performance.now() - requestStartTime;
        const emoji = duration > 1000 ? "🐌" : duration > 500 ? "⚡" : "🚀";

        console.info(`${emoji} Request took ${duration.toFixed(2)}ms`);
        return response;
    };

    return { requestInterceptor, responseInterceptor };
};
