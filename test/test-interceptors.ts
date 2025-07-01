import { APIClient } from "../src/core/api-client";
import {
    requestLoggingInterceptor,
    responseLoggingInterceptor,
    performanceInterceptor,
    CacheInterceptor,
} from "../src/interceptors";

console.log("=== Interceptors тести ===");

const client = new APIClient({
    baseUrl: "https://jsonplaceholder.typicode.com",
    timeout: 5000,
});

// Test 1: Logging Interceptors
console.log("\n--- Test 1: Logging ---");
client.addRequestInterceptor(requestLoggingInterceptor({ logLevel: "info" }));
client.addResponseInterceptor(responseLoggingInterceptor({ logLevel: "info" }));

client.get("/posts/1").then(() => {
    console.log("Logging test completed");
});

// Test 2: Performance Interceptor
console.log("\n--- Test 2: Performance ---");
const perfClient = new APIClient({
    baseUrl: "https://jsonplaceholder.typicode.com",
});

const { requestInterceptor, responseInterceptor } = performanceInterceptor();
perfClient.addRequestInterceptor(requestInterceptor);
perfClient.addResponseInterceptor(responseInterceptor);

perfClient.get("/posts/2").then(() => {
    console.log("Performance test completed");
});

// Test 3: Cache Interceptor
console.log("\n--- Test 3: Cache ---");
const cacheClient = new APIClient({
    baseUrl: "https://jsonplaceholder.typicode.com",
});

const cache = new CacheInterceptor({ ttl: 10000 }); // 10 seconds
cacheClient.addRequestInterceptor(cache.requestInterceptor);
cacheClient.addResponseInterceptor(cache.responseInterceptor);

// First request - should go to the server
cacheClient.get("/posts/3").then(() => {
    console.log("First cache request completed");
    console.log("Cache stats:", cache.getStats());

    // Second request - should be from cache (if cache HIT works)
    setTimeout(() => {
        cacheClient.get("/posts/3").then(() => {
            console.log("Second cache request completed");
        });
    }, 1000);
});

// Test 4: Combined Interceptors
console.log("\n--- Test 4: Combined ---");
const combinedClient = new APIClient({
    baseUrl: "https://jsonplaceholder.typicode.com",
});

// Add multiple interceptors together
combinedClient.addRequestInterceptor(requestLoggingInterceptor());
combinedClient.addRequestInterceptor(requestInterceptor);
combinedClient.addResponseInterceptor(responseLoggingInterceptor());
combinedClient.addResponseInterceptor(responseInterceptor);

combinedClient
    .post("/posts", {
        title: "Test Post",
        body: "This is a test",
        userId: 1,
    })
    .then(() => {
        console.log("Combined interceptors test completed");
    });
