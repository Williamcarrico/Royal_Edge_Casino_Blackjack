import { isDefined } from '@/lib/utils/safeAccessUtils';
import { updateGamePhase, updateGameMessage } from '@/lib/utils/actionUtils';
import { GameState, isPlayerTurnPhase } from '@/types/gameState';

/**
 * Improved implementation of the stand action using our new utilities
 *
 * @param get Function to get the current game state
 * @param set Function to update the game state
 */
export function standAction(
    get: () => GameState,
    set: (state: Partial<GameState>) => void
): void {
    const state = get();
    console.log('Stand method called - Current game phase:', state.gamePhase);

    // Type guard ensures we only proceed if in playerTurn phase
    if (!isPlayerTurnPhase(state)) {
        console.log('Cannot stand - not player turn phase');
        return;
    }

    // Check if we're playing with regular hand or split hands
    const isPlayingSplitHands = isDefined(state.player.hands) && state.player.hands.length > 0;

    if (!isPlayingSplitHands) {
        handleRegularHandStand(state, set);
    } else {
        handleSplitHandsStand(state, set);
    }
}

/**
 * Handle stand action for a regular hand
 */
function handleRegularHandStand(
    state: GameState,
    set: (state: Partial<GameState>) => void
): void {
    // Use the utility function to update game phase
    const phaseUpdate = updateGamePhase(state.gamePhase, 'dealerTurn', state);
    const messageUpdate = updateGameMessage('Dealer\'s turn', state);

    // Combine updates and set state
    set({
        ...phaseUpdate,
        ...messageUpdate
    } as Partial<GameState>);
}

/**
 * Handle stand action for split hands
 */
function handleSplitHandsStand(
    state: GameState,
    set: (state: Partial<GameState>) => void
): void {
    const { player } = state;
    const { hands, activeHandIndex } = player;

    // Safety check for valid active hand
    if (!isDefined(activeHandIndex) || activeHandIndex < 0 || !isDefined(hands)) {
        console.error('Invalid active hand index for split hands');
        return;
    }

    // Check if this is the last hand
    if (activeHandIndex >= hands.length - 1) {
        // No more hands, move to dealer turn using utility functions
        const phaseUpdate = updateGamePhase(state.gamePhase, 'dealerTurn', state);
        const messageUpdate = updateGameMessage('Dealer\'s turn', state);

        set({
            ...phaseUpdate,
            ...messageUpdate
        } as Partial<GameState>);
    } else {
        // Move to next hand
        const nextHandIndex = activeHandIndex + 1;
        const messageUpdate = updateGameMessage(`Now playing hand ${nextHandIndex + 1}`, state);

        set({
            player: {
                ...state.player,
                activeHandIndex: nextHandIndex
            },
            ...messageUpdate
        });
    }
}