'use client';

import React, { useMemo } from 'react';
import { useProbabilityEngine } from '@/hooks/useProbabilityEngine';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/player/badge';
import { Progress } from '@/components/ui/progress';
import { useEnhancedSettingsStore } from '@/store/enhancedSettingsStore';

// Type definitions
interface DeckState {
    trueCount: number;
    decksRemaining: number;
    runningCount: number;
    cardPercentages: Record<string, number>;
}

interface PlayerDecision {
    hitEV: number;
    standEV: number;
    doubleDownEV: number;
    splitEV: number | null;
    insuranceEV: number | null;
    surrenderEV: number;
    bustProbabilities: {
        afterHit: number;
        afterDoubleDown: number;
    };
}

interface DealerOutcome {
    bustProbability: number;
    blackjackProbability: number;
    expectedValue: number;
    finalTotalProbabilities: Record<string, number>;
}

interface HouseEdgeInfo {
    currentHouseEdge: number;
    baseHouseEdge: number;
    deckFavorsPlayer: boolean;
    edgeFactors: {
        blackjackPayoutContribution: number;
        dealerHitSoft17Contribution: number;
        deckCountContribution: number;
        otherRulesContribution: number;
    };
}

/**
 * Main component that displays probability information
 */
export const ProbabilityDisplay: React.FC = () => {
    const { showProbabilities, showCountingInfo } = useEnhancedSettingsStore(
        (state) => ({
            showProbabilities: state.showProbabilities,
            showCountingInfo: state.showCountingInfo
        })
    );

    const {
        isReady,
        deckState,
        playerDecisions,
        dealerOutcomes,
        houseEdge,
        recommendedAction
    } = useProbabilityEngine();

    // Don't render if probabilities shouldn't be shown
    if (!showProbabilities || !isReady) {
        return null;
    }

    return (
        <div className="flex flex-col w-full max-w-md gap-4">
            {showCountingInfo && deckState && (
                <DeckCompositionCard deckState={deckState} />
            )}

            {playerDecisions && (
                <PlayerDecisionsCard
                    decisions={playerDecisions}
                    recommendedAction={recommendedAction ?? undefined}
                />
            )}

            {dealerOutcomes && (
                <DealerOutcomesCard outcomes={dealerOutcomes} />
            )}

            {houseEdge && (
                <HouseEdgeCard houseEdge={houseEdge} />
            )}
        </div>
    );
};

/**
 * Card displaying deck composition and counting information
 */
const DeckCompositionCard: React.FC<{
    deckState: DeckState;
}> = ({ deckState }) => {
    const formattedTrueCount = useMemo(() => {
        const value = deckState.trueCount;
        return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
    }, [deckState.trueCount]);

    const countClass = useMemo(() => {
        if (deckState.trueCount >= 2) return "text-green-500";
        if (deckState.trueCount <= -2) return "text-red-500";
        return "text-gray-500";
    }, [deckState.trueCount]);

    return (
        <Card className="p-4 bg-slate-800">
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white">Deck Composition</h3>
                    <Badge variant={deckState.trueCount > 0 ? "secondary" : "destructive"} className={deckState.trueCount > 0 ? "bg-green-600" : ""}>
                        {deckState.decksRemaining.toFixed(1)} decks
                    </Badge>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-slate-300">Running Count:</span>
                    <span className={`text-sm font-medium ${countClass}`}>
                        {deckState.runningCount > 0 ? `+${deckState.runningCount}` : deckState.runningCount}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">True Count:</span>
                    <span className={`text-sm font-medium ${countClass}`}>
                        {formattedTrueCount}
                    </span>
                </div>

                <div className="grid grid-cols-5 gap-2 mt-3">
                    {Object.entries(deckState.cardPercentages)
                        .filter(([rank]) => rank !== 'undefined')
                        .map(([rank, percentage]) => (
                            <div key={rank} className="flex flex-col items-center">
                                <span className="text-xs text-slate-400">{rank}</span>
                                <span className="text-xs font-medium text-white">
                                    {Math.round(percentage * 100)}%
                                </span>
                            </div>
                        ))
                    }
                </div>
            </div>
        </Card>
    );
};

/**
 * Card displaying player decision probabilities
 */
const PlayerDecisionsCard: React.FC<{
    decisions: PlayerDecision;
    recommendedAction?: string;
}> = ({ decisions, recommendedAction }) => {
    // Map decision names to display names
    const actionDisplayNames: Record<string, string> = {
        'hit': 'Hit',
        'stand': 'Stand',
        'double': 'Double Down',
        'split': 'Split',
        'surrender': 'Surrender',
        'insurance': 'Insurance'
    };

    // Format expected value as percentage
    const formatEV = (ev: number): string => {
        const percentage = (ev * 100).toFixed(1);
        return ev >= 0 ? `+${percentage}%` : `${percentage}%`;
    };

    // Determine color class based on EV
    const getEVColorClass = (ev: number): string => {
        if (ev >= 0.05) return "text-green-500";
        if (ev <= -0.05) return "text-red-500";
        return "text-amber-400";
    };

    return (
        <Card className="p-4 bg-slate-800">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white">Player Decisions</h3>
                    {recommendedAction && (
                        <Badge variant="outline" className="text-indigo-100 bg-indigo-900 border-indigo-700">
                            Recommended: {actionDisplayNames[recommendedAction] || recommendedAction}
                        </Badge>
                    )}
                </div>

                <div className="mt-2 space-y-2">
                    {/* Hit */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Hit</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">
                                Bust: {(decisions.bustProbabilities.afterHit * 100).toFixed(1)}%
                            </span>
                            <span className={`text-sm font-medium ${getEVColorClass(decisions.hitEV)}`}>
                                EV: {formatEV(decisions.hitEV)}
                            </span>
                        </div>
                    </div>

                    {/* Stand */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Stand</span>
                        <span className={`text-sm font-medium ${getEVColorClass(decisions.standEV)}`}>
                            EV: {formatEV(decisions.standEV)}
                        </span>
                    </div>

                    {/* Double Down */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Double Down</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">
                                Bust: {(decisions.bustProbabilities.afterDoubleDown * 100).toFixed(1)}%
                            </span>
                            <span className={`text-sm font-medium ${getEVColorClass(decisions.doubleDownEV)}`}>
                                EV: {formatEV(decisions.doubleDownEV)}
                            </span>
                        </div>
                    </div>

                    {/* Split (if available) */}
                    {decisions.splitEV !== null && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">Split</span>
                            <span className={`text-sm font-medium ${getEVColorClass(decisions.splitEV)}`}>
                                EV: {formatEV(decisions.splitEV)}
                            </span>
                        </div>
                    )}

                    {/* Insurance (if available) */}
                    {decisions.insuranceEV !== null && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">Insurance</span>
                            <span className={`text-sm font-medium ${getEVColorClass(decisions.insuranceEV)}`}>
                                EV: {formatEV(decisions.insuranceEV)}
                            </span>
                        </div>
                    )}

                    {/* Surrender */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Surrender</span>
                        <span className={`text-sm font-medium ${getEVColorClass(decisions.surrenderEV)}`}>
                            EV: {formatEV(decisions.surrenderEV)}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

/**
 * Card displaying dealer outcome probabilities
 */
const DealerOutcomesCard: React.FC<{
    outcomes: DealerOutcome;
}> = ({ outcomes }) => {
    // Format probability as percentage
    const formatProb = (prob: number): string => {
        return `${(prob * 100).toFixed(1)}%`;
    };

    return (
        <Card className="p-4 bg-slate-800">
            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-medium text-white">Dealer Outcomes</h3>

                <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-slate-300">Bust Probability</span>
                    <span className="text-sm font-medium text-green-500">
                        {formatProb(outcomes.bustProbability)}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Blackjack Probability</span>
                    <span className="text-sm font-medium text-red-500">
                        {formatProb(outcomes.blackjackProbability)}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Expected Value</span>
                    <span className="text-sm font-medium text-white">
                        {outcomes.expectedValue.toFixed(1)}
                    </span>
                </div>

                <div className="mt-1 space-y-1">
                    <div className="mb-1 text-xs text-slate-400">Final Total Probabilities</div>
                    {Object.entries(outcomes.finalTotalProbabilities).map(([total, probability]) => (
                        <div key={total} className="flex items-center gap-2">
                            <div className="w-8 text-xs text-slate-300">{total}</div>
                            <Progress
                                value={Math.round(probability * 100)}
                                className={`h-2 ${parseInt(total) >= 20 ? 'bg-amber-500/20' : 'bg-blue-500/20'} [&>div]:${parseInt(total) >= 20 ? 'bg-amber-500' : 'bg-blue-500'}`}
                            />
                            <div className="w-12 text-xs text-slate-300">
                                {formatProb(probability)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

/**
 * Card displaying house edge information
 */
const HouseEdgeCard: React.FC<{
    houseEdge: HouseEdgeInfo;
}> = ({ houseEdge }) => {
    return (
        <Card className="p-4 bg-slate-800">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white">House Edge</h3>
                    <Badge
                        variant={houseEdge.deckFavorsPlayer ? "secondary" : "destructive"}
                        className={houseEdge.deckFavorsPlayer ? "bg-green-600 font-mono" : "font-mono"}
                    >
                        {houseEdge.currentHouseEdge.toFixed(2)}%
                    </Badge>
                </div>

                <div className="mt-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Base Edge</span>
                        <span className="text-sm font-medium text-slate-300">
                            {houseEdge.baseHouseEdge.toFixed(2)}%
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Blackjack Payout</span>
                        <span className="text-sm font-medium text-slate-300">
                            +{houseEdge.edgeFactors.blackjackPayoutContribution.toFixed(2)}%
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Dealer Hits Soft 17</span>
                        <span className="text-sm font-medium text-slate-300">
                            +{houseEdge.edgeFactors.dealerHitSoft17Contribution.toFixed(2)}%
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Number of Decks</span>
                        <span className="text-sm font-medium text-slate-300">
                            {houseEdge.edgeFactors.deckCountContribution >= 0 ? '+' : ''}
                            {houseEdge.edgeFactors.deckCountContribution.toFixed(2)}%
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Other Rules</span>
                        <span className="text-sm font-medium text-slate-300">
                            {houseEdge.edgeFactors.otherRulesContribution >= 0 ? '+' : ''}
                            {houseEdge.edgeFactors.otherRulesContribution.toFixed(2)}%
                        </span>
                    </div>

                    <div className="h-px my-1 bg-slate-700"></div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Deck Adjustment</span>
                        <span className={`text-sm font-medium ${houseEdge.deckFavorsPlayer ? 'text-green-500' : 'text-red-500'}`}>
                            {(houseEdge.currentHouseEdge - houseEdge.baseHouseEdge).toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ProbabilityDisplay;