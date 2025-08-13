export * from "./logging";
export * from "./timing";
export * from "./cache";

// Minimal imports for local convenience helpers
import {
    requestLoggingInterceptor,
    errorLoggingInterceptor,
    responseLoggingInterceptor,
} from "./logging";
import type { LoggingOptions } from "./logging";
import { performanceInterceptor } from "./timing";

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
