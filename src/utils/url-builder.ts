export class URLBuilder {
    private baseUrl: string;
    private segments: string[] = [];
    private queryParams: Record<string, any> = {};

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl.replace(/\/+$/, "");
    }

    /**
     * Sets the base URL for the builder.
     * @param baseUrl - The base URL to set.
     */
    segment(path: string): this {
        if (path) {
            this.segments.push(path.toString());
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
        const pathSegments = this.segments.length > 0 
            ? `/${this.segments.join('/')}`
            : '';
        
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
