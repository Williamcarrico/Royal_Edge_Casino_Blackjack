'use client';

import React, { useState, useRef } from 'react';
import { useGameStore, useChipsAmount, useBetAmount, useGamePhase } from '@/store/hooks/useGameStore';
import { Button } from '@/ui/layout/button';
import { Chip } from './chip';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { useAnimationTracker, createChipTossAnimation } from '@/lib/animation-utils';

interface BettingControlsProps {
    className?: string;
}

export const BettingControls = ({ className }: BettingControlsProps) => {
    const controlsRef = useRef<HTMLDivElement>(null);
    const betAreaRef = useRef<HTMLDivElement>(null);
    const { add: trackAnimation } = useAnimationTracker();

    // Get chips, bet, and game phase
    const chipsAmount = useChipsAmount();
    const currentBet = useBetAmount();
    const gamePhase = useGamePhase();

    // Get betting actions
    const { placeBet, increaseBet, clearBet } = useGameStore();

    // Chip denominations
    const chipValues = [5, 25, 100, 500];

    // Custom bet amount for input
    const [customBet, setCustomBet] = useState<number | ''>('');

    // Get whether the game is in betting phase
    const isBettingPhase = gamePhase === 'betting';

    // Handle chip click
    const handleChipClick = (value: number) => {
        if (value > chipsAmount) return;

        const isEndOfRound = ['settlement', 'completed'].includes(gamePhase);

        // Special handling when clicking a chip at the end of a round
        if (isEndOfRound) {
            console.log('Chip clicked during end of round phase - resetting round first');
            // Get resetRound function and call it
            const resetRound = useGameStore.getState().resetRound;
            resetRound();

            // Add a small delay to ensure the game state is updated before placing bet
            setTimeout(() => {
                placeBet(value);
                console.log(`Placed bet of ${value} after round reset`);
            }, 100);
            return;
        }

        // Regular bet handling during betting phase
        if (isBettingPhase) {
            // If first bet, use placeBet, otherwise increaseBet
            if (currentBet === 0) {
                placeBet(value);
            } else {
                increaseBet(value);
            }

            // Animate chip toss to betting area
            if (controlsRef.current && betAreaRef.current) {
                const chipElement = document.getElementById(`chip-${value}`);
                if (chipElement) {
                    const clone = chipElement.cloneNode(true) as HTMLElement;
                    clone.style.position = 'absolute';
                    clone.style.zIndex = '100';

                    const rect = chipElement.getBoundingClientRect();
                    const betRect = betAreaRef.current.getBoundingClientRect();

                    // Calculate toss target position
                    const targetX = betRect.left - rect.left + (betRect.width / 2);
                    const targetY = betRect.top - rect.top + (betRect.height / 2);

                    document.body.appendChild(clone);

                    const animation = createChipTossAnimation(clone, targetX, targetY);
                    trackAnimation(animation);

                    // Remove clone after animation
                    setTimeout(() => {
                        clone.remove();
                    }, 1000);
                }
            }
        }
    };

    // Handle custom bet submit
    const handleCustomBetSubmit = () => {
        if (!customBet || customBet <= 0 || customBet > chipsAmount) return;

        const isEndOfRound = ['settlement', 'completed'].includes(gamePhase);

        // Handle end of round
        if (isEndOfRound) {
            // Reset round first
            const resetRound = useGameStore.getState().resetRound;
            resetRound();

            // Small delay to ensure proper state transition
            setTimeout(() => {
                placeBet(Number(customBet));
            }, 100);
        } else if (isBettingPhase) {
            // Normal betting phase
            if (currentBet === 0) {
                placeBet(Number(customBet));
            } else {
                increaseBet(Number(customBet));
            }
        }

        setCustomBet('');
    };

    // Clear current bet
    const handleClearBet = () => {
        if (!isBettingPhase || currentBet === 0) return;
        clearBet();
    };

    return (
        <div
            ref={controlsRef}
            className={cn(
                "flex flex-col space-y-4",
                !isBettingPhase && "opacity-60 pointer-events-none",
                className
            )}
        >
            {/* Chips area */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                {chipValues.map(value => (
                    <Chip
                        id={`chip-${value}`}
                        key={value}
                        value={value}
                        onClick={() => handleChipClick(value)}
                        disabled={!isBettingPhase || value > chipsAmount}
                    />
                ))}
            </div>

            {/* Custom bet input */}
            <div className="flex items-center gap-2">
                <div className="w-32">
                    <input
                        type="number"
                        value={customBet}
                        onChange={(e) => setCustomBet(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                        placeholder="Custom bet"
                        disabled={!isBettingPhase}
                        className="w-full p-2 text-white bg-gray-800 border border-gray-700 rounded-md"
                    />
                </div>
                <Button
                    onClick={handleCustomBetSubmit}
                    disabled={!isBettingPhase || !customBet || customBet <= 0 || customBet > chipsAmount}
                    variant="outline"
                    size="sm"
                    className="text-white bg-gray-800 border-gray-700"
                >
                    Place
                </Button>
            </div>

            {/* Current bet display */}
            <div
                ref={betAreaRef}
                className="flex flex-col items-center px-6 py-4 bg-gray-800 bg-opacity-50 rounded-md"
            >
                <div className="mb-1 text-sm text-gray-300">Current Bet</div>
                <div className="text-xl font-bold text-amber-400">
                    {formatCurrency(currentBet)}
                </div>

                {currentBet > 0 && isBettingPhase && (
                    <Button
                        onClick={handleClearBet}
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-gray-300 hover:text-white hover:bg-red-900 hover:bg-opacity-50"
                    >
                        Clear Bet
                    </Button>
                )}
            </div>

            {/* Chips balance */}
            <div className="text-sm text-gray-300">
                Chips: <span className="font-semibold text-white">{formatCurrency(chipsAmount)}</span>
            </div>
        </div>
    );
};

export default BettingControls;