import {
    LoggingOptions,
    requestLoggingInterceptor,
    errorLoggingInterceptor,
    responseLoggingInterceptor,
} from "./logging";

import { performanceInterceptor } from "./timing";

// Logging interceptors
export {
    requestLoggingInterceptor,
    responseLoggingInterceptor,
    errorLoggingInterceptor,
    type LoggingOptions,
} from "./logging";

// Timing interceptors
export {
    timingInterceptor,
    performanceInterceptor,
    type TimingOptions,
} from "./timing";

// Cache interceptor
export { CacheInterceptor, type CacheOptions } from "./cache";

// Convenience function to create a logging setup
export const createLoggingSetup = (options?: LoggingOptions) => ({
    request: requestLoggingInterceptor(options),
    response: responseLoggingInterceptor(options),
    error: errorLoggingInterceptor(options),
});

// Convenience function for performance monitoring
export const createPerformanceSetup = () => {
    const { requestInterceptor, responseInterceptor } =
        performanceInterceptor();
    return { request: requestInterceptor, response: responseInterceptor };
};
