export * from "./core";
export * from "./types";
export * from "./utils";
export * from "./interceptors";
export * from "./libs";

// Factory helpers
import { APIClient, DynamicClient } from "./core";
import type { APIConfig } from "./types";
import type { IDynamicClient } from "./core";

export const createClient = (config: APIConfig) => new APIClient(config);
export const createDynamicClient = (
    config: APIConfig
): IDynamicClient => new DynamicClient(config) as IDynamicClient;