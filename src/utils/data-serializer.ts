export class DataSerializer {
    /**
     * Serializes data to a JSON string, handling File and Blob objects.
     * @param data - The data to serialize.
     * @returns A JSON string representation of the data.
     */
    static hasFiles(data: any): boolean {
        if (!data || typeof data !== "object") {
            return false;
        }
        return this.containsFiles(data);
    }

    /**
     * Returns the appropriate content type based on the presence of files in the data.
     * If files are present, returns undefined (indicating multipart/form-data).
     * Otherwise, returns "application/json".
     * @param data - The data to check.
     * @returns The content type string or undefined.
     */
    static getContentType(data: any): string | undefined {
        if (this.hasFiles(data)) {
            return undefined;
        }
        return "application/json";
    }

    /**
     * Serializes data to a string or FormData, depending on whether it contains files.
     * @param data - The data to serialize.
     * @returns A JSON string or FormData instance.
     */
    static serialize(data: any): string | FormData {
        if (!data) {
            return "";
        }
        if (this.hasFiles(data)) {
            return this.toFormData(data);
        }
        return JSON.stringify(data);
    }

    /**
     * Checks if the data contains any File or Blob objects.
     * @param data - The data to check.
     * @returns True if the data contains files, false otherwise.
     */
    private static containsFiles(data: any): boolean {
        if (data instanceof File || data instanceof Blob) {
            return true;
        }
        if (Array.isArray(data)) {
            return data.some((item) => this.containsFiles(item));
        }
        if (typeof data === "object") {
            return Object.values(data).some((value) =>
                this.containsFiles(value)
            );
        }
        return false;
    }

    /**
     * Converts data to FormData, handling nested objects and arrays.
     * @param data - The data to convert.
     * @param formData - The FormData instance to append to.
     * @param prefix - The prefix for nested fields.
     * @returns A FormData instance with the serialized data.
     */
    private static toFormData(
        data: any,
        formData = new FormData(),
        prefix = ""
    ): FormData {
        for (const [key, value] of Object.entries(data)) {
            const fieldName = prefix ? `${prefix}.${key}` : key;

            if (value instanceof File || value instanceof Blob) {
                formData.append(fieldName, value);
            } else if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    this.toFormData({ [index]: item }, formData, fieldName);
                });
            } else if (value && typeof value === "object") {
                this.toFormData(value, formData, fieldName);
            } else if (value !== undefined && value !== null) {
                formData.append(fieldName, String(value));
            }
        }
        return formData;
    }
}
