// app/responsible-gaming/page.tsx
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import {
    Shield,
    Clock,
    Ban,
    HeartHandshake,
    Phone,
    AlertCircle,
    ExternalLink,
    ChevronRight,
    Settings,
    LifeBuoy,
    PieChart,
    Calendar,
    Sparkles
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
    CardFooter
} from '@/ui/layout/card';
import { Button } from '@/ui/layout/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/ui/forms/accordion';
import { Badge } from '@/ui/player/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/layout/tabs';
import { Separator } from '@/ui/layout/separator';
import { Progress } from '@/ui/layout/progress';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/ui/tooltip';

// Animation variants
const pageVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.6,
            staggerChildren: 0.12,
            delayChildren: 0.1
        }
    }
};

const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 100 }
    },
    hover: {
        scale: 1.02,
        boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.2)",
        borderColor: "rgba(var(--primary-rgb), 0.5)",
    }
};

const staggeredItemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: [0.645, 0.045, 0.355, 1.000]
        }
    })
};

const glowVariants = {
    initial: { opacity: 0.3 },
    animate: {
        opacity: [0.3, 0.6, 0.3],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

// Component data
const guidelines = [
    {
        icon: Clock,
        title: "Set Time Boundaries",
        description: "Establish and adhere to predetermined gaming sessions to maintain a refined balance in your leisure activities.",
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        stat: "78% of distinguished players who set time boundaries report enhanced gaming satisfaction"
    },
    {
        icon: Ban,
        title: "Master Your Limits",
        description: "Exercise restraint by never pursuing losses or exceeding your planned budget. Elegance in gaming begins with self-discipline.",
        color: "text-rose-500",
        bgColor: "bg-rose-500/10",
        stat: "Strategic cessation reduces problematic gaming patterns by 63% among elite players"
    },
    {
        icon: Shield,
        title: "Maintain Sovereignty",
        description: "View gaming as a sophisticated entertainment pursuit, never as a financial venture or recovery mechanism.",
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        stat: "92% of connoisseur players maintain gaming as pure entertainment"
    },
    {
        icon: HeartHandshake,
        title: "Embrace Support",
        description: "Demonstrate true wisdom by seeking guidance when gaming begins to influence your wellbeing, relationships, or financial standing.",
        color: "text-sky-500",
        bgColor: "bg-sky-500/10",
        stat: "Early intervention enhances positive outcomes by 84% among discerning players"
    }
];

const selfAssessment = [
    {
        id: "question-1",
        question: "Do you engage in gaming as an escape from challenges or to alleviate feelings of disquietude?",
        risk: "high"
    },
    {
        id: "question-2",
        question: "Have you attempted to curtail or cease your gaming activities without success?",
        risk: "high"
    },
    {
        id: "question-3",
        question: "Do you find yourself dedicating more time or resources to gaming than initially intended?",
        risk: "medium"
    },
    {
        id: "question-4",
        question: "Have you sought financial arrangements or liquidated assets to facilitate your gaming activities?",
        risk: "high"
    },
    {
        id: "question-5",
        question: "Has your engagement with gaming created discord in your personal or professional relationships?",
        risk: "high"
    }
];

const resources = [
    {
        title: "Gamblers Anonymous",
        url: "https://www.gamblersanonymous.org",
        description: "Premier 24/7 support community for those affected by gaming concerns. Access confidential meetings, comprehensive resources, and sophisticated recovery protocols.",
        phone: "1-800-522-4700",
        availabilityHours: "24/7",
        responseTime: "Immediate",
        resourceType: "Support Network"
    },
    {
        title: "National Problem Gambling Helpline",
        url: "https://www.ncpgambling.org",
        description: "Discreet consultation services offering personalized referrals and expert guidance for individuals and families seeking balanced gaming practices.",
        phone: "1-800-522-4700",
        availabilityHours: "24/7",
        responseTime: "Immediate",
        resourceType: "Elite Hotline"
    },
    {
        title: "GamCare",
        url: "https://www.gamcare.org.uk",
        description: "Complimentary professional support, bespoke counseling, and tailored treatment for gaming concerns. Offering exclusive tools, curated resources and expert guidance.",
        phone: "0808-802-0133",
        availabilityHours: "24/7",
        responseTime: "Within 24 hours",
        resourceType: "Bespoke Counseling"
    }
];

const responsibleTools = [
    {
        title: "Customized Deposit Thresholds",
        description: "Establish personalized daily, weekly or monthly deposit parameters",
        icon: PieChart,
        action: "/account/limits"
    },
    {
        title: "Refined Time Notifications",
        description: "Receive elegant alerts regarding your engagement duration",
        icon: Clock,
        action: "/account/notifications"
    },
    {
        title: "Distinguished Hiatus Options",
        description: "Orchestrate a sophisticated pause from gaming for a defined interval",
        icon: Ban,
        action: "/account/self-exclusion"
    },
    {
        title: "Awareness Prompts",
        description: "Configure periodic elegant reminders throughout your experience",
        icon: AlertCircle,
        action: "/account/reality-check"
    }
];

export default function ResponsibleGamingPage() {
    // Local state
    const [activeTab, setActiveTab] = useState<string>("questionnaire");
    const [progressValue, setProgressValue] = useState<number>(0);
    const [showConfetti, setShowConfetti] = useState<boolean>(false);

    // Animation hooks
    const { scrollYProgress } = useScroll();
    const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const sectionScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    // Effects
    useEffect(() => {
        // Simulate progress increase over time
        const timer = setTimeout(() => {
            setProgressValue(100);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Event handlers
    const handleToolClick = (tool: string) => {
        // In a real implementation, this would navigate to the appropriate tool
        console.log(`Navigating to ${tool}`);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
    };

    // Helper functions for risk class determination
    const getRiskBgClass = (risk: string): string => {
        if (risk === 'high') return 'bg-red-500/20';
        if (risk === 'medium') return 'bg-amber-500/20';
        return 'bg-green-500/20';
    };

    const getRiskDotClass = (risk: string): string => {
        if (risk === 'high') return 'bg-red-500';
        if (risk === 'medium') return 'bg-amber-500';
        return 'bg-green-500';
    };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={pageVariants}
            className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background to-background/95"
        >
            {/* Abstract Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"
                    variants={glowVariants}
                />
                <motion.div
                    className="absolute bottom-[20%] left-[-10%] w-[35%] h-[35%] rounded-full bg-amber-500/5 blur-[100px]"
                    variants={glowVariants}
                    custom={1}
                />
                <motion.div
                    className="absolute top-[40%] left-[25%] w-[25%] h-[25%] rounded-full bg-sky-900/5 blur-[80px]"
                    variants={glowVariants}
                    custom={2}
                />
            </div>

            {/* Hero Section with Parallax Effect */}
            <section className="relative py-24 overflow-hidden">
                <motion.div
                    className="absolute inset-0 z-0 bg-gradient-to-b from-primary/20 to-background/80"
                    style={{ opacity: backgroundOpacity }}
                />
                <div className="absolute inset-0 bg-[url('/images/pattern-casino.svg')] opacity-[0.03] z-0" />

                <div className="container relative z-10 px-4 mx-auto">
                    <motion.div
                        variants={cardVariants}
                        className="max-w-3xl mx-auto text-center"
                        style={{ scale: sectionScale }}
                    >
                        <Badge
                            variant="secondary"
                            className="px-4 py-1 mb-6 font-serif text-5xl font-bold text-yellow-500"
                        >
                            <Sparkles className="w-4.5 h-4.5 mr-1.5" />
                            House Edge Prestige
                        </Badge>

                        <motion.h1
                            className="mb-6 text-4xl text-yellow-500 font-display md:text-4xl bg-clip-text bg-gradient-to-r from-primary via-primary/90 to-primary/70"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            The Art of Distinguished Play
                        </motion.h1>

                        <motion.p
                            className="max-w-2xl mx-auto mb-8 text-xl leading-relaxed text-muted-foreground"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            We&apos;re devoted to cultivating an environment where sophistication meets responsibility.
                            Your discerning experience remains our paramount priority at House Edge Casino.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="flex flex-wrap justify-center gap-4"
                        >
                            <Button
                                size="lg"
                                className="gap-2 px-6 py-6 font-medium rounded-full shadow-xl"
                            >
                                Begin Personal Assessment
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="gap-2 px-6 py-6 font-serif font-semibold border-2 border-sky-500 rounded-full- bg-sky-500 hover:bg-sky-700 backdrop-blur-sm"
                            >
                                <LifeBuoy className="w-5 h-5" />
                                Access Support Team
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Banner */}
            <motion.section
                className="py-6 bg-card/30 backdrop-blur-sm border-y border-primary/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
            >
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-0 md:divide-x divide-primary/10">
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                            <span className="mb-1 text-3xl font-bold text-yellow-500 text-primary">87%</span>
                            <span className="font-sans text-lg text-muted-foreground">of our distinguished patrons utilize our bespoke gaming protocols</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                            <span className="mb-1 text-3xl font-bold text-yellow-500 text-primary">24/7</span>
                            <span className="font-sans text-lg text-muted-foreground">exclusive concierge support for clientele seeking assistance</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                            <span className="mb-1 text-3xl font-bold text-yellow-500 text-primary">15+</span>
                            <span className="font-serif text-lg text-muted-foreground">curated management instruments at your disposal</span>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Guidelines Grid with Interactive Cards */}
            <section className="relative py-20">
                <div className="container px-4 mx-auto">
                    <motion.div
                        variants={cardVariants}
                        className="mb-12 text-center"
                    >
                        <h2 className="mb-3 font-serif text-3xl font-semibold text-yellow-500">Principles of Discerning Play</h2>
                        <p className="max-w-2xl mx-auto text-muted-foreground">
                            Embrace these refined tenets to ensure your gaming experience remains an exquisite form of leisure
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {guidelines.map((guideline, index) => (
                            <motion.div
                                key={guideline.title}
                                custom={index}
                                variants={staggeredItemVariants}
                                whileHover="hover"
                                className="h-full"
                            >
                                <Card className="h-full overflow-hidden transition-all duration-300 border bg-card/50 backdrop-blur-sm border-primary/10">
                                    <CardHeader>
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-3 rounded-lg ${guideline.bgColor} ${guideline.color}`}>
                                                <guideline.icon className="w-6 h-6" />
                                            </div>
                                            <CardTitle className="text-lg">
                                                {guideline.title}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="mb-4">
                                            {guideline.description}
                                        </CardDescription>
                                        <div className="pt-2 mt-2 border-t border-primary/5">
                                            <p className="text-xs font-medium text-muted-foreground">CONNOISSEUR INSIGHT</p>
                                            <p className="mt-1 text-sm">{guideline.stat}</p>
                                        </div>
                                    </CardContent>
                                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-muted">
                                        <motion.div
                                            className={`h-full ${guideline.color}`}
                                            initial={{ width: "0%" }}
                                            whileInView={{ width: "100%" }}
                                            transition={{ duration: 1.5, delay: index * 0.2 }}
                                            viewport={{ once: true }}
                                        />
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Self-Assessment Tool Section */}
            <section className="py-16 bg-muted/30">
                <div className="container px-4 mx-auto">
                    <motion.div
                        variants={cardVariants}
                        className="max-w-4xl mx-auto"
                    >
                        <Card className="overflow-hidden bg-card/60 backdrop-blur-md border-primary/10">
                            <CardHeader className="pb-2">
                                <Badge variant="outline" className="mb-2 w-fit">
                                    Exclusive Assessment
                                </Badge>
                                <CardTitle className="text-2xl font-bold">
                                    Personalized Gaming Profile
                                </CardTitle>
                                <CardDescription>
                                    Evaluate your gaming patterns with our confidential, bespoke assessment instrument
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs
                                    defaultValue="questionnaire"
                                    value={activeTab}
                                    onValueChange={setActiveTab}
                                    className="w-full"
                                >
                                    <TabsList className="grid w-full grid-cols-2 mb-6 border-2 shadow-xl border-sky-500">
                                        <TabsTrigger value="questionnaire">Consultation</TabsTrigger>
                                        <TabsTrigger value="results">Insights & Recommendations</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="questionnaire" className="space-y-4">
                                        <div className="p-4 mb-6 rounded-md bg-primary/5">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-red-500 text-md">Assessment Progression</span>
                                                <span className="font-medium text-red-500 text-md">{progressValue}%</span>
                                            </div>
                                            <Progress value={progressValue} className="h-2" />
                                        </div>

                                        <div className="space-y-4">
                                            {selfAssessment.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="p-4 transition-all border rounded-lg border-primary/10 bg-card hover:border-primary/30"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full ${getRiskBgClass(item.risk)} flex items-center justify-center`}>
                                                            <div className={`w-2.5 h-2.5 rounded-full ${getRiskDotClass(item.risk)}`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="mb-3 text-base font-medium">{item.question}</p>
                                                            <div className="flex items-center space-x-6">
                                                                <div className="flex items-center">
                                                                    <input
                                                                        id={`${item.id}-yes`}
                                                                        type="radio"
                                                                        name={item.id}
                                                                        className="w-4 h-4 text-primary border-muted-foreground focus:ring-primary"
                                                                    />
                                                                    <label
                                                                        htmlFor={`${item.id}-yes`}
                                                                        className="ml-2 text-sm font-medium"
                                                                    >
                                                                        Indeed
                                                                    </label>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <input
                                                                        id={`${item.id}-no`}
                                                                        type="radio"
                                                                        name={item.id}
                                                                        className="w-4 h-4 text-primary border-muted-foreground focus:ring-primary"
                                                                    />
                                                                    <label
                                                                        htmlFor={`${item.id}-no`}
                                                                        className="ml-2 text-sm font-medium"
                                                                    >
                                                                        Not at all
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button
                                                onClick={() => setActiveTab("results")}
                                                className="gap-2"
                                            >
                                                Review Personalized Insights
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="results">
                                        <div className="p-6 mb-6 border rounded-lg border-primary/10 bg-card">
                                            <h3 className="mb-2 text-lg font-medium">Your Bespoke Analysis</h3>
                                            <p className="mb-4 text-muted-foreground">
                                                Based on your thoughtful responses, here&apos;s a curated assessment of your gaming inclinations:
                                            </p>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-full h-3 overflow-hidden rounded-full bg-muted">
                                                    <div className="h-full rounded-full bg-amber-500 w-[45%]" />
                                                </div>
                                                <span className="text-sm font-medium whitespace-nowrap">Intermediate Consideration</span>
                                            </div>
                                            <div className="space-y-3 text-sm">
                                                <p>• Consider implementing more refined deposit parameters</p>
                                                <p>• Establish sophisticated session duration notifications</p>
                                                <p>• Regularly review your gaming chronicle for patterns</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <Button variant="outline" className="flex flex-col items-start h-auto p-4">
                                                <div className="flex w-full">
                                                    <Calendar className="w-5 h-5 mr-2" />
                                                    <span className="font-medium">Arrange a Private Consultation</span>
                                                </div>
                                                <p className="mt-1 text-xs text-left text-muted-foreground">
                                                    Engage with a distinguished gaming advisor
                                                </p>
                                            </Button>
                                            <Button variant="outline" className="flex flex-col items-start h-auto p-4">
                                                <div className="flex w-full">
                                                    <Settings className="w-5 h-5 mr-2" />
                                                    <span className="font-medium">Calibrate Your Experience Parameters</span>
                                                </div>
                                                <p className="mt-1 text-xs text-left text-muted-foreground">
                                                    Tailor deposit, wager and temporal boundaries
                                                </p>
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* Responsible Gaming Tools */}
            <section className="py-16">
                <div className="container px-4 mx-auto">
                    <motion.div
                        variants={cardVariants}
                        className="mb-12 text-center"
                    >
                        <h2 className="mb-3 font-serif text-3xl font-bold text-yellow-500">Experience Management Suite</h2>
                        <p className="max-w-2xl mx-auto text-muted-foreground">
                            Bespoke instruments designed to maintain sovereignty over your curated gaming journey
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {responsibleTools.map((tool, index) => (
                            <motion.div
                                key={tool.title}
                                custom={index}
                                variants={staggeredItemVariants}
                                whileHover={{ y: -5 }}
                                className="h-full"
                            >
                                <Card
                                    className="h-full cursor-pointer bg-gradient-to-b from-card to-card/50 border-primary/10 group"
                                    onClick={() => handleToolClick(tool.action)}
                                >
                                    <CardHeader>
                                        <div className="flex items-center justify-center w-12 h-12 p-3 mb-2 transition-colors duration-200 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white">
                                            <tool.icon className="w-6 h-6" />
                                        </div>
                                        <CardTitle className="text-lg transition-colors duration-200 group-hover:text-primary">
                                            {tool.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>
                                            {tool.description}
                                        </CardDescription>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="justify-between w-full transition-colors duration-200 group-hover:bg-primary/10"
                                        >
                                            <span>Personalize</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Confetti animation when a tool is clicked */}
                    <AnimatePresence>
                        {showConfetti && (
                            <motion.div
                                className="fixed inset-0 z-50 pointer-events-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {/* This would be implemented with a confetti library in production */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl">🎉</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Resources Section with Enhanced Accordion */}
            <section className="py-16 bg-muted/30">
                <div className="container px-4 mx-auto">
                    <motion.div
                        variants={cardVariants}
                        className="max-w-4xl mx-auto"
                    >
                        <Card className="bg-card/60 backdrop-blur-md border-primary/10">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold">
                                    Curated Assistance Network
                                </CardTitle>
                                <CardDescription>
                                    Distinguished professional guidance and concierge services available at your convenience
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    {resources.map((resource) => (
                                        <AccordionItem
                                            key={resource.title}
                                            value={`item-${resource.title}`}
                                            className="py-2 border-b border-primary/10 last:border-0"
                                        >
                                            <AccordionTrigger className="text-left hover:no-underline">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium">{resource.title}</span>
                                                    <Badge variant="outline" className="ml-2 text-xs">
                                                        {resource.availabilityHours}
                                                    </Badge>
                                                    <Badge variant="secondary" className="hidden text-xs sm:inline-flex">
                                                        {resource.resourceType}
                                                    </Badge>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="pt-2 space-y-4">
                                                    <p className="text-muted-foreground">
                                                        {resource.description}
                                                    </p>

                                                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-muted-foreground">Response Protocol:</span>
                                                            <span className="font-medium">{resource.responseTime}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-muted-foreground">Assistance Category:</span>
                                                            <span className="font-medium">{resource.resourceType}</span>
                                                        </div>
                                                    </div>

                                                    <Separator className="my-3" />

                                                    <div className="flex flex-col gap-4 sm:flex-row">
                                                        <Button
                                                            variant="outline"
                                                            className="flex items-center gap-2"
                                                            asChild
                                                        >
                                                            <a href={`tel:${resource.phone}`}>
                                                                <Phone className="w-4 h-4" />
                                                                {resource.phone}
                                                            </a>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="flex items-center gap-2"
                                                            asChild
                                                        >
                                                            <a
                                                                href={resource.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                                Visit Digital Portal
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section with Enhanced Design */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary/5 to-primary/10" />
                <div className="absolute inset-0 bg-[url('/images/pattern-casino.svg')] opacity-[0.03] z-0" />

                <div className="container relative z-10 px-4 mx-auto">
                    <motion.div
                        variants={cardVariants}
                        className="max-w-3xl p-8 mx-auto text-center border shadow-xl bg-card/50 backdrop-blur-md rounded-2xl border-primary/10"
                    >
                        <div className="inline-flex items-center justify-center p-3 mb-8 rounded-full bg-warning/10 text-warning">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h2 className="mb-4 text-3xl font-bold">
                            Contemplating a Refined Pause?
                        </h2>
                        <p className="max-w-xl mx-auto mb-8 text-muted-foreground">
                            We offer sophisticated instruments to orchestrate your gaming journey.
                            Establish boundaries, arrange intervals, or designate exclusion periods with elegance.
                        </p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link href="/game-settings">
                                            <Button size="lg" className="gap-2 px-6 rounded-full">
                                                Orchestrate Experience Parameters
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        <p>Define deposit, wager and temporal parameters</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <Link href="/support">
                                <Button size="lg" variant="outline" className="gap-2 px-6 rounded-full">
                                    <LifeBuoy className="w-4 h-4" />
                                    Engage Personal Concierge
                                </Button>
                            </Link>
                        </div>

                        <div className="pt-6 mt-8 border-t border-primary/10">
                            <p className="text-sm text-muted-foreground">
                                House Edge Casino is devoted to cultivating distinguished gaming practices.
                                Engage discerningly and recognize your boundaries.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>
        </motion.div>
    );
}