import { Card } from './gameLogic';

/**
 * Result of a card counting operation
 */
export interface CountingResult {
    runningCount: number;
    trueCount: number;
}

/**
 * Updates the running count and true count after a card is dealt
 */
export function updateCardCounting(
    currentRunningCount: number,
    dealtCard: Card,
    remainingCards: number
): CountingResult {
    let runningCount = currentRunningCount;

    // Update running count based on card value
    if (dealtCard.value >= 10) {
        runningCount--;
    } else if (dealtCard.value <= 6) {
        runningCount++;
    }

    // Calculate true count (running count per deck remaining)
    const decksRemaining = remainingCards / 52;
    const trueCount = decksRemaining > 0 ? runningCount / decksRemaining : 0;

    return { runningCount, trueCount };
}

/**
 * Calculate the running count for a set of cards
 */
export function calculateRunningCountForCards(cards: Card[]): number {
    return cards.reduce((count, card) => {
        if (card.isFaceUp) {
            if (card.value >= 10) return count - 1;
            if (card.value <= 6) return count + 1;
        }
        return count;
    }, 0);
}

/**
 * Gets a text description of the true count
 */
export function getTrueCountDescription(trueCount: number): string {
    const absoluteCount = Math.abs(trueCount);

    if (absoluteCount < 1) return 'Neutral';
    if (absoluteCount < 2) return trueCount > 0 ? 'Slightly positive' : 'Slightly negative';
    if (absoluteCount < 3) return trueCount > 0 ? 'Positive' : 'Negative';
    if (absoluteCount < 5) return trueCount > 0 ? 'Very positive' : 'Very negative';
    return trueCount > 0 ? 'Extremely positive' : 'Extremely negative';
}

/**
 * Gets the betting recommendation based on the true count
 */
export function getBettingRecommendation(trueCount: number): string {
    if (trueCount <= -2) return 'Minimum bet';
    if (trueCount < 0) return 'Small bet';
    if (trueCount < 2) return 'Medium bet';
    if (trueCount < 4) return 'Large bet';
    return 'Maximum bet';
}

/**
 * Gets the play recommendation based on the true count for various situations
 */
export function getPlayRecommendation(
    trueCount: number,
    playerTotal: number,
    dealerUpCardValue: number
): string {
    // Check for count-dependent strategy deviations first
    const deviation = getCountBasedDeviation(trueCount, playerTotal, dealerUpCardValue);
    if (deviation) return deviation;

    // Default to basic strategy
    return getBasicStrategyPlay(playerTotal, dealerUpCardValue);
}

/**
 * Get count-based deviations from basic strategy
 */
function getCountBasedDeviation(
    trueCount: number,
    playerTotal: number,
    dealerUpCardValue: number
): string | null {
    // Map of special cases where count affects basic strategy
    const deviationMap = [
        { hand: 16, dealer: 10, countThreshold: 0, play: 'Stand' },
        { hand: 15, dealer: 10, countThreshold: 4, play: 'Stand' },
        { hand: 12, dealer: 3, countThreshold: 2, play: 'Stand' },
        { hand: 12, dealer: 2, countThreshold: 3, play: 'Stand' }
    ];

    // Find matching deviation
    const deviation = deviationMap.find(d =>
        d.hand === playerTotal &&
        d.dealer === dealerUpCardValue &&
        trueCount >= d.countThreshold
    );

    return deviation ? deviation.play : null;
}

/**
 * Get basic strategy recommendation without count considerations
 */
function getBasicStrategyPlay(playerTotal: number, dealerUpCardValue: number): string {
    if (playerTotal >= 17) return 'Stand';
    if (playerTotal <= 8) return 'Hit';
    if (dealerUpCardValue >= 7) return 'Hit';
    if (playerTotal >= 13) return 'Stand';
    if (playerTotal === 12 && dealerUpCardValue <= 3) return 'Hit';
    return 'Stand';
}