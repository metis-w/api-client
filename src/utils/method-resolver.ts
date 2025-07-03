import { HTTPMethod } from "../types/config";

export interface MethodResolverOptions {
    defaultMethod?: HTTPMethod;
    methodRules?: Record<string, HTTPMethod>;
}

export class MethodResolver {
    private static readonly DIRECT_METHODS: HTTPMethod[] = [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
    ];

    private static readonly SEMANTIC_PATTERNS = [
        {
            patterns: [
                "get",
                "fetch",
                "load",
                "find",
                "retrieve",
                "read",
                "show",
                "view",
            ],
            method: "GET" as HTTPMethod,
        },
        {
            patterns: [
                "create",
                "add",
                "save",
                "store",
                "insert",
                "new",
                "register",
                "submit",
            ],
            method: "POST" as HTTPMethod,
        },
        {
            patterns: [
                "update",
                "edit",
                "modify",
                "change",
                "replace",
                "set",
                "put",
            ],
            method: "PUT" as HTTPMethod,
        },

        {
            patterns: [
                "delete",
                "remove",
                "destroy",
                "clear",
                "drop",
                "cancel",
            ],
            method: "DELETE" as HTTPMethod,
        },
        {
            patterns: [
                "patch",
                "partial",
                "toggle",
                "enable",
                "disable",
                "activate",
                "deactivate",
            ],
            method: "PATCH" as HTTPMethod,
        },
    ];

    static determineMethod(
        actionName: string,
        options: MethodResolverOptions = {},
        explicitMethod?: HTTPMethod
    ): HTTPMethod {
        if (explicitMethod) {
            return explicitMethod;
        }
        const actionLower = actionName.toLowerCase();

        if (
            this.DIRECT_METHODS.some(
                (method) => method.toLowerCase() === actionLower
            )
        ) {
            return actionLower.toUpperCase() as HTTPMethod;
        }
        if (options.methodRules) {
            for (const [pattern, method] of Object.entries(
                options.methodRules
            )) {
                if (this.matchesPattern(actionLower, pattern.toLowerCase())) {
                    return method;
                }
            }
        }
        for (const { patterns, method } of this.SEMANTIC_PATTERNS) {
            if (patterns.some((pattern) => actionLower.startsWith(pattern))) {
                return method;
            }
        }
        return options.defaultMethod || "POST";
    }

    private static matchesPattern(
        actionName: string,
        pattern: string
    ): boolean {
        if (pattern.endsWith("*")) {
            return actionName.startsWith(pattern.slice(0, -1));
        }
        if (pattern.startsWith("*")) {
            return actionName.endsWith(pattern.slice(1));
        }
        return actionName === pattern;
    }
}
