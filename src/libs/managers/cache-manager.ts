import { DynamicClientConstants } from "../constants/dynamic-client-constants";

/**
 * Manages caching for dynamic routes, actions, and parameterized routes
 * in the DynamicClient to improve performance and maintain stable references.
 */
export class CacheManager {
    private routeCache = new Map<string, unknown>();
    private actionCache = new Map<string, Record<string, unknown>>();
    private parameterizedCache = new Map<string, unknown>();

    /**
     * Gets a cached route by controller name
     * @param controller - The controller name to get the cached route for
     * @returns The cached route or undefined if not found
     */
    getRoute(controller: string): unknown | undefined {
        return this.routeCache.get(controller);
    }

    /**
     * Sets a cached route for a controller
     * @param controller - The controller name to set the route for
     * @param route - The route to cache
     */
    setRoute(controller: string, route: unknown): void {
        this.routeCache.set(controller, route);
    }

    /**
     * Checks if a route is cached
     * @param controller - The controller name to check
     * @returns True if the route is cached, false otherwise
     */
    hasRoute(controller: string): boolean {
        return this.routeCache.has(controller);
    }

    /**
     * Gets a cached action route by cache key
     * @param cacheKey - The cache key to get the action route for
     * @returns The cached action route or undefined if not found
     */
    getActionRoute(cacheKey: string): Record<string, unknown> | undefined {
        return this.actionCache.get(cacheKey);
    }

    /**
     * Sets a cached action route
     * @param cacheKey - The cache key to set the action route for
     * @param actionRoute - The action route to cache
     */
    setActionRoute(cacheKey: string, actionRoute: Record<string, unknown>): void {
        this.actionCache.set(cacheKey, actionRoute);
    }

    /**
     * Checks if an action route is cached
     * @param cacheKey - The cache key to check
     * @returns True if the action route is cached, false otherwise
     */
    hasActionRoute(cacheKey: string): boolean {
        return this.actionCache.has(cacheKey);
    }

    /**
     * Gets a cached parameterized route by cache key
     * @param cacheKey - The cache key to get the parameterized route for
     * @returns The cached parameterized route or undefined if not found
     */
    getParameterizedRoute(cacheKey: string): unknown | undefined {
        return this.parameterizedCache.get(cacheKey);
    }

    /**
     * Sets a cached parameterized route
     * @param cacheKey - The cache key to set the parameterized route for
     * @param paramRoute - The parameterized route to cache
     */
    setParameterizedRoute(cacheKey: string, paramRoute: unknown): void {
        this.parameterizedCache.set(cacheKey, paramRoute);
    }

    /**
     * Checks if a parameterized route is cached
     * @param cacheKey - The cache key to check
     * @returns True if the parameterized route is cached, false otherwise
     */
    hasParameterizedRoute(cacheKey: string): boolean {
        return this.parameterizedCache.has(cacheKey);
    }

    /**
     * Generates cache key for action routes
     * @param controller - The controller name to generate the cache key for
     * @returns The generated cache key
     */
    static generateActionCacheKey(controller: string): string {
        return `${DynamicClientConstants.CACHE_PREFIXES.ACTION}${controller}`;
    }

    /**
     * Generates cache key for parameterized routes
     * @param controller - The controller name to generate the cache key for
     * @param id - The ID to include in the cache key
     */
    static generateParameterizedCacheKey(controller: string, id: string | number): string {
        return `${DynamicClientConstants.CACHE_PREFIXES.PARAMETERIZED}${controller}_${id}`;
    }

    /**
     * This method clears the route, action, and parameterized caches.
     * It is useful for resetting the cache state, for example, when the API structure changes
     */
    clearProxyCache(): void {
        this.routeCache.clear();
        this.actionCache.clear();
        this.parameterizedCache.clear();
    }

    /**
     * Gets cache statistics
     * @returns An object containing the number of cached routes, actions, and parameterized routes
     */
    getStats(): {
        routes: number;
        actions: number;
        parameterized: number;
    } {
        return {
            routes: this.routeCache.size,
            actions: this.actionCache.size,
            parameterized: this.parameterizedCache.size,
        };
    }
}
