import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook to track and manage animations across component lifecycles
 * Ensures animations are properly cleaned up when components unmount
 */
export const useAnimationTracker = () => {
    // Use a ref to track active animations
    const animationsRef = useRef<Array<{ play: () => void, pause: () => void, kill: () => void }>>([]);

    // Add an animation to the tracker
    const add = useCallback((animation: { play: () => void, pause: () => void, kill: () => void }) => {
        animationsRef.current.push(animation);
        return animation;
    }, []);

    // Play all tracked animations
    const playAll = useCallback(() => {
        animationsRef.current.forEach(animation => animation.play());
    }, []);

    // Pause all tracked animations
    const pauseAll = useCallback(() => {
        animationsRef.current.forEach(animation => animation.pause());
    }, []);

    // Clean up animations when component unmounts
    useEffect(() => {
        // Return cleanup function
        return () => {
            animationsRef.current.forEach(animation => {
                if (animation && typeof animation.kill === 'function') {
                    animation.kill();
                }
            });
            animationsRef.current = [];
        };
    }, []);

    return {
        add,
        playAll,
        pauseAll,
        // Get the current count of tracked animations
        get count() {
            return animationsRef.current.length;
        }
    };
};