'use client';

import { useState, useEffect } from 'react';
import { GameTable } from '@/components/game/table';
import { useEnhancedSettingsStore } from '@/store/enhancedSettingsStore';
import { useGameStore } from '@/store/hooks/useGameStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/layout/card';
import { Button } from '@/ui/layout/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/layout/tabs';
import { useAnalyticsStore, usePerformanceMetrics, useWinRate } from '@/store/hooks/useAnalyticsStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/ui/dialog';
import { Switch } from '@/ui/layout/switch';
import { Progress } from '@/ui/layout/progress';
import { Badge } from '@/ui/player/badge';
import { useToast } from '@/ui/use-toast';
import { formatCurrency } from '@/lib/utils/format';

/**
 * Main Blackjack Game Page with all components integrated
 */
export default function BlackjackPage() {
    // State for UI controls
    const [showSettings, setShowSettings] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [activeTab, setActiveTab] = useState('game');

    const { toast } = useToast();

    // Get settings and analytics
    const settings = useEnhancedSettingsStore();
    const { startSession, endSession } = useAnalyticsStore();
    const { winRate, handsWon, handsLost, handsPushed, totalHands } = useWinRate();
    const { skillMetrics, totalProfit } = usePerformanceMetrics();

    // Define interface for metric
    interface SkillMetric {
        category: string;
        level: 'expert' | 'advanced' | 'intermediate' | 'beginner';
        score: number;
    }

    // Get game state with individual selectors to avoid re-rendering issues
    const initializeGame = useGameStore(state => state.initializeGame);
    const updateGameFromRules = useGameStore(state => state.updateGameFromRules);
    const gamePhase = useGameStore(state => state.gamePhase);
    const chips = useGameStore(state => state.chips);
    const bet = useGameStore(state => state.bet);

    // Initialize game and analytics on mount
    useEffect(() => {
        // Initialize game with current settings
        initializeGame();
        updateGameFromRules();

        // Start analytics session
        startSession(1000); // Initial chips

        // Make sure strategy settings are initialized
        // We need to ensure they're set regardless of whether they're in local storage
        if (settings.showProbabilities === undefined) {
            settings.setShowProbabilities(true);
        }
        if (settings.showCountingInfo === undefined) {
            settings.setShowCountingInfo(true);
        }

        // Clean up on unmount
        return () => {
            endSession(chips);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle settings save
    const handleSaveSettings = () => {
        // Apply settings changes
        updateGameFromRules();
        setShowSettings(false);

        toast({
            title: "Settings Saved",
            description: "Your game settings have been updated.",
        });
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="container px-4 py-8 pt-24 mx-auto">
                <header className="flex flex-col mb-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white md:text-4xl">Vegas 21 Blackjack</h1>
                        <p className="mt-1 text-gray-400">
                            Test your luck and skill in this classic casino game
                        </p>
                    </div>

                    <div className="flex gap-3 mt-4 md:mt-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowSettings(true)}
                            className="text-white border-gray-700"
                        >
                            Game Settings
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowStats(true)}
                            className="text-white border-gray-700"
                        >
                            Statistics
                        </Button>
                    </div>
                </header>

                {/* Game Navigation Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                    <TabsList className="bg-gray-800 border-gray-700">
                        <TabsTrigger value="game">Main Game</TabsTrigger>
                        <TabsTrigger value="strategy">Strategy Coach</TabsTrigger>
                        <TabsTrigger value="practice">Practice Mode</TabsTrigger>
                    </TabsList>

                    <TabsContent value="game" className="mt-0">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                            {/* Main game area - 3/4 width on large screens */}
                            <div className="lg:col-span-3">
                                <GameTable
                                    showCardCounting={settings.showCountingInfo}
                                    showBasicStrategy={settings.showProbabilities}
                                />
                            </div>

                            {/* Side panel - 1/4 width on large screens */}
                            <div className="space-y-6">
                                {/* Player Status Card */}
                                <Card className="text-white bg-gray-800 border-gray-700">
                                    <CardHeader className="pb-3">
                                        <CardTitle>Player Status</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between mb-1 text-sm">
                                                    <span>Chips:</span>
                                                    <span className="font-bold text-amber-400">{formatCurrency(chips)}</span>
                                                </div>
                                                <Progress value={(chips / 2000) * 100} className="h-2 bg-gray-700" />
                                            </div>

                                            {bet > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span>Current Bet:</span>
                                                    <span className="font-medium">{formatCurrency(bet)}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between text-sm">
                                                <span>Win Rate:</span>
                                                <span className="font-medium">
                                                    {winRate ? `${(winRate * 100).toFixed(1)}%` : '0%'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-sm">
                                                <span>Hands Played:</span>
                                                <span className="font-medium">{totalHands}</span>
                                            </div>

                                            <div className="flex justify-between text-sm">
                                                <span>Game Phase:</span>
                                                <span className="font-medium capitalize">
                                                    {gamePhase.replace(/_/g, ' ').toLowerCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Game Rules Card */}
                                <Card className="text-white bg-gray-800 border-gray-700">
                                    <CardHeader className="pb-3">
                                        <CardTitle>Game Rules</CardTitle>
                                        <CardDescription className="text-gray-400">
                                            Current table rules
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex justify-between">
                                                <span>Blackjack Pays:</span>
                                                <span className="font-medium">{settings.gameRules.blackjackPayout}:1</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>Decks:</span>
                                                <span className="font-medium">{settings.gameRules.decksCount}</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>Dealer Hits Soft 17:</span>
                                                <span className="font-medium">{settings.gameRules.dealerHitsSoft17 ? 'Yes' : 'No'}</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>Double After Split:</span>
                                                <span className="font-medium">{settings.gameRules.doubleAfterSplit ? 'Allowed' : 'Not Allowed'}</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>Max Splits:</span>
                                                <span className="font-medium">{settings.gameRules.maxSplits}</span>
                                            </li>
                                            <li className="flex justify-between">
                                                <span>Surrender:</span>
                                                <span className="font-medium">{settings.gameRules.surrender ? 'Allowed' : 'Not Allowed'}</span>
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>

                                {/* Quick Actions Card */}
                                <Card className="text-white bg-gray-800 border-gray-700">
                                    <CardHeader className="pb-3">
                                        <CardTitle>Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <Button
                                                variant="outline"
                                                className="w-full text-white border-gray-700 hover:bg-gray-700"
                                                onClick={updateGameFromRules}
                                            >
                                                New Shoe
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full text-white border-gray-700 hover:bg-gray-700"
                                                onClick={() => {
                                                    // Reset game with fresh chips
                                                    initializeGame();
                                                    startSession(1000);
                                                    toast({
                                                        title: "Game Reset",
                                                        description: "Starting a new game with fresh chips.",
                                                    });
                                                }}
                                            >
                                                Reset Game
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Strategy Tips Card */}
                                <Card className="text-white bg-gray-800 border-gray-700">
                                    <CardHeader className="pb-3">
                                        <CardTitle>Strategy Tips</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <p>• Always split Aces and 8s</p>
                                        <p>• Never split 10s or 5s</p>
                                        <p>• Double down on 11 against any dealer card</p>
                                        <p>• Stand on 17 or higher</p>
                                        <p>• Insurance is only profitable when count is high</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="strategy" className="mt-0">
                        <div className="grid grid-cols-1 gap-6">
                            <Card className="p-6 text-white bg-gray-800 border-gray-700">
                                <div className="text-center">
                                    <h2 className="mb-4 text-2xl font-bold">Strategy Coach</h2>
                                    <p className="mb-8">Switch to the Strategy Coach to learn optimal blackjack play.</p>
                                    <Button
                                        className="bg-amber-600 hover:bg-amber-700"
                                        onClick={() => setActiveTab('game')}
                                    >
                                        Back to Main Game
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="practice" className="mt-0">
                        <div className="grid grid-cols-1 gap-6">
                            <Card className="p-6 text-white bg-gray-800 border-gray-700">
                                <div className="text-center">
                                    <h2 className="mb-4 text-2xl font-bold">Practice Mode</h2>
                                    <p className="mb-8">Coming soon! Practice specific scenarios to improve your skills.</p>
                                    <Button
                                        className="bg-amber-600 hover:bg-amber-700"
                                        onClick={() => setActiveTab('game')}
                                    >
                                        Back to Main Game
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Settings Dialog */}
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogContent className="max-w-3xl text-white bg-gray-800 border-gray-700">
                    <DialogHeader>
                        <DialogTitle>Game Settings</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Customize the game rules and display options
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="rules" className="mt-4">
                        <TabsList className="mb-4 bg-gray-900">
                            <TabsTrigger value="rules">Game Rules</TabsTrigger>
                            <TabsTrigger value="display">Display</TabsTrigger>
                            <TabsTrigger value="gameplay">Gameplay</TabsTrigger>
                        </TabsList>

                        <TabsContent value="rules" className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Blackjack Payout</h4>
                                        <p className="text-sm text-gray-400">Payout ratio for blackjack</p>
                                    </div>
                                    <select
                                        aria-label="Blackjack Payout"
                                        value={settings.gameRules.blackjackPayout.toString()}
                                        onChange={(e) => settings.setGameRules({
                                            ...settings.gameRules,
                                            blackjackPayout: parseFloat(e.target.value) as 1.5 | 1.2 | 1
                                        })}
                                        className="p-2 bg-gray-900 border border-gray-700 rounded-md"
                                    >
                                        <option value="1.5">3:2 (1.5)</option>
                                        <option value="1.2">6:5 (1.2)</option>
                                        <option value="1">1:1</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Number of Decks</h4>
                                        <p className="text-sm text-gray-400">Number of decks in the shoe</p>
                                    </div>
                                    <select
                                        aria-label="Number of Decks"
                                        value={settings.gameRules.decksCount}
                                        onChange={(e) => settings.setGameRules({
                                            ...settings.gameRules,
                                            decksCount: parseInt(e.target.value)
                                        })}
                                        className="p-2 bg-gray-900 border border-gray-700 rounded-md"
                                    >
                                        <option value="1">1 Deck</option>
                                        <option value="2">2 Decks</option>
                                        <option value="4">4 Decks</option>
                                        <option value="6">6 Decks</option>
                                        <option value="8">8 Decks</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Dealer Hits Soft 17</h4>
                                        <p className="text-sm text-gray-400">Dealer must hit on soft 17</p>
                                    </div>
                                    <Switch
                                        checked={settings.gameRules.dealerHitsSoft17}
                                        onCheckedChange={(checked) => settings.setGameRules({
                                            ...settings.gameRules,
                                            dealerHitsSoft17: checked
                                        })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Double After Split</h4>
                                        <p className="text-sm text-gray-400">Double down allowed after splitting</p>
                                    </div>
                                    <Switch
                                        checked={settings.gameRules.doubleAfterSplit}
                                        onCheckedChange={(checked) => settings.setGameRules({
                                            ...settings.gameRules,
                                            doubleAfterSplit: checked
                                        })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Surrender</h4>
                                        <p className="text-sm text-gray-400">Player can surrender and get half bet back</p>
                                    </div>
                                    <Switch
                                        checked={settings.gameRules.surrender}
                                        onCheckedChange={(checked) => settings.setGameRules({
                                            ...settings.gameRules,
                                            surrender: checked
                                        })}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Maximum Splits</h4>
                                        <p className="text-sm text-gray-400">Maximum number of times a hand can be split</p>
                                    </div>
                                    <select
                                        aria-label="Maximum Splits"
                                        value={settings.gameRules.maxSplits}
                                        onChange={(e) => settings.setGameRules({
                                            ...settings.gameRules,
                                            maxSplits: parseInt(e.target.value)
                                        })}
                                        className="p-2 bg-gray-900 border border-gray-700 rounded-md"
                                    >
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                    </select>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="display" className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Table Color</h4>
                                        <p className="text-sm text-gray-400">Color of the game table</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            aria-label="Table Color Picker"
                                            value={settings.tableColor}
                                            onChange={(e) => settings.setTableColor(e.target.value)}
                                            className="w-10 h-10 rounded cursor-pointer"
                                        />
                                        <select
                                            aria-label="Table Color Preset"
                                            value={settings.tableColor}
                                            onChange={(e) => settings.setTableColor(e.target.value)}
                                            className="p-2 bg-gray-900 border border-gray-700 rounded-md"
                                        >
                                            <option value="#1a5f7a">Blue Felt</option>
                                            <option value="#076324">Green Felt</option>
                                            <option value="#7a1a1a">Red Felt</option>
                                            <option value="#3a3a3a">Gray Felt</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Card Style</h4>
                                        <p className="text-sm text-gray-400">Visual style of playing cards</p>
                                    </div>
                                    <select
                                        aria-label="Card Style"
                                        value={settings.cardStyle}
                                        onChange={(e) => settings.setCardStyle(e.target.value as "modern" | "classic" | "minimal" | "retro")}
                                        className="p-2 bg-gray-900 border border-gray-700 rounded-md"
                                    >
                                        <option value="modern">Modern</option>
                                        <option value="classic">Classic</option>
                                        <option value="minimal">Minimal</option>
                                        <option value="retro">Retro</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Animation Speed</h4>
                                        <p className="text-sm text-gray-400">Speed of game animations</p>
                                    </div>
                                    <select
                                        aria-label="Animation Speed"
                                        value={settings.animationSpeed}
                                        onChange={(e) => settings.setAnimationSpeed(parseFloat(e.target.value))}
                                        className="p-2 bg-gray-900 border border-gray-700 rounded-md"
                                    >
                                        <option value="0.5">Slow</option>
                                        <option value="1">Normal</option>
                                        <option value="1.5">Fast</option>
                                        <option value="2">Very Fast</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Show Player Avatars</h4>
                                        <p className="text-sm text-gray-400">Display player profile pictures</p>
                                    </div>
                                    <Switch
                                        checked={settings.showPlayerAvatars}
                                        onCheckedChange={settings.setShowPlayerAvatars}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="gameplay" className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Auto-Stand on Hard 17+</h4>
                                        <p className="text-sm text-gray-400">Automatically stand on hard 17 or higher</p>
                                    </div>
                                    <Switch
                                        checked={settings.autoStand17}
                                        onCheckedChange={settings.setAutoStand17}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Auto-Play Basic Strategy</h4>
                                        <p className="text-sm text-gray-400">Make decisions automatically according to basic strategy</p>
                                    </div>
                                    <Switch
                                        checked={settings.autoPlayBasicStrategy}
                                        onCheckedChange={settings.setAutoPlayBasicStrategy}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Show Probabilities</h4>
                                        <p className="text-sm text-gray-400">Display win/loss probabilities</p>
                                    </div>
                                    <Switch
                                        checked={settings.showProbabilities}
                                        onCheckedChange={settings.setShowProbabilities}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Show Card Counting Info</h4>
                                        <p className="text-sm text-gray-400">Display running count and true count</p>
                                    </div>
                                    <Switch
                                        checked={settings.showCountingInfo}
                                        onCheckedChange={settings.setShowCountingInfo}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Default Bet Size</h4>
                                        <p className="text-sm text-gray-400">Starting bet amount</p>
                                    </div>
                                    <input
                                        type="number"
                                        aria-label="Default Bet Size"
                                        value={settings.defaultBetSize}
                                        onChange={(e) => settings.setDefaultBetSize(parseInt(e.target.value))}
                                        min={5}
                                        max={500}
                                        step={5}
                                        className="w-24 p-2 bg-gray-900 border border-gray-700 rounded-md"
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setShowSettings(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveSettings}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Stats Dialog */}
            <Dialog open={showStats} onOpenChange={setShowStats}>
                <DialogContent className="max-w-4xl text-white bg-gray-800 border-gray-700">
                    <DialogHeader>
                        <DialogTitle>Game Statistics</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Your performance stats and analytics
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="overview" className="mt-4">
                        <TabsList className="mb-4 bg-gray-900">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="hands">Hand Results</TabsTrigger>
                            <TabsTrigger value="skills">Skill Analysis</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview">
                            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                                <Card className="bg-gray-900 border-gray-700">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Net Profit/Loss</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {formatCurrency(totalProfit)}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gray-900 border-gray-700">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Win Rate</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-blue-400">
                                            {winRate ? `${(winRate * 100).toFixed(1)}%` : '0%'}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gray-900 border-gray-700">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Hands Played</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">
                                            {totalHands}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <Card className="bg-gray-900 border-gray-700">
                                    <CardHeader>
                                        <CardTitle>Hand Outcomes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between mb-1 text-sm">
                                                    <span>Wins</span>
                                                    <span>{handsWon} ({totalHands ? ((handsWon / totalHands) * 100).toFixed(1) : 0}%)</span>
                                                </div>
                                                <Progress value={totalHands ? (handsWon / totalHands) * 100 : 0} className="h-2 bg-gray-700 [&>div]:bg-green-500" />
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-1 text-sm">
                                                    <span>Losses</span>
                                                    <span>{handsLost} ({totalHands ? ((handsLost / totalHands) * 100).toFixed(1) : 0}%)</span>
                                                </div>
                                                <Progress value={totalHands ? (handsLost / totalHands) * 100 : 0} className="h-2 bg-gray-700 [&>div]:bg-red-500" />
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-1 text-sm">
                                                    <span>Pushes</span>
                                                    <span>{handsPushed} ({totalHands ? ((handsPushed / totalHands) * 100).toFixed(1) : 0}%)</span>
                                                </div>
                                                <Progress value={totalHands ? (handsPushed / totalHands) * 100 : 0} className="h-2 bg-gray-700 [&>div]:bg-blue-500" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gray-900 border-gray-700">
                                    <CardHeader>
                                        <CardTitle>Skill Metrics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {skillMetrics?.map((metric: SkillMetric) => {
                                                // Extract nested ternary into a function
                                                const getBadgeClass = (level: string) => {
                                                    switch (level) {
                                                        case 'expert': return 'bg-indigo-600';
                                                        case 'advanced': return 'bg-green-600';
                                                        case 'intermediate': return 'bg-amber-600';
                                                        default: return 'bg-red-600';
                                                    }
                                                };

                                                const getProgressColor = (level: string) => {
                                                    switch (level) {
                                                        case 'expert': return 'bg-indigo-500';
                                                        case 'advanced': return 'bg-green-500';
                                                        case 'intermediate': return 'bg-amber-500';
                                                        default: return 'bg-red-500';
                                                    }
                                                };

                                                return (
                                                    <div key={metric.category}>
                                                        <div className="flex justify-between mb-1 text-sm">
                                                            <span>{metric.category.replace('_', ' ').replace(/^\w/, (c: string) => c.toUpperCase())}</span>
                                                            <span className="flex items-center gap-2">
                                                                <Badge className={getBadgeClass(metric.level)}>
                                                                    {metric.level}
                                                                </Badge>
                                                                {metric.score}%
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={metric.score}
                                                            className={`h-2 bg-gray-700 [&>div]:${getProgressColor(metric.level)}`}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="hands">
                            <div className="space-y-6">
                                <Card className="bg-gray-900 border-gray-700">
                                    <CardHeader>
                                        <CardTitle>Recent Hands</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {totalHands > 0 ? (
                                            <div className="text-sm">
                                                <p>Hand history coming soon!</p>
                                                <p className="mt-2 text-gray-400">Detailed hand-by-hand history with outcomes and analytics.</p>
                                            </div>
                                        ) : (
                                            <div className="py-4 text-center text-gray-400">
                                                No hands played yet
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="skills">
                            <div className="space-y-6">
                                <Card className="bg-gray-900 border-gray-700">
                                    <CardHeader>
                                        <CardTitle>Skill Development</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-400">
                                                Your skill development graph and improvement areas will appear here as you play more hands.
                                            </p>

                                            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                                                <div className="p-4 bg-gray-800 rounded-md">
                                                    <h4 className="mb-2 font-medium">Basic Strategy Accuracy</h4>
                                                    <p className="text-sm text-gray-400">
                                                        Percentage of decisions that align with basic strategy.
                                                    </p>
                                                </div>

                                                <div className="p-4 bg-gray-800 rounded-md">
                                                    <h4 className="mb-2 font-medium">Card Counting Effectiveness</h4>
                                                    <p className="text-sm text-gray-400">
                                                        How well you adjust your play based on the count.
                                                    </p>
                                                </div>

                                                <div className="p-4 bg-gray-800 rounded-md">
                                                    <h4 className="mb-2 font-medium">Bet Sizing Efficiency</h4>
                                                    <p className="text-sm text-gray-400">
                                                        Optimal bet sizing based on your advantage.
                                                    </p>
                                                </div>

                                                <div className="p-4 bg-gray-800 rounded-md">
                                                    <h4 className="mb-2 font-medium">Decision Speed</h4>
                                                    <p className="text-sm text-gray-400">
                                                        How quickly you make optimal decisions.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-6">
                        <Button onClick={() => setShowStats(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}