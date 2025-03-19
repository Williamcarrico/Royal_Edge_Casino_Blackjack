'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card, Hand } from '@/lib/utils/gameLogic';

// Types for analytics data
export interface DecisionPoint {
    timestamp: number;
    playerHand: Hand;
    dealerUpCard: Card;
    decision: 'hit' | 'stand' | 'double' | 'split';
    recommendedDecision: 'hit' | 'stand' | 'double' | 'split';
    outcome: 'win' | 'lose' | 'push' | 'pending';
    betAmount: number;
    finalChips: number;
    effectiveCount: number;
    deckPenetration: number;
}

// New type for bet tracking
export interface BetRecord {
    timestamp: number;
    sessionId: string;
    amount: number;
    recommendedAmount: number | null;
    followedRecommendation: boolean;
    effectiveCount: number;
    deckPenetration: number;
    reason: string | null;
}

export interface GameSession {
    id: string;
    startTime: number;
    endTime: number | null;
    initialChips: number;
    finalChips: number | null;
    decisions: DecisionPoint[];
    bets: BetRecord[]; // Add bets array to track betting history
    handsPlayed: number;
    handsWon: number;
    handsLost: number;
    handsPushed: number;
    totalBets: number;
    netProfit: number;
    // Betting performance metrics
    avgBetSize: number;
    maxBetSize: number;
    betSizingAccuracy: number; // % of time followed count-based recommendations
    countsAtBets: number[]; // Effective counts when bets were placed
}

export interface SkillMetric {
    category: 'basic_strategy' | 'card_counting' | 'bet_sizing' | 'overall';
    score: number; // 0-100
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    correctDecisions: number;
    totalDecisions: number;
}

export interface AnalyticsState {
    // Current session data
    currentSession: GameSession | null;

    // Historical data
    sessions: GameSession[];

    // Skill metrics
    skillMetrics: SkillMetric[];

    // Streak data
    currentStreak: number;
    longestWinStreak: number;
    longestLoseStreak: number;

    // Common mistakes and patterns
    commonMistakes: Array<{
        scenario: string;
        correctAction: string;
        playerAction: string;
        frequency: number;
    }>;

    // Analytics methods
    startSession: (initialChips: number) => void;
    endSession: (finalChips: number) => void;
    recordDecision: (decisionPoint: Omit<DecisionPoint, 'timestamp'>) => void;
    recordBet: (betData: Omit<BetRecord, 'timestamp' | 'sessionId'>) => void; // New method for bet tracking
    updateOutcome: (
        playerHandId: string,
        outcome: 'win' | 'lose' | 'push',
        finalChips: number
    ) => void;
    resetData: () => void;
    calculateSkillMetrics: () => SkillMetric[];
    getStrategySuggestions: () => Array<{
        situation: string;
        recommendation: string;
        importance: 'high' | 'medium' | 'low';
    }>;
    getMostProfitableScenarios: () => Array<{
        dealerUpCard: string;
        playerTotal: number;
        action: string;
        profitRate: number;
        frequency: number;
    }>;
    getBettingAnalytics: () => Array<{
        countRange: string;
        avgBetSize: number;
        winRate: number;
        expectedValue: number;
    }>;
}

export const useAnalyticsStore = create<AnalyticsState>()(
    persist(
        (set, get) => ({
            // Initial state
            currentSession: null,
            sessions: [],
            skillMetrics: [],
            currentStreak: 0,
            longestWinStreak: 0,
            longestLoseStreak: 0,
            commonMistakes: [],

            // Start a new session
            startSession: (initialChips: number) => {
                const newSession: GameSession = {
                    id: `session_${Date.now()}`,
                    startTime: Date.now(),
                    endTime: null,
                    initialChips,
                    finalChips: null,
                    decisions: [],
                    bets: [], // Initialize empty bets array
                    handsPlayed: 0,
                    handsWon: 0,
                    handsLost: 0,
                    handsPushed: 0,
                    totalBets: 0,
                    netProfit: 0,
                    avgBetSize: 0,
                    maxBetSize: 0,
                    betSizingAccuracy: 0,
                    countsAtBets: [],
                };

                set({ currentSession: newSession });
            },

            // End the current session
            endSession: (finalChips: number) => {
                const { currentSession, sessions } = get();

                if (!currentSession) return;

                // Calculate final betting metrics
                const totalBets = currentSession.bets.length;
                const avgBetSize = totalBets > 0
                    ? currentSession.bets.reduce((sum, bet) => sum + bet.amount, 0) / totalBets
                    : 0;

                const maxBetSize = totalBets > 0
                    ? Math.max(...currentSession.bets.map(bet => bet.amount))
                    : 0;

                const betSizingAccuracy = totalBets > 0
                    ? currentSession.bets.filter(bet =>
                        bet.recommendedAmount !== null && bet.followedRecommendation
                    ).length / totalBets * 100
                    : 0;

                const updatedSession: GameSession = {
                    ...currentSession,
                    endTime: Date.now(),
                    finalChips,
                    netProfit: finalChips - currentSession.initialChips,
                    avgBetSize,
                    maxBetSize,
                    betSizingAccuracy,
                };

                set({
                    currentSession: null,
                    sessions: [...sessions, updatedSession],
                });

                // Recalculate skill metrics on session end
                get().calculateSkillMetrics();
            },

            // Record a bet
            recordBet: (betData) => {
                const { currentSession } = get();

                if (!currentSession) return;

                const newBet: BetRecord = {
                    ...betData,
                    timestamp: Date.now(),
                    sessionId: currentSession.id,
                };

                const countsAtBets = [...currentSession.countsAtBets, betData.effectiveCount];

                // Update max bet if this is a new maximum
                const maxBetSize = Math.max(currentSession.maxBetSize, betData.amount);

                const updatedSession: GameSession = {
                    ...currentSession,
                    bets: [...currentSession.bets, newBet],
                    countsAtBets,
                    maxBetSize,
                };

                set({ currentSession: updatedSession });
            },

            // Record a player decision
            recordDecision: (decisionData) => {
                const { currentSession } = get();

                if (!currentSession) return;

                const decisionPoint: DecisionPoint = {
                    ...decisionData,
                    timestamp: Date.now(),
                };

                const updatedSession: GameSession = {
                    ...currentSession,
                    decisions: [...currentSession.decisions, decisionPoint],
                    totalBets: currentSession.totalBets + decisionData.betAmount,
                };

                set({ currentSession: updatedSession });

                // Update common mistakes data when decisions don't match recommendations
                if (decisionData.decision !== decisionData.recommendedDecision) {
                    const { commonMistakes } = get();

                    // Create a scenario identifier
                    const playerTotal = decisionData.playerHand.values[0];
                    const hasSoftAce = decisionData.playerHand.cards.some(card => card.rank === 'A');
                    const isPair = decisionData.playerHand.cards.length === 2 &&
                        decisionData.playerHand.cards[0].rank === decisionData.playerHand.cards[1].rank;

                    let scenario = '';

                    if (isPair) {
                        scenario = `Pair of ${decisionData.playerHand.cards[0].rank}s vs Dealer ${decisionData.dealerUpCard.rank}`;
                    } else if (hasSoftAce) {
                        scenario = `Soft ${playerTotal} vs Dealer ${decisionData.dealerUpCard.rank}`;
                    } else {
                        scenario = `Hard ${playerTotal} vs Dealer ${decisionData.dealerUpCard.rank}`;
                    }

                    // Find or create the mistake entry
                    const existingMistake = commonMistakes.find(m =>
                        m.scenario === scenario &&
                        m.correctAction === decisionData.recommendedDecision &&
                        m.playerAction === decisionData.decision
                    );

                    if (existingMistake) {
                        // Update existing mistake frequency
                        const updatedMistakes = commonMistakes.map(m =>
                            m.scenario === scenario &&
                                m.correctAction === decisionData.recommendedDecision &&
                                m.playerAction === decisionData.decision
                                ? { ...m, frequency: m.frequency + 1 }
                                : m
                        );

                        set({ commonMistakes: updatedMistakes });
                    } else {
                        // Add new mistake
                        set({
                            commonMistakes: [
                                ...commonMistakes,
                                {
                                    scenario,
                                    correctAction: decisionData.recommendedDecision,
                                    playerAction: decisionData.decision,
                                    frequency: 1
                                }
                            ]
                        });
                    }
                }
            },

            // Update the outcome of a hand
            updateOutcome: (playerHandId, outcome, finalChips) => {
                const { currentSession } = get();

                if (!currentSession) return;

                // Find the decision that corresponds to this hand
                const updatedDecisions = currentSession.decisions.map(decision => {
                    // Using a simple comparison for demo purposes
                    // In reality, we would need a better way to identify specific hands
                    const isTargetHand = (decision.playerHand as Hand & { id: string }).id === playerHandId;

                    return isTargetHand ? { ...decision, outcome, finalChips } : decision;
                });

                // Update streak data
                let { currentStreak, longestWinStreak, longestLoseStreak } = get();

                if (outcome === 'win') {
                    currentStreak = currentStreak > 0 ? currentStreak + 1 : 1;
                    longestWinStreak = Math.max(currentStreak, longestWinStreak);
                } else if (outcome === 'lose') {
                    currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
                    longestLoseStreak = Math.max(Math.abs(currentStreak), longestLoseStreak);
                } else {
                    // Push doesn't affect streak
                }

                // Update session statistics
                const handsPlayed = currentSession.handsPlayed + 1;
                const handsWon = outcome === 'win' ? currentSession.handsWon + 1 : currentSession.handsWon;
                const handsLost = outcome === 'lose' ? currentSession.handsLost + 1 : currentSession.handsLost;
                const handsPushed = outcome === 'push' ? currentSession.handsPushed + 1 : currentSession.handsPushed;

                set({
                    currentSession: {
                        ...currentSession,
                        decisions: updatedDecisions,
                        handsPlayed,
                        handsWon,
                        handsLost,
                        handsPushed,
                    },
                    currentStreak,
                    longestWinStreak,
                    longestLoseStreak,
                });
            },

            // Reset all analytics data
            resetData: () => {
                set({
                    currentSession: null,
                    sessions: [],
                    skillMetrics: [],
                    currentStreak: 0,
                    longestWinStreak: 0,
                    longestLoseStreak: 0,
                    commonMistakes: [],
                });
            },

            // Calculate skill metrics based on recent games
            calculateSkillMetrics: () => {
                const { sessions } = get();

                if (sessions.length === 0) return [];

                // Define a helper to determine skill level based on score
                const determineLevel = (score: number): 'beginner' | 'intermediate' | 'advanced' | 'expert' => {
                    if (score < 25) return 'beginner';
                    if (score < 50) return 'intermediate';
                    if (score < 75) return 'advanced';
                    return 'expert';
                };

                // Calculate basic strategy accuracy
                const allDecisions = sessions.flatMap(s => s.decisions);
                const basicStrategyDecisions = allDecisions.filter(d =>
                    !d.playerHand.cards.some(card => card.rank === 'A') && // Filter out hands with aces (to simplify)
                    d.playerHand.cards.length >= 2 // Ensure there are at least 2 cards
                );

                const correctBasicStrategyDecisions = basicStrategyDecisions.filter(
                    d => d.decision === d.recommendedDecision
                );

                const basicStrategyScore = basicStrategyDecisions.length > 0
                    ? (correctBasicStrategyDecisions.length / basicStrategyDecisions.length) * 100
                    : 0;

                // Calculate card counting accuracy (here simplified to whether decisions align with count)
                const cardCountingDecisions = allDecisions.filter(d => Math.abs(d.effectiveCount) > 1);
                let correctCardCountingDecisions = 0;

                // Simple logic: if count is positive (favorable), player should be more aggressive
                // if count is negative (unfavorable), player should be more conservative
                cardCountingDecisions.forEach(d => {
                    if (d.effectiveCount > 1) {
                        // With positive count, players should be more aggressive
                        if (
                            (d.recommendedDecision === 'stand' && d.decision === 'hit') ||
                            (d.recommendedDecision === 'hit' && d.decision === 'double')
                        ) {
                            correctCardCountingDecisions++;
                        }
                    } else if (d.effectiveCount < -1) {
                        // With negative count, players should be more conservative
                        if (
                            (d.recommendedDecision === 'hit' && d.decision === 'stand') ||
                            (d.recommendedDecision === 'double' && d.decision === 'hit')
                        ) {
                            correctCardCountingDecisions++;
                        }
                    }
                });

                const cardCountingScore = cardCountingDecisions.length > 0
                    ? (correctCardCountingDecisions / cardCountingDecisions.length) * 100
                    : 0;

                // Calculate bet sizing accuracy
                // Check if bet sizes align with count-based recommendations
                const recentSessions = sessions.slice(-5); // Consider last 5 sessions
                const bets = recentSessions.flatMap(s => s.bets);

                // Calculate bet sizing accuracy - did player increase bets with favorable counts?
                let correctBetDecisions = 0;
                let totalBetDecisions = 0;

                if (bets.length > 0) {
                    // Group bets by count ranges
                    const betsByCount: Record<string, number[]> = {};

                    bets.forEach(bet => {
                        const countRange = Math.floor(bet.effectiveCount);
                        if (!betsByCount[countRange]) {
                            betsByCount[countRange] = [];
                        }
                        betsByCount[countRange].push(bet.amount);
                    });

                    // Calculate average bet for each count range
                    const avgBetByCount: Record<string, number> = {};
                    Object.entries(betsByCount).forEach(([countRange, amounts]) => {
                        avgBetByCount[countRange] = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
                    });

                    // Check if higher counts have higher average bets
                    const countRanges = Object.keys(avgBetByCount).map(Number).sort((a, b) => a - b);

                    for (let i = 1; i < countRanges.length; i++) {
                        totalBetDecisions++;
                        if (avgBetByCount[countRanges[i]] > avgBetByCount[countRanges[i - 1]]) {
                            correctBetDecisions++;
                        }
                    }
                }

                const betSizingScore = totalBetDecisions > 0
                    ? (correctBetDecisions / totalBetDecisions) * 100
                    : 0;

                // Calculate overall score (weighted average)
                const overallScore = (
                    (basicStrategyScore * 0.5) +
                    (cardCountingScore * 0.3) +
                    (betSizingScore * 0.2)
                );

                // Create skill metrics
                const metrics: SkillMetric[] = [
                    {
                        category: 'basic_strategy',
                        score: Math.round(basicStrategyScore),
                        level: determineLevel(basicStrategyScore),
                        correctDecisions: correctBasicStrategyDecisions.length,
                        totalDecisions: basicStrategyDecisions.length,
                    },
                    {
                        category: 'card_counting',
                        score: Math.round(cardCountingScore),
                        level: determineLevel(cardCountingScore),
                        correctDecisions: correctCardCountingDecisions,
                        totalDecisions: cardCountingDecisions.length,
                    },
                    {
                        category: 'bet_sizing',
                        score: Math.round(betSizingScore),
                        level: determineLevel(betSizingScore),
                        correctDecisions: correctBetDecisions,
                        totalDecisions: totalBetDecisions,
                    },
                    {
                        category: 'overall',
                        score: Math.round(overallScore),
                        level: determineLevel(overallScore),
                        correctDecisions: correctBasicStrategyDecisions.length + correctCardCountingDecisions + correctBetDecisions,
                        totalDecisions: basicStrategyDecisions.length + cardCountingDecisions.length + totalBetDecisions,
                    },
                ];

                set({ skillMetrics: metrics });
                return metrics;
            },

            // Get gameplay improvement suggestions
            getStrategySuggestions: () => {
                const { commonMistakes, skillMetrics } = get();

                // Sort mistakes by frequency
                const sortedMistakes = [...commonMistakes].sort((a, b) => b.frequency - a.frequency);

                // Generate suggestions based on mistakes
                const suggestions: Array<{
                    situation: string;
                    recommendation: string;
                    importance: 'high' | 'medium' | 'low';
                }> = [];

                // Add suggestions based on top mistakes
                sortedMistakes.slice(0, 3).forEach(mistake => {
                    suggestions.push({
                        situation: mistake.scenario,
                        recommendation: `Always ${mistake.correctAction} instead of ${mistake.playerAction}`,
                        importance: mistake.frequency > 5 ? 'high' : 'medium',
                    });
                });

                // Add general suggestions based on skill metrics
                const basicStrategyMetric = skillMetrics.find(m => m.category === 'basic_strategy');
                const cardCountingMetric = skillMetrics.find(m => m.category === 'card_counting');
                const betSizingMetric = skillMetrics.find(m => m.category === 'bet_sizing');

                if (basicStrategyMetric && basicStrategyMetric.score < 70) {
                    suggestions.push({
                        situation: 'Basic Strategy',
                        recommendation: 'Review basic strategy chart to improve decision making',
                        importance: 'high',
                    });
                }

                if (cardCountingMetric && cardCountingMetric.score < 60) {
                    suggestions.push({
                        situation: 'Card Counting',
                        recommendation: 'Practice tracking the running count and converting to true count',
                        importance: 'medium',
                    });
                }

                if (betSizingMetric && betSizingMetric.score < 60) {
                    suggestions.push({
                        situation: 'Bet Sizing',
                        recommendation: 'Increase your bet when the count is favorable (above +2)',
                        importance: 'high',
                    });
                }

                return suggestions;
            },

            // Get most profitable scenarios
            getMostProfitableScenarios: () => {
                const { sessions } = get();
                const decisions = sessions.flatMap(s => s.decisions);

                // Group decisions by scenario and action
                const scenarioMap: Record<string, {
                    wins: number;
                    losses: number;
                    pushes: number;
                    profit: number;
                    count: number;
                }> = {};

                decisions.forEach(d => {
                    const playerTotal = d.playerHand.values[0];
                    const dealerUpCard = d.dealerUpCard.rank;
                    const action = d.decision;

                    const key = `${playerTotal}-${dealerUpCard}-${action}`;

                    if (!scenarioMap[key]) {
                        scenarioMap[key] = {
                            wins: 0,
                            losses: 0,
                            pushes: 0,
                            profit: 0,
                            count: 0,
                        };
                    }

                    scenarioMap[key].count++;

                    if (d.outcome === 'win') {
                        scenarioMap[key].wins++;
                        scenarioMap[key].profit += d.betAmount;
                    } else if (d.outcome === 'lose') {
                        scenarioMap[key].losses++;
                        scenarioMap[key].profit -= d.betAmount;
                    } else if (d.outcome === 'push') {
                        scenarioMap[key].pushes++;
                    }
                });

                // Convert to array and calculate profit rate
                const scenarios = Object.entries(scenarioMap).map(([key, data]) => {
                    const [playerTotal, dealerUpCard, action] = key.split('-');
                    const totalHands = data.wins + data.losses + data.pushes;
                    const profitRate = totalHands > 0 ? data.profit / totalHands : 0;

                    return {
                        dealerUpCard,
                        playerTotal: parseInt(playerTotal),
                        action,
                        profitRate,
                        frequency: data.count,
                    };
                });

                // Sort by profit rate (descending)
                return scenarios
                    .filter(s => s.frequency >= 5) // Only include scenarios with enough data
                    .sort((a, b) => b.profitRate - a.profitRate)
                    .slice(0, 10); // Top 10 most profitable
            },

            // Get betting analytics based on count ranges
            getBettingAnalytics: () => {
                const { sessions } = get();
                const bets = sessions.flatMap(s => s.bets);
                const decisions = sessions.flatMap(s => s.decisions);

                // Group bets by count ranges
                const countRanges: Record<string, {
                    bets: number[],
                    wins: number,
                    losses: number,
                    pushes: number,
                    totalAmount: number
                }> = {};

                // Initialize count ranges from -5 to +5
                for (let i = -5; i <= 5; i++) {
                    countRanges[i.toString()] = {
                        bets: [],
                        wins: 0,
                        losses: 0,
                        pushes: 0,
                        totalAmount: 0
                    };
                }

                // Collect bet amounts by count range
                bets.forEach(bet => {
                    const count = Math.min(Math.max(Math.round(bet.effectiveCount), -5), 5);
                    countRanges[count.toString()].bets.push(bet.amount);
                    countRanges[count.toString()].totalAmount += bet.amount;
                });

                // Collect outcomes by count range
                decisions.forEach(d => {
                    if (d.outcome === 'pending') return;

                    const count = Math.min(Math.max(Math.round(d.effectiveCount), -5), 5);

                    if (d.outcome === 'win') {
                        countRanges[count.toString()].wins++;
                    } else if (d.outcome === 'lose') {
                        countRanges[count.toString()].losses++;
                    } else if (d.outcome === 'push') {
                        countRanges[count.toString()].pushes++;
                    }
                });

                // Calculate analytics for each count range
                return Object.entries(countRanges)
                    .filter(([, data]) => data.bets.length > 0) // Only include ranges with bets
                    .map(([countRange, data]) => {
                        const totalHands = data.wins + data.losses + data.pushes;
                        const winRate = totalHands > 0 ? (data.wins / totalHands) * 100 : 0;

                        // Calculate expected value (simplified)
                        // EV = (win probability * win amount) - (loss probability * loss amount)
                        const winProbability = totalHands > 0 ? data.wins / totalHands : 0;
                        const lossProbability = totalHands > 0 ? data.losses / totalHands : 0;
                        const avgBetSize = data.bets.length > 0
                            ? data.bets.reduce((sum, amt) => sum + amt, 0) / data.bets.length
                            : 0;

                        const expectedValue = (winProbability * avgBetSize) - (lossProbability * avgBetSize);

                        // Format the count range for display
                        let formattedRange: string;
                        const count = parseInt(countRange);

                        if (count < -3) formattedRange = "Very Negative (≤ -3)";
                        else if (count < 0) formattedRange = "Negative (-3 to -1)";
                        else if (count === 0) formattedRange = "Neutral (0)";
                        else if (count <= 3) formattedRange = "Positive (1 to 3)";
                        else formattedRange = "Very Positive (≥ 3)";

                        return {
                            countRange: formattedRange,
                            avgBetSize: Math.round(avgBetSize),
                            winRate: Math.round(winRate),
                            expectedValue: Math.round(expectedValue * 100) / 100 // Round to 2 decimal places
                        };
                    })
                    .sort((a, b) => {
                        // Sort by count range from negative to positive
                        const getOrder = (range: string) => {
                            if (range.includes("Very Negative")) return 1;
                            if (range.includes("Negative")) return 2;
                            if (range.includes("Neutral")) return 3;
                            if (range.includes("Positive")) return 4;
                            return 5; // Very Positive
                        };

                        return getOrder(a.countRange) - getOrder(b.countRange);
                    });
            }
        }),
        {
            name: 'blackjack-analytics',
            version: 1,
        }
    )
);