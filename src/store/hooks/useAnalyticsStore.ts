'use client';

import { useMemo } from 'react';
import { useAnalyticsStore as useAnalyticsStoreBase } from '../analyticsStore';

// Create stable selectors for each hook using primitive values instead of objects
export const useAnalyticsStore = () => {
    // Access methods directly without creating new objects
    const startSession = useAnalyticsStoreBase(state => state.startSession);
    const endSession = useAnalyticsStoreBase(state => state.endSession);
    const recordDecision = useAnalyticsStoreBase(state => state.recordDecision);
    const recordBet = useAnalyticsStoreBase(state => state.recordBet);
    const updateOutcome = useAnalyticsStoreBase(state => state.updateOutcome);
    const resetData = useAnalyticsStoreBase(state => state.resetData);
    const currentSession = useAnalyticsStoreBase(state => state.currentSession);

    // Only combine the results in a stable object using useMemo
    return useMemo(() => ({
        startSession,
        endSession,
        recordDecision,
        recordBet,
        updateOutcome,
        resetData,
        currentSession
    }), [
        startSession,
        endSession,
        recordDecision,
        recordBet,
        updateOutcome,
        resetData,
        currentSession
    ]);
};

// Hook for win rate analytics - use primitive selectors to avoid extra renders
export const useWinRate = () => {
    const currentSession = useAnalyticsStoreBase(state => state.currentSession);
    const sessions = useAnalyticsStoreBase(state => state.sessions);

    return useMemo(() => {
        const session = currentSession ?? (sessions?.length > 0 ? sessions[sessions.length - 1] : null);

        if (!session) {
            return {
                winRate: 0,
                handsWon: 0,
                handsLost: 0,
                handsPushed: 0,
                totalHands: 0
            };
        }

        const { handsWon, handsLost, handsPushed, handsPlayed } = session;
        const totalHands = handsPlayed;
        const winRate = totalHands > 0 ? handsWon / totalHands : 0;

        return {
            winRate,
            handsWon,
            handsLost,
            handsPushed,
            totalHands
        };
    }, [currentSession, sessions]);
};

// Hook for performance metrics - use primitive selectors to avoid extra renders
export const usePerformanceMetrics = () => {
    const currentSession = useAnalyticsStoreBase(state => state.currentSession);
    const sessions = useAnalyticsStoreBase(state => state.sessions);
    const skillMetrics = useAnalyticsStoreBase(state => state.skillMetrics);
    const getBettingAnalytics = useAnalyticsStoreBase(state => state.getBettingAnalytics);

    return useMemo(() => {
        const session = currentSession ?? (sessions?.length > 0 ? sessions[sessions.length - 1] : null);
        const bettingAnalytics = getBettingAnalytics?.() ?? [];
        const totalProfit = session?.netProfit ?? 0;

        return {
            skillMetrics,
            bettingAnalytics,
            totalProfit
        };
    }, [currentSession, sessions, skillMetrics, getBettingAnalytics]);
};