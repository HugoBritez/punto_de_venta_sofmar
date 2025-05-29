export function toPascalCase(obj: Record<string, any>): Record<string, any> {
    if (Array.isArray(obj)) {
        return obj.map(toPascalCase);
    }
    if (obj !== null && typeof obj === 'object') {
        const result: Record<string, any> = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const pascalKey = key
                    .replace(/(^\w|_\w)/g, k => k.replace('_', '').toUpperCase());
                result[pascalKey] = toPascalCase(obj[key]);
            }
        }
        return result;
    }
    return obj;
}