export class Sanitizer {
    /**
     * Sanitizes request headers to prevent header injection attacks
     * by filtering out potentially dangerous header keys and values.
     *
     * @param headers - The headers object to sanitize
     * @returns A new object with sanitized headers
     */
    static sanitizeHeaders(
        headers: Record<string, string>
    ): Record<string, string> {
        // List of potentially dangerous header patterns
        const dangerousPatterns = [/script/i, /eval/i, /on\w+/i];
        const sanitized: Record<string, string> = {};

        for (const [key, value] of Object.entries(headers)) {
            // Skip headers with potentially harmful keys
            if (dangerousPatterns.some((pattern) => pattern.test(key))) {
                continue;
            }
            // Sanitize header values: remove CRLF to prevent header injection
            const sanitizedValue =
                typeof value === "string"
                    ? value.replace(/[\r\n\t]/g, "").trim()
                    : String(value).trim();

            if (sanitizedValue) {
                sanitized[key] = sanitizedValue;
            }
        }
        return sanitized;
    }

    /**
     * Sanitizes a path to prevent directory traversal and script injection attacks.
     * It removes dangerous characters and normalizes the path.
     *
     * @param path - The path to sanitize
     * @returns A sanitized path string
     */
    static sanitizePath(path: string): string {
        if (!path || typeof path !== "string") {
            throw new Error("Path must be a non-empty string");
        }
        return path
            .replace(/[<>'"]/g, "") // Remove HTML/script chars
            .replace(/\.\./g, "") // Remove directory traversal
            .replace(/\/+/g, "/") // Normalize multiple slashes
            .replace(/^\/+/, "/") // Ensure single leading slash
            .trim();
    }
}
