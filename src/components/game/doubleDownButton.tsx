"use client"

import React, { useMemo } from "react"
import { Button } from "@/ui/layout/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/ui/tooltip"
import { formatCurrency } from "@/lib/utils/format"

interface DoubleDownButtonProps {
    onClick: () => void
    disabled: boolean
    betAmount: number
    showTooltip?: boolean
}

// Wrap component with React.memo to prevent unnecessary re-renders
export const DoubleDownButton = React.memo(({
    onClick,
    disabled,
    betAmount,
    showTooltip = false,
}: DoubleDownButtonProps) => {
    // Format bet amount outside of render
    const formattedBet = useMemo(() => formatCurrency(betAmount), [betAmount]);

    // Memoize the button element
    const button = useMemo(() => (
        <Button
            onClick={onClick}
            disabled={disabled}
            variant="default"
            className="w-full p-2 text-white transition-colors rounded-md bg-amber-600 hover:bg-amber-700"
        >
            Double Down {betAmount > 0 && `(${formattedBet})`}
        </Button>
    ), [onClick, disabled, betAmount, formattedBet]);

    // Memoize tooltip content
    const tooltipContent = useMemo(() => (
        <TooltipContent>
            <p>Double your bet and receive exactly one more card</p>
        </TooltipContent>
    ), []);

    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    {button}
                </TooltipTrigger>
                {showTooltip && tooltipContent}
            </Tooltip>
        </TooltipProvider>
    )
});

// Add display name for better debugging
DoubleDownButton.displayName = 'DoubleDownButton';