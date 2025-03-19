import { handUtils } from '@/lib/utils/handUtils';
import { updateCardCounting } from '@/lib/utils/cardCounting';
import { GameState, isPlayerTurnPhase } from '@/types/gameState';
import { Card } from '@/lib/utils/gameLogic';

/**
 * Extended Hand type for internal use that includes bet property
 */
interface HandWithBet extends ReturnType<typeof handUtils.createSplitHand> {
    bet?: number;
}

/**
 * Improved implementation of the split action using our new utilities
 *
 * @param get Function to get the current game state
 * @param set Function to update the game state
 */
export function splitAction(
    get: () => GameState,
    set: (state: Partial<GameState>) => void
): void {
    const state = get();
    console.log('Split method called - Current game phase:', state.gamePhase);

    // Type guard ensures we only proceed if in playerTurn phase
    if (!isPlayerTurnPhase(state)) {
        console.log('Cannot split - not player turn phase');
        return;
    }

    // Check if player has enough chips
    if (state.chips < state.bet) {
        console.log('Not enough chips to split');
        set({ message: 'Not enough chips to split!' });
        return;
    }

    // Check if we have a valid hand to split
    if (!state.playerHand || !handUtils.canSplit(state.playerHand)) {
        console.log('Cannot split - invalid hand');
        return;
    }

    // Get cards from the hand
    const [card1, card2] = state.playerHand.cards;

    // Create two new hands using our helper function
    const hand1 = handUtils.createSplitHand(card1, `split-1-${Date.now()}`) as HandWithBet;
    const hand2 = handUtils.createSplitHand(card2, `split-2-${Date.now()}`) as HandWithBet;

    // Clone current shoe
    const currentShoe = [...state.shoe];

    // Deal one card to each hand
    const newCard1 = drawCard(currentShoe);
    const newCard2 = drawCard(currentShoe);

    if (!newCard1 || !newCard2) {
        console.error('Not enough cards left in shoe');
        return;
    }

    // Add cards to hands
    const updatedHand1 = handUtils.addCard(hand1, newCard1) as HandWithBet;
    const updatedHand2 = handUtils.addCard(hand2, newCard2) as HandWithBet;

    // Add bet amount to each hand
    updatedHand1.bet = state.bet;
    updatedHand2.bet = state.bet;

    // Update card counting values
    let runningCount = state.runningCount;

    // Update for first card
    const countResult1 = updateCardCounting(runningCount, newCard1, currentShoe.length + 1);
    runningCount = countResult1.runningCount;

    // Update for second card
    const countResult2 = updateCardCounting(runningCount, newCard2, currentShoe.length);
    runningCount = countResult2.runningCount;
    const trueCount = countResult2.trueCount;

    // Update state
    set({
        shoe: currentShoe,
        playerHand: undefined, // Clear single hand
        player: {
            ...state.player,
            hands: [updatedHand1, updatedHand2],
            activeHandIndex: 0 // Start with first hand
        },
        chips: state.chips - state.bet, // Deduct additional bet
        message: 'Cards split! Playing first hand.',
        dealtCards: [...state.dealtCards, newCard1, newCard2],
        runningCount,
        trueCount
    });
}

/**
 * Helper function to draw a card from the shoe
 */
function drawCard(shoe: Card[]): Card | undefined {
    return shoe.pop();
}