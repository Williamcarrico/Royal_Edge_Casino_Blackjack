import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/client'

export interface UserProfile {
    id: string
    username: string | null
    email: string
    display_name: string | null
    avatar_url: string | null
    bio: string | null
    chips: number
    total_hands_played: number
    hands_won: number
    hands_lost: number
    hands_tied: number
    blackjacks_hit: number
    highest_win_streak: number
    current_win_streak: number
    last_login: string | null
    created_at: string
    updated_at: string
}

/**
 * Manages user authentication operations
 */
export class AuthService {
    /**
     * Sign up a new user
     */
    static async signUp(email: string, password: string, username?: string): Promise<{ success: boolean; error?: string }> {
        const supabase = createBrowserClient()

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username || email,
                }
            }
        })

        if (error) {
            console.error('Error signing up:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    }

    /**
     * Sign in an existing user
     */
    static async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
        const supabase = createBrowserClient()

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            console.error('Error signing in:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    }

    /**
     * Sign out the current user
     */
    static async signOut(): Promise<{ success: boolean; error?: string }> {
        const supabase = createBrowserClient()

        const { error } = await supabase.auth.signOut()

        if (error) {
            console.error('Error signing out:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    }

    /**
     * Get current user session (server-side)
     */
    static async getCurrentUser(): Promise<{ user: { id: string } | null; error?: string }> {
        const supabase = createServerClient()

        const { data, error } = await supabase.auth.getSession()

        if (error) {
            console.error('Error getting current user:', error)
            return { user: null, error: error.message }
        }

        return { user: data.session?.user || null }
    }

    /**
     * Get user profile
     */
    static async getUserProfile(userId: string): Promise<UserProfile | null> {
        const supabase = createServerClient()

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error getting user profile:', error)
            return null
        }

        return data as UserProfile
    }

    /**
     * Update user profile
     */
    static async updateUserProfile(
        userId: string,
        updates: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
    ): Promise<{ success: boolean; error?: string }> {
        const supabase = createServerClient()

        // Add updated_at timestamp
        const updateData = {
            ...updates,
            updated_at: new Date().toISOString()
        }

        const { error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId)

        if (error) {
            console.error('Error updating user profile:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    }

    /**
     * Update user game statistics after a hand
     */
    static async updateGameStats(
        userId: string,
        result: 'win' | 'loss' | 'tie',
        isBlackjack: boolean = false
    ): Promise<{ success: boolean; error?: string }> {
        const supabase = createServerClient()

        // Get current user stats
        const { data: currentStats, error: fetchError } = await supabase
            .from('users')
            .select('total_hands_played, hands_won, hands_lost, hands_tied, blackjacks_hit, current_win_streak, highest_win_streak')
            .eq('id', userId)
            .single()

        if (fetchError) {
            console.error('Error fetching current stats:', fetchError)
            return { success: false, error: fetchError.message }
        }

        // Calculate new stats
        const updates: Record<string, number> = {
            total_hands_played: (currentStats?.total_hands_played || 0) + 1,
        }

        // Update specific result counter
        if (result === 'win') {
            updates.hands_won = (currentStats?.hands_won || 0) + 1
            updates.current_win_streak = (currentStats?.current_win_streak || 0) + 1

            // Update highest win streak if needed
            if (updates.current_win_streak > (currentStats?.highest_win_streak || 0)) {
                updates.highest_win_streak = updates.current_win_streak
            }
        } else if (result === 'loss') {
            updates.hands_lost = (currentStats?.hands_lost || 0) + 1
            updates.current_win_streak = 0
        } else if (result === 'tie') {
            updates.hands_tied = (currentStats?.hands_tied || 0) + 1
            // Win streak is not affected by ties
        }

        // Count blackjack if applicable
        if (isBlackjack) {
            updates.blackjacks_hit = (currentStats?.blackjacks_hit || 0) + 1
        }

        // Update user stats
        const { error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)

        if (updateError) {
            console.error('Error updating game stats:', updateError)
            return { success: false, error: updateError.message }
        }

        return { success: true }
    }

    /**
     * Get user preferences
     */
    static async getUserPreferences(userId: string): Promise<any | null> {
        const supabase = createServerClient()

        const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error) {
            console.error('Error getting user preferences:', error)
            return null
        }

        return data
    }

    /**
     * Update user preferences
     */
    static async updateUserPreferences(
        userId: string,
        preferences: Record<string, any>
    ): Promise<{ success: boolean; error?: string }> {
        const supabase = createServerClient()

        // Add updated_at timestamp
        const updateData = {
            ...preferences,
            updated_at: new Date().toISOString()
        }

        const { error } = await supabase
            .from('user_preferences')
            .update(updateData)
            .eq('user_id', userId)

        if (error) {
            console.error('Error updating user preferences:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    }
}