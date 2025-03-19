/**
 * Dealer Turn Service
 *
 * Handles the dealer's turn logic for automatic play according to blackjack rules.
 */

import {
    Card,
    Hand,
    GameRules,
    RoundResult,
    dealCard,
    addCardToHand,
    calculateHandValues,
    getBestHandValue,
    shouldDealerHit,
    determineRoundResult
} from './gameLogic';
import { performanceMetrics } from './performance';

/**
 * Configuration for dealer play behavior
 */
interface DealerPlayConfig {
    dealDelay?: number;       // Delay between dealing cards in ms
    animationsEnabled?: boolean;
    dealerHitsSoft17?: boolean; // Override the rule from game settings
}

/**
 * Result of dealer's turn
 */
export interface DealerPlayResult {
    updatedDealerHand: Hand;
    roundResult: RoundResult;
    dealtCards: Card[];
}

/**
 * Creates a promise that resolves after a delay
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute the dealer's turn according to blackjack rules
 */
export async function playDealerTurn(
    dealerHand: Hand,
    playerHand: Hand,
    deck: Card[],
    gameRules: GameRules,
    config: DealerPlayConfig = {}
): Promise<DealerPlayResult> {
    performanceMetrics.recordCalculation('playDealerTurn', 0);
    const startTime = performance.now();

    // Use provided config or defaults
    const {
        dealDelay = 800,
        animationsEnabled = true,
        dealerHitsSoft17 = gameRules.dealerHitsSoft17
    } = config;

    // Make a deep copy of provided objects to avoid mutations
    let currentDeck = [...deck];
    let currentDealerHand = { ...dealerHand, cards: [...dealerHand.cards] };
    const dealtCards: Card[] = [];

    // First, flip the dealer's hole card face up if it's not already
    if (currentDealerHand.cards.length > 0 && !currentDealerHand.cards[1]?.isFaceUp) {
        currentDealerHand.cards[1] = {
            ...currentDealerHand.cards[1],
            isFaceUp: true
        };
    }

    // Recalculate dealer's hand value after flipping cards
    currentDealerHand.values = calculateHandValues(currentDealerHand.cards);
    currentDealerHand.isBlackjack =
        currentDealerHand.cards.length === 2 &&
        getBestHandValue(currentDealerHand.values) === 21;

    // Add a small delay for the hole card reveal
    if (animationsEnabled) await delay(dealDelay);

    // Check for dealer blackjack - if dealer has blackjack, round is over
    if (currentDealerHand.isBlackjack) {
        const roundResult = playerHand.isBlackjack ? 'push' : 'lose';

        const endTime = performance.now();
        performanceMetrics.recordCalculation('playDealerTurn', endTime - startTime);

        return {
            updatedDealerHand: currentDealerHand,
            roundResult,
            dealtCards
        };
    }

    // Check if player busted - if player busted, dealer doesn't need to play
    if (playerHand.isBusted) {
        const endTime = performance.now();
        performanceMetrics.recordCalculation('playDealerTurn', endTime - startTime);

        return {
            updatedDealerHand: currentDealerHand,
            roundResult: 'lose',
            dealtCards
        };
    }

    // Create rules object for the shouldDealerHit function
    const rules = {
        ...gameRules,
        dealerHitsOnSoft17: dealerHitsSoft17
    } as unknown as Parameters<typeof shouldDealerHit>[1]; // Type assertion with more specificity

    // Dealer plays according to rules (usually hits until 17 or higher)
    while (shouldDealerHit(currentDealerHand, rules)) {
        // Deal a card to the dealer
        const [newCard, updatedDeck] = dealCard(currentDeck, true);
        currentDeck = updatedDeck;
        dealtCards.push(newCard);

        // Add card to dealer's hand
        currentDealerHand = addCardToHand(currentDealerHand, newCard);

        // Add delay between cards for animation
        if (animationsEnabled) await delay(dealDelay);

        // Check if dealer busted
        if (currentDealerHand.isBusted) break;
    }

    // Determine the round result
    const roundResult = determineRoundResult(playerHand, currentDealerHand);

    const endTime = performance.now();
    performanceMetrics.recordCalculation('playDealerTurn', endTime - startTime);

    return {
        updatedDealerHand: currentDealerHand,
        roundResult,
        dealtCards
    };
}

/**
 * Creates a simulated dealer hand for testing
 */
function createDealerHandForSimulation(dealerUpCard: Card, holeCard: Card): Hand {
    const hand: Hand = {
        id: 'simulation-dealer',
        cards: [dealerUpCard, holeCard],
        values: [],
        isBlackjack: false,
        canSplit: false,
        isBusted: false,
        isSoft: false
    };

    // Calculate dealer values
    hand.values = calculateHandValues(hand.cards);
    hand.isBlackjack = hand.cards.length === 2 && getBestHandValue(hand.values) === 21;

    return hand;
}

/**
 * Creates a simulated player hand with a specific value
 */
function createPlayerHandForSimulation(playerValue: number): Hand {
    return {
        id: 'simulation-player',
        cards: [],
        values: [playerValue],
        isBlackjack: playerValue === 21,
        canSplit: false,
        isBusted: playerValue > 21,
        isSoft: false
    };
}

/**
 * Play out dealer's hand according to rules
 */
function playDealerHandSimulation(
    dealerHand: Hand,
    deck: Card[],
    rules: GameRules
): Hand {
    let currentHand = { ...dealerHand };
    let currentDeck = [...deck];

    while (shouldDealerHit(currentHand, rules as unknown as Parameters<typeof shouldDealerHit>[1])) {
        if (currentDeck.length === 0) break;

        const newCard = currentDeck[0];
        currentDeck = currentDeck.slice(1);

        currentHand = addCardToHand(currentHand, newCard);

        if (currentHand.isBusted) break;
    }

    return currentHand;
}

/**
 * Determine the outcome of a hand comparison
 */
function determineOutcome(playerHand: Hand, dealerHand: Hand): 'win' | 'lose' | 'push' {
    const result = determineRoundResult(playerHand, dealerHand);

    if (result === 'win' || result === 'blackjack') {
        return 'win';
    } else if (result === 'lose' || result === 'bust') {
        return 'lose';
    } else {
        return 'push';
    }
}

/**
 * Simulates dealer play for strategy calculations (no animations or delays)
 * Returns the probability of each possible outcome
 */
export function simulateDealerOutcomes(
    dealerUpCard: Card,
    playerValue: number,
    remainingDeck: Card[],
    gameRules: GameRules,
    simulations: number = 1000
): { win: number, lose: number, push: number } {
    let wins = 0;
    let losses = 0;
    let pushes = 0;

    // Create a deep copy of the deck for simulations
    const deck = [...remainingDeck];
    const playerHand = createPlayerHandForSimulation(playerValue);

    // If player busted, it's 100% loss probability
    if (playerHand.isBusted) {
        return { win: 0, lose: 1, push: 0 };
    }

    for (let i = 0; i < simulations; i++) {
        // Shuffle the deck for this simulation
        const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);

        // Create a dealer hand with the up card
        const dealerHand = createDealerHandForSimulation(dealerUpCard, shuffledDeck[0]);

        // Early determination if dealer has blackjack
        if (dealerHand.isBlackjack) {
            if (playerHand.isBlackjack) {
                pushes++;
            } else {
                losses++;
            }
            continue;
        }

        // Play out dealer's hand
        const finalDealerHand = playDealerHandSimulation(
            dealerHand,
            shuffledDeck.slice(1),
            gameRules
        );

        // Determine result
        const outcome = determineOutcome(playerHand, finalDealerHand);

        if (outcome === 'win') wins++;
        else if (outcome === 'lose') losses++;
        else pushes++;
    }

    return {
        win: wins / simulations,
        lose: losses / simulations,
        push: pushes / simulations
    };
}