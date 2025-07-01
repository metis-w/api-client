import { APIClient } from "../src/core/api-client";

console.log("=== APIClient тести ===");

// Create APIClient instance
const client = new APIClient({
    baseUrl: "https://jsonplaceholder.typicode.com",
    timeout: 5000,
    useKebabCase: false,
});

// Test 1: GET request
console.log("\n--- GET test ---");
client
    .get("/posts/1")
    .then((response) => {
        console.log("GET success:", response.success);
        console.log(
            "Title:",
            response.data?.title?.substring(0, 30) + "..."
        );
    })
    .catch((error) => {
        console.log("GET error:", error.message);
    });

// Test 2: POST request
console.log("\n--- POST test ---");
client
    .post("/posts", {
        title: "My Test Post",
        body: "This is a test",
        userId: 1,
    })
    .then((response) => {
        console.log("POST success:", response.success);
        console.log("Created ID:", response.data?.id);
    })
    .catch((error) => {
        console.log("POST error:", error.message);
    });

// Test 3: Interceptors
console.log("\n--- Interceptors test ---");
client.addRequestInterceptor((config) => {
    console.log("Request interceptor:", config.method, config.url);
    return config;
});

client.addResponseInterceptor((response) => {
    console.log(
        "Response interceptor:",
        response.success ? "SUCCESS" : "FAILURE"
    );
    return response;
});

client.get("/posts/2").then(() => {
    console.log("Interceptors тест завершено");
});

// Test 4: Kebab-case
console.log("\n--- Kebab-case test ---");
const kebabClient = new APIClient({
    baseUrl: "https://httpbin.org",
    useKebabCase: true,
});

// It will be /get-user-info instead of /getUserInfo
kebabClient
    .get("/getUserInfo", {
        params: { userName: "john", userAge: 25 },
    })
    .then((response) => {
        console.log("Kebab URL success:", response.success);
    })
    .catch((error) => {
        console.log("Kebab error (expected):", error.message);
    });
