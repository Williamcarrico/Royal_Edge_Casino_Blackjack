'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Hand as HandType } from '@/lib/utils/gameLogic';
import { Hand } from './hand';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayerSplitHandsProps {
    hands: HandType[];
    activeHandIndex: number;
    showResults?: boolean;
    results?: { [key: string]: { result: string; payout: number } };
    className?: string;
}

export const PlayerSplitHands = ({
    hands,
    activeHandIndex,
    showResults = false,
    results = {},
    className
}: PlayerSplitHandsProps) => {
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        // Trigger animation after component mounts
        setAnimateIn(true);
    }, []);

    // Get result text for a hand
    const getResultText = (handId: string) => {
        if (!showResults || !results[handId]) return null;

        const result = results[handId].result;
        const payout = results[handId].payout;

        switch (result) {
            case 'blackjack':
                return `Blackjack! +$${payout}`;
            case 'win':
                return `Win! +$${payout}`;
            case 'push':
                return 'Push';
            case 'lose':
                return `Lose -$${Math.abs(payout)}`;
            case 'bust':
                return `Bust -$${Math.abs(payout)}`;
            default:
                return null;
        }
    };

    // Get result background color
    const getResultBackground = (handId: string) => {
        if (!results[handId]) return "bg-red-600"; // Default

        const result = results[handId].result;

        if (result === 'win' || result === 'blackjack') {
            return "bg-green-600";
        } else if (result === 'push') {
            return "bg-blue-600";
        } else {
            return "bg-red-600";
        }
    };

    // IMPORTANT: All hooks have been called by this point
    // We can now safely have conditional rendering logic

    // Single hand case - delegate to regular Hand component
    if (hands.length === 1) {
        return (
            <div className={className}>
                <Hand
                    hand={hands[0]}
                    isActive={activeHandIndex === 0}
                    label="Player"
                />

                {/* Result overlay */}
                {showResults && (
                    <div className="mt-2 text-center">
                        <span className={cn(
                            "px-3 py-1 rounded-md",
                            getResultBackground(hands[0].id)
                        )}>
                            {getResultText(hands[0].id)}
                        </span>
                    </div>
                )}
            </div>
        );
    }

    // Multiple hands from split
    return (
        <div className={cn("flex flex-col items-center", className)}>
            <div className="mb-4 text-sm text-gray-300">Split Hands</div>

            <div className="flex flex-wrap justify-center gap-6">
                <AnimatePresence>
                    {hands.map((hand, index) => (
                        <motion.div
                            key={hand.id}
                            initial={{ opacity: 0, scale: 0.8, x: index % 2 === 0 ? -50 : 50 }}
                            animate={animateIn ? { opacity: 1, scale: 1, x: 0 } : {}}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex flex-col items-center"
                        >
                            <div className="mb-2 text-sm text-gray-300">
                                Hand {index + 1}
                            </div>

                            <Hand
                                hand={hand}
                                isActive={activeHandIndex === index}
                                key={hand.id}
                            />

                            {/* Result overlay */}
                            {showResults && (
                                <div className="mt-2 text-center">
                                    <span className={cn(
                                        "px-3 py-1 rounded-md",
                                        getResultBackground(hand.id)
                                    )}>
                                        {getResultText(hand.id)}
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PlayerSplitHands;