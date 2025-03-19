'use client';

/**
 * @module store/enhancedSettingsStore
 * @description Extended settings store with additional customization options
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BlackjackVariant, GameRules, gameVariantRules } from '@/types/game';
import { VEGAS_RULES } from '@/lib/utils/gameLogic';
import { CardBackOption } from '@/types/card';

export type KeyboardShortcut = {
    key: string;
    action: string;
    enabled: boolean;
};

export interface EnhancedSettingsState {
    // Game variant and rules
    variant: BlackjackVariant;
    gameRules: GameRules;
    setVariant: (variant: BlackjackVariant) => void;
    setGameRules: (rules: GameRules) => void;

    // Visual settings
    theme: 'light' | 'dark' | 'system';
    animationSpeed: number;
    tableColor: string;
    cardStyle: 'modern' | 'classic' | 'minimal' | 'retro';
    cardBackDesign: CardBackOption;
    showPlayerAvatars: boolean;

    // Gameplay settings
    autoStand17: boolean;
    autoPlayBasicStrategy: boolean;
    showProbabilities: boolean;
    showCountingInfo: boolean;
    defaultBetSize: number;

    // Advanced settings
    enableHeatmap: boolean;
    showEV: boolean;
    autoAdjustBetSize: boolean;
    riskTolerance: number;

    // Keyboard shortcuts
    keyboardShortcuts: {
        dealHand: KeyboardShortcut;
        hit: KeyboardShortcut;
        stand: KeyboardShortcut;
        double: KeyboardShortcut;
        split: KeyboardShortcut;
        increaseBet: KeyboardShortcut;
        decreaseBet: KeyboardShortcut;
    };

    // Add setter functions
    setTheme: (value: 'light' | 'dark' | 'system') => void;
    setAnimationSpeed: (value: number) => void;
    setTableColor: (value: string) => void;
    setCardStyle: (value: 'modern' | 'classic' | 'minimal' | 'retro') => void;
    setCardBackDesign: (value: CardBackOption) => void;
    setShowPlayerAvatars: (value: boolean) => void;

    setAutoStand17: (value: boolean) => void;
    setAutoPlayBasicStrategy: (value: boolean) => void;
    setShowProbabilities: (value: boolean) => void;
    setShowCountingInfo: (value: boolean) => void;
    setDefaultBetSize: (value: number) => void;

    setEnableHeatmap: (value: boolean) => void;
    setShowEV: (value: boolean) => void;
    setAutoAdjustBetSize: (value: boolean) => void;
    setRiskTolerance: (value: number) => void;

    // Keyboard shortcuts setter
    setKeyboardShortcut: (
        action: keyof EnhancedSettingsState['keyboardShortcuts'],
        shortcut: Partial<KeyboardShortcut>
    ) => void;

    resetToDefaults: () => void;
    isDirty: boolean;
    setIsDirty: (value: boolean) => void;
}

export const useEnhancedSettingsStore = create<EnhancedSettingsState>()(
    persist(
        (set) => ({
            // Game variant and rules
            variant: 'vegas',
            gameRules: gameVariantRules.vegas,

            // Visual settings
            theme: 'dark',
            animationSpeed: 1,
            tableColor: '#1a5f7a',
            cardStyle: 'modern',
            cardBackDesign: 'blue',
            showPlayerAvatars: true,

            // Gameplay settings
            autoStand17: true,
            autoPlayBasicStrategy: false,
            showProbabilities: true,
            showCountingInfo: true,
            defaultBetSize: 100,

            // Advanced settings
            enableHeatmap: true,
            showEV: true,
            autoAdjustBetSize: true,
            riskTolerance: 50,

            // Keyboard shortcuts
            keyboardShortcuts: {
                dealHand: { key: 'd', action: 'Deal Hand', enabled: true },
                hit: { key: 'h', action: 'Hit', enabled: true },
                stand: { key: 's', action: 'Stand', enabled: true },
                double: { key: 'l', action: 'Double Down', enabled: true },
                split: { key: 'p', action: 'Split', enabled: true },
                increaseBet: { key: 'ArrowUp', action: 'Increase Bet', enabled: true },
                decreaseBet: { key: 'ArrowDown', action: 'Decrease Bet', enabled: true },
            },

            // Track if settings have changed since last save
            isDirty: false,

            // Game variant and rules setters
            setVariant: (variant) => set(() => ({
                variant,
                gameRules: gameVariantRules[variant],
                isDirty: true
            })),
            setGameRules: (rules) => set({ gameRules: rules, isDirty: true }),

            // Setter functions
            setTheme: (value) => set({ theme: value, isDirty: true }),
            setAnimationSpeed: (value) => set({ animationSpeed: value, isDirty: true }),
            setTableColor: (value) => set({ tableColor: value, isDirty: true }),
            setCardStyle: (value) => set({ cardStyle: value, isDirty: true }),
            setCardBackDesign: (value) => set({ cardBackDesign: value, isDirty: true }),
            setShowPlayerAvatars: (value) => set({ showPlayerAvatars: value, isDirty: true }),

            setAutoStand17: (value) => set({ autoStand17: value, isDirty: true }),
            setAutoPlayBasicStrategy: (value) => set({ autoPlayBasicStrategy: value, isDirty: true }),
            setShowProbabilities: (value) => set({ showProbabilities: value, isDirty: true }),
            setShowCountingInfo: (value) => set({ showCountingInfo: value, isDirty: true }),
            setDefaultBetSize: (value) => set({ defaultBetSize: value, isDirty: true }),

            setEnableHeatmap: (value) => set({ enableHeatmap: value, isDirty: true }),
            setShowEV: (value) => set({ showEV: value, isDirty: true }),
            setAutoAdjustBetSize: (value) => set({ autoAdjustBetSize: value, isDirty: true }),
            setRiskTolerance: (value) => set({ riskTolerance: value, isDirty: true }),

            setKeyboardShortcut: (action, shortcut) => set((state) => {
                const currentShortcut = state.keyboardShortcuts[action];
                return {
                    keyboardShortcuts: {
                        ...state.keyboardShortcuts,
                        [action]: { ...currentShortcut, ...shortcut }
                    },
                    isDirty: true
                };
            }),

            setIsDirty: (value) => set({ isDirty: value }),

            resetToDefaults: () => set({
                // Game variant and rules
                variant: 'vegas',
                gameRules: gameVariantRules.vegas,

                theme: 'dark',
                animationSpeed: 1,
                tableColor: '#1a5f7a',
                cardStyle: 'modern',
                cardBackDesign: 'blue',
                showPlayerAvatars: true,

                autoStand17: true,
                autoPlayBasicStrategy: false,
                showProbabilities: true,
                showCountingInfo: true,
                defaultBetSize: VEGAS_RULES.minimumBet,

                enableHeatmap: true,
                showEV: true,
                autoAdjustBetSize: true,
                riskTolerance: 50,

                keyboardShortcuts: {
                    dealHand: { key: 'd', action: 'Deal Hand', enabled: true },
                    hit: { key: 'h', action: 'Hit', enabled: true },
                    stand: { key: 's', action: 'Stand', enabled: true },
                    double: { key: 'l', action: 'Double Down', enabled: true },
                    split: { key: 'p', action: 'Split', enabled: true },
                    increaseBet: { key: 'ArrowUp', action: 'Increase Bet', enabled: true },
                    decreaseBet: { key: 'ArrowDown', action: 'Decrease Bet', enabled: true },
                },

                isDirty: false,
            }),
        }),
        {
            name: 'blackjack-settings',
            version: 2,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                variant: state.variant,
                gameRules: state.gameRules,
                theme: state.theme,
                animationSpeed: state.animationSpeed,
                tableColor: state.tableColor,
                cardStyle: state.cardStyle,
                cardBackDesign: state.cardBackDesign,
                showPlayerAvatars: state.showPlayerAvatars,
                autoStand17: state.autoStand17,
                autoPlayBasicStrategy: state.autoPlayBasicStrategy,
                showProbabilities: state.showProbabilities,
                showCountingInfo: state.showCountingInfo,
                defaultBetSize: state.defaultBetSize,
                enableHeatmap: state.enableHeatmap,
                showEV: state.showEV,
                autoAdjustBetSize: state.autoAdjustBetSize,
                riskTolerance: state.riskTolerance,
                keyboardShortcuts: state.keyboardShortcuts,
            }),
            // Add a migrate function that can handle version updates
            migrate: (persistedState, version) => {
                if (version === 0) {
                    // Version 0 -> 1 migration
                    return {
                        ...(persistedState as Partial<EnhancedSettingsState>),
                        // Add any new required fields with defaults
                    };
                }
                if (version === 1) {
                    // Version 1 -> 2 migration (adding keyboard shortcuts)
                    return {
                        ...(persistedState as Partial<EnhancedSettingsState>),
                        keyboardShortcuts: {
                            dealHand: { key: 'd', action: 'Deal Hand', enabled: true },
                            hit: { key: 'h', action: 'Hit', enabled: true },
                            stand: { key: 's', action: 'Stand', enabled: true },
                            double: { key: 'l', action: 'Double Down', enabled: true },
                            split: { key: 'p', action: 'Split', enabled: true },
                            increaseBet: { key: 'ArrowUp', action: 'Increase Bet', enabled: true },
                            decreaseBet: { key: 'ArrowDown', action: 'Decrease Bet', enabled: true },
                        }
                    };
                }
                return persistedState as EnhancedSettingsState;
            },
        }
    )
);

export default useEnhancedSettingsStore;