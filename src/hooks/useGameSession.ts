import { useState, useEffect, useCallback } from 'react'
import { Card, Hand, RoundResult } from '@/lib/utils/gameLogic'
import { GameSession } from '@/services/supabase/game-service'
import { GameStats } from '@/types/gameState'
import { HouseEdgeConfig, DEFAULT_HOUSE_EDGE } from '@/lib/utils/houseEdge'

interface GameSessionHook {
    // Session state
    isLoading: boolean
    error: string | null
    sessionId: string | null
    chips: number

    // Session management
    startSession: () => Promise<void>
    endSession: (gameStats: GameStats) => Promise<void>

    // Hand recording
    recordHand: (
        betAmount: number,
        playerCards: Card[],
        dealerCards: Card[],
        actions: string[],
        result: RoundResult,
        payout: number,
        sideBets?: any
    ) => Promise<void>

    // Configuration
    houseEdge: HouseEdgeConfig
    setHouseEdge: (config: HouseEdgeConfig) => void

    // Previous sessions
    previousSessions: GameSession[]
    loadPreviousSessions: () => Promise<void>
}

export const useGameSession = (): GameSessionHook => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [chips, setChips] = useState<number>(1000)
    const [houseEdge, setHouseEdge] = useState<HouseEdgeConfig>(DEFAULT_HOUSE_EDGE)
    const [previousSessions, setPreviousSessions] = useState<GameSession[]>([])

    /**
     * Start a new game session
     */
    const startSession = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start game session')
            }

            setSessionId(data.sessionId)
            setChips(data.chips)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred')
            console.error('Error starting game session:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    /**
     * End the current game session
     */
    const endSession = useCallback(async (gameStats: GameStats) => {
        if (!sessionId) {
            setError('No active session')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/game', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId,
                    gameStats
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to end game session')
            }

            // Reset session
            setSessionId(null)
            setChips(gameStats.endingChips)

            // Reload previous sessions to include this one
            await loadPreviousSessions()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred')
            console.error('Error ending game session:', err)
        } finally {
            setIsLoading(false)
        }
    }, [sessionId])

    /**
     * Record a completed hand
     */
    const recordHand = useCallback(async (
        betAmount: number,
        playerCards: Card[],
        dealerCards: Card[],
        actions: string[],
        result: RoundResult,
        payout: number,
        sideBets?: any
    ) => {
        if (!sessionId) {
            setError('No active session')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/game/record-hand', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId,
                    betAmount,
                    playerCards,
                    dealerCards,
                    actions,
                    result,
                    payout,
                    sideBets
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to record hand')
            }

            // Update chips after hand is recorded
            setChips(prev => prev + payout - betAmount)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred')
            console.error('Error recording hand:', err)
        } finally {
            setIsLoading(false)
        }
    }, [sessionId])

    /**
     * Load previous game sessions
     */
    const loadPreviousSessions = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/game', {
                method: 'GET',
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load previous sessions')
            }

            setPreviousSessions(data.sessions)
            setChips(data.chips)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred')
            console.error('Error loading previous sessions:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    /**
     * Load user data on initial render
     */
    useEffect(() => {
        loadPreviousSessions()
    }, [loadPreviousSessions])

    return {
        isLoading,
        error,
        sessionId,
        chips,
        startSession,
        endSession,
        recordHand,
        houseEdge,
        setHouseEdge,
        previousSessions,
        loadPreviousSessions
    }
}