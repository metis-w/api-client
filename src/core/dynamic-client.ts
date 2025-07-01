import { APIClient } from "./api-client";
import { APIConfig } from "../types/config";
import { APIResponse } from "../types/response";

export class DynamicClient extends APIClient {
    constructor(config: APIConfig) {
        super(config);

        return new Proxy(this, {
            get(target, prop: string) {
                if (prop in target) {
                    return target[prop as keyof typeof target];
                }
                return target.createRoute(prop);
            },
        });
    }

    /**
     * Reserved property names that should not be treated as API actions
     */
    private readonly RESERVED_PROPS = ["then", "catch", "finally"];

    /**
     * Creates a dynamic route handler for the given controller
     * @param controller - API controller name
     */
    private createRoute(controller: string): unknown {
        const routeFunction = (id?: string | number) => {
            return id !== undefined
                ? this.createParameterizedRoute(controller, id)
                : this.createActionRoute(controller);
        };

        return new Proxy(routeFunction, {
            get: (_, action: string) =>
                this.isValidAction(action)
                    ? this.createActionHandler(controller, action)
                    : undefined,
        });
    }

    /**
     * Creates a route handler for controller actions
     * @param controller - API controller name
     */
    private createActionRoute(controller: string): Record<string, unknown> {
        return new Proxy(
            {},
            {
                get: (_, action: string) =>
                    this.isValidAction(action)
                        ? this.createActionHandler(controller, action)
                        : undefined,
            }
        );
    }

    /**
     * Creates an action handler for the specified controller and action
     * @param controller - API controller name
     * @param action - API action name
     */
    private createActionHandler(controller: string, action: string): unknown {
        const baseEndpoint = `/${controller}/${action}`;

        const mainHandler = (
            payload?: Record<string, unknown>,
            queryParams?: Record<string, string>
        ): Promise<APIResponse<unknown>> => {
            return this.post(baseEndpoint, payload, { params: queryParams });
        };

        return new Proxy(mainHandler, {
            get: (_, subAction: string) =>
                this.isValidAction(subAction)
                    ? this.createSubActionHandler(baseEndpoint, subAction)
                    : undefined,
        });
    }

    /**
     * Creates a parameterized route with ID for the controller
     * @param controller - API controller name
     * @param id - Resource identifier
     */
    private createParameterizedRoute(
        controller: string,
        id: string | number
    ): Record<string, unknown> {
        return new Proxy(
            {},
            {
                get: (_, action: string) => {
                    if (!this.isValidAction(action)) return undefined;

                    const endpoint = `/${controller}/${id}/${action}`;
                    const paramHandler = this.createEndpointHandler(endpoint);

                    return new Proxy(paramHandler, {
                        get: (_, subAction: string) =>
                            this.isValidAction(subAction)
                                ? this.createSubActionHandler(
                                      endpoint,
                                      subAction
                                  )
                                : undefined,
                    });
                },
            }
        );
    }

    /**
     * Creates a handler function for a specific endpoint
     * @param endpoint - API endpoint path
     */
    private createEndpointHandler(endpoint: string) {
        return (
            payload?: Record<string, unknown>,
            queryParams?: Record<string, string>
        ): Promise<APIResponse<unknown>> => {
            return this.post(endpoint, payload, { params: queryParams });
        };
    }

    /**
     * Creates a handler for sub-actions
     * @param baseEndpoint - Base endpoint path
     * @param subAction - Sub-action name
     */
    private createSubActionHandler(baseEndpoint: string, subAction: string) {
        const path = `${baseEndpoint}/${subAction}`;
        return this.createEndpointHandler(path);
    }

    /**
     * Checks if the provided string is a valid action name
     * @param action - Action name to validate
     */
    private isValidAction(action: string): boolean {
        return (
            typeof action === "string" &&
            !this.RESERVED_PROPS.includes(action) &&
            !action.startsWith("__")
        );
    }
}
