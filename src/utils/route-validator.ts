/**
 * Utility functions for validating dynamic route actions and properties
 */
export class RouteValidator {
    /**
     * Reserved property names that should not be treated as API actions
     */
    private static readonly RESERVED_PROPS = ["then", "catch", "finally"];

    /**
     * Checks if the provided string is a valid action name
     * @param action - Action name to validate
     * @returns True if the action is valid, false otherwise
     */
    static isValidAction(action: string): boolean {
        return (
            typeof action === "string" &&
            !this.RESERVED_PROPS.includes(action) &&
            !action.startsWith("__")
        );
    }

    /**
     * Checks if a property name is reserved
     * @param prop - Property name to check
     * @returns True if the property is reserved, false otherwise
     */
    static isReservedProperty(prop: string): boolean {
        return this.RESERVED_PROPS.includes(prop);
    }

    /**
     * Validates if a string can be used as a controller name
     * @param controller - Controller name to validate
     * @returns True if valid, false otherwise
     */
    static isValidController(controller: string): boolean {
        return (
            typeof controller === "string" &&
            controller.length > 0 &&
            !controller.startsWith("__") &&
            !controller.includes("/")
        );
    }

    /**
     * Validates if a value can be used as a route ID
     * @param id - ID to validate
     * @returns True if valid, false otherwise
     */
    static isValidRouteId(id: string | number): boolean {
        if (typeof id === "number") {
            return !isNaN(id) && isFinite(id);
        }
        if (typeof id === "string") {
            return id.length > 0 && !id.includes("/");
        }
        return false;
    }

    /**
     * Gets the list of reserved properties
     * @returns Array of reserved property names
     */
    static getReservedProperties(): string[] {
        return [...this.RESERVED_PROPS];
    }
}
