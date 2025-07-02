import { APIClient } from "./api-client";
import { APIConfig } from "../types/config";
import { CacheManager } from "../libs/managers/cache-manager";
import { RouteBuilder } from "../libs/builders/route-builder";

export class DynamicClient extends APIClient {
    private cacheManager = new CacheManager();

    /**
     * Returns the cache manager for dynamic routes, actions, and parameterized routes.
     * This allows access to cached routes and actions.
     */
    public get cache() {
        return this.cacheManager;
    }

    constructor(config: APIConfig) {
        super(config);

        return new Proxy(this, {
            get(target, prop: string) {
                if (prop in target) {
                    return target[prop as keyof typeof target];
                }
                return RouteBuilder.createRoute(
                    prop,
                    target.cacheManager,
                    target.post.bind(target)
                );
            },
        });
    }

    /**
     * Destroys the dynamic client and cleans up all caches
     */
    destroy(): void {
        this.cacheManager.clearProxyCache();
        super.destroy();
    }
}
