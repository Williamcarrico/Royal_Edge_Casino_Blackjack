import React from 'react';
import { useGameStore } from '@/store/gameStore';
import PlayerControls from './PlayerControls';
import CardHand from './CardHand';
import { isPlayerTurnPhase, isDealerTurnPhase, isSettlementPhase, isCompletedPhase } from '@/types/gameState';
import { isDefined } from '@/lib/utils/safeAccessUtils';
import { ProbabilityDisplay } from '@/components/game/ProbabilityDisplay';
import { AutoStrategyPlayer } from '@/components/game/AutoStrategyPlayer';

/**
 * Main Blackjack game component that combines all the pieces
 */
const BlackjackGame: React.FC = () => {
    const gameState = useGameStore();

    return (
        <div className="min-h-screen p-6 bg-green-900">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center justify-between mb-8 text-white">
                    <h1 className="text-3xl font-bold">Royal Edge Casino Blackjack</h1>
                    <div className="flex gap-4 p-2 bg-black bg-opacity-50 rounded">
                        <div>Chips: ${gameState.chips}</div>
                        {gameState.bet > 0 && <div>Bet: ${gameState.bet}</div>}
                    </div>
                </header>

                <div className="p-6 mb-8 bg-green-800 rounded-lg shadow-lg">
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
                                            <div className="mt-2 font-bold text-center">
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
                <div className="p-4 mb-8 text-xl text-center text-white bg-black rounded-lg bg-opacity-70">
                    {gameState.message}
                </div>

                {/* Controls and strategy section */}
                <div className="flex flex-col gap-6 mb-8 md:flex-row">
                    {/* Game controls */}
                    <div className="flex-1">
                        <PlayerControls />
                    </div>

                    {/* Game strategy and probability section */}
                    <div className="w-full p-4 space-y-4 rounded-lg md:w-96 bg-slate-900 bg-opacity-80">
                        <h2 className="mb-3 text-xl font-bold text-white">Game Analysis</h2>
                        <ProbabilityDisplay />
                        <AutoStrategyPlayer className="mt-4" />
                    </div>
                </div>

                {/* Game stats (only shown when round is completed) */}
                {isCompletedPhase(gameState) && (
                    <div className="p-4 text-white bg-black rounded-lg bg-opacity-70">
                        <h2 className="mb-2 text-xl font-bold">Game Statistics</h2>
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