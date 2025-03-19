'use client';

import { useRef, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/ui/layout/button';
import { SplitButton } from './splitButton';
import { createBounceAnimation } from '@/lib/utils/animations';
import { useAnimationTracker } from '@/hooks/useAnimationTracker';
import { cn } from '@/lib/utils';
import { useGameStore, useGamePhase } from '@/store/hooks/useGameStore';
import { StrategyAdvisor } from './StrategyAdvisor';

interface GameControlsProps {
    showHints?: boolean;
    className?: string;
}

export const GameControls = ({
    showHints = false,
    className,
}: GameControlsProps) => {
    const controlsRef = useRef<HTMLDivElement>(null);
    const { add: trackAnimation } = useAnimationTracker();

    // Use primitive selectors for game state
    const gamePhase = useGamePhase();

    // Get individual actions as separate selectors
    const hit = useGameStore(state => state.hit);
    const stand = useGameStore(state => state.stand);
    const doubleDown = useGameStore(state => state.doubleDown);
    const split = useGameStore(state => state.split);
    const surrender = useGameStore(state => state.surrender);
    const dealInitialCards = useGameStore(state => state.dealInitialCards);
    const resetRound = useGameStore(state => state.resetRound);
    const bet = useGameStore(state => state.bet);

    // Get computed values with direct selectors
    const canDoubleDownRaw = useGameStore(state => state.canDoubleDown);
    const canSplitRaw = useGameStore(state => state.canSplit);
    const canSurrenderRaw = useGameStore(state => state.canSurrender);

    // Memoize computed properties to avoid unnecessary recalculations
    const canDoubleDown = useMemo(() => {
        if (typeof canDoubleDownRaw === 'function') {
            return canDoubleDownRaw();
        }
        return Boolean(canDoubleDownRaw);
    }, [canDoubleDownRaw]);

    const canSplit = useMemo(() => {
        if (typeof canSplitRaw === 'function') {
            return canSplitRaw();
        }
        return Boolean(canSplitRaw);
    }, [canSplitRaw]);

    const canSurrender = useMemo(() => {
        if (typeof canSurrenderRaw === 'function') {
            return canSurrenderRaw();
        }
        return Boolean(canSurrenderRaw);
    }, [canSurrenderRaw]);

    // Memoize game phase states to avoid unnecessary rerenders
    const isPlayerTurn = useMemo(() => gamePhase === 'playerTurn', [gamePhase]);
    const isBetting = useMemo(() => gamePhase === 'betting', [gamePhase]);
    const isRoundOver = useMemo(() =>
        ['settlement', 'completed'].includes(gamePhase),
        [gamePhase]
    );

    // Animate when player's turn starts - use isPlayerTurn as a dependency
    useEffect(() => {
        if (isPlayerTurn && controlsRef.current) {
            const animation = createBounceAnimation(controlsRef.current, {
                duration: 0.5,
                yAmount: -10
            });
            trackAnimation(animation);
        }
    }, [isPlayerTurn, trackAnimation]);

    // Update the handleNewRound function to be more robust
    const handleNewRound = useCallback(() => {
        console.log('New round action triggered manually');
        // Force reset regardless of current state to ensure the button always works
        resetRound();

        // Add a slight delay to ensure state updates fully propagate
        setTimeout(() => {
            // Check if we're still in an end-of-round state after attempting reset
            const currentPhase = gamePhase;
            if (['settlement', 'completed'].includes(currentPhase)) {
                console.log('Forcing second reset attempt due to persisting end state:', currentPhase);
                resetRound();
            }
        }, 100);
    }, [resetRound, gamePhase]);

    // Update the auto-transition effect to be more reliable
    useEffect(() => {
        // If we are in completed phase and a bet has been placed, automatically start a new round
        if (isRoundOver && bet > 0) {
            console.log('Auto-starting new round after bet placed in round-over phase:', gamePhase);
            // Small delay to ensure UI is settled before transition
            setTimeout(() => {
                resetRound();
            }, 50);
        }
    }, [isRoundOver, gamePhase, bet, resetRound]);

    // Handle actions with useCallback to ensure stable references
    const handleDeal = useCallback(() => {
        console.log('Deal action triggered');
        dealInitialCards();
    }, [dealInitialCards]);

    // Handle hit with logging to debug issues
    const handleHit = useCallback(() => {
        console.log('Hit action triggered');
        hit();
    }, [hit]);

    // Handle stand with logging to debug issues
    const handleStand = useCallback(() => {
        console.log('Stand action triggered');
        stand();
    }, [stand]);

    // Handle double with logging to debug issues
    const handleDouble = useCallback(() => {
        console.log('Double action triggered');
        doubleDown();
    }, [doubleDown]);

    // Handle split with logging to debug issues
    const handleSplit = useCallback(() => {
        console.log('Split action triggered');
        split();
    }, [split]);

    // Handle surrender with logging
    const handleSurrender = useCallback(() => {
        console.log('Surrender action triggered');
        surrender();
    }, [surrender]);

    // Memoize the rendered controls based on game phase to prevent unnecessary re-renders
    const renderedControls = useMemo(() => {
        if (isBetting) {
            return (
                <Button
                    variant="default"
                    size="lg"
                    onClick={handleDeal}
                    className="text-white bg-amber-600 hover:bg-amber-700"
                >
                    Deal Cards
                </Button>
            );
        }

        if (isRoundOver) {
            return (
                <Button
                    variant="default"
                    size="lg"
                    onClick={handleNewRound}
                    className="text-white bg-emerald-600 hover:bg-emerald-700 animate-pulse"
                >
                    {bet > 0 ? 'Continue Game' : 'New Round'}
                </Button>
            );
        }

        return (
            <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-5">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleHit}
                    disabled={!isPlayerTurn}
                    className={cn(
                        isPlayerTurn && "text-white bg-blue-600 hover:bg-blue-700 border-blue-500",
                        "font-medium"
                    )}
                >
                    Hit
                </Button>

                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleStand}
                    disabled={!isPlayerTurn}
                    className={cn(
                        isPlayerTurn && "text-white bg-red-600 hover:bg-red-700 border-red-500",
                        "font-medium"
                    )}
                >
                    Stand
                </Button>

                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleDouble}
                    disabled={!isPlayerTurn || !canDoubleDown}
                    className={cn(
                        isPlayerTurn && canDoubleDown && "text-white bg-purple-600 hover:bg-purple-700 border-purple-500",
                        "font-medium"
                    )}
                >
                    Double
                </Button>

                <SplitButton
                    onClick={handleSplit}
                    disabled={!isPlayerTurn || !canSplit}
                    bet={bet}
                    showTooltip={true}
                />

                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleSurrender}
                    disabled={!isPlayerTurn || !canSurrender}
                    className={cn(
                        isPlayerTurn && canSurrender && "text-white bg-amber-600 hover:bg-amber-700 border-amber-500",
                        "font-medium"
                    )}
                >
                    Surrender
                </Button>
            </div>
        );
    }, [
        isBetting, isRoundOver, isPlayerTurn, bet,
        handleDeal, handleNewRound, handleHit, handleStand, handleDouble, handleSplit, handleSurrender,
        canDoubleDown, canSplit, canSurrender
    ]);

    // Return appropriate controls based on game phase
    return (
        <div
            ref={controlsRef}
            className={cn(
                "flex flex-col space-y-4",
                isRoundOver && "animate-in fade-in",
                className
            )}
        >
            {renderedControls}

            {showHints && isPlayerTurn && (
                <StrategyAdvisor />
            )}
        </div>
    );
};

export default GameControls;