import { APIResponse } from "../../types/response";
import { CacheManager } from "../managers/cache-manager";
import { RouteValidator } from "../../utils/route-validator";

/**
 * Manages the creation and building of dynamic routes for the DynamicClient.
 * Handles route creation, action handlers, and parameterized routes.
 */
export class RouteBuilder {
    /**
     * Creates a dynamic route for the specified controller.
     * If the route is already cached, it returns the cached version.
     * Otherwise, it creates a new route and caches it.
     *
     * @param controller - The controller name to create the route for
     * @param cacheManager - The cache manager instance to use for caching routes
     * @param postMethod - The method to call for making POST requests
     * @returns A dynamic route function that can handle actions and parameterized routes
     */
    static createRoute(
        controller: string,
        cacheManager: CacheManager,
        postMethod: (endpoint: string, payload?: Record<string, unknown>, config?: { params?: Record<string, string> }) => Promise<APIResponse<unknown>>
    ): unknown {
        if (cacheManager.hasRoute(controller)) {
            return cacheManager.getRoute(controller);
        }

        const routeFunction = (id?: string | number) => {
            return id !== undefined
                ? this.createParameterizedRoute(controller, id, cacheManager, postMethod)
                : this.createActionRoute(controller, cacheManager, postMethod);
        };

        const cachedProxy = new Proxy(routeFunction, {
            get: (_, action: string) =>
                RouteValidator.isValidAction(action)
                    ? this.createActionHandler(controller, action, postMethod)
                    : undefined,
        });

        cacheManager.setRoute(controller, cachedProxy);
        return cachedProxy;
    }

    /**
     * Creates a dynamic action route for the specified controller.
     * If the action route is already cached, it returns the cached version.
     * Otherwise, it creates a new action route and caches it.
     *
     * @param controller - The controller name to create the action route for
     * @param cacheManager - The cache manager instance to use for caching routes
     * @param postMethod - The method to call for making POST requests
     * @returns A dynamic action route object
     */
    static createActionRoute(
        controller: string,
        cacheManager: CacheManager,
        postMethod: (endpoint: string, payload?: Record<string, unknown>, config?: { params?: Record<string, string> }) => Promise<APIResponse<unknown>>
    ): Record<string, unknown> {
        const cacheKey = CacheManager.generateActionCacheKey(controller);

        if (cacheManager.hasActionRoute(cacheKey)) {
            return cacheManager.getActionRoute(cacheKey)!;
        }

        const actionRoute = new Proxy(
            {},
            {
                get: (_, action: string) =>
                    RouteValidator.isValidAction(action)
                        ? this.createActionHandler(controller, action, postMethod)
                        : undefined,
            }
        );

        cacheManager.setActionRoute(cacheKey, actionRoute);
        return actionRoute;
    }

    /**
     * Creates an action handler for the specified controller and action.
     * If the action handler is already cached, it returns the cached version.
     * Otherwise, it creates a new action handler and caches it.
     *
     * @param controller - The controller name to create the action handler for
     * @param action - The action name to create the handler for
     * @param postMethod - The method to call for making POST requests
     * @returns A dynamic action handler function
     */
    static createActionHandler(
        controller: string,
        action: string,
        postMethod: (endpoint: string, payload?: Record<string, unknown>, config?: { params?: Record<string, string> }) => Promise<APIResponse<unknown>>
    ): unknown {
        const baseEndpoint = `/${controller}/${action}`;

        const mainHandler = (
            payload?: Record<string, unknown>,
            queryParams?: Record<string, string>
        ): Promise<APIResponse<unknown>> => {
            return postMethod(baseEndpoint, payload, { params: queryParams });
        };

        return new Proxy(mainHandler, {
            get: (_, subAction: string) =>
                RouteValidator.isValidAction(subAction)
                    ? this.createSubActionHandler(baseEndpoint, subAction, postMethod)
                    : undefined,
        });
    }

    /**
     * Creates a parameterized route for the specified controller and ID.
     * If the parameterized route is already cached, it returns the cached version.
     * Otherwise, it creates a new parameterized route and caches it.
     *
     * @param controller - The controller name to create the parameterized route for
     * @param id - The ID to use in the parameterized route
     * @param cacheManager - The cache manager instance to use for caching routes
     * @param postMethod - The method to call for making POST requests
     * @returns A dynamic parameterized route object
     */
    static createParameterizedRoute(
        controller: string,
        id: string | number,
        cacheManager: CacheManager,
        postMethod: (endpoint: string, payload?: Record<string, unknown>, config?: { params?: Record<string, string> }) => Promise<APIResponse<unknown>>
    ): Record<string, unknown> {
        const cacheKey = CacheManager.generateParameterizedCacheKey(controller, id);

        if (cacheManager.hasParameterizedRoute(cacheKey)) {
            return cacheManager.getParameterizedRoute(cacheKey)!;
        }
        const paramRoute = new Proxy(
            {},
            {
                get: (_, action: string) => {
                    if (!RouteValidator.isValidAction(action)) return undefined;

                    const endpoint = `/${controller}/${id}/${action}`;
                    const paramHandler = this.createEndpointHandler(endpoint, postMethod);

                    return new Proxy(paramHandler, {
                        get: (_, subAction: string) =>
                            RouteValidator.isValidAction(subAction)
                                ? this.createSubActionHandler(endpoint, subAction, postMethod)
                                : undefined,
                    });
                },
            }
        );
        cacheManager.setParameterizedRoute(cacheKey, paramRoute);
        return paramRoute;
    }

    /**
     * Creates a handler for a specific endpoint.
     * This is used for both main actions and sub-actions.
     *
     * @param endpoint - The endpoint to create the handler for
     * @param postMethod - The method to call for making POST requests
     * @returns A function that can be called with payload and query parameters
     */
    static createEndpointHandler(
        endpoint: string,
        postMethod: (endpoint: string, payload?: Record<string, unknown>, config?: { params?: Record<string, string> }) => Promise<APIResponse<unknown>>
    ) {
        return (
            payload?: Record<string, unknown>,
            queryParams?: Record<string, string>
        ): Promise<APIResponse<unknown>> => {
            return postMethod(endpoint, payload, { params: queryParams });
        };
    }

    /**
     * Creates a handler for sub-actions.
     *
     * @param baseEndpoint - The base endpoint for the sub-action
     * @param subAction - The sub-action name
     * @param postMethod - The method to call for making POST requests
     * @returns A function that can be called with payload and query parameters
     */
    static createSubActionHandler(
        baseEndpoint: string,
        subAction: string,
        postMethod: (endpoint: string, payload?: Record<string, unknown>, config?: { params?: Record<string, string> }) => Promise<APIResponse<unknown>>
    ) {
        const path = `${baseEndpoint}/${subAction}`;
        return this.createEndpointHandler(path, postMethod);
    }
}
