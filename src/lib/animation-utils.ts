'use client';

import { useRef, useCallback } from 'react';
import gsap from 'gsap';

// Animation options interface
interface AnimationOptions {
    duration?: number;
    delay?: number;
    ease?: string;
    y?: number;
    x?: number;
    scale?: number;
    opacity?: number;
    repeat?: number;
    yoyo?: boolean;
}

/**
 * Creates a floating animation for an element
 */
export const createFloatingAnimation = (
    element: HTMLElement,
    options: AnimationOptions = {}
) => {
    const {
        duration = 1.5,
        delay = 0,
        ease = 'power1.inOut',
        y = -10,
        repeat = -1,
        yoyo = true
    } = options;

    return gsap.to(element, {
        y,
        duration,
        delay,
        ease,
        repeat,
        yoyo
    });
};

/**
 * Hook to track and clean up animations
 */
export const useAnimationTracker = () => {
    const animations = useRef<gsap.core.Animation[]>([]);

    // Add animation to tracker
    const add = useCallback((animation: gsap.core.Animation) => {
        animations.current.push(animation);
        return animation;
    }, []);

    // Clean up all animations
    const cleanup = useCallback(() => {
        animations.current.forEach(anim => anim.kill());
        animations.current = [];
    }, []);

    return { add, cleanup };
};

/**
 * Creates a winning animation effect
 */
export const createWinningAnimation = (
    element: HTMLElement,
    options: AnimationOptions = {}
) => {
    const {
        duration = 0.8,
        delay = 0,
        ease = 'elastic.out(1, 0.3)',
        scale = 1.1
    } = options;

    // Create a pulse/glow effect
    const timeline = gsap.timeline();

    timeline.to(element, {
        scale,
        duration: duration / 2,
        ease,
        delay
    });

    timeline.to(element, {
        scale: 1,
        duration: duration / 2,
        ease: 'power2.out'
    });

    // Add glow effect if possible
    gsap.to(element, {
        boxShadow: '0 0 20px rgba(52, 211, 153, 0.7)',
        duration: duration * 1.2,
        repeat: 1,
        yoyo: true
    });

    return timeline;
};

/**
 * Creates a blackjack animation effect with more dramatic impact
 */
export const createBlackjackAnimation = (
    element: HTMLElement,
    options: AnimationOptions = {}
) => {
    const {
        duration = 1.2,
        delay = 0,
        ease = 'elastic.out(1, 0.3)',
        scale = 1.15
    } = options;

    // Create an impressive celebration animation
    const timeline = gsap.timeline({ delay });

    // Scale up with bounce effect
    timeline.to(element, {
        scale,
        duration: duration / 3,
        ease
    });

    // Rotate slightly for emphasis
    timeline.to(element, {
        rotation: 2,
        duration: duration / 6,
        ease: 'power2.inOut'
    });

    timeline.to(element, {
        rotation: -2,
        duration: duration / 6,
        ease: 'power2.inOut'
    });

    // Return to normal
    timeline.to(element, {
        scale: 1,
        rotation: 0,
        duration: duration / 3,
        ease: 'power2.out'
    });

    // Add golden glow effect
    gsap.to(element, {
        boxShadow: '0 0 30px rgba(245, 158, 11, 0.8)',
        duration: duration,
        repeat: 1,
        yoyo: true
    });

    return timeline;
};

/**
 * Creates a bounce animation for an element
 */
export const createBounceAnimation = (
    element: HTMLElement,
    options: AnimationOptions & { yAmount?: number } = {}
) => {
    const {
        duration = 0.5,
        delay = 0,
        yAmount = -10,
        yoyo = true
    } = options;

    return gsap.to(element, {
        y: yAmount,
        duration: duration / 2,
        ease: 'power2.out',
        delay,
        yoyo,
        repeat: 1,
        onComplete: () => {
            gsap.to(element, {
                y: 0,
                duration: duration / 2,
                ease: 'bounce.out'
            });
        }
    });
};

/**
 * Creates a pulsing glow animation for an element
 */
export const createPulsingGlowAnimation = (
    element: HTMLElement,
    options: AnimationOptions & { opacity?: number } = {}
) => {
    const {
        duration = 0.8,
        delay = 0,
        ease = 'power1.inOut',
        opacity = 0.6,
        repeat = 1,
        yoyo = true
    } = options;

    // Create a glow effect with box-shadow
    const color = window.getComputedStyle(element).backgroundColor || 'rgba(255, 255, 255, 0.7)';

    return gsap.to(element, {
        boxShadow: `0 0 15px ${color}`,
        duration,
        delay,
        ease,
        repeat,
        yoyo,
        opacity: `+=${opacity}`,
        scale: 1.05,
        onComplete: () => {
            gsap.to(element, {
                boxShadow: 'none',
                scale: 1,
                duration: duration / 2
            });
        }
    });
};

/**
 * Creates a card flip animation
 */
export const createCardFlipAnimation = (
    element: HTMLElement,
    options: AnimationOptions = {}
) => {
    const {
        duration = 0.5,
        delay = 0,
        ease = 'power2.inOut'
    } = options;

    // Create a flipping card animation using GSAP
    const timeline = gsap.timeline({ delay });

    // First half of the flip
    timeline.to(element, {
        rotateY: 90,
        duration: duration / 2,
        ease,
        onComplete: () => {
            // This is where you would change the card face in a real implementation
            // The actual content change is managed by React props
        }
    });

    // Second half of the flip
    timeline.to(element, {
        rotateY: 0,
        duration: duration / 2,
        ease
    });

    return timeline;
};

/**
 * Creates a chip tossing animation from source to target position
 */
export const createChipTossAnimation = (
    element: HTMLElement,
    targetX: number,
    targetY: number,
    options: AnimationOptions = {}
) => {
    const {
        duration = 0.8,
        delay = 0
    } = options;

    // Create a realistic chip toss animation
    const timeline = gsap.timeline({ delay });

    // Set initial position
    timeline.set(element, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1
    });

    // Arc path for realistic tossing motion
    timeline.to(element, {
        x: targetX * 0.4,
        y: targetY * 0.2 - 80, // Higher arc in the middle
        scale: 1.2,
        rotation: 180,
        duration: duration * 0.5,
        ease: 'power1.out'
    });

    // Landing motion
    timeline.to(element, {
        x: targetX,
        y: targetY,
        scale: 1,
        rotation: 360,
        duration: duration * 0.5,
        ease: 'bounce.out'
    });

    // Fade out at the end
    timeline.to(element, {
        opacity: 0,
        duration: 0.2,
        delay: 0.1
    });

    return timeline;
};