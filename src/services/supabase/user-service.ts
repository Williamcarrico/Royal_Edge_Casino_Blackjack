// src/services/supabase/user-service.ts
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

export interface UserStats {
    totalGames: number
    totalHands: number
    totalWins: number
    totalLosses: number
    totalPushes: number
    totalBlackjacks: number
    winRate: number
    balance: number
}

export class UserService {
    static async getProfile(userId: string) {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching user profile:', error)
            throw error
        }

        return data
    }

    static async updateProfile(userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
        const supabase = createClient()

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)

        if (error) {
            console.error('Error updating user profile:', error)
            throw error
        }

        return true
    }

    static async getUserStats(userId: string): Promise<UserStats> {
        const profile = await this.getProfile(userId)

        return {
            totalGames: profile.total_games,
            totalHands: profile.total_hands,
            totalWins: profile.total_wins,
            totalLosses: profile.total_losses,
            totalPushes: profile.total_pushes,
            totalBlackjacks: profile.total_blackjacks,
            winRate: profile.total_hands > 0 ? profile.total_wins / profile.total_hands : 0,
            balance: profile.balance
        }
    }

    static async updateUserBalance(userId: string, amount: number) {
        const profile = await this.getProfile(userId)
        const newBalance = profile.balance + amount

        return this.updateProfile(userId, { balance: newBalance })
    }
}