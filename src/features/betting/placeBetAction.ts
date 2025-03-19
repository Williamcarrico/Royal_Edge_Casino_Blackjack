import { isActionAllowed } from '@/types/gameStateMachine';
import { GameState, isBettingPhase } from '@/types/gameState';

/**
 * Improved implementation of the place bet action using our new utilities
 *
 * @param get Function to get the current game state
 * @param set Function to update the game state
 * @param amount The amount to bet
 */
export function placeBetAction(
    get: () => GameState,
    set: (state: Partial<GameState>) => void,
    amount: number
): void {
    const state = get();

    // Type guard ensures we only proceed if in betting phase
    if (!isBettingPhase(state)) {
        console.log('Cannot place bet - not in betting phase');
        return;
    }

    // Ensure the action is allowed in the current phase
    if (!isActionAllowed(state.gamePhase, 'placeBet')) {
        console.log('Placing bet is not allowed in the current game phase');
        return;
    }

    // Validate bet amount
    if (amount <= 0) {
        console.log('Invalid bet amount - must be greater than 0');
        set({ message: 'Bet amount must be greater than 0' });
        return;
    }

    if (amount > state.chips) {
        console.log('Not enough chips for the bet');
        set({ message: 'Not enough chips for this bet!' });
        return;
    }

    // Update state with the new bet
    set({
        bet: amount,
        chips: state.chips - amount,
        message: 'Bet placed! Press Deal to start.'
    });
}

/**
 * Increase an existing bet
 */
export function increaseBetAction(
    get: () => GameState,
    set: (state: Partial<GameState>) => void,
    amount: number
): void {
    const state = get();

    // Type guard ensures we only proceed if in betting phase
    if (!isBettingPhase(state)) {
        console.log('Cannot increase bet - not in betting phase');
        return;
    }

    // Validate increase amount
    if (amount <= 0) {
        console.log('Invalid bet increase - must be greater than 0');
        return;
    }

    if (amount > state.chips) {
        console.log('Not enough chips to increase bet');
        set({ message: 'Not enough chips to increase bet!' });
        return;
    }

    // Update state with the increased bet
    set({
        bet: state.bet + amount,
        chips: state.chips - amount,
        message: `Bet increased to ${state.bet + amount}!`
    });
}

/**
 * Clear the current bet
 */
export function clearBetAction(
    get: () => GameState,
    set: (state: Partial<GameState>) => void
): void {
    const state = get();

    // Type guard ensures we only proceed if in betting phase
    if (!isBettingPhase(state)) {
        console.log('Cannot clear bet - not in betting phase');
        return;
    }

    // Return the chips and clear the bet
    set({
        bet: 0,
        chips: state.chips + state.bet,
        message: 'Bet cleared. Place your bet!'
    });
}