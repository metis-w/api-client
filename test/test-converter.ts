import { camelToKebab, kebabToCamel, convertObjectKeys } from '../src/utils/case-converter';

// Tests for the case conversion functions
console.log('=== camelToKebab тести ===');
console.log(camelToKebab("myVariableName")); // → my-variable-name ✅
console.log(camelToKebab("XMLHttpRequest")); // →  xmlhttp-request ✅
console.log(camelToKebab("iOS")); // → i-os ✅
console.log(camelToKebab("getAPI")); // → get-api ✅
console.log(camelToKebab("userName")); // → user-name ✅

console.log('=== kebabToCamel тести ===');
console.log(kebabToCamel("my-variable-name")); // → myVariableName ✅
console.log(kebabToCamel("user-name")); // → userName ✅

console.log('=== convertObjectKeys тести ===');
const testObj = { userName: "John", userAge: 25, userEmail: "john@test.com" };
console.log(convertObjectKeys(testObj, camelToKebab)); 
// → { "user-name": "John", "user-age": 25, "user-email": "john@test.com" } ✅