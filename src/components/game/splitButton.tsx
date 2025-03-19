'use client';

import React, { useMemo } from 'react';
import { Button } from '@/ui/layout/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/format';

interface SplitButtonProps {
    onClick: () => void;
    disabled: boolean;
    bet: number;
    showTooltip?: boolean;
    className?: string;
}

// Wrap the component with React.memo to prevent unnecessary re-renders
const SplitButton: React.FC<SplitButtonProps> = React.memo(({
    onClick,
    disabled,
    bet,
    showTooltip = false,
    className
}) => {
    // Format the additional bet amount
    const formattedBet = formatCurrency(bet);

    // Memoize the button element to ensure it doesn't cause re-renders
    const button = useMemo(() => (
        <Button
            variant="outline"
            size="lg"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                !disabled && "text-white bg-indigo-600 hover:bg-indigo-700 border-indigo-500",
                "font-medium",
                className
            )}
        >
            Split
        </Button>
    ), [onClick, disabled, className]);

    // Memoize the tooltip content to prevent re-renders
    const tooltipContent = useMemo(() => (
        <TooltipContent>
            <p>Splits your pair into two hands</p>
            <p className="mt-1 text-xs">Costs an additional {formattedBet}</p>
        </TooltipContent>
    ), [formattedBet]);

    // If tooltip is requested, wrap the button in a tooltip
    if (showTooltip) {
        return (
            <TooltipProvider delayDuration={300}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {button}
                    </TooltipTrigger>
                    {tooltipContent}
                </Tooltip>
            </TooltipProvider>
        );
    }

    // Otherwise just return the button
    return button;
});

// Add display name for better debugging
SplitButton.displayName = 'SplitButton';

export { SplitButton };
export default SplitButton;