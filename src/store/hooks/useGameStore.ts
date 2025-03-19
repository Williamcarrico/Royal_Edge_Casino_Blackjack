'use client';

import { useMemo } from 'react';
import { useGameStore as useStore } from '../gameStore';

// Export the base store
export const useGameStore = useStore;

// Create primitive selectors for atomic values
export const usePlayerHand = () => useStore(state => state.playerHand);
export const useDealerHand = () => useStore(state => state.dealerHand);
export const useGamePhase = () => useStore(state => state.gamePhase);
export const useRoundResult = () => useStore(state => state.roundResult);
export const useBetAmount = () => useStore(state => state.bet);
export const useChipsAmount = () => useStore(state => state.chips);
export const useMessage = () => useStore(state => state.message);
export const useInsuranceAvailable = () => useStore(state => state.insuranceAvailable);

// Object selectors with shallow equality for stability
export const usePlayerHands = () => useStore(state => state.playerHands);
export const useHandResults = () => useStore(state => state.handResults);

// Use useMemo for complex derived data
export const useCardCounting = () => {
    const runningCount = useStore(state => state.runningCount);
    const trueCount = useStore(state => state.trueCount);
    const dealtCardsCount = useStore(state => state.dealtCards?.length || 0);
    const remainingCards = useStore(state => state.shoe?.length || 0);

    return useMemo(() => ({
        runningCount,
        trueCount,
        dealtCardsCount,
        remainingCards,
        penetration: remainingCards > 0 ?
            dealtCardsCount / (dealtCardsCount + remainingCards) : 0
    }), [runningCount, trueCount, dealtCardsCount, remainingCards]);
};

// Player actions
export const usePlayerActions = () => {
    const hit = useStore(state => state.hit);
    const stand = useStore(state => state.stand);
    const doubleDown = useStore(state => state.doubleDown);
    const split = useStore(state => state.split);
    const surrender = useStore(state => state.surrender);

    return useMemo(() => ({
        hit: () => {
            console.log('Hit action called');
            hit();
        },
        stand: () => {
            console.log('Stand action called');
            stand();
        },
        doubleDown: () => {
            console.log('Double down action called');
            doubleDown();
        },
        split: () => {
            console.log('Split action called');
            split();
        },
        surrender: () => {
            console.log('Surrender action called');
            surrender();
        }
    }), [hit, stand, doubleDown, split, surrender]);
};

// Betting actions
export const useBettingActions = () => {
    const placeBet = useStore(state => state.placeBet);
    const increaseBet = useStore(state => state.increaseBet);
    const clearBet = useStore(state => state.clearBet);

    return useMemo(() => ({
        placeBet: (amount: number) => {
            console.log('Place bet called with', amount);
            placeBet(amount);
        },
        increaseBet: (amount: number) => {
            console.log('Increase bet called with', amount);
            increaseBet(amount);
        },
        clearBet: () => {
            console.log('Clear bet called');
            clearBet();
        }
    }), [placeBet, increaseBet, clearBet]);
};

// Insurance actions
export const useInsuranceActions = () => {
    const takeInsurance = useStore(state => state.takeInsurance);
    const declineInsurance = useStore(state => state.declineInsurance);
    const takeEvenMoney = useStore(state => state.takeEvenMoney);

    return useMemo(() => ({
        takeInsurance: () => {
            console.log('Take insurance called');
            takeInsurance();
        },
        declineInsurance: () => {
            console.log('Decline insurance called');
            declineInsurance();
        },
        takeEvenMoney: () => {
            console.log('Take even money called');
            takeEvenMoney();
        }
    }), [takeInsurance, declineInsurance, takeEvenMoney]);
};

// Game state
export const useGameState = () => {
    return useStore(state => ({
        gamePhase: state.gamePhase,
        roundResult: state.roundResult,
        message: state.message,
        isPlayerTurn: state.gamePhase === 'playerTurn',
        isBetting: state.gamePhase === 'betting',
        isRoundOver: ['settlement', 'completed'].includes(state.gamePhase)
    }));
};

// Helper to check if player can perform certain actions
export const usePlayerOptions = () => {
    const canDoubleDown = useStore(state => state.canDoubleDown);
    const canSplit = useStore(state => state.canSplit);
    const canSurrender = useStore(state => state.canSurrender);
    const canTakeInsurance = useStore(state => state.canTakeInsurance);

    return useMemo(() => ({
        canDoubleDown: typeof canDoubleDown === 'function' ? canDoubleDown() : Boolean(canDoubleDown),
        canSplit: typeof canSplit === 'function' ? canSplit() : Boolean(canSplit),
        canSurrender: typeof canSurrender === 'function' ? canSurrender() : Boolean(canSurrender),
        canTakeInsurance: typeof canTakeInsurance === 'function' ? canTakeInsurance() : Boolean(canTakeInsurance)
    }), [canDoubleDown, canSplit, canSurrender, canTakeInsurance]);
};