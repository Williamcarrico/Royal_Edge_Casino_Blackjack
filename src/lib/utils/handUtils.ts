import { Card, Hand, calculateHandValues, getBestHandValue, isBusted } from './gameLogic';

/**
 * Safe operations for working with hands in the game
 */
export const handUtils = {
    /**
     * Adds a card to a hand and recalculates all values
     */
    addCard(hand: Hand, card: Card): Hand {
        // Make defensive copies to prevent mutation
        const updatedCards = [...hand.cards, card];

        // Calculate values with extra verification
        const newValues = calculateHandValues(updatedCards);

        // Enhanced soft hand detection
        const hasAce = updatedCards.some(c => c.rank === 'A' && c.isFaceUp);
        const hasSoftCount = newValues.length > 1;

        // Determine if the hand is soft - only if we have an ace AND there's a non-busting soft count
        const isSoft = hasAce && hasSoftCount && newValues.some(v => v <= 21);

        // Check if hand is busted with extra safety
        const allValuesBust = Array.isArray(newValues) && newValues.every(v => v > 21);

        // Debug logging for important hands
        if (getBestHandValue(newValues) >= 17) {
            console.log('[handUtils.addCard] Important hand update:', {
                cards: updatedCards.map(c => `${c.rank}${c.suit[0]}`),
                values: newValues,
                hasAce,
                hasSoftCount,
                isSoft,
                isBusted: allValuesBust
            });
        }

        return {
            ...hand,
            cards: updatedCards,
            values: newValues,
            isSoft,
            isBusted: allValuesBust
        };
    },

    /**
     * Creates a hand for splitting from a single card
     */
    createSplitHand(card: Card, id: string): Hand {
        return {
            id,
            cards: [card],
            values: calculateHandValues([card]),
            isSoft: card.rank === 'A',
            isBlackjack: false,
            canSplit: false,
            isBusted: false
        };
    },

    /**
     * Safely gets the best value of a hand, with a fallback value
     */
    getBestValue(hand: Hand | undefined | null, fallback = 0): number {
        // Defensive check for missing hand
        if (!hand) {
            return fallback;
        }

        // Defensive check for missing values
        if (!hand.values || !Array.isArray(hand.values) || hand.values.length === 0) {
            console.warn('[handUtils.getBestValue] Hand has no valid values:', hand);
            return fallback;
        }

        // Find non-busting values (21 or under)
        const nonBustingValues = hand.values.filter(v => v <= 21);

        // If we have non-busting values, return the highest one
        if (nonBustingValues.length > 0) {
            return Math.max(...nonBustingValues);
        }

        // All values bust, return the lowest (least bad)
        return Math.min(...hand.values);
    },

    /**
     * Safely checks if a hand can be split
     */
    canSplit(hand: Hand | undefined | null): boolean {
        if (!hand || hand.cards.length !== 2) return false;
        return hand.cards[0].value === hand.cards[1].value;
    },

    /**
     * Checks if a hand is a blackjack (21 with exactly 2 cards)
     */
    isBlackjack(hand: Hand | undefined | null): boolean {
        if (!hand || hand.cards.length !== 2) return false;
        return getBestHandValue(hand.values) === 21;
    },

    /**
     * Gets a human-readable description of the hand value
     */
    getHandDescription(hand: Hand | undefined | null): string {
        if (!hand) return 'No hand';
        if (hand.isBlackjack) return 'Blackjack!';
        if (hand.isBusted) return 'Busted!';

        const bestValue = getBestHandValue(hand.values);
        const isSoft = hand.values.length > 1 && hand.values.includes(bestValue);

        return isSoft ? `Soft ${bestValue}` : `${bestValue}`;
    }
};