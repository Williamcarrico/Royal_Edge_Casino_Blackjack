'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/format';
import { useAnimationTracker, createPulsingGlowAnimation } from '@/lib/animation-utils';

interface ChipProps {
    id?: string;
    value: number;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    animateOnHover?: boolean;
}

export const Chip = ({
    id,
    value,
    onClick,
    disabled = false,
    className,
    animateOnHover = true,
}: ChipProps) => {
    const chipRef = useRef<HTMLButtonElement>(null);
    const { add: trackAnimation } = useAnimationTracker();

    // Determine chip color based on value
    const getChipColors = (value: number) => {
        switch (true) {
            case value >= 1000:
                return {
                    bg: 'bg-amber-500',
                    border: 'border-yellow-300',
                    text: 'text-black',
                    shadow: 'shadow-amber-600/50'
                };
            case value >= 500:
                return {
                    bg: 'bg-violet-700',
                    border: 'border-violet-300',
                    text: 'text-white',
                    shadow: 'shadow-violet-800/50'
                };
            case value >= 100:
                return {
                    bg: 'bg-black',
                    border: 'border-gray-700',
                    text: 'text-amber-400',
                    shadow: 'shadow-black/50'
                };
            case value >= 25:
                return {
                    bg: 'bg-emerald-600',
                    border: 'border-emerald-300',
                    text: 'text-white',
                    shadow: 'shadow-emerald-700/50'
                };
            default:
                return {
                    bg: 'bg-red-700',
                    border: 'border-red-300',
                    text: 'text-white',
                    shadow: 'shadow-red-800/50'
                };
        }
    };

    const colors = getChipColors(value);

    // Add hover animation
    useEffect(() => {
        if (animateOnHover && chipRef.current) {
            const element = chipRef.current;

            const handleMouseEnter = () => {
                if (disabled) return;
                const animation = createPulsingGlowAnimation(element, {
                    duration: 0.8,
                    opacity: 0.7
                });
                trackAnimation(animation);
            };

            element.addEventListener('mouseenter', handleMouseEnter);

            return () => {
                element.removeEventListener('mouseenter', handleMouseEnter);
            };
        }
    }, [animateOnHover, disabled, trackAnimation]);

    return (
        <button
            id={id}
            ref={chipRef}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            type="button"
            className={cn(
                "relative flex items-center justify-center",
                "w-16 h-16 rounded-full",
                "border-4 shadow-lg",
                "transition-transform duration-200",
                colors.bg,
                colors.border,
                colors.text,
                colors.shadow,
                disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-110 cursor-pointer",
                className
            )}
        >
            {/* Inner ring */}
            <div className={cn(
                "absolute inset-2 border-2 rounded-full border-opacity-30",
                colors.border
            )} />

            {/* Dashed border pattern */}
            <div className={cn(
                "absolute inset-3 border border-dashed rounded-full border-opacity-30",
                colors.border
            )} />

            {/* Value text */}
            <div className="text-lg font-bold">
                {formatCurrency(value).replace('$', '')}
            </div>
        </button>
    );
};

export default Chip;