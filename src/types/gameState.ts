import { Card, Hand, RoundResult, SideBet, SideBetType } from '@/lib/utils/gameLogic';
import { GamePhase } from './gameStateMachine';

/**
 * State for the dealer in the game
 */
export interface DealerState {
    readonly hand: Hand;
    isRevealed: boolean;
}

/**
 * State for a player in the game
 */
export interface PlayerState {
    hands: Hand[];
    activeHandIndex: number;
    chips: number;
    bet: number;
    insuranceBet: number;
    result: RoundResult | null;
    winAmount: number;
}

/**
 * Game statistics for tracking performance
 */
export interface GameStats {
    readonly handsPlayed: number;
    readonly handsWon: number;
    readonly handsLost: number;
    readonly pushes: number;
    readonly blackjacks: number;
    readonly busts: number;
    readonly biggestWin: number;
    readonly startingChips: number;
    readonly endingChips: number;
    readonly sessionStart: Date;
}

/**
 * Game rules configuration
 */
export interface GameRules {
    readonly decksCount: number;
    readonly dealerHitsSoft17: boolean;
    readonly blackjackPays: number;
    readonly playerCanSurrender: boolean;
    readonly maxSplitHands: number;
    readonly canDoubleAfterSplit: boolean;
    readonly canHitSplitAces: boolean;
}

/**
 * Base interface with common properties for all game states
 */
export interface GameStateBase {
    // Common deck and card state
    shoe: Card[];
    dealerHand: Hand;
    dealtCards: Card[];
    runningCount: number;
    trueCount: number;

    // Normalized entities for advanced state management
    entities?: {
        hands: Record<string, Hand>;
        cards: Record<string, Card>;
    };
    dealerHandId?: string;
    playerHandIds?: string[];
    activePlayerHandId?: string | null;

    // Common UI state
    message: string;

    // Financial state
    chips: number;
    bet: number;

    // User authentication and identification
    readonly userId: string | null;
    readonly isAuthenticated: boolean;

    // Game initialization state
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;

    // Game phase tracking
    gamePhase: GamePhase;

    // Structured game state
    dealer: DealerState;
    player: PlayerState;

    // History tracking
    actionHistory: string[];
    messageLog: string[];
    gameStats: GameStats;

    // Side bets
    sideBets: SideBet[];
    currentSideBetsTotal: number;

    // Game rules
    gameRules: GameRules;

    // Split hands tracking
    playerHands?: Hand[];
    activeHandIndex?: number;
    handResults?: RoundResult[];

    // Insurance-related properties
    insuranceAvailable?: boolean;

    // Action availability
    isDoubleDownAvailable: boolean;
    isSplitAvailable: boolean;
}

/**
 * Betting phase state
 */
export interface BettingPhaseState extends GameStateBase {
    gamePhase: 'betting';
    playerHand?: Hand;
    roundResult: null;
    isDoubleDownAvailable: false;
    isSplitAvailable: false;
}

/**
 * Player turn phase state
 */
export interface PlayerTurnPhaseState extends GameStateBase {
    gamePhase: 'playerTurn';
    playerHand: Hand;
    roundResult: null;
    isDoubleDownAvailable: boolean;
    isSplitAvailable: boolean;
}

/**
 * Dealer turn phase state
 */
export interface DealerTurnPhaseState extends GameStateBase {
    gamePhase: 'dealerTurn';
    playerHand: Hand;
    roundResult: null;
    isDoubleDownAvailable: false;
    isSplitAvailable: false;
}

/**
 * Settlement phase state
 */
export interface SettlementPhaseState extends GameStateBase {
    gamePhase: 'settlement';
    playerHand: Hand;
    roundResult: RoundResult;
    isDoubleDownAvailable: false;
    isSplitAvailable: false;
}

/**
 * Completed phase state
 */
export interface CompletedPhaseState extends GameStateBase {
    gamePhase: 'completed';
    playerHand: Hand;
    roundResult: RoundResult;
    isDoubleDownAvailable: false;
    isSplitAvailable: false;
}

/**
 * Union type representing all possible game states
 */
export type GameState =
    | BettingPhaseState
    | PlayerTurnPhaseState
    | DealerTurnPhaseState
    | SettlementPhaseState
    | CompletedPhaseState;

/**
 * Type guard to check if the game is in betting phase
 */
export function isBettingPhase(state: GameState): state is BettingPhaseState {
    return state.gamePhase === 'betting';
}

/**
 * Type guard to check if the game is in player turn phase
 */
export function isPlayerTurnPhase(state: GameState): state is PlayerTurnPhaseState {
    return state.gamePhase === 'playerTurn';
}

/**
 * Type guard to check if the game is in dealer turn phase
 */
export function isDealerTurnPhase(state: GameState): state is DealerTurnPhaseState {
    return state.gamePhase === 'dealerTurn';
}

/**
 * Type guard to check if the game is in settlement phase
 */
export function isSettlementPhase(state: GameState): state is SettlementPhaseState {
    return state.gamePhase === 'settlement';
}

/**
 * Type guard to check if the game is in completed phase
 */
export function isCompletedPhase(state: GameState): state is CompletedPhaseState {
    return state.gamePhase === 'completed';
}

/**
 * Type for Game Store actions
 */
export interface GameActions {
    // Game lifecycle methods
    resetGame: () => void;
    initializeGame: () => void;

    // Betting methods
    placeBet: (amount: number) => void;
    increaseBet: (amount: number) => void;
    clearBet: () => void;

    // Side bets methods
    placeSideBet: (bet: SideBet) => void;
    clearSideBet: (type: SideBetType) => void;
    clearAllSideBets: () => void;

    // Gameplay methods
    dealInitialCards: () => void;
    dealCards: () => void;
    hit: () => void;
    stand: () => void;
    doubleDown: () => void;
    split: () => void;
    takeInsurance: () => void;
    declineInsurance: () => void;
    takeEvenMoney: () => void;
    surrender: () => void;
    playDealerTurn: () => void;
    playDealer: () => void;

    // Round management
    endRound: () => void;
    resetRound: () => void;

    // User and session management
    setUserId: (userId: string | null) => void;
    loadUserChips: () => Promise<void>;
    saveGameResults: () => Promise<void>;
    saveSession: () => Promise<void>;
    endSession: () => Promise<void>;

    // Action availability checks
    canSplit: () => boolean;
    canDoubleDown: () => boolean;
    canTakeInsurance: () => boolean;
    canSurrender: () => boolean;

    // Helper methods
    clearError: () => void;
    updateGameFromRules: () => void;
    revealDealerCards?: () => void;
}