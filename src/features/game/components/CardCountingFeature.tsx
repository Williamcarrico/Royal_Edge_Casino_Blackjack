'use client';

import { useState, useMemo } from 'react';
import { useCardCounting } from '@/store/hooks/useGameStore';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/ui/layout/card';
import { Button } from '@/ui/layout/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/ui/dialog';
import { Progress } from '@/ui/layout/progress';
import {
    getBettingRecommendation,
    getTrueCountDescription,
    getPlayRecommendation
} from '@/lib/utils/cardCounting';
import { AlertCircle, HelpCircle, TrendingUp, Zap } from 'lucide-react';
import { Badge } from '@/ui/player/badge';

interface CardCountingFeatureProps {
    readonly mode?: 'compact' | 'detailed';
    readonly playerTotal?: number;
    readonly dealerUpCard?: number;
    readonly className?: string;
}

export function CardCountingFeature({
    mode = 'compact',
    playerTotal,
    dealerUpCard,
    className
}: CardCountingFeatureProps) {
    // Get card counting data from the store
    const { runningCount, trueCount, dealtCardsCount, remainingCards, penetration } = useCardCounting();

    // Local state for advanced features
    const [showGuide, setShowGuide] = useState(false);

    // Memoized values
    const betRecommendation = useMemo(() =>
        getBettingRecommendation(trueCount), [trueCount]);

    const countDescription = useMemo(() =>
        getTrueCountDescription(trueCount), [trueCount]);

    const playRecommendation = useMemo(() => {
        if (playerTotal && dealerUpCard) {
            return getPlayRecommendation(trueCount, playerTotal, dealerUpCard);
        }
        return null;
    }, [trueCount, playerTotal, dealerUpCard]);

    // Get color coding for true count
    const getTrueCountColor = (count: number) => {
        if (count >= 3) return 'text-green-500';
        if (count >= 1) return 'text-green-400';
        if (count > -1) return 'text-gray-400';
        if (count > -3) return 'text-red-400';
        return 'text-red-500';
    };

    const getRunningCountColor = (count: number) => {
        if (count >= 5) return 'text-green-500';
        if (count >= 2) return 'text-green-400';
        if (count > -2) return 'text-gray-400';
        if (count > -5) return 'text-red-400';
        return 'text-red-500';
    };

    // Get progress color for deck penetration
    const getPenetrationColor = (penetration: number) => {
        if (penetration < 0.5) return 'bg-blue-600';
        if (penetration < 0.6) return 'bg-green-600';
        if (penetration < 0.75) return 'bg-amber-500';
        return 'bg-red-600';
    };

    if (mode === 'compact') {
        return (
            <div className={`flex items-center text-sm rounded-md bg-black/40 px-3 py-1.5 space-x-3 ${className}`}>
                <div>
                    <span className="mr-1.5 opacity-80">RC:</span>
                    <span className={`font-semibold ${getRunningCountColor(runningCount)}`}>
                        {runningCount >= 0 ? `+${runningCount}` : runningCount}
                    </span>
                </div>
                <div>
                    <span className="mr-1.5 opacity-80">TC:</span>
                    <span className={`font-semibold ${getTrueCountColor(trueCount)}`}>
                        {trueCount >= 0 ? `+${trueCount.toFixed(1)}` : trueCount.toFixed(1)}
                    </span>
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-5 h-5 rounded-full"
                                onClick={() => setShowGuide(true)}
                            >
                                <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>View Counting Guide</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        );
    }

    return (
        <>
            <Card className={`bg-gray-800/90 border-gray-700 shadow-lg ${className}`}>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Card Counting Assistant</CardTitle>
                        <Badge
                            variant="outline"
                            className={getTrueCountColor(trueCount)}
                        >
                            {countDescription}
                        </Badge>
                    </div>
                    <CardDescription className="text-xs">
                        Deck penetration: {(penetration * 100).toFixed(0)}%
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-md bg-gray-900/60">
                            <div className="text-xs text-gray-400">Running Count</div>
                            <div className={`text-xl font-bold ${getRunningCountColor(runningCount)}`}>
                                {runningCount >= 0 ? `+${runningCount}` : runningCount}
                            </div>
                        </div>

                        <div className="p-2 rounded-md bg-gray-900/60">
                            <div className="text-xs text-gray-400">True Count</div>
                            <div className={`text-xl font-bold ${getTrueCountColor(trueCount)}`}>
                                {trueCount >= 0 ? `+${trueCount.toFixed(1)}` : trueCount.toFixed(1)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span>Cards Dealt: {dealtCardsCount}</span>
                            <span>Cards Remaining: {remainingCards}</span>
                        </div>
                        <Progress
                            value={penetration * 100}
                            className={`h-1.5 ${getPenetrationColor(penetration)}`}
                        />
                    </div>

                    <div className="p-2 space-y-2 rounded-md bg-gray-900/60">
                        <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1.5 text-indigo-400" />
                            <span className="text-sm font-medium">Recommendations</span>
                        </div>

                        <div className="grid grid-cols-2 text-xs gap-x-4 gap-y-1">
                            <div className="text-gray-400">Betting:</div>
                            <div className="font-medium text-amber-400">{betRecommendation}</div>

                            {playRecommendation && (
                                <>
                                    <div className="text-gray-400">Play:</div>
                                    <div className="font-medium text-sky-400">{playRecommendation}</div>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-indigo-300 hover:text-indigo-200"
                        onClick={() => setShowGuide(true)}
                    >
                        <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                        Card Counting Guide
                    </Button>
                </CardFooter>
            </Card>

            {/* Card Counting Guide Dialog */}
            <Dialog open={showGuide} onOpenChange={setShowGuide}>
                <DialogContent className="max-w-2xl text-white bg-gray-800 border-gray-700">
                    <DialogHeader>
                        <DialogTitle>Card Counting Guide</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Learn how to use card counting to gain an edge in blackjack
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-4 space-y-5">
                        <div className="space-y-2">
                            <h3 className="flex items-center text-lg font-medium">
                                <AlertCircle className="w-5 h-5 mr-2 text-amber-400" />
                                How It Works
                            </h3>
                            <p className="text-sm text-gray-300">
                                Card counting tracks the ratio of high cards (10s, face cards, aces) to low cards
                                remaining in the deck. When more high cards remain, the player has an advantage.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="p-3 space-y-2 rounded-md bg-gray-900/60">
                                <h4 className="font-medium">Hi-Lo System</h4>
                                <div className="grid grid-cols-3 gap-1">
                                    <div className="p-1 text-xs text-center rounded bg-green-900/30">
                                        <span className="block font-semibold text-green-400">+1</span>
                                        <span className="text-gray-400">2-6</span>
                                    </div>
                                    <div className="p-1 text-xs text-center rounded bg-gray-900/30">
                                        <span className="block font-semibold text-gray-400">0</span>
                                        <span className="text-gray-400">7-9</span>
                                    </div>
                                    <div className="p-1 text-xs text-center rounded bg-red-900/30">
                                        <span className="block font-semibold text-red-400">-1</span>
                                        <span className="text-gray-400">10-A</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 space-y-3 rounded-md bg-gray-900/60">
                                <h4 className="font-medium">Betting Strategy</h4>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">True Count ≤ 0:</span>
                                        <span>Minimum bet</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">True Count 1-2:</span>
                                        <span>2x minimum</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">True Count 3-4:</span>
                                        <span>4x minimum</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">True Count ≥ 5:</span>
                                        <span>8x minimum</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 space-y-2 rounded-md bg-gray-900/60">
                            <h4 className="flex items-center font-medium">
                                <Zap className="w-4 h-4 mr-1.5 text-amber-400" />
                                Strategy Deviations
                            </h4>
                            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                                <div>
                                    <div className="mb-1 font-semibold">True Count ≥ 3</div>
                                    <ul className="pl-4 space-y-1 text-gray-300 list-disc">
                                        <li>Take insurance</li>
                                        <li>16 vs 10: Stand instead of hit</li>
                                        <li>15 vs 10: Stand instead of hit</li>
                                    </ul>
                                </div>
                                <div>
                                    <div className="mb-1 font-semibold">True Count ≤ -2</div>
                                    <ul className="pl-4 space-y-1 text-gray-300 list-disc">
                                        <li>9 vs 2: Hit instead of double</li>
                                        <li>12 vs 4: Hit instead of stand</li>
                                        <li>12 vs 5: Hit instead of stand</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowGuide(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}