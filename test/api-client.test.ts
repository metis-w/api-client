import { APIClient } from "../src/core/api-client";
import { APIConfig } from "../src/types/config";

global.fetch = jest.fn();

describe("APIClient", () => {
    let client: APIClient;
    let mockFetch: jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
        const config: APIConfig = {
            baseUrl: "https://api.example.com",
            timeout: 5000,
            headers: { Authorization: "Bearer test-token" },
            useKebabCase: false,
        };

        client = new APIClient(config);

        mockFetch = fetch as jest.MockedFunction<typeof fetch>;
        mockFetch.mockClear();
    });

    afterEach(() => client.destroy());

    describe("GET requests", () => {
        test("should make successful GET request", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                statusText: "OK",
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ id: 1, name: "Test User" }),
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const result = await client.get("/users/1");

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/users/1",
                expect.objectContaining({
                    method: "GET",
                    credentials: "omit",
                    headers: expect.objectContaining({
                        Authorization: "Bearer test-token",
                    }),
                    signal: expect.any(AbortSignal),
                })
            );

            expect(result.success).toBe(true);
            expect(result.data).toEqual({ id: 1, name: "Test User" });
        });

        test("should handle GET request errors", async () => {
            mockFetch.mockRejectedValue(new Error("Network error"));

            await expect(client.get("/users/1")).rejects.toMatchObject({
                message: expect.stringContaining("Network error"),
                type: "network"
            });
        });
    });

    describe("POST requests", () => {
        test("should make successful POST request with data", async () => {
            const postData = { name: "New User", email: "test@example.com" };
            const mockResponse = {
                ok: true,
                status: 201,
                statusText: "Created",
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ id: 2, ...postData }),
            };

            mockFetch.mockResolvedValue(mockResponse as any);

            const result = await client.post("/users", postData);

            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/users",
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify(postData),
                    credentials: "omit",
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                        Authorization: "Bearer test-token",
                    }),
                    signal: expect.any(AbortSignal),
                })
            );

            expect(result.success).toBe(true);
            expect(result.data).toEqual({ id: 2, ...postData });
        });
    });

    describe("Configuration", () => {
        test("should use correct base URL", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                headers: new Map(),
                json: jest.fn().mockResolvedValue({}),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            await client.get("/test");

            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/test",
                expect.objectContaining({
                    method: "GET",
                    credentials: "omit",
                    signal: expect.any(AbortSignal),
                })
            );
        });

        test("should apply default headers", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                headers: new Map(),
                json: jest.fn().mockResolvedValue({}),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            await client.get("/test");

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: "Bearer test-token",
                    }),
                })
            );
        });
    });

    describe("Interceptors", () => {
        test("should apply request interceptor", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                headers: new Map(),
                json: jest.fn().mockResolvedValue({}),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            client.interceptors.addRequestInterceptor((config) => {
                return {
                    ...config,
                    headers: {
                        ...config.headers,
                        "X-Custom-Header": "test-value",
                    },
                };
            });

            await client.get("/test");

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        "X-Custom-Header": "test-value",
                    }),
                })
            );
        });

        test("should apply response interceptor", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                headers: new Map(),
                json: jest.fn().mockResolvedValue({ originalData: true }),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            client.interceptors.addResponseInterceptor((response) => {
                return {
                    ...response,
                    data: { ...response.data, intercepted: true },
                };
            });

            const result = await client.get("/test");

            expect(result.data).toEqual({
                originalData: true,
                intercepted: true,
            });
        });
    });

    describe("Error handling", () => {
        test("should handle network errors", async () => {
            mockFetch.mockRejectedValue(new Error("Network error"));

            await expect(client.get("/test")).rejects.toMatchObject({
                message: expect.stringContaining("Network error"),
                type: "network",
            });
        });

        test("should handle HTTP errors", async () => {
            const mockResponse = {
                ok: false,
                status: 404,
                statusText: "Not Found",
                headers: new Map(),
                json: jest.fn().mockResolvedValue({ error: "User not found" }),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            const result = await client.get("/users/999");

            expect(result.success).toBe(false);
            expect(result.error?.code).toBe(404);
        });
    });

    describe("Retry logic", () => {
        test("should retry on network errors", async () => {
            mockFetch
                .mockRejectedValueOnce(new Error("Network error"))
                .mockRejectedValueOnce(new Error("Network error"))
                .mockResolvedValue({
                    ok: true,
                    status: 200,
                    headers: new Map(),
                    json: jest.fn().mockResolvedValue({ success: true }),
                } as any);

            const clientWithRetry = new APIClient({
                baseUrl: "https://api.example.com",
                retries: 3,
            });

            const result = await clientWithRetry.get("/test");

            expect(mockFetch).toHaveBeenCalledTimes(3);
            expect(result.success).toBe(true);

            clientWithRetry.destroy();
        });
    });
});
