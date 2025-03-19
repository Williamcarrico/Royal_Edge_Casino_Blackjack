'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card as CardType } from '@/lib/utils/gameLogic';
import { cn } from '@/lib/utils';
import { useAnimationTracker, createCardFlipAnimation } from '@/lib/animation-utils';
import { useTableSettings } from '@/hooks/useSettingsStore';
import gsap from 'gsap';

// Helper functions moved outside component
const getCardFrontPath = (suit: string, rank: string): string => {
    // Convert the rank to the format used in filenames
    let fileRank = rank;
    if (rank === 'A') fileRank = 'ace';
    if (rank === 'J') fileRank = 'jack';
    if (rank === 'Q') fileRank = 'queen';
    if (rank === 'K') fileRank = 'king';

    return `/card/fronts/${suit.toLowerCase()}_${fileRank.toLowerCase()}.svg`;
};

const getCardBackPath = (cardBackDesign: string): string => {
    return `/card/backs/${cardBackDesign}.svg`;
};

const getCardStyleClass = (cardStyle: string): string => {
    switch (cardStyle) {
        case 'modern':
            return 'shadow-lg rounded-lg';
        case 'classic':
            return 'shadow-md rounded-md';
        case 'minimal':
            return 'shadow-sm rounded-sm';
        case 'retro':
            return 'shadow-md rounded-md border-amber-200';
        default:
            return 'shadow-md rounded-md';
    }
};

// Helper function to get z-index class based on index
const getZIndexClass = (index: number): string => {
    if (index > 50) return 'z-50';
    if (index > 40) return 'z-40';
    if (index > 30) return 'z-30';
    if (index > 20) return 'z-20';
    if (index > 10) return 'z-10';
    if (index > 5) return 'z-5';
    if (index > 4) return 'z-4';
    if (index > 3) return 'z-3';
    if (index > 2) return 'z-2';
    return 'z-1';
};

// Create animation function
const createDealingAnimation = (element: HTMLElement, index: number, animationSpeed: number) => {
    const startX = 50;
    const startY = -100;

    return gsap.fromTo(
        element,
        {
            x: startX,
            y: startY,
            opacity: 0,
            scale: 0.8,
            rotation: -5 + (Math.random() * 10),  // Slight random rotation
        },
        {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.6 * animationSpeed,
            ease: "power2.out",
            delay: index * 0.1 * animationSpeed, // Stagger based on card index
        }
    );
};

interface CardProps {
    card: CardType;
    index?: number;
    isDealing?: boolean;
    isFlipping?: boolean;
    className?: string;
}

export const Card = React.memo(({
    card,
    index = 0,
    isDealing = false,
    isFlipping = false,
    className,
}: CardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const { add: trackAnimation } = useAnimationTracker();
    const { cardStyle, cardBackDesign, animationSpeed } = useTableSettings();

    // Apply animations when card is flipped or dealt
    useEffect(() => {
        if (!cardRef.current) return;

        if (isFlipping) {
            const animation = createCardFlipAnimation(cardRef.current, {
                duration: 0.5 * animationSpeed,
            });
            trackAnimation(animation);
        }

        if (isDealing) {
            const animation = createDealingAnimation(cardRef.current, index, animationSpeed);
            trackAnimation(animation);
        }
    }, [isFlipping, isDealing, trackAnimation, animationSpeed, index]);

    // Prepare common class names
    const cardClasses = cn(
        'relative w-24 h-36 flex items-center justify-center',
        'transform transition-transform duration-200',
        'preserve-3d',
        getZIndexClass(index),
        getCardStyleClass(cardStyle),
        card.isFaceUp && 'hover:shadow-xl',
        className
    );

    const imageProps = {
        width: 96,
        height: 144,
        className: "object-contain w-full h-full",
        priority: index < 4
    };

    // Render card
    return (
        <div
            ref={cardRef}
            className={cardClasses}
            aria-label={card.isFaceUp ? `${card.rank} of ${card.suit}` : 'Card back'}
        >
            {card.isFaceUp ? (
                <Image
                    src={getCardFrontPath(card.suit, card.rank)}
                    alt={`${card.rank} of ${card.suit}`}
                    {...imageProps}
                />
            ) : (
                <Image
                    src={getCardBackPath(cardBackDesign)}
                    alt="Card back"
                    {...imageProps}
                />
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    // Only re-render if these props change
    return prevProps.card.id === nextProps.card.id &&
        prevProps.card.isFaceUp === nextProps.card.isFaceUp &&
        prevProps.isDealing === nextProps.isDealing &&
        prevProps.isFlipping === nextProps.isFlipping &&
        prevProps.index === nextProps.index &&
        prevProps.className === nextProps.className;
});

export default Card;