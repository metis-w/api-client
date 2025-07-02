import { DynamicClient } from "../src/core/dynamic-client";
import { APIConfig, RequestConfig } from "../src/types/config";
import { APIResponse } from "../src/types/response";

global.fetch = jest.fn();

describe("DynamicClient", () => {
    let client: any;
    let mockFetch: jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
        const config: APIConfig = {
            baseUrl: "https://api.example.com",
            timeout: 5000,
            useKebabCase: false,
        };
        client = new DynamicClient(config) as any;

        mockFetch = fetch as jest.MockedFunction<typeof fetch>;
        mockFetch.mockClear();
    });

    afterEach(() => {
        client.destroy();
    });

    describe("Simple request", () => {
        test("should make successful simple dynamic request", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                statusText: "OK",
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ id: 1, name: "Test User" }),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            const result = await client.users.getProfile({ userId: 123 });

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/users/getProfile",
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify({ userId: 123 }),
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                    }),
                    credentials: "omit",
                    signal: expect.any(AbortSignal),
                })
            );
            expect(result.success).toBe(true);
            expect(result.data).toEqual({ id: 1, name: "Test User" });
        });
    });

    describe("System Cache", () => {
        test("should return stats of client", async () => {
            await client.testRequest();

            expect(client.cache.getStats().routes).toBe(1);
        });
    });

    describe("Kebab-Case request", () => {
        test("should return url in kebab-case format", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                statusText: "OK",
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ test: "success" }),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            client = new DynamicClient({
                baseUrl: "https://api.example.com",
                timeout: 5000,
                useKebabCase: true,
            }) as any;
            const result = await client.utility.testRequest();

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/utility/test-request",
                expect.objectContaining({
                    method: "POST",
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                    }),
                    credentials: "omit",
                    signal: expect.any(AbortSignal),
                })
            );
            expect(result.success).toBe(true);
            expect(result.data).toEqual({ test: "success" });
        });
    });

    describe("Triple-level routes", () => {
        test("should do request with triple-level route", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                statusText: "OK",
                headers: new Map([["content-type", "application/json"]]),
                json: jest
                    .fn()
                    .mockResolvedValue({ userId: 456, status: "banned" }),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            const result = await client.admin.users.ban({
                userId: 456,
                reason: "spam",
            });

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/admin/users/ban",
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify({ userId: 456, reason: "spam" }),
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                    }),
                    credentials: "omit",
                    signal: expect.any(AbortSignal),
                })
            );
            expect(result.success).toBe(true);
            expect(result.data).toEqual({ userId: 456, status: "banned" });
        });
    });

    describe("Parameterized routes", () => {
        test("should do request with route-params (/users/123/update)", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                statusText: "OK",
                headers: new Map([["content-type", "application/json"]]),
                json: jest
                    .fn()
                    .mockResolvedValue({ userId: 123, status: "alive" }),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            const result = await client.users(123).update();

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/users/123/update",
                expect.objectContaining({
                    method: "POST",
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                    }),
                    credentials: "omit",
                    signal: expect.any(AbortSignal),
                })
            );
            expect(result.success).toBe(true);
            expect(result.data).toEqual({ userId: 123, status: "alive" });
        });
    });

    describe("Query params in requests", () => {
        test("should do request with query-params (/posts/search?page=1&limit=10)", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                statusText: "OK",
                headers: new Map([["content-type", "application/json"]]),
                json: jest
                    .fn()
                    .mockResolvedValue({ posts: 1, status: "published" }),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            const result = await client.posts.search(
                {},
                { page: 1, limit: 10 }
            );

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/posts/search?page=1&limit=10",
                expect.objectContaining({
                    method: "POST",
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                    }),
                    credentials: "omit",
                    signal: expect.any(AbortSignal),
                })
            );
            expect(result.success).toBe(true);
            expect(result.data).toEqual({ posts: 1, status: "published" });
        });
    });

    describe("Parameters + Query", () => {
        test("should do request with route-params + query-params", async () => {
            await client
                .posts("my-slug")
                .view({}, { analytics: "true", ref: "x" });

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/posts/my-slug/view?analytics=true&ref=x",
                expect.objectContaining({
                    method: "POST",
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                    }),
                    credentials: "omit",
                    signal: expect.any(AbortSignal),
                })
            );
        });
    });

    describe("Extending APIClient", () => {
        test("should do requests according to extended functions from APIClient", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                statusText: "OK",
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ test: "done" }),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            const result = await client.get("/test");

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/test",
                expect.objectContaining({
                    method: "GET",
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                    }),
                    credentials: "omit",
                    signal: expect.any(AbortSignal),
                })
            );
            expect(result.success).toBe(true);
            expect(result.data).toEqual({ test: "done" });
        });
    });

    describe("Interceptors with Dynamic Routes", () => {
        test("should apply request interceptor to dynamic route", async () => {
            client.interceptors.addRequestInterceptor(
                (config: RequestConfig) => {
                    return {
                        ...config,
                        headers: {
                            ...config.headers,
                            "X-Custom-Header": "from-interceptor",
                        },
                    };
                }
            );

            await client.users.getProfile({ id: 123 });

            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/users/getProfile",
                expect.objectContaining({
                    headers: expect.objectContaining({
                        "X-Custom-Header": "from-interceptor",
                    }),
                })
            );
        });
        test("should apply response interceptor to dynamic route", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                headers: new Map(),
                json: jest.fn().mockResolvedValue({ originalData: true }),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            client.interceptors.addResponseInterceptor(
                (response: APIResponse<any>) => {
                    return {
                        ...response,
                        data: {
                            ...response.data,
                            intercepted: true,
                        },
                    };
                }
            );

            const result = await client.users.test();

            expect(result.data).toEqual({
                originalData: true,
                intercepted: true,
            });
        });
        test("should apply both interceptors to dynamic route", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                headers: new Map(),
                json: jest.fn().mockResolvedValue({ originalData: true }),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            client.interceptors.addRequestInterceptor(
                (config: RequestConfig) => {
                    return {
                        ...config,
                        headers: {
                            ...config.headers,
                            Authorization: "Bearer intercepted-token",
                        },
                    };
                }
            );
            client.interceptors.addResponseInterceptor(
                (response: APIResponse<any>) => {
                    return {
                        ...response,
                        data: {
                            ...response.data,
                            timestamp: Date.now(),
                        },
                    };
                }
            );

            const result = await client.admin.users.ban({ id: 123 });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: "Bearer intercepted-token",
                    }),
                })
            );
            expect(result.data).toHaveProperty("timestamp");
        });
    });
});
