"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Define the Attribute type to match what next-themes expects
type Attribute = 'class' | 'data-theme' | 'data-mode';

// Define ThemeProviderProps type locally instead of importing from next-themes/dist/types
interface ThemeProviderProps {
    children: React.ReactNode;
    attribute?: Attribute | Attribute[];
    defaultTheme?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
    storageKey?: string;
    themes?: string[];
    forcedTheme?: string;
}

export function ThemeProvider({ children, ...props }: Readonly<ThemeProviderProps>) {
    // Using a type-safe approach
    return <NextThemesProvider {...props as unknown as Record<string, unknown>}>{children}</NextThemesProvider>;
}