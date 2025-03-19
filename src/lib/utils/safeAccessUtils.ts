/**
 * Type guard to check if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

/**
 * Safely access a property from an object that might be null or undefined
 */
export function safeGet<T, K extends keyof T>(
    obj: T | null | undefined,
    key: K,
    defaultValue: T[K]
): T[K] {
    if (!isDefined(obj)) return defaultValue;
    return obj[key] ?? defaultValue;
}

/**
 * Safe array access that handles undefined indices
 */
export function safeArrayGet<T>(
    array: T[] | null | undefined,
    index: number | null | undefined,
    defaultValue: T
): T {
    if (!isDefined(array) || !isDefined(index) || index < 0 || index >= array.length) {
        return defaultValue;
    }
    return array[index];
}

/**
 * Execute a function and return its result
 */
export function executeFunction<T>(fn: () => T): T {
    return fn();
}

/**
 * Return a default value instead of executing a function
 */
export function useDefaultValue<T>(fn: () => T, defaultValue: T): T {
    return defaultValue;
}

/**
 * Safely access nested properties with fallback
 */
export function safeGetNested<T, K1 extends keyof T, K2 extends keyof T[K1]>(
    obj: T | null | undefined,
    key1: K1,
    key2: K2,
    defaultValue: T[K1][K2]
): T[K1][K2] {
    if (!isDefined(obj)) return defaultValue;
    const nestedObj = obj[key1];
    if (!isDefined(nestedObj)) return defaultValue;
    return nestedObj[key2] ?? defaultValue;
}

/**
 * Create a safe version of a function that always returns a value
 * even if the original function throws an error
 */
export function safeFn<R, T extends (...args: unknown[]) => R>(
    fn: T,
    defaultValue: R
): (...args: Parameters<T>) => R {
    return (...args: Parameters<T>): R => {
        try {
            return fn(...args);
        } catch (error) {
            console.error('Error in safeFn:', error);
            return defaultValue;
        }
    };
}