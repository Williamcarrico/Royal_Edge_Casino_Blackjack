'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSettingsStore } from '@/hooks/useSettingsStore';
import { useGameStore } from '@/store/hooks/useGameStore';

/**
 * Custom hook to handle dealer's turn logic
 * Extracts and centralizes the complex logic from the DealerTurn component
 */
export function useDealerLogic(isActive: boolean, onComplete?: (result: { completed: boolean }) => void) {
    // State management
    const [isPlaying, setIsPlaying] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    // Add a ref to track if we've revealed cards for this specific dealer hand
    const revealedHandRef = useRef<string | null>(null);

    // Get game settings
    const animationSpeed = useSettingsStore(state => state.animationSpeed);
    const gameRules = useSettingsStore(state => state.gameRules);

    // Get game state with individual selectors for better performance
    const dealerHand = useGameStore(state => state.dealerHand);
    const playerHand = useGameStore(state => state.playerHand);
    const shoe = useGameStore(state => state.shoe);
    const gamePhase = useGameStore(state => state.gamePhase);
    const storePlayDealerTurn = useGameStore(state => state.playDealerTurn);
    const endRound = useGameStore(state => state.endRound);
    // Add this selector to explicitly reveal dealer cards
    const revealDealerCards = useGameStore(state => state.revealDealerCards);

    // Get the best value from a hand's possible values
    const getBestValue = useCallback((values: number[] | number): number => {
        // Handle the case where values is a single number
        if (typeof values === 'number') {
            return values;
        }

        // Handle case where values might not be an array
        if (!Array.isArray(values)) {
            console.error('Expected values to be an array but got:', values);
            return 0; // Return a safe default value
        }

        // Now we're sure values is an array
        // Filter values that are <= 21
        const validValues = values.filter(v => v <= 21);

        // If no valid values, return the lowest value (which is busted)
        if (validValues.length === 0) {
            return Math.min(...values);
        }

        // Return the highest valid value
        return Math.max(...validValues);
    }, []);

    // Display dealer status based on current hands - fixed to use all cards
    const getDealerStatus = useCallback(() => {
        if (!dealerHand || dealerHand.cards.length === 0) return "";

        // Make sure we're using the complete hand value for the dealer
        // Add null check and log for debugging
        if (!dealerHand.values) {
            console.error('dealerHand.values is undefined or null', dealerHand);
            return "Dealer's hand is being calculated...";
        }

        const dealerBestValue = getBestValue(dealerHand.values);

        // Check if dealer must hit based on game rules
        const dealerMustHit = dealerBestValue < 17 ||
            (dealerBestValue === 17 && dealerHand.isSoft && gameRules.dealerHitsSoft17);

        if (dealerMustHit) {
            return `Dealer has ${dealerBestValue}${dealerHand.isSoft ? " (soft)" : ""} and must hit`;
        } else {
            return `Dealer stands with ${dealerBestValue}`;
        }
    }, [dealerHand, gameRules, getBestValue]);

    // Handle dealer's turn logic
    const handleDealerPlay = useCallback(async () => {
        try {
            // Verify we have cards in the shoe before proceeding
            if (shoe.length === 0) {
                setMessage("Error: No cards left in shoe");
                return;
            }

            // Generate a unique ID for this dealer hand
            if (dealerHand) {
                const handId = dealerHand.cards.map(card => card.id || '').join('-');

                // Only reveal cards if we haven't already revealed this exact hand
                if (revealedHandRef.current !== handId) {
                    revealDealerCards?.();
                    revealedHandRef.current = handId;
                }
            }

            // Small delay to allow reveal animation
            await new Promise(resolve => setTimeout(resolve, 800 / animationSpeed));

            // Show the correct initial dealer hand value AFTER cards are revealed
            if (dealerHand?.values) {
                const initialValue = getBestValue(dealerHand.values);
                setMessage(`Dealer reveals hand: ${initialValue}${dealerHand.isSoft ? " (soft)" : ""}`);
            } else {
                setMessage("Dealer reveals hand...");
            }

            // Add a small delay for player to see the revealed hand
            await new Promise(resolve => setTimeout(resolve, 1000 / animationSpeed));

            // Call the store's playDealerTurn method
            storePlayDealerTurn();

            // Add a small delay before moving to round result
            const endDelay = 1500 / animationSpeed;

            timerRef.current = setTimeout(() => {
                setMessage(null);
                setIsPlaying(false);

                // Complete the dealer's turn and move to settlement
                if (onComplete) {
                    onComplete({
                        completed: true
                    });
                }

                // Move to end round
                endRound();
            }, endDelay);
        } catch (error) {
            console.error("Error during dealer's turn:", error);
            setMessage("Error occurred");
            setIsPlaying(false);
        }
    }, [dealerHand, shoe, storePlayDealerTurn, endRound, onComplete, animationSpeed, getBestValue, revealDealerCards]);

    // Automatically start dealer's turn when it becomes active
    const startDealerTurn = useCallback(() => {
        if (isActive && gamePhase === 'dealerTurn' && !isPlaying) {
            setIsPlaying(true);

            // Adjust timer based on animation speed setting
            const delay = 800 / animationSpeed;

            // Set a small delay before starting dealer play for better UX
            timerRef.current = setTimeout(() => {
                handleDealerPlay();
            }, delay);
        }
    }, [isActive, gamePhase, isPlaying, animationSpeed, handleDealerPlay]);

    // Effect to ensure dealer cards are revealed at start of dealer turn
    useEffect(() => {
        if (isActive && gamePhase === 'dealerTurn' && dealerHand) {
            // Generate a unique ID for this dealer hand based on card IDs
            const handId = dealerHand.cards.map(card => card.id || '').join('-');

            // Only reveal cards if we haven't already revealed this exact hand
            if (revealedHandRef.current !== handId) {
                revealDealerCards?.();
                revealedHandRef.current = handId;
            }
        }
    }, [isActive, gamePhase, dealerHand, revealDealerCards]);

    // Reset revealedHandRef when a new dealer hand is created
    useEffect(() => {
        if (dealerHand && gamePhase === 'playerTurn') {
            // Reset the reference when we're in player turn phase
            // This means a new hand has been dealt and we'll need to reveal cards later
            revealedHandRef.current = null;
        }
    }, [dealerHand, gamePhase]);

    // Create values for dealer status and remaining cards
    const dealerStatus = useCallback(() => {
        return isPlaying ? getDealerStatus() : "Waiting for dealer's turn";
    }, [isPlaying, getDealerStatus]);

    const cardsInShoe = useCallback(() => {
        return `Cards in shoe: ${shoe.length}`;
    }, [shoe]);

    // Cleanup function for timers
    const cleanupTimers = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    return {
        // State
        isPlaying,
        message,

        // Derived values
        dealerStatus: dealerStatus(),
        cardsInShoe: cardsInShoe(),
        dealerHand,
        playerHand,

        // Actions
        startDealerTurn,
        cleanupTimers,
    };
}