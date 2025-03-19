'use client';

/**
 * Simple utility for monitoring performance metrics in the application
 */
export const performanceMetrics = {
    /**
     * Records the calculation time for an operation
     * @param operation - Name of the operation being measured
     * @param time - Time taken in milliseconds
     */
    recordCalculation: (operation: string, time: number) => {
        // Skip logging in production
        if (process.env.NODE_ENV !== 'production') {
            console.log(`Performance [${operation}]: ${time.toFixed(2)}ms`);
        }

        // In a real implementation, you might send these metrics to an analytics service
    },

    /**
     * Wraps a function with performance monitoring
     * @param name - Name of the operation
     * @param fn - Function to wrap
     * @returns The wrapped function
     */
    measure: <Args extends unknown[], Return>(
        name: string,
        fn: (...args: Args) => Return
    ): ((...args: Args) => Return) => {
        return ((...args: Args) => {
            const start = performance.now();
            const result = fn(...args);
            const end = performance.now();

            performanceMetrics.recordCalculation(name, end - start);

            return result;
        });
    }
};