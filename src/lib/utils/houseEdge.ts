/**
 * @fileoverview House edge implementation for blackjack
 *
 * This module provides utilities for implementing house edge mechanics,
 * such as modified payout ratios, deck biasing, and rules that slightly
 * favor the house.
 */

import { Card, Hand, RoundResult } from './gameLogic'

/**
 * House edge configuration options
 */
export interface HouseEdgeConfig {
    // Payout adjustments
    blackjackPayout: 1.5 | 1.2 | 1; // Standard is 3:2 (1.5), reduced can be 6:5 (1.2) or 1:1

    // Card distribution biasing
    deckBiasing: boolean; // Whether to use deck biasing
    highCardBias: number; // -1 to 1, negative values reduce high cards

    // House-favorable rules
    dealerHitsSoft17: boolean; // Dealer hits on soft 17 (house advantage)
    dealerPeeksForBlackjack: boolean; // Dealer peeks for blackjack before player actions
    doubleRestrictions: 'none' | '9-11' | 'hard-only'; // Restrictions on doubling down

    // Other edge-increasing rules
    surrenderAllowed: boolean; // Whether surrender is allowed
    resplitAcesAllowed: boolean; // Whether player can resplit Aces
    hitSplitAcesAllowed: boolean; // Whether player can hit split Aces
    doubleAfterSplitAllowed: boolean; // Whether player can double after splitting
}

/**
 * Default house edge configuration providing standard game rules
 */
export const DEFAULT_HOUSE_EDGE: HouseEdgeConfig = {
    blackjackPayout: 1.5, // Standard 3:2 payout
    deckBiasing: false,
    highCardBias: 0,
    dealerHitsSoft17: true, // House advantage
    dealerPeeksForBlackjack: true,
    doubleRestrictions: 'none', // No restrictions
    surrenderAllowed: true,
    resplitAcesAllowed: false, // Standard restriction
    hitSplitAcesAllowed: false, // Standard restriction
    doubleAfterSplitAllowed: true
}

/**
 * High house edge configuration with rules that increase house advantage
 */
export const HIGH_HOUSE_EDGE: HouseEdgeConfig = {
    blackjackPayout: 1.2, // Reduced 6:5 payout
    deckBiasing: true,
    highCardBias: -0.05, // Slightly reduce high cards
    dealerHitsSoft17: true,
    dealerPeeksForBlackjack: false, // No early peek (increases house edge)
    doubleRestrictions: '9-11', // Can only double on 9, 10, 11
    surrenderAllowed: false, // No surrender option
    resplitAcesAllowed: false,
    hitSplitAcesAllowed: false,
    doubleAfterSplitAllowed: false // No doubling after split
}

/**
 * House edge that applies a specific bias to remove certain cards from the deck
 * based on configuration
 */
export function biasedShuffle(cards: Card[], config: HouseEdgeConfig): Card[] {
    if (!config.deckBiasing || config.highCardBias === 0) {
        // No biasing, return regular shuffle
        return [...cards].sort(() => Math.random() - 0.5)
    }

    // Apply biasing logic
    const cardsCopy = [...cards]

    // Determine high value cards (10, J, Q, K, A)
    const highValueCards = cardsCopy.filter(card =>
        card.rank === '10' || card.rank === 'J' || card.rank === 'Q' ||
        card.rank === 'K' || card.rank === 'A'
    )

    // Determine the number of high cards to adjust
    const adjustmentCount = Math.floor(Math.abs(config.highCardBias) * highValueCards.length)

    if (adjustmentCount === 0) {
        return cardsCopy.sort(() => Math.random() - 0.5)
    }

    if (config.highCardBias < 0) {
        // Negative bias: Move high cards toward the end (less likely to be dealt)
        const highCardIndices = highValueCards
            .slice(0, adjustmentCount)
            .map(card => cardsCopy.indexOf(card))

        // Move selected high cards to the end (or near the end with some randomness)
        for (const index of highCardIndices) {
            if (index !== -1) {
                const card = cardsCopy.splice(index, 1)[0]
                // Insert near the end with some variability
                const insertPosition = Math.floor(cardsCopy.length * 0.8) +
                    Math.floor(Math.random() * (cardsCopy.length * 0.2))
                cardsCopy.splice(insertPosition, 0, card)
            }
        }
    } else {
        // Positive bias: Move high cards toward the beginning (more likely to be dealt)
        const highCardIndices = highValueCards
            .slice(0, adjustmentCount)
            .map(card => cardsCopy.indexOf(card))

        // Move selected high cards to the beginning (or near the beginning with some randomness)
        for (const index of highCardIndices) {
            if (index !== -1) {
                const card = cardsCopy.splice(index, 1)[0]
                // Insert near the beginning with some variability
                const insertPosition = Math.floor(Math.random() * (cardsCopy.length * 0.2))
                cardsCopy.splice(insertPosition, 0, card)
            }
        }
    }

    // Final shuffle to mask the biasing
    return cardsCopy.sort(() => Math.random() - 0.15) // Less randomness to preserve some bias
}

/**
 * Calculates payout with house edge adjustments
 */
export function calculateHouseEdgePayout(
    result: RoundResult,
    bet: number,
    config: HouseEdgeConfig
): number {
    switch (result) {
        case 'blackjack':
            return bet + (bet * config.blackjackPayout)
        case 'win':
            return bet * 2
        case 'push':
            return bet
        case 'insurance':
            return bet * 2
        case 'surrender':
            return bet / 2
        case 'bust':
        case 'lose':
        default:
            return 0
    }
}

/**
 * Determines if a player action is allowed based on house edge rules
 */
export function isActionAllowedWithHouseEdge(
    action: 'double' | 'split' | 'surrender' | 'insurance' | 'hit',
    hand: Hand,
    config: HouseEdgeConfig
): boolean {
    switch (action) {
        case 'double':
            // Check doubling restrictions
            if (config.doubleRestrictions === '9-11') {
                const bestValue = Math.max(...hand.values.filter(v => v <= 21))
                return bestValue >= 9 && bestValue <= 11
            } else if (config.doubleRestrictions === 'hard-only') {
                return !hand.isSoft
            }
            return true

        case 'split':
            // Check if the hand has aces and if resplitting aces is allowed
            if (hand.cards.length === 2 && hand.cards[0].rank === 'A' && hand.cards[1].rank === 'A') {
                return config.resplitAcesAllowed
            }
            return true

        case 'hit':
            // Check if hitting split aces is allowed
            if (hand.cards.length === 1 && hand.cards[0].rank === 'A') {
                return config.hitSplitAcesAllowed
            }
            return true

        case 'surrender':
            return config.surrenderAllowed

        case 'insurance':
            return true

        default:
            return true
    }
}

/**
 * Determines if the dealer should hit based on house edge rules
 */
export function shouldDealerHitWithHouseEdge(
    hand: Hand,
    config: HouseEdgeConfig
): boolean {
    const bestValue = Math.max(...hand.values.filter(v => v <= 21))

    // If dealer has soft 17, check the rule
    if (bestValue === 17 && hand.isSoft) {
        return config.dealerHitsSoft17
    }

    // Standard dealer hits on 16 or less
    return bestValue < 17
}

/**
 * Applies house edge by modifying a freshly created shoe
 */
export function applyHouseEdge(shoe: Card[], config: HouseEdgeConfig): Card[] {
    return biasedShuffle(shoe, config)
}