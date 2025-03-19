'use client';

import { useGameStore } from '@/store/hooks/useGameStore';

// Strategy confidence levels
type ConfidenceLevel = 'high' | 'medium' | 'low';

// Strategy recommendation interface
interface StrategyRecommendation {
    primaryActionText: string;
    alternativeActionText?: string;
    explanation: string;
    confidenceLevel: ConfidenceLevel;
    isRecommendationAvailable: boolean;
}

// Win probability data interface
interface WinProbabilityData {
    win: number;
    push: number;
    loss: number;
}

// Hook for basic strategy recommendations
export const useBlackjackStrategy = (): StrategyRecommendation => {
    // Get player and dealer hands from store
    const playerHand = useGameStore(state => state.playerHand);
    const dealerHand = useGameStore(state => state.dealerHand);

    // Default values if no recommendation is available
    if (!playerHand || !dealerHand?.cards.length) {
        return {
            primaryActionText: '',
            explanation: '',
            confidenceLevel: 'low',
            isRecommendationAvailable: false
        };
    }

    // Simple implementation - in a real app this would use proper blackjack strategy rules
    // This is a placeholder implementation
    // Calculate the best value from player hand
    const playerTotal = playerHand.values[0] || 15; // Use first value from hand or default to 15
    const dealerUpcard = dealerHand.cards[0]?.value || 10; // Get dealer's up card value or default to 10

    // Extremely simplified strategy example
    if (playerTotal < 12) {
        return {
            primaryActionText: 'Hit',
            explanation: 'Always hit on totals less than 12',
            confidenceLevel: 'high',
            isRecommendationAvailable: true
        };
    } else if (playerTotal > 16) {
        return {
            primaryActionText: 'Stand',
            explanation: 'Stand on 17 or higher',
            confidenceLevel: 'high',
            isRecommendationAvailable: true
        };
    } else if (playerTotal === 16 && dealerUpcard < 7) {
        return {
            primaryActionText: 'Stand',
            alternativeActionText: 'Surrender if available',
            explanation: 'Stand against dealer 2-6, surrender against 9-A if available',
            confidenceLevel: 'medium',
            isRecommendationAvailable: true
        };
    } else {
        return {
            primaryActionText: 'Hit',
            explanation: 'Hit when dealer shows 7 or higher',
            confidenceLevel: 'medium',
            isRecommendationAvailable: true
        };
    }
};

// Hook for calculating hand win probabilities
export const useHandWinProbability = (): WinProbabilityData | null => {
    // Get player and dealer hands from store
    const playerHand = useGameStore(state => state.playerHand);
    const dealerHand = useGameStore(state => state.dealerHand);

    // Return null if hands aren't available
    if (!playerHand || !dealerHand?.cards.length) {
        return null;
    }

    // This is a simplified placeholder - in a real app this would use
    // Monte Carlo simulation or pre-calculated tables
    return {
        win: 0.45,
        push: 0.10,
        loss: 0.45
    };
};