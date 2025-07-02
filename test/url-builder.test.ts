import { URLBuilder } from "../src/utils/url-builder";

describe("URLBuilder test", () => {
    let builder: URLBuilder;

    beforeEach(() => {
        builder = new URLBuilder("https://api.example.com");
    });

    describe("Base URL test", () => {
        test("should return base url", () => {
            expect(builder.build()).toBe("https://api.example.com");
        });
    });

    describe("Segment test", () => {
        test("should return url with segments", () => {
            expect(builder.segment("users").segment("123").build()).toBe(
                "https://api.example.com/users/123"
            );
        });
    });

    describe("Query params test", () => {
        test("should return url with query params", () => {
            expect(
                builder.segment("users").query({ page: 1, limit: 10 }).build()
            ).toBe("https://api.example.com/users?page=1&limit=10");
        });
    });

    describe("Test with special characters", () => {
        test("should return url with query params and right special characters", () => {
            expect(
                builder
                    .segment("search")
                    .query({ q: "hello world", type: "user£admin" })
                    .build()
            ).toBe(
                "https://api.example.com/search?q=hello%20world&type=user%C2%A3admin"
            );
        });
    });

    describe("Test with null/undefined values", () => {
        test("should not include undefined/null query params", () => {
            expect(
                builder
                    .segment("users")
                    .query({
                        name: "John",
                        age: null,
                        city: undefined,
                        active: true,
                    })
                    .build()
            ).toBe("https://api.example.com/users?name=John&active=true");
        });
    });

    describe("Test chainable methods", () => {
        test("should return right chainable url with multiple slashes", () => {
            expect(
                builder
                    .segment("api")
                    .segment("v1")
                    .segment("users")
                    .query({ sort: "name" })
                    .query({ order: "asc" })
                    .build()
            ).toBe("https://api.example.com/api/v1/users?sort=name&order=asc");
        });
    });
});
