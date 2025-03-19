"use client";

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
    return (
        <SonnerToaster
            position="bottom-right"
            toastOptions={{
                className: 'bg-background border-border text-foreground',
                classNames: {
                    success: 'border-green-500',
                    error: 'border-destructive',
                    loading: 'border-blue-500',
                }
            }}
        />
    );
}