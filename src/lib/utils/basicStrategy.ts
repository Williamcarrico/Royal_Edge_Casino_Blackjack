/**
 * @module BasicStrategy
 * @description Implements basic strategy for blackjack
 */

import { Card, Rank } from '@/lib/utils/gameLogic';
import { GameRules } from '@/types/gameState';

// Types
export type PlayerAction = 'hit' | 'stand' | 'double' | 'split' | 'surrender' | null;
export type HandType = 'hard' | 'soft' | 'pair';

// Strategy chart interfaces
interface StrategyChart {
    hard: Record<number, Record<Rank, PlayerAction>>;
    soft: Record<number, Record<Rank, PlayerAction>>;
    pairs: Record<Rank, Record<Rank, PlayerAction>>;
}

/**
 * Main class for basic strategy recommendations
 */
export class BasicStrategy {
    private rules: GameRules;
    private strategyChart: StrategyChart;

    /**
     * Creates a new basic strategy instance
     * @param rules Game rules configuration
     */
    constructor(rules: GameRules) {
        this.rules = rules;
        this.strategyChart = this.buildStrategyChart(rules);
    }

    /**
     * Updates the strategy based on new rules
     * @param rules New game rules
     */
    public updateRules(rules: GameRules): void {
        this.rules = rules;
        this.strategyChart = this.buildStrategyChart(rules);
    }

    /**
     * Gets the recommended action based on basic strategy
     * @param playerCards Player's current cards
     * @param dealerUpCard Dealer's face-up card
     * @param canSurrender Whether surrender is an option
     * @param canDouble Whether double down is an option
     * @param canSplit Whether split is an option
     */
    public getRecommendedAction(
        playerCards: Card[],
        dealerUpCard: Card,
        canSurrender: boolean = this.rules.playerCanSurrender,
        canDouble: boolean = true,
        canSplit: boolean = true
    ): PlayerAction {
        // Validate inputs
        if (!playerCards || playerCards.length === 0 || !dealerUpCard) {
            console.error('Invalid inputs to getRecommendedAction:', { playerCards, dealerUpCard });
            return 'stand'; // Safe default
        }

        console.log('Getting strategy for:', {
            playerCards: playerCards.map(c => `${c.rank}${c.suit}`),
            dealerUpCard: `${dealerUpCard.rank}${dealerUpCard.suit}`,
            canSurrender,
            canDouble,
            canSplit
        });

        // Handle pairs first
        if (playerCards.length === 2 && playerCards[0].rank === playerCards[1].rank && canSplit) {
            const action = this.getPairAction(playerCards[0].rank, dealerUpCard.rank);
            console.log(`Pair strategy recommendation: ${action}`);
            return action;
        }

        // Check for aces (soft hands)
        const hasAce = playerCards.some(card => card.rank === 'A');
        const handValue = this.calculateHandValue(playerCards);

        // If we have a valid hand value and an ace that counts as 11, use soft strategy
        if (hasAce && handValue <= 21 && this.hasSoftAce(playerCards)) {
            const action = this.getSoftHandAction(handValue, dealerUpCard.rank, canDouble);
            console.log(`Soft hand strategy recommendation: ${action}`);
            return action;
        }

        // Otherwise use hard strategy
        const action = this.getHardHandAction(handValue, dealerUpCard.rank, canDouble, canSurrender);
        console.log(`Hard hand strategy recommendation: ${action}`);
        return action;
    }

    /**
     * Gets the strategy recommendation for a pair
     * @param pairRank Rank of the paired cards
     * @param dealerRank Rank of dealer's up card
     */
    private getPairAction(pairRank: Rank, dealerRank: Rank): PlayerAction {
        // Make sure the chart exists for this pair
        if (!this.strategyChart.pairs[pairRank]) {
            console.warn(`No pair strategy for ${pairRank}s`);
            return 'hit'; // Safe default
        }

        // Get the recommendation from the chart or default to hit
        const action = this.strategyChart.pairs[pairRank]?.[dealerRank];

        if (!action) {
            console.warn(`No pair strategy for ${pairRank}s against dealer ${dealerRank}`);
            // For 10-value cards (10,J,Q,K) always stand on pairs
            if (['10', 'J', 'Q', 'K'].includes(pairRank)) {
                return 'stand';
            }
            // For Aces always split
            if (pairRank === 'A') {
                return 'split';
            }
            // For 8s usually split
            if (pairRank === '8') {
                return 'split';
            }
            // Default to hit for other pairs
            return 'hit';
        }

        return action;
    }

    /**
     * Gets the strategy recommendation for a soft hand
     * @param handValue Total value of the hand
     * @param dealerRank Rank of dealer's up card
     * @param canDouble Whether double down is an option
     */
    private getSoftHandAction(
        handValue: number,
        dealerRank: Rank,
        canDouble: boolean
    ): PlayerAction {
        const action = this.strategyChart.soft[handValue]?.[dealerRank];

        // If the recommended action is double but we can't double, hit instead
        if (action === 'double' && !canDouble) {
            return 'hit';
        }

        return action ?? 'hit';
    }

    /**
     * Gets the strategy recommendation for a hard hand
     * @param handValue Total value of the hand
     * @param dealerRank Rank of dealer's up card
     * @param canDouble Whether double down is an option
     * @param canSurrender Whether surrender is an option
     */
    private getHardHandAction(
        handValue: number,
        dealerRank: Rank,
        canDouble: boolean,
        canSurrender: boolean
    ): PlayerAction {
        // Handle busted hands
        if (handValue > 21) {
            return null; // No action possible for busted hand
        }

        const action = this.strategyChart.hard[handValue]?.[dealerRank];

        // If the recommended action is double but we can't double, hit instead
        if (action === 'double' && !canDouble) {
            return 'hit';
        }

        // If the recommended action is surrender but we can't surrender, use fallback
        if (action === 'surrender' && !canSurrender) {
            // For hands that would surrender, hit for 15, stand for 16+
            return handValue <= 15 ? 'hit' : 'stand';
        }

        return action ?? (handValue <= 11 ? 'hit' : 'stand');
    }

    /**
     * Builds the strategy charts based on current rules
     * @param rules Game rules to build strategy for
     */
    private buildStrategyChart(rules: GameRules): StrategyChart {
        // Variables that affect strategy
        const dealerHitsSoft17 = rules.dealerHitsSoft17;
        const canSurrender = rules.playerCanSurrender;
        const doubleAfterSplit = rules.canDoubleAfterSplit;

        // Build the hard hands chart
        const hard: Record<number, Record<Rank, PlayerAction>> = {};

        // Initialize empty hard chart for totals 5-21
        for (let total = 5; total <= 21; total++) {
            hard[total] = {} as Record<Rank, PlayerAction>;
        }

        // Fill the hard chart based on rules
        this.fillHardChart(hard, dealerHitsSoft17, canSurrender);

        // Build the soft hands chart
        const soft: Record<number, Record<Rank, PlayerAction>> = {};

        // Initialize empty soft chart for totals 13-21
        for (let total = 13; total <= 21; total++) {
            soft[total] = {} as Record<Rank, PlayerAction>;
        }

        // Fill the soft chart based on rules
        this.fillSoftChart(soft, dealerHitsSoft17);

        // Build the pairs chart
        const pairs: Record<Rank, Record<Rank, PlayerAction>> = {} as Record<Rank, Record<Rank, PlayerAction>>;

        // Initialize empty pairs chart
        const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        ranks.forEach(rank => {
            pairs[rank] = {} as Record<Rank, PlayerAction>;
        });

        // Fill the pairs chart based on rules
        this.fillPairsChart(pairs, dealerHitsSoft17, doubleAfterSplit);

        return { hard, soft, pairs };
    }

    /**
     * Fills the hard hands strategy chart
     * @param chart Empty chart to fill
     * @param dealerHitsSoft17 Whether dealer hits on soft 17
     * @param canSurrender Whether surrender is allowed
     */
    private fillHardChart(
        chart: Record<number, Record<Rank, PlayerAction>>,
        dealerHitsSoft17: boolean,
        canSurrender: boolean
    ): void {
        // Enhanced hard hand strategy chart with more edge cases

        // For totals 5-8
        for (let total = 5; total <= 8; total++) {
            // Always hit regardless of dealer's up card
            this.fillRowWithAction(chart[total], 'hit');
        }

        // For total 9
        // Double against dealer 3-6, otherwise hit
        this.fillRowWithAction(chart[9], 'hit');
        this.setActionsForRange(chart[9], '3', '6', 'double');

        // For total 10
        // Double against dealer 2-9, otherwise hit
        this.fillRowWithAction(chart[10], 'hit');
        this.setActionsForRange(chart[10], '2', '9', 'double');

        // For total 11
        // Double against all dealer cards except A
        // With dealer hits soft 17, double against A as well
        this.fillRowWithAction(chart[11], 'double');
        chart[11]['A'] = dealerHitsSoft17 ? 'double' : 'hit';

        // For total 12
        // Stand against dealer 4-6, otherwise hit
        this.fillRowWithAction(chart[12], 'hit');
        this.setActionsForRange(chart[12], '4', '6', 'stand');

        // For total 13-14
        for (let total = 13; total <= 14; total++) {
            // Stand against dealer 2-6, otherwise hit
            this.fillRowWithAction(chart[total], 'hit');
            this.setActionsForRange(chart[total], '2', '6', 'stand');
        }

        // For total 15
        // Stand against dealer 2-6, otherwise hit
        // Surrender against 10 if allowed
        this.fillRowWithAction(chart[15], 'hit');
        this.setActionsForRange(chart[15], '2', '6', 'stand');
        if (canSurrender) {
            chart[15]['10'] = 'surrender';
        }

        // For total 16
        // Stand against dealer 2-6, otherwise hit
        // Surrender against 9, 10, A if allowed
        this.fillRowWithAction(chart[16], 'hit');
        this.setActionsForRange(chart[16], '2', '6', 'stand');
        if (canSurrender) {
            chart[16]['9'] = 'surrender';
            chart[16]['10'] = 'surrender';
            chart[16]['A'] = 'surrender';
        }

        // For total 17
        // Stand against all dealer cards
        // Surrender against A if dealer hits soft 17 and surrender is allowed (rare case)
        this.fillRowWithAction(chart[17], 'stand');
        if (canSurrender && dealerHitsSoft17) {
            chart[17]['A'] = 'surrender';
        }

        // For totals 18+
        for (let total = 18; total <= 21; total++) {
            // Always stand regardless of dealer's up card
            this.fillRowWithAction(chart[total], 'stand');
        }
    }

    /**
     * Fills the soft hands strategy chart
     * @param chart Empty chart to fill
     * @param dealerHitsSoft17 Whether dealer hits on soft 17
     */
    private fillSoftChart(
        chart: Record<number, Record<Rank, PlayerAction>>,
        dealerHitsSoft17: boolean
    ): void {
        // Enhanced soft hands strategy

        // Soft 13-14 (A+2 or A+3)
        // Double against 5-6, otherwise hit
        this.fillRowWithAction(chart[13], 'hit');
        this.fillRowWithAction(chart[14], 'hit');
        this.setActionsForRange(chart[13], '5', '6', 'double');
        this.setActionsForRange(chart[14], '5', '6', 'double');

        // Soft 15-16 (A+4 or A+5)
        // Double against 4-6, otherwise hit
        this.fillRowWithAction(chart[15], 'hit');
        this.fillRowWithAction(chart[16], 'hit');
        this.setActionsForRange(chart[15], '4', '6', 'double');
        this.setActionsForRange(chart[16], '4', '6', 'double');

        // Soft 17 (A+6)
        // Double against 3-6, stand against 2, 7-8, hit against 9-A if dealer hits soft 17
        this.fillRowWithAction(chart[17], dealerHitsSoft17 ? 'hit' : 'stand');
        this.setActionsForRange(chart[17], '3', '6', 'double');
        chart[17]['2'] = 'stand';
        chart[17]['7'] = 'stand';
        chart[17]['8'] = 'stand';

        // Soft 18 (A+7)
        // Stand against 2, 7-8, double against 3-6, hit against 9-A
        this.fillRowWithAction(chart[18], 'stand');
        this.setActionsForRange(chart[18], '3', '6', 'double');
        chart[18]['9'] = 'hit';
        chart[18]['10'] = 'hit';
        chart[18]['A'] = 'hit';

        // Soft 19 (A+8)
        // Stand against all dealer cards except 6, where you double
        // In some rule variations, double against 5-6
        this.fillRowWithAction(chart[19], 'stand');
        chart[19]['6'] = 'double';
        if (dealerHitsSoft17) {
            chart[19]['5'] = 'double';
        }

        // Soft 20-21 (A+9 or A+10)
        // Always stand
        this.fillRowWithAction(chart[20], 'stand');
        this.fillRowWithAction(chart[21], 'stand');
    }

    /**
     * Fills the pairs strategy chart
     * @param chart Empty chart to fill
     * @param dealerHitsSoft17 Whether dealer hits on soft 17
     * @param doubleAfterSplit Whether double after split is allowed
     */
    private fillPairsChart(
        chart: Record<Rank, Record<Rank, PlayerAction>>,
        dealerHitsSoft17: boolean,
        doubleAfterSplit: boolean
    ): void {
        // Enhanced pairs strategy with more nuanced recommendations

        // Pair of Aces
        // Always split
        this.fillRowWithAction(chart['A'], 'split');

        // Pair of 10s, Js, Qs, Ks
        // Always stand
        this.fillRowWithAction(chart['10'], 'stand');
        this.fillRowWithAction(chart['J'], 'stand');
        this.fillRowWithAction(chart['Q'], 'stand');
        this.fillRowWithAction(chart['K'], 'stand');

        // Pair of 9s
        // Split against 2-6, 8-9, otherwise stand
        this.fillRowWithAction(chart['9'], 'stand');
        this.setActionsForRange(chart['9'], '2', '6', 'split');
        chart['9']['8'] = 'split';
        chart['9']['9'] = 'split';

        // Pair of 8s
        // Always split
        // Some advanced strategies suggest surrender against A if allowed
        this.fillRowWithAction(chart['8'], 'split');

        // Pair of 7s
        // Split against 2-7, otherwise hit
        this.fillRowWithAction(chart['7'], 'hit');
        this.setActionsForRange(chart['7'], '2', '7', 'split');

        // Pair of 6s
        // Split against 2-6, otherwise hit
        // If double after split allowed, split against 2-7
        this.fillRowWithAction(chart['6'], 'hit');
        if (doubleAfterSplit) {
            this.setActionsForRange(chart['6'], '2', '7', 'split');
        } else {
            this.setActionsForRange(chart['6'], '2', '6', 'split');
        }

        // Pair of 5s
        // Double against 2-9, otherwise hit (never split)
        this.fillRowWithAction(chart['5'], 'hit');
        this.setActionsForRange(chart['5'], '2', '9', 'double');

        // Pair of 4s
        // Split against 5-6, otherwise hit
        // If double after split allowed and dealer hits soft 17, split against 4-6
        this.fillRowWithAction(chart['4'], 'hit');
        if (doubleAfterSplit && dealerHitsSoft17) {
            this.setActionsForRange(chart['4'], '4', '6', 'split');
        } else {
            this.setActionsForRange(chart['4'], '5', '6', 'split');
        }

        // Pair of 3s
        // Split against 2-7, otherwise hit
        // If double after split not allowed, only split against 2-6
        this.fillRowWithAction(chart['3'], 'hit');
        if (doubleAfterSplit) {
            this.setActionsForRange(chart['3'], '2', '7', 'split');
        } else {
            this.setActionsForRange(chart['3'], '2', '6', 'split');
        }

        // Pair of 2s
        // Split against 2-7, otherwise hit
        // If double after split not allowed, only split against 2-6
        this.fillRowWithAction(chart['2'], 'hit');
        if (doubleAfterSplit) {
            this.setActionsForRange(chart['2'], '2', '7', 'split');
        } else {
            this.setActionsForRange(chart['2'], '2', '6', 'split');
        }
    }

    // Helper methods

    /**
     * Fills a row with the same action for all dealer up cards
     * @param row Row to fill
     * @param action Action to set
     */
    private fillRowWithAction(row: Record<Rank, PlayerAction>, action: PlayerAction): void {
        const dealerRanks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        dealerRanks.forEach(rank => {
            row[rank] = action;
        });
    }

    /**
     * Sets actions for a range of dealer up cards
     * @param row Row to modify
     * @param startRank Starting rank (inclusive)
     * @param endRank Ending rank (inclusive)
     * @param action Action to set
     */
    private setActionsForRange(
        row: Record<Rank, PlayerAction>,
        startRank: Rank,
        endRank: Rank,
        action: PlayerAction
    ): void {
        const dealerRanks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        let inRange = false;

        dealerRanks.forEach(rank => {
            if (rank === startRank) inRange = true;
            if (inRange) row[rank] = action;
            if (rank === endRank) inRange = false;
        });

        // Handle face cards (J, Q, K) as equivalent to 10
        if (startRank === '10' || endRank === '10') {
            row['J'] = row['10'];
            row['Q'] = row['10'];
            row['K'] = row['10'];
        }
    }

    /**
     * Calculates the best value of a hand
     * @param cards Cards in the hand
     */
    private calculateHandValue(cards: Card[]): number {
        if (cards.length === 0) return 0;

        let total = 0;
        let aceCount = 0;

        // Sum up all cards
        cards.forEach(card => {
            if (card.rank === 'A') {
                aceCount++;
                total += 11; // Initially count aces as 11
            } else if (['10', 'J', 'Q', 'K'].includes(card.rank)) {
                total += 10;
            } else {
                total += parseInt(card.rank);
            }
        });

        // Adjust for aces if necessary
        while (total > 21 && aceCount > 0) {
            total -= 10; // Convert an ace from 11 to 1
            aceCount--;
        }

        return total;
    }

    /**
     * Checks if a hand has a "soft" ace (counting as 11)
     * @param cards Cards in the hand
     */
    private hasSoftAce(cards: Card[]): boolean {
        let total = 0;
        let aceCount = 0;

        // Calculate total without aces
        cards.forEach(card => {
            if (card.rank === 'A') {
                aceCount++;
            } else if (['10', 'J', 'Q', 'K'].includes(card.rank)) {
                total += 10;
            } else {
                total += parseInt(card.rank);
            }
        });

        // If adding an ace as 11 doesn't bust, it's a soft ace
        return aceCount > 0 && (total + 11) <= 21;
    }

    /**
     * Determines the type of hand (hard, soft, pair)
     * @param cards Cards in the hand
     */
    public getHandType(cards: Card[]): HandType {
        if (cards.length === 2 && cards[0].rank === cards[1].rank) {
            return 'pair';
        }

        if (cards.some(card => card.rank === 'A') && this.hasSoftAce(cards)) {
            return 'soft';
        }

        return 'hard';
    }
}

// Export a singleton instance for global use
export const basicStrategy = new BasicStrategy({
    decksCount: 6,
    dealerHitsSoft17: true,
    blackjackPays: 1.5,
    playerCanSurrender: false,
    maxSplitHands: 4,
    canDoubleAfterSplit: true,
    canHitSplitAces: false
});