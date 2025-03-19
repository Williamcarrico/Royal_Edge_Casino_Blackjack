'use client';

import React, { useMemo } from 'react';
import { Hand as HandType } from '@/lib/utils/gameLogic';
import { Card } from './card';
import { cn } from '@/lib/utils';
import styles from './hand.module.css';
import { useInView } from 'react-intersection-observer';

interface HandProps {
    hand: HandType;
    isDealer?: boolean;
    showAllCards?: boolean;
    isActive?: boolean;
    label?: string;
    className?: string;
}

/**
 * Virtualized hand component for better performance with many cards
 */
const VirtualizedHand = ({ cards, isDealer, showAllCards, isBusted }: {
    cards: HandType['cards'],
    isDealer?: boolean,
    showAllCards?: boolean,
    isBusted?: boolean
}) => {
    const VISIBLE_THRESHOLD = 10; // Show at most 10 cards normally

    // If we have a lot of cards, use virtualization
    if (cards.length > VISIBLE_THRESHOLD) {
        return (
            <div className="relative flex flex-row">
                {/* Show the first few cards */}
                {cards.slice(0, 3).map((card, index) => (
                    <Card
                        key={`${card.id}-${index}`}
                        card={{
                            ...card,
                            isFaceUp: isBusted || showAllCards || (!isDealer || index === 0)
                        }}
                        index={index}
                        className="mr-[-60px]"
                    />
                ))}

                {/* Collapsed middle section with indicator */}
                <div className="flex items-center justify-center px-4 z-10">
                    <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded">
                        +{cards.length - 6} more
                    </div>
                </div>

                {/* Show the last few cards */}
                {cards.slice(-3).map((card, index) => (
                    <Card
                        key={`${card.id}-${index + cards.length - 3}`}
                        card={{
                            ...card,
                            isFaceUp: isBusted || showAllCards || (!isDealer || index === 0)
                        }}
                        index={index + cards.length - 3}
                        className="mr-[-60px]"
                    />
                ))}
            </div>
        );
    }

    // Regular card layout for normal hands
    return (
        <div className="flex flex-row">
            {cards.map((card, index) => (
                <Card
                    key={`${card.id}-${index}`}
                    card={{
                        ...card,
                        isFaceUp: isBusted || showAllCards || (!isDealer || index === 0)
                    }}
                    index={index}
                    className={index > 0 ? "ml-[-60px]" : ""}
                />
            ))}
        </div>
    );
};

export const Hand = ({
    hand,
    isDealer = false,
    showAllCards = true,
    isActive = false,
    label,
    className,
}: HandProps) => {
    // Use intersection observer to only render when in view
    const { ref, inView } = useInView({
        triggerOnce: false,
        threshold: 0.1,
    });

    // Calculate the best value for the hand
    const bestValue = useMemo(() => {
        if (!hand.values?.length) return 0;

        // Find the highest value that doesn't bust, or the lowest value if all bust
        const nonBusting = hand.values.filter(v => v <= 21);
        return nonBusting.length > 0
            ? Math.max(...nonBusting)
            : Math.min(...hand.values);
    }, [hand.values]);

    // Get the appropriate label for hand status
    const getHandStatus = () => {
        if (hand.isBlackjack) return 'Blackjack!';
        if (hand.isBusted) return 'Bust!';
        if (hand.isSoft && bestValue <= 21) return `Soft ${bestValue}`;
        return bestValue.toString();
    };

    // Get the background color based on hand state
    const getStatusBackground = () => {
        if (hand.isBlackjack) return 'bg-amber-600';
        if (hand.isBusted) return 'bg-red-600';
        return 'bg-emerald-700';
    };

    return (
        <div
            ref={ref}
            className={cn(
                'flex flex-col items-center space-y-2',
                isActive && 'ring-2 ring-amber-400 ring-opacity-50 rounded-lg p-1',
                className
            )}
        >
            {/* Label (Dealer/Player) */}
            {label && (
                <div className="font-medium text-white text-lg mb-1">{label}</div>
            )}

            {/* Cards */}
            <div className="relative">
                {inView ? (
                    <VirtualizedHand
                        cards={hand.cards}
                        isDealer={isDealer}
                        showAllCards={showAllCards}
                        isBusted={hand.isBusted}
                    />
                ) : (
                    <div className="h-36 w-64 bg-gray-800 rounded-md flex items-center justify-center">
                        <span className="text-gray-400">Loading cards...</span>
                    </div>
                )}
            </div>

            {/* Hand value */}
            <div className={cn("px-2 py-1 rounded text-white font-bold", getStatusBackground())}>
                {getHandStatus()}
            </div>
        </div>
    );
};

export default Hand;