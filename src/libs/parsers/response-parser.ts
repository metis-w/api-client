import { APIResponse, ClientError } from "../../types";

/**
 * Utilities for parsing HTTP responses and creating standardized error objects
 */
export class ResponseParser {
    /**
     * Parses the response from the fetch call, handling both success and error cases.
     * It returns a standardized APIResponse object.
     *
     * @param response - The Response object from the fetch call
     * @returns A Promise that resolves to an APIResponse object
     */
    static async parseResponse<T>(response: Response): Promise<APIResponse<T>> {
        try {
            const data = await response.json();

            if (typeof data === "object" && "success" in data) {
                return data as APIResponse<T>;
            }
            return {
                success: response.ok,
                data: response.ok ? data : undefined,
                error: response.ok
                    ? undefined
                    : {
                          code: response.status,
                          message: response.statusText || "Request failed",
                      },
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: response.status,
                    message: "Failed to parse response",
                },
            };
        }
    }

    /**
     * Creates a standardized ClientError object from any caught error.
     *
     * @param error - The error to convert
     * @returns A standardized ClientError object
     */
    static createClientError(error: unknown): ClientError {
        // Handle standard Error objects
        if (error instanceof Error) {
            // Create error info object once to avoid repetition
            const errorInfo = {
                name: error.name,
                message: error.message,
                stack: error.stack,
            };
            
            // Specific error types
            switch (error.name) {
                case "AbortError":
                    return {
                        message: "Request was aborted",
                        type: "abort",
                        originalError: error,
                    };
                case "TypeError":
                    return {
                        message: "Network error",
                        type: "network",
                        originalError: errorInfo,
                    };
                default:
                    return {
                        message: error.message || "Unknown error",
                        type: "network",
                        originalError: errorInfo,
                    };
            }
        }
        // For non-Error objects, extract properties safely
        const errorObj = typeof error === 'object' && error !== null ? error as Record<string, unknown> : {};
        
        const errorInfo = {
            name: typeof errorObj.name === 'string' ? errorObj.name : "UnknownError",
            message: typeof errorObj.message === 'string' ? errorObj.message : 
                    (error !== undefined ? String(error) : "Unknown error"),
            stack: typeof errorObj.stack === 'string' ? errorObj.stack : undefined,
        };
        return {
            message: errorInfo.message,
            type: "network",
            originalError: errorInfo,
        };
    }
}
