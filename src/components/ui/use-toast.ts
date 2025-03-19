'use client';

// Adapted from https://github.com/shadcn-ui/ui/blob/main/apps/www/registry/default/ui/use-toast.tsx
import { toast as sonnerToast } from "sonner"

// Basic toast properties
export type ToastProps = {
    title?: string;
    description?: string;
    action?: React.ReactNode;
    id?: string;
    variant?: "default" | "destructive" | "success";
    duration?: number;
}

export function useToast() {
    // We don't actually need to track toasts for most use cases
    const toast = (props: ToastProps) => {
        // Use sonnerToast directly - it handles everything for us
        return sonnerToast(props.title ?? "", {
            description: props.description,
            action: props.action,
            id: props.id,
            className: props.variant ? `toast-${props.variant}` : undefined,
            duration: props.duration
        });
    }

    return {
        toast,
        dismiss: sonnerToast.dismiss,
        dismissAll: () => sonnerToast.dismiss()
    }
}

// Export the original toast
export { toast } from "sonner"