/**
 * @module ProbabilityEngine
 * @description Advanced probability calculation engine for House Edge Blackjack
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card, Rank } from '@/lib/utils/gameLogic';
import { CARD_VALUES } from '@/types/card';
import { GameRules } from '@/types/gameState';
import memoize from 'lodash/memoize';

/**
 * Represents the composition of the current shoe/deck
 */
export interface DeckComposition {
    /** Total cards remaining in the shoe */
    totalCards: number;

    /** Count of each card rank remaining */
    remainingCards: Record<Rank, number>;

    /** Percentage of each card rank remaining */
    cardPercentages: Record<Rank, number>;

    /** Current true count for card counting */
    trueCount: number;

    /** Current running count for card counting */
    runningCount: number;

    /** Decks remaining in the shoe (estimated) */
    decksRemaining: number;
}

/**
 * Represents the probability of drawing a card of a specific value
 */
export interface DrawProbability {
    /** Card value (2-10, J, Q, K, A) */
    value: Rank;

    /** Probability of drawing this card (0-1) */
    probability: number;

    /** Count of this card remaining in the deck */
    remaining: number;

    /** How this card would affect current hand values */
    resultingValues: number[];

    /** Would this card cause a bust with the current hand */
    wouldCauseBust: boolean;
}

/**
 * Represents the probabilities of different outcomes for the dealer
 */
export interface DealerOutcomeProbabilities {
    /** Probability dealer will bust */
    bustProbability: number;

    /** Probability of each possible final total (17-21) */
    finalTotalProbabilities: Record<string, number>;

    /** Expected value of dealer's hand */
    expectedValue: number;

    /** Probability the dealer has blackjack given their up card */
    blackjackProbability: number;
}

/**
 * Represents probabilities for different player decisions
 */
export interface PlayerDecisionProbabilities {
    /** Expected value of standing with current hand */
    standEV: number;

    /** Expected value of hitting with current hand */
    hitEV: number;

    /** Expected value of doubling down with current hand */
    doubleDownEV: number;

    /** Expected value of splitting with current hand (if applicable) */
    splitEV: number | null;

    /** Expected value of taking insurance (if applicable) */
    insuranceEV: number | null;

    /** Expected value of surrendering (if applicable) */
    surrenderEV: number;

    /** The optimal decision based on math */
    optimalDecision: PlayerDecision;

    /** Probabilities of busting with different actions */
    bustProbabilities: {
        afterHit: number;
        afterDoubleDown: number;
    };
}

/**
 * Represents the current house edge based on rules and deck composition
 */
export interface HouseEdgeInfo {
    /** The base house edge with current rules (percentage) */
    baseHouseEdge: number;

    /** Current house edge considering deck composition (percentage) */
    currentHouseEdge: number;

    /** Factors contributing to house edge */
    edgeFactors: {
        blackjackPayoutContribution: number;
        dealerHitSoft17Contribution: number;
        deckCountContribution: number;
        otherRulesContribution: number;
    };

    /** Whether current deck composition favors the player */
    deckFavorsPlayer: boolean;
}

/**
 * Player decision options
 */
export type PlayerDecision = 'hit' | 'stand' | 'double' | 'split' | 'surrender' | 'insurance';

/**
 * Main probability engine class for blackjack calculations
 */
export class BlackjackProbabilityEngine {
    private initialShoeComposition: DeckComposition;
    private currentShoeComposition: DeckComposition;
    private gameRules: GameRules;
    private dealtCards: Card[];

    // Memoized calculation methods
    private readonly memoizedCalculateDealerProbabilities: (upCardValue: number, _: DeckComposition) => DealerOutcomeProbabilities;
    private readonly memoizedCalculatePlayerProbabilities: (handValues: number[], isSoft: boolean, canSplit: boolean, dealerUpValue: number, _: DeckComposition) => PlayerDecisionProbabilities;

    /**
     * Creates a new probability engine instance
     * @param gameRules Current game rules configuration
     */
    constructor(gameRules: GameRules) {
        this.gameRules = gameRules;
        this.dealtCards = [];
        this.initialShoeComposition = this.createInitialShoeComposition(gameRules.decksCount);
        this.currentShoeComposition = { ...this.initialShoeComposition };

        // Create memoized versions of heavy calculation methods
        this.memoizedCalculateDealerProbabilities = memoize(
            (upCardValue: number, _: DeckComposition) =>
                this.calculateDealerProbabilities({ rank: 'A', suit: 'hearts', id: '', value: upCardValue, isFaceUp: true }),
            // Custom resolver function to generate a cache key from the parameters
            (upCardValue: number, deckComposition: DeckComposition) =>
                `${upCardValue}-${deckComposition.totalCards}-${deckComposition.trueCount}`
        );

        this.memoizedCalculatePlayerProbabilities = memoize(
            (handValues: number[], isSoft: boolean, canSplit: boolean, dealerUpValue: number, _: DeckComposition) =>
                this._calculatePlayerProbabilities(handValues, isSoft, canSplit, dealerUpValue, _),
            // Custom resolver for complex parameters
            (handValues: number[], isSoft: boolean, canSplit: boolean, dealerUpValue: number, deckComposition: DeckComposition) =>
                `${handValues.join(',')}-${isSoft}-${canSplit}-${dealerUpValue}-${deckComposition.totalCards}-${deckComposition.trueCount}`
        );
    }

    /**
     * Creates the initial composition for a fresh shoe with given deck count
     * @param deckCount Number of decks in the shoe
     */
    private createInitialShoeComposition(deckCount: number): DeckComposition {
        const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const remainingCards: Record<Rank, number> = {} as Record<Rank, number>;
        const cardPercentages: Record<Rank, number> = {} as Record<Rank, number>;

        // Initialize each rank with the correct count
        ranks.forEach(rank => {
            remainingCards[rank] = deckCount * 4; // 4 cards per deck (one of each suit)
            cardPercentages[rank] = 1 / 13; // Equal probability in a fresh deck
        });

        return {
            totalCards: deckCount * 52,
            remainingCards,
            cardPercentages,
            runningCount: 0,
            trueCount: 0,
            decksRemaining: deckCount
        };
    }

    /**
     * Updates the engine with cards that have been dealt
     * @param cards Array of cards that have been dealt
     */
    public updateDealtCards(cards: Card[]): void {
        this.dealtCards = [...this.dealtCards, ...cards];
        this.updateShoeComposition();
    }

    /**
     * Resets the engine to a fresh shoe state
     */
    public resetShoe(): void {
        this.dealtCards = [];
        this.currentShoeComposition = { ...this.initialShoeComposition };
    }

    /**
     * Updates the current shoe composition based on dealt cards
     */
    private updateShoeComposition(): void {
        // Start with a fresh copy of the initial composition
        const composition = { ...this.initialShoeComposition };
        let runningCount = 0;

        // Subtract each dealt card from the composition
        this.dealtCards.forEach(card => {
            if (composition.remainingCards[card.rank]) {
                composition.remainingCards[card.rank]--;
                composition.totalCards--;

                // Update running count (Hi-Lo system)
                if (card.rank === 'A' || card.rank === '10' || card.rank === 'J' ||
                    card.rank === 'Q' || card.rank === 'K') {
                    runningCount--;
                } else if (card.rank === '2' || card.rank === '3' || card.rank === '4' ||
                    card.rank === '5' || card.rank === '6') {
                    runningCount++;
                }
            }
        });

        // Recalculate percentages
        Object.keys(composition.remainingCards).forEach(rank => {
            composition.cardPercentages[rank as Rank] =
                composition.remainingCards[rank as Rank] / composition.totalCards;
        });

        // Update count metrics
        composition.runningCount = runningCount;
        composition.decksRemaining = composition.totalCards / 52;
        composition.trueCount = composition.decksRemaining > 0
            ? runningCount / composition.decksRemaining
            : 0;

        this.currentShoeComposition = composition;
    }

    /**
     * Gets the current composition of the shoe
     */
    public getDeckComposition(): DeckComposition {
        return this.currentShoeComposition;
    }

    /**
     * Calculates probability of drawing each possible card
     * @param playerCards Current cards in player's hand
     */
    public calculateDrawProbabilities(playerCards: Card[]): DrawProbability[] {
        const composition = this.currentShoeComposition;
        const currentValues = this.calculateHandValues(playerCards);
        const result: DrawProbability[] = [];

        // Calculate for each possible card
        Object.entries(composition.remainingCards).forEach(([rank, remaining]) => {
            if (remaining > 0) {
                const probability = remaining / composition.totalCards;
                const cardValue = CARD_VALUES[rank as Rank];

                // Calculate the resulting hand values if this card is drawn
                const resultingValues = this.calculateResultingHandValues(currentValues, cardValue);

                // Check if drawing this card would cause a bust
                const wouldCauseBust = !resultingValues.some(value => value <= 21);

                result.push({
                    value: rank as Rank,
                    probability,
                    remaining,
                    resultingValues,
                    wouldCauseBust
                });
            }
        });

        return result;
    }

    /**
     * Calculates the probabilities of different dealer outcomes
     * @param dealerUpCard The dealer's face-up card
     */
    public calculateDealerProbabilities(dealerUpCard: Card): DealerOutcomeProbabilities {
        // Get the initial value of the dealer's hand
        const upCardValue = CARD_VALUES[dealerUpCard.rank][0];

        // Use the memoized version
        return this.memoizedCalculateDealerProbabilities(upCardValue, this.currentShoeComposition);
    }

    /**
     * Calculates the probability of the dealer having blackjack
     * given their up card
     * @param upCard The dealer's face-up card
     */
    private calculateDealerBlackjackProbability(upCard: Card): number {
        const composition = this.currentShoeComposition;

        if (upCard.rank === 'A') {
            // Need a 10-value card for blackjack
            const tenValueCards = composition.remainingCards['10'] +
                composition.remainingCards['J'] +
                composition.remainingCards['Q'] +
                composition.remainingCards['K'];

            return tenValueCards / (composition.totalCards - 1);
        }
        else if (upCard.rank === '10' || upCard.rank === 'J' ||
            upCard.rank === 'Q' || upCard.rank === 'K') {
            // Need an Ace for blackjack
            return composition.remainingCards['A'] / (composition.totalCards - 1);
        }

        return 0; // Impossible with other up cards
    }

    /**
     * Simulates possible dealer outcomes using Monte Carlo method
     * @param initialValue Starting value of dealer's hand
     * @param hasSoftAce Whether the dealer has a soft Ace
     */
    private simulateDealerOutcomes(
        initialValue: number,
        hasSoftAce: boolean
    ): {
        bustProbability: number;
        finalTotalProbabilities: Record<string, number>;
        expectedValue: number;
    } {
        // For real accuracy we would run thousands of simulations
        // For this implementation we'll use exact probability calculations

        const finalTotals: Record<string, number> = {
            17: 0, 18: 0, 19: 0, 20: 0, 21: 0
        };

        let bustCount = 0;
        const simulations = 10000;

        // Run simulations
        for (let i = 0; i < simulations; i++) {
            const result = this.simulateDealerHand(initialValue, hasSoftAce);
            if (result > 21) {
                bustCount++;
            } else if (result >= 17) {
                finalTotals[result.toString()] = (finalTotals[result.toString()] || 0) + 1;
            }
        }

        // Convert to probabilities
        const finalTotalProbabilities: Record<string, number> = {};
        let expectedValue = 0;

        Object.entries(finalTotals).forEach(([total, count]) => {
            const probability = count / simulations;
            finalTotalProbabilities[total] = probability;
            expectedValue += parseInt(total) * probability;
        });

        // Account for busts in expected value
        const bustProbability = bustCount / simulations;

        return {
            bustProbability,
            finalTotalProbabilities,
            expectedValue: expectedValue + (0 * bustProbability) // Bust is worth 0
        };
    }

    /**
     * Simulates a single dealer hand from the initial state to completion
     * @param initialValue Starting value of dealer's hand
     * @param hasSoftAce Whether the dealer has a soft Ace
     */
    private simulateDealerHand(initialValue: number, hasSoftAce: boolean): number {
        // Start with the dealer's initial hand
        let currentValue = initialValue;
        let isSoft = hasSoftAce;

        // Dealer must draw until reaching at least 17
        while (currentValue < 17 || (currentValue === 17 && isSoft && this.gameRules.dealerHitsSoft17)) {
            // Simulate drawing a card
            const drawnRank = this.simulateRandomDraw();

            // Get possible values for the drawn card
            const cardValues = CARD_VALUES[drawnRank];

            // If we have an Ace with a soft hand, choose the best value
            if (drawnRank === 'A' && !isSoft && currentValue + 11 <= 21) {
                // Use Ace as 11 if it doesn't bust
                currentValue += 11;
                isSoft = true;
            }
            else if (drawnRank === 'A') {
                // Otherwise use Ace as 1
                currentValue += 1;
            }
            else {
                currentValue += cardValues[0];
            }

            // If we bust with a soft Ace, convert it to hard
            if (isSoft && currentValue > 21) {
                currentValue -= 10; // Convert Ace from 11 to 1
                isSoft = false;
            }
        }

        return currentValue;
    }

    /**
     * Simulates drawing a random card from the current shoe
     */
    private simulateRandomDraw(): Rank {
        const composition = this.currentShoeComposition;
        const randomValue = Math.random() * composition.totalCards;

        let cumulative = 0;
        for (const [rank, count] of Object.entries(composition.remainingCards)) {
            cumulative += count;
            if (randomValue < cumulative) {
                return rank as Rank;
            }
        }

        // Fallback (shouldn't reach here if implementation is correct)
        return '10';
    }

    /**
     * Calculates the probabilities for different player decisions
     * @param playerCards The cards in the player's hand
     * @param dealerUpCard The dealer's face-up card
     */
    public calculatePlayerDecisionProbabilities(
        playerCards: Card[],
        dealerUpCard: Card
    ): PlayerDecisionProbabilities {
        const playerValues = this.calculateHandValues(playerCards);
        const isSoft = playerCards.some(card => card.rank === 'A');
        const canSplit = playerCards.length === 2 && playerCards[0].rank === playerCards[1].rank;
        const dealerUpValue = CARD_VALUES[dealerUpCard.rank][0];

        // Use the memoized version for complex calculations
        return this.memoizedCalculatePlayerProbabilities(
            playerValues,
            isSoft,
            canSplit,
            dealerUpValue,
            this.currentShoeComposition
        );
    }

    /**
     * Simulates outcomes of hitting the current hand
     * @param playerCards Current cards in player's hand
     */
    private simulateHitOutcomes(playerCards: Card[]): {
        expectedValue: number;
        bustProbability: number;
    } {
        const drawProbabilities = this.calculateDrawProbabilities(playerCards);
        let expectedValue = 0;
        let bustProbability = 0;

        // Calculate the expected value of hitting
        drawProbabilities.forEach(draw => {
            if (draw.wouldCauseBust) {
                // Busting is -1 EV (lose your bet)
                expectedValue += draw.probability * -1;
                bustProbability += draw.probability;
            } else {
                // For non-busting hands, recursively consider the new hand
                // The deeper we go, the more accurate but more expensive
                // We'll cap at one level of recursion for performance
                const bestValue = this.getBestHandValue(draw.resultingValues);

                if (bestValue === 21) {
                    // Getting 21 is generally good
                    expectedValue += draw.probability * 0.8; // Approximate, might not win
                } else if (bestValue >= 17) {
                    // Standing on 17+ has a decent chance
                    expectedValue += draw.probability * 0.5; // Approximate
                } else {
                    // Lower values have worse expectation
                    expectedValue += draw.probability * 0.2; // Approximate
                }
            }
        });

        return { expectedValue, bustProbability };
    }

    /**
     * Calculates the expected value of standing with the current hand
     * @param playerValue Best value of player's hand
     * @param dealerUpCard Dealer's face-up card
     */
    private calculateStandingEV(playerValue: number, dealerUpCard: Card): number {
        // If player has busted, always -1
        if (playerValue > 21) {
            return -1;
        }

        // Calculate dealer probabilities
        const dealerProbs = this.calculateDealerProbabilities(dealerUpCard);

        let expectedValue = 0;

        // Dealer busts - player wins
        expectedValue += dealerProbs.bustProbability * 1;

        // Dealer doesn't bust - compare hands
        Object.entries(dealerProbs.finalTotalProbabilities).forEach(([total, probability]) => {
            const dealerValue = parseInt(total);

            if (playerValue > dealerValue) {
                // Player wins
                expectedValue += probability * 1;
            } else if (playerValue < dealerValue) {
                // Player loses
                expectedValue += probability * -1;
            } else {
                // Push
                expectedValue += probability * 0;
            }
        });

        return expectedValue;
    }

    /**
     * Calculates the expected value of doubling down
     * @param playerCards Current cards in player's hand
     * @param dealerUpCard Dealer's face-up card
     */
    private calculateDoubleDownEV(playerCards: Card[], dealerUpCard: Card): number {
        const drawProbabilities = this.calculateDrawProbabilities(playerCards);
        let expectedValue = 0;

        // Calculate the expected value of doubling down
        drawProbabilities.forEach(draw => {
            if (draw.wouldCauseBust) {
                // Busting is -2 EV (lose double your bet)
                expectedValue += draw.probability * -2;
            } else {
                // For non-busting hands, calculate stand EV with the new hand
                const bestValue = this.getBestHandValue(draw.resultingValues);
                const standEV = this.calculateStandingEV(bestValue, dealerUpCard);

                // Double the EV since we're doubling our bet
                expectedValue += draw.probability * (standEV * 2);
            }
        });

        return expectedValue;
    }

    /**
     * Calculates the expected value of splitting a pair
     * @param card One of the cards in the pair (both are the same)
     * @param _ Dealer's face-up card (unused)
     */
    private calculateSplitEV(card: Card, _: Card): number {
        // This is a complex calculation that depends on multiple factors
        // For simplicity, we'll estimate based on the card rank

        // Approximate values based on standard blackjack strategy
        if (card.rank === 'A') {
            return 1.5; // Splitting Aces is very favorable
        } else if (card.rank === '8') {
            return 0.8; // Eights are also good to split
        } else if (card.rank === '9') {
            return 0.6; // Nines are generally good to split
        } else if (card.rank === '7') {
            return 0.4; // Sevens depend on dealer upcard
        } else if (card.rank === '6') {
            return 0.2; // Sixes are marginally good to split
        } else if (card.rank === '2' || card.rank === '3') {
            return 0.1; // Low pairs can be slightly positive
        } else if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K' || card.rank === '10') {
            return -0.5; // 10-value pairs are usually better to keep
        } else {
            return -0.2; // Other pairs depend heavily on dealer upcard
        }
    }

    /**
     * Calculates the expected value of taking insurance
     */
    private calculateInsuranceEV(): number {
        const composition = this.currentShoeComposition;

        // Insurance is a side bet that dealer has blackjack
        // It pays 2:1, so we need to calculate the probability of dealer having blackjack

        // Probability of dealer having a 10-value card as hole card
        const tenValueCards = composition.remainingCards['10'] +
            composition.remainingCards['J'] +
            composition.remainingCards['Q'] +
            composition.remainingCards['K'];

        const probabilityOfTen = tenValueCards / (composition.totalCards - 1);

        // Insurance bet is half your original bet
        // If dealer has blackjack, you win 2:1 on your insurance bet (so win 1)
        // If dealer doesn't have blackjack, you lose your insurance bet (so lose 0.5)

        const winAmount = probabilityOfTen * 1;
        const loseAmount = (1 - probabilityOfTen) * -0.5;

        return winAmount + loseAmount;
    }

    /**
     * Determines the optimal decision based on expected values
     */
    private determineOptimalDecision(
        standEV: number,
        hitEV: number,
        doubleDownEV: number,
        splitEV: number | null,
        insuranceEV: number | null,
        surrenderEV: number
    ): PlayerDecision {
        // Start with the base options
        const bestEV = Math.max(standEV, hitEV, doubleDownEV, surrenderEV);
        let bestDecision: PlayerDecision;

        if (bestEV === standEV) bestDecision = 'stand';
        else if (bestEV === hitEV) bestDecision = 'hit';
        else if (bestEV === doubleDownEV) bestDecision = 'double';
        else if (bestEV === surrenderEV) bestDecision = 'surrender';
        else bestDecision = 'stand'; // Fallback (shouldn't happen with Math.max)

        // Check if split is better (if applicable)
        if (splitEV !== null && splitEV > bestEV) {
            bestDecision = 'split';
        }

        // Check if insurance is better (if applicable)
        if (insuranceEV !== null && insuranceEV > 0) {
            bestDecision = 'insurance';
        }

        return bestDecision;
    }

    /**
     * Calculates the current house edge
     */
    public calculateHouseEdge(): HouseEdgeInfo {
        // Base house edge calculation
        let baseEdge = 0.0;

        // Factor 1: Blackjack payout
        let blackjackPayoutEffect: number;
        if (this.gameRules.blackjackPays === 1.5) {
            blackjackPayoutEffect = 0;  // The "standard" 3:2 payout
        } else if (this.gameRules.blackjackPays === 1.2) {
            blackjackPayoutEffect = 0.017; // Approximately 1.7% increase in house edge
        } else {
            blackjackPayoutEffect = 0.025; // Even worse payout
        }

        // Factor 2: Dealer hits on soft 17
        const dealerHitsSoft17Effect = this.gameRules.dealerHitsSoft17 ? 0.002 : 0;

        // Factor 3: Number of decks
        let deckCountEffect: number;
        if (this.gameRules.decksCount === 1) {
            deckCountEffect = -0.005; // Single deck is slightly better for player
        } else if (this.gameRules.decksCount === 2) {
            deckCountEffect = -0.002;
        } else {
            deckCountEffect = 0; // Multiple decks are standard
        }

        // Factor 4: Other rules
        let otherRulesEffect = 0;

        // Double after split allowed
        if (this.gameRules.canDoubleAfterSplit) {
            otherRulesEffect -= 0.0015;
        }

        // Surrender allowed
        if (this.gameRules.playerCanSurrender) {
            otherRulesEffect -= 0.001;
        }

        // Calculate base house edge
        baseEdge = 0.005 + blackjackPayoutEffect + dealerHitsSoft17Effect +
            deckCountEffect + otherRulesEffect;

        // Adjust house edge based on current deck composition
        const deckAdjustment = this.calculateDeckCompositionEdgeAdjustment();
        const currentHouseEdge = baseEdge + deckAdjustment;

        return {
            baseHouseEdge: baseEdge * 100, // Convert to percentage
            currentHouseEdge: currentHouseEdge * 100,
            edgeFactors: {
                blackjackPayoutContribution: blackjackPayoutEffect * 100,
                dealerHitSoft17Contribution: dealerHitsSoft17Effect * 100,
                deckCountContribution: deckCountEffect * 100,
                otherRulesContribution: otherRulesEffect * 100
            },
            deckFavorsPlayer: deckAdjustment < 0
        };
    }

    /**
     * Calculates how much the current deck composition
     * adjusts the house edge
     */
    private calculateDeckCompositionEdgeAdjustment(): number {
        const trueCount = this.currentShoeComposition.trueCount;

        // Each true count point is approximately worth 0.5% in player advantage
        return -0.005 * trueCount;
    }

    // Utility methods

    /**
     * Calculates all possible hand values
     * @param cards Cards in the hand
     */
    private calculateHandValues(cards: Card[]): number[] {
        if (cards.length === 0) {
            return [0];
        }

        // Calculate all possible values of the hand
        let values = [0];

        cards.forEach(card => {
            const cardValues = CARD_VALUES[card.rank];
            const newValues: number[] = [];

            // Calculate all possible hand values with this card
            values.forEach(currentValue => {
                cardValues.forEach((cardValue: number) => {
                    newValues.push(currentValue + cardValue);
                });
            });

            values = newValues;
        });

        return values;
    }

    /**
     * Calculates resulting hand values after adding a card
     * @param currentValues Current possible hand values
     * @param cardValues Possible values of the card to add
     */
    private calculateResultingHandValues(currentValues: number[], cardValues: number[]): number[] {
        const resultingValues: number[] = [];

        currentValues.forEach(currentValue => {
            cardValues.forEach(cardValue => {
                resultingValues.push(currentValue + cardValue);
            });
        });

        return resultingValues;
    }

    /**
     * Gets the best (highest non-busting) value from a list of hand values
     * @param values List of possible hand values
     */
    private getBestHandValue(values: number[]): number {
        // Sort values in descending order
        const sortedValues = [...values].sort((a, b) => b - a);

        // Find the highest value that doesn't bust
        for (const value of sortedValues) {
            if (value <= 21) {
                return value;
            }
        }

        // If all values bust, return the lowest one
        return sortedValues[sortedValues.length - 1];
    }

    /**
     * Updates the game rules configuration
     * @param gameRules New game rules
     */
    public updateGameRules(gameRules: GameRules): void {
        this.gameRules = gameRules;

        // If deck count changed, reset the shoe
        if (gameRules.decksCount !== this.initialShoeComposition.decksRemaining) {
            this.initialShoeComposition = this.createInitialShoeComposition(gameRules.decksCount);
            this.resetShoe();
        }
    }

    /**
     * Helper to convert a number to card rank
     */
    private getCardRank(value: number): Rank {
        if (value === 1) return 'A';
        if (value === 10) return '10';
        return value.toString() as Rank;
    }

    /**
     * Internal method to calculate player probabilities
     * Used by the memoized version
     */
    private _calculatePlayerProbabilities(
        handValues: number[],
        isSoft: boolean,
        canSplit: boolean,
        dealerUpValue: number,
        _: DeckComposition
    ): PlayerDecisionProbabilities {
        // Create dealer card
        const dealerRank = this.getCardRank(dealerUpValue);
        const dealerUpCard: Card = {
            rank: dealerRank,
            suit: 'hearts',
            id: '',
            value: dealerUpValue,
            isFaceUp: true
        };

        const playerCards: Card[] = [];

        // Create player cards
        if (canSplit) {
            this.createSplitPlayerCards(handValues[0], playerCards);
        } else {
            this.createNonSplitPlayerCards(handValues[0], playerCards);
        }

        return this.calculatePlayerDecisionProbabilities(playerCards, dealerUpCard);
    }

    /**
     * Helper to create split player cards
     */
    private createSplitPlayerCards(handValue: number, cards: Card[]): void {
        const cardValue = handValue / 2;
        const rank = this.getCardRank(cardValue);

        cards.push(
            { rank, suit: 'hearts', id: '1', value: cardValue, isFaceUp: true },
            { rank, suit: 'diamonds', id: '2', value: cardValue, isFaceUp: true }
        );
    }

    /**
     * Helper to create non-split player cards
     */
    private createNonSplitPlayerCards(handValue: number, cards: Card[]): void {
        // Add first card (always 10 for simplicity)
        cards.push({
            rank: '10',
            suit: 'hearts',
            id: '1',
            value: 10,
            isFaceUp: true
        });

        // Add second card if needed
        if (handValue > 10) {
            const secondValue = handValue - 10;
            const rank = this.getCardRank(secondValue);

            cards.push({
                rank,
                suit: 'diamonds',
                id: '2',
                value: secondValue,
                isFaceUp: true
            });
        }
    }
}