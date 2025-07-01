import { DynamicClient } from "../src/core/dynamic-client";

console.log("=== DynamicClient tests ===");

// Mock API server (can use httpbin for tests)
const client = new DynamicClient({
    baseUrl: "https://httpbin.org",
    timeout: 5000,
    useKebabCase: true,
}) as any; // any for dynamic methods

console.log("\n--- Test 1: Simple dynamic route ---");
// client.users.getProfile() -> POST /users/get-profile
client.users
    .getProfile({ userId: 123 })
    .then((response: any) => {
        console.log("users.getProfile success:", response.success);
        console.log("URL:", response.data?.url || "No URL");
    })
    .catch((error: any) => {
        console.log("users.getProfile error:", error.message);
    });

console.log("\n--- Test 2: Three-level route ---");
// client.admin.users.ban() -> POST /admin/users/ban
client.admin.users
    .ban({ userId: 456, reason: "spam" })
    .then((response: any) => {
        console.log("admin.users.ban success:", response.success);
        console.log("Data:", response.data?.json || "No data");
    })
    .catch((error: any) => {
        console.log("admin.users.ban error:", error.message);
    });

console.log("\n--- Test 3: With query parameters ---");
// client.posts.search() -> POST /posts/search?page=1&limit=10
client.posts
    .search({ query: "typescript" }, { page: "1", limit: "10" })
    .then((response: any) => {
        console.log("posts.search with params success:", response.success);
        console.log("Args:", response.data?.args || "No args");
    })
    .catch((error: any) => {
        console.log("posts.search error:", error.message);
    });

console.log("\n--- Test 4: Accessing regular methods ---");
// Check that regular APIClient methods still work
client
    .get("/get")
    .then((response: any) => {
        console.log("Regular GET works:", response.success);
    })
    .catch((error: any) => {
        console.log("GET error:", error.message);
    });

console.log("\n--- Test 5: Kebab-case conversion ---");
// client.userManagement.getUserInfo() -> POST /user-management/get-user-info
client.userManagement
    .getUserInfo({ id: 789 })
    .then((response: any) => {
        console.log("Kebab-case conversion:", response.success);
        console.log(
            "URL shows kebab-case:",
            response.data?.url?.includes("user-management")
        );
    })
    .catch((error: any) => {
        console.log("Kebab-case error:", error.message);
    });
