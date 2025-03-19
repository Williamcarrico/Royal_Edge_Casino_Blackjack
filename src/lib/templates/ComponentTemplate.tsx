'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Template for React functional components following best practices for hooks.
 *
 * COMPONENT STRUCTURE BEST PRACTICES:
 * 1. Define all hooks first
 * 2. Define memoized values and callbacks
 * 3. Define effects
 * 4. Define helper functions
 * 5. Handle conditional returns (always after all hooks)
 * 6. Return JSX
 */
interface ComponentTemplateProps {
    isActive?: boolean;
    data?: Record<string, unknown>;
    onAction?: () => void;
    className?: string;
}

export const ComponentTemplate: React.FC<ComponentTemplateProps> = ({
    isActive = false,
    data,
    onAction,
    className,
}) => {
    // =============================================
    // 1. DEFINE ALL HOOKS FIRST
    // =============================================

    // State hooks
    const [isLoading, setIsLoading] = useState(false);
    const [value, setValue] = useState<string>('');

    // Ref hooks
    const containerRef = useRef<HTMLDivElement>(null);

    // =============================================
    // 2. DEFINE MEMOIZED VALUES AND CALLBACKS
    // =============================================

    // Memoized values
    const processedData = useMemo(() => {
        if (!data) return null;
        return { ...data, processed: true };
    }, [data]);

    // Memoized callbacks
    const handleClick = useCallback(() => {
        setIsLoading(true);

        // Simulate async action
        setTimeout(() => {
            setIsLoading(false);
            setValue(`Updated at ${new Date().toLocaleTimeString()}`);
            if (onAction) onAction();
        }, 1000);
    }, [onAction]);

    // =============================================
    // 3. DEFINE EFFECTS
    // =============================================

    // Component lifecycle effects
    useEffect(() => {
        // Setup effect when component mounts
        const cleanup = () => {
            // Cleanup logic
        };

        return cleanup;
    }, []);

    // Conditional effects based on props
    useEffect(() => {
        if (isActive) {
            // Do something when component becomes active
        }
    }, [isActive]);

    // =============================================
    // 4. DEFINE HELPER FUNCTIONS
    // =============================================

    const formatValue = (val: string) => {
        return val.toUpperCase();
    };

    // =============================================
    // 5. CONDITIONAL RETURNS (AFTER ALL HOOKS)
    // =============================================

    // Early return if inactive - ONLY after all hooks are called
    if (!isActive) return null;

    // =============================================
    // 6. RETURN JSX
    // =============================================

    return (
        <div ref={containerRef} className={className}>
            <h3>Component Template</h3>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <p>Value: {formatValue(value)}</p>
                    <button onClick={handleClick}>
                        Click Me
                    </button>
                    {processedData && (
                        <pre>{JSON.stringify(processedData, null, 2)}</pre>
                    )}
                </>
            )}
        </div>
    );
};

export default ComponentTemplate;