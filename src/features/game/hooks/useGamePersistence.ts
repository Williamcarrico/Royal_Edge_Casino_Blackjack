// src/hooks/useGamePersistence.ts
import { useEffect, useCallback } from 'react'
import { useGameState } from '@/contexts/GameContext'
import { GameService } from '@/services/supabase/game-service'
import { HandService } from '@/services/supabase/hand-service'
import { TableService } from '@/services/supabase/table-service'
import { UserService } from '@/services/supabase/user-service'
import { HandResult } from '@/types/supabase'

export function useGamePersistence() {
    const { state, dispatch } = useGameState()
    const { userId, gamePhase, player, dealer, gameStats } = state

    // Initialize a game when betting phase starts
    useEffect(() => {
        if (gamePhase === 'betting' && userId && !state.gameId) {
            const initializeGame = async () => {
                try {
                    const gameId = await GameService.startGame(userId, player.bet)
                    dispatch({ type: 'SET_GAME_ID', payload: gameId })
                } catch (error) {
                    console.error('Failed to initialize game:', error)
                }
            }

            initializeGame()
        }
    }, [gamePhase, userId, player.bet, state.gameId, dispatch])

    // Record a hand when settlement phase is reached
    useEffect(() => {
        if (gamePhase === 'settlement' && userId && state.gameId && player.result) {
            const recordHand = async () => {
                try {
                    // Map game result to HandResult type
                    const result: HandResult =
                        player.result === 'blackjack' ? 'blackjack' :
                            player.result === 'win' ? 'win' :
                                player.result === 'lose' ? 'loss' :
                                    'push'

                    // Record the hand in the database
                    await HandService.recordHand({
                        gameId: state.gameId!,
                        playerId: userId,
                        playerCards: player.hands[player.activeHandIndex].cards,
                        dealerCards: dealer.hand.cards,
                        betAmount: player.bet,
                        result,
                        payout: player.winAmount,
                        playerTotal: player.hands[player.activeHandIndex].value,
                        dealerTotal: dealer.hand.value,
                        actionsTaken: state.actionHistory,
                    })

                    // Update table statistics
                    await TableService.updateTableStats({
                        totalHands: 1,
                        totalPlayerWins: result === 'win' || result === 'blackjack' ? 1 : 0,
                        totalPlayerLosses: result === 'loss' ? 1 : 0,
                        totalPushes: result === 'push' ? 1 : 0,
                        totalBlackjacks: result === 'blackjack' ? 1 : 0,
                    })

                } catch (error) {
                    console.error('Failed to record hand:', error)
                }
            }

            recordHand()
        }
    }, [gamePhase, userId, state.gameId, player.result, player.hands, player.activeHandIndex,
        player.bet, player.winAmount, dealer.hand, state.actionHistory])

    // Complete the game when the player is done
    const completeGame = useCallback(async () => {
        if (!userId || !state.gameId) return

        try {
            await GameService.completeGame(
                state.gameId,
                userId,
                player.chips,
                {
                    numHands: gameStats.handsPlayed,
                    numWins: gameStats.handsWon,
                    numLosses: gameStats.handsLost,
                    numPushes: gameStats.pushes,
                    numBlackjacks: gameStats.blackjacks
                }
            )

            // Update the user's balance
            await UserService.updateProfile(userId, {
                balance: player.chips
            })

            // Update table statistics
            await TableService.updateTableStats({
                totalGames: 1
            })

            // Clear the game ID
            dispatch({ type: 'SET_GAME_ID', payload: null })

        } catch (error) {
            console.error('Failed to complete game:', error)
        }
    }, [userId, state.gameId, player.chips, gameStats, dispatch])

    return { completeGame }
}