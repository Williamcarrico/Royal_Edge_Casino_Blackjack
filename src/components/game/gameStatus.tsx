'use client';

/** @jsxImportSource react */
import { useEffect, useRef } from 'react';
import { RoundResult, GamePhase } from '@/lib/utils/gameLogic';
import { cn } from '@/lib/utils';
import { useAnimationTracker, createWinningAnimation, createBlackjackAnimation } from '@/lib/animation-utils';

interface GameStatusProps {
    gamePhase: GamePhase;
    roundResult: RoundResult;
    className?: string;
}

export const GameStatus = ({
    gamePhase,
    roundResult,
    className,
}: GameStatusProps) => {
    const statusRef = useRef<HTMLDivElement>(null);
    const { add: trackAnimation } = useAnimationTracker();

    // Get appropriate message based on game phase and result
    const getMessage = () => {
        // When a round result exists, prioritize showing it
        if (roundResult) {
            switch (roundResult) {
                case 'blackjack':
                    return { text: 'Blackjack!', style: 'text-2xl font-bold text-amber-400' };
                case 'win':
                    return { text: 'You Win!', style: 'text-2xl font-bold text-emerald-400' };
                case 'push':
                    return { text: 'Push - Bet Returned', style: 'text-xl font-medium text-blue-300' };
                case 'lose':
                    return { text: 'Dealer Wins', style: 'text-xl font-medium text-red-400' };
                case 'bust':
                    return { text: 'Bust!', style: 'text-xl font-medium text-red-500' };
                case 'surrender':
                    return { text: 'Hand Surrendered', style: 'text-lg font-medium text-gray-400' };
                default:
                    return { text: 'Awaiting Result', style: 'text-lg font-medium text-gray-300' };
            }
        }

        // Settlement and completed phases should always show a result message
        // If we reach here during these phases, use defaults for when roundResult is missing
        if (gamePhase === 'settlement' || gamePhase === 'completed') {
            // Log warning for debugging
            console.warn(`GameStatus: No roundResult found in ${gamePhase} phase`);
            return { text: 'Round Complete', style: 'text-xl font-medium text-amber-300' };
        }

        // Default messages based on game phase
        switch (gamePhase) {
            case 'betting':
                return { text: 'Place Your Bet', style: 'text-xl font-medium text-blue-300' };
            case 'dealing':
                return { text: 'Dealing Cards...', style: 'text-lg font-medium text-gray-300' };
            case 'playerTurn':
                return { text: 'Your Turn', style: 'text-xl font-bold text-green-400' };
            case 'dealerTurn':
                return { text: 'Dealer\'s Turn', style: 'text-lg font-medium text-orange-300' };
            case 'settlement':
                return { text: 'Round Complete - Place Bet', style: 'text-lg font-medium text-amber-300' };
            case 'completed':
                return { text: 'Ready For Next Round', style: 'text-lg font-bold text-amber-300' };
            case 'error':
                return { text: 'Error Occurred', style: 'text-lg font-medium text-red-500' };
            default:
                return { text: 'Unknown Phase', style: 'text-lg font-medium text-gray-300' };
        }
    };

    const message = getMessage();

    // Add animations for specific results
    useEffect(() => {
        if (!statusRef.current) return;

        // Always trigger animations for settlement or completed phases
        const shouldAnimate = roundResult === 'blackjack' ||
            roundResult === 'win' ||
            ['settlement', 'completed'].includes(gamePhase);

        if (shouldAnimate) {
            if (roundResult === 'blackjack') {
                const animation = createBlackjackAnimation(statusRef.current);
                trackAnimation(animation);
            } else if (roundResult === 'win' || gamePhase === 'settlement' || gamePhase === 'completed') {
                const animation = createWinningAnimation(statusRef.current);
                trackAnimation(animation);
            }
        }
    }, [roundResult, gamePhase, trackAnimation]);

    // Get phase-specific background styling
    const getBackgroundStyle = () => {
        // Prioritize result-specific styling
        if (roundResult === 'blackjack') return 'bg-amber-900 bg-opacity-70';
        if (roundResult === 'win') return 'bg-emerald-900 bg-opacity-70';
        if (roundResult === 'push') return 'bg-blue-900 bg-opacity-70';
        if (roundResult === 'lose' || roundResult === 'bust') return 'bg-red-900 bg-opacity-70';

        // Phase-specific styling fallbacks
        switch (gamePhase) {
            case 'betting':
                return 'bg-blue-900 bg-opacity-50';
            case 'playerTurn':
                return 'bg-emerald-900 bg-opacity-50';
            case 'dealerTurn':
                return 'bg-orange-900 bg-opacity-50';
            case 'settlement':
            case 'completed':
                return 'bg-amber-900 bg-opacity-60 animate-pulse';
            default:
                return 'bg-gray-800 bg-opacity-70';
        }
    };

    // Debug output for monitoring
    useEffect(() => {
        console.log('GameStatus render:', {
            gamePhase,
            roundResult,
            messageText: message.text,
            messageStyle: message.style,
            isPush: roundResult === 'push',
            isSettlementOrCompleted: ['settlement', 'completed'].includes(gamePhase)
        });
    }, [gamePhase, roundResult, message.text, message.style]);

    return (
        <div
            ref={statusRef}
            data-phase={gamePhase}
            data-result={roundResult ?? 'none'}
            className={cn(
                "px-8 py-3 rounded-lg shadow-md",
                getBackgroundStyle(),
                "transition-all duration-300 ease-in-out",
                className
            )}
        >
            <div className={message.style}>{message.text}</div>
        </div>
    );
};

export default GameStatus;