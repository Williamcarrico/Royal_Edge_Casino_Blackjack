export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Add type alias for hand result
export type HandResult = 'win' | 'loss' | 'push' | 'blackjack'

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    created_at: string
                    username: string
                    avatar_url: string | null
                    display_name: string | null
                    email: string
                    total_games: number
                    total_hands: number
                    total_wins: number
                    total_losses: number
                    total_pushes: number
                    total_blackjacks: number
                    balance: number
                }
                Insert: {
                    id: string
                    created_at?: string
                    username: string
                    avatar_url?: string | null
                    display_name?: string | null
                    email: string
                    total_games?: number
                    total_hands?: number
                    total_wins?: number
                    total_losses?: number
                    total_pushes?: number
                    total_blackjacks?: number
                    balance?: number
                }
                Update: {
                    id?: string
                    created_at?: string
                    username?: string
                    avatar_url?: string | null
                    display_name?: string | null
                    email?: string
                    total_games?: number
                    total_hands?: number
                    total_wins?: number
                    total_losses?: number
                    total_pushes?: number
                    total_blackjacks?: number
                    balance?: number
                }
            }
            games: {
                Row: {
                    id: string
                    created_at: string
                    player_id: string
                    initial_bet: number
                    final_balance: number
                    num_hands: number
                    num_wins: number
                    num_losses: number
                    num_pushes: number
                    num_blackjacks: number
                    is_completed: boolean
                }
                Insert: {
                    id?: string
                    created_at?: string
                    player_id: string
                    initial_bet: number
                    final_balance?: number
                    num_hands?: number
                    num_wins?: number
                    num_losses?: number
                    num_pushes?: number
                    num_blackjacks?: number
                    is_completed?: boolean
                }
                Update: {
                    id?: string
                    created_at?: string
                    player_id?: string
                    initial_bet?: number
                    final_balance?: number
                    num_hands?: number
                    num_wins?: number
                    num_losses?: number
                    num_pushes?: number
                    num_blackjacks?: number
                    is_completed?: boolean
                }
            }
            hands: {
                Row: {
                    id: string
                    created_at: string
                    game_id: string
                    player_id: string
                    player_cards: string[]
                    dealer_cards: string[]
                    bet_amount: number
                    result: HandResult
                    payout: number
                    player_total: number
                    dealer_total: number
                    actions_taken: string[]
                }
                Insert: {
                    id?: string
                    created_at?: string
                    game_id: string
                    player_id: string
                    player_cards: string[]
                    dealer_cards: string[]
                    bet_amount: number
                    result: HandResult
                    payout: number
                    player_total: number
                    dealer_total: number
                    actions_taken: string[]
                }
                Update: {
                    id?: string
                    created_at?: string
                    game_id?: string
                    player_id?: string
                    player_cards?: string[]
                    dealer_cards?: string[]
                    bet_amount?: number
                    result?: HandResult
                    payout?: number
                    player_total?: number
                    dealer_total?: number
                    actions_taken?: string[]
                }
            }
            table_stats: {
                Row: {
                    id: string
                    created_at: string
                    total_games: number
                    total_hands: number
                    total_player_wins: number
                    total_player_losses: number
                    total_pushes: number
                    total_blackjacks: number
                    house_edge: number
                }
                Insert: {
                    id?: string
                    created_at?: string
                    total_games?: number
                    total_hands?: number
                    total_player_wins?: number
                    total_player_losses?: number
                    total_pushes?: number
                    total_blackjacks?: number
                    house_edge?: number
                }
                Update: {
                    id?: string
                    created_at?: string
                    total_games?: number
                    total_hands?: number
                    total_player_wins?: number
                    total_player_losses?: number
                    total_pushes?: number
                    total_blackjacks?: number
                    house_edge?: number
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}