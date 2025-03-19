/**
 * @module useProbabilityEngine
 * @description Custom hook for integrating the probability engine with game state
 */

import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { BlackjackProbabilityEngine, DeckComposition, PlayerDecisionProbabilities, DealerOutcomeProbabilities, HouseEdgeInfo } from '@/lib/utils/ProbabilityEngine';
import { useEnhancedSettingsStore } from '@/store/enhancedSettingsStore';
import { GameRules as StoreGameRules } from '@/types/gameState';
import { GameRules } from '@/types/game';

/**
 * Interface for probability engine hook return values
 */
export interface ProbabilityEngineState {
    /** Whether the engine is ready */
    isReady: boolean;

    /** Current deck composition */
    deckState: DeckComposition | null;

    /** Probabilities for player decisions */
    playerDecisions: PlayerDecisionProbabilities | null;

    /** Probabilities for dealer outcomes */
    dealerOutcomes: DealerOutcomeProbabilities | null;

    /** House edge information */
    houseEdge: HouseEdgeInfo | null;

    /** Current recommended player action */
    recommendedAction: string | null;

    /** Whether the player is making any strategic errors */
    hasStrategyError: boolean;
}

/**
 * Custom hook for using the probability engine with the game state
 */
export const useProbabilityEngine = (): ProbabilityEngineState => {
    // Get game state from store
    const gameState = useGameStore();
    const { gameRules: settingsRules } = useEnhancedSettingsStore();

    // Create a conversion function for converting enhanced settings to game rules
    const convertToEngineRules = (settings: GameRules): StoreGameRules => {
        return {
            decksCount: settings.decksCount || 6,
            dealerHitsSoft17: settings.dealerHitsSoft17 || false,
            blackjackPays: settings.blackjackPayout || 1.5,
            playerCanSurrender: settings.surrender || false,
            canDoubleAfterSplit: settings.doubleAfterSplit || false,
            maxSplitHands: 4, // Default
            canHitSplitAces: false // Default
        };
    };

    // Create the probability engine instance
    const probabilityEngine = useMemo(() => {
        const engineRules = convertToEngineRules(settingsRules);
        return new BlackjackProbabilityEngine(engineRules);
    }, [
        // Dependency array includes all rule properties that would require a new engine
        settingsRules
    ]);

    // Create state for probability data
    const [probState, setProbState] = useState<ProbabilityEngineState>({
        isReady: false,
        deckState: null,
        playerDecisions: null,
        dealerOutcomes: null,
        houseEdge: null,
        recommendedAction: null,
        hasStrategyError: false
    });

    // Update probability engine when cards are dealt
    useEffect(() => {
        if (!gameState.isInitialized) return;

        // Update engine with dealt cards
        probabilityEngine.updateDealtCards(gameState.dealtCards);

        // Get current deck composition
        const deckState = probabilityEngine.getDeckComposition();

        // Get the player's active hand
        const playerHand = gameState.player.hands[gameState.player.activeHandIndex] || null;
        // Get the dealer's visible card
        const dealerVisibleCard = gameState.dealer?.hand?.cards?.[0] || null;

        let playerDecisions = null;
        let dealerOutcomes = null;
        let recommendedAction = null;
        let hasStrategyError = false;

        // Calculate decision probabilities if we have enough information
        if (playerHand && dealerVisibleCard && gameState.gamePhase === 'playerTurn') {
            playerDecisions = probabilityEngine.calculatePlayerDecisionProbabilities(
                playerHand.cards,
                dealerVisibleCard
            );

            dealerOutcomes = probabilityEngine.calculateDealerProbabilities(dealerVisibleCard);

            // Set recommended action
            recommendedAction = playerDecisions.optimalDecision;

            // Check if player is making a strategy error
            // TODO: Implement strategy error detection when lastAction property is available
            // hasStrategyError = playerDecisions.optimalDecision !== gameState.player.lastAction &&
            //     gameState.player.lastAction !== null;
            hasStrategyError = false; // To be implemented
        }

        // Calculate house edge
        const houseEdge = probabilityEngine.calculateHouseEdge();

        // Update state
        setProbState({
            isReady: true,
            deckState,
            playerDecisions,
            dealerOutcomes,
            houseEdge,
            recommendedAction,
            hasStrategyError
        });

    }, [
        gameState.isInitialized,
        gameState.dealtCards,
        gameState.gamePhase,
        gameState.player.hands,
        gameState.player.activeHandIndex,
        gameState.dealer?.hand?.cards,
        probabilityEngine
    ]);

    // Reset probability engine when game resets
    useEffect(() => {
        if (gameState.gamePhase === 'betting' && probState.isReady) {
            probabilityEngine.resetShoe();

            // Get current deck composition after reset
            const deckState = probabilityEngine.getDeckComposition();

            // Calculate house edge
            const houseEdge = probabilityEngine.calculateHouseEdge();

            setProbState({
                isReady: true,
                deckState,
                playerDecisions: null,
                dealerOutcomes: null,
                houseEdge,
                recommendedAction: null,
                hasStrategyError: false
            });
        }
    }, [gameState.gamePhase, probabilityEngine, probState.isReady]);

    // Update engine when game rules change
    useEffect(() => {
        if (settingsRules) {
            const engineRules = convertToEngineRules(settingsRules);
            probabilityEngine.updateGameRules(engineRules);
        }
    }, [
        settingsRules,
        probabilityEngine
    ]);

    return probState;
};