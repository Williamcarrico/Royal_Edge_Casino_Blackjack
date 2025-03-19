import { handUtils } from '@/lib/utils/handUtils';
import { isDefined } from '@/lib/utils/safeAccessUtils';
import { updateCardCounting } from '@/lib/utils/cardCounting';
import { transitionGamePhase } from '@/types/gameStateMachine';
import { GameState, isPlayerTurnPhase } from '@/types/gameState';
import { Card } from '@/lib/utils/gameLogic';

/**
 * Improved implementation of the hit action using our new utilities
 *
 * @param get Function to get the current game state
 * @param set Function to update the game state
 */
export function hitAction(
    get: () => GameState,
    set: (state: Partial<GameState>) => void
): void {
    const state = get();
    console.log('Hit method called - Current game phase:', state.gamePhase);

    // Type guard ensures we only proceed if in playerTurn phase
    if (!isPlayerTurnPhase(state)) {
        console.log('Cannot hit - not player turn phase');
        return;
    }

    // Check if we're playing with regular hand or split hands
    const isPlayingSplitHands = isDefined(state.player.hands) && state.player.hands.length > 0;

    if (!isPlayingSplitHands) {
        handleRegularHandHit(state, set);
    } else {
        handleSplitHandsHit(state, set);
    }
}

/**
 * Handle hit action for a regular hand
 */
function handleRegularHandHit(
    state: GameState,
    set: (state: Partial<GameState>) => void
): void {
    // Regular hand play
    const { playerHand, shoe } = state;
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
    const updatedHand = handUtils.addCard(playerHand, card);

    // Prepare update object
    let newGamePhase = state.gamePhase;
    let message = 'Your turn. Hit or Stand?';
    let roundResult: 'bust' | undefined = undefined;

    // Check if player busted
    if (updatedHand.isBusted) {
        message = 'Bust! You went over 21.';
        // Safely transition to settlement phase
        newGamePhase = transitionGamePhase(state.gamePhase, 'settlement', true);
        roundResult = 'bust';
    }

    // Update card counting values
    const { runningCount: newRunningCount, trueCount: newTrueCount } =
        updateCardCounting(state.runningCount, card, currentShoe.length);

    // Update state
    set({
        shoe: currentShoe,
        playerHand: updatedHand,
        gamePhase: newGamePhase,
        message,
        roundResult,
        dealtCards: [...state.dealtCards, card],
        runningCount: newRunningCount,
        trueCount: newTrueCount
    } as Partial<GameState>);
}

/**
 * Handle hit action for split hands
 */
function handleSplitHandsHit(
    state: GameState,
    set: (state: Partial<GameState>) => void
): void {
    // Split hands play
    const { player, shoe } = state;
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
    const updatedActiveHand = handUtils.addCard(activeHand, card);
    updatedHands[activeHandIndex] = updatedActiveHand;

    // Determine next action based on hand state
    let newActiveIndex = activeHandIndex;
    let newGamePhase = state.gamePhase;
    let message = 'Your turn. Hit or Stand?';
    const handResults = state.handResults || [];

    if (updatedActiveHand.isBusted) {
        // Hand busted
        const newHandResults = [...handResults];
        newHandResults[activeHandIndex] = 'bust';

        // Check if we have more hands to play
        if (activeHandIndex < updatedHands.length - 1) {
            newActiveIndex = activeHandIndex + 1;
            message = `Now playing hand ${newActiveIndex + 1}`;
        } else {
            // No more hands, move to dealer turn
            newGamePhase = transitionGamePhase(state.gamePhase, 'dealerTurn', true);
            message = 'Dealer\'s turn';
        }

        // Update hand results in state
        set({ handResults: newHandResults });
    } else if (handUtils.getBestValue(updatedActiveHand) === 21) {
        // Hand has 21, move to next hand

        // Check if we have more hands to play
        if (activeHandIndex < updatedHands.length - 1) {
            newActiveIndex = activeHandIndex + 1;
            message = `Now playing hand ${newActiveIndex + 1}`;
        } else {
            // No more hands, move to dealer turn
            newGamePhase = transitionGamePhase(state.gamePhase, 'dealerTurn', true);
            message = 'Dealer\'s turn';
        }
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
        dealtCards: [...state.dealtCards, card],
        runningCount: newRunningCount,
        trueCount: newTrueCount
    } as Partial<GameState>);
}

/**
 * Helper function to draw a card from the shoe
 */
function drawCard(shoe: Card[]): Card | undefined {
    return shoe.pop();
}