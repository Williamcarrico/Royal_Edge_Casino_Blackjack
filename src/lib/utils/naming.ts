/**
 * @module naming
 * @description Helper functions for consistent naming conventions
 */

/**
 * Naming conventions for different types of functions and objects
 */
export const namePatterns = {
    /**
     * Handler for user-initiated actions (onClick, onChange, etc.)
     * @param action The action being handled
     * @returns Properly formatted handler name
     */
    eventHandler: (action: string): string => `handle${capitalizeFirst(action)}`,

    /**
     * Global store action
     * @param action The action being performed
     * @returns Properly formatted action name
     */
    storeAction: (action: string): string => `${action}Action`,

    /**
     * Selector for derived state
     * @param selector What is being selected
     * @returns Properly formatted selector name
     */
    storeSelector: (selector: string): string => `select${capitalizeFirst(selector)}`,

    /**
     * Utility function
     * @param purpose What the utility does
     * @returns Properly formatted utility name
     */
    utilityFunction: (purpose: string): string => `${purpose}Utils`,

    /**
     * React hook
     * @param purpose What the hook is for
     * @returns Properly formatted hook name
     */
    hook: (purpose: string): string => `use${capitalizeFirst(purpose)}`,

    /**
     * Boolean variable indicating state
     * @param state What state is being indicated
     * @returns Properly formatted boolean variable name
     */
    booleanFlag: (state: string): string => `is${capitalizeFirst(state)}`,

    /**
     * Boolean variable indicating capability
     * @param capability What is capable
     * @returns Properly formatted capability variable name
     */
    capability: (capability: string): string => `can${capitalizeFirst(capability)}`,

    /**
     * Value that has gone through transformation
     * @param base The base value
     * @returns Properly formatted transformed value name
     */
    transformed: (base: string): string => `${base}Transformed`,

    /**
     * Function that creates or initializes something
     * @param entity What is being created
     * @returns Properly formatted creator function name
     */
    creator: (entity: string): string => `create${capitalizeFirst(entity)}`,
}

/**
 * Helper function to capitalize the first letter of a string
 *
 * @param str The string to capitalize
 * @returns Capitalized string
 */
function capitalizeFirst(str: string): string {
    if (!str) return '';
    return str[0].toUpperCase() + str.slice(1);
}