/**
 * Converts camelCase string to kebab-case
 * @param string - The camelCase string to convert
 * @returns The kebab-case string
 */
export function camelToKebab(string: string): string {
    return string
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .toLowerCase()
        .replace(/^-+/, ""); // Remove leading hyphens
}

/**
 * Converts kebab-case string to camelCase
 * @param string - The kebab-case string to convert
 * @returns The camelCase string
 */
export function kebabToCamel(string: string): string {
    return string.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts object keys from camelCase to kebab-case or vice versa
 * @param obj - The object with keys to convert
 * @param converter - The conversion function (camelToKebab or kebabToCamel)
 * @returns A new object with converted keys
 */
export function convertObjectKeys(
    obj: Record<string, any>,
    converter: (key: string) => string
): Record<string, any> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        acc[converter(key)] = value;
        return acc;
    }, {} as Record<string, any>);
}
