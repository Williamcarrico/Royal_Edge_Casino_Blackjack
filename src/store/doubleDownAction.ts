import { handUtils } from '@/lib/utils/handUtils';
import { isDefined } from '@/lib/utils/safeAccessUtils';
import { updateCardCounting } from '@/lib/utils/cardCounting';
import { transitionGamePhase } from '@/types/gameStateMachine';
import { GameState, isPlayerTurnPhase } from '@/types/gameState';
import { Card, Hand } from '@/lib/utils/gameLogic';

/**
 * Improved implementation of the double down action using our new utilities
 *
 * @param get Function to get the current game state
 * @param set Function to update the game state
 */
export function doubleDownAction(
    get: () => GameState,
    set: (state: Partial<GameState>) => void
): void {
    const state = get();
    console.log('Double down method called - Current game phase:', state.gamePhase);

    // Type guard ensures we only proceed if in playerTurn phase
    if (!isPlayerTurnPhase(state)) {
        console.log('Cannot double down - not player turn phase');
        return;
    }

    // Check if player has enough chips
    if (state.chips < state.bet) {
        console.log('Not enough chips to double down');
        set({ message: 'Not enough chips to double down!' });
        return;
    }

    // Check if we're playing with regular hand or split hands
    const isPlayingSplitHands = isDefined(state.player.hands) && state.player.hands.length > 0;

    if (!isPlayingSplitHands) {
        handleRegularHandDoubleDown(state, set);
    } else {
        handleSplitHandsDoubleDown(state, set);
    }
}

/**
 * Handle double down action for a regular hand
 */
function handleRegularHandDoubleDown(
    state: GameState,
    set: (state: Partial<GameState>) => void
): void {
    const { playerHand, bet, chips, shoe } = state;
    if (!playerHand) {
        console.error('No player hand available');
        return;
    }

    // Deal one card from the shoe
    const currentShoe = [...shoe];
    const card = drawCard(currentShoe);

    if (!card) {
        console.error('No cards left in shoe');
        return;
    }

    // Use our helper to add card to hand
    const updatedHand = {
        ...handUtils.addCard(playerHand, card),
        doubled: true // Mark the hand as doubled
    } as Hand & { doubled: boolean };

    // Update card counting values
    const { runningCount: newRunningCount, trueCount: newTrueCount } =
        updateCardCounting(state.runningCount, card, currentShoe.length);

    // Update state - double bet and move to dealer turn
    set({
        shoe: currentShoe,
        playerHand: updatedHand,
        gamePhase: transitionGamePhase(state.gamePhase, 'dealerTurn', true),
        message: 'Double Down! Dealer\'s turn',
        bet: bet * 2,
        chips: chips - bet,
        dealtCards: [...state.dealtCards, card],
        runningCount: newRunningCount,
        trueCount: newTrueCount
    });
}

/**
 * Handle double down action for split hands
 */
function handleSplitHandsDoubleDown(
    state: GameState,
    set: (state: Partial<GameState>) => void
): void {
    const { player, bet, chips, shoe } = state;
    const { hands, activeHandIndex } = player;

    // Safety check for valid active hand
    if (!isDefined(activeHandIndex) || activeHandIndex < 0 || !isDefined(hands) || !hands[activeHandIndex]) {
        console.error('Invalid active hand index for split hands');
        return;
    }

    // Deal one card from the shoe
    const currentShoe = [...shoe];
    const card = drawCard(currentShoe);

    if (!card) {
        console.error('No cards left in shoe');
        return;
    }

    // Clone hands array to avoid direct state mutation
    const updatedHands = [...hands];
    const activeHand = updatedHands[activeHandIndex];

    // Use our helper to add card to active hand
    const updatedActiveHand = {
        ...handUtils.addCard(activeHand, card),
        doubled: true, // Mark the hand as doubled
        bet: ((activeHand as { bet?: number }).bet ?? bet) * 2 // Double the bet for this hand
    } as Hand & { doubled: boolean; bet: number };

    // Replace the active hand with the updated one
    updatedHands[activeHandIndex] = updatedActiveHand;

    // Determine next action
    let newActiveIndex = activeHandIndex;
    let newGamePhase = state.gamePhase;
    let message;

    if (activeHandIndex >= updatedHands.length - 1) {
        // No more hands, move to dealer turn
        newGamePhase = transitionGamePhase(state.gamePhase, 'dealerTurn', true);
        message = 'Double Down! Dealer\'s turn';
    } else {
        // Move to next hand
        newActiveIndex = activeHandIndex + 1;
        message = `Double Down! Now playing hand ${newActiveIndex + 1}`;
    }

    // Update card counting values
    const { runningCount: newRunningCount, trueCount: newTrueCount } =
        updateCardCounting(state.runningCount, card, currentShoe.length);

    // Update state
    set({
        shoe: currentShoe,
        player: {
            ...state.player,
            hands: updatedHands,
            activeHandIndex: newActiveIndex
        },
        gamePhase: newGamePhase,
        message,
        chips: chips - bet, // Deduct additional bet
        dealtCards: [...state.dealtCards, card],
        runningCount: newRunningCount,
        trueCount: newTrueCount
    });
}

/**
 * Helper function to draw a card from the shoe
 */
function drawCard(shoe: Card[]): Card | undefined {
    return shoe.pop();
}