'use client';

/**
 * @module hooks/useSettingsStore
 * @description Custom hooks for accessing settings store with selectors
 */

import { useEnhancedSettingsStore } from '@/store/enhancedSettingsStore';
import { useMemo } from 'react';

/**
 * Main settings store hook
 */
export { useEnhancedSettingsStore };

/**
 * Hook to access game variant and rules
 */
export const useGameVariantSettings = () => {
    // Use separate primitive selectors
    const variant = useEnhancedSettingsStore(state => state.variant);
    const gameRules = useEnhancedSettingsStore(state => state.gameRules);
    const setVariant = useEnhancedSettingsStore(state => state.setVariant);
    const setGameRules = useEnhancedSettingsStore(state => state.setGameRules);

    // Use useMemo to create a stable reference
    return useMemo(() => ({
        variant,
        gameRules,
        setVariant,
        setGameRules,
    }), [
        variant,
        gameRules,
        setVariant,
        setGameRules,
    ]);
};

/**
 * Hook that returns whether dealer hits on soft 17 based on current rules
 */
export const useDealerHitsSoft17 = () => {
    return useEnhancedSettingsStore((state) => state.gameRules.dealerHitsSoft17);
};

/**
 * Hook that returns number of decks in the shoe based on current rules
 */
export const useDecksCount = () => {
    return useEnhancedSettingsStore((state) => state.gameRules.decksCount);
};

/**
 * Hook to access table visual settings
 */
export const useTableSettings = () => {
    // Use separate primitive selectors
    const theme = useEnhancedSettingsStore(state => state.theme);
    const tableColor = useEnhancedSettingsStore(state => state.tableColor);
    const cardStyle = useEnhancedSettingsStore(state => state.cardStyle);
    const cardBackDesign = useEnhancedSettingsStore(state => state.cardBackDesign);
    const animationSpeed = useEnhancedSettingsStore(state => state.animationSpeed);
    const showPlayerAvatars = useEnhancedSettingsStore(state => state.showPlayerAvatars);

    // Get action functions separately
    const setTheme = useEnhancedSettingsStore(state => state.setTheme);
    const setTableColor = useEnhancedSettingsStore(state => state.setTableColor);
    const setCardStyle = useEnhancedSettingsStore(state => state.setCardStyle);
    const setCardBackDesign = useEnhancedSettingsStore(state => state.setCardBackDesign);
    const setAnimationSpeed = useEnhancedSettingsStore(state => state.setAnimationSpeed);
    const setShowPlayerAvatars = useEnhancedSettingsStore(state => state.setShowPlayerAvatars);

    // Use useMemo to create a stable reference
    return useMemo(() => ({
        theme,
        tableColor,
        cardStyle,
        cardBackDesign,
        animationSpeed,
        showPlayerAvatars,
        setTheme,
        setTableColor,
        setCardStyle,
        setCardBackDesign,
        setAnimationSpeed,
        setShowPlayerAvatars,
    }), [
        theme,
        tableColor,
        cardStyle,
        cardBackDesign,
        animationSpeed,
        showPlayerAvatars,
        setTheme,
        setTableColor,
        setCardStyle,
        setCardBackDesign,
        setAnimationSpeed,
        setShowPlayerAvatars,
    ]);
};

/**
 * Hook to access gameplay settings
 */
export const useGameplaySettings = () => {
    // Use separate primitive selectors
    const autoStand17 = useEnhancedSettingsStore(state => state.autoStand17);
    const autoPlayBasicStrategy = useEnhancedSettingsStore(state => state.autoPlayBasicStrategy);
    const showProbabilities = useEnhancedSettingsStore(state => state.showProbabilities);
    const showCountingInfo = useEnhancedSettingsStore(state => state.showCountingInfo);
    const defaultBetSize = useEnhancedSettingsStore(state => state.defaultBetSize);

    // Get action functions separately
    const setAutoStand17 = useEnhancedSettingsStore(state => state.setAutoStand17);
    const setAutoPlayBasicStrategy = useEnhancedSettingsStore(state => state.setAutoPlayBasicStrategy);
    const setShowProbabilities = useEnhancedSettingsStore(state => state.setShowProbabilities);
    const setShowCountingInfo = useEnhancedSettingsStore(state => state.setShowCountingInfo);
    const setDefaultBetSize = useEnhancedSettingsStore(state => state.setDefaultBetSize);

    // Use useMemo to create a stable reference
    return useMemo(() => ({
        autoStand17,
        autoPlayBasicStrategy,
        showProbabilities,
        showCountingInfo,
        defaultBetSize,
        setAutoStand17,
        setAutoPlayBasicStrategy,
        setShowProbabilities,
        setShowCountingInfo,
        setDefaultBetSize,
    }), [
        autoStand17,
        autoPlayBasicStrategy,
        showProbabilities,
        showCountingInfo,
        defaultBetSize,
        setAutoStand17,
        setAutoPlayBasicStrategy,
        setShowProbabilities,
        setShowCountingInfo,
        setDefaultBetSize,
    ]);
};

/**
 * Hook to access advanced settings
 */
export const useAdvancedSettings = () => {
    // Use separate primitive selectors
    const enableHeatmap = useEnhancedSettingsStore(state => state.enableHeatmap);
    const showEV = useEnhancedSettingsStore(state => state.showEV);
    const autoAdjustBetSize = useEnhancedSettingsStore(state => state.autoAdjustBetSize);
    const riskTolerance = useEnhancedSettingsStore(state => state.riskTolerance);

    // Get action functions separately
    const setEnableHeatmap = useEnhancedSettingsStore(state => state.setEnableHeatmap);
    const setShowEV = useEnhancedSettingsStore(state => state.setShowEV);
    const setAutoAdjustBetSize = useEnhancedSettingsStore(state => state.setAutoAdjustBetSize);
    const setRiskTolerance = useEnhancedSettingsStore(state => state.setRiskTolerance);

    // Use useMemo to create a stable reference
    return useMemo(() => ({
        enableHeatmap,
        showEV,
        autoAdjustBetSize,
        riskTolerance,
        setEnableHeatmap,
        setShowEV,
        setAutoAdjustBetSize,
        setRiskTolerance,
    }), [
        enableHeatmap,
        showEV,
        autoAdjustBetSize,
        riskTolerance,
        setEnableHeatmap,
        setShowEV,
        setAutoAdjustBetSize,
        setRiskTolerance,
    ]);
};

/**
 * Hook to access settings save/dirty state
 */
export const useSettingsState = () => {
    // Use separate primitive selectors
    const isDirty = useEnhancedSettingsStore(state => state.isDirty);
    const setIsDirty = useEnhancedSettingsStore(state => state.setIsDirty);
    const resetToDefaults = useEnhancedSettingsStore(state => state.resetToDefaults);

    // Use useMemo to create a stable reference
    return useMemo(() => ({
        isDirty,
        setIsDirty,
        resetToDefaults,
    }), [
        isDirty,
        setIsDirty,
        resetToDefaults,
    ]);
};