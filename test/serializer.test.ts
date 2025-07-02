import { DataSerializer } from "../src/utils/data-serializer";

describe("DataSerializer Test", () => {
    const mockFile = new File(["test content"], "test.txt", {
        type: "text/plain",
    });
    const dataWithFile = {
        user: { name: "John", age: 25 },
        avatar: mockFile,
        settings: { theme: "dark" },
    };

    describe("Simple data without files", () => {
        test("should return right values", () => {
            const simpleData = { name: "John", age: 25 };

            expect(DataSerializer.hasFiles(simpleData)).toBe(false);
            expect(DataSerializer.serialize(simpleData)).toBe(
                '{"name":"John","age":25}'
            );
            expect(DataSerializer.getContentType(simpleData)).toBe(
                "application/json"
            );
        });
    });

    describe("Data with files", () => {
        test("should return right values", () => {
            expect(DataSerializer.hasFiles(dataWithFile)).toBe(true);
            expect(DataSerializer.getContentType(dataWithFile)).toBe(undefined);
        });

        test("should create FormData", () => {
            const formData = DataSerializer.serialize(dataWithFile) as FormData;
            const avatarFile = formData.get("avatar") as File;

            expect(formData instanceof FormData).toBe(true);
            
            expect(formData.has("user.name")).toBe(true);
            expect(formData.has("user.age")).toBe(true);
            expect(formData.has("avatar")).toBe(true);
            expect(formData.has("settings.theme")).toBe(true);
            
            expect(avatarFile).toBeInstanceOf(File);
            expect(avatarFile.name).toBe("test.txt");
            expect(avatarFile.type).toBe("text/plain");
        });
    });
});
