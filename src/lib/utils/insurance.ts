/**
 * Insurance Bet Service
 *
 * Handles the logic for insurance bets in blackjack
 */

import { Hand } from './gameLogic';

/**
 * Result of an insurance bet
 */
export interface InsuranceResult {
    won: boolean;
    amount: number;
    payout: number;
}

/**
 * Check if insurance should be offered
 */
export function shouldOfferInsurance(dealerHand: Hand): boolean {
    // Insurance is only offered when dealer's up card is an Ace
    if (dealerHand.cards.length === 0) return false;

    const dealerUpCard = dealerHand.cards[0];
    return dealerUpCard.rank === 'A';
}

/**
 * Determine if insurance bet wins or loses
 */
export function resolveInsuranceBet(dealerHand: Hand): boolean {
    // Insurance wins if dealer has blackjack
    return dealerHand.isBlackjack;
}

/**
 * Calculate the insurance bet amount
 * Insurance is typically half the original bet
 */
export function calculateInsuranceBet(originalBet: number): number {
    return Math.floor(originalBet / 2);
}

/**
 * Calculate the insurance payout
 * Insurance typically pays 2:1
 */
export function calculateInsurancePayout(insuranceBet: number): number {
    return insuranceBet * 2;
}

/**
 * Check if taking insurance is mathematically correct based on card counting
 */
export function isInsuranceWorthwhile(
    runningCount: number,
    decksRemaining: number,
    threshold: number = 3
): boolean {
    // Convert running count to true count (count per deck)
    const trueCount = decksRemaining > 0 ? runningCount / decksRemaining : 0;

    // Insurance becomes profitable when true count is above threshold
    // The standard rule of thumb is that insurance is worth taking at true count >= 3
    return trueCount >= threshold;
}

/**
 * Get the probability of dealer having blackjack given an Ace upcard
 * This is affected by the count
 */
export function getDealerBlackjackProbability(
    runningCount: number,
    decksRemaining: number
): number {
    // Base probability of dealer having blackjack with Ace upcard
    // In a standard multi-deck game, it's around 31% (4/13)
    const baseProbability = 4 / 13; // Probability of a 10-value card

    // Adjust for running count
    // A positive count means fewer high cards left, so less chance of blackjack
    // A negative count means more high cards left, so greater chance of blackjack

    // Calculate true count
    const trueCount = decksRemaining > 0 ? runningCount / decksRemaining : 0;

    // Adjust probability based on true count
    // Each +1 in true count reduces 10-value concentration by about 1%
    const adjustedProbability = baseProbability - (trueCount * 0.01);

    // Ensure probability stays in valid range
    return Math.max(0, Math.min(1, adjustedProbability));
}

/**
 * Get the expected value of an insurance bet
 */
export function getInsuranceExpectedValue(
    insuranceBet: number,
    dealerBlackjackProbability: number
): number {
    // Insurance pays 2:1
    const win = insuranceBet * 2 * dealerBlackjackProbability;
    const loss = insuranceBet * (1 - dealerBlackjackProbability);

    return win - loss;
}

/**
 * Calculate if an even money offer should be accepted
 * Even money is offered when player has blackjack and dealer shows an Ace
 */
export function shouldTakeEvenMoney(
    runningCount: number,
    decksRemaining: number
): boolean {
    // Even money is equivalent to taking insurance when you have blackjack
    // It's only mathematically correct when insurance is worthwhile
    return isInsuranceWorthwhile(runningCount, decksRemaining);
}