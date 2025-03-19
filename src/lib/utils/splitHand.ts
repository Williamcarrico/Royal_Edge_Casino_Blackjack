/**
 * Split Hands Service
 *
 * Handles the logic for splitting pairs and managing multiple hands
 */

import {
    Card,
    Hand,
    GameRules,
    dealCard,
    addCardToHand,
    splitHand
} from './gameLogic';
import { v4 as uuidv4 } from 'uuid';

/**
 * Extended Hand interface with additional properties for split functionality
 */
interface SplitHand extends Omit<Hand, 'canHit' | 'canDouble' | 'canSplit'> {
    canHit: boolean;
    canDouble: boolean;
    canSplit: boolean;
    [key: string]: boolean | string | number | Card[] | undefined;
}

/**
 * Result of splitting a hand
 */
export interface SplitResult {
    hands: SplitHand[];
    dealtCards: Card[];
    updatedDeck: Card[];
}

/**
 * Split a pair into two hands and deal one card to each
 */
export function performSplit(
    hand: Hand,
    deck: Card[],
    rules: GameRules
): SplitResult {
    // Validate the hand can be split
    if (hand.cards.length !== 2 || hand.cards[0].rank !== hand.cards[1].rank) {
        throw new Error('Cannot split: hand must contain exactly two cards of the same rank');
    }

    // Make copies to avoid mutating the original objects
    let currentDeck = [...deck];
    const dealtCards: Card[] = [];

    // Split the hand into two new hands
    const [firstHand, secondHand] = splitHand(hand);

    // Generate unique IDs for the hands
    const hand1: SplitHand = {
        ...firstHand,
        id: uuidv4(),
    };

    const hand2: SplitHand = {
        ...secondHand,
        id: uuidv4(),
    };

    // Deal one more card to each new hand
    const [card1, updatedDeck1] = dealCard(currentDeck, true);
    currentDeck = updatedDeck1;
    dealtCards.push(card1);

    const [card2, updatedDeck2] = dealCard(currentDeck, true);
    currentDeck = updatedDeck2;
    dealtCards.push(card2);

    // Add the cards to the hands
    const updatedHand1 = addCardToHand(hand1, card1) as SplitHand;
    const updatedHand2 = addCardToHand(hand2, card2) as SplitHand;

    // Special handling for split Aces
    if (hand.cards[0].rank === 'A') {
        // With some rule sets, players can only get one card on each Ace
        if (!rules.hitSplitAces) {
            updatedHand1.canHit = false;
            updatedHand2.canHit = false;
        }

        // Check if resplitting aces is allowed
        if (!rules.resplitAces) {
            updatedHand1.canSplit = false;
            updatedHand2.canSplit = false;
        }
    }

    // Check if double after split is allowed
    if (!rules.doubleAfterSplit) {
        updatedHand1.canDouble = false;
        updatedHand2.canDouble = false;
    }

    return {
        hands: [updatedHand1, updatedHand2],
        dealtCards,
        updatedDeck: currentDeck
    };
}

/**
 * Check if a hand can be split
 */
export function canSplitHand(
    hand: Hand,
    chipCount: number,
    currentBet: number,
    splitCount: number,
    rules: GameRules
): boolean {
    // Basic conditions for splitting
    const hasPair =
        hand.cards.length === 2 &&
        hand.cards[0].rank === hand.cards[1].rank;

    // Check if player has enough chips to split
    const hasEnoughChips = chipCount >= currentBet;

    // Check if we've reached maximum splits
    const belowMaxSplits = splitCount < rules.maxSplits;

    // Special check for Aces if resplitting is disallowed
    const isAce = hand.cards.length === 2 && hand.cards[0].rank === 'A';
    const allowedToSplitAces = !isAce || (isAce && rules.resplitAces);

    return hasPair && hasEnoughChips && belowMaxSplits && allowedToSplitAces;
}

/**
 * Find the next playable hand
 */
export function findNextPlayableHand(
    hands: Hand[],
    currentHandIndex: number
): number {
    for (let i = currentHandIndex + 1; i < hands.length; i++) {
        const hand = hands[i];

        // Skip hands that are busted or have blackjack
        if (hand.isBusted || hand.isBlackjack) {
            continue;
        }

        return i;
    }

    // If no playable hand found, return -1
    return -1;
}

/**
 * Calculate the total bet amount for all split hands
 */
export function calculateTotalBet(
    originalBet: number,
    handCount: number
): number {
    return originalBet * handCount;
}

/**
 * Calculate payouts for multiple hands
 */
export interface HandPayout {
    handId: string;
    bet: number;
    result: string;
    payout: number;
}

export function calculateHandsPayouts(
    hands: Hand[],
    dealerHand: Hand,
    baseBet: number,
    rules: GameRules
): HandPayout[] {
    return hands.map(hand => {
        let result: string;
        let payout = -baseBet;

        // Skip determining outcome if hand is busted
        if (hand.isBusted) {
            result = 'bust';
        }
        // If dealer busted and player didn't, player wins
        else if (dealerHand.isBusted) {
            result = 'win';
            payout = baseBet;
        }
        // Blackjack (only counts if it's a natural blackjack with 2 cards)
        else if (hand.isBlackjack && hand.cards.length === 2) {
            if (dealerHand.isBlackjack) {
                result = 'push';
                payout = 0;
            } else {
                result = 'blackjack';
                payout = baseBet * rules.blackjackPayout;
            }
        }
        // Compare normal hand values
        else {
            const playerValue: number = Math.max(...hand.values.filter((v: number) => v <= 21));
            const dealerValue: number = Math.max(...dealerHand.values.filter((v: number) => v <= 21));

            if (playerValue > dealerValue) {
                result = 'win';
                payout = baseBet;
            } else if (playerValue < dealerValue) {
                result = 'lose';
            } else {
                result = 'push';
                payout = 0;
            }
        }

        return {
            handId: hand.id,
            bet: baseBet,
            result,
            payout
        };
    });
}