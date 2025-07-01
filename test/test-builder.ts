import { URLBuilder } from "../src/utils/url-builder";

console.log("\n=== URLBuilder tests ===");

// Base URL test
const builder1 = new URLBuilder("https://api.example.com");
console.log("Base URL:", builder1.build());
// → https://api.example.com

// Segment test
const builder2 = new URLBuilder("https://api.example.com/");
console.log("With segments:", builder2.segment("users").segment("123").build());
// → https://api.example.com/users/123

// Query parameters test
const builder3 = new URLBuilder("https://api.example.com");
console.log(
    "With query:",
    builder3.segment("users").query({ page: 1, limit: 10 }).build()
);
// → https://api.example.com/users?page=1&limit=10

// Test with special characters
const builder4 = new URLBuilder("https://api.example.com");
console.log(
    "Special characters:",
    builder4
        .segment("search")
        .query({ q: "hello world", type: "user&admin" })
        .build()
);
// → https://api.example.com/search?q=hello%20world&type=user%26admin

// Test with null/undefined values
const builder5 = new URLBuilder("https://api.example.com");
console.log(
    "Null/undefined filter:",
    builder5
        .segment("users")
        .query({
            name: "John",
            age: null,
            city: undefined,
            active: true,
        })
        .build()
);
// → https://api.example.com/users?name=John&active=true

// Test chainable methods
const builder6 = new URLBuilder("https://api.example.com///") // multiple slashes
    .segment("api")
    .segment("v1")
    .segment("users")
    .query({ sort: "name" })
    .query({ order: "asc" }); // additional parameters
console.log("Chainable + multiple slashes:", builder6.build());
// → https://api.example.com/api/v1/users?sort=name&order=asc
