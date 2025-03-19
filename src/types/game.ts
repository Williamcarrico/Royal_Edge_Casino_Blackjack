/**
 * @module types/game
 * @description Type definitions for game-related data structures
 */

// --------------------------
// Game State Types
// --------------------------

/**
 * Possible phases of the blackjack game
 */
export type GamePhase = 'betting' | 'dealing' | 'playerTurn' | 'dealerTurn' | 'settlement' | 'completed' | 'error';

/**
 * Possible results of a blackjack round
 */
export type RoundResult = 'win' | 'loss' | 'push' | 'blackjack' | 'bust' | 'surrender' | null;

/**
 * Represents a playing card
 * @property {string} suit - The suit of the card (hearts, diamonds, clubs, spades)
 * @property {string} value - The value of the card (2-10, J, Q, K, A)
 * @property {boolean} [faceUp] - Whether the card is face up or face down
 * @property {string} [id] - Unique identifier for the card (for react keys)
 */
export interface Card {
    suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
    value: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
    faceUp?: boolean;
    id?: string;
}

// --------------------------
// Player Profile and Statistics
// --------------------------

/**
 * Represents a player achievement
 * @property {string} id - Unique identifier for the achievement
 * @property {string} name - Display name of the achievement
 * @property {string} description - Description of how to earn the achievement
 * @property {string} [icon] - Optional icon identifier or emoji for visual representation
 * @property {AchievementCategory} category - Category this achievement belongs to
 * @property {number} [progress] - Current progress toward earning the achievement (0-100)
 * @property {number} [threshold] - Target value needed to complete the achievement
 * @property {string | null} [unlockedAt] - ISO date string when achievement was unlocked, null if not unlocked
 * @property {boolean} [secret] - Whether this achievement should be hidden until unlocked
 */
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon?: string;
    category: AchievementCategory;
    progress?: number;
    threshold?: number;
    unlockedAt?: string | null;
    secret?: boolean;
}

/**
 * Achievement categories
 */
export type AchievementCategory = 'gameplay' | 'strategy' | 'skill' | 'special';

/**
 * Daily player performance data point
 * @property {string} date - ISO date string (YYYY-MM-DD)
 * @property {number} bankroll - Player's bankroll at this point in time
 * @property {number} winRate - Win rate as a decimal (0.0 - 1.0)
 */
export interface PerformanceData {
    date: string;
    bankroll: number;
    winRate: number;
}

/**
 * Player skill category and rating
 * @property {string} category - Skill category name
 * @property {number} value - Numerical skill rating (0-100)
 */
export interface SkillData {
    category: string;
    value: number;
}

/**
 * Represents a player's rank in the game
 */
export type PlayerRank =
    'Rookie' |
    'Amateur' |
    'Skilled' |
    'Professional' |
    'Expert' |
    'Master' |
    'Grandmaster' |
    'Legend';

/**
 * Complete player profile with all stats and achievements
 * @property {PerformanceData[]} performanceHistory - Historical performance data
 * @property {SkillData[]} skills - Player skill ratings across different categories
 * @property {Achievement[]} recentAchievements - Recently unlocked achievements
 * @property {Achievement[]} achievements - All player achievements
 * @property {number} level - Player's current level
 * @property {number} xp - Current experience points
 * @property {number} nextLevelXp - XP required for next level
 * @property {PlayerRank} rank - Player's current rank
 * @property {string} memberSince - ISO date string when player joined
 * @property {number} lifetimeEarnings - Total lifetime earnings
 * @property {number} roi - Return on investment as a decimal
 */
export interface PlayerProfile {
    performanceHistory: PerformanceData[];
    skills: SkillData[];
    recentAchievements: Achievement[];
    achievements: Achievement[];
    level: number;
    xp: number;
    nextLevelXp: number;
    rank: PlayerRank;
    memberSince: string;
    lifetimeEarnings: number;
    roi: number;
}

// --------------------------
// Game Analytics
// --------------------------

/**
 * Statistics for a single gaming session
 * @property {string} id - Unique identifier for the session
 * @property {Date} timestamp - When the session occurred
 * @property {number} handsPlayed - Number of hands played
 * @property {number} netProfit - Net profit/loss in dollars
 * @property {number} winRate - Win rate as a decimal
 * @property {number} blackjacks - Number of blackjacks achieved
 * @property {number} busts - Number of times player busted
 * @property {number} averageBetSize - Average bet size in dollars
 * @property {number} duration - Session duration in minutes
 */
export interface SessionStats {
    id: string;
    timestamp: Date;
    handsPlayed: number;
    netProfit: number;
    winRate: number;
    blackjacks: number;
    busts: number;
    averageBetSize: number;
    duration: number; // in minutes
}

/**
 * Analysis of betting patterns and outcomes
 * @property {number} betSize - Size of bet in dollars
 * @property {number} winCount - Number of wins with this bet size
 * @property {number} lossCount - Number of losses with this bet size
 * @property {number} netProfit - Net profit/loss with this bet size
 * @property {string} roi - Return on investment as percentage string
 */
export interface BettingPattern {
    betSize: number;
    winCount: number;
    lossCount: number;
    netProfit: number;
    roi: string; // in percentage
}

/**
 * Generic win/loss data for charts
 * @property {string} name - Category name
 * @property {number} value - Numerical value
 */
export interface WinLossData {
    name: string;
    value: number;
}

/**
 * Hand outcome statistics
 * @property {HandOutcomeType} type - Type of outcome
 * @property {number} count - Number of occurrences
 * @property {number} percentage - Percentage of total hands
 */
export interface HandOutcome {
    type: HandOutcomeType;
    count: number;
    percentage: number;
}

/**
 * Types of hand outcomes in blackjack
 */
export type HandOutcomeType =
    'win' |
    'loss' |
    'push' |
    'blackjack' |
    'bust' |
    'surrender' |
    'insurance_win' |
    'double_win' |
    'split_win';

// --------------------------
// Game Settings
// --------------------------

/**
 * Visual settings for game appearance
 */
export interface VisualSettings {
    /** UI theme option */
    theme: ThemeOption;
    /**
     * Animation speed percentage
     * @min 0
     * @max 100
     */
    animationSpeed: number;
    /** Table color as hex code */
    tableColor: string;
    /** Playing card visual style */
    cardStyle: CardStyleOption;
    /** Whether to show player avatars */
    showPlayerAvatars: boolean;
}

/**
 * Gameplay settings that affect game mechanics
 */
export interface GameplaySettings {
    /** Auto stand on hard 17 and above */
    autoStand17: boolean;
    /** Automatically play according to basic strategy */
    autoPlayBasicStrategy: boolean;
    /** Show probability statistics during gameplay */
    showProbabilities: boolean;
    /** Show card counting information */
    showCountingInfo: boolean;
    /** Default betting amount */
    defaultBetSize: number;
}

/**
 * Advanced settings for experienced players
 */
export interface AdvancedSettings {
    /** Show bet sizing heatmap */
    enableHeatmap: boolean;
    /** Show expected value calculations */
    showEV: boolean;
    /** Automatically adjust bet size based on count */
    autoAdjustBetSize: boolean;
    /**
     * Risk tolerance level percentage
     * @min 0
     * @max 100
     */
    riskTolerance: number;
}

/**
 * All game settings configurable by the player
 */
export interface GameSettings {
    /** Visual appearance settings */
    visual: VisualSettings;
    /** Gameplay mechanics settings */
    gameplay: GameplaySettings;
    /** Advanced player settings */
    advanced: AdvancedSettings;
}

/**
 * Theme options for UI
 */
export type ThemeOption = 'light' | 'dark' | 'system';

/**
 * Card style options
 */
export type CardStyleOption = 'modern' | 'classic' | 'minimal' | 'retro';

/**
 * Default game settings
 */
export const DEFAULT_GAME_SETTINGS: GameSettings = {
    visual: {
        theme: 'system',
        animationSpeed: 70,
        tableColor: '#076324', // Classic green
        cardStyle: 'modern',
        showPlayerAvatars: true
    },
    gameplay: {
        autoStand17: true,
        autoPlayBasicStrategy: false,
        showProbabilities: false,
        showCountingInfo: false,
        defaultBetSize: 10
    },
    advanced: {
        enableHeatmap: false,
        showEV: false,
        autoAdjustBetSize: false,
        riskTolerance: 50
    }
};

/**
 * Different variants of blackjack games
 */
export type BlackjackVariant = 'classic' | 'european' | 'atlantic' | 'vegas';

/**
 * Customizable game rules for different blackjack variants
 */
export interface GameRules {
    /** Number of decks used (1-8) */
    decksCount: number;
    /** Whether dealer hits on soft 17 */
    dealerHitsSoft17: boolean;
    /** Payout ratio for blackjack (3:2 = 1.5, 6:5 = 1.2, 1:1 = 1) */
    blackjackPayout: 1.5 | 1.2 | 1;
    /** Whether double down is allowed on any hand */
    doubleAllowed: boolean;
    /** Whether double after split is allowed */
    doubleAfterSplit: boolean;
    /** Whether surrender is allowed */
    surrender: boolean;
    /** Whether insurance is available */
    insuranceAvailable: boolean;
    /** Maximum number of splits allowed */
    maxSplits: number;
    /** Whether aces can be re-split */
    resplitAces: boolean;
    /** Whether players can hit split aces */
    hitSplitAces: boolean;
}

/**
 * Predefined rule sets for different blackjack variants
 */
export const gameVariantRules: Record<BlackjackVariant, GameRules> = {
    classic: {
        decksCount: 6,
        dealerHitsSoft17: true,
        blackjackPayout: 1.5,
        doubleAllowed: true,
        doubleAfterSplit: true,
        surrender: false,
        insuranceAvailable: true,
        maxSplits: 3,
        resplitAces: false,
        hitSplitAces: false
    },
    european: {
        decksCount: 6,
        dealerHitsSoft17: false,
        blackjackPayout: 1.5,
        doubleAllowed: true,
        doubleAfterSplit: true,
        surrender: false,
        insuranceAvailable: false,
        maxSplits: 3,
        resplitAces: false,
        hitSplitAces: false
    },
    atlantic: {
        decksCount: 8,
        dealerHitsSoft17: true,
        blackjackPayout: 1.5,
        doubleAllowed: true,
        doubleAfterSplit: true,
        surrender: true,
        insuranceAvailable: true,
        maxSplits: 3,
        resplitAces: true,
        hitSplitAces: false
    },
    vegas: {
        decksCount: 6,
        dealerHitsSoft17: true,
        blackjackPayout: 1.5,
        doubleAllowed: true,
        doubleAfterSplit: true,
        surrender: false,
        insuranceAvailable: true,
        maxSplits: 4,
        resplitAces: false,
        hitSplitAces: false
    }
};

// --------------------------
// Side Bets
// --------------------------

/**
 * Side bet types available in the game
 */
export type SideBetType = 'perfectPairs' | '21plus3' | 'luckyLadies';

/**
 * Side bet configuration
 */
export interface SideBet {
    type: SideBetType;
    amount: number;
    active: boolean;
}

/**
 * Perfect pairs result types and payouts
 */
export interface PerfectPairsResult {
    type: PerfectPairsOutcome;
    payout: number;
}

/**
 * Possible outcomes for Perfect Pairs side bet
 */
export type PerfectPairsOutcome = 'mixed' | 'colored' | 'perfect' | null;

/**
 * 21+3 poker hand result types and payouts
 */
export interface TwentyOnePlus3Result {
    type: TwentyOnePlus3Outcome;
    payout: number;
}

/**
 * Possible outcomes for 21+3 side bet
 */
export type TwentyOnePlus3Outcome = 'flush' | 'straight' | 'threeOfAKind' | 'straightFlush' | null;

/**
 * Lucky Ladies side bet result
 */
export interface LuckyLadiesResult {
    type: LuckyLadiesOutcome;
    payout: number;
}

/**
 * Possible outcomes for Lucky Ladies side bet
 */
export type LuckyLadiesOutcome = 'queenOfHearts' | 'queenPair' | 'anyQueen' | 'twentyTotal' | null;

/**
 * Union type of all side bet results
 */
export type SideBetResult = PerfectPairsResult | TwentyOnePlus3Result | LuckyLadiesResult;

/**
 * Side bet payout configurations
 */
export const sideBetPayouts = {
    perfectPairs: {
        mixed: 5,      // Different color, same rank
        colored: 10,   // Same color, same rank
        perfect: 30    // Same suit, same rank
    },
    '21plus3': {
        flush: 5,          // Same suit
        straight: 10,      // Sequential ranks
        threeOfAKind: 30,  // Same rank
        straightFlush: 40  // Sequential ranks, same suit
    },
    luckyLadies: {
        queenOfHearts: 50,      // Queen of hearts
        queenPair: 20,          // Pair of queens
        anyQueen: 10,           // Any queen
        twentyTotal: 4          // Hand totaling 20
    }
};

// --------------------------
// Utility Types
// --------------------------

/**
 * Generic validation result with errors
 */
export interface ValidationResult<T> {
    isValid: boolean;
    data?: T;
    errors?: string[];
}

/**
 * Make specified properties in T required
 */
export type RequireProperties<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Make all properties in T readonly
 */
export type Immutable<T> = {
    readonly [K in keyof T]: T[K];
};

/**
 * Create a partial type with only the specified keys
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;