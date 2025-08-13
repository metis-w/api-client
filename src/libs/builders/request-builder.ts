import { Sanitizer } from "../security";

import {
    URLBuilder,
    DataSerializer,
    camelToKebab,
    convertObjectKeys,
} from "../../utils";
import { APIConfig, RequestConfig } from "../../types/config";

export class RequestBuilder {
    /**
     * Merges user-provided config with default values
     * @param config - User-provided request configuration
     * @param defaultConfig - Default configuration values
     */
    static mergeConfig(
        config: Partial<RequestConfig>,
        defaultConfig: Required<RequestConfig | APIConfig>
    ): Required<RequestConfig> {
        return {
            method: config.method || "GET",
            url: config.url || "",
            data: config.data || null,
            params: config.params || {},
            signal: (config.signal as AbortSignal) || null,
            timeout: config.timeout ?? defaultConfig.timeout,
            headers: config.headers ?? defaultConfig.headers,
            withCredentials:
                config.withCredentials ?? defaultConfig.withCredentials,
            retries: config.retries ?? defaultConfig.retries,
            retryDelay: config.retryDelay ?? defaultConfig.retryDelay,
            useKebabCase: config.useKebabCase ?? defaultConfig.useKebabCase,
            defaultMethod: config.defaultMethod ?? defaultConfig.defaultMethod,
            methodRules: config.methodRules ?? defaultConfig.methodRules,
        };
    }

    /**
     * Builds a complete URL from base URL, path, and query parameters
     * @param baseUrl - The base URL for the API
     * @param path - The endpoint path to append to the base URL
     * @param params - Optional query parameters to include in the URL
     * @param useKebabCase - Whether to convert path segments to kebab-case
     */
    static buildUrl(
        baseUrl: string,
        path: string,
        params?: Record<string, unknown>,
        useKebabCase?: boolean
    ): string {
        const sanitizedPath = Sanitizer.sanitizePath(path);
        const formattedPath = useKebabCase
            ? this.convertPathToKebab(sanitizedPath)
            : sanitizedPath;

        const builder = new URLBuilder(baseUrl).segment(formattedPath);

        if (params && Object.keys(params).length) {
            const formattedParams = useKebabCase
                ? convertObjectKeys(params, camelToKebab)
                : params;
            builder.query(formattedParams);
        }
        return builder.build();
    }

    /**
     * Builds request headers, sanitizing them and adding Content-Type if necessary
     * @param configHeaders - Headers from the request configuration
     * @param data - Optional data to determine Content-Type
     */
    static buildHeaders(
        configHeaders: Record<string, string>,
        data?: unknown
    ): Record<string, string> {
        const sanitizedHeaders = Sanitizer.sanitizeHeaders(configHeaders);
        const contentType = DataSerializer.getContentType(data);

        if (contentType) {
            sanitizedHeaders["Content-Type"] = contentType;
        }
        return sanitizedHeaders;
    }

    /**
     * Converts a path string to kebab-case, ensuring each segment is formatted correctly
     * @param path - The path to convert
     */
    private static convertPathToKebab(path: string): string {
        return path
            .split("/")
            .map((segment) => camelToKebab(segment))
            .join("/");
    }
}
