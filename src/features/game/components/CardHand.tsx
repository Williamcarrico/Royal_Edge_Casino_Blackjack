import React from 'react';
import { Hand, Card } from '@/lib/utils/gameLogic';
import { handUtils } from '@/lib/utils/handUtils';
import { isDefined } from '@/lib/utils/safeAccessUtils';

interface CardHandProps {
    hand?: Hand | null;
    title: string;
    isDealer?: boolean;
    showHandValue?: boolean;
}

/**
 * Component for displaying a hand of cards
 * Uses our utility functions for consistent hand value calculation
 */
const CardHand: React.FC<CardHandProps> = ({
    hand,
    title,
    isDealer = false,
    showHandValue = true
}) => {
    // Use our utility for safe hand value access
    const bestValue = handUtils.getBestValue(hand);
    const description = handUtils.getHandDescription(hand);

    return (
        <div className="flex flex-col items-center mb-6">
            <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>

            <div className="flex flex-row gap-2 mb-2">
                {!hand || hand.cards.length === 0 ? (
                    <div className="w-20 h-28 bg-gray-800 border border-gray-700 rounded-md flex items-center justify-center text-gray-500">
                        No cards
                    </div>
                ) : (
                    hand.cards.map((card, index) => (
                        <div
                            key={`${card.suit}-${card.rank}-${index}`}
                            className={`w-20 h-28 ${card.isFaceUp
                                    ? (card.suit === '♥' || card.suit === '♦'
                                        ? 'bg-white text-red-600'
                                        : 'bg-white text-black')
                                    : 'bg-blue-900 text-white'
                                } rounded-md border border-gray-300 shadow flex flex-col justify-between p-1`}
                        >
                            {card.isFaceUp ? (
                                <>
                                    <div className="text-left text-xl font-bold">{card.rank}</div>
                                    <div className="text-center text-3xl">{card.suit}</div>
                                    <div className="text-right text-xl font-bold">{card.rank}</div>
                                </>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                    <div className="transform rotate-45 text-4xl">♠</div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {showHandValue && isDefined(hand) && hand.cards.length > 0 && (
                <div className="text-white">
                    {isDealer && !hand.isRevealed ? (
                        <p>Showing: {hand.cards[0].value}</p>
                    ) : (
                        <p>{description}</p>
                    )}
                </div>
            )}

            {isDefined(hand) && hand.isBlackjack && (
                <div className="text-yellow-400 font-bold text-lg mt-1">Blackjack!</div>
            )}

            {isDefined(hand) && hand.isBusted && (
                <div className="text-red-500 font-bold text-lg mt-1">Busted!</div>
            )}
        </div>
    );
};

export default CardHand;