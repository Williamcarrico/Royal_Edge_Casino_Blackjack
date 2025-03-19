'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    useGameStore,
    useDealerHand,
    usePlayerHand,
    useGamePhase
} from '@/store/hooks/useGameStore';
import { useGameVariantSettings } from '@/hooks/useSettingsStore';
import { BasicStrategy, PlayerAction } from '@/lib/utils/basicStrategy';
import { Card } from '@/lib/utils/gameLogic';
import { Button } from '@/ui/layout/button';
import { cn } from '@/lib/utils';

interface StrategyAdvisorProps {
    className?: string;
    showDetailedExplanation?: boolean;
}

/**
 * Strategy advisor component for displaying optimal blackjack play
 * based on current game state and basic strategy.
 */
export const StrategyAdvisor: React.FC<StrategyAdvisorProps> = ({
    className,
    showDetailedExplanation = true
}) => {
    // Get current game state using individual selectors for better performance
    const gamePhase = useGamePhase();
    const dealerHand = useDealerHand();
    const playerHand = usePlayerHand();
    const activeHandIndex = useGameStore(state => state.activeHandIndex);
    const playerHands = useGameStore(state => state.playerHands);

    // Get actions from store
    const hit = useGameStore(state => state.hit);
    const stand = useGameStore(state => state.stand);
    const doubleDown = useGameStore(state => state.doubleDown);
    const split = useGameStore(state => state.split);
    const surrender = useGameStore(state => state.surrender);

    // Get available action flags
    const canDoubleDown = useGameStore(state => state.canDoubleDown);
    const canSplit = useGameStore(state => state.canSplit);
    const canSurrender = useGameStore(state => state.canSurrender);

    // Get game rules
    const { gameRules } = useGameVariantSettings();

    // Create BasicStrategy instance with current rules
    const [basicStrategy] = useState(() => new BasicStrategy(gameRules));

    // Update strategy when rules change
    useEffect(() => {
        basicStrategy.updateRules(gameRules);
    }, [gameRules, basicStrategy]);

    // State for current recommendation
    const [recommendation, setRecommendation] = useState<PlayerAction>(null);
    const [explanation, setExplanation] = useState<string>('');

    // Determine if we're in player's turn
    const isPlayerTurn = gamePhase === 'playerTurn';

    // Get card explanations based on hand composition
    const getCardDescription = useCallback((cards: Card[]) => {
        if (!cards || cards.length === 0) return 'no cards';

        if (cards.length === 2 && cards[0].rank === cards[1].rank) {
            return `pair of ${cards[0].rank}s`;
        }

        const hasAce = cards.some(card => card.rank === 'A');
        const total = cards.reduce((sum, card) => sum + card.value, 0);

        if (hasAce && total <= 21 && total + 10 <= 21) {
            return `soft ${total + 10}`;
        }

        return `hard ${total}`;
    }, []);

    // Generate detailed explanation of the recommendation
    const generateExplanation = useCallback((action: PlayerAction, playerCards: Card[], dealerCard: Card) => {
        if (!playerCards || !dealerCard || !action) return '';

        const playerDesc = getCardDescription(playerCards);
        const dealerDesc = `${dealerCard.rank}`;

        switch (action) {
            case 'hit':
                return `Basic strategy recommends to hit with ${playerDesc} against dealer's ${dealerDesc}.`;
            case 'stand':
                return `Basic strategy recommends to stand with ${playerDesc} against dealer's ${dealerDesc}.`;
            case 'double':
                return `Basic strategy recommends to double down with ${playerDesc} against dealer's ${dealerDesc}.`;
            case 'split':
                return `Basic strategy recommends to split your ${playerDesc} against dealer's ${dealerDesc}.`;
            case 'surrender':
                return `Basic strategy recommends to surrender your ${playerDesc} against dealer's ${dealerDesc}.`;
            default:
                return '';
        }
    }, [getCardDescription]);

    // Calculate the optimal strategy for current game state
    const calculateStrategy = useCallback(() => {
        if (!isPlayerTurn || !dealerHand?.cards?.[0]) {
            setRecommendation(null);
            setExplanation('');
            return;
        }

        // Get the relevant hand (could be a split hand)
        const activeHand = playerHands && playerHands.length > 0
            ? playerHands[activeHandIndex ?? 0]
            : playerHand;

        if (!activeHand?.cards?.length) {
            setRecommendation(null);
            setExplanation('');
            return;
        }

        // Get dealer's up card
        const dealerUpCard = dealerHand.cards[0];

        try {
            console.log('Calculating optimal strategy for:', {
                playerCards: activeHand.cards.map(c => `${c.rank}${c.suit}`),
                dealerUpCard: `${dealerUpCard.rank}${dealerUpCard.suit}`,
                canSurrender: canSurrender ? canSurrender() : false,
                canDouble: canDoubleDown ? canDoubleDown() : false,
                canSplit: canSplit ? canSplit() : false
            });

            // Get recommendation
            const action = basicStrategy.getRecommendedAction(
                activeHand.cards,
                dealerUpCard,
                canSurrender ? canSurrender() : false,
                canDoubleDown ? canDoubleDown() : false,
                canSplit ? canSplit() : false
            );

            setRecommendation(action);

            // Generate explanation
            if (showDetailedExplanation) {
                const actionExplanation = generateExplanation(action, activeHand.cards, dealerUpCard);
                setExplanation(actionExplanation);
            }

            console.log('Strategy recommendation:', action);
        } catch (error) {
            console.error('Error calculating strategy:', error);
            setRecommendation(null);
            setExplanation('Strategy calculation error');
        }
    }, [
        isPlayerTurn,
        dealerHand,
        playerHand,
        playerHands,
        activeHandIndex,
        canDoubleDown,
        canSplit,
        canSurrender,
        basicStrategy,
        generateExplanation,
        showDetailedExplanation
    ]);

    // Calculate strategy whenever relevant state changes
    useEffect(() => {
        calculateStrategy();
    }, [
        calculateStrategy,
        gamePhase,
        dealerHand,
        playerHand,
        playerHands,
        activeHandIndex
    ]);

    // Execute the recommended action
    const executeRecommendedAction = useCallback(() => {
        if (!recommendation || !isPlayerTurn) return;

        try {
            switch (recommendation) {
                case 'hit':
                    hit();
                    break;
                case 'stand':
                    stand();
                    break;
                case 'double':
                    if (canDoubleDown && canDoubleDown()) {
                        doubleDown();
                    } else {
                        hit(); // Fallback if can't double
                    }
                    break;
                case 'split':
                    if (canSplit && canSplit()) {
                        split();
                    } else {
                        hit(); // Fallback if can't split
                    }
                    break;
                case 'surrender':
                    if (canSurrender && canSurrender()) {
                        surrender();
                    } else {
                        hit(); // Fallback if can't surrender
                    }
                    break;
                default:
                    // Default to standing if no valid action
                    stand();
            }
        } catch (error) {
            console.error('Error executing recommended action:', error);
        }
    }, [
        recommendation,
        isPlayerTurn,
        hit,
        stand,
        doubleDown,
        split,
        surrender,
        canDoubleDown,
        canSplit,
        canSurrender
    ]);

    // If not player turn or no recommendation, don't render
    if (!isPlayerTurn) {
        return null;
    }

    // Render recommendation and explanation
    return (
        <div className={cn(
            "p-3 rounded-md bg-blue-900/40 backdrop-blur-sm transition-all",
            !recommendation && "opacity-50",
            className
        )}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white">Optimal Strategy</h3>
                {recommendation && (
                    <Button
                        size="sm"
                        variant="secondary"
                        className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={executeRecommendedAction}
                    >
                        Apply
                    </Button>
                )}
            </div>

            {recommendation ? (
                <div className="space-y-1">
                    <p className="text-amber-400 font-medium">
                        Recommended: <span className="capitalize">{recommendation}</span>
                    </p>
                    {showDetailedExplanation && explanation && (
                        <p className="text-xs text-gray-300">{explanation}</p>
                    )}
                </div>
            ) : (
                <p className="text-xs text-gray-400">
                    Waiting for cards...
                </p>
            )}
        </div>
    );
};

export default StrategyAdvisor;