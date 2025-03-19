'use client';

// Import essential game logic types and utilities - only what we need
import {
    Card,
    Hand,
    createShoe,
    SideBet,
    SideBetType,
    PerfectPairsResult,
    TwentyOnePlus3Result,
    perfectPairsPayout,
    twentyOnePlus3Payout,
    calculateHandValues,
    RoundResult
} from '@/lib/utils/gameLogic';

// Import state management and utility functions
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
    GameState as StoreGameState,
    GameActions,
    isBettingPhase,
    isPlayerTurnPhase,
    isDealerTurnPhase,
    isSettlementPhase,
    isCompletedPhase,
    BettingPhaseState,
    PlayerTurnPhaseState,
    SettlementPhaseState,
    CompletedPhaseState,
    GameStats
} from '@/types/gameState';
import { hitAction } from './hitAction';
import { standAction } from './standAction';
import { doubleDownAction } from './doubleDownAction';
import { splitAction } from './splitAction';
import { placeBetAction, increaseBetAction, clearBetAction } from './placeBetAction';
import { dealerTurnAction } from './dealerTurnAction';

// Export the GameState type from our types module for use elsewhere
export type GameState = StoreGameState;

/**
 * Create a shuffled shoe of cards
 */
function shuffleShoe(shoe: Card[]): Card[] {
    // Fisher-Yates shuffle algorithm
    const shuffled = [...shoe];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Initial state for a new game
 */
const createInitialState = (): BettingPhaseState => {
    // Create and shuffle initial shoe
    const initialShoe = shuffleShoe(createShoe(6));

    // Create dealer hand with unique ID
    const dealerHandId = 'dealer-hand-' + Date.now();
    const emptyHand: Hand = {
        id: dealerHandId,
        cards: [],
        values: [0],
        isSoft: false,
        isBlackjack: false,
        canSplit: false,
        isBusted: false
    };

    return {
        // Normalized entities
        entities: {
            hands: {
                [dealerHandId]: emptyHand
            },
            cards: {},
        },

        // References
        dealerHandId: dealerHandId,
        playerHandIds: [],
        activePlayerHandId: null,

        // Common deck and card state
        shoe: initialShoe,
        dealtCards: [],
        runningCount: 0,
        trueCount: 0,

        // Common UI state
        message: 'Welcome to Blackjack! Place your bet to begin.',

        // Financial state
        chips: 1000,
        bet: 0,

        // User authentication and identification
        userId: null,
        isAuthenticated: false,

        // Game initialization state
        isInitialized: true,
        isLoading: false,
        error: null,

        // Game phase tracking
        gamePhase: 'betting',
        roundResult: null,

        // Structured game state (keeping for backward compatibility during transition)
        dealer: {
            hand: emptyHand,
            isRevealed: false
        },
        player: {
            hands: [],
            activeHandIndex: 0,
            chips: 1000,
            bet: 0,
            insuranceBet: 0,
            result: null,
            winAmount: 0
        },

        // History tracking
        actionHistory: [],
        messageLog: ['Welcome to Blackjack! Place your bet to begin.'],
        gameStats: {
            handsPlayed: 0,
            handsWon: 0,
            handsLost: 0,
            pushes: 0,
            blackjacks: 0,
            busts: 0,
            biggestWin: 0,
            startingChips: 1000,
            endingChips: 1000,
            sessionStart: new Date()
        },

        // Side bets
        sideBets: [],
        currentSideBetsTotal: 0,

        // Game rules
        gameRules: {
            decksCount: 6,
            dealerHitsSoft17: true,
            blackjackPays: 1.5,
            playerCanSurrender: true,
            maxSplitHands: 4,
            canDoubleAfterSplit: true,
            canHitSplitAces: false
        },

        // Action availability
        isDoubleDownAvailable: false,
        isSplitAvailable: false,
    };
};

// These helper functions are exported for potential future use in other files
// but are currently unused in this file

/**
 * Helper to evaluate Perfect Pairs bet
 * @param cards The cards to evaluate
 * @returns The result of the bet or null if not a winning bet
 */
export const evaluatePerfectPairsBet = (cards: Card[]): PerfectPairsResult | null => {
    if (cards.length < 2) return null;

    const [card1, card2] = cards;

    // Check if cards form a pair (same value)
    if (card1.value !== card2.value) return null;

    // Check if perfect pair (same suit)
    if (card1.suit === card2.suit) {
        return {
            name: 'Perfect Pair',
            payout: perfectPairsPayout.perfectPair
        };
    }

    // Check if colored pair (same color)
    const suit1Color = card1.suit === 'hearts' || card1.suit === 'diamonds' ? 'red' : 'black';
    const suit2Color = card2.suit === 'hearts' || card2.suit === 'diamonds' ? 'red' : 'black';

    if (suit1Color === suit2Color) {
        return {
            name: 'Colored Pair',
            payout: perfectPairsPayout.coloredPair
        };
    }

    // Otherwise, mixed pair
    return {
        name: 'Mixed Pair',
        payout: perfectPairsPayout.mixedPair
    };
};

/**
 * Helper to evaluate 21+3 bet
 * @param playerCards The player's cards
 * @param dealerUpCard The dealer's up card
 * @returns The result of the bet or null if not a winning bet
 */
export const evaluate21Plus3Bet = (playerCards: Card[], dealerUpCard: Card | null): TwentyOnePlus3Result | null => {
    if (playerCards.length < 2 || !dealerUpCard) return null;

    const cards = [...playerCards.slice(0, 2), dealerUpCard];

    // Check for three of a kind
    const isThreeOfAKind = cards.every(card => card.value === cards[0].value);
    if (isThreeOfAKind) {
        // Check if all same suit (suited trips)
        const isSuitedTrips = cards.every(card => card.suit === cards[0].suit);
        if (isSuitedTrips) {
            return {
                name: 'Suited Trips',
                payout: twentyOnePlus3Payout.suitedTrips
            };
        }

        return {
            name: 'Three of a Kind',
            payout: twentyOnePlus3Payout.threeOfAKind
        };
    }

    // Sort cards by value for straight check
    const sortedCards = [...cards].sort((a, b) => {
        // Convert face cards to numeric values
        const getValue = (card: Card): number => {
            if (card.rank === 'A') return 1; // Ace can be low
            if (card.rank === 'J') return 11;
            if (card.rank === 'Q') return 12;
            if (card.rank === 'K') return 13;
            return parseInt(card.rank, 10);
        };

        return getValue(a) - getValue(b);
    });

    // Check for straight
    const isStraight = (() => {
        // Convert face cards to numeric values for comparison
        const values = sortedCards.map(card => {
            if (card.rank === 'A') return 1; // Ace can be low
            if (card.rank === 'J') return 11;
            if (card.rank === 'Q') return 12;
            if (card.rank === 'K') return 13;
            return parseInt(card.rank, 10);
        });

        // Special case for A-2-3
        if (values[0] === 1 && values[1] === 2 && values[2] === 3) return true;

        // Special case for A-K-Q (treated as sequential)
        if (values[0] === 1 && values[1] === 12 && values[2] === 13) return true;

        // Normal case: check if each card value is one more than the previous
        return values[1] === values[0] + 1 && values[2] === values[1] + 1;
    })();

    // Check for flush
    const isFlush = cards.every(card => card.suit === cards[0].suit);

    // Check for straight flush
    if (isStraight && isFlush) {
        return {
            name: 'Straight Flush',
            payout: twentyOnePlus3Payout.straightFlush
        };
    }

    // Check for flush
    if (isFlush) {
        return {
            name: 'Flush',
            payout: twentyOnePlus3Payout.flush
        };
    }

    // Check for straight
    if (isStraight) {
        return {
            name: 'Straight',
            payout: twentyOnePlus3Payout.straight
        };
    }

    return null;
};

// Utility functions for managing normalized entities
const addHandToEntities = (state: StoreGameState, hand: Hand): StoreGameState => {
    if (!state.entities) {
        state.entities = { hands: {}, cards: {} };
    }

    // Add the hand to entities
    state.entities.hands[hand.id] = { ...hand };

    // Add all cards from the hand to the cards entity
    hand.cards.forEach(card => {
        if (!state.entities.cards[card.id]) {
            state.entities.cards[card.id] = { ...card };
        }
    });

    return state;
};

const updateHandInEntities = (state: StoreGameState, hand: Hand): StoreGameState => {
    if (!state.entities) {
        return addHandToEntities(state, hand);
    }

    // Update the hand
    state.entities.hands[hand.id] = { ...hand };

    // Update any new cards
    hand.cards.forEach(card => {
        if (!state.entities.cards[card.id]) {
            state.entities.cards[card.id] = { ...card };
        }
    });

    return state;
};

const removeHandFromEntities = (state: StoreGameState, handId: string): StoreGameState => {
    if (!state.entities?.hands?.[handId]) {
        return state;
    }

    // Remove the hand
    delete state.entities.hands[handId];

    // If this was a player hand, remove from playerHandIds
    if (state.playerHandIds?.includes(handId)) {
        state.playerHandIds = state.playerHandIds.filter(id => id !== handId);
    }

    return state;
};

/**
 * Create the game store using Zustand with the immer middleware
 */
export const useGameStore = create<StoreGameState & GameActions>()(
    immer((set, get) => {
        // Initialize with default state
        const initialState = createInitialState();

        return {
            ...initialState,

            // Game lifecycle methods
            resetGame: () => {
                // Reset to initial state
                const newState = createInitialState();
                set(newState);
            },

            initializeGame: () => {
                // Simply reset the game
                get().resetGame();
            },

            // Betting methods
            placeBet: (amount: number) => {
                placeBetAction(get, set, amount);
            },

            increaseBet: (amount: number) => {
                increaseBetAction(get, set, amount);
            },

            clearBet: () => {
                clearBetAction(get, set);
            },

            // Side bets methods
            placeSideBet: (bet: SideBet) => {
                const state = get();
                const { sideBets, chips, currentSideBetsTotal } = state;

                // Validate bet
                if (bet.amount <= 0 || bet.amount > chips) {
                    return;
                }

                // Check if this type of side bet already exists
                const existingIndex = sideBets.findIndex((b) => b.type === bet.type);

                if (existingIndex >= 0) {
                    // Replace existing side bet
                    const updatedSideBets = [...sideBets];
                    const oldAmount = updatedSideBets[existingIndex].amount;
                    updatedSideBets[existingIndex] = bet;

                    // Update state
                    set({
                        sideBets: updatedSideBets,
                        currentSideBetsTotal: currentSideBetsTotal - oldAmount + bet.amount,
                        chips: chips - bet.amount + oldAmount
                    });
                } else {
                    // Add new side bet
                    set({
                        sideBets: [...sideBets, bet],
                        currentSideBetsTotal: currentSideBetsTotal + bet.amount,
                        chips: chips - bet.amount
                    });
                }
            },

            clearSideBet: (type: SideBetType) => {
                const state = get();
                const { sideBets, chips, currentSideBetsTotal } = state;

                // Find the bet to clear
                const betIndex = sideBets.findIndex((bet) => bet.type === type);
                if (betIndex < 0) return;

                const betAmount = sideBets[betIndex].amount;

                // Create new array without the bet
                const newSideBets = sideBets.filter((_, index) => index !== betIndex);

                // Update state
                set({
                    sideBets: newSideBets,
                    currentSideBetsTotal: currentSideBetsTotal - betAmount,
                    chips: chips + betAmount
                });
            },

            clearAllSideBets: () => {
                const state = get();
                const { chips, currentSideBetsTotal } = state;

                // Return all chips from side bets
                set({
                    sideBets: [],
                    currentSideBetsTotal: 0,
                    chips: chips + currentSideBetsTotal
                });
            },

            // Gameplay methods
            dealInitialCards: () => {
                const state = get();

                // Only proceed if in betting phase
                if (!isBettingPhase(state)) {
                    console.log('Cannot deal cards - not in betting phase');
                    return;
                }

                const { bet, shoe, actionHistory } = state;

                // Only allow dealing with a bet placed
                if (bet <= 0) {
                    return;
                }

                // Clone shoe and track dealt cards
                const currentShoe = [...shoe];
                const dealtCards: Card[] = [];

                // Deal cards in the proper order: player, dealer, player, dealer
                const playerCard1 = currentShoe.pop();
                if (!playerCard1) {
                    console.error('No cards left in shoe');
                    return;
                }
                dealtCards.push(playerCard1);

                const dealerCard1 = currentShoe.pop();
                if (!dealerCard1) {
                    console.error('No cards left in shoe');
                    return;
                }
                dealtCards.push(dealerCard1);

                const playerCard2 = currentShoe.pop();
                if (!playerCard2) {
                    console.error('No cards left in shoe');
                    return;
                }
                dealtCards.push(playerCard2);

                const dealerCard2 = currentShoe.pop();
                if (!dealerCard2) {
                    console.error('No cards left in shoe');
                    return;
                }
                // Only dealer's first card is face up initially
                const faceDownDealerCard = {
                    ...dealerCard2,
                    isFaceUp: false
                };
                dealtCards.push(faceDownDealerCard);

                // Create player and dealer hands
                const playerHand: Hand = {
                    id: `player-hand-${Date.now()}`,
                    cards: [playerCard1, playerCard2],
                    values: calculateHandValues([playerCard1, playerCard2]),
                    isSoft: playerCard1.rank === 'A' || playerCard2.rank === 'A',
                    isBlackjack: false,
                    canSplit: playerCard1.value === playerCard2.value,
                    isBusted: false
                };

                const dealerHand: Hand = {
                    id: `dealer-hand-${Date.now()}`,
                    cards: [dealerCard1, faceDownDealerCard],
                    values: [dealerCard1.value], // Only first card value is known initially
                    isSoft: dealerCard1.rank === 'A',
                    isBlackjack: false,
                    canSplit: false,
                    isBusted: false
                };

                // Check for player blackjack
                if (calculateHandValues([playerCard1, playerCard2]).some(value => value === 21)) {
                    playerHand.isBlackjack = true;
                }

                // Update card counting
                let runningCount = 0;
                // Only count face-up cards
                if (playerCard1.value >= 10) runningCount--;
                else if (playerCard1.value <= 6) runningCount++;
                if (playerCard2.value >= 10) runningCount--;
                else if (playerCard2.value <= 6) runningCount++;
                if (dealerCard1.value >= 10) runningCount--;
                else if (dealerCard1.value <= 6) runningCount++;

                // Calculate true count
                const decksRemaining = currentShoe.length / 52;
                const trueCount = decksRemaining > 0 ? runningCount / decksRemaining : 0;

                // Create a player turn state
                const playerTurnState: PlayerTurnPhaseState = {
                    ...state,
                    shoe: currentShoe,
                    playerHand,
                    dealerHand,
                    gamePhase: 'playerTurn',
                    message: 'Your turn. Hit or Stand?',
                    dealtCards,
                    runningCount,
                    trueCount,
                    actionHistory: [...actionHistory, 'dealCards'],
                    isDoubleDownAvailable: true,
                    isSplitAvailable: playerHand.canSplit,
                    roundResult: null
                };

                // Apply the new state
                set(playerTurnState);
            },

            dealCards: () => {
                // Use the dealInitialCards method
                get().dealInitialCards();
            },

            hit: () => {
                // Use the extracted hit action
                hitAction(get, set);
            },

            stand: () => {
                // Use the extracted stand action
                standAction(get, set);
            },

            doubleDown: () => {
                // Use the extracted doubleDown action
                doubleDownAction(get, set);
            },

            split: () => {
                // Use the extracted split action
                splitAction(get, set);
            },

            takeInsurance: () => {
                const state = get();

                // Only proceed if in player turn phase
                if (!isPlayerTurnPhase(state)) {
                    console.log('Cannot take insurance - not in player turn phase');
                    return;
                }

                const { bet, chips, dealerHand } = state;

                // Only allow insurance when dealer's face-up card is an Ace
                if (!dealerHand || dealerHand.cards[0].rank !== 'A') {
                    console.log('Cannot take insurance - dealer does not have an Ace showing');
                    return;
                }

                // Insurance costs half the bet
                const insuranceAmount = bet / 2;

                // Check if player has enough chips
                if (insuranceAmount > chips) {
                    set({
                        message: 'Not enough chips for insurance!'
                    });
                    return;
                }

                // Take insurance
                set({
                    chips: chips - insuranceAmount,
                    player: {
                        ...state.player,
                        insuranceBet: insuranceAmount
                    },
                    message: 'Insurance taken!'
                });
            },

            surrender: () => {
                const state = get();

                // Only proceed if in player turn phase
                if (!isPlayerTurnPhase(state)) {
                    console.log('Cannot surrender - not in player turn phase');
                    return;
                }

                const { bet, chips } = state;

                // Return half the bet
                const refundAmount = bet / 2;

                // Move to settlement phase with surrender result
                const settlementState: SettlementPhaseState = {
                    ...state,
                    gamePhase: 'settlement',
                    chips: chips + refundAmount,
                    message: 'You surrendered. Half your bet is returned.',
                    roundResult: 'surrender',
                    isDoubleDownAvailable: false,
                    isSplitAvailable: false
                };

                // Apply the settlement state
                set(settlementState);
            },

            playDealerTurn: () => {
                // Use the extracted dealer turn action
                dealerTurnAction(get, set);
            },

            playDealer: () => {
                // Use the playDealerTurn method
                get().playDealerTurn();
            },

            // Round management
            endRound: () => {
                const state = get();

                // Only proceed if in settlement phase
                if (!isSettlementPhase(state)) {
                    console.log('Cannot end round - not in settlement phase');
                    return;
                }

                const { roundResult, handResults, player, bet, playerHand, gameStats } = state;

                // Calculate win amount and update stats
                const { winAmount, newGameStats } = calculateWinAmountAndStats(
                    playerHand,
                    handResults,
                    player.hands,
                    bet,
                    roundResult,
                    { ...gameStats }
                );

                // Create final gameStats with updated endingChips
                const finalGameStats = {
                    ...newGameStats,
                    endingChips: state.chips
                };

                // Move to completed phase
                const completedState: CompletedPhaseState = {
                    ...state,
                    gamePhase: 'completed',
                    message: 'Round completed. Place a new bet to play again.',
                    player: {
                        ...player,
                        winAmount
                    },
                    gameStats: finalGameStats,
                    isDoubleDownAvailable: false,
                    isSplitAvailable: false
                };

                // Apply the completed state
                set(completedState);
            },

            resetRound: () => {
                const state = get();

                // Allow reset from any end-of-round phase (settlement or completed)
                // rather than only from the completed phase
                if (!(isCompletedPhase(state) || isSettlementPhase(state))) {
                    console.log('Cannot reset round - not in end-of-round phase', state.gamePhase);
                    // If we're not in a proper phase but user is trying to reset, try to recover
                    if (state.gamePhase === 'dealerTurn') {
                        console.log('Attempting to force transition from dealer turn to betting phase');
                        forceBettingPhase();
                        return;
                    }
                    return;
                }

                const { chips, gameStats } = state;

                // Create new game state but preserve important properties
                const newState = createInitialState();

                // Create a betting phase state with preserved properties
                const bettingState: BettingPhaseState = {
                    ...newState,
                    chips,
                    gameStats,
                    message: 'Place your bet to begin a new round.',
                    // Reset bet when moving to new round
                    bet: 0
                };

                // Clear all temporary game state
                bettingState.player.hands = [];
                bettingState.player.activeHandIndex = 0;
                bettingState.player.result = null;
                bettingState.playerHandIds = [];
                bettingState.activePlayerHandId = null;
                bettingState.roundResult = null;

                // Log the transition
                console.log('Resetting round: Transitioning from', state.gamePhase, 'to betting phase');

                // Apply the betting state
                set(bettingState);
            },

            // Add a helper function to force transition to betting phase
            forceBettingPhase: () => {
                const state = get();

                // Create a new betting phase
                const { chips, gameStats } = state;
                const newState = createInitialState();

                // Create a clean betting state
                const bettingState: BettingPhaseState = {
                    ...newState,
                    chips,
                    gameStats,
                    message: 'Game recovered. Place your bet to begin a new round.',
                    bet: 0,
                };

                // Apply the betting state
                console.log('Forcing transition to betting phase');
                set(bettingState);
            },

            // User and session management
            setUserId: (userId: string | null) => {
                // Update the user ID - we make a custom setter to handle this readonly property
                set(state => ({
                    ...state,
                    userId,
                    isAuthenticated: !!userId
                }));
            },

            loadUserChips: async () => {
                const { userId } = get();

                if (!userId) {
                    return;
                }

                set({
                    isLoading: true
                });

                try {
                    // This would be replaced with an actual API call
                    // For now, we'll simulate a delay
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Mock result
                    set({
                        chips: 2000,
                        isLoading: false
                    });
                } catch {
                    set({
                        error: 'Failed to load user chips',
                        isLoading: false
                    });
                }
            },

            saveGameResults: async () => {
                const { userId, gameStats, chips } = get();

                if (!userId) {
                    return;
                }

                set({
                    isLoading: true
                });

                try {
                    // This would be replaced with an actual API call
                    // For now, we'll simulate a delay
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Mock result
                    set({
                        isLoading: false,
                        gameStats: {
                            ...gameStats,
                            endingChips: chips
                        }
                    });
                } catch {
                    set({
                        error: 'Failed to save game results',
                        isLoading: false
                    });
                }
            },

            saveSession: async () => {
                // Placeholder for future implementation
                return Promise.resolve();
            },

            endSession: async () => {
                // Placeholder for future implementation
                return Promise.resolve();
            },

            // Action availability checks
            canSplit: () => {
                const state = get();
                if (!isPlayerTurnPhase(state)) {
                    return false;
                }

                const { player } = state;
                const isPlayingSplitHands = player.hands.length > 0;

                if (isPlayingSplitHands) {
                    // Can't split again if already split (for simplicity)
                    return false;
                }

                return state.isSplitAvailable && calculateHandValues([state.playerHand.cards[0], state.playerHand.cards[1]]).some(value => value === 21);
            },

            canDoubleDown: () => {
                const state = get();
                if (!isPlayerTurnPhase(state)) {
                    return false;
                }

                // Check if player has enough chips
                if (state.chips < state.bet) {
                    return false;
                }

                return state.isDoubleDownAvailable;
            },

            canTakeInsurance: () => {
                const state = get();
                if (!isPlayerTurnPhase(state)) {
                    return false;
                }

                // Insurance is only available when dealer's face-up card is an Ace
                if (!state.dealerHand || state.dealerHand.cards[0].rank !== 'A') {
                    return false;
                }

                // Check if player has enough chips
                return state.chips >= state.bet / 2;
            },

            canSurrender: () => {
                const state = get();
                if (!isPlayerTurnPhase(state)) {
                    return false;
                }

                // Can only surrender before taking any other action
                // This is simplified - in a real implementation we'd track actions taken
                const { player } = state;
                const isPlayingSplitHands = player.hands.length > 0;
                if (isPlayingSplitHands) {
                    return false;
                }

                // Only surrender before any action is taken
                // This could be enhanced by checking if any actions were taken
                return state.gameRules.playerCanSurrender;
            },

            // Missing methods from GameActions interface
            declineInsurance: () => {
                const state = get();
                if (!isPlayerTurnPhase(state)) {
                    console.log('Cannot decline insurance - not in player turn phase');
                    return;
                }

                // Player declined insurance, just update the message
                set({
                    message: 'Insurance declined. Your turn continues.'
                });
            },

            takeEvenMoney: () => {
                const state = get();
                if (!isPlayerTurnPhase(state)) {
                    console.log('Cannot take even money - not in player turn phase');
                    return;
                }

                const { playerHand, bet, chips } = state;

                // Even money can only be taken when player has blackjack and dealer's upcard is Ace
                if (!playerHand.isBlackjack || state.dealerHand.cards[0].rank !== 'A') {
                    console.log('Cannot take even money - not eligible');
                    return;
                }

                // Even money pays 1:1 immediately instead of 3:2 later
                const evenMoneyPayout = bet * 2; // Original bet + 1:1 profit

                // Move to settlement phase with even money result
                const settlementState: SettlementPhaseState = {
                    ...state,
                    gamePhase: 'settlement',
                    chips: chips + evenMoneyPayout,
                    message: 'Even money taken. You win 1:1 on your blackjack.',
                    roundResult: 'win',
                    isDoubleDownAvailable: false,
                    isSplitAvailable: false
                };

                // Apply the settlement state
                set(settlementState);
            },

            // Helper methods
            clearError: () => {
                set({
                    error: null
                });
            },

            updateGameFromRules: () => {
                const { gameRules } = get();

                // Create a new shoe based on deck count
                const newShoe = shuffleShoe(createShoe(gameRules.decksCount));

                // Update state
                set({
                    shoe: newShoe
                });
            },

            // Additional dealer methods
            revealDealerCards: () => {
                const { dealerHand } = get();

                if (!dealerHand) {
                    return;
                }

                // Reveal all dealer cards
                const revealedCards = dealerHand.cards.map(card => ({
                    ...card,
                    isFaceUp: true
                }));

                // Recalculate dealer hand values
                const revealedHand = {
                    ...dealerHand,
                    cards: revealedCards,
                    values: calculateHandValues(revealedCards),
                    isRevealed: true
                };

                set({
                    dealerHand: revealedHand,
                    dealer: {
                        ...get().dealer,
                        hand: revealedHand,
                        isRevealed: true
                    }
                });
            }
        };
    })
);

// Export selectors for use with the useGameStore hooks
export const selectPlayerActiveHand = (state: StoreGameState) => {
    if (isPlayerTurnPhase(state) || isDealerTurnPhase(state) || isSettlementPhase(state) || isCompletedPhase(state)) {
        return state.playerHand;
    }
    return null;
};

export const selectDealerVisibleCard = (state: StoreGameState) => {
    // Only return the first card if the dealer has cards and we're not in dealer turn
    const dealer = state.dealerHand;
    if (dealer.cards.length > 0 && state.gamePhase !== 'dealerTurn' && state.gamePhase !== 'settlement') {
        return dealer.cards[0];
    }
    return null;
};

export const selectActivePlayerHandTotal = (state: StoreGameState) => {
    if (isPlayerTurnPhase(state) || isDealerTurnPhase(state) || isSettlementPhase(state) || isCompletedPhase(state)) {
        const hand = state.playerHand;
        return hand ? calculateHandValues(hand.cards).some(value => value === 21) : 0;
    }
    return 0;
};

// Enhanced selectors for normalized state
export const selectDealerHand = (state: StoreGameState) =>
    state.entities?.hands?.[state.dealerHandId] || state.dealer.hand;

export const selectPlayerHand = (state: StoreGameState) => {
    // If we have a specific active hand ID, use that
    if (state.activePlayerHandId && state.entities?.hands?.[state.activePlayerHandId]) {
        return state.entities.hands[state.activePlayerHandId];
    }

    // Fallback to the traditional state structure during transition
    if (isPlayerTurnPhase(state) || isDealerTurnPhase(state) || isSettlementPhase(state) || isCompletedPhase(state)) {
        return state.playerHand;
    }

    return null;
};

export const selectPlayerHands = (state: StoreGameState) => {
    // If we have player hand IDs and normalized hands, use those
    if (state.playerHandIds?.length && state.entities?.hands) {
        return state.playerHandIds.map(id => state.entities.hands[id]).filter(Boolean);
    }

    // Fallback to traditional player hands
    return state.player.hands;
};

export const selectAllCards = (state: StoreGameState) => {
    // If we have normalized cards, use those
    if (state.entities?.cards && Object.keys(state.entities.cards).length) {
        return Object.values(state.entities.cards);
    }

    // Fallback to collecting cards from hands
    const dealerCards = selectDealerHand(state)?.cards || [];
    const playerHandsCards = selectPlayerHands(state).flatMap(hand => hand?.cards || []);
    return [...dealerCards, ...playerHandsCards];
};

// Helper functions outside the store
function calculateWinAmountAndStats(
    playerHand: Hand | null,
    handResults: string[] | RoundResult[] | null | undefined,
    playerHands: Hand[],
    bet: number,
    roundResult: string | null,
    gameStats: GameStats
) {
    let winAmount = 0;

    // Create a mutable copy of the stats
    const newGameStats = {
        handsPlayed: gameStats.handsPlayed,
        handsWon: gameStats.handsWon,
        handsLost: gameStats.handsLost,
        pushes: gameStats.pushes,
        blackjacks: gameStats.blackjacks,
        busts: gameStats.busts,
        biggestWin: gameStats.biggestWin,
        startingChips: gameStats.startingChips,
        endingChips: gameStats.endingChips,
        sessionStart: gameStats.sessionStart
    };

    // Process single hand
    if (playerHand && !handResults) {
        newGameStats.handsPlayed++;
        winAmount = processSingleHandResult(playerHand, bet, roundResult, newGameStats);
    }
    // Process split hands
    else if (handResults && playerHands.length > 0) {
        newGameStats.handsPlayed += handResults.length;
        winAmount = processSplitHandsResults(playerHands, handResults, bet, newGameStats);
    }

    // Update biggest win stat
    if (winAmount > newGameStats.biggestWin) {
        newGameStats.biggestWin = winAmount;
    }

    return { winAmount, newGameStats };
}

// Define a mutable version of GameStats for our helper functions
interface MutableGameStats {
    handsPlayed: number;
    handsWon: number;
    handsLost: number;
    pushes: number;
    blackjacks: number;
    busts: number;
    biggestWin: number;
    startingChips: number;
    endingChips: number;
    sessionStart: Date;
}

function processSingleHandResult(
    hand: Hand,
    bet: number,
    result: string | null,
    stats: MutableGameStats
) {
    if (result === 'win') {
        const winAmount = hand.isBlackjack ? bet * 2.5 : bet * 2;
        stats.handsWon++;
        if (hand.isBlackjack) stats.blackjacks++;
        return winAmount;
    }

    if (result === 'push') {
        stats.pushes++;
        return bet;
    }

    if (result === 'bust') {
        stats.handsLost++;
        stats.busts++;
    } else if (result === 'lose') {
        stats.handsLost++;
    }

    return 0;
}

function processSplitHandsResults(
    hands: Hand[],
    results: string[] | RoundResult[] | null | undefined,
    defaultBet: number,
    stats: MutableGameStats
) {
    let totalWinAmount = 0;

    if (!results) return totalWinAmount;

    results.forEach((result, index) => {
        if (index >= hands.length) return;

        const hand = hands[index];
        if (!hand) return;

        // Safely access the bet property with a type guard
        const handBet = 'bet' in hand ? (hand as { bet: number }).bet : defaultBet;
        totalWinAmount += processSingleHandResult(hand, handBet, result as string, stats);
    });

    return totalWinAmount;
}