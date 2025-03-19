'use client';

import * as React from 'react';
import { useEnhancedSettingsStore } from '@/store/enhancedSettingsStore';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/ui/layout/select';
import { Switch } from '@/ui/layout/switch';
import { Slider } from '@/ui/layout/slider';

interface RuleConfigurationProps {
    className?: string;
}

export const RuleConfiguration = ({ className }: RuleConfigurationProps) => {
    const { gameRules, setGameRules } = useEnhancedSettingsStore();

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="pb-4 border-b border-slate-700">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-medium text-white">Blackjack Payout</h3>
                        <p className="text-sm text-slate-400">Set the payout ratio for blackjack</p>
                    </div>
                    <div className="ml-4">
                        <Select
                            value={gameRules?.blackjackPayout === 1.5 ? "3:2" : "6:5"}
                            onValueChange={(val) => setGameRules({
                                ...gameRules,
                                blackjackPayout: val === "3:2" ? 1.5 : 1.2
                            })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select payout" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3:2">3:2 (Standard)</SelectItem>
                                <SelectItem value="6:5">6:5</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="pb-4 border-b border-slate-700">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-medium text-white">Dealer Hits on Soft 17</h3>
                        <p className="text-sm text-slate-400">Dealer must hit on a soft 17</p>
                    </div>
                    <div className="ml-4">
                        <Switch
                            checked={gameRules?.dealerHitsSoft17 || false}
                            onCheckedChange={(checked) => setGameRules({ ...gameRules, dealerHitsSoft17: checked })}
                        />
                    </div>
                </div>
            </div>

            <div className="pb-4 border-b border-slate-700">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-medium text-white">Number of Decks</h3>
                        <p className="text-sm text-slate-400">Set the number of decks used in the shoe</p>
                    </div>
                    <div className="w-40 ml-4">
                        <Slider
                            value={[gameRules?.decksCount || 6]}
                            onValueChange={(value) => setGameRules({ ...gameRules, decksCount: value[0] })}
                            min={1}
                            max={8}
                            step={1}
                        />
                        <div className="mt-1 text-xs text-center text-slate-400">
                            {gameRules?.decksCount || 6} {gameRules?.decksCount === 1 ? 'deck' : 'decks'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pb-4 border-b border-slate-700">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-medium text-white">Allow Surrender</h3>
                        <p className="text-sm text-slate-400">Player can surrender for half their bet</p>
                    </div>
                    <div className="ml-4">
                        <Switch
                            checked={gameRules?.surrender || false}
                            onCheckedChange={(checked) => setGameRules({ ...gameRules, surrender: checked })}
                        />
                    </div>
                </div>
            </div>

            <div className="pb-4 border-b border-slate-700">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-medium text-white">Allow Double After Split</h3>
                        <p className="text-sm text-slate-400">Player can double down after splitting pairs</p>
                    </div>
                    <div className="ml-4">
                        <Switch
                            checked={gameRules?.doubleAfterSplit || false}
                            onCheckedChange={(checked) => setGameRules({ ...gameRules, doubleAfterSplit: checked })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RuleConfiguration;