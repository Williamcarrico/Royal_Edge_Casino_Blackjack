'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import {
    isBettingPhase,
    isPlayerTurnPhase,
    isDealerTurnPhase,
    isSettlementPhase,
    isCompletedPhase
} from '@/types/gameState';

/**
 * Player controls component that shows different controls based on game phase
 * Uses type guards to ensure type-safe access to phase-specific properties
 */
const PlayerControls: React.FC = () => {
    const gameState = useGameStore();

    // Using type guards to access phase-specific properties safely
    if (isBettingPhase(gameState)) {
        return (
            <div className="flex flex-col gap-4 p-4 bg-green-800 rounded-lg">
                <h2 className="text-xl font-bold text-white">Place Your Bet</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => gameState.placeBet(10)}
                        disabled={gameState.chips < 10}
                        className="px-4 py-2 bg-yellow-500 text-black font-bold rounded disabled:opacity-50"
                    >
                        Bet $10
                    </button>
                    <button
                        onClick={() => gameState.placeBet(25)}
                        disabled={gameState.chips < 25}
                        className="px-4 py-2 bg-yellow-500 text-black font-bold rounded disabled:opacity-50"
                    >
                        Bet $25
                    </button>
                    <button
                        onClick={() => gameState.placeBet(100)}
                        disabled={gameState.chips < 100}
                        className="px-4 py-2 bg-yellow-500 text-black font-bold rounded disabled:opacity-50"
                    >
                        Bet $100
                    </button>
                </div>

                {gameState.bet > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => gameState.clearBet()}
                            className="px-4 py-2 bg-red-500 text-white font-bold rounded"
                        >
                            Clear Bet
                        </button>
                        <button
                            onClick={() => gameState.dealCards()}
                            className="px-4 py-2 bg-blue-500 text-white font-bold rounded"
                        >
                            Deal
                        </button>
                    </div>
                )}

                <div className="text-white">
                    <p>Current Bet: ${gameState.bet}</p>
                    <p>Available Chips: ${gameState.chips}</p>
                </div>
            </div>
        );
    }

    if (isPlayerTurnPhase(gameState)) {
        // Safe access to player hand properties - TypeScript knows playerHand exists in this phase
        const handValue = gameState.playerHand.values
            ? Math.max(...gameState.playerHand.values.filter(v => v <= 21))
            : 0;

        return (
            <div className="flex flex-col gap-4 p-4 bg-green-800 rounded-lg">
                <h2 className="text-xl font-bold text-white">Your Turn</h2>
                <div className="text-white mb-2">
                    <p>Hand Value: {handValue}</p>
                    {gameState.playerHand.isSoft && <p>(Soft Hand)</p>}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => gameState.hit()}
                        className="px-4 py-2 bg-blue-500 text-white font-bold rounded"
                    >
                        Hit
                    </button>
                    <button
                        onClick={() => gameState.stand()}
                        className="px-4 py-2 bg-gray-500 text-white font-bold rounded"
                    >
                        Stand
                    </button>

                    {gameState.canDoubleDown() && (
                        <button
                            onClick={() => gameState.doubleDown()}
                            className="px-4 py-2 bg-purple-500 text-white font-bold rounded"
                        >
                            Double Down
                        </button>
                    )}

                    {gameState.canSplit() && (
                        <button
                            onClick={() => gameState.split()}
                            className="px-4 py-2 bg-yellow-500 text-black font-bold rounded"
                        >
                            Split
                        </button>
                    )}
                </div>

                <div className="text-white">
                    <p>Current Bet: ${gameState.bet}</p>
                </div>
            </div>
        );
    }

    if (isDealerTurnPhase(gameState)) {
        return (
            <div className="flex flex-col gap-4 p-4 bg-green-800 rounded-lg">
                <h2 className="text-xl font-bold text-white">Dealer&apos;s Turn</h2>
                <p className="text-white">Dealer is playing...</p>
                <button
                    onClick={() => gameState.playDealer()}
                    className="px-4 py-2 bg-blue-500 text-white font-bold rounded"
                >
                    Continue
                </button>
            </div>
        );
    }

    if (isSettlementPhase(gameState)) {
        // Safe access to roundResult - TypeScript knows it exists in this phase
        return (
            <div className="flex flex-col gap-4 p-4 bg-green-800 rounded-lg">
                <h2 className="text-xl font-bold text-white">Round Result</h2>
                <div className="text-white mb-4">
                    <p className="text-2xl">
                        {gameState.roundResult === 'win' && 'You Win!'}
                        {gameState.roundResult === 'lose' && 'Dealer Wins'}
                        {gameState.roundResult === 'push' && 'Push (Tie)'}
                        {gameState.roundResult === 'bust' && 'Bust! You Lose'}
                        {gameState.roundResult === 'surrender' && 'Surrendered'}
                    </p>
                </div>

                <button
                    onClick={() => gameState.endRound()}
                    className="px-4 py-2 bg-blue-500 text-white font-bold rounded"
                >
                    Continue
                </button>
            </div>
        );
    }

    if (isCompletedPhase(gameState)) {
        return (
            <div className="flex flex-col gap-4 p-4 bg-green-800 rounded-lg">
                <h2 className="text-xl font-bold text-white">Round Complete</h2>
                <p className="text-white">Ready for the next round?</p>
                <button
                    onClick={() => gameState.resetRound()}
                    className="px-4 py-2 bg-blue-500 text-white font-bold rounded"
                >
                    New Round
                </button>

                <div className="text-white mt-4">
                    <p>Available Chips: ${gameState.chips}</p>
                </div>
            </div>
        );
    }

    // Default case - shouldn't reach here with proper typing
    return (
        <div className="flex flex-col gap-4 p-4 bg-red-800 rounded-lg">
            <h2 className="text-xl font-bold text-white">Unknown Game State</h2>
            <p className="text-white">Current phase: Unknown</p>
            <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white font-bold rounded"
            >
                Reset Game
            </button>
        </div>
    );
};

export default PlayerControls;