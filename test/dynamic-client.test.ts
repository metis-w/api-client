import { DynamicClient, IDynamicClient } from "../src";
import { APIConfig, APIResponse, RequestConfig } from "../src";

global.fetch = jest.fn();

describe("DynamicClient", () => {
    let client: IDynamicClient;
    let mockFetch: jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
        const config: APIConfig = {
            baseUrl: "https://api.example.com",
            timeout: 5000,
            useKebabCase: false,
        };
        client = new DynamicClient(config);

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
                    method: "GET",
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
                    method: "PUT",
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
                    method: "GET",
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

    describe("HTTP Method Resolution", () => {
        test("should use explicit method when provided", async () => {
            await client.users.create({ name: "John", method: "DELETE" });

            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/users/create",
                expect.objectContaining({
                    method: "DELETE",
                    body: JSON.stringify({ name: "John" }),
                })
            );
        });

        test("should use semantic analysis for different HTTP methods", async () => {
            await client.users.fetch();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/fetch",
                expect.objectContaining({ method: "GET" })
            );

            await client.users.create({ name: "John" });
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/create",
                expect.objectContaining({ method: "POST" })
            );

            await client.users.update({ id: 1 });
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/update",
                expect.objectContaining({ method: "PUT" })
            );

            await client.users.delete();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/delete",
                expect.objectContaining({ method: "DELETE" })
            );

            await client.users.patch({ status: "active" });
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/patch",
                expect.objectContaining({ method: "PATCH" })
            );
        });

        test("should respect custom method rules", async () => {
            client = new DynamicClient({
                baseUrl: "https://api.example.com",
                methodRules: {
                    customAction: "PUT",
                    "special*": "DELETE",
                },
            }) as any;

            await client.users.customAction();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/customAction",
                expect.objectContaining({ method: "PUT" })
            );

            await client.users.specialTask();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/specialTask",
                expect.objectContaining({ method: "DELETE" })
            );
        });

        test("should use default method for unknown actions", async () => {
            client = new DynamicClient({
                baseUrl: "https://api.example.com",
                defaultMethod: "PATCH",
            }) as any;

            await client.users.unknownAction();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/unknownAction",
                expect.objectContaining({ method: "PATCH" })
            );
        });
    });

    describe("Direct Parameterized Route Calls", () => {
        test("should handle direct parameterized route call without payload (GET)", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                statusText: "OK",
                headers: new Map([["content-type", "application/json"]]),
                json: jest
                    .fn()
                    .mockResolvedValue({ id: 123, name: "User 123" }),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            const result = await client.users(123)();

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/users/123",
                expect.objectContaining({
                    method: "GET", // No payload = GET
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                    }),
                    credentials: "omit",
                    signal: expect.any(AbortSignal),
                })
            );
            expect(result.success).toBe(true);
            expect(result.data).toEqual({ id: 123, name: "User 123" });
        });

        test("should handle direct parameterized route call with payload (PUT)", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                statusText: "OK",
                headers: new Map([["content-type", "application/json"]]),
                json: jest
                    .fn()
                    .mockResolvedValue({ id: 123, name: "Updated User" }),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            const result = await client.users(123)({ name: "Updated User" });

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/users/123",
                expect.objectContaining({
                    method: "PUT", // With payload = PUT (update semantic)
                    body: JSON.stringify({ name: "Updated User" }),
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                    }),
                    credentials: "omit",
                    signal: expect.any(AbortSignal),
                })
            );
            expect(result.success).toBe(true);
            expect(result.data).toEqual({ id: 123, name: "Updated User" });
        });

        test("should handle direct parameterized route with explicit method", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                statusText: "OK",
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ deleted: true }),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            const result = await client.users(123)({ method: "DELETE" });

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/users/123",
                expect.objectContaining({
                    method: "DELETE", // Explicit method override
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                    }),
                    credentials: "omit",
                    signal: expect.any(AbortSignal),
                })
            );
            expect(result.success).toBe(true);
            expect(result.data).toEqual({ deleted: true });
        });

        test("should handle direct parameterized route with query params", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                statusText: "OK",
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ id: 123, details: "full" }),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            const result = await client.users(123)(
                {},
                { include: "profile", format: "json" }
            );

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.example.com/users/123?include=profile&format=json",
                expect.objectContaining({
                    method: "GET", // Empty payload = GET
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                    }),
                    credentials: "omit",
                    signal: expect.any(AbortSignal),
                })
            );
            expect(result.success).toBe(true);
            expect(result.data).toEqual({ id: 123, details: "full" });
        });
    });
    describe("Method Rules Configuration", () => {
        test("should apply simple method rules", async () => {
            client = new DynamicClient({
                baseUrl: "https://api.example.com",
                methodRules: {
                    authenticate: "POST",
                    validate: "POST",
                    approve: "PATCH",
                },
            }) as any;

            await client.users.authenticate({ token: "abc123" });
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/authenticate",
                expect.objectContaining({ method: "POST" })
            );

            await client.users.validate({ data: "test" });
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/validate",
                expect.objectContaining({ method: "POST" })
            );

            await client.users.approve({ id: 123 });
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/approve",
                expect.objectContaining({ method: "PATCH" })
            );
        });

        test("should apply wildcard method rules", async () => {
            client = new DynamicClient({
                baseUrl: "https://api.example.com",
                methodRules: {
                    "auth*": "POST",
                    "admin*": "PUT",
                    "*Report": "GET",
                },
            }) as any;

            // Prefix wildcards
            await client.users.authLogin({ username: "test" });
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/authLogin",
                expect.objectContaining({ method: "POST" })
            );

            await client.users.authLogout();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/authLogout",
                expect.objectContaining({ method: "POST" })
            );

            await client.users.adminPanel();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/adminPanel",
                expect.objectContaining({ method: "PUT" })
            );

            await client.users.adminSettings();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/adminSettings",
                expect.objectContaining({ method: "PUT" })
            );

            // Suffix wildcards
            await client.users.salesReport();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/salesReport",
                expect.objectContaining({ method: "GET" })
            );

            await client.users.monthlyReport();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/monthlyReport",
                expect.objectContaining({ method: "GET" })
            );
        });

        test("should prioritize method rules over semantic analysis", async () => {
            client = new DynamicClient({
                baseUrl: "https://api.example.com",
                methodRules: {
                    create: "DELETE", // Override semantic POST
                    "get*": "POST", // Override semantic GET
                    update: "GET", // Override semantic PUT
                },
            }) as any;

            // Should use rule instead of semantic analysis
            await client.users.create({ name: "John" });
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/create",
                expect.objectContaining({ method: "DELETE" })
            );

            await client.users.getProfile();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/getProfile",
                expect.objectContaining({ method: "POST" })
            );

            await client.users.update({ id: 1 });
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/update",
                expect.objectContaining({ method: "GET" })
            );
        });

        test("should apply method rules to parameterized routes", async () => {
            client = new DynamicClient({
                baseUrl: "https://api.example.com",
                methodRules: {
                    activate: "PATCH",
                    ban: "DELETE",
                },
            }) as any;

            await client.users(123).activate();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/123/activate",
                expect.objectContaining({ method: "PATCH" })
            );

            await client.users(456).ban({ reason: "spam" });
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/456/ban",
                expect.objectContaining({ method: "DELETE" })
            );
        });

        test("should apply method rules to multi-level routes", async () => {
            client = new DynamicClient({
                baseUrl: "https://api.example.com",
                methodRules: {
                    "sync*": "PUT",
                    backup: "POST",
                },
            }) as any;

            await client.admin.users.syncData();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/admin/users/syncData",
                expect.objectContaining({ method: "PUT" })
            );

            await client.admin.system.backup();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/admin/system/backup",
                expect.objectContaining({ method: "POST" })
            );
        });

        test("should handle case-insensitive method rules", async () => {
            client = new DynamicClient({
                baseUrl: "https://api.example.com",
                methodRules: {
                    UPLOAD: "POST",
                    download: "GET",
                },
            }) as any;

            // Should match regardless of case
            await client.files.upload({ file: "test.txt" });
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/files/upload",
                expect.objectContaining({ method: "POST" })
            );

            await client.files.DOWNLOAD({ id: 123 });
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/files/DOWNLOAD",
                expect.objectContaining({ method: "GET" })
            );
        });

        test("should combine method rules with default method", async () => {
            client = new DynamicClient({
                baseUrl: "https://api.example.com",
                defaultMethod: "PATCH",
                methodRules: {
                    special: "DELETE",
                },
            }) as any;

            // Should use rule
            await client.users.special();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/special",
                expect.objectContaining({ method: "DELETE" })
            );

            // Should use default method for unknown actions
            await client.users.unknownAction();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/unknownAction",
                expect.objectContaining({ method: "PATCH" })
            );
        });

        test("should handle complex wildcard patterns", async () => {
            client = new DynamicClient({
                baseUrl: "https://api.example.com",
                methodRules: {
                    "batch*": "POST",
                    "*Sync": "PUT",
                    "test*": "GET",
                },
            }) as any;

            await client.users.batchProcess();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/batchProcess",
                expect.objectContaining({ method: "POST" })
            );

            await client.users.dataSync();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/dataSync",
                expect.objectContaining({ method: "PUT" })
            );

            // Should match partial pattern
            await client.users.testUserData();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/testUserData",
                expect.objectContaining({ method: "GET" })
            );
        });

        test("should respect explicit method over method rules", async () => {
            client = new DynamicClient({
                baseUrl: "https://api.example.com",
                methodRules: {
                    process: "POST",
                },
            }) as any;

            // Explicit method should override rule
            await client.users.process({ method: "DELETE", data: "test" });
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/users/process",
                expect.objectContaining({ method: "DELETE" })
            );
        });

        test("should handle kebab-case with method rules", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                statusText: "OK",
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true }),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            client = new DynamicClient({
                baseUrl: "https://api.example.com",
                useKebabCase: true,
                methodRules: {
                    "verify*": "GET",
                    "verify-token": "GET", // Kebab-case версія
                    verifyToken: "GET", // CamelCase версія
                },
            }) as any;

            // Тестуємо різні варіанти
            await client.auth.verifyToken();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/auth/verify-token", // URL у kebab-case
                expect.objectContaining({ method: "GET" })
            );

            await client.auth.verifyEmail();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/auth/verify-email", // URL у kebab-case
                expect.objectContaining({ method: "GET" })
            );
        });

        test("should prioritize exact kebab-case match over patterns", async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                statusText: "OK",
                headers: new Map([["content-type", "application/json"]]),
                json: jest.fn().mockResolvedValue({ success: true }),
            };
            mockFetch.mockResolvedValue(mockResponse as any);

            client = new DynamicClient({
                baseUrl: "https://api.example.com",
                useKebabCase: true,
                methodRules: {
                    "verify*": "POST", // Загальний паттерн
                    "verify-token": "GET", // Точна kebab-case назва
                },
            }) as any;

            await client.auth.verifyToken();
            expect(mockFetch).toHaveBeenLastCalledWith(
                "https://api.example.com/auth/verify-token",
                expect.objectContaining({ method: "GET" }) // Має бути GET, не POST
            );
        });
    });
});
