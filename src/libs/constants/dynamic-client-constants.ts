/**
 * Constants used by the Dynamic Client and related modules
 */
export class DynamicClientConstants {
    /**
     * Cache key prefixes for different types of routes
     */
    static readonly CACHE_PREFIXES = {
        ACTION: 'action_',
        PARAMETERIZED: 'param_',
    } as const;

    /**
     * Default HTTP methods supported by dynamic routes
     */
    static readonly SUPPORTED_METHODS = {
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT',
        DELETE: 'DELETE',
        PATCH: 'PATCH',
    } as const;

    /**
     * Default endpoint separators
     */
    static readonly SEPARATORS = {
        PATH: '/',
        QUERY: '?',
        FRAGMENT: '#',
    } as const;

    /**
     * Error messages for dynamic client operations
     */
    static readonly ERROR_MESSAGES = {
        INVALID_CONTROLLER: 'Invalid controller name provided',
        INVALID_ACTION: 'Invalid action name provided',
        INVALID_ROUTE_ID: 'Invalid route ID provided',
        CACHE_NOT_INITIALIZED: 'Cache manager not initialized',
    } as const;
}
