'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { basicStrategy, PlayerAction } from '@/lib/utils/basicStrategy';
import { Button } from '@/ui/layout/button';
import { Switch } from '@/ui/layout/switch';
import { useEnhancedSettingsStore } from '@/store/enhancedSettingsStore';
import { Card } from '@/lib/utils/gameLogic';
import { toast as sonnerToast } from 'sonner';

interface AutoStrategyPlayerProps {
    className?: string;
}

export const AutoStrategyPlayer: React.FC<AutoStrategyPlayerProps> = ({ className }) => {
    const {
        gamePhase,
        dealerHand,
        player,
        hit,
        stand,
        doubleDown,
        split,
        surrender,
        canSplit,
        canDoubleDown,
        canSurrender
    } = useGameStore();

    const { autoPlayBasicStrategy, setAutoPlayBasicStrategy } = useEnhancedSettingsStore(state => ({
        autoPlayBasicStrategy: state.autoPlayBasicStrategy,
        setAutoPlayBasicStrategy: state.setAutoPlayBasicStrategy
    }));
    const delayTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Track the current strategy suggestion
    const [currentSuggestion, setCurrentSuggestion] = useState<string | null>(null);

    // Function to toggle auto-play
    const toggleAutoPlay = () => {
        setAutoPlayBasicStrategy(!autoPlayBasicStrategy);
    };

    // Function to execute the recommended action
    const executeRecommendedAction = useCallback((action: PlayerAction, dealerUpCard: Card) => {
        if (!action) return;

        switch (action) {
            case 'hit':
                hit();
                break;
            case 'stand':
                stand();
                break;
            case 'double':
                if (canDoubleDown()) {
                    doubleDown();
                } else {
                    hit(); // Fallback if can't double
                }
                break;
            case 'split':
                if (canSplit()) {
                    split();
                } else {
                    // Use next best action based on non-split strategy
                    const playerHand = player.hands[player.activeHandIndex];
                    const nonSplitAction = basicStrategy.getRecommendedAction(
                        playerHand.cards,
                        dealerUpCard,
                        canSurrender(),
                        canDoubleDown(),
                        false // Setting canSplit to false to get non-split recommendation
                    );
                    executeRecommendedAction(nonSplitAction, dealerUpCard);
                }
                break;
            case 'surrender':
                if (canSurrender()) {
                    surrender();
                } else {
                    // Use next best action
                    const playerHand = player.hands[player.activeHandIndex];
                    const nonSurrenderAction = basicStrategy.getRecommendedAction(
                        playerHand.cards,
                        dealerUpCard,
                        false, // Setting canSurrender to false
                        canDoubleDown(),
                        canSplit()
                    );
                    executeRecommendedAction(nonSurrenderAction, dealerUpCard);
                }
                break;
            default:
                // Default to standing if no valid action
                stand();
        }
    }, [hit, stand, doubleDown, split, surrender, canDoubleDown, canSplit, canSurrender, player.hands, player.activeHandIndex]);

    // Automatic strategy suggestion calculation
    useEffect(() => {
        if (gamePhase !== 'playerTurn' || !dealerHand?.cards?.[0] || !player?.hands?.[player.activeHandIndex]) {
            setCurrentSuggestion(null);
            return;
        }

        // Get strategy recommendation
        try {
            const dealerUpCard = dealerHand.cards[0];
            const playerHand = player.hands[player.activeHandIndex];

            const recommendedAction = basicStrategy.getRecommendedAction(
                playerHand.cards,
                dealerUpCard,
                canSurrender(),
                canDoubleDown(),
                canSplit()
            );

            setCurrentSuggestion(recommendedAction);

            // If auto-play is enabled, execute the recommended action
            if (autoPlayBasicStrategy && recommendedAction) {
                executeRecommendedAction(recommendedAction, dealerUpCard);
            }
        } catch (error) {
            console.error('Error calculating strategy suggestion:', error);
            setCurrentSuggestion('error');
        }
    }, [gamePhase, dealerHand, player, autoPlayBasicStrategy, executeRecommendedAction]);

    // Manual strategy suggestion button
    const suggestMove = () => {
        if (gamePhase !== 'playerTurn') {
            sonnerToast('Strategy unavailable', {
                description: 'Strategy suggestions are only available during your turn'
            });
            return;
        }

        const dealerUpCard = dealerHand?.cards?.[0];
        const playerHand = player.hands[player.activeHandIndex];

        if (!dealerUpCard || !playerHand) {
            return;
        }

        try {
            const recommendedAction = basicStrategy.getRecommendedAction(
                playerHand.cards,
                dealerUpCard,
                canSurrender(),
                canDoubleDown(),
                canSplit()
            );

            setCurrentSuggestion(recommendedAction);

            sonnerToast('Strategy Suggestion', {
                description: `Basic strategy recommends: ${recommendedAction ?? 'no action'}`
            });
        } catch (error) {
            console.error('Error suggesting move:', error);
            sonnerToast('Strategy Error', {
                description: 'Unable to calculate strategy recommendation'
            });
        }
    };

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            <div className="flex items-center justify-between p-3 rounded-md bg-slate-800">
                <div>
                    <h3 className="text-sm font-medium text-white">Auto-play Strategy</h3>
                    <p className="text-xs text-slate-400">
                        Let basic strategy make decisions for you
                    </p>
                </div>
                <Switch
                    checked={autoPlayBasicStrategy}
                    onCheckedChange={toggleAutoPlay}
                />
            </div>

            {/* Strategy suggestion display */}
            {gamePhase === 'playerTurn' && (
                <div className="p-3 rounded-md bg-slate-800">
                    <h3 className="text-sm font-medium text-white mb-1">Optimal Strategy</h3>
                    {currentSuggestion ? (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-amber-400 font-medium">
                                Recommended: <span className="capitalize">{currentSuggestion}</span>
                            </p>
                            {!autoPlayBasicStrategy && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-white hover:text-amber-400"
                                    onClick={() => currentSuggestion && executeRecommendedAction(currentSuggestion, dealerHand?.cards?.[0] as Card)}
                                >
                                    Apply
                                </Button>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400">
                            Waiting for your turn...
                        </p>
                    )}
                </div>
            )}

            <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={suggestMove}
                disabled={gamePhase !== 'playerTurn'}
            >
                Suggest Move
            </Button>
        </div>
    );
};

export default AutoStrategyPlayer;