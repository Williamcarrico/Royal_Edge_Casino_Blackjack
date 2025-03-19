import React from 'react';
import { cn } from '@/lib/utils';

type MessageVariant = 'primary' | 'success' | 'warning' | 'error' | 'info';

interface MessageProps {
    children: React.ReactNode;
    variant?: MessageVariant;
    className?: string;
}

export function Message({
    children,
    variant = 'primary',
    className
}: Readonly<MessageProps>) {
    const variantStyles = {
        primary: 'bg-primary/10 text-primary border-primary/20',
        success: 'bg-green-500/10 text-green-500 border-green-500/20',
        warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        error: 'bg-red-500/10 text-red-500 border-red-500/20',
        info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };

    return (
        <div
            className={cn(
                'rounded-md p-3 border text-sm shadow-sm',
                variantStyles[variant],
                className
            )}
        >
            {children}
        </div>
    );
}