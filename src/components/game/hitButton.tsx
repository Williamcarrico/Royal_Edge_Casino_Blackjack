"use client"

import React, { useMemo } from "react"
import { Button } from "@/ui/layout/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/ui/tooltip"

interface HitButtonProps {
    onClick: () => void
    disabled: boolean
    showTooltip?: boolean
}

// Wrap component with React.memo to prevent unnecessary re-renders
export const HitButton = React.memo(({
    onClick,
    disabled,
    showTooltip = false,
}: HitButtonProps) => {
    // Memoize the button element
    const button = useMemo(() => (
        <Button
            onClick={onClick}
            disabled={disabled}
            variant="default"
            className="w-full p-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
        >
            Hit
        </Button>
    ), [onClick, disabled]);

    // Memoize tooltip content
    const tooltipContent = useMemo(() => (
        <TooltipContent>
            <span>Take another card from the dealer</span>
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
HitButton.displayName = 'HitButton';