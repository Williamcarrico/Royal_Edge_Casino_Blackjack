'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Hand } from './hand';
import { PlayerSplitHands } from './playerSplitHands';
import { GameControls } from './gameControls';
import { BettingControls } from './bettingControls';
import { GameStatus } from './gameStatus';
import { DealerTurn } from './dealerTurn';
import { InsuranceDialog } from './insuranceDialog';
import { cn, createCustomTableColor } from '@/lib/utils';
import {
    useGameStore,
    usePlayerHand,
    useDealerHand,
    useGamePhase,
    useRoundResult,
    useCardCounting
} from '@/store/hooks/useGameStore';
import {
    useTableSettings,
    useGameplaySettings
} from '@/hooks/useSettingsStore';
import styles from './table.module.css';
import { Button } from '@/components/ui/button';

interface GameTableProps {
    showCardCounting?: boolean;
    showBasicStrategy?: boolean;
    className?: string;
}

export const GameTable = ({
    showCardCounting = false,
    showBasicStrategy = false,
    className,
}: GameTableProps) => {
    // Use memoized hooks for settings to prevent re-renders
    const { tableColor } = useTableSettings();
    const { showProbabilities } = useGameplaySettings();

    // Use individual selectors for game state
    const gamePhase = useGamePhase();
    const roundResult = useRoundResult();
    const playerHand = usePlayerHand();
    const dealerHand = useDealerHand();
    const { runningCount, trueCount } = useCardCounting();

    // Get split hands and other state - use separate selectors for primitive values
    const playerHands = useGameStore(state => state.playerHands);
    const activeHandIndex = useGameStore(state => state.activeHandIndex);
    const handResults = useGameStore(state => state.handResults);

    // Insurance-related selectors
    const insuranceAvailable = useGameStore(state => state.insuranceAvailable);
    const takeInsurance = useGameStore(state => state.takeInsurance);
    const declineInsurance = useGameStore(state => state.declineInsurance);
    const takeEvenMoney = useGameStore(state => state.takeEvenMoney);

    // Insurance dialog state - maintain in local state
    const [showInsuranceDialog, setShowInsuranceDialog] = useState(false);

    // Derived values with useMemo
    const showDealerCards = useMemo(() => {
        const isEndPhase = ['dealerTurn', 'settlement', 'completed'].includes(gamePhase);
        // Also show all cards if dealer has busted, regardless of phase
        const dealerBusted = dealerHand?.isBusted === true;

        return isEndPhase || dealerBusted;
    }, [gamePhase, dealerHand?.isBusted]);

    // Check for split hands with null safety
    const hasSplitHands = useMemo(() =>
        Boolean(playerHands && playerHands.length > 0),
        [playerHands]
    );

    // Initialize game if not already done
    const initializeGame = useGameStore(state => state.initializeGame);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    // Convert hand results to the expected format
    const formattedResults = useMemo(() => {
        if (!playerHands || !handResults) return {};

        return playerHands.reduce((acc, hand, index) => {
            if (handResults[index]) {
                const result = handResults[index];
                acc[hand.id] = {
                    result: typeof result === 'string' ? result : 'unknown',
                    payout: 0 // Default payout since we don't have the actual value
                };
            }
            return acc;
        }, {} as { [key: string]: { result: string; payout: number } });
    }, [playerHands, handResults]);

    // Manage insurance dialog visibility - avoid circular dependencies
    useEffect(() => {
        // Only update when insurance availability changes to prevent loops
        if (insuranceAvailable && !showInsuranceDialog) {
            setShowInsuranceDialog(true);
        } else if (!insuranceAvailable && showInsuranceDialog) {
            setShowInsuranceDialog(false);
        }
    }, [insuranceAvailable, showInsuranceDialog]);

    // Handle insurance actions with useCallback to ensure stable references
    const handleTakeInsurance = useCallback(() => {
        // Set local state first to avoid UI flicker
        setShowInsuranceDialog(false);
        // Then update the game state
        takeInsurance();
    }, [takeInsurance]);

    const handleDeclineInsurance = useCallback(() => {
        // Set local state first to avoid UI flicker
        setShowInsuranceDialog(false);
        // Then update the game state
        declineInsurance();
    }, [declineInsurance]);

    const handleEvenMoney = useCallback(() => {
        // Set local state first to avoid UI flicker
        setShowInsuranceDialog(false);
        // Then update the game state
        takeEvenMoney();
    }, [takeEvenMoney]);

    // Memoize the table color class
    const tableColorClass = useMemo(() => {
        if (!tableColor) return '';

        // For predefined colors, return the corresponding class
        if (['red', 'green', 'blue', 'purple', 'black'].includes(tableColor)) {
            return styles[`color-${tableColor}`];
        }

        // For custom colors, return a custom color class
        return styles.customColor;
    }, [tableColor]);

    // Handle custom colors by creating custom CSS for them
    useEffect(() => {
        if (tableColor && !['red', 'green', 'blue', 'purple', 'black'].includes(tableColor)) {
            createCustomTableColor(tableColor);
        }
    }, [tableColor]);

    // Add a ResultOverlay component for regular player hands
    const ResultOverlay = ({ result, gamePhase }: { result: RoundResult, gamePhase: GamePhase }) => {
        // Only show for settlement or completed phases
        if (!['settlement', 'completed'].includes(gamePhase)) {
            return null;
        }

        // Additional check for push condition when result might be missing
        let effectiveResult = result;

        // If no result but we're in settlement/completed phase, try to determine it
        if (!effectiveResult && playerHand && dealerHand) {
            // Get best hand values using proper hand evaluation logic
            const playerValue = getBestHandValue(playerHand);
            const dealerValue = getBestHandValue(dealerHand);

            // Check if player and dealer have the same hand value (but neither busted)
            if (playerValue === dealerValue && playerValue <= 21 && dealerValue <= 21) {
                console.log('Push condition detected manually:', { playerValue, dealerValue });
                effectiveResult = 'push';
            }
        }

        // Log for debugging
        console.log('ResultOverlay rendering with:', { result, effectiveResult, gamePhase });

        if (!effectiveResult) {
            return null;
        }

        // Style based on result
        const getStyle = () => {
            switch (effectiveResult) {
                case 'win':
                case 'blackjack':
                    return 'bg-green-600 text-white';
                case 'push':
                    return 'bg-blue-600 text-white';
                case 'lose':
                case 'bust':
                    return 'bg-red-600 text-white';
                default:
                    return 'bg-gray-600 text-white';
            }
        };

        // Text based on result
        const getText = () => {
            switch (effectiveResult) {
                case 'blackjack':
                    return 'Blackjack!';
                case 'win':
                    return 'You Win!';
                case 'push':
                    return 'Push';
                case 'lose':
                    return 'Dealer Wins';
                case 'bust':
                    return 'Bust!';
                default:
                    return 'Result';
            }
        };

        return (
            <div className="mt-2 text-center">
                <span className={`px-3 py-1 rounded-md font-bold ${getStyle()}`}>
                    {getText()}
                </span>
            </div>
        );
    };

    // Helper function to get the best hand value
    function getBestHandValue(hand: any) {
        if (!hand || !hand.cards) return 0;

        let value = 0;
        let aces = 0;

        // Sum up card values
        for (const card of hand.cards) {
            // Handle face cards (J, Q, K)
            if (['J', 'Q', 'K'].includes(card.rank)) {
                value += 10;
            }
            // Handle Aces
            else if (card.rank === 'A') {
                aces += 1;
                value += 11; // Initially count Ace as 11
            }
            // Handle number cards
            else {
                value += parseInt(card.rank) || 10; // Default to 10 if not a valid number
            }
        }

        // Adjust aces as needed to avoid bust
        while (value > 21 && aces > 0) {
            value -= 10; // Change an ace from 11 to 1
            aces--;
        }

        return value;
    }

    return (
        <div
            className={cn(
                "w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl",
                "flex flex-col min-h-[600px]",
                "bg-gradient-radial from-white/10 from-0% to-transparent to-70%",
                styles.tableRoot,
                tableColorClass,
                className
            )}
            data-table-color={tableColor && !['red', 'green', 'blue', 'purple', 'black'].includes(tableColor) ? tableColor : undefined}
        >
            <div className="flex flex-col flex-1 p-4 md:p-6">
                {/* Responsive header area */}
                <div className="flex flex-col sm:flex-row sm:justify-between mb-4 gap-2">
                    <h2 className="text-lg font-semibold text-white">Dealer</h2>

                    {showCardCounting && (
                        <div className="flex space-x-4 text-xs text-white bg-black/30 rounded p-1">
                            <div>Running Count: <span className="font-semibold">{runningCount}</span></div>
                            <div>True Count: <span className="font-semibold">{trueCount.toFixed(1)}</span></div>
                        </div>
                    )}
                </div>

                {/* Dealer Hand - centered and responsive */}
                <div className="flex justify-center mb-6 md:mb-8 scale-90 sm:scale-100">
                    {dealerHand && (
                        <Hand
                            hand={dealerHand}
                            isDealer
                            showAllCards={showDealerCards}
                        />
                    )}
                </div>

                {/* Dealer Turn Component */}
                <DealerTurn
                    isActive={gamePhase === 'dealerTurn'}
                    onComplete={() => { }}
                />

                {/* Game Status - responsive placement */}
                <div className="flex justify-center my-2 md:my-4">
                    <GameStatus
                        gamePhase={gamePhase}
                        roundResult={roundResult}
                    />

                    {/* Add New Round button when round is over for better visibility */}
                    {(['settlement', 'completed'].includes(gamePhase)) && (
                        <div className="ml-2">
                            <Button
                                size="sm"
                                variant="default"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                onClick={() => {
                                    const resetRound = useGameStore.getState().resetRound;
                                    resetRound();
                                }}
                            >
                                New Round
                            </Button>
                        </div>
                    )}
                </div>

                {/* Player Hands - responsive sizing */}
                <div className="flex justify-center my-4 md:my-8 overflow-x-auto px-2">
                    <div className="scale-90 sm:scale-100">
                        {hasSplitHands ? (
                            <PlayerSplitHands
                                hands={playerHands ?? []}
                                activeHandIndex={activeHandIndex ?? 0}
                                showResults={gamePhase === 'settlement' || gamePhase === 'completed'}
                                results={formattedResults}
                            />
                        ) : playerHand && (
                            <div className="flex flex-col items-center">
                                <Hand
                                    hand={playerHand}
                                    isActive={gamePhase === 'playerTurn'}
                                    label="Player"
                                />
                                {/* Add result overlay for regular hands */}
                                {/* Debug info for result status */}
                                {console.log('Player hand result state:', {
                                    gamePhase,
                                    roundResult,
                                    isSettlementOrCompleted: ['settlement', 'completed'].includes(gamePhase),
                                    shouldShowResult: ['settlement', 'completed'].includes(gamePhase) && roundResult !== null
                                })}
                                <ResultOverlay
                                    result={roundResult}
                                    gamePhase={gamePhase}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Insurance Dialog */}
            <InsuranceDialog
                isOpen={showInsuranceDialog}
                onInsurance={handleTakeInsurance}
                onDecline={handleDeclineInsurance}
                onEvenMoney={handleEvenMoney}
                showProbability={showProbabilities}
            />

            {/* Controls Area - improved grid layout for all screen sizes */}
            <div className="p-4 bg-gray-900 border-t border-gray-800 md:p-6">
                {/* For mobile, stack the controls vertically */}
                <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2">
                    {/* Game Controls */}
                    <div className="w-full overflow-x-auto">
                        <GameControls
                            showHints={showBasicStrategy}
                            className="min-w-[300px]"
                        />
                    </div>

                    {/* Betting Controls */}
                    <div className="w-full overflow-x-auto">
                        <BettingControls
                            className="min-w-[300px]"
                        />
                    </div>
                </div>

                {/* Additional strategy guidance shown when enabled */}
                {showBasicStrategy && gamePhase === 'playerTurn' && (
                    <div className="mt-4 text-center">
                        <div className="inline-block px-2 py-1 text-xs font-medium text-white bg-blue-900/60 rounded">
                            Strategy advice is available during gameplay - check below your game controls
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameTable;