"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if the current viewport is mobile-sized
 * @param breakpoint The width below which a device is considered mobile (default: 768px)
 * @returns boolean indicating if the current device is mobile-sized
 */
export function useIsMobile(breakpoint = 768): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Initial check
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // Set initial value
        checkIsMobile();

        // Add event listener
        window.addEventListener("resize", checkIsMobile);

        // Clean up
        return () => {
            window.removeEventListener("resize", checkIsMobile);
        };
    }, [breakpoint]);

    return isMobile;
}