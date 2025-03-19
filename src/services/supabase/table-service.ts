// src/services/supabase/table-service.ts
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

export interface TableStatsUpdate {
    totalGames?: number
    totalHands?: number
    totalPlayerWins?: number
    totalPlayerLosses?: number
    totalPushes?: number
    totalBlackjacks?: number
}

export class TableService {
    static async getTableStats(): Promise<Database['public']['Tables']['table_stats']['Row']> {
        const supabase = createClient()

        // Get the table stats - assume there's only one record with a known ID
        const { data, error } = await supabase
            .from('table_stats')
            .select('*')
            .eq('id', 'global')
            .single()

        if (error) {
            console.error('Error fetching table stats:', error)
            throw error
        }

        return data
    }

    static async updateTableStats(updates: TableStatsUpdate) {
        const supabase = createClient()

        // Transform the update object to database column format
        const dbUpdates: Partial<Database['public']['Tables']['table_stats']['Update']> = {}

        if (updates.totalGames !== undefined) {
            dbUpdates.total_games = supabase.rpc('increment', {
                row_id: 'global', table: 'table_stats', column: 'total_games', amount: updates.totalGames
            })
        }

        if (updates.totalHands !== undefined) {
            dbUpdates.total_hands = supabase.rpc('increment', {
                row_id: 'global', table: 'table_stats', column: 'total_hands', amount: updates.totalHands
            })
        }

        if (updates.totalPlayerWins !== undefined) {
            dbUpdates.total_player_wins = supabase.rpc('increment', {
                row_id: 'global', table: 'table_stats', column: 'total_player_wins', amount: updates.totalPlayerWins
            })
        }

        if (updates.totalPlayerLosses !== undefined) {
            dbUpdates.total_player_losses = supabase.rpc('increment', {
                row_id: 'global', table: 'table_stats', column: 'total_player_losses', amount: updates.totalPlayerLosses
            })
        }

        if (updates.totalPushes !== undefined) {
            dbUpdates.total_pushes = supabase.rpc('increment', {
                row_id: 'global', table: 'table_stats', column: 'total_pushes', amount: updates.totalPushes
            })
        }

        if (updates.totalBlackjacks !== undefined) {
            dbUpdates.total_blackjacks = supabase.rpc('increment', {
                row_id: 'global', table: 'table_stats', column: 'total_blackjacks', amount: updates.totalBlackjacks
            })
        }

        // Calculate house edge if there are enough hands
        const stats = await this.getTableStats()
        const totalHandsNew = stats.total_hands + (updates.totalHands || 0)

        if (totalHandsNew > 100) {
            const totalPlayerLossesNew = stats.total_player_losses + (updates.totalPlayerLosses || 0)
            const houseEdge = totalPlayerLossesNew / totalHandsNew
            dbUpdates.house_edge = houseEdge
        }

        // Update the table stats
        const { error } = await supabase
            .from('table_stats')
            .update(dbUpdates)
            .eq('id', 'global')

        if (error) {
            console.error('Error updating table stats:', error)
            throw error
        }

        return true
    }
}