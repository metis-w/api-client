import { APIResponse, RequestConfig } from "../types";

export interface CacheOptions {
    ttl?: number; // Time to live in milliseconds
    maxSize?: number; // Maximum cache entries
    cacheKey?: (config: RequestConfig) => string;
}

/**
 * Simple in-memory cache interceptor for GET requests
 */
export class CacheInterceptor {
    private cache = new Map<string, { data: APIResponse; timestamp: number }>();
    private options: Required<CacheOptions>;

    constructor(options: CacheOptions = {}) {
        this.options = {
            ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
            maxSize: options.maxSize || 100,
            cacheKey: options.cacheKey || this.defaultCacheKey,
        };
    }

    private defaultCacheKey(config: RequestConfig): string {
        const params = config.params ? JSON.stringify(config.params) : "";
        return `${config.method}_${config.url}_${params}`;
    }

    requestInterceptor = (config: RequestConfig): RequestConfig => {
        // Only for GET requests
        if (config.method?.toUpperCase() !== "GET") {
            return config;
        }
        const key = this.options.cacheKey(config);
        const cached = this.cache.get(key);

        if (cached && this.isValid(cached.timestamp)) {
            console.info(`📦 Cache HIT for ${config.url}`);
            // In a real application, there would be a mechanism to return cached data here
        }
        return config;
    };

    responseInterceptor = (
        response: APIResponse,
        config?: RequestConfig
    ): APIResponse => {
        if (config?.method?.toUpperCase() === "GET" && response.success) {
            const key = this.options.cacheKey(config);

            // Clear old entries if we've reached the limit
            if (this.cache.size >= this.options.maxSize) {
                this.clearOldest();
            }
            this.cache.set(key, {
                data: response,
                timestamp: Date.now(),
            });
            console.info(`💾 Cached response for ${config.url}`);
        }

        return response;
    };

    private isValid(timestamp: number): boolean {
        return Date.now() - timestamp < this.options.ttl;
    }

    private clearOldest(): void {
        const oldestKey = this.cache.keys().next().value;
        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }

    /**
     * Clear all cached entries
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.options.maxSize,
            ttl: this.options.ttl,
        };
    }
}
