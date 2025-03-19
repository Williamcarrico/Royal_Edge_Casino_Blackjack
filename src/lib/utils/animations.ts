import { gsap } from 'gsap';

export interface AnimationOptions {
    duration?: number;
    yAmount?: number;
    ease?: string;
    delay?: number;
}

/**
 * Creates a bounce animation for an element
 * @param element The element to animate
 * @param options Animation options
 * @returns The GSAP animation instance
 */
export const createBounceAnimation = (
    element: HTMLElement,
    options: AnimationOptions = {}
) => {
    const {
        duration = 0.5,
        yAmount = -10,
        ease = 'power2.out',
        delay = 0
    } = options;

    // If GSAP is not available (SSR), return a mock animation object
    if (typeof gsap === 'undefined') {
        return {
            play: () => { },
            pause: () => { },
            kill: () => { },
        };
    }

    // Create and return the animation
    return gsap.fromTo(
        element,
        { y: 0 },
        {
            y: yAmount,
            duration,
            ease,
            delay,
            yoyo: true,
            repeat: 1,
        }
    );
};

/**
 * Creates a fade-in animation for an element
 * @param element The element to animate
 * @param options Animation options
 * @returns The GSAP animation instance
 */
export const createFadeInAnimation = (
    element: HTMLElement,
    options: AnimationOptions = {}
) => {
    const {
        duration = 0.3,
        ease = 'power1.out',
        delay = 0
    } = options;

    // If GSAP is not available (SSR), return a mock animation object
    if (typeof gsap === 'undefined') {
        return {
            play: () => { },
            pause: () => { },
            kill: () => { },
        };
    }

    // Create and return the animation
    return gsap.fromTo(
        element,
        { opacity: 0 },
        {
            opacity: 1,
            duration,
            ease,
            delay,
        }
    );
};

/**
 * Creates a card toss animation for chip betting
 * @param element The element to animate
 * @param targetX X destination
 * @param targetY Y destination
 * @returns The GSAP animation instance
 */
export const createChipTossAnimation = (
    element: HTMLElement,
    targetX: number,
    targetY: number
) => {
    // If GSAP is not available (SSR), return a mock animation object
    if (typeof gsap === 'undefined') {
        return {
            play: () => { },
            pause: () => { },
            kill: () => { },
        };
    }

    // Random rotation for natural movement
    const rotation = Math.random() * 360;

    // Create and return the animation
    return gsap.to(element, {
        x: targetX,
        y: targetY,
        rotation,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
            // Clean up after animation
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }
    });
};