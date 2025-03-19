import React from 'react';
import { Hand } from '@/lib/utils/gameLogic';
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
    const description = handUtils.getHandDescription(hand);

    return (
        <div className="flex flex-col items-center mb-6">
            <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>

            <div className="flex flex-row gap-2 mb-2">
                {!hand || hand.cards.length === 0 ? (
                    <div className="flex items-center justify-center w-20 text-gray-500 bg-gray-800 border border-gray-700 rounded-md h-28">
                        No cards
                    </div>
                ) : (
                    hand.cards.map((card, index) => {
                        const getFaceUpColor = () => {
                            return (card.suit === 'hearts' || card.suit === 'diamonds')
                                ? 'bg-white text-red-600'
                                : 'bg-white text-black';
                        };

                        const cardColor = card.isFaceUp
                            ? getFaceUpColor()
                            : 'bg-blue-900 text-white';

                        const getSuitSymbol = () => {
                            if (card.suit === 'hearts') return '♥';
                            if (card.suit === 'diamonds') return '♦';
                            if (card.suit === 'clubs') return '♣';
                            return '♠';
                        };

                        return (
                            <div
                                key={`${card.suit}-${card.rank}-${index}`}
                                className={`w-20 h-28 ${cardColor} rounded-md border border-gray-300 shadow flex flex-col justify-between p-1`}
                            >
                                {card.isFaceUp ? (
                                    <>
                                        <div className="text-xl font-bold text-left">{card.rank}</div>
                                        <div className="text-3xl text-center">{getSuitSymbol()}</div>
                                        <div className="text-xl font-bold text-right">{card.rank}</div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full">
                                        <div className="text-4xl transform rotate-45">♠</div>
                                    </div>
                                )}
                            </div>
                        );
                    })
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
                <div className="mt-1 text-lg font-bold text-yellow-400">Blackjack!</div>
            )}

            {isDefined(hand) && hand.isBusted && (
                <div className="mt-1 text-lg font-bold text-red-500">Busted!</div>
            )}
        </div>
    );
};

export default CardHand;