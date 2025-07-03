import { APIClient } from "./api-client";
import { APIConfig } from "../types/config";
import { CacheManager } from "../libs/managers/cache-manager";
import { RouteBuilder } from "../libs/builders/route-builder";
import { APIResponse } from "../types/response";
import { MethodResolverOptions } from "../utils/method-resolver";

/**
 * Interface for dynamic route functions
 */
export interface DynamicRoute {
    /**
     * Call the route as an action with data
     */
    (data?: any): Promise<APIResponse>;
    
    /**
     * Create a parameterized route with an ID
     */
    (id: string | number): DynamicParameterizedRoute;
}

/**
 * Interface for parameterized routes (e.g., api.users(123).action() or api.users(123)())
 */
export interface DynamicParameterizedRoute {
    /**
     * Call the parameterized route directly
     * - No payload: GET /resource/id
     * - With payload: PUT /resource/id (default for updates)
     */
    (payload?: any, queryParams?: Record<string, string>): Promise<APIResponse>;
    
    /**
     * Call specific actions on the parameterized route
     */
    [action: string]: (data?: any, queryParams?: Record<string, string>) => Promise<APIResponse>;
}

/**
 * Type-safe DynamicClient interface
 */
export interface IDynamicClient extends APIClient {
    [route: string]: any;
    cache: CacheManager;
    destroy(): void;
}

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

        const methodOptions: MethodResolverOptions = {
            defaultMethod: config.defaultMethod,
            methodRules: config.methodRules
        };
        
        const universalRequest = (endpoint: string, payload?: any, config?: any) => {
            const httpMethod = config?.method || this.apiConfig.defaultMethod || 'POST';
            return this.request({
                url: endpoint,
                method: httpMethod,
                data: payload,
                params: config?.params
            });
        };

        return new Proxy(this, {
            get(target, prop: string) {
                if (prop in target) {
                    return target[prop as keyof typeof target];
                }
                return RouteBuilder.createRoute(
                    prop,
                    target.cacheManager,
                    universalRequest,
                    methodOptions
                );
            },
        }) as any; // We'll use IDynamicClient interface for typing
    }

    /**
     * Destroys the dynamic client and cleans up all caches
     */
    destroy(): void {
        this.cacheManager.clearProxyCache();
        super.destroy();
    }
}
