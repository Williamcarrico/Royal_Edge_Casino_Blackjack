'use client';

/**
 * Calculate the insurance bet amount (half of the original bet)
 * @param bet Original bet amount
 * @returns Insurance bet amount
 */
export function calculateInsuranceBet(bet: number): number {
    return bet / 2;
}

/**
 * Calculate the probability of dealer having blackjack based on card counting
 * @param runningCount Current running count
 * @param decksRemaining Number of decks remaining in the shoe
 * @returns Probability of dealer having blackjack
 */
export function getDealerBlackjackProbability(
    runningCount: number,
    decksRemaining: number
): number {
    // Base probability (without card counting)
    const baseProbability = 4 / 13; // Probability of a ten-value card

    // Adjust probability based on the true count
    const trueCount = runningCount / Math.max(1, decksRemaining);

    // Each unit of true count changes the probability by ~0.5%
    const adjustmentFactor = 0.005 * trueCount;

    // Adjusted probability (capped between 0.1 and 0.5)
    return Math.max(0.1, Math.min(0.5, baseProbability - adjustmentFactor));
}

/**
 * Calculate the expected value of taking insurance
 * @param insuranceAmount Insurance bet amount
 * @param blackjackProbability Probability of dealer having blackjack
 * @returns Expected value of the insurance bet
 */
export function getInsuranceExpectedValue(
    insuranceAmount: number,
    blackjackProbability: number
): number {
    // Win amount (2:1 payout)
    const winAmount = insuranceAmount * 2;

    // Expected value calculation
    return (blackjackProbability * winAmount) - ((1 - blackjackProbability) * insuranceAmount);
}