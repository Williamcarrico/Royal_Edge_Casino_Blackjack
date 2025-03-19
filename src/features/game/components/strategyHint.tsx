'use client';

import React from 'react';
import { useDealerHand, usePlayerHand } from '@/store/hooks/useGameStore';

export const StrategyHint: React.FC = () => {
    const playerHand = usePlayerHand();
    const dealerHand = useDealerHand();

    // Simple strategy hints based on dealer's up card and player's hand
    const getStrategyHint = () => {
        if (!playerHand || !dealerHand || dealerHand.cards.length === 0) {
            return "Waiting for cards...";
        }

        // Get player's hand value
        const playerValue = Array.isArray(playerHand.values) ? playerHand.values[0] : 0;

        // Get dealer's up card
        const dealerUpCard = dealerHand.cards[0];
        const dealerValue = dealerUpCard.value || 0;

        // Very basic strategy hints
        if (playerValue >= 17) {
            return "Basic strategy: Stand on 17 or higher";
        } else if (playerValue === 16) {
            return dealerValue >= 7 ? "Basic strategy: Hit on 16 vs 7 or higher" : "Basic strategy: Stand on 16 vs 6 or lower";
        } else if (playerValue === 11) {
            return "Basic strategy: Double down on 11";
        } else if (playerValue <= 8) {
            return "Basic strategy: Always hit on 8 or less";
        }

        return "Basic strategy: Consider the dealer's up card";
    };

    return (
        <div className="px-2 py-1 text-sm text-white">
            {getStrategyHint()}
        </div>
    );
};

export default StrategyHint;