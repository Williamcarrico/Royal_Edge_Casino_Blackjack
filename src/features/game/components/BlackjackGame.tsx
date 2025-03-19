import React from 'react';
import { useGameStore } from '@/features/game/store/gameStore';
import PlayerControls from './PlayerControls';
import CardHand from './CardHand';
import { isPlayerTurnPhase, isDealerTurnPhase, isSettlementPhase, isCompletedPhase } from '@/types/gameState';
import { handUtils } from '@/lib/utils/handUtils';
import { isDefined } from '@/lib/utils/safeAccessUtils';
import { ProbabilityDisplay } from './ProbabilityDisplay';
import { AutoStrategyPlayer } from './AutoStrategyPlayer';

/**
 * Main Blackjack game component that combines all the pieces
 */
const BlackjackGame: React.FC = () => {
    const gameState = useGameStore();

    return (
        <div className="min-h-screen bg-green-900 p-6">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8 text-white">
                    <h1 className="text-3xl font-bold">Royal Edge Casino Blackjack</h1>
                    <div className="bg-black bg-opacity-50 p-2 rounded flex gap-4">
                        <div>Chips: ${gameState.chips}</div>
                        {gameState.bet > 0 && <div>Bet: ${gameState.bet}</div>}
                    </div>
                </header>

                <div className="bg-green-800 rounded-lg p-6 shadow-lg mb-8">
                    <div className="mb-4">
                        <CardHand
                            hand={gameState.dealerHand}
                            title="Dealer"
                            isDealer={true}
                            showHandValue={isDealerTurnPhase(gameState) ||
                                isSettlementPhase(gameState) ||
                                isCompletedPhase(gameState)}
                        />
                    </div>

                    {/* Player's hands section */}
                    <div>
                        {/* Handle regular hand */}
                        {!isDefined(gameState.player.hands) || gameState.player.hands.length === 0 ? (
                            <CardHand
                                hand={gameState.playerHand}
                                title="Your Hand"
                                showHandValue={isPlayerTurnPhase(gameState) ||
                                    isDealerTurnPhase(gameState) ||
                                    isSettlementPhase(gameState) ||
                                    isCompletedPhase(gameState)}
                            />
                        ) : (
                            /* Handle split hands */
                            <div className="flex flex-wrap justify-center gap-8">
                                {gameState.player.hands.map((hand, index) => (
                                    <div
                                        key={hand.id}
                                        className={`${index === gameState.player.activeHandIndex &&
                                            isPlayerTurnPhase(gameState)
                                            ? 'border-2 border-yellow-400 rounded-lg p-2'
                                            : ''
                                            }`}
                                    >
                                        <CardHand
                                            hand={hand}
                                            title={`Hand ${index + 1}`}
                                            showHandValue={true}
                                        />

                                        {isDefined(gameState.handResults) && isDefined(gameState.handResults[index]) && (
                                            <div className="text-center font-bold mt-2">
                                                {gameState.handResults[index] === 'win' && (
                                                    <span className="text-yellow-400">Win!</span>
                                                )}
                                                {gameState.handResults[index] === 'lose' && (
                                                    <span className="text-red-500">Lose</span>
                                                )}
                                                {gameState.handResults[index] === 'push' && (
                                                    <span className="text-blue-300">Push</span>
                                                )}
                                                {gameState.handResults[index] === 'bust' && (
                                                    <span className="text-red-500">Bust</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Game message */}
                <div className="bg-black bg-opacity-70 p-4 rounded-lg mb-8 text-white text-center text-xl">
                    {gameState.message}
                </div>

                {/* Controls and strategy section */}
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    {/* Game controls */}
                    <div className="flex-1">
                        <PlayerControls />
                    </div>

                    {/* Game strategy and probability section */}
                    <div className="w-full md:w-96 space-y-4 bg-slate-900 bg-opacity-80 p-4 rounded-lg">
                        <h2 className="text-xl font-bold text-white mb-3">Game Analysis</h2>
                        <ProbabilityDisplay />
                        <AutoStrategyPlayer className="mt-4" />
                    </div>
                </div>

                {/* Game stats (only shown when round is completed) */}
                {isCompletedPhase(gameState) && (
                    <div className="bg-black bg-opacity-70 p-4 rounded-lg text-white">
                        <h2 className="text-xl font-bold mb-2">Game Statistics</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>Hands Played: {gameState.gameStats.handsPlayed}</div>
                            <div>Hands Won: {gameState.gameStats.handsWon}</div>
                            <div>Hands Lost: {gameState.gameStats.handsLost}</div>
                            <div>Pushes: {gameState.gameStats.pushes}</div>
                            <div>Blackjacks: {gameState.gameStats.blackjacks}</div>
                            <div>Busts: {gameState.gameStats.busts}</div>
                            <div>Biggest Win: ${gameState.gameStats.biggestWin}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlackjackGame;