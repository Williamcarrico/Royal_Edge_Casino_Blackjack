/**
 * @fileoverview Core blackjack game logic
 *
 * This module provides the core game logic for a blackjack game, including:
 * - Card and deck management
 * - Hand evaluation
 * - Game rules and decision making
 * - Payout calculations
 * - Card counting utilities
 */

'use client';

import { v4 as uuidv4 } from 'uuid';

/**
 * Card suit enumeration
 * @enum {string}
 */
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

/**
 * Card rank enumeration (2-10, J, Q, K, A)
 * @enum {string}
 */
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

/**
 * Card representation with suit, rank, and value
 * @interface
 */
export interface Card {
    /** Unique identifier for the card */
    id: string;
    /** Card suit (hearts, diamonds, clubs, spades) */
    suit: Suit;
    /** Card rank (2-10, J, Q, K, A) */
    rank: Rank;
    /** Numeric value of the card (1-11 for Ace) */
    value: number;
    /** Whether the card is face up or face down */
    isFaceUp: boolean;
}

/**
 * Hand representation containing cards and computed values
 * @interface
 */
export interface Hand {
    /** Unique identifier for the hand */
    id: string;
    /** Array of cards in the hand */
    cards: Card[];
    /** All possible values of the hand (considering Aces as 1 or 11) */
    values: number[];
    /** Whether the hand is a blackjack (21 with 2 cards) */
    isBlackjack: boolean;
    /** Whether the hand can be split (has 2 cards of same rank) */
    canSplit: boolean;
    /** Whether the hand is busted (best value > 21) */
    isBusted: boolean;
    /** Whether the hand is soft (contains an Ace counted as 11) */
    isSoft: boolean;
    /** Whether the hand has special restrictions */
    isRestricted?: boolean;
    /** Whether the hand is restricted to one card after splitting */
    restrictedToOneCard?: boolean;
    /** Whether double down is allowed on this hand */
    canDoubleDown?: boolean;
}

/**
 * Game phase enumeration representing different stages of the game
 * @enum {string}
 */
export type GamePhase =
    | 'betting'      // Player is placing bets
    | 'dealing'      // Cards are being dealt
    | 'playerTurn'   // Player is making decisions
    | 'dealerTurn'   // Dealer is playing their hand
    | 'settlement'   // Determining winners and paying out
    | 'completed'    // Round is over
    | 'error';       // An error occurred

/**
 * Round result enumeration representing possible outcomes
 * @enum {string}
 */
export type RoundResult =
    | 'blackjack'    // Player has a natural blackjack
    | 'win'          // Player won the hand
    | 'push'         // Player and dealer tied
    | 'lose'         // Player lost the hand
    | 'surrender'    // Player surrendered
    | 'insurance'    // Player won insurance bet
    | 'bust'         // Player busted
    | 'pending'      // Round still in progress
    | null;          // No result yet

/**
 * Blackjack rule variations configuration
 * @interface
 */
export interface BlackjackRules {
    /** Number of decks used (typically 1-8) */
    deckCount: number;
    /** Whether dealer hits on soft 17 */
    dealerHitsOnSoft17: boolean;
    /** Whether double down after split is allowed */
    doubleAfterSplit: boolean;
    /** Whether surrender is allowed */
    surrender: boolean;
    /** Blackjack payout ratio (typically 3:2 or 6:5) */
    blackjackPayout: number;
    /** Whether insurance is offered when dealer shows an ace */
    insurance: boolean;
    /** Maximum number of times a hand can be split */
    maxSplits: number;
    /** Minimum bet amount */
    minimumBet: number;
    /** Maximum bet amount */
    maximumBet: number;
    /** Whether dealer's hole card is revealed immediately when checking for blackjack */
    earlyPeek: boolean;
}

/**
 * Standard Vegas rules configuration
 */
export const VEGAS_RULES: BlackjackRules = {
    deckCount: 6,
    dealerHitsOnSoft17: true,
    doubleAfterSplit: true,
    surrender: true,
    blackjackPayout: 1.5,
    insurance: true,
    maxSplits: 3,
    minimumBet: 5,
    maximumBet: 1000,
    earlyPeek: true,
};

/**
 * Creates a new deck of 52 playing cards
 * @returns {Card[]} An array of card objects
 */
export function createDeck(): Card[] {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck: Card[] = [];

    for (const suit of suits) {
        for (const rank of ranks) {
            let value: number;

            if (rank === 'A') {
                value = 11; // Aces are worth 11 unless doing so would cause a bust
            } else if (rank === 'K' || rank === 'Q' || rank === 'J') {
                value = 10; // Face cards are worth 10
            } else {
                value = parseInt(rank, 10); // Number cards are worth their number
            }

            deck.push({
                id: uuidv4(),
                suit,
                rank,
                value,
                isFaceUp: true,
            });
        }
    }

    return deck;
}

/**
 * Creates a shoe of multiple decks and shuffles them
 * @param {number} deckCount - Number of decks to use (default: 6)
 * @returns {Card[]} A shuffled array of cards
 */
export function createShoe(deckCount: number = 6): Card[] {
    let shoe: Card[] = [];

    for (let i = 0; i < deckCount; i++) {
        shoe = [...shoe, ...createDeck()];
    }

    // Fisher-Yates shuffle algorithm
    for (let i = shoe.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
    }

    return shoe;
}

/**
 * Deals a card from the shoe
 * @param {Card[]} shoe - The shoe to deal from
 * @param {boolean} isFaceUp - Whether the card should be dealt face up
 * @returns {[Card, Card[]]} The dealt card and the updated shoe
 */
export function dealCard(shoe: Card[], isFaceUp: boolean = true): [Card, Card[]] {
    if (shoe.length === 0) {
        throw new Error('No cards left in the shoe');
    }

    const [card, ...remainingShoe] = shoe;

    return [{ ...card, isFaceUp }, remainingShoe];
}

/**
 * Creates a new empty hand
 * @returns {Hand} A new hand object
 */
export function createHand(): Hand {
    return {
        id: uuidv4(),
        cards: [],
        values: [0],
        isBlackjack: false,
        canSplit: false,
        isBusted: false,
        isSoft: false,
    };
}

/**
 * Calculates all possible values for a hand
 * @param {Card[]} cards - The cards in the hand
 * @returns {number[]} Array of possible hand values
 */
export function calculateHandValues(cards: Card[]): number[] {
    // Safety check for invalid input
    if (!Array.isArray(cards)) {
        console.error('Expected array for cards but got:', typeof cards, cards);
        return [0];
    }

    // Only consider face-up cards for the calculation
    const faceUpCards = cards.filter(card => card.isFaceUp !== false);

    if (faceUpCards.length === 0) {
        return [0];
    }

    // Enhanced debugging log to check the cards being counted
    console.log('[calculateHandValues] Processing cards:',
        faceUpCards.map(c => ({ rank: c.rank, suit: c.suit, value: c.value, isFaceUp: c.isFaceUp })));

    // Count aces separately
    const aceCount = faceUpCards.filter(card => card.rank === 'A').length;

    // Calculate sum of non-ace cards with extra validation
    const nonAceSum = faceUpCards.reduce((sum, card) => {
        if (card.rank !== 'A') {
            // For non-ace cards, use value property with defensive checks
            let cardValue: number;

            if (typeof card.value === 'number' && !isNaN(card.value)) {
                cardValue = card.value;
            } else if (['J', 'Q', 'K'].includes(card.rank)) {
                cardValue = 10;
            } else if (typeof card.rank === 'string' && !isNaN(parseInt(card.rank, 10))) {
                cardValue = parseInt(card.rank, 10);
            } else {
                console.error('Invalid card rank or value:', card);
                cardValue = 0;
            }

            console.log(`[calculateHandValues] Card ${card.rank}${card.suit[0]}: value = ${cardValue}`);
            return sum + cardValue;
        }
        return sum;
    }, 0);

    // Start with all aces valued at 1
    const values: number[] = [nonAceSum + aceCount];

    // Try each possible number of aces as 11 (from 1 up to all aces)
    for (let i = 1; i <= aceCount; i++) {
        // Each ace as 11 adds 10 more points (since we already counted it as 1)
        const value = nonAceSum + aceCount + (i * 10);
        // Only include this value if it doesn't bust
        if (value <= 21) {
            values.push(value);
        }
    }

    // More detailed logging
    console.log('[calculateHandValues] Result:', {
        faceUpCards: faceUpCards.length,
        aceCount,
        nonAceSum,
        possibleValues: values
    });

    return values.sort((a, b) => a - b);
}

/**
 * Gets the best (highest non-busting) value for a hand
 * @param {number[]} values - Array of possible hand values
 * @returns {number} The best hand value
 */
export function getBestHandValue(values: number[]): number {
    // Safety check for non-array input
    if (!Array.isArray(values)) {
        console.error('Expected array for values but got:', typeof values, values);
        return 0;
    }

    // Safety check for empty array
    if (values.length === 0) {
        console.warn('Empty values array passed to getBestHandValue');
        return 0;
    }

    // Find the highest value that doesn't bust
    const nonBustValues = values.filter(value => value <= 21);

    if (nonBustValues.length === 0) {
        // All values bust, return the lowest value
        return Math.min(...values);
    }

    // Return the highest non-busting value
    return Math.max(...nonBustValues);
}

/**
 * Checks if a hand is busted (all values > 21)
 * @param {number[]} values - Array of possible hand values
 * @returns {boolean} Whether the hand is busted
 */
export function isBusted(values: number[]): boolean {
    return values.every(value => value > 21);
}

/**
 * Checks if the dealer should hit based on their hand and the rules
 * @param {Hand} hand - The dealer's hand
 * @param {BlackjackRules} rules - The blackjack rules in effect
 * @returns {boolean} Whether the dealer should hit
 */
export function shouldDealerHit(hand: Hand, rules: BlackjackRules): boolean {
    // Safety check for incomplete hand data
    if (!hand?.values?.length || !Array.isArray(hand.values)) {
        console.error('[shouldDealerHit] Invalid hand data:', hand);
        return false;
    }

    const bestValue = getBestHandValue(hand.values);

    // Extra validation to prevent hitting on high values
    if (bestValue >= 17) {
        console.log(`[shouldDealerHit] Dealer STANDS with ${bestValue} (>= 17)`);
        return false;
    }

    // Check for soft 17 with detailed logging
    const isSoft = hand.isSoft || (
        hand.values.length > 1 &&
        hand.cards.some(c => c.rank === 'A' && c.isFaceUp === true)
    );

    // Dealer must hit on 16 or lower
    if (bestValue < 17) {
        console.log(`[shouldDealerHit] Dealer HITS with ${bestValue} (< 17)`);
        return true;
    }

    // Dealer hits on soft 17 if the rule is enabled
    if (bestValue === 17 && isSoft && rules.dealerHitsOnSoft17) {
        console.log(`[shouldDealerHit] Dealer HITS with soft 17 (rule enabled)`);
        return true;
    }

    // Final detailed log
    console.log(`[shouldDealerHit] Dealer STANDS with ${bestValue}${isSoft ? ' (soft)' : ''}`);
    return false;
}

/**
 * Determines the result of a round
 * @param {Hand} playerHand - The player's hand
 * @param {Hand} dealerHand - The dealer's hand
 * @returns {RoundResult} The result of the round
 */
export function determineRoundResult(playerHand: Hand, dealerHand: Hand): RoundResult {
    // Safety check for invalid inputs
    if (!playerHand || !dealerHand) {
        console.error('Invalid hands provided to determineRoundResult:', { playerHand, dealerHand });
        return 'pending';
    }

    // Ensure hand values are properly calculated
    if (!playerHand.values || !dealerHand.values) {
        console.error('Hand values not calculated:', {
            playerValues: playerHand.values,
            dealerValues: dealerHand.values
        });
        return 'pending';
    }

    // Get best non-busting value when available, otherwise get the lowest value (minimizes bust damage)
    const getNonBustValue = (values: number[]): number => {
        if (!Array.isArray(values) || values.length === 0) {
            console.error('Invalid hand values array:', values);
            return 0;
        }

        // Filter for valid values (21 or under)
        const validValues = values.filter(v => v <= 21);

        // If we have valid values, return the highest one
        if (validValues.length > 0) {
            return Math.max(...validValues);
        }

        // If all values are busts, return the lowest one
        return Math.min(...values);
    };

    const playerValue = getNonBustValue(playerHand.values);
    const dealerValue = getNonBustValue(dealerHand.values);

    // Enhanced logging for debugging
    console.log('Determining round result:', {
        playerValue,
        dealerValue,
        playerValues: playerHand.values,
        dealerValues: dealerHand.values,
        playerIsBusted: playerValue > 21,
        dealerIsBusted: dealerValue > 21,
        playerIsBlackjack: playerHand.isBlackjack,
        dealerIsBlackjack: dealerHand.isBlackjack
    });

    // Check for blackjack
    if (playerHand.isBlackjack) {
        if (dealerHand.isBlackjack) {
            return 'push';
        }
        return 'blackjack';
    }

    // Check if player busted
    if (playerValue > 21) {
        return 'bust';
    }

    // Check if dealer busted
    if (dealerValue > 21) {
        return 'win';
    }

    // Compare values
    if (playerValue > dealerValue) {
        return 'win';
    } else if (playerValue < dealerValue) {
        return 'lose';
    } else {
        return 'push';
    }
}

/**
 * Calculates the payout amount based on the result and bet
 * @param {RoundResult} result - The result of the round
 * @param {number} bet - The bet amount
 * @param {BlackjackRules} rules - The blackjack rules in effect
 * @returns {number} The payout amount (negative for losses)
 */
export function calculatePayout(
    result: RoundResult,
    bet: number,
    rules: BlackjackRules
): number {
    switch (result) {
        case 'blackjack':
            return bet * rules.blackjackPayout;
        case 'win':
            return bet;
        case 'push':
            return 0;
        case 'lose':
        case 'bust':
            return -bet;
        case 'surrender':
            return -bet / 2;
        case 'insurance':
            return bet; // Insurance pays 2:1, but the original bet is already lost
        default:
            return 0;
    }
}

/**
 * Calculates the running count for card counting (Hi-Lo system)
 * @param {Card[]} dealtCards - Array of cards that have been dealt
 * @returns {number} The current running count
 */
export function calculateRunningCount(dealtCards: Card[]): number {
    return dealtCards.reduce((count, card) => {
        if (['2', '3', '4', '5', '6'].includes(card.rank)) {
            return count + 1; // Low cards increase the count
        } else if (['10', 'J', 'Q', 'K', 'A'].includes(card.rank)) {
            return count - 1; // High cards decrease the count
        }
        return count; // 7, 8, 9 are neutral
    }, 0);
}

/**
 * Calculates the true count for card counting
 * @param {number} runningCount - The current running count
 * @param {number} decksRemaining - The estimated number of decks remaining
 * @returns {number} The true count
 */
export function calculateTrueCount(runningCount: number, decksRemaining: number): number {
    if (decksRemaining <= 0) {
        return 0;
    }
    return runningCount / decksRemaining;
}

/**
 * Determines the optimal play for pairs that can be split
 */
function getPairSplittingStrategy(pairValue: number, dealerValue: number): string | null {
    // Always split Aces and 8s
    if (pairValue === 11 || pairValue === 8) {
        return 'split';
    }

    // Never split 10s, 5s
    if (pairValue === 10 || pairValue === 5) {
        return 'stand';
    }

    // Split 9s against 2-6, 8-9
    if (pairValue === 9 && ![7, 10, 11].includes(dealerValue)) {
        return 'split';
    }

    // Split 7s against 2-7
    if (pairValue === 7 && dealerValue <= 7) {
        return 'split';
    }

    // Split 6s against 2-6
    if (pairValue === 6 && dealerValue <= 6) {
        return 'split';
    }

    // Split 4s against 5-6
    if (pairValue === 4 && (dealerValue === 5 || dealerValue === 6)) {
        return 'split';
    }

    // Split 3s, 2s against 2-7
    if ((pairValue === 2 || pairValue === 3) && dealerValue <= 7) {
        return 'split';
    }

    return null; // No specific pair strategy found
}

/**
 * Determines the optimal play for soft totals (hand with an Ace counted as 11)
 */
function getSoftTotalStrategy(playerValue: number, dealerValue: number): string | null {
    // Define strategy map for soft hands
    // Format: Map<playerValue, [dealerValueMin, dealerValueMax, action][]>
    const softStrategyMap: Record<number, Array<[number, number, string]>> = {
        20: [[2, 11, 'stand']], // Always stand on soft 20
        19: [
            [6, 6, 'double'],   // Double against dealer 6
            [2, 11, 'stand']    // Otherwise stand
        ],
        18: [
            [2, 6, 'double'],   // Double against dealer 2-6
            [7, 8, 'stand'],    // Stand against dealer 7-8
            [9, 11, 'hit']      // Hit against dealer 9-A
        ],
        17: [
            [3, 6, 'double'],   // Double against dealer 3-6
            [2, 11, 'hit']      // Otherwise hit
        ],
        16: [
            [4, 6, 'double'],   // Double against dealer 4-6
            [2, 11, 'hit']      // Otherwise hit
        ],
        15: [
            [4, 6, 'double'],   // Double against dealer 4-6
            [2, 11, 'hit']      // Otherwise hit
        ],
        14: [
            [5, 6, 'double'],   // Double against dealer 5-6
            [2, 11, 'hit']      // Otherwise hit
        ],
        13: [
            [5, 6, 'double'],   // Double against dealer 5-6
            [2, 11, 'hit']      // Otherwise hit
        ]
    };

    // Find the strategy for the current hand value
    const strategies = softStrategyMap[playerValue];
    if (!strategies) {
        return null;
    }

    // Find the matching strategy based on the dealer's value
    for (const [min, max, action] of strategies) {
        if (dealerValue >= min && dealerValue <= max) {
            return action;
        }
    }

    return null;
}

/**
 * Determines the optimal play for hard totals (hand without an Ace counted as 11)
 */
function getHardTotalStrategy(playerValue: number, dealerValue: number, rules: BlackjackRules): string {
    // Surrender 16 against dealer 9-A if allowed
    if (playerValue === 16 && dealerValue >= 9 && rules.surrender) {
        return 'surrender';
    }

    // Surrender 15 against dealer 10 if allowed
    if (playerValue === 15 && dealerValue === 10 && rules.surrender) {
        return 'surrender';
    }

    // Always stand on 17+
    if (playerValue >= 17) {
        return 'stand';
    }

    // Stand on 13-16 against dealer 2-6
    if (playerValue >= 13 && playerValue <= 16 && dealerValue <= 6) {
        return 'stand';
    }

    // Double on 11 against any dealer card
    if (playerValue === 11) {
        return 'double';
    }

    // Double on 10 against dealer 2-9
    if (playerValue === 10 && dealerValue <= 9) {
        return 'double';
    }

    // Double on 9 against dealer 3-6
    if (playerValue === 9 && dealerValue >= 3 && dealerValue <= 6) {
        return 'double';
    }

    // Always hit on 8 or less
    if (playerValue <= 8) {
        return 'hit';
    }

    // Default to hitting for all other cases
    return 'hit';
}

/**
 * Calculates the optimal strategy recommendation based on the current game state
 * @param {Hand} playerHand - The player's hand
 * @param {Card} dealerUpCard - The dealer's visible card
 * @param {BlackjackRules} rules - The blackjack rules in effect
 * @returns {string} Strategy recommendation (hit, stand, double, split, surrender)
 */
export function getOptimalStrategy(
    playerHand: Hand,
    dealerUpCard: Card,
    rules: BlackjackRules
): string {
    const playerValue = getBestHandValue(playerHand.values);
    const dealerValue = dealerUpCard.value;
    const isSoft = playerHand.values.length > 1 && playerHand.values.includes(playerValue);

    // Check pair splitting first
    if (playerHand.canSplit) {
        const pairValue = playerHand.cards[0].value;
        const pairStrategy = getPairSplittingStrategy(pairValue, dealerValue);
        if (pairStrategy) {
            return pairStrategy;
        }
    }

    // Check soft totals next
    if (isSoft) {
        const softStrategy = getSoftTotalStrategy(playerValue, dealerValue);
        if (softStrategy) {
            return softStrategy;
        }
    }

    // Default to hard total strategy
    return getHardTotalStrategy(playerValue, dealerValue, rules);
}

/**
 * Updates a hand with a new card and recalculates values
 * @param {Hand} hand - The hand to update
 * @param {Card} card - The card to add
 * @returns {Hand} The updated hand
 */
export function addCardToHand(hand: Hand, card: Card): Hand {
    const updatedCards = [...hand.cards, card];
    const values = calculateHandValues(updatedCards);

    const isBlackjack =
        updatedCards.length === 2 &&
        values.includes(21) &&
        updatedCards.some(c => c.rank === 'A');

    const canSplit =
        updatedCards.length === 2 &&
        updatedCards[0].rank === updatedCards[1].rank;

    // Check if hand is busted (all values over 21)
    const isBusted = values.every(value => value > 21);

    // A hand is soft if:
    // 1. It contains at least one Ace
    // 2. It has multiple possible values (meaning at least one Ace is being counted as 11)
    // 3. At least one of those values is not busted (≤ 21)
    const hasAce = updatedCards.some(c => c.rank === 'A');
    const nonBustValues = values.filter(v => v <= 21);
    const isSoft = hasAce && nonBustValues.length > 1;

    return {
        ...hand,
        cards: updatedCards,
        values,
        isBlackjack,
        canSplit,
        isBusted,
        isSoft,
    };
}

/**
 * Creates a new split hand from an existing hand
 * @param {Hand} hand - The hand to split
 * @param {BlackjackRules} rules - The rules configuration for handling split restrictions
 * @returns {[Hand, Hand]} Two new hands, each with one card from the original
 */
export function splitHand(hand: Hand, rules?: BlackjackRules): [Hand, Hand] {
    if (hand.cards.length !== 2 || hand.cards[0].rank !== hand.cards[1].rank) {
        throw new Error('Can only split a hand with exactly two cards of the same rank');
    }

    const firstHand = createHand();
    const secondHand = createHand();

    // Add the cards to the new hands
    const updatedFirstHand = addCardToHand(firstHand, hand.cards[0]);
    const updatedSecondHand = addCardToHand(secondHand, hand.cards[1]);

    // Apply special rules for Aces if rules are provided
    if (rules && hand.cards[0].rank === 'A') {
        // Some casinos only allow one card after splitting aces
        const restrictedAceHand = (hand: Hand): Hand => ({
            ...hand,
            isRestricted: true, // Add flag to indicate restrictions
            restrictedToOneCard: true // Cannot hit after initial card
        });

        return [
            { ...updatedFirstHand, ...restrictedAceHand(updatedFirstHand) },
            { ...updatedSecondHand, ...restrictedAceHand(updatedSecondHand) }
        ];
    }

    // Apply special configurations for other pairs if needed
    if (rules) {
        // Check if double down after split is allowed
        const canDoubleAfterSplit = rules.doubleAfterSplit;

        // Return hands with appropriate restrictions
        return [
            { ...updatedFirstHand, canDoubleDown: canDoubleAfterSplit },
            { ...updatedSecondHand, canDoubleDown: canDoubleAfterSplit }
        ];
    }

    return [updatedFirstHand, updatedSecondHand];
}

/**
 * Estimates the number of decks remaining in the shoe
 * @param {Card[]} shoe - The current shoe
 * @param {Card[]} dealtCards - Cards that have been dealt
 * @param {number} originalDeckCount - The original number of decks
 * @returns {number} Estimated number of decks remaining
 */
export function estimateDecksRemaining(
    shoe: Card[],
    dealtCards: Card[],
    originalDeckCount: number
): number {
    const totalCards = originalDeckCount * 52;
    const remainingCards = totalCards - dealtCards.length;
    return remainingCards / 52;
}

// Add side bet types
export type SideBetType = 'perfectPairs' | 'twentyOnePlus3';

// Perfect Pairs result
export interface PerfectPairsResult {
    name: 'Mixed Pair' | 'Colored Pair' | 'Perfect Pair';
    payout: number;
}

// 21+3 result
export interface TwentyOnePlus3Result {
    name: 'Flush' | 'Straight' | 'Three of a Kind' | 'Straight Flush' | 'Suited Trips';
    payout: number;
}

// Side bet interface
export interface SideBet {
    type: SideBetType;
    amount: number;
    result: PerfectPairsResult | TwentyOnePlus3Result | null;
}

// Perfect Pairs payouts
export const perfectPairsPayout = {
    mixedPair: 5,
    coloredPair: 10,
    perfectPair: 30
};

// 21+3 payouts
export const twentyOnePlus3Payout = {
    flush: 5,
    straight: 10,
    threeOfAKind: 30,
    straightFlush: 40,
    suitedTrips: 100
};

// Game rules interface (moved from types/game.ts to be with other game logic)
export interface GameRules {
    decksCount: number;
    dealerHitsSoft17: boolean;
    blackjackPayout: 1.5 | 1.2 | 1;
    doubleAllowed: boolean;
    doubleAfterSplit: boolean;
    surrender: boolean;
    insuranceAvailable: boolean;
    maxSplits: number;
    resplitAces: boolean;
    hitSplitAces: boolean;
}

// Default rules for different blackjack variants
export const gameVariantRules: Record<string, GameRules> = {
    classic: {
        decksCount: 1,
        dealerHitsSoft17: false,
        blackjackPayout: 1.5,
        doubleAllowed: true,
        doubleAfterSplit: true,
        surrender: false,
        insuranceAvailable: true,
        maxSplits: 3,
        resplitAces: false,
        hitSplitAces: false
    },
    european: {
        decksCount: 2,
        dealerHitsSoft17: false,
        blackjackPayout: 1.5,
        doubleAllowed: true,
        doubleAfterSplit: false,
        surrender: false,
        insuranceAvailable: false,
        maxSplits: 3,
        resplitAces: false,
        hitSplitAces: false
    },
    atlantic: {
        decksCount: 8,
        dealerHitsSoft17: true,
        blackjackPayout: 1.5,
        doubleAllowed: true,
        doubleAfterSplit: true,
        surrender: true,
        insuranceAvailable: true,
        maxSplits: 3,
        resplitAces: false,
        hitSplitAces: false
    },
    vegas: {
        decksCount: 6,
        dealerHitsSoft17: true,
        blackjackPayout: 1.5,
        doubleAllowed: true,
        doubleAfterSplit: true,
        surrender: false,
        insuranceAvailable: true,
        maxSplits: 3,
        resplitAces: false,
        hitSplitAces: false
    }
};

/**
 * Creates a card with proper value assignment
 * @param {string} rank - The rank of the card (2-10, J, Q, K, A)
 * @param {string} suit - The suit of the card (hearts, diamonds, clubs, spades)
 * @param {boolean} isFaceUp - Whether the card is face up
 * @returns {Card} A new card object
 */
export function createCard(rank: string, suit: string, isFaceUp: boolean = true): Card {
    let value: number;

    if (rank === 'A') {
        value = 11; // Aces are worth 11 (will be adjusted to 1 as needed)
    } else if (['K', 'Q', 'J'].includes(rank)) {
        value = 10; // Face cards are worth 10
    } else {
        value = parseInt(rank, 10); // Number cards worth their number

        // Extra validation to ensure we have a valid number
        if (isNaN(value)) {
            console.error(`Invalid card rank: ${rank}`);
            value = 0;
        }
    }

    // Validate and cast suit and rank to their proper types
    const validSuits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const validRanks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    if (!validSuits.includes(suit as Suit)) {
        console.error(`Invalid card suit: ${suit}`);
    }

    if (!validRanks.includes(rank as Rank)) {
        console.error(`Invalid card rank: ${rank}`);
    }

    return {
        id: uuidv4(),
        suit: suit as Suit,
        rank: rank as Rank,
        value,
        isFaceUp
    };
}