"use client"

import React from "react"
import { Button } from "@/ui/layout/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/ui/tooltip"

interface StandButtonProps {
    onClick: () => void
    disabled: boolean
    showTooltip?: boolean
}

export const StandButton = ({
    onClick,
    disabled,
    showTooltip = false,
}: StandButtonProps) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        onClick={onClick}
                        disabled={disabled}
                        variant="default"
                        className="w-full p-2 text-white transition-colors bg-red-600 rounded-md hover:bg-red-700"
                    >
                        Stand
                    </Button>
                </TooltipTrigger>
                {showTooltip && (
                    <TooltipContent>
                        <p>Keep your current hand and end your turn</p>
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    )
}