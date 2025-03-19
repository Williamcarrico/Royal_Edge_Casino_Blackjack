import { handUtils } from '@/lib/utils/handUtils';
import { isDefined } from '@/lib/utils/safeAccessUtils';
import { updateCardCounting } from '@/lib/utils/cardCounting';
import { transitionGamePhase } from '@/types/gameStateMachine';
import { GameState, isDealerTurnPhase } from '@/types/gameState';
import { Card, Hand, RoundResult } from '@/lib/utils/gameLogic';

/**
 * Improved implementation of the dealer turn action using our new utilities
 *
 * @param get Function to get the current game state
 * @param set Function to update the game state
 */
export function dealerTurnAction(
    get: () => GameState,
    set: (state: Partial<GameState>) => void
): void {
    const state = get();
    console.log('Dealer turn method called - Current game phase:', state.gamePhase);

    // Validate game state
    if (!validateDealerTurnState(state)) {
        return;
    }

    // Process dealer turn
    processDealerTurn(state, set);
}

/**
 * Validates the game state for dealer turn
 */
function validateDealerTurnState(state: GameState): boolean {
    // Type guard ensures we only proceed if in dealerTurn phase
    if (!isDealerTurnPhase(state)) {
        console.log('Cannot play dealer turn - not in dealer turn phase');
        return false;
    }

    // Make sure we have a dealer hand
    if (!state.dealerHand) {
        console.error('No dealer hand available');
        return false;
    }

    return true;
}

/**
 * Process the dealer's turn
 */
function processDealerTurn(
    state: GameState,
    set: (state: Partial<GameState>) => void
): void {
    // First, reveal dealer's hidden card
    const updatedDealerHand = revealDealerHand(state.dealerHand);

    // Clone current shoe and dealt cards
    const currentShoe = [...state.shoe];
    let dealtCards = [...state.dealtCards];
    let runningCount = state.runningCount;
    let trueCount = state.trueCount;

    // Handle dealer blackjack if present
    if (handUtils.isBlackjack(updatedDealerHand)) {
        handleDealerBlackjack(state, set, updatedDealerHand, currentShoe);
        return;
    }

    // Play the dealer's hand according to rules
    const finalDealerHand = playDealerHandToCompletion(
        updatedDealerHand,
        currentShoe,
        state.gameRules.dealerHitsSoft17
    );

    // Update card counting
    const countingResult = updateDealerCardCounting(
        updatedDealerHand,
        finalDealerHand,
        currentShoe,
        dealtCards,
        runningCount,
        trueCount
    );

    dealtCards = countingResult.dealtCards;
    runningCount = countingResult.runningCount;
    trueCount = countingResult.trueCount;

    // Determine results based on hands
    determineGameResults(state, set, finalDealerHand, currentShoe, runningCount, trueCount, dealtCards);
}

/**
 * Handle dealer blackjack scenario
 */
function handleDealerBlackjack(
    state: GameState,
    set: (state: Partial<GameState>) => void,
    dealerHand: Hand,
    shoe: Card[]
): void {
    const isPlayingSplitHands = isDefined(state.player.hands) && state.player.hands.length > 0;

    if (!isPlayingSplitHands) {
        handleDealerBlackjackVsRegularHand(state, set, dealerHand, shoe);
    } else {
        handleDealerBlackjackVsSplitHands(state, set, dealerHand, shoe);
    }
}

/**
 * Handle dealer blackjack vs regular hand
 */
function handleDealerBlackjackVsRegularHand(
    state: GameState,
    set: (state: Partial<GameState>) => void,
    dealerHand: Hand,
    shoe: Card[]
): void {
    if (!state.playerHand) {
        console.error('No player hand available');
        return;
    }

    const result = handUtils.isBlackjack(state.playerHand) ? 'push' : 'lose';
    const message = handUtils.isBlackjack(state.playerHand) ?
        'Both have Blackjack! Push.' :
        'Dealer has Blackjack! Dealer wins.';

    set({
        dealerHand,
        gamePhase: transitionGamePhase(state.gamePhase, 'settlement', true) as 'settlement',
        roundResult: result,
        message,
        shoe
    });
}

/**
 * Update card counting when dealer draws new cards
 */
function updateDealerCardCounting(
    initialHand: Hand,
    finalHand: Hand,
    shoe: Card[],
    dealtCards: Card[],
    runningCount: number,
    trueCount: number
): { dealtCards: Card[], runningCount: number, trueCount: number } {
    const newCardCount = finalHand.cards.length - initialHand.cards.length;

    if (newCardCount <= 0) {
        return { dealtCards, runningCount, trueCount };
    }

    const newCards = finalHand.cards.slice(-newCardCount);
    const updatedDealtCards = [...dealtCards, ...newCards];

    // Update count for each new card
    let updatedRunningCount = runningCount;
    let updatedTrueCount = trueCount;

    for (const card of newCards) {
        const countUpdate = updateCardCounting(
            updatedRunningCount,
            card,
            shoe.length + newCards.indexOf(card)
        );
        updatedRunningCount = countUpdate.runningCount;
        updatedTrueCount = countUpdate.trueCount;
    }

    return {
        dealtCards: updatedDealtCards,
        runningCount: updatedRunningCount,
        trueCount: updatedTrueCount
    };
}

/**
 * Determine game results after dealer has played
 */
function determineGameResults(
    state: GameState,
    set: (state: Partial<GameState>) => void,
    dealerHand: Hand,
    shoe: Card[],
    runningCount: number,
    trueCount: number,
    dealtCards: Card[]
): void {
    const isPlayingSplitHands = isDefined(state.player.hands) && state.player.hands.length > 0;

    if (!isPlayingSplitHands) {
        handleDealerVsRegularHand(state, set, dealerHand, shoe, runningCount, trueCount, dealtCards);
    } else {
        handleDealerVsSplitHands(state, set, dealerHand, shoe, runningCount, trueCount, dealtCards);
    }
}

/**
 * Reveals the dealer's hidden card
 */
function revealDealerHand(dealerHand: Hand): Hand {
    // Ensure all cards are face up
    const revealedCards = dealerHand.cards.map(card => ({
        ...card,
        isFaceUp: true
    }));

    return {
        ...dealerHand,
        cards: revealedCards
    } as Hand;
}

/**
 * Plays the dealer's hand according to blackjack rules
 */
function playDealerHandToCompletion(
    dealerHand: Hand,
    shoe: Card[],
    dealerHitsSoft17: boolean
): Hand {
    console.log('[playDealerHandToCompletion] Starting with hand:',
        dealerHand.cards.map(c => `${c.rank}${c.suit[0]}`),
        'Values:', dealerHand.values);

    let currentHand = { ...dealerHand };
    let hitCount = 0;
    const MAX_HITS = 10; // Safety limit to prevent infinite loops

    // Define dealer's hit condition with enhanced checks
    const shouldDealerHit = (hand: Hand): boolean => {
        // Safety checks for invalid hand data
        if (!hand || !hand.cards || !hand.values) {
            console.error('[shouldDealerHit] Invalid hand data in dealer logic:', hand);
            return false;
        }

        // Log current hand status for debugging
        console.log('[shouldDealerHit] Evaluating hand:',
            hand.cards.map(c => `${c.rank}${c.suit[0]}`),
            'Values:', hand.values);

        const bestValue = handUtils.getBestValue(hand);

        // Immediate stand for any hand 17 or over
        if (bestValue >= 18) {
            console.log(`[shouldDealerHit] Dealer STANDS with ${bestValue} (>=18)`);
            return false;
        }

        // Check for hard 17 (always stand)
        if (bestValue === 17 && !hand.isSoft) {
            console.log(`[shouldDealerHit] Dealer STANDS with hard 17`);
            return false;
        }

        // Dealer must hit on 16 or lower
        if (bestValue < 17) {
            console.log(`[shouldDealerHit] Dealer HITS with ${bestValue} (< 17)`);
            return true;
        }

        // Soft 17 check - depends on casino rules
        if (bestValue === 17 && hand.isSoft && dealerHitsSoft17) {
            console.log(`[shouldDealerHit] Dealer HITS with soft 17 (rule enabled)`);
            return true;
        }

        // Default to standing
        console.log(`[shouldDealerHit] Dealer STANDS with ${bestValue}`);
        return false;
    };

    // Deal cards to the dealer according to blackjack rules
    while (shouldDealerHit(currentHand) && shoe.length > 0 && hitCount < MAX_HITS) {
        const card = shoe.pop();
        if (!card) {
            console.error('[playDealerHandToCompletion] No card available in shoe');
            break;
        }

        // Ensure card is face up
        const faceUpCard = { ...card, isFaceUp: true };

        // Add card to dealer's hand
        currentHand = handUtils.addCard(currentHand, faceUpCard);
        hitCount++;

        // Log dealer's new hand for debugging
        console.log('[playDealerHandToCompletion] Dealer hit:', {
            cardTaken: `${faceUpCard.rank}${faceUpCard.suit[0]}`,
            newHand: currentHand.cards.map(c => `${c.rank}${c.suit[0]}`),
            values: currentHand.values,
            bestValue: handUtils.getBestValue(currentHand),
            isBusted: currentHand.isBusted,
            isSoft: currentHand.isSoft
        });

        // Break if dealer busted
        if (currentHand.isBusted) {
            console.log('[playDealerHandToCompletion] Dealer busted!');
            break;
        }
    }

    // Final safety check - if we hit the max hits limit
    if (hitCount >= MAX_HITS) {
        console.warn('[playDealerHandToCompletion] Reached maximum number of hits - possible infinite loop prevented');
    }

    // Log final hand
    console.log('[playDealerHandToCompletion] Final dealer hand:',
        currentHand.cards.map(c => `${c.rank}${c.suit[0]}`),
        'Final values:', currentHand.values,
        'Best value:', handUtils.getBestValue(currentHand),
        'Busted:', currentHand.isBusted);

    return currentHand;
}

/**
 * Handle dealer blackjack vs split hands
 */
function handleDealerBlackjackVsSplitHands(
    state: GameState,
    set: (state: Partial<GameState>) => void,
    dealerHand: Hand,
    shoe: Card[]
): void {
    const { player } = state;
    const { hands } = player;

    if (!hands) {
        console.error('No split hands available');
        return;
    }

    // All hands lose against dealer blackjack (except player blackjacks are a push)
    const handResults = hands.map(hand => handUtils.isBlackjack(hand) ? 'push' : 'lose');

    set({
        dealerHand,
        gamePhase: transitionGamePhase(state.gamePhase, 'settlement', true) as 'settlement',
        handResults,
        message: 'Dealer has Blackjack!',
        shoe
    });
}

/**
 * Handle dealer vs regular player hand
 */
function handleDealerVsRegularHand(
    state: GameState,
    set: (state: Partial<GameState>) => void,
    dealerHand: Hand,
    shoe: Card[],
    runningCount: number,
    trueCount: number,
    dealtCards: Card[]
): void {
    if (!state.playerHand) {
        console.error('No player hand available');
        return;
    }

    const playerValue = handUtils.getBestValue(state.playerHand);
    const dealerValue = handUtils.getBestValue(dealerHand);
    let result: RoundResult = null;
    let message = '';

    // Player already busted
    if (state.playerHand.isBusted) {
        result = 'bust';
        message = 'You busted! Dealer wins.';
    }
    // Dealer busted
    else if (dealerHand.isBusted) {
        result = 'win';
        message = 'Dealer busted! You win!';
    }
    // Compare hands
    else if (playerValue > dealerValue) {
        result = 'win';
        message = 'You win!';
    }
    else if (playerValue < dealerValue) {
        result = 'lose';
        message = 'Dealer wins.';
    }
    else {
        result = 'push';
        message = 'Push! It\'s a tie.';
    }

    // Calculate payout based on result
    const payout = calculatePayout(
        state.bet,
        result,
        !!(state.playerHand as { doubled?: boolean }).doubled,
        handUtils.isBlackjack(state.playerHand)
    );

    set({
        dealerHand,
        gamePhase: transitionGamePhase(state.gamePhase, 'settlement', true) as 'settlement',
        roundResult: result,
        message,
        shoe,
        chips: state.chips + payout,
        dealtCards,
        runningCount,
        trueCount
    });
}

/**
 * Handle dealer vs split hands
 */
function handleDealerVsSplitHands(
    state: GameState,
    set: (state: Partial<GameState>) => void,
    dealerHand: Hand,
    shoe: Card[],
    runningCount: number,
    trueCount: number,
    dealtCards: Card[]
): void {
    const { player } = state;
    const { hands } = player;

    if (!hands) {
        console.error('No split hands available');
        return;
    }

    const dealerValue = handUtils.getBestValue(dealerHand);
    const dealerBusted = dealerHand.isBusted;

    // Determine result for each hand
    const handResults: RoundResult[] = hands.map(hand => {
        // If this hand was already busted
        if (hand.isBusted) {
            return 'bust';
        }

        // If dealer busted, hand wins
        if (dealerBusted) {
            return 'win';
        }

        const handValue = handUtils.getBestValue(hand);

        // Compare hand with dealer
        if (handValue > dealerValue) {
            return 'win';
        }
        if (handValue < dealerValue) {
            return 'lose';
        }
        return 'push';
    });

    // Calculate total payout
    let totalPayout = 0;
    for (let i = 0; i < hands.length; i++) {
        const hand = hands[i];
        const result = handResults[i];
        const handBet = (hand as { bet?: number }).bet ?? state.bet;

        totalPayout += calculatePayout(
            handBet,
            result,
            !!(hand as { doubled?: boolean }).doubled,
            handUtils.isBlackjack(hand)
        );
    }

    // Create message based on results
    const winCount = handResults.filter(r => r === 'win').length;
    const lossCount = handResults.filter(r => r === 'lose' || r === 'bust').length;
    const pushCount = handResults.filter(r => r === 'push').length;

    let message = '';
    if (winCount > 0 && lossCount === 0 && pushCount === 0) {
        message = 'All hands win!';
    } else if (lossCount > 0 && winCount === 0 && pushCount === 0) {
        message = 'All hands lose!';
    } else if (pushCount > 0 && winCount === 0 && lossCount === 0) {
        message = 'All hands push!';
    } else {
        message = `${winCount} win, ${lossCount} lose, ${pushCount} push`;
    }

    set({
        dealerHand,
        gamePhase: transitionGamePhase(state.gamePhase, 'settlement', true) as 'settlement',
        handResults,
        message,
        shoe,
        chips: state.chips + totalPayout,
        dealtCards,
        runningCount,
        trueCount
    });
}

/**
 * Calculate payout based on result
 */
function calculatePayout(bet: number, result: RoundResult, isDoubled: boolean, isBlackjack: boolean): number {
    if (result === 'win') {
        // Blackjack typically pays 3:2
        if (isBlackjack) {
            return bet + (bet * 1.5);
        }
        // Normal win pays 1:1, doubled bets are 2x
        return bet + (isDoubled ? bet * 2 : bet);
    }

    if (result === 'push') {
        // Return original bet
        return isDoubled ? bet * 2 : bet;
    }

    // Losses return 0
    return 0;
}