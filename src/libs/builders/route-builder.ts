import { CacheManager } from "../managers";

import {
    MethodResolver,
    MethodResolverOptions,
    RouteValidator,
} from "../../utils";
import { APIResponse, HTTPMethod } from "../../types";

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
     * @param requestMethod - The method to call for making HTTP requests
     * @param methodOptions - Options for HTTP method resolution
     * @returns A dynamic route function that can handle actions and parameterized routes
     */
    static createRoute(
        controller: string,
        cacheManager: CacheManager,
        requestMethod: (
            endpoint: string,
            payload?: Record<string, unknown>,
            config?: any
        ) => Promise<APIResponse<unknown>>,
        methodOptions: MethodResolverOptions = {}
    ): unknown {
        if (cacheManager.hasRoute(controller)) {
            return cacheManager.getRoute(controller);
        }

        const routeFunction = (id?: string | number) => {
            return id !== undefined
                ? this.createParameterizedRoute(
                      controller,
                      id,
                      cacheManager,
                      requestMethod,
                      methodOptions
                  )
                : this.createActionRoute(
                      controller,
                      cacheManager,
                      requestMethod,
                      methodOptions
                  );
        };

        const cachedProxy = new Proxy(routeFunction, {
            get: (_, action: string) =>
                RouteValidator.isValidAction(action)
                    ? this.createActionHandler(
                          controller,
                          action,
                          requestMethod,
                          methodOptions
                      )
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
     * @param requestMethod - The method to call for making HTTP requests
     * @param methodOptions - Options for HTTP method resolution
     * @returns A dynamic action route object
     */
    static createActionRoute(
        controller: string,
        cacheManager: CacheManager,
        requestMethod: (
            endpoint: string,
            payload?: Record<string, unknown>,
            config?: any
        ) => Promise<APIResponse<unknown>>,
        methodOptions: MethodResolverOptions = {}
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
                        ? this.createActionHandler(
                              controller,
                              action,
                              requestMethod,
                              methodOptions
                          )
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
     * @param requestMethod - The method to call for making HTTP requests
     * @param methodOptions - Options for HTTP method resolution
     * @returns A dynamic action handler function
     */
    static createActionHandler(
        controller: string,
        action: string,
        requestMethod: (
            endpoint: string,
            payload?: Record<string, unknown>,
            config?: any
        ) => Promise<APIResponse<unknown>>,
        methodOptions: MethodResolverOptions = {}
    ): unknown {
        const baseEndpoint = `/${controller}/${action}`;

        const mainHandler = (
            payload?: Record<string, unknown>,
            queryParams?: Record<string, string>
        ): Promise<APIResponse<unknown>> => {
            const explicitMethod =
                payload && typeof payload === "object" && "method" in payload
                    ? (payload.method as HTTPMethod)
                    : undefined;
            const httpMethod = MethodResolver.determineMethod(
                action,
                methodOptions,
                explicitMethod
            );
            const cleanPayload =
                payload && typeof payload === "object" && "method" in payload
                    ? Object.fromEntries(
                          Object.entries(payload).filter(
                              ([key]) => key !== "method"
                          )
                      )
                    : payload;

            return requestMethod(baseEndpoint, cleanPayload, {
                params: queryParams,
                method: httpMethod,
            });
        };

        return new Proxy(mainHandler, {
            get: (_, subAction: string) =>
                RouteValidator.isValidAction(subAction)
                    ? this.createSubActionHandler(
                          baseEndpoint,
                          subAction,
                          requestMethod,
                          methodOptions
                      )
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
     * @param requestMethod - The method to call for making HTTP requests
     * @param methodOptions - Options for HTTP method resolution
     * @returns A dynamic parameterized route object
     */
    static createParameterizedRoute(
        controller: string,
        id: string | number,
        cacheManager: CacheManager,
        requestMethod: (
            endpoint: string,
            payload?: Record<string, unknown>,
            config?: any
        ) => Promise<APIResponse<unknown>>,
        methodOptions: MethodResolverOptions = {}
    ): unknown {
        const cacheKey = CacheManager.generateParameterizedCacheKey(
            controller,
            id
        );

        if (cacheManager.hasParameterizedRoute(cacheKey)) {
            return cacheManager.getParameterizedRoute(cacheKey)!;
        }

        // Створюємо функцію, яка може бути викликана безпосередньо
        const baseEndpoint = `/${controller}/${id}`;
        const paramFunction = (
            payload?: Record<string, unknown>,
            queryParams?: Record<string, string>
        ): Promise<APIResponse<unknown>> => {
            const explicitMethod =
                payload && typeof payload === "object" && "method" in payload
                    ? (payload.method as HTTPMethod)
                    : undefined;

            // Для прямого виклику використовуємо GET якщо немає payload, інакше PUT для оновлення
            const defaultAction =
                payload && Object.keys(payload).length > 0 ? "update" : "get";
            const httpMethod = MethodResolver.determineMethod(
                defaultAction,
                methodOptions,
                explicitMethod
            );

            const cleanPayload =
                payload && typeof payload === "object" && "method" in payload
                    ? Object.fromEntries(
                          Object.entries(payload).filter(
                              ([key]) => key !== "method"
                          )
                      )
                    : payload;

            return requestMethod(baseEndpoint, cleanPayload, {
                params: queryParams,
                method: httpMethod,
            });
        };

        const paramRoute = new Proxy(paramFunction, {
            get: (_, action: string) => {
                if (!RouteValidator.isValidAction(action)) return undefined;

                const endpoint = `/${controller}/${id}/${action}`;
                const paramHandler = this.createEndpointHandler(
                    endpoint,
                    requestMethod,
                    methodOptions,
                    action
                );

                return new Proxy(paramHandler, {
                    get: (_, subAction: string) =>
                        RouteValidator.isValidAction(subAction)
                            ? this.createSubActionHandler(
                                  endpoint,
                                  subAction,
                                  requestMethod,
                                  methodOptions
                              )
                            : undefined,
                });
            },
        });
        cacheManager.setParameterizedRoute(cacheKey, paramRoute);
        return paramRoute;
    }

    /**
     * Creates a handler for a specific endpoint.
     * This is used for both main actions and sub-actions.
     *
     * @param endpoint - The endpoint to create the handler for
     * @param requestMethod - The method to call for making HTTP requests
     * @param methodOptions - Options for HTTP method resolution
     * @param actionName - The action name for method resolution
     * @returns A function that can be called with payload and query parameters
     */
    static createEndpointHandler(
        endpoint: string,
        requestMethod: (
            endpoint: string,
            payload?: Record<string, unknown>,
            config?: any
        ) => Promise<APIResponse<unknown>>,
        methodOptions: MethodResolverOptions = {},
        actionName?: string
    ) {
        return (
            payload?: Record<string, unknown>,
            queryParams?: Record<string, string>
        ): Promise<APIResponse<unknown>> => {
            const explicitMethod =
                payload && typeof payload === "object" && "method" in payload
                    ? (payload.method as HTTPMethod)
                    : undefined;
            const action = actionName || endpoint.split("/").pop() || "";
            const httpMethod = MethodResolver.determineMethod(
                action,
                methodOptions,
                explicitMethod
            );
            const cleanPayload =
                payload && typeof payload === "object" && "method" in payload
                    ? Object.fromEntries(
                          Object.entries(payload).filter(
                              ([key]) => key !== "method"
                          )
                      )
                    : payload;

            return requestMethod(endpoint, cleanPayload, {
                params: queryParams,
                method: httpMethod,
            });
        };
    }

    /**
     * Creates a handler for sub-actions.
     *
     * @param baseEndpoint - The base endpoint for the sub-action
     * @param subAction - The sub-action name
     * @param requestMethod - The method to call for making HTTP requests
     * @param methodOptions - Options for HTTP method resolution
     * @returns A function that can be called with payload and query parameters
     */
    static createSubActionHandler(
        baseEndpoint: string,
        subAction: string,
        requestMethod: (
            endpoint: string,
            payload?: Record<string, unknown>,
            config?: any
        ) => Promise<APIResponse<unknown>>,
        methodOptions: MethodResolverOptions = {}
    ) {
        const path = `${baseEndpoint}/${subAction}`;

        return (
            payload?: Record<string, unknown>,
            queryParams?: Record<string, string>
        ): Promise<APIResponse<unknown>> => {
            // Визначаємо HTTP метод для sub-action
            const explicitMethod =
                payload && typeof payload === "object" && "method" in payload
                    ? (payload.method as HTTPMethod)
                    : undefined;

            const httpMethod = MethodResolver.determineMethod(
                subAction,
                methodOptions,
                explicitMethod
            );

            // Видаляємо method з payload, якщо він там є
            const cleanPayload =
                payload && typeof payload === "object" && "method" in payload
                    ? Object.fromEntries(
                          Object.entries(payload).filter(
                              ([key]) => key !== "method"
                          )
                      )
                    : payload;

            return requestMethod(path, cleanPayload, {
                params: queryParams,
                method: httpMethod,
            });
        };
    }
}
