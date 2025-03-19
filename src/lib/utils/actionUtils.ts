/**
 * @module actionUtils
 * @description Common utilities for store actions to reduce redundant code
 */

import { GamePhase } from '@/lib/utils/gameLogic';
import { GameState, GameStats } from '@/types/gameState';

/**
 * Updates the game phase and handles common state changes for the transition
 *
 * @param currentPhase Current game phase
 * @param newPhase New game phase to transition to
 * @param state Current game state
 * @returns Partial game state with updates for the transition
 */
export function updateGamePhase(
    currentPhase: GamePhase,
    newPhase: GamePhase,
    state: GameState
): Partial<GameState> {
    // Common updates for all phase transitions
    const updates: Partial<GameState> = {
        gamePhase: newPhase,
        // Log the transition in action history
        actionHistory: [...state.actionHistory, `Phase transition: ${currentPhase} → ${newPhase}`]
    };

    // Phase-specific transitions
    if (newPhase === 'playerTurn') {
        // Enable/disable appropriate actions for player turn
        // Allow double down when the player has exactly 2 cards OR
        // when it's a hand where doubling would be strategically correct
        // (based on the specific hand value and dealer's up card)
        const handValue = state.playerHand ? Math.max(...state.playerHand.values.filter(v => v <= 21)) : 0;
        const dealerUpCardValue = state.dealerHand?.cards[0]?.value || 0;

        // Cards.length === 2 is the traditional rule (only double on first two cards)
        const isFirstTwoCards = state.playerHand?.cards.length === 2;

        // Additional conditions for allowing double in special scenarios
        // Hard 9-11 against dealer's 2-6 can be strategic to double on
        const isStrategicDoubleScenario =
            (handValue >= 9 && handValue <= 11) &&
            (dealerUpCardValue >= 2 && dealerUpCardValue <= 6);

        updates.isDoubleDownAvailable =
            (isFirstTwoCards || isStrategicDoubleScenario) &&
            state.chips >= state.bet;

        updates.isSplitAvailable = state.playerHand?.canSplit && state.chips >= state.bet;
    }
    else if (newPhase === 'dealerTurn') {
        // Disable player actions during dealer turn
        updates.isDoubleDownAvailable = false;
        updates.isSplitAvailable = false;

        // Reveal all dealer cards
        if (state.dealer && state.dealer.hand) {
            updates.dealer = {
                ...state.dealer,
                isRevealed: true
            };
        }
    }
    else if (newPhase === 'settlement') {
        // When entering settlement, update game stats
        if (state.gameStats) {
            updates.gameStats = {
                ...state.gameStats,
                handsPlayed: state.gameStats.handsPlayed + 1
            };
        }
    }

    return updates;
}

/**
 * Updates a message with default formatting and adds it to the message log
 *
 * @param message The message to add
 * @param state Current game state
 * @returns Partial game state with message updates
 */
export function updateGameMessage(
    message: string,
    state: GameState
): Partial<GameState> {
    return {
        message,
        messageLog: [...state.messageLog, message]
    };
}

/**
 * Utility to safely access nested objects without throwing errors
 *
 * @param obj The object to access
 * @param path Path to the desired property
 * @param defaultValue Default value if path doesn't exist
 * @returns The value at the path or defaultValue if not found
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
        if (result === undefined || result === null) {
            return defaultValue;
        }
        result = result[key];
    }

    return (result === undefined || result === null) ? defaultValue : result as T;
}