export class URLBuilder {
    private baseUrl: string;
    private segments: string[] = [];
    private queryParams: Record<string, any> = {};

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl.replace(/\/+$/, "");
    }

    /**
     * Adds a path segment to the URL, automatically handling leading/trailing slashes.
     * @param path - The path segment to add.
     */
    segment(path: string): this {
        if (path) {
            const cleanPath = path.replace(/^\/+|\/+$/g, "");

            if (cleanPath) {
                const pathSegments = cleanPath.split('/').filter(segment => segment.length > 0);
                this.segments.push(...pathSegments);
            }
        }
        return this;
    }

    /**
     * Adds query parameters to the URL.
     * @param params - An object containing key-value pairs for query parameters.
     */
    query(params: Record<string, any>): this {
        Object.assign(this.queryParams, params);
        return this;
    }

    /**
     * Builds the final URL string.
     * Combines the base URL, path segments, and query parameters.
     * @returns The constructed URL string.
     */
    build(): string {
        let pathSegments = '';
        if (this.segments.length > 0) {
            // Check if baseUrl already ends with a slash
            const baseEndsWithSlash = this.baseUrl.endsWith('/');
            const separator = baseEndsWithSlash ? '' : '/';
            pathSegments = `${separator}${this.segments.join('/')}`;
        }
        
        const queryString = this.buildQueryString();
        const query = queryString ? `?${queryString}` : '';
        
        return `${this.baseUrl}${pathSegments}${query}`;
    }

    /**
     * Builds the query string from the query parameters.
     * Filters out undefined or null values.
     * @returns The query string.
     */
    private buildQueryString(): string {
        return Object.entries(this.queryParams)
            .filter(([, value]) => value !== undefined && value !== null)
            .map(
                ([key, value]) =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(
                        String(value)
                    )}`
            )
            .join("&");
    }
}
