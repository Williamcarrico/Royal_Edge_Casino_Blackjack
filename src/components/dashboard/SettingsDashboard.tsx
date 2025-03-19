'use client';

/**
 * @module components/dashboard/SettingsDashboard
 * @description Settings dashboard component for customizing game options
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/ui/layout/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/layout/tabs';
import { Switch } from '@/ui/layout/switch';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/ui/layout/select';
import { Button } from '@/ui/layout/button';
import { ScrollArea } from '@/ui/layout/scroll-area';
import { Input } from '@/ui/forms/input';
import { Badge } from '@/ui/player/badge';
import { useEnhancedSettingsStore } from '@/store/enhancedSettingsStore';
import { useToast } from '@/ui/use-toast';
import { Slider } from "@/ui/layout/slider";
import { RuleConfiguration } from "@/components/game/rules/RuleConfiguration";
import Image from 'next/image';
import { AlertCircle, Keyboard, RefreshCw } from 'lucide-react';
import { BlackjackVariant } from '@/types/game';

interface SettingsDashboardProps {
    className?: string;
}

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
};

type GameplaySetting = 'autoPlayBasicStrategy' | 'showProbabilities' | 'showCountingInfo' | 'autoStand17' | 'defaultBetSize';

export const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ className }) => {
    const settings = useEnhancedSettingsStore();
    const { toast } = useToast();
    const [editingShortcut, setEditingShortcut] = useState<keyof typeof settings.keyboardShortcuts | null>(null);

    // Function to update gameplay settings with proper type safety
    const updateGameplaySetting = (setting: GameplaySetting, value: boolean | number) => {
        switch (setting) {
            case 'autoPlayBasicStrategy':
                settings.setAutoPlayBasicStrategy(value as boolean);
                break;
            case 'showProbabilities':
                settings.setShowProbabilities(value as boolean);
                break;
            case 'showCountingInfo':
                settings.setShowCountingInfo(value as boolean);
                break;
            case 'autoStand17':
                settings.setAutoStand17(value as boolean);
                break;
            case 'defaultBetSize':
                settings.setDefaultBetSize(value as number);
                break;
        }
    };

    const handleSave = () => {
        // Use the existing settings store methods to save changes
        settings.setIsDirty(false);

        toast({
            title: "Settings Saved",
            description: "Your game settings have been updated successfully.",
            variant: "default",
        });
    };

    const handleReset = () => {
        // Reset to default settings
        settings.resetToDefaults();

        toast({
            title: "Settings Reset",
            description: "Game settings have been reset to default values.",
            variant: "destructive",
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent, action: keyof typeof settings.keyboardShortcuts) => {
        if (editingShortcut === action) {
            e.preventDefault();
            const key = e.key;

            // Only allow valid keys
            if (key !== 'Escape' && key !== 'Tab' && !key.startsWith('Meta') && !key.startsWith('Control') && !key.startsWith('Alt')) {
                settings.setKeyboardShortcut(action, { key });
                setEditingShortcut(null);

                toast({
                    title: "Shortcut Updated",
                    description: `${settings.keyboardShortcuts[action].action} is now bound to "${key}"`,
                    variant: "default",
                });
            }

            if (key === 'Escape') {
                setEditingShortcut(null);
            }
        }
    };

    const calculatePerformanceImpact = () => {
        let cpuImpact = 25; // Base impact
        let memoryImpact = 30; // Base impact
        const networkImpact = 15; // Base impact

        // Factors that increase resource usage
        if (settings.showProbabilities) {
            cpuImpact += 15;
            memoryImpact += 5;
        }

        if (settings.showCountingInfo) {
            cpuImpact += 10;
            memoryImpact += 5;
        }

        if (settings.enableHeatmap) {
            cpuImpact += 15;
            memoryImpact += 10;
        }

        if (settings.showEV) {
            cpuImpact += 15;
            memoryImpact += 5;
        }

        if (settings.autoPlayBasicStrategy) {
            cpuImpact += 10;
        }

        if (settings.animationSpeed > 50) {
            cpuImpact += 10;
        }

        const getImpactLabel = (value: number, thresholds: [number, number]): string => {
            if (value < thresholds[0]) return "Low";
            if (value < thresholds[1]) return "Medium";
            return "High";
        };

        const getImpactColor = (value: number, thresholds: [number, number]): string => {
            if (value < thresholds[0]) return "bg-green-500";
            if (value < thresholds[1]) return "bg-yellow-500";
            return "bg-red-500";
        };

        const getTextColor = (value: number, thresholds: [number, number]): string => {
            if (value < thresholds[0]) return "text-green-400";
            if (value < thresholds[1]) return "text-yellow-400";
            return "text-red-400";
        };

        const cpuThresholds: [number, number] = [40, 70];
        const memoryThresholds: [number, number] = [40, 70];
        const networkThresholds: [number, number] = [30, 60];

        return {
            cpu: cpuImpact,
            memory: memoryImpact,
            network: networkImpact,
            cpuLabel: getImpactLabel(cpuImpact, cpuThresholds),
            memoryLabel: getImpactLabel(memoryImpact, memoryThresholds),
            networkLabel: getImpactLabel(networkImpact, networkThresholds),
            cpuColor: getImpactColor(cpuImpact, cpuThresholds),
            memoryColor: getImpactColor(memoryImpact, memoryThresholds),
            networkColor: getImpactColor(networkImpact, networkThresholds),
            cpuTextColor: getTextColor(cpuImpact, cpuThresholds),
            memoryTextColor: getTextColor(memoryImpact, memoryThresholds),
            networkTextColor: getTextColor(networkImpact, networkThresholds),
        };
    };

    const performance = calculatePerformanceImpact();

    return (
        <motion.div
            className={`grid grid-cols-12 gap-4 ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Settings Header */}
            <motion.div className="col-span-12" variants={itemVariants}>
                <Card className="p-4 bg-slate-900 border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Game Settings</h2>
                            <p className="text-sm text-slate-400">
                                Customize your blackjack experience
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                disabled={!settings.isDirty}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reset to Defaults
                            </Button>
                            <Button
                                variant="default"
                                onClick={handleSave}
                                disabled={!settings.isDirty}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Settings Content */}
            <motion.div className="col-span-8" variants={itemVariants}>
                <Card className="h-full bg-slate-900 border-slate-700">
                    <Tabs defaultValue="gameplay">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="gameplay">Gameplay</TabsTrigger>
                            <TabsTrigger value="visual">Visual</TabsTrigger>
                            <TabsTrigger value="rules">Rules</TabsTrigger>
                            <TabsTrigger value="keyboard">Shortcuts</TabsTrigger>
                            <TabsTrigger value="advanced">Advanced</TabsTrigger>
                        </TabsList>

                        <ScrollArea className="h-[600px]">
                            <div className="p-6">
                                <TabsContent value="visual">
                                    <div className="space-y-6">
                                        <SettingSection
                                            title="Theme"
                                            description="Choose your preferred color theme"
                                        >
                                            <Select
                                                value={settings.theme}
                                                onValueChange={settings.setTheme}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select theme" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="light">Light</SelectItem>
                                                    <SelectItem value="dark">Dark</SelectItem>
                                                    <SelectItem value="system">System</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </SettingSection>

                                        <SettingSection
                                            title="Animation Speed"
                                            description="Adjust game animation speed"
                                        >
                                            <Slider
                                                value={[settings.animationSpeed]}
                                                onValueChange={(value) => {
                                                    settings.setAnimationSpeed(value[0]);
                                                }}
                                                min={0}
                                                max={100}
                                                step={1}
                                            />
                                            <div className="flex justify-between mt-1 text-xs text-gray-500">
                                                <span>Slow</span>
                                                <span>Fast</span>
                                            </div>
                                        </SettingSection>

                                        <SettingSection
                                            title="Table Color"
                                            description="Customize the table felt color"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="color"
                                                    value={settings.tableColor}
                                                    onChange={(e) => settings.setTableColor(e.target.value)}
                                                    className="w-8 h-8 overflow-hidden rounded-lg"
                                                    aria-label="Choose table color"
                                                />
                                                <span className="text-sm text-gray-400">{settings.tableColor}</span>
                                            </div>
                                        </SettingSection>

                                        <SettingSection
                                            title="Card Style"
                                            description="Choose card design style"
                                        >
                                            <Select
                                                value={settings.cardStyle}
                                                onValueChange={settings.setCardStyle}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select card style" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="modern">Modern</SelectItem>
                                                    <SelectItem value="classic">Classic</SelectItem>
                                                    <SelectItem value="minimal">Minimal</SelectItem>
                                                    <SelectItem value="retro">Retro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </SettingSection>

                                        <SettingSection
                                            title="Card Back Design"
                                            description="Choose the card back pattern"
                                        >
                                            <div className="space-y-2">
                                                <Select
                                                    value={settings.cardBackDesign}
                                                    onValueChange={settings.setCardBackDesign}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select card back" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="blue">Blue Classic</SelectItem>
                                                        <SelectItem value="red">Red Classic</SelectItem>
                                                        <SelectItem value="abstract">Abstract</SelectItem>
                                                        <SelectItem value="abstract_scene">Minimal</SelectItem>
                                                        <SelectItem value="abstract_clouds">Clouds</SelectItem>
                                                        <SelectItem value="astronaut">Astronaut</SelectItem>
                                                        <SelectItem value="cars">Cars</SelectItem>
                                                        <SelectItem value="castle">Castle</SelectItem>
                                                        <SelectItem value="fish">Fish</SelectItem>
                                                        <SelectItem value="frog">Frog</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <div className="flex justify-center pt-2">
                                                    <div className="relative w-16 h-24 overflow-hidden rounded-md shadow-md">
                                                        <Image
                                                            src={`/card/backs/${settings.cardBackDesign}.svg`}
                                                            alt="Card back preview"
                                                            fill
                                                            sizes="64px"
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </SettingSection>

                                        <SettingSection
                                            title="Show Player Avatars"
                                            description="Display player profile pictures"
                                        >
                                            <Switch
                                                checked={settings.showPlayerAvatars}
                                                onCheckedChange={settings.setShowPlayerAvatars}
                                            />
                                        </SettingSection>
                                    </div>
                                </TabsContent>

                                <TabsContent value="gameplay">
                                    <div className="space-y-6">
                                        <SettingSection
                                            title="Game Variant"
                                            description="Choose the blackjack game variant"
                                        >
                                            <Select
                                                value={settings.variant}
                                                onValueChange={(value) => settings.setVariant(value as BlackjackVariant)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select variant" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="vegas">Vegas Strip</SelectItem>
                                                    <SelectItem value="classic">Classic</SelectItem>
                                                    <SelectItem value="european">European</SelectItem>
                                                    <SelectItem value="atlantic">Atlantic City</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </SettingSection>

                                        <SettingSection
                                            title="Auto-Stand on Hard 17+"
                                            description="Automatically stand when your hand is hard 17 or higher"
                                        >
                                            <Switch
                                                checked={settings.autoStand17}
                                                onCheckedChange={settings.setAutoStand17}
                                            />
                                        </SettingSection>

                                        <SettingSection
                                            title="Auto-Play Basic Strategy"
                                            description="Automatically play according to basic strategy"
                                        >
                                            <Switch
                                                checked={settings.autoPlayBasicStrategy}
                                                onCheckedChange={(checked) => updateGameplaySetting('autoPlayBasicStrategy', checked)}
                                            />
                                        </SettingSection>

                                        <SettingSection
                                            title="Show Probabilities"
                                            description="Display probability information during gameplay"
                                        >
                                            <Switch
                                                checked={settings.showProbabilities}
                                                onCheckedChange={(checked) => updateGameplaySetting('showProbabilities', checked)}
                                            />
                                        </SettingSection>

                                        <SettingSection
                                            title="Show Card Counting"
                                            description="Display card counting information"
                                        >
                                            <Switch
                                                checked={settings.showCountingInfo}
                                                onCheckedChange={(checked) => updateGameplaySetting('showCountingInfo', checked)}
                                            />
                                        </SettingSection>

                                        <SettingSection
                                            title="Default Bet Size"
                                            description="Set your default betting amount"
                                        >
                                            <Input
                                                type="number"
                                                value={settings.defaultBetSize}
                                                onChange={(e) => {
                                                    settings.setDefaultBetSize(Number(e.target.value));
                                                }}
                                                min={1}
                                                step={1}
                                            />
                                        </SettingSection>
                                    </div>
                                </TabsContent>

                                <TabsContent value="rules">
                                    <RuleConfiguration />
                                </TabsContent>

                                <TabsContent value="keyboard">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 p-3 mb-4 text-sm border rounded-md bg-slate-800 border-slate-700 text-amber-400">
                                            <AlertCircle className="w-5 h-5" />
                                            <p>Click on a key binding to change it, then press the new key.</p>
                                        </div>

                                        {Object.entries(settings.keyboardShortcuts).map(([action, shortcut]) => (
                                            <SettingSection
                                                key={action}
                                                title={shortcut.action}
                                                description={`Keyboard shortcut for ${shortcut.action.toLowerCase()}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className={`min-w-24 font-mono ${editingShortcut === action ? 'border-primary' : ''}`}
                                                        onClick={() => setEditingShortcut(action as keyof typeof settings.keyboardShortcuts)}
                                                        onKeyDown={(e) => handleKeyDown(e, action as keyof typeof settings.keyboardShortcuts)}
                                                    >
                                                        {editingShortcut === action ? "Press key..." : shortcut.key}
                                                    </Button>
                                                    <Switch
                                                        checked={shortcut.enabled}
                                                        onCheckedChange={(checked) =>
                                                            settings.setKeyboardShortcut(
                                                                action as keyof typeof settings.keyboardShortcuts,
                                                                { enabled: checked }
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </SettingSection>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="advanced">
                                    <div className="space-y-6">
                                        <SettingSection
                                            title="Decision Heatmap"
                                            description="Visualize optimal play decisions with color coding"
                                        >
                                            <Switch
                                                checked={settings.enableHeatmap}
                                                onCheckedChange={settings.setEnableHeatmap}
                                            />
                                        </SettingSection>

                                        <SettingSection
                                            title="Show Expected Value"
                                            description="Display EV calculations for each decision"
                                        >
                                            <Switch
                                                checked={settings.showEV}
                                                onCheckedChange={settings.setShowEV}
                                            />
                                        </SettingSection>

                                        <SettingSection
                                            title="Auto-Adjust Bet Size"
                                            description="Automatically adjust bets based on count and bankroll"
                                        >
                                            <Switch
                                                checked={settings.autoAdjustBetSize}
                                                onCheckedChange={settings.setAutoAdjustBetSize}
                                            />
                                        </SettingSection>

                                        <SettingSection
                                            title="Risk Tolerance"
                                            description="Adjust betting aggression and risk level"
                                        >
                                            <Slider
                                                value={[settings.riskTolerance]}
                                                onValueChange={(value) => {
                                                    settings.setRiskTolerance(value[0]);
                                                }}
                                                min={0}
                                                max={100}
                                                step={1}
                                            />
                                            <div className="flex justify-between mt-1">
                                                <span className="text-xs text-gray-500">Conservative</span>
                                                <span className="text-xs text-gray-500">Aggressive</span>
                                            </div>
                                        </SettingSection>
                                    </div>
                                </TabsContent>
                            </div>
                        </ScrollArea>
                    </Tabs>
                </Card>
            </motion.div>

            {/* Preview Panel */}
            <motion.div className="col-span-4" variants={itemVariants}>
                <Card className="h-full p-4 bg-slate-900 border-slate-700">
                    <h3 className="mb-4 text-lg font-semibold text-white">Live Preview</h3>
                    <div className="space-y-4">
                        <div
                            className="flex items-center justify-center rounded-lg aspect-video bg-slate-800"
                            style={{ backgroundColor: settings.tableColor }}
                        >
                            <div
                                className="flex items-center justify-center w-32 h-32 border-2 rounded-lg border-white/20"
                            >
                                <span className="font-medium text-white">Table Preview</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-white">Active Settings</h4>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">
                                    {settings.variant.charAt(0).toUpperCase() + settings.variant.slice(1)} Rules
                                </Badge>
                                <Badge variant="outline">
                                    {settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)} Theme
                                </Badge>
                                <Badge variant="outline">
                                    {settings.cardStyle.charAt(0).toUpperCase() + settings.cardStyle.slice(1)} Cards
                                </Badge>
                                {settings.showProbabilities && (
                                    <Badge variant="outline">Probabilities</Badge>
                                )}
                                {settings.showCountingInfo && (
                                    <Badge variant="outline">Counting Info</Badge>
                                )}
                                {settings.autoPlayBasicStrategy && (
                                    <Badge variant="outline">Auto Strategy</Badge>
                                )}
                                <Badge variant="outline">
                                    ${settings.defaultBetSize} Default Bet
                                </Badge>
                                {settings.enableHeatmap && (
                                    <Badge variant="outline">Heatmap</Badge>
                                )}
                                {settings.showEV && (
                                    <Badge variant="outline">EV Display</Badge>
                                )}
                                <Badge variant="outline">
                                    <Keyboard className="w-3 h-3 mr-1" />
                                    {Object.values(settings.keyboardShortcuts).filter(s => s.enabled).length} Shortcuts
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <h4 className="mb-2 text-sm font-medium text-white">Performance Impact</h4>
                            <div className="space-y-2">
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">CPU Usage</span>
                                        <span className={performance.cpuTextColor}>{performance.cpuLabel}</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                                        <div
                                            className={`h-full w-[${performance.cpu}%] ${performance.cpuColor}`}
                                            style={{ width: `${performance.cpu}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Memory Usage</span>
                                        <span className={performance.memoryTextColor}>{performance.memoryLabel}</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                                        <div
                                            className={`h-full ${performance.memoryColor}`}
                                            style={{ width: `${performance.memory}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Network Usage</span>
                                        <span className={performance.networkTextColor}>{performance.networkLabel}</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                                        <div
                                            className={`h-full ${performance.networkColor}`}
                                            style={{ width: `${performance.network}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
};

interface SettingSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({
    title,
    description,
    children
}) => (
    <div className="pb-4 border-b border-slate-700">
        <div className="flex items-start justify-between mb-4">
            <div>
                <h3 className="text-sm font-medium text-white">{title}</h3>
                {description && (
                    <p className="text-sm text-slate-400">{description}</p>
                )}
            </div>
            <div className="ml-4">{children}</div>
        </div>
    </div>
);