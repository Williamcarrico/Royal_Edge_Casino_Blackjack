/**
 * Tests for game logic functions with a focus on hand calculation and result determination
 */

import {
    calculateHandValues,
    getBestHandValue,
    determineRoundResult,
    createHand,
    addCardToHand
} from '@/lib/utils/gameLogic';

// Mock a card
const createCard = (rank: string, suit: string, isFaceUp: boolean = true) => ({
    id: `test-${rank}-${suit}`,
    rank,
    suit,
    value: rank === 'A' ? 11 : (rank === 'K' || rank === 'Q' || rank === 'J') ? 10 : parseInt(rank, 10),
    isFaceUp
});

// Test case from the image: A♥ + 3♠ vs A♠ + 3♥ + 10♣
describe('Hand value calculation for equal values (from issue)', () => {
    // Create dealer hand: A♥ + 3♠
    const dealerHand = createHand();
    const dealerAce = createCard('A', 'hearts', true);
    const dealerThree = createCard('3', 'spades', true);

    // Create player hand: A♠ + 3♥ + 10♣
    const playerHand = createHand();
    const playerAce = createCard('A', 'spades', true);
    const playerThree = createCard('3', 'hearts', true);
    const playerTen = createCard('10', 'clubs', true);

    test('Dealer hand (A♥ + 3♠) should have values [4, 14] and be a soft 14', () => {
        const updatedDealerHand = addCardToHand(addCardToHand(dealerHand, dealerAce), dealerThree);

        // Check dealer values
        expect(updatedDealerHand.values).toContain(4); // A=1 + 3=3 = 4
        expect(updatedDealerHand.values).toContain(14); // A=11 + 3=3 = 14
        expect(updatedDealerHand.isSoft).toBe(true);

        // Best value should be 14 (soft)
        const bestValue = getBestHandValue(updatedDealerHand.values);
        expect(bestValue).toBe(14);
    });

    test('Player hand (A♠ + 3♥ + 10♣) should have value 14', () => {
        const updatedPlayerHand = addCardToHand(
            addCardToHand(
                addCardToHand(playerHand, playerAce),
                playerThree
            ),
            playerTen
        );

        // Check player values
        // With A=11: 11 + 3 + 10 = 24 (busts)
        // With A=1: 1 + 3 + 10 = 14
        expect(updatedPlayerHand.values).toContain(14);

        // Best value should be 14
        const bestValue = getBestHandValue(updatedPlayerHand.values);
        expect(bestValue).toBe(14);
    });

    test('Result should be a push when both dealer and player have 14', () => {
        const updatedDealerHand = addCardToHand(addCardToHand(dealerHand, dealerAce), dealerThree);
        const updatedPlayerHand = addCardToHand(
            addCardToHand(
                addCardToHand(playerHand, playerAce),
                playerThree
            ),
            playerTen
        );

        const result = determineRoundResult(updatedPlayerHand, updatedDealerHand);
        expect(result).toBe('push');
    });
});

// Test additional edge cases
describe('Edge cases for hand value calculation', () => {
    test('Hand with all aces should have multiple values', () => {
        const hand = createHand();
        const aceHearts = createCard('A', 'hearts');
        const aceSpades = createCard('A', 'spades');

        const updatedHand = addCardToHand(addCardToHand(hand, aceHearts), aceSpades);

        // Should have values [2, 12]
        expect(updatedHand.values).toContain(2); // A=1 + A=1 = 2
        expect(updatedHand.values).toContain(12); // A=1 + A=11 = 12

        // Should be soft
        expect(updatedHand.isSoft).toBe(true);
    });

    test('Empty hand should have value 0', () => {
        const hand = createHand();
        expect(getBestHandValue(hand.values)).toBe(0);
    });

    test('Bust hand should return lowest value', () => {
        const values = [22, 32];
        expect(getBestHandValue(values)).toBe(22);
    });

    test('Player blackjack beats dealer 21 (non-blackjack)', () => {
        const playerHand = createHand();
        playerHand.cards = [createCard('A', 'hearts'), createCard('K', 'spades')];
        playerHand.values = [11, 21];
        playerHand.isBlackjack = true;

        const dealerHand = createHand();
        dealerHand.cards = [createCard('7', 'hearts'), createCard('7', 'diamonds'), createCard('7', 'spades')];
        dealerHand.values = [21];
        dealerHand.isBlackjack = false;

        expect(determineRoundResult(playerHand, dealerHand)).toBe('blackjack');
    });
});