'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/store/hooks/useGameStore';
import { useTableSettings, useGameVariantSettings } from '@/hooks/useSettingsStore';
import { getBestHandValue, calculateHandValues } from '@/lib/utils/gameLogic';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CasinoIcon } from '@/components/icons';

/**
 * DealerTurn component - Handles the dealer's turn in the blackjack game
 *
 * This component follows React hooks best practices:
 * 1. All hooks are called unconditionally at the top level
 * 2. Complex logic is extracted to a custom hook
 * 3. Early returns only happen after all hooks are called
 */

interface DealerTurnProps {
    isActive: boolean;
    onComplete?: () => void;
    className?: string;
}

export const DealerTurn = ({
    isActive,
    onComplete,
    className
}: DealerTurnProps) => {
    const [status, setStatus] = useState<string>('');
    const dealerTurnExecuted = useRef(false);

    // Get game state - with error handling
    const dealerHand = useGameStore(state => state?.dealerHand);
    const playDealerTurn = useGameStore(state => state?.playDealerTurn);
    const gamePhase = useGameStore(state => state?.gamePhase);

    // Get game rules from settings store
    const { gameRules } = useGameVariantSettings();

    // Log if any critical dependencies are missing
    useEffect(() => {
        if (isActive) {
            if (!dealerHand) console.error('DealerTurn: dealerHand is undefined');
            if (!gameRules) console.warn('DealerTurn: gameRules is undefined, using defaults');
            if (!playDealerTurn) console.error('DealerTurn: playDealerTurn function is undefined');
        }
    }, [isActive, dealerHand, gameRules, playDealerTurn]);

    // Access flattened properties directly from the store
    const { animationSpeed } = useTableSettings();

    // Calculate animation delay based on animation speed setting
    const delay = useCallback(() => {
        // Invert the animation speed (100 = fast, 0 = slow)
        const invertedSpeed = 100 - animationSpeed;
        // Base delay of 500ms at 50% speed, ranging from 200ms to 1000ms
        return 200 + (invertedSpeed * 8);
    }, [animationSpeed]);

    // Get dealer status
    const getDealerStatus = useCallback(() => {
        if (!dealerHand?.cards?.length) {
            return "Waiting for dealer...";
        }

        try {
            // Ensure all cards are face up for display purposes
            const visibleCards = dealerHand.cards.map(card => ({
                ...card,
                isFaceUp: true
            }));

            // Add explicit logging for debugging
            console.log('Dealer cards:', visibleCards.map(c => `${c.rank}${c.suit[0]}`));

            // Make sure all cards are considered
            const values = calculateHandValues(visibleCards);
            console.log('Calculated values for dealer hand:', values);

            // Get best value (non-busting if possible)
            const validValues = values.filter(v => v <= 21);
            const bestValue = validValues.length > 0
                ? Math.max(...validValues)
                : Math.min(...values);

            console.log('Best value for dealer hand:', bestValue, 'Valid values:', validValues);

            // Check if dealer has a soft hand (has an Ace counted as 11)
            const isSoft = visibleCards.some(card => card.rank === 'A') &&
                values.length > 1 &&
                values.some(v => v <= 21 && v > bestValue - 10);

            // Check if dealer must hit based on game rules
            const dealerHitsSoft17 = gameRules?.dealerHitsSoft17 ?? false;
            const dealerMustHit = bestValue < 17 ||
                (bestValue === 17 && isSoft && dealerHitsSoft17);

            if (dealerMustHit) {
                return `Dealer has ${bestValue}${isSoft ? " (soft)" : ""} and must hit`;
            } else {
                return `Dealer stands with ${bestValue}`;
            }
        } catch (error) {
            console.error('Error calculating dealer status:', error);
            return "Calculating dealer's next move...";
        }
    }, [dealerHand, gameRules]);

    // Handle the dealer's turn
    useEffect(() => {
        if (!isActive) return;
        if (!playDealerTurn) {
            console.error('Cannot execute dealer turn - playDealerTurn function is missing');
            return;
        }

        let timeout: NodeJS.Timeout;

        // Update status immediately
        setStatus(getDealerStatus());

        // Only execute dealer turn once per activation to prevent loops
        if (!dealerTurnExecuted.current) {
            console.log('DealerTurn: Starting dealer turn sequence');
            dealerTurnExecuted.current = true;

            // Automated dealer play with delay
            timeout = setTimeout(() => {
                try {
                    console.log('DealerTurn: Executing dealer turn logic');
                    playDealerTurn();

                    if (onComplete) {
                        onComplete();
                    }
                } catch (error) {
                    console.error('Error during dealer turn:', error);
                }
            }, delay());
        }

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [isActive, getDealerStatus, playDealerTurn, onComplete, delay]);

    // Reset the execution flag when the component becomes inactive
    useEffect(() => {
        if (!isActive) {
            dealerTurnExecuted.current = false;
        }
    }, [isActive]);

    // Update status when dealer hand changes
    useEffect(() => {
        if (isActive) {
            setStatus(getDealerStatus());
        }
    }, [isActive, dealerHand, getDealerStatus]);

    if (!isActive || !status) {
        return null;
    }

    return (
        <div className={cn(
            "relative max-w-lg mx-auto",
            isActive ? "opacity-100" : "opacity-0 h-0 overflow-hidden",
            className
        )}>
            {isActive && (
                <div className="flex flex-col items-center justify-center p-4 my-4 text-white rounded-lg bg-black/40 backdrop-blur-sm">
                    <div className="flex items-center mb-3">
                        <CasinoIcon className="w-6 h-6 mr-2 text-amber-400" />
                        <h3 className="text-lg font-semibold">Dealer's Turn</h3>
                    </div>

                    <p className="mb-4 text-center">{status}</p>

                    {/* Debug info during development */}
                    {process.env.NODE_ENV !== 'production' && dealerHand?.cards && (
                        <div className="p-2 mt-2 text-xs bg-black/50 rounded-md">
                            <p>Cards: {dealerHand.cards.map(c => `${c.rank}${c.suit[0]}`).join(', ')}</p>
                            <p>Values: {dealerHand.values?.join(', ') || 'none'}</p>
                            <p>Is soft: {dealerHand.isSoft ? 'Yes' : 'No'}</p>
                            <p>Is busted: {dealerHand.isBusted ? 'Yes' : 'No'}</p>
                        </div>
                    )}

                    <Button
                        onClick={onComplete}
                        variant="default"
                        className="text-white mt-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400"
                    >
                        Continue
                    </Button>
                </div>
            )}
        </div>
    );
};

export default DealerTurn;