'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

// Define user type
export interface User {
    id: string
    email: string
    username: string
    display_name: string | null
    avatar_url: string | null
    bio: string | null
    birthdate: string | null
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

// Define user preferences type
export interface UserPreferences {
    id: string
    user_id: string
    theme: string
    sound_enabled: boolean
    animation_speed: string
    bet_amount: number
    created_at: string
    updated_at: string
}

// Define auth context interface
interface AuthContextType {
    user: User | null
    preferences: UserPreferences | null
    isLoading: boolean
    isAuthenticated: boolean
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    signUp: (email: string, password: string, username: string, displayName?: string, dateOfBirth?: string) => Promise<{ success: boolean; error?: string }>
    signOut: () => Promise<void>
    resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
    refreshUser: () => Promise<void>
    updateProfile: (data: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>) => Promise<{ success: boolean; error?: string }>
    updatePreferences: (data: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<{ success: boolean; error?: string }>
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
    user: null,
    preferences: null,
    isLoading: true,
    isAuthenticated: false,
    signIn: async () => ({ success: false }),
    signUp: async () => ({ success: false }),
    signOut: async () => { },
    resetPassword: async () => ({ success: false }),
    refreshUser: async () => { },
    updateProfile: async () => ({ success: false }),
    updatePreferences: async () => ({ success: false }),
})

// Hook to use auth context
export const useAuth = () => useContext(AuthContext)

// Auth Provider component
export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [user, setUser] = useState<User | null>(null)
    const [preferences, setPreferences] = useState<UserPreferences | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables')
    }

    const supabase = createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    )
    const router = useRouter()

    // Fetch user preferences
    const fetchUserPreferences = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/preferences')
            if (response.ok) {
                const data = await response.json()
                setPreferences(data.preferences)
                return data.preferences
            }
            return null
        } catch (error) {
            console.error('Error fetching user preferences:', error)
            return null
        }
    }, [])

    // Fetch user data from API
    const fetchUserData = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/profile')
            if (response.ok) {
                const data = await response.json()
                setUser(data.user)

                // Fetch user preferences
                if (data.user?.id) {
                    await fetchUserPreferences()
                }

                return data.user
            }
            return null
        } catch (error) {
            console.error('Error fetching user data:', error)
            return null
        }
    }, [fetchUserPreferences])

    // Refresh user data
    const refreshUser = useCallback(async () => {
        setIsLoading(true)
        await fetchUserData()
        setIsLoading(false)
    }, [fetchUserData, setIsLoading])

    // Sign in with email and password
    const signIn = useCallback(async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                return { success: false, error: error.message }
            }

            await refreshUser()
            return { success: true }
        } catch (error) {
            console.error('Sign in error:', error)
            return { success: false, error: 'An unexpected error occurred' }
        }
    }, [supabase.auth, refreshUser])

    // Sign up with email and password
    const signUp = useCallback(async (email: string, password: string, username: string, displayName?: string, dateOfBirth?: string) => {
        try {
            // Check if username exists first
            const { data: existingUsers, error: checkError } = await supabase
                .from('users')
                .select('username')
                .eq('username', username)
                .limit(1)

            if (checkError) {
                return { success: false, error: 'Error checking username availability' }
            }

            if (existingUsers && existingUsers.length > 0) {
                return { success: false, error: 'Username already taken' }
            }

            // Verify age (must be 21+)
            if (dateOfBirth) {
                const birthDate = new Date(dateOfBirth);
                const today = new Date();

                // Calculate age
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDifference = today.getMonth() - birthDate.getMonth();

                // Adjust age if birth month is after current month, or same month but birth day is after current day
                if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                if (age < 21) {
                    return { success: false, error: 'You must be at least 21 years old to create an account' };
                }
            } else {
                return { success: false, error: 'Date of birth is required' };
            }

            // Register user
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                        display_name: displayName ?? null,
                        birthdate: dateOfBirth ?? null,
                    },
                },
            })

            if (error) {
                return { success: false, error: error.message }
            }

            await refreshUser()
            return { success: true }
        } catch (error) {
            console.error('Sign up error:', error)
            return { success: false, error: 'An unexpected error occurred' }
        }
    }, [supabase, refreshUser])

    // Sign out
    const signOut = useCallback(async () => {
        await supabase.auth.signOut()
        setUser(null)
        setPreferences(null)
        router.push('/auth/sign-in')
    }, [supabase.auth, setUser, setPreferences, router])

    // Password reset
    const resetPassword = useCallback(async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/update-password`,
            })

            if (error) {
                return { success: false, error: error.message }
            }

            return { success: true }
        } catch (error) {
            console.error('Password reset error:', error)
            return { success: false, error: 'An unexpected error occurred' }
        }
    }, [supabase.auth])

    // Update user profile
    const updateProfile = useCallback(async (data: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>) => {
        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                return { success: false, error: error.message || 'Failed to update profile' }
            }

            await refreshUser()
            return { success: true }
        } catch (error) {
            console.error('Profile update error:', error)
            return { success: false, error: 'An unexpected error occurred' }
        }
    }, [refreshUser])

    // Update user preferences
    const updatePreferences = useCallback(async (data: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
        try {
            const response = await fetch('/api/auth/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                return { success: false, error: error.message || 'Failed to update preferences' }
            }

            // Refresh preferences
            if (user?.id) {
                await fetchUserPreferences()
            }

            return { success: true }
        } catch (error) {
            console.error('Preferences update error:', error)
            return { success: false, error: 'An unexpected error occurred' }
        }
    }, [user, fetchUserPreferences])

    // Check and set user on auth state change
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setIsLoading(true)

            if (session) {
                await fetchUserData()
            } else {
                setUser(null)
                setPreferences(null)
            }

            setIsLoading(false)
        })

        // Initial session check
        const initializeAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
                await fetchUserData()
            }

            setIsLoading(false)
        }

        initializeAuth()

        return () => {
            subscription.unsubscribe()
        }
    }, [fetchUserData, supabase.auth])

    const contextValue = useMemo(() => ({
        user,
        preferences,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshUser,
        updateProfile,
        updatePreferences,
    }), [
        user,
        preferences,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshUser,
        updateProfile,
        updatePreferences
    ])

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}