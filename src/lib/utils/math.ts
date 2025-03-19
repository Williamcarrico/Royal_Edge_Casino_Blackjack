'use client';

/**
 * @module lib/utils/math
 * @description Math utility functions for calculations and probabilities
 */

/**
 * Calculate the running count based on card values (Hi-Lo system)
 */
export const calculateRunningCount = (cards: { value: number }[]): number => {
    return cards.reduce((count, card) => {
        // Hi-Lo system: 2-6 = +1, 7-9 = 0, 10-A = -1
        const value = card.value;
        if (value >= 2 && value <= 6) return count + 1;
        if (value >= 10 || value === 1) return count - 1;
        return count;
    }, 0);
};

/**
 * Calculate the true count (running count / decks remaining)
 */
export const calculateTrueCount = (runningCount: number, decksRemaining: number): number => {
    if (decksRemaining <= 0) return 0;
    return runningCount / decksRemaining;
};

/**
 * Calculate optimal bet size based on true count
 * @param trueCount Current true count
 * @param minBet Minimum bet allowed
 * @param maxBet Maximum bet allowed
 * @param bankroll Current bankroll
 * @returns Optimal bet size
 */
export const calculateOptimalBet = (
    trueCount: number,
    minBet: number,
    maxBet: number,
    bankroll: number
): number => {
    // Kelly Criterion calculation
    const advantage = (trueCount * 0.5) / 100; // 0.5% advantage per true count
    const kellyBet = Math.floor(bankroll * advantage);

    // Constrain bet within limits
    return Math.min(Math.max(kellyBet, minBet), maxBet, bankroll);
};

/**
 * Calculate expected value of a decision
 * @param playerTotal Player's current total
 * @param dealerUpcard Dealer's upcard value
 * @param action "hit" | "stand" | "double"
 * @returns Expected value (-1 to 1)
 */
export const calculateExpectedValue = (
    playerTotal: number,
    dealerUpcard: number,
    action: "hit" | "stand" | "double"
): number => {
    // Simplified expected value calculation without probability functions
    const standEV = calculateStandingEV(playerTotal, dealerUpcard);
    const hitEV = calculateHittingEV(playerTotal, dealerUpcard);

    if (action === "double") {
        return hitEV * 2;
    }

    return action === "hit" ? hitEV : standEV;
};

// Simplified helper functions that don't use probability calculations
const calculateStandingEV = (playerTotal: number, dealerUpcard: number): number => {
    // Simple heuristic based on player total and dealer upcard
    if (playerTotal >= 17) return 0.5;
    if (playerTotal >= 13 && dealerUpcard >= 7) return 0.3;
    if (playerTotal >= 13 && dealerUpcard < 7) return 0.6;
    return 0.4;
};

const calculateHittingEV = (playerTotal: number, dealerUpcard: number): number => {
    // Simple heuristic based on player total and dealer upcard
    if (playerTotal >= 17) return 0.2;
    if (playerTotal <= 11) return 0.6;
    if (dealerUpcard >= 7) return 0.4;
    return 0.5;
};

/**
 * Format a number as currency
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};