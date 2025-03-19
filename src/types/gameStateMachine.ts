/**
 * Represents all possible game phases in the blackjack game
 */
export type GamePhase = 'betting' | 'playerTurn' | 'dealerTurn' | 'settlement' | 'completed';

/**
 * Valid transitions between game phases
 */
export const gamePhaseTransitions: Record<GamePhase, GamePhase[]> = {
    'betting': ['playerTurn'],
    'playerTurn': ['dealerTurn', 'settlement'],
    'dealerTurn': ['settlement'],
    'settlement': ['completed'],
    'completed': ['betting']
};

/**
 * Actions allowed in each game phase
 */
export const allowedActions: Record<GamePhase, string[]> = {
    'betting': ['placeBet', 'increaseBet', 'clearBet', 'placeSideBet', 'clearSideBet', 'dealCards'],
    'playerTurn': ['hit', 'stand', 'doubleDown', 'split', 'surrender', 'takeInsurance'],
    'dealerTurn': ['playDealer'],
    'settlement': ['endRound'],
    'completed': ['resetRound', 'resetGame']
};

/**
 * Type guard to ensure a phase transition is valid
 */
export function isValidTransition(current: GamePhase, next: GamePhase): boolean {
    return gamePhaseTransitions[current].includes(next);
}

/**
 * Safe phase transition function
 */
export function transitionGamePhase(
    current: GamePhase,
    next: GamePhase,
    forceTransition = false
): GamePhase {
    if (forceTransition || isValidTransition(current, next)) {
        return next;
    }
    console.warn(`Invalid game phase transition from ${current} to ${next}`);
    return current;
}

/**
 * Check if an action is allowed in the current game phase
 */
export function isActionAllowed(phase: GamePhase, action: string): boolean {
    return allowedActions[phase].includes(action);
}

/**
 * Type for valid game phase transitions
 */
export type ValidTransitions = {
    [K in GamePhase]: GamePhase[];
};

/**
 * Type for game actions that are available in each phase
 */
export type AvailableActions = {
    [K in GamePhase]: string[];
};

/**
 * Get the next phase based on game state
 */
export function getNextPhase(
    currentPhase: GamePhase,
    isDealerBlackjack: boolean,
    isPlayerBlackjack: boolean,
    isPlayerBusted: boolean
): GamePhase {
    if (currentPhase === 'betting') {
        return 'playerTurn';
    }

    if (currentPhase === 'playerTurn') {
        if (isPlayerBusted) {
            return 'settlement';
        }
        if (isPlayerBlackjack && !isDealerBlackjack) {
            return 'settlement';
        }
        return 'dealerTurn';
    }

    if (currentPhase === 'dealerTurn') {
        return 'settlement';
    }

    if (currentPhase === 'settlement') {
        return 'completed';
    }

    return 'betting';
}