import { ClientError } from "../../types/response";

/**
 * Manages retry logic for failed requests
 */
export class RetryManager {
    /**
     * Determines if the request should be retried based on the error type.
     * Aborts are not retried, while timeouts and network errors are retried.
     *
     * @param error - The error object to evaluate
     * @returns True if the request should be retried, false otherwise
     */
    static shouldRetry(error: ClientError): boolean {
        if (error.type === "abort") return false;
        if (error.type === "timeout") return true;
        if (error.type === "network") return true;
        return false;
    }

    /**
     * Delays execution for a specified number of milliseconds.
     * Used for retry delays in case of request failures.
     *
     * @param ms - The number of milliseconds to delay
     * @returns A Promise that resolves after the specified delay
     */
    static delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Calculates exponential backoff delay
     * @param attempt - Current attempt number (0-based)
     * @param baseDelay - Base delay in milliseconds
     * @param maxDelay - Maximum delay in milliseconds
     * @returns Calculated delay with jitter
     */
    static calculateBackoffDelay(
        attempt: number,
        baseDelay: number,
        maxDelay: number = 30000
    ): number {
        const exponentialDelay = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
        return Math.min(exponentialDelay + jitter, maxDelay);
    }
}