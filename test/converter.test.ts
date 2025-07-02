import {
    camelToKebab,
    kebabToCamel,
    convertObjectKeys,
} from "../src/utils/case-converter";

describe("Converter Test", () => {
    describe("camelToKebab", () => {
        const testCases = [
            ["myVariableName", "my-variable-name"],
            ["XMLHttpRequest", "xmlhttp-request"],
            ["iOS", "i-os"],
            ["getAPI", "get-api"],
            ["userName", "user-name"],
        ];

        testCases.forEach(([input, expected]) => {
            test(`should convert "${input}" to "${expected}"`, () => {
                expect(camelToKebab(input)).toBe(expected);
            });
        });
    });

    describe("kebabToCamel", () => {
        const testCases = [
            ["my-variable-name", "myVariableName"],
            ["user-name", "userName"],
        ];

        testCases.forEach(([input, expected]) => {
            test(`should convert "${input}" to "${expected}"`, () => {
                expect(kebabToCamel(input)).toBe(expected);
            });
        });
    });

    describe("convertObjectKeys", () => {
        const testObj = {
            userName: "John",
            userAge: 25,
            userEmail: "john@test.com",
            userCitizen: "British",
        };
        expect(convertObjectKeys(testObj, camelToKebab)).toEqual({
            "user-name": "John",
            "user-age": 25,
            "user-email": "john@test.com",
            "user-citizen": "British",
        });
    });
});
