import { Card, Hand, RoundResult } from '@/lib/utils/gameLogic'
import { GameStats } from '@/types/gameState'
import { createClient } from '@/lib/supabase/server'

export interface GameSession {
    id: string
    userId: string
    startTime: Date
    endTime?: Date | null
    startingChips: number
    endingChips?: number | null
    handsPlayed: number
    handsWon: number
    handsLost: number
    pushes: number
    blackjacks: number
    biggestWin: number
}

export interface GameHand {
    id: string
    sessionId: string
    userId: string
    betAmount: number
    sideBets?: any | null
    playerCards: Card[]
    dealerCards: Card[]
    actions: string[]
    result: RoundResult
    payout: number
    createdAt: Date
}

/**
 * Manages game-related data operations with Supabase
 */
export class GameService {
    /**
     * Creates a new game session
     */
    static async createSession(userId: string, startingChips: number): Promise<string> {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('game_sessions')
            .insert({
                user_id: userId,
                starting_chips: startingChips,
                hands_played: 0,
                hands_won: 0,
                hands_lost: 0,
                pushes: 0,
                blackjacks: 0,
                biggest_win: 0
            })
            .select('id')
            .single()

        if (error) {
            console.error('Error creating game session:', error)
            throw new Error('Failed to create game session')
        }

        return data.id
    }

    /**
     * Updates a game session with final stats
     */
    static async updateSession(
        sessionId: string,
        gameStats: GameStats
    ): Promise<void> {
        const supabase = createClient()

        const { error } = await supabase
            .from('game_sessions')
            .update({
                end_time: new Date().toISOString(),
                ending_chips: gameStats.endingChips,
                hands_played: gameStats.handsPlayed,
                hands_won: gameStats.handsWon,
                hands_lost: gameStats.handsLost,
                pushes: gameStats.pushes,
                blackjacks: gameStats.blackjacks,
                biggest_win: gameStats.biggestWin
            })
            .eq('id', sessionId)

        if (error) {
            console.error('Error updating game session:', error)
            throw new Error('Failed to update game session')
        }
    }

    /**
     * Records a played hand in the database
     */
    static async recordHand(
        sessionId: string,
        userId: string,
        betAmount: number,
        playerCards: Card[],
        dealerCards: Card[],
        actions: string[],
        result: RoundResult,
        payout: number,
        sideBets?: any
    ): Promise<string> {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('game_hands')
            .insert({
                session_id: sessionId,
                user_id: userId,
                bet_amount: betAmount,
                side_bets: sideBets || null,
                player_cards: playerCards,
                dealer_cards: dealerCards,
                actions: actions,
                result: result || 'unknown',
                payout: payout
            })
            .select('id')
            .single()

        if (error) {
            console.error('Error recording game hand:', error)
            throw new Error('Failed to record game hand')
        }

        return data.id
    }

    /**
     * Updates user chips in the database
     */
    static async updateUserChips(userId: string, chips: number): Promise<void> {
        const supabase = createClient()

        const { error } = await supabase
            .from('users')
            .update({ chips })
            .eq('id', userId)

        if (error) {
            console.error('Error updating user chips:', error)
            throw new Error('Failed to update user chips')
        }
    }

    /**
     * Gets user information including chips
     */
    static async getUserInfo(userId: string): Promise<{ chips: number }> {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('users')
            .select('chips')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error getting user info:', error)
            throw new Error('Failed to get user info')
        }

        return { chips: data.chips }
    }

    /**
     * Gets all game sessions for a user
     */
    static async getUserSessions(userId: string): Promise<GameSession[]> {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('game_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('start_time', { ascending: false })

        if (error) {
            console.error('Error getting user sessions:', error)
            throw new Error('Failed to get user sessions')
        }

        return data.map(session => ({
            id: session.id,
            userId: session.user_id,
            startTime: new Date(session.start_time),
            endTime: session.end_time ? new Date(session.end_time) : null,
            startingChips: session.starting_chips,
            endingChips: session.ending_chips,
            handsPlayed: session.hands_played,
            handsWon: session.hands_won,
            handsLost: session.hands_lost,
            pushes: session.pushes,
            blackjacks: session.blackjacks,
            biggestWin: session.biggest_win
        }))
    }

    /**
     * Gets hands from a specific session
     */
    static async getSessionHands(sessionId: string): Promise<GameHand[]> {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('game_hands')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error getting session hands:', error)
            throw new Error('Failed to get session hands')
        }

        return data.map(hand => ({
            id: hand.id,
            sessionId: hand.session_id,
            userId: hand.user_id,
            betAmount: hand.bet_amount,
            sideBets: hand.side_bets,
            playerCards: hand.player_cards as Card[],
            dealerCards: hand.dealer_cards as Card[],
            actions: hand.actions as string[],
            result: hand.result as RoundResult,
            payout: hand.payout,
            createdAt: new Date(hand.created_at)
        }))
    }
}