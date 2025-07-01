import { DataSerializer } from "../src/utils/data-serializer";

console.log("=== DataSerializer tests ===");

// Simple data without files
const simpleData = { name: "John", age: 25 };
console.log("hasFiles (simple):", DataSerializer.hasFiles(simpleData)); // false
console.log("serialize (simple):", DataSerializer.serialize(simpleData)); // JSON string
console.log(
    "contentType (simple):",
    DataSerializer.getContentType(simpleData)
); // application/json

console.log("\n--- Test with files ---");

// Create a mock file for testing
const mockFile = new File(["test content"], "test.txt", { type: "text/plain" });
const dataWithFile = {
    user: { name: "John", age: 25 },
    avatar: mockFile,
    settings: { theme: "dark" },
};

console.log("hasFiles (with file):", DataSerializer.hasFiles(dataWithFile)); // true
console.log(
    "contentType (with file):",
    DataSerializer.getContentType(dataWithFile)
); // undefined

// Test FormData
const formData = DataSerializer.serialize(dataWithFile) as FormData;
console.log("FormData created:", formData instanceof FormData); // true

// Check contents of FormData
console.log("\nContents of FormData:");
for (const [key, value] of formData.entries()) {
    console.log(
        `${key}:`,
        value instanceof File ? `File(${value.name})` : value
    );
}

console.log("\n--- Test with arrays ---");
const dataWithArray = {
    users: [{ name: "John" }, { name: "Jane" }],
    files: [mockFile, new Blob(["blob content"])],
};

console.log(
    "hasFiles (with files array):",
    DataSerializer.hasFiles(dataWithArray)
); // true
const arrayFormData = DataSerializer.serialize(dataWithArray) as FormData;

/* console.log("Array in FormData:");
for (const [key, value] of arrayFormData.entries()) {
    console.log(
        `${key}:`,
        value instanceof File
            ? `File(${value.name})`
            : value instanceof Blob
            ? "Blob"
            : value
    );
}
*/ // Note: works, but have compiller error in vs code
