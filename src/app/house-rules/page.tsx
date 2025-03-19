// app/house-rules/page.tsx
'use client';

/// <reference types="react" />
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/layout/card';
import { Separator } from '@/ui/layout/separator';
import { ScrollArea } from '@/ui/layout/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/layout/tabs';
import { Button } from '@/ui/layout/button';
import { Badge } from '@/ui/player/badge';
import {
    Tooltip,
    TooltipProvider,
    TooltipContent,
    TooltipTrigger
} from '@/ui/tooltip';
import {
    InfoIcon,
    FilterIcon,
    ArrowUpIcon,
    BookOpenIcon,
    DollarSignIcon,
    UserIcon,
    ShieldIcon,
    SearchIcon,
    ChevronDownIcon,
    ArrowRightIcon,
    TrophyIcon
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import styles from '@/styles/house-rules.module.css';

// Define types for rules data
interface Rule {
    id: string;
    title: string;
    description: string;
    category: 'basic' | 'payout' | 'dealer' | 'player';
    details?: string[];
}

// Animation variants for framer-motion
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

// Expandable rule card component
const ExpandableRuleCard = ({ rule }: { rule: Rule }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            variants={itemVariants}
            className={cn(
                "relative overflow-hidden border rounded-lg",
                "bg-gray-800/60 border-gray-700 hover:border-gray-600",
                "transition-all duration-300"
            )}
        >
            <div className="w-full p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-white">{rule.title}</h3>
                    <Badge className={cn(
                        rule.category === 'basic' && "bg-blue-900/30 text-blue-300",
                        rule.category === 'payout' && "bg-green-900/30 text-green-300",
                        rule.category === 'dealer' && "bg-purple-900/30 text-purple-300",
                        rule.category === 'player' && "bg-amber-900/30 text-amber-300"
                    )}>
                        {rule.category}
                    </Badge>
                </div>
                <p className="text-sm text-gray-300">{rule.description}</p>

                {rule.details && rule.details.length > 0 && (
                    <div className="flex items-center gap-1 mt-3">
                        <Button
                            variant="link"
                            className="h-auto p-0 text-amber-400 hover:text-amber-300"
                            onClick={() => setIsExpanded(!isExpanded)}
                            aria-expanded={isExpanded ? "true" : "false"}
                            aria-controls={`details-${rule.id}`}
                        >
                            {isExpanded ? 'Hide details' : 'Show details'}
                        </Button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isExpanded && rule.details && (
                    <motion.div
                        id={`details-${rule.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4"
                    >
                        <Separator className="my-3 bg-gray-700/50" />
                        <ul className="pl-5 mt-2 space-y-2 text-sm text-gray-300">
                            {rule.details.map((detail, idx) => (
                                <li key={`${rule.id}-detail-${idx}-${detail.substring(0, 10).replace(/\s/g, '')}`} className="list-disc">
                                    {detail}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Sample rules data
const rules: Rule[] = [
    {
        id: "basic-1",
        title: "Game Objective",
        description: "Beat the dealer's hand without going over 21.",
        category: "basic",
        details: [
            "Cards 2-10 are worth face value",
            "Face cards (J, Q, K) are worth 10 points",
            "Aces can be worth 1 or 11 points",
            "Player wins if their hand is closer to 21 than the dealer's"
        ]
    },
    {
        id: "payout-1",
        title: "Blackjack Payout",
        description: "Natural blackjack pays 3:2 on all tables",
        category: "payout",
        details: [
            "A blackjack is an ace with a 10, J, Q or K",
            "If dealer also has blackjack, it's a push (tie)",
            "Insurance pays 2:1 when dealer has blackjack"
        ]
    },
    {
        id: "dealer-1",
        title: "Dealer Rules",
        description: "Dealer must hit on soft 17",
        category: "dealer",
        details: [
            "Dealer stands on hard 17 or higher",
            "Dealer hits on 16 or lower",
            "Dealer must follow these rules - no choices"
        ]
    },
    {
        id: "player-1",
        title: "Splitting Pairs",
        description: "Players may split pairs up to three times",
        category: "player",
        details: [
            "Split aces receive only one card each",
            "Ten-value cards can be split even if not identical (e.g., K-Q)",
            "Each split hand is played independently"
        ]
    }
];

// Category icons and colors for UI
const categoryIcons = {
    all: <InfoIcon className="w-5 h-5" />,
    basic: <BookOpenIcon className="w-5 h-5" />,
    payout: <DollarSignIcon className="w-5 h-5" />,
    dealer: <ShieldIcon className="w-5 h-5" />,
    player: <UserIcon className="w-5 h-5" />
};

export default function HouseRulesPage() {
    const [selectedCategory, setSelectedCategory] = useState<Rule['category'] | 'all'>('all');
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isShowcaseVisible, setIsShowcaseVisible] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);
    const showcaseRef = useRef<HTMLDivElement>(null);

    // Generate stable decorative elements with unique keys
    const decorativeCards = useMemo(() =>
        Array.from({ length: 12 }).map((_, index) => ({
            id: `card-${Math.random().toString(36).substring(2, 9)}`,
            styleIndex: index % 4
        })),
        []);

    const decorativeChips = useMemo(() =>
        Array.from({ length: 20 }).map((_, index) => ({
            id: `chip-${Math.random().toString(36).substring(2, 9)}`,
            styleIndex: index % 4
        })),
        []);

    // Handle scroll events
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 200);

            // Update header parallax effect
            if (headerRef.current) {
                const scrollY = window.scrollY;
                const opacity = Math.max(1 - scrollY / 300, 0);
                const translateY = scrollY * 0.4;

                headerRef.current.style.setProperty('--scroll-y', `${translateY}px`);
                headerRef.current.style.setProperty('--header-opacity', opacity.toString());
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle showcase visibility
    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setIsShowcaseVisible(true);
                    observer.disconnect();
                }
            });
        }, options);

        if (showcaseRef.current) {
            observer.observe(showcaseRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Filter rules by category and search query
    const filteredRules = rules.filter(rule => {
        const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rule.details?.some(detail => detail.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesSearch;
    });

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen overflow-hidden text-white bg-gradient-to-b from-gray-900 via-gray-900 to-black">
            {/* Decorative Cards Background */}
            <div className={styles.decorativeCardsContainer}>
                {decorativeCards.map((card) => (
                    <div
                        key={card.id}
                        className={cn(styles.decorativeCard, styles[`card${card.styleIndex}`])}
                    />
                ))}
            </div>

            {/* Header Section */}
            <div className="relative">
                <div className={cn(styles.redGradient)} />
                <div className={cn(styles.amberGradient)} />
                <div
                    ref={headerRef}
                    className={cn(
                        "relative z-10 flex flex-col items-center justify-center px-4 py-24 text-center",
                        styles.headerSection
                    )}
                >
                    <Badge variant="outline" className="px-3 py-1 mb-4 backdrop-blur-sm bg-black/10 border-zinc-700">
                        House Rules
                    </Badge>
                    <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                        Blackjack Rules
                    </h1>
                    <p className="max-w-3xl text-lg md:text-xl text-zinc-200">
                        Learn the basic rules and betting options for our premium Blackjack tables.
                        Royal Edge Casino offers the best odds and professional dealers.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container relative z-10 px-4 mx-auto mb-16 -mt-16">
                <Card className="overflow-hidden border-gray-800 shadow-2xl backdrop-blur-sm bg-gray-900/80">
                    <CardHeader className="p-6 lg:p-8">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3">
                                <InfoIcon className="w-6 h-6 text-red-500" />
                                <CardTitle className="text-2xl font-bold md:text-3xl">
                                    Official Blackjack Rules
                                </CardTitle>
                            </div>

                            {/* Search & Filter Controls */}
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <div className="relative">
                                    <SearchIcon className="absolute w-4 h-4 text-gray-500 transform -translate-y-1/2 left-3 top-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search rules..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full py-2 pr-4 text-sm text-gray-200 border border-gray-700 rounded-md pl-9 bg-gray-800/60 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                                        aria-label="Search rules"
                                    />
                                </div>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="relative">
                                                <FilterIcon className="absolute w-4 h-4 text-gray-500 transform -translate-y-1/2 left-3 top-1/2" />
                                                <select
                                                    className="w-full py-2 pr-4 text-sm text-gray-200 border border-gray-700 rounded-md appearance-none pl-9 bg-gray-800/60 focus:outline-none focus:ring-2 focus:ring-red-600/50"
                                                    value={selectedCategory}
                                                    onChange={(e) => setSelectedCategory(e.target.value as Rule['category'] | 'all')}
                                                    aria-label="Filter rules by category"
                                                >
                                                    <option value="all">All Categories</option>
                                                    <option value="basic">Basic Rules</option>
                                                    <option value="payout">Payouts</option>
                                                    <option value="dealer">Dealer Rules</option>
                                                    <option value="player">Player Rules</option>
                                                </select>
                                                <ChevronDownIcon className="absolute w-4 h-4 text-gray-500 transform -translate-y-1/2 right-3 top-1/2" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            <p>Filter rules by category</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>

                        <Separator className="my-6 bg-gray-800" />

                        {/* Category Selection Pills */}
                        <div className="flex flex-wrap gap-2 pb-2">
                            {(['all', 'basic', 'payout', 'dealer', 'player'] as const).map((category) => (
                                <motion.button
                                    key={category}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedCategory(category)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                                        selectedCategory === category
                                            ? "bg-red-900/60 text-white border border-red-700/50"
                                            : "bg-gray-800/50 text-gray-300 border border-gray-700/50 hover:bg-gray-700/50"
                                    )}
                                >
                                    {categoryIcons[category]}
                                    <span>{category === 'all' ? 'All Rules' : `${category.charAt(0).toUpperCase() + category.slice(1)} Rules`}</span>
                                </motion.button>
                            ))}
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 pt-0 lg:p-8">
                        <Tabs defaultValue="grid">
                            <div className="flex justify-end mb-4">
                                <TabsList className="border border-gray-700 bg-gray-800/60">
                                    <TabsTrigger value="grid" className="data-[state=active]:bg-gray-700">Grid</TabsTrigger>
                                    <TabsTrigger value="list" className="data-[state=active]:bg-gray-700">List</TabsTrigger>
                                    <TabsTrigger value="strategy" className="data-[state=active]:bg-gray-700">Strategy</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="grid">
                                <ScrollArea className="h-[600px] pr-4 overflow-y-auto">
                                    {filteredRules.length > 0 ? (
                                        <motion.div
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="show"
                                            className="grid grid-cols-1 gap-6 md:grid-cols-2"
                                        >
                                            {filteredRules.map((rule) => (
                                                <ExpandableRuleCard key={rule.id} rule={rule} />
                                            ))}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-col items-center justify-center h-40 text-center"
                                        >
                                            <p className="mb-4 text-gray-400">No rules match your search criteria</p>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setSelectedCategory('all');
                                                }}
                                                className="text-sm"
                                            >
                                                Reset Filters
                                            </Button>
                                        </motion.div>
                                    )}
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="list">
                                <ScrollArea className="h-[600px] pr-4 overflow-y-auto">
                                    {filteredRules.length > 0 ? (
                                        <motion.div
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="show"
                                            className="space-y-4"
                                        >
                                            {filteredRules.map((rule) => (
                                                <motion.div
                                                    key={rule.id}
                                                    variants={itemVariants}
                                                    className="p-4 transition-colors border border-gray-800 rounded-lg bg-gray-800/50 hover:bg-gray-800/80"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-lg font-medium text-white">{rule.title}</h3>
                                                        <div className="flex gap-2">
                                                            <Badge className={cn(
                                                                rule.category === 'basic' && "bg-blue-900/30 text-blue-300",
                                                                rule.category === 'payout' && "bg-green-900/30 text-green-300",
                                                                rule.category === 'dealer' && "bg-purple-900/30 text-purple-300",
                                                                rule.category === 'player' && "bg-amber-900/30 text-amber-300"
                                                            )}>
                                                                {rule.category}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <p className="mb-2 text-sm text-gray-300">{rule.description}</p>
                                                    <div className="text-xs text-gray-400">
                                                        {rule.details && rule.details.length > 0 && (
                                                            <div>
                                                                <Button
                                                                    variant="link"
                                                                    className="h-auto p-0 text-amber-400 hover:text-amber-300"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const element = document.getElementById(`details-${rule.id}`);
                                                                        if (element) {
                                                                            element.classList.toggle('hidden');
                                                                        }
                                                                    }}
                                                                >
                                                                    Show details
                                                                </Button>
                                                                <ul id={`details-${rule.id}`} className="hidden pl-4 mt-2 space-y-1">
                                                                    {rule.details.map((detail, idx) => (
                                                                        <li key={`${rule.id}-detail-${idx}-${detail.substring(0, 10).replace(/\s/g, '')}`} className="list-disc list-inside">
                                                                            {detail}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-col items-center justify-center h-40 text-center"
                                        >
                                            <p className="mb-4 text-gray-400">No rules match your search criteria</p>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setSelectedCategory('all');
                                                }}
                                                className="text-sm"
                                            >
                                                Reset Filters
                                            </Button>
                                        </motion.div>
                                    )}
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="strategy">
                                <ScrollArea className="h-[600px] pr-4 overflow-y-auto">
                                    <motion.div
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="show"
                                        className="space-y-8"
                                    >
                                        <div className="mb-6 text-center">
                                            <h2 className="mb-2 text-2xl font-bold text-white">Basic Blackjack Strategy</h2>
                                            <p className="text-gray-300">Master these 30 simple phrases to optimize your gameplay</p>
                                        </div>

                                        {/* Strategy Categories */}
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            {/* Surrenders */}
                                            <motion.div
                                                variants={itemVariants}
                                                className="p-5 border rounded-lg bg-red-900/20 border-red-800/30"
                                            >
                                                <div className="flex items-center gap-2 mb-4">
                                                    <ShieldIcon className="w-5 h-5 text-red-400" />
                                                    <h3 className="text-xl font-semibold text-white">Surrenders</h3>
                                                </div>
                                                <ul className="space-y-2">
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-red-400">•</span>
                                                        <span>16 surrenders against dealer 9 through Ace, otherwise don&apos;t surrender (revert to hard totals).</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-red-400">•</span>
                                                        <span>15 surrenders against dealer 10, otherwise don&apos;t surrender (revert to hard totals).</span>
                                                    </li>
                                                </ul>
                                            </motion.div>

                                            {/* Splits */}
                                            <motion.div
                                                variants={itemVariants}
                                                className="p-5 border rounded-lg bg-blue-900/20 border-blue-800/30"
                                            >
                                                <div className="flex items-center gap-2 mb-4">
                                                    <UserIcon className="w-5 h-5 text-blue-400" />
                                                    <h3 className="text-xl font-semibold text-white">Splits</h3>
                                                </div>
                                                <ul className="space-y-2">
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-blue-400">•</span>
                                                        <span>Always split aces.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-blue-400">•</span>
                                                        <span>Never split tens.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-blue-400">•</span>
                                                        <span>A pair of 9&apos;s splits against dealer 2 through 9, except for 7, otherwise stand.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-blue-400">•</span>
                                                        <span>Always split 8&apos;s.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-blue-400">•</span>
                                                        <span>A pair of 7&apos;s splits against dealer 2 through 7, otherwise hit.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-blue-400">•</span>
                                                        <span>A pair of 6&apos;s splits against dealer 2 through 6, otherwise hit.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-blue-400">•</span>
                                                        <span>A pair of 5&apos;s doubles against dealer 2 through 9, otherwise hit.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-blue-400">•</span>
                                                        <span>A pair of 4&apos;s splits against dealer 5 and 6, otherwise hit.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-blue-400">•</span>
                                                        <span>A pair of 3&apos;s splits against dealer 2 through 7, otherwise hit.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-blue-400">•</span>
                                                        <span>A pair of 2&apos;s splits against dealer 2 through 7, otherwise hit.</span>
                                                    </li>
                                                </ul>
                                            </motion.div>

                                            {/* Soft Totals */}
                                            <motion.div
                                                variants={itemVariants}
                                                className="p-5 border rounded-lg bg-green-900/20 border-green-800/30"
                                            >
                                                <div className="flex items-center gap-2 mb-4">
                                                    <DollarSignIcon className="w-5 h-5 text-green-400" />
                                                    <h3 className="text-xl font-semibold text-white">Soft Totals</h3>
                                                </div>
                                                <p className="mb-3 text-sm text-gray-300">A soft total is any hand that has an Ace as one of the first two cards, the ace counts as 11 to start.</p>
                                                <ul className="space-y-2">
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-green-400">•</span>
                                                        <span>Soft 20 (A,9) always stands.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-green-400">•</span>
                                                        <span>Soft 19 (A,8) doubles against dealer 6, otherwise stand.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-green-400">•</span>
                                                        <span>Soft 18 (A,7) doubles against dealer 2 through 6, and hits against 9 through Ace, otherwise stand.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-green-400">•</span>
                                                        <span>Soft 17 (A,6) doubles against dealer 3 through 6, otherwise hit.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-green-400">•</span>
                                                        <span>Soft 16 (A,5) doubles against dealer 4 through 6, otherwise hit.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-green-400">•</span>
                                                        <span>Soft 15 (A,4) doubles against dealer 4 through 6, otherwise hit.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-green-400">•</span>
                                                        <span>Soft 14 (A,3) doubles against dealer 5 through 6, otherwise hit.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-green-400">•</span>
                                                        <span>Soft 13 (A,2) doubles against dealer 5 through 6, otherwise hit.</span>
                                                    </li>
                                                </ul>
                                            </motion.div>

                                            {/* Hard Totals */}
                                            <motion.div
                                                variants={itemVariants}
                                                className="p-5 border rounded-lg bg-amber-900/20 border-amber-800/30"
                                            >
                                                <div className="flex items-center gap-2 mb-4">
                                                    <TrophyIcon className="w-5 h-5 text-amber-400" />
                                                    <h3 className="text-xl font-semibold text-white">Hard Totals</h3>
                                                </div>
                                                <p className="mb-3 text-sm text-gray-300">A hard total is any hand that does not start with an ace in it, or it has been dealt an ace that can only be counted as 1 instead of 11.</p>
                                                <ul className="space-y-2">
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-amber-400">•</span>
                                                        <span>17 and up always stands.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-amber-400">•</span>
                                                        <span>16 stands against dealer 2 through 6, otherwise hit.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-amber-400">•</span>
                                                        <span>15 stands against dealer 2 through 6, otherwise hit.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-amber-400">•</span>
                                                        <span>14 stands against dealer 2 through 6, otherwise hit.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-amber-400">•</span>
                                                        <span>13 stands against dealer 2 through 6, otherwise hit.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-amber-400">•</span>
                                                        <span>12 stands against dealer 4 through 6, otherwise hit.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-amber-400">•</span>
                                                        <span>11 always doubles.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-amber-400">•</span>
                                                        <span>10 doubles against dealer 2 through 9 otherwise hit.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-amber-400">•</span>
                                                        <span>9 doubles against dealer 3 through 6 otherwise hit.</span>
                                                    </li>
                                                    <li className="flex items-start gap-2 text-gray-200">
                                                        <span className="mt-1 text-amber-400">•</span>
                                                        <span>8 always hits.</span>
                                                    </li>
                                                </ul>
                                            </motion.div>

                                            {/* Special Actions */}
                                            <motion.div
                                                variants={itemVariants}
                                                className="p-5 border rounded-lg bg-purple-900/20 border-purple-800/30 md:col-span-2"
                                            >
                                                <div className="flex items-center gap-2 mb-4">
                                                    <BookOpenIcon className="w-5 h-5 text-purple-400" />
                                                    <h3 className="text-xl font-semibold text-white">Special Actions</h3>
                                                </div>
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    <div>
                                                        <h4 className="mb-2 font-semibold text-white">Split</h4>
                                                        <p className="mb-3 text-sm text-gray-200">
                                                            If the first two cards are a pair, the players are allowed to split those, thus creating two hands rather than the normal one per seat. To fund the split, the player has to place a second bet, of equal value to the first.
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="mb-2 font-semibold text-white">Double Down</h4>
                                                        <p className="mb-3 text-sm text-gray-200">
                                                            After receiving the first two cards, players can double their bet while hitting. When doubling down, player receives one extra card only and cannot hit again. Most casinos allow cards to be split again if the second card makes another pair - but some have limits on the number of times a player can split.
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="mb-2 font-semibold text-white">Insurance</h4>
                                                        <p className="mb-3 text-sm text-gray-200">
                                                            Insurance is a side bet, which is offered to the players when the dealer&apos;s up card is an ace. It insures the player against the dealer having a &apos;blackjack&apos; and gives them a chance to break even on the hand, if the dealer&apos;s cards total 21. Insurance is offered before the dealer checks their face-down card.
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="mb-2 font-semibold text-white">Surrender</h4>
                                                        <p className="mb-3 text-sm text-gray-200">
                                                            If a player believes they will be unable to beat dealer&apos;s hand, they can choose to &apos;surrender&apos;. In this strategy, players fold the hand, and risk loosing only half of the bet, rather than the whole amount. A player can only forfeit their hand before receiving extra cards.
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* House Edge */}
                                            <motion.div
                                                variants={itemVariants}
                                                className="p-5 border rounded-lg bg-gray-800/60 border-gray-700/50 md:col-span-2"
                                            >
                                                <div className="flex items-center gap-2 mb-4">
                                                    <InfoIcon className="w-5 h-5 text-gray-400" />
                                                    <h3 className="text-xl font-semibold text-white">House Edge by Deck Count</h3>
                                                </div>
                                                <p className="mb-4 text-sm text-gray-300">The increase in house edge per unit increase in the number of decks is most dramatic when comparing the single-deck game to the two-deck game, and becomes progressively smaller as more decks are added.</p>

                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr className="border-b border-gray-700 bg-gray-800/80">
                                                                <th className="px-4 py-3 text-gray-300">Number of decks</th>
                                                                <th className="px-4 py-3 text-gray-300">House advantage</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-800">
                                                            <tr className="hover:bg-gray-800/40">
                                                                <td className="px-4 py-3 text-white">Single deck</td>
                                                                <td className="px-4 py-3 text-green-400">0.17%</td>
                                                            </tr>
                                                            <tr className="hover:bg-gray-800/40">
                                                                <td className="px-4 py-3 text-white">Double deck</td>
                                                                <td className="px-4 py-3 text-green-400">0.46%</td>
                                                            </tr>
                                                            <tr className="hover:bg-gray-800/40">
                                                                <td className="px-4 py-3 text-white">Four decks</td>
                                                                <td className="px-4 py-3 text-green-400">0.60%</td>
                                                            </tr>
                                                            <tr className="hover:bg-gray-800/40">
                                                                <td className="px-4 py-3 text-white">Six decks</td>
                                                                <td className="px-4 py-3 text-green-400">0.64%</td>
                                                            </tr>
                                                            <tr className="hover:bg-gray-800/40">
                                                                <td className="px-4 py-3 text-white">Eight decks</td>
                                                                <td className="px-4 py-3 text-green-400">0.66%</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Scroll to Top Button */}
                <AnimatePresence>
                    {showScrollTop && (
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed z-50 p-3 text-white rounded-full shadow-lg bottom-8 right-8 bg-red-900/80 hover:bg-red-800 focus:outline-none"
                            onClick={scrollToTop}
                            aria-label="Scroll to top"
                        >
                            <ArrowUpIcon className="w-5 h-5" />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Decorative chips */}
                <div className={styles.decorativeChipsContainer}>
                    {decorativeChips.map((chip) => (
                        <div
                            key={chip.id}
                            className={cn(styles.decorativeChip, styles[`chip${chip.styleIndex}`])}
                        />
                    ))}
                </div>

                {/* Showcase section */}
                <div
                    ref={showcaseRef}
                    className="relative max-w-4xl p-6 mx-auto mt-12 overflow-hidden border bg-gradient-to-br from-red-950/40 to-amber-950/40 backdrop-blur-md rounded-xl md:p-8 border-zinc-800"
                >
                    <motion.h2
                        className="flex items-center gap-2 mb-6 text-2xl font-bold text-white md:text-3xl"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <TrophyIcon className="w-6 h-6 text-amber-500" />
                        Premium Tables
                    </motion.h2>

                    <motion.div
                        className="relative z-10"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="flex flex-col items-center gap-6 md:flex-row">
                            <div className="w-full overflow-hidden rounded-lg md:w-1/3 aspect-video bg-zinc-800">
                                <div className="w-full h-full bg-gradient-to-r from-zinc-900 to-zinc-800 animate-pulse"></div>
                            </div>
                            <div className="w-full md:w-2/3">
                                <p className="mb-4 text-zinc-300">
                                    Royal Edge Casino offers premium blackjack tables with professional dealers and the best odds in town. Our tables are open 24/7 for your gaming pleasure.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Badge className="text-white bg-red-900/60 hover:bg-red-900">$25 Minimum</Badge>
                                    <Badge className="text-white bg-amber-900/60 hover:bg-amber-900">$1000 Maximum</Badge>
                                    <Badge className="text-white bg-zinc-800/60 hover:bg-zinc-800">VIP Rooms Available</Badge>
                                    <Badge className="text-white bg-zinc-800/60 hover:bg-zinc-800">Tournament Events</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center mt-6 md:justify-end">
                            <Button variant="secondary" className="bg-amber-600/20 text-amber-500 hover:bg-amber-600/30 border-amber-700/50">
                                Book a Table <ArrowRightIcon className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </motion.div>

                    {isShowcaseVisible && (
                        <motion.div
                            className="absolute top-0 right-0 w-1/2 h-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                        >
                            <div className="w-full h-full bg-gradient-to-l from-amber-500/10 to-transparent"></div>
                        </motion.div>
                    )}
                </div>

                <footer className="py-6 text-sm text-center text-gray-500">
                    © {new Date().getFullYear()} House Edge Blackjack. All rights reserved.
                </footer>
            </div>
        </div>
    );
}