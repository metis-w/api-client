import { DynamicClient } from "../src/core/dynamic-client";

console.log("=== Parameterized Routes Tests ===");

const client = new DynamicClient({
    baseUrl: "https://httpbin.org",
    timeout: 5000,
    useKebabCase: true,
}) as any;

console.log("\n--- Test 1: Simple routes (no changes) ---");
client.users
    .getAll({ page: 1 })
    .then((response: any) => {
        console.log("users.getAll works:", response.success);
        console.log("URL:", response.data?.url?.includes("/users/get-all"));
    })
    .catch((e: any) => console.log("Error getAll:", e.message));

console.log("\n--- Test 2: Parameterized routes ---");
// client.users(123).follow() -> POST /users/123/follow
client
    .users(123)
    .follow({ notify: true })
    .then((response: any) => {
        console.log("users(123).follow works:", response.success);
        console.log(
            "URL includes /users/123/follow:",
            response.data?.url?.includes("/users/123/follow")
        );
    })
    .catch((e: any) => console.log("Error follow:", e.message));

console.log("\n--- Test 3: Parameters + query ---");
client
    .posts("my-slug")
    .view({}, { analytics: "true", ref: "twitter" })
    .then((response: any) => {
        console.log("posts(slug).view works:", response.success);
        console.log("Query parameters:", response.data?.args);
    })
    .catch((e: any) => console.log("Error view:", e.message));

console.log("\n--- Test 4: Three-level parameterized ---");
// client.users(123).profile.update() -> POST /users/123/profile/update
client
    .users(456)
    .profile.update({ name: "New Name" })
    .then((response: any) => {
        console.log("users(456).profile.update works:", response.success);
        console.log(
            "URL:",
            response.data?.url?.includes("/users/456/profile/update")
        );
    })
    .catch((e: any) => console.log("Error profile update:", e.message));

console.log("\n--- Test 5: Numeric and String IDs ---");
client
    .products("electronics-789")
    .rate({ rating: 5 })
    .then((response: any) => {
        console.log("String ID works:", response.success);
        console.log(
            "URL містить electronics-789:",
            response.data?.url?.includes("electronics-789")
        );
    })
    .catch((e: any) => console.log("Error rate:", e.message));

console.log("\n--- Test 6: Kebab-case + parameters ---");
// client.userProfiles(123).getUserSettings() -> /user-profiles/123/get-user-settings
client
    .userProfiles(999)
    .getUserSettings()
    .then((response: any) => {
        console.log("Kebab-case with parameters:", response.success);
        console.log(
            "Kebab URL:",
            response.data?.url?.includes("user-profiles/999/get-user-settings")
        );
    })
    .catch((e: any) => console.log("Error kebab:", e.message));
