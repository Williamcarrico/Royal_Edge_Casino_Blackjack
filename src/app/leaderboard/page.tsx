"use client";

import React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/ui/forms/input";
import { Card } from "@/ui/layout/card";
import { Tabs, TabsList, TabsTrigger } from "@/ui/layout/tabs";
import { LoadingSpinner } from "@/ui/loading-spinner";

// Types for leaderboard data
interface LeaderboardPlayer {
    id: string;
    rank: number;
    username: string;
    avatar: string;
    winnings: number;
    winRate: number;
    gamesPlayed: number;
    biggestWin: number;
    country: string;
    isVIP: boolean;
    lastActive: string;
}

// Mock data for the leaderboard
const MOCK_PLAYERS: LeaderboardPlayer[] = [
    {
        id: "1",
        rank: 1,
        username: "RoyalFlush888",
        avatar: "/avatars/player1.jpg",
        winnings: 287650,
        winRate: 68.4,
        gamesPlayed: 1243,
        biggestWin: 25000,
        country: "US",
        isVIP: true,
        lastActive: "2 hours ago"
    },
    {
        id: "2",
        rank: 2,
        username: "BlackjackMaster",
        avatar: "/avatars/player2.jpg",
        winnings: 176320,
        winRate: 62.7,
        gamesPlayed: 967,
        biggestWin: 18500,
        country: "CA",
        isVIP: true,
        lastActive: "4 hours ago"
    },
    {
        id: "3",
        rank: 3,
        username: "AceHigh",
        avatar: "/avatars/player3.jpg",
        winnings: 145890,
        winRate: 59.2,
        gamesPlayed: 1022,
        biggestWin: 15750,
        country: "UK",
        isVIP: false,
        lastActive: "1 day ago"
    },
    {
        id: "4",
        rank: 4,
        username: "CardShark7",
        avatar: "/avatars/player4.jpg",
        winnings: 132450,
        winRate: 57.8,
        gamesPlayed: 843,
        biggestWin: 12300,
        country: "DE",
        isVIP: true,
        lastActive: "3 hours ago"
    },
    {
        id: "5",
        rank: 5,
        username: "HighRoller",
        avatar: "/avatars/player5.jpg",
        winnings: 118960,
        winRate: 55.3,
        gamesPlayed: 792,
        biggestWin: 11000,
        country: "FR",
        isVIP: false,
        lastActive: "6 hours ago"
    },
    {
        id: "6",
        rank: 6,
        username: "LuckyDraw",
        avatar: "/avatars/player6.jpg",
        winnings: 103780,
        winRate: 53.9,
        gamesPlayed: 714,
        biggestWin: 9800,
        country: "AU",
        isVIP: false,
        lastActive: "2 days ago"
    },
    {
        id: "7",
        rank: 7,
        username: "JackpotKing",
        avatar: "/avatars/player7.jpg",
        winnings: 94250,
        winRate: 52.1,
        gamesPlayed: 689,
        biggestWin: 8500,
        country: "JP",
        isVIP: true,
        lastActive: "5 hours ago"
    },
    {
        id: "8",
        rank: 8,
        username: "FullHouse",
        avatar: "/avatars/player8.jpg",
        winnings: 86730,
        winRate: 51.4,
        gamesPlayed: 645,
        biggestWin: 7800,
        country: "IT",
        isVIP: false,
        lastActive: "12 hours ago"
    },
    {
        id: "9",
        rank: 9,
        username: "BlackjackPro",
        avatar: "/avatars/player9.jpg",
        winnings: 79880,
        winRate: 50.2,
        gamesPlayed: 612,
        biggestWin: 7200,
        country: "ES",
        isVIP: false,
        lastActive: "1 day ago"
    },
    {
        id: "10",
        rank: 10,
        username: "GoldCards",
        avatar: "/avatars/player10.jpg",
        winnings: 72650,
        winRate: 49.8,
        gamesPlayed: 589,
        biggestWin: 6700,
        country: "BR",
        isVIP: true,
        lastActive: "8 hours ago"
    }
];

// Filter types for the leaderboard
type FilterPeriod = "daily" | "weekly" | "monthly" | "allTime";
type SortOption = "winnings" | "winRate" | "gamesPlayed" | "biggestWin";

export default function LeaderboardPage() {
    const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("weekly");
    const [sortBy, setSortBy] = useState<SortOption>("winnings");
    const [searchQuery, setSearchQuery] = useState("");

    // Simulate fetching data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Filter and sort the mock data based on current filters
            let filteredPlayers = [...MOCK_PLAYERS];

            // Apply search filter if any
            if (searchQuery) {
                filteredPlayers = filteredPlayers.filter(player =>
                    player.username.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // Sort based on selected option
            filteredPlayers.sort((a, b) => {
                if (sortBy === "winnings") return b.winnings - a.winnings;
                if (sortBy === "winRate") return b.winRate - a.winRate;
                if (sortBy === "gamesPlayed") return b.gamesPlayed - a.gamesPlayed;
                if (sortBy === "biggestWin") return b.biggestWin - a.biggestWin;
                return 0;
            });

            // Update ranks based on new sorting
            filteredPlayers = filteredPlayers.map((player, index) => ({
                ...player,
                rank: index + 1
            }));

            setPlayers(filteredPlayers);
            setIsLoading(false);
        };

        fetchData();
    }, [filterPeriod, sortBy, searchQuery]);

    // Format number to currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Get rank style based on player rank
    const getRankStyle = (rank: number) => {
        if (rank === 1) return "bg-gradient-to-br from-yellow-400 to-amber-600 text-black";
        if (rank === 2) return "bg-gradient-to-br from-gray-300 to-gray-500 text-black";
        if (rank === 3) return "bg-gradient-to-br from-amber-700 to-amber-900 text-white";
        return "bg-black-50 text-white";
    };

    return (
        <div className="container px-4 pb-12 mx-auto pt-36 max-w-7xl">
            {/* Animated page header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-12 text-center"
            >
                <h1 className="mb-4 font-serif text-5xl font-bold text-transparent md:text-6xl bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">
                    Royal Leaderboard
                </h1>
                <p className="max-w-3xl mx-auto text-lg text-red-600 md:text-xl text-muted-foreground">
                    Discover the elite players who have mastered the art of Blackjack and climbed to the top of our rankings. Will you be the next to join their prestigious ranks?
                </p>
            </motion.div>

            {/* Filters and search bar */}
            <div className="p-6 mb-8 glass rounded-xl backdrop-blur-lg">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <div className="w-full md:w-1/3">
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Search players..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-6 pl-12 pr-4 text-white placeholder-gray-400 rounded-lg bg-black-10 border-primary-10 focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <svg
                                className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-4 top-1/2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center w-full gap-4 md:w-auto md:justify-end">
                        <Tabs value={filterPeriod} onValueChange={(val) => setFilterPeriod(val as FilterPeriod)} className="w-full md:w-auto">
                            <TabsList className="grid grid-cols-4 w-full md:w-[400px] font-serif font-semibold border-1 bg-black-10">
                                <TabsTrigger value="daily">Daily</TabsTrigger>
                                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                                <TabsTrigger value="allTime">All Time</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <Tabs value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)} className="w-full md:w-auto">
                            <TabsList className="grid grid-cols-4 w-full md:w-[450px] font-serif font-semibold border-1 bg-black-10">
                                <TabsTrigger value="winnings">Winnings</TabsTrigger>
                                <TabsTrigger value="winRate">Win Rate</TabsTrigger>
                                <TabsTrigger value="gamesPlayed">Games</TabsTrigger>
                                <TabsTrigger value="biggestWin">Biggest Win</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* Leaderboard Table */}
            <Card className="overflow-hidden border shadow-lg bg-black-10 border-primary-10 rounded-xl">
                {/* Table Header */}
                <div className="p-4 text-white border-b bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-primary-20">
                    <div className="grid grid-cols-12 gap-4 text-sm font-semibold">
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-3 md:col-span-3">Player</div>
                        <div className="col-span-2 text-right">Winnings</div>
                        <div className="hidden col-span-2 text-right md:block">Win Rate</div>
                        <div className="hidden col-span-2 text-right md:block">Games</div>
                        <div className="hidden col-span-2 text-right md:block">Biggest Win</div>
                        <div className="col-span-2 text-right md:col-span-2">Last Active</div>
                    </div>
                </div>

                {/* Table Body */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    <div className="divide-y divide-primary-10">
                        <AnimatePresence>
                            {players.length > 0 ? (
                                players.map((player, index) => (
                                    <motion.div
                                        key={player.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className={cn(
                                            "grid grid-cols-12 gap-4 p-4 items-center hover:bg-black-30 transition-colors duration-200",
                                            player.rank <= 3 ? "bg-black-30" : ""
                                        )}
                                    >
                                        {/* Rank */}
                                        <div className="col-span-1 text-center">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                                getRankStyle(player.rank)
                                            )}>
                                                {player.rank}
                                            </div>
                                        </div>

                                        {/* Player Info */}
                                        <div className="flex items-center col-span-3 gap-3 md:col-span-3">
                                            <div className="relative">
                                                <div className="w-10 h-10 overflow-hidden rounded-full bg-black-50">
                                                    {/* Use a placeholder gradient for avatars since we don't have actual images */}
                                                    <div className="w-full h-full bg-gradient-to-br from-primary-foreground to-accent-foreground" />
                                                </div>
                                                {player.isVIP && (
                                                    <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[8px] px-1 rounded-sm font-bold">
                                                        VIP
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white truncate max-w-[140px] md:max-w-[200px]">
                                                    {player.username}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {player.country}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Winnings */}
                                        <div className="col-span-2 font-mono font-medium text-right">
                                            <span className={cn(
                                                player.rank <= 3 ? "text-amber-400" : "text-white"
                                            )}>
                                                {formatCurrency(player.winnings)}
                                            </span>
                                        </div>

                                        {/* Win Rate */}
                                        <div className="hidden col-span-2 text-right md:block">
                                            <div className="flex items-center justify-end">
                                                <div className="relative w-24 h-2 mr-2 overflow-hidden rounded-full bg-black-30">
                                                    <div
                                                        className={`absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent w-[${player.winRate}%]`}
                                                    />
                                                </div>
                                                <span className="text-sm">{player.winRate}%</span>
                                            </div>
                                        </div>

                                        {/* Games Played */}
                                        <div className="hidden col-span-2 text-sm text-right md:block">
                                            {player.gamesPlayed}
                                        </div>

                                        {/* Biggest Win */}
                                        <div className="hidden col-span-2 font-mono text-sm text-right md:block">
                                            {formatCurrency(player.biggestWin)}
                                        </div>

                                        {/* Last Active */}
                                        <div className="col-span-2 text-xs text-right md:col-span-2">
                                            <span className="text-muted-foreground">
                                                {player.lastActive}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-16 text-center"
                                >
                                    <p className="text-muted-foreground">No players found matching your search criteria.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </Card>

            {/* Additional Information Section */}
            <div className="grid grid-cols-1 gap-6 mt-12 md:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="p-6 glass rounded-xl"
                >
                    <h3 className="mb-2 text-xl font-bold text-amber-400">How Rankings Work</h3>
                    <p className="text-sm text-muted-foreground">
                        Our leaderboard rankings are calculated based on a sophisticated algorithm that considers winnings, win rate,
                        game participation, and bet sizes. Rankings are updated in real-time as games are played.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="p-6 glass rounded-xl"
                >
                    <h3 className="mb-2 text-xl font-bold text-amber-400">VIP Status</h3>
                    <p className="text-sm text-muted-foreground">
                        Players with VIP status receive exclusive benefits including enhanced rewards, prioritized withdrawals,
                        and access to special high-stakes tables. Reach $100,000 in gameplay to qualify.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="p-6 glass rounded-xl"
                >
                    <h3 className="mb-2 text-xl font-bold text-amber-400">Monthly Rewards</h3>
                    <p className="text-sm text-muted-foreground">
                        Top 10 players at the end of each month receive special rewards including cash bonuses,
                        exclusive tournament entries, and limited-edition digital collectibles to showcase your status.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}