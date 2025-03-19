'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const { useState, useEffect } = React;

const spinnerVariants = cva(
    'inline-flex items-center justify-center rounded-full border-t-transparent animate-spin',
    {
        variants: {
            variant: {
                default: 'border-primary border-t-transparent',
                primary: 'border-primary border-t-transparent',
                secondary: 'border-secondary border-t-transparent',
                success: 'border-green-600 border-t-transparent',
                danger: 'border-red-600 border-t-transparent',
                warning: 'border-yellow-500 border-t-transparent',
                info: 'border-blue-600 border-t-transparent',
                chips: 'border-yellow-400 border-t-transparent',
                cards: 'border-red-600 border-t-transparent',
            },
            size: {
                xs: 'w-3 h-3 border-[2px]',
                sm: 'w-4 h-4 border-[2px]',
                md: 'w-6 h-6 border-[2px]',
                lg: 'w-8 h-8 border-[3px]',
                xl: 'w-12 h-12 border-[4px]',
                '2xl': 'w-16 h-16 border-[4px]',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

export interface LoadingSpinnerProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
    /** Text to display below the spinner */
    text?: string;
    /** Number of dots to show in the loading text (0-3) */
    dots?: number;
    /** Whether to animate the dots */
    animateDots?: boolean;
    /** Delay in ms before showing the spinner */
    delay?: number;
    /** Minimum time in ms to show the spinner */
    minDisplayTime?: number;
}

/**
 * LoadingSpinner Component
 *
 * A customizable spinner for loading states with animated dots and delayed display.
 */
export function LoadingSpinner({
    className,
    variant,
    size,
    text,
    dots = 3,
    animateDots = true,
    delay = 0,
    minDisplayTime = 0,
    ...props
}: Readonly<LoadingSpinnerProps>) {
    const [isVisible, setIsVisible] = useState(delay === 0);
    const [displayStartTime, setDisplayStartTime] = useState<number | null>(null);
    const [showDots, setShowDots] = useState(dots > 0 ? 1 : 0);

    // Handle delayed display
    useEffect(() => {
        if (delay > 0) {
            const timer = setTimeout(() => {
                setIsVisible(true);
                setDisplayStartTime(Date.now());
            }, delay);

            return () => clearTimeout(timer);
        }
    }, [delay]);

    // Handle minimum display time
    useEffect(() => {
        if (!isVisible || minDisplayTime <= 0 || !displayStartTime) return;

        const elapsedTime = Date.now() - displayStartTime;

        if (elapsedTime < minDisplayTime) {
            const remainingTime = minDisplayTime - elapsedTime;

            const timer = setTimeout(() => {
                setDisplayStartTime(null);
            }, remainingTime);

            return () => clearTimeout(timer);
        } else {
            setDisplayStartTime(null);
        }
    }, [isVisible, minDisplayTime, displayStartTime]);

    // Animate dots
    useEffect(() => {
        if (!animateDots || dots <= 0) return;

        const interval = setInterval(() => {
            setShowDots(prev => (prev % dots) + 1);
        }, 400);

        return () => clearInterval(interval);
    }, [animateDots, dots]);

    // IMPORTANT: All hooks have been called by this point
    // It's safe to have conditional returns AFTER all hooks are called
    // This follows React's Rules of Hooks: https://reactjs.org/docs/hooks-rules.html
    if (!isVisible) {
        return null;
    }

    const dotsText = text ? '.'.repeat(showDots).padEnd(dots, ' ') : '';

    return (
        <div
            className={cn('flex flex-col items-center justify-center', className)}
            aria-live="polite"
            {...props}
        >
            <div className={cn(spinnerVariants({ variant, size }))} aria-hidden="true" />

            {text && (
                <div className="mt-2 text-sm font-medium text-center">
                    <motion.span
                        initial={animateDots ? { opacity: 0 } : false}
                        animate={animateDots ? { opacity: 1 } : false}
                        transition={{ duration: 0.2 }}
                    >
                        {text}
                        <span aria-hidden="true" className="inline-block min-w-[18px] text-left">
                            {dotsText}
                        </span>
                    </motion.span>
                </div>
            )}

            <span className="sr-only">Loading{text ? `: ${text}` : ''}</span>
        </div>
    );
}