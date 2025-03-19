// In src/lib/utils/debug.ts
import { createCard, calculateHandValues, getBestHandValue } from './gameLogic';

/**
 * Debug function to test hand calculations with specific card combinations
 */
export function testHandCalculation(cards: { rank: string, suit: string }[]): void {
    console.group('Hand Calculation Test');

    // Create the cards
    const handCards = cards.map(card => createCard(card.rank, card.suit, true));
    console.log('Test cards:', handCards.map(c => `${c.rank}${c.suit[0]}`));

    // Calculate values
    const values = calculateHandValues(handCards);
    console.log('Calculated values:', values);

    // Get best value
    const bestValue = getBestHandValue(values);
    console.log('Best value:', bestValue);

    console.groupEnd();
}

/**
 * Test function specifically for the scenario in the image (dealer has two 2s)
 */
export function testDealerTwoTwosScenario(): void {
    console.group('Testing Dealer Two Twos Scenario');

    const dealerCards = [
        createCard('2', 'diamonds', true),
        createCard('2', 'spades', true)
    ];

    console.log('Dealer cards:', dealerCards.map(c => `${c.rank}${c.suit[0]}`));

    // Calculate values
    const values = calculateHandValues(dealerCards);
    console.log('Calculated values:', values);

    // Get best value
    const bestValue = getBestHandValue(values);
    console.log('Best value:', bestValue);

    // Determine if dealer should hit
    const dealerHitsSoft17 = true; // Assuming standard rule
    const isSoft = false; // Two 2s is not a soft hand
    const dealerMustHit = bestValue < 17 || (bestValue === 17 && isSoft && dealerHitsSoft17);

    console.log('Dealer must hit:', dealerMustHit);
    console.log('Expected status message:', `Dealer has ${bestValue} and must hit`);

    console.groupEnd();
}

/**
 * Run all tests for debugging
 */
export function runAllTests(): void {
    console.group('Card Value Calculation Tests');

    testHandCalculation([{ rank: '2', suit: 'diamonds' }, { rank: '2', suit: 'spades' }]);
    testHandCalculation([{ rank: 'A', suit: 'hearts' }, { rank: '3', suit: 'spades' }]);
    testHandCalculation([{ rank: 'A', suit: 'spades' }, { rank: '3', suit: 'hearts' }, { rank: '10', suit: 'clubs' }]);

    console.groupEnd();
}