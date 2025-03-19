/**
 * createStoreUtils.ts
 * Utilities for creating type-safe Zustand stores with enhanced functionality
 */

import { create } from 'zustand';
import { createJSONStorage, persist, devtools } from 'zustand/middleware';
import { produce } from 'immer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

/**
 * Enhanced store options
 */
interface CreateStoreOptions {
    name: string;
    devtools?: boolean;
    immer?: boolean;
    persist?: {
        enabled: boolean;
        name: string;
        version: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        partialize?: (state: any) => any;
    };
    analytics?: {
        enabled: boolean;
        ignoredActions?: string[];
        trackStateChanges?: boolean;
    };
}

/**
 * Creates a store with enhanced functionality including:
 * - TypeScript type safety
 * - Optional Immer integration for easier state updates
 * - Optional Redux DevTools integration
 * - Optional persistence
 * - Optional analytics tracking
 */
export function createStore<T extends object>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initializer: any,
    options: CreateStoreOptions
) {
    // Chain middleware based on options
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pipeline: any = initializer;

    // Apply middleware in a specific order
    if (options.immer) {
        // Use immer with custom middleware instead of the old immer middleware
        const originalInitializer = pipeline;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pipeline = (set: AnyFunction, get: AnyFunction, api: any) => {
            return originalInitializer(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (args: any) => {
                    // If function is passed, use immer's produce
                    if (typeof args === 'function') {
                        return set((state: T) => produce(state, args));
                    }
                    // Otherwise, set the state directly
                    return set(args);
                },
                get,
                api
            );
        };
    }

    if (options.persist?.enabled) {
        pipeline = persist(pipeline, {
            name: options.persist.name,
            version: options.persist.version,
            partialize: options.persist.partialize,
            storage: createJSONStorage(() => localStorage),
            migrate: (persistedState, version) => {
                // Default migration that handles version changes
                console.log(`Migrating store ${options.name} from version ${version} to ${options.persist!.version}`);
                return persistedState;
            }
        });
    }

    if (options.devtools !== false) {
        pipeline = devtools(pipeline, {
            name: options.name,
            enabled: process.env.NODE_ENV !== 'production'
        });
    }

    // Add analytics hooks if needed (simple implementation)
    if (options.analytics?.enabled) {
        const originalInitializer = pipeline;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pipeline = (set: AnyFunction, get: AnyFunction, api: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const wrappedSet = (args: any) => {
                if (options.analytics?.trackStateChanges) {
                    // In a real implementation, you would track to your analytics system
                    console.log('State change:', args);
                }
                return set(args);
            };

            return originalInitializer(wrappedSet, get, api);
        };
    }

    // Create and return the store
    return create<T>(pipeline);
}