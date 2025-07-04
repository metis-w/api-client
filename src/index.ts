import { APIClient } from "./core/api-client";
import { DynamicClient, IDynamicClient } from "./core/dynamic-client";
import { APIConfig } from "./types/config";

export { APIClient } from "./core/api-client";
export { DynamicClient } from "./core/dynamic-client";

export type { APIConfig, HTTPMethod, RequestConfig } from "./types/config";
export type { APIResponse, ClientError, ResponseInterceptor } from "./types/response";
export type { APIRequest, RequestInterceptor, RequestFunction } from "./types/request";

export type { 
    DynamicRoute, 
    DynamicParameterizedRoute,
    IDynamicClient
} from "./core/dynamic-client";

export { URLBuilder } from "./utils/url-builder";
export { DataSerializer } from "./utils/data-serializer";
export { camelToKebab, kebabToCamel, convertObjectKeys } from "./utils/case-converter";

export {
    requestLoggingInterceptor,
    responseLoggingInterceptor,
    errorLoggingInterceptor,
    performanceInterceptor,
    CacheInterceptor,
    createLoggingSetup,
    createPerformanceSetup,
    type LoggingOptions,
    type TimingOptions,
    type CacheOptions
} from './interceptors';

export const createClient = (config: APIConfig) => new APIClient(config);
export const createDynamicClient = (config: APIConfig): IDynamicClient => new DynamicClient(config) as IDynamicClient;

export default DynamicClient;