// src/app/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  ArrowRight, Shield, Brain, Sparkles,
  BarChart2, Users, HelpCircle
} from 'lucide-react';
import {
  GiCardAceClubs, GiCardAceDiamonds, GiCardAceHearts, GiCardAceSpades,
  GiPokerHand, GiCardRandom, GiCoins
} from 'react-icons/gi';
import { Button } from '@/ui/layout/button';
import { cn } from '@/lib/utils';

// Define types for component props
interface ParticleElement {
  id: string;
  xPos: number;
  yPos: number;
  scale: number;
  opacity: number;
  duration: number;
}

interface RandomValue {
  destY: number;
  destX: number;
  opacity: number;
}

interface Card {
  id: string;
  sparkleColor: string;
  suit?: string;
  borderColor?: string;
  embossColor?: string;
  icon?: React.ReactNode;
  color?: string;
  rotateY?: string;
  rotateX?: string;
  translateZ?: string;
  translateX?: string;
  translateY?: string;
}

interface GlintElement {
  id: string;
  xPos: number;
  yPos: number;
  delay: number;
  duration: number;
}

// Client-only animations component to avoid hydration mismatches
const AnimatedParticles = ({ particleElements }: { particleElements: ParticleElement[] }) => {
  const [randomValues, setRandomValues] = useState<RandomValue[]>([]);

  useEffect(() => {
    // Generate random values on the client side only
    setRandomValues(
      particleElements.map(() => ({
        destY: Math.random() * 100,
        destX: Math.random() * 100,
        opacity: Math.random() * 0.3 + 0.1
      }))
    );
  }, [particleElements]);

  if (randomValues.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {particleElements.map((particle, index) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full bg-amber-300"
          initial={{
            x: `${particle.xPos}%`,
            y: `${particle.yPos}%`,
            scale: particle.scale,
            opacity: particle.opacity
          }}
          animate={{
            y: [null, `${randomValues[index]?.destY}%`],
            x: [null, `${randomValues[index]?.destX}%`],
            opacity: [null, randomValues[index]?.opacity],
            transition: {
              duration: particle.duration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }
          }}
        />
      ))}
    </div>
  );
};

interface Sparkle {
  id: string;
  xOffset: number;
  yOffset: number;
  xAnim1: number;
  xAnim2: number;
  yAnim1: number;
  yAnim2: number;
  scale: number;
  duration: number;
  delay: number;
}

// Client-only sparkle component
const CardSparkles = ({ card }: { card: Card }) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    setSparkles(Array.from({ length: 6 }, (_, i) => ({
      id: `sparkle-${card.id}-${i}`,
      xOffset: (Math.random() - 0.5) * 50,
      yOffset: (Math.random() - 0.5) * 50,
      xAnim1: (Math.random() - 0.5) * 100,
      xAnim2: (Math.random() - 0.5) * 100,
      yAnim1: (Math.random() - 0.5) * 100,
      yAnim2: (Math.random() - 0.5) * 100,
      scale: Math.random() * 2 + 1,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 2
    })));
  }, [card.id]);

  if (sparkles.length === 0) return null;

  return (
    <motion.div
      className="absolute inset-[-50%] pointer-events-none"
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
    >
      {sparkles.map((sparkle) => (
        <motion.span
          key={sparkle.id}
          className={`absolute inline-block w-1 h-1 ${card.sparkleColor} rounded-full`}
          initial={{
            x: sparkle.xOffset,
            y: sparkle.yOffset,
            scale: 0,
            opacity: 0
          }}
          animate={{
            x: [sparkle.xAnim1, sparkle.xAnim2],
            y: [sparkle.yAnim1, sparkle.yAnim2],
            scale: [0, sparkle.scale, 0],
            opacity: [0, 1, 0],
            transition: {
              duration: sparkle.duration,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut',
              delay: sparkle.delay
            }
          }}
        />
      ))}
    </motion.div>
  );
};

// Client-only glints component
const AnimatedGlints = ({ glintElements }: { glintElements: GlintElement[] }) => {
  return (
    <>
      {glintElements.map((glint) => (
        <motion.div
          key={glint.id}
          className="absolute w-1 h-1 rounded-full bg-amber-200"
          initial={{
            x: `${glint.xPos}%`,
            y: `${glint.yPos}%`,
            scale: 0,
            opacity: 0
          }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: glint.duration,
            repeat: Infinity,
            delay: glint.delay,
            repeatDelay: Math.random() * 10 + 5
          }}
        />
      ))}
    </>
  );
};

export default function HomePage() {
  // Animation controls
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Create arrays with stable IDs for decorative elements
  const glintElements = Array.from({ length: 5 }, (_, i) => ({
    id: `glint-element-${i}`,
    xPos: Math.random() * 100,
    yPos: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 3
  }));

  const particleElements = Array.from({ length: 20 }, (_, i) => ({
    id: `particle-element-${i}`,
    xPos: Math.random() * 100,
    yPos: Math.random() * 100,
    scale: Math.random() * 0.5 + 0.5,
    opacity: Math.random() * 0.3 + 0.2,
    duration: 5 + Math.random() * 15
  }));

  // Create stable IDs for player avatars
  const playerAvatars = [
    { id: "avatar-1", color: "bg-amber-300", borderColor: "border-amber-400", delay: 0.1 },
    { id: "avatar-2", color: "bg-amber-500", borderColor: "border-amber-600", delay: 0.2 },
    { id: "avatar-3", color: "bg-amber-700", borderColor: "border-amber-800", delay: 0.3 },
    { id: "avatar-4", color: "bg-amber-900", borderColor: "border-amber-950", delay: 0.4 }
  ];

  // Track if component is mounted (client-side only)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // Features data
  const features = [
    {
      id: "realistic-physics",
      icon: <GiCardRandom className="w-12 h-12 text-amber-400" />,
      title: "Realistic Card Physics",
      description: "Experience authentic Vegas-style card dealing with realistic animations and physics."
    },
    {
      id: "strategy-coach",
      icon: <Brain className="w-12 h-12 text-amber-400" />,
      title: "Strategy Coach",
      description: "Built-in strategy hints help you make the optimal play for every hand."
    },
    {
      id: "advanced-betting",
      icon: <GiPokerHand className="w-12 h-12 text-amber-400" />,
      title: "Advanced Betting",
      description: "Multiple betting options including split, double-down, and insurance."
    },
    {
      id: "performance-analytics",
      icon: <BarChart2 className="w-12 h-12 text-amber-400" />,
      title: "Performance Analytics",
      description: "Track your play with detailed statistics and win rate analysis."
    },
    {
      id: "chip-management",
      icon: <GiCoins className="w-12 h-12 text-amber-400" />,
      title: "Chip Management",
      description: "Realistic chip handling with various denominations and betting patterns."
    },
    {
      id: "fair-gaming",
      icon: <Shield className="w-12 h-12 text-amber-400" />,
      title: "Fair Gaming",
      description: "RNG certified fair play with transparent odds and house edge."
    }
  ];

  // How to play steps
  const howToPlaySteps = [
    {
      id: "step-place-bet",
      number: "01",
      title: "Place Your Bet",
      description: "Start by placing your bet using chips from your bankroll.",
      detailedInfo: "Select chip denominations from $1 to $500 and place them in the betting circle. Consider your betting strategy and bankroll management for optimal play.",
      icon: <GiCoins className="w-6 h-6" />,
      tips: ["Start with smaller bets while learning", "Maintain a consistent bet size", "Avoid increasing bets after losses"]
    },
    {
      id: "step-receive-cards",
      number: "02",
      title: "Receive Your Cards",
      description: "You'll get two face-up cards, dealer gets one face-up and one face-down.",
      detailedInfo: "Cards 2-10 are worth their face value. Face cards (J, Q, K) are worth 10. Aces can be worth 1 or 11, whichever is more favorable to your hand.",
      icon: <GiCardRandom className="w-6 h-6" />,
      tips: ["Pay attention to the dealer's up-card", "Understand card values", "A hand with an Ace counted as 11 is called a 'soft' hand"]
    },
    {
      id: "step-decide",
      number: "03",
      title: "Make Your Decision",
      description: "Choose to hit, stand, double down, or split based on your hand.",
      detailedInfo: "Hit: Take another card. Stand: Keep your current hand. Double Down: Double your bet and receive one more card. Split: With a pair, create two hands with equal bets.",
      icon: <Brain className="w-6 h-6" />,
      tips: ["Hit when your hand is 11 or less", "Stand on 17 or higher", "Double down on 11 if dealer shows 2-10", "Split Aces and 8s, never split 10s or 5s"]
    },
    {
      id: "step-dealer-plays",
      number: "04",
      title: "Dealer Plays",
      description: "After your turn, the dealer reveals their card and follows house rules.",
      detailedInfo: "The dealer must hit on 16 or lower and stand on 17 or higher (including 'soft' 17). Unlike players, dealers have no choice in their actions.",
      icon: <Users className="w-6 h-6" />,
      tips: ["Dealer advantage comes from players acting first", "Dealer must follow fixed rules", "House edge is typically 0.5% with optimal play"]
    },
    {
      id: "step-collect",
      number: "05",
      title: "Collect Winnings",
      description: "Beat the dealer without going over 21 to win your bet.",
      detailedInfo: "Blackjack (Ace + 10-value card) pays 3:2. Regular wins pay 1:1. Push (tie) returns your bet. Insurance pays 2:1 if dealer has blackjack.",
      icon: <Sparkles className="w-6 h-6" />,
      tips: ["Blackjack pays 3:2 (higher than regular wins)", "Insurance is generally not recommended", "Your goal is to beat the dealer, not to get 21"]
    }
  ];


  return (
    <>
      {/* Hero Section - Sophisticated, modern, and elegant redesign */}
      <section
        className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-black/95 to-amber-950/20"
        aria-labelledby="hero-heading"
      >
        {/* Enhanced background elements */}
        <div className="absolute inset-0 z-0">
          {/* Abstract geometric patterns */}
          <div className="absolute inset-0 bg-[url('/patterns/luxury-pattern.svg')] bg-[length:80px_80px] opacity-5"></div>

          {/* Subtle gradient overlay with visual depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 via-black/70 to-black"></div>

          {/* Dynamic light sources */}
          <div className="absolute w-[40vw] h-[40vw] -top-[20vw] -right-[20vw] rounded-full bg-amber-500/5 blur-[120px]"></div>
          <div className="absolute w-[30vw] h-[30vw] bottom-0 left-1/4 rounded-full bg-amber-600/5 blur-[100px]"></div>

          {/* Vegas-style spotlight effects */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Sweeping spotlights */}
            <motion.div
              className="absolute -top-[30vh] left-[10vw] w-[25vw] h-[90vh] bg-gradient-to-b from-amber-200/5 via-amber-300/3 to-transparent rounded-full origin-top transform-gpu"
              initial={{ rotate: -35, scale: 1.5 }}
              animate={{
                rotate: [-35, -5, -35],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ filter: "blur(40px)" }}
            />

            <motion.div
              className="absolute -top-[30vh] right-[20vw] w-[30vw] h-[90vh] bg-gradient-to-b from-amber-300/4 via-amber-400/2 to-transparent rounded-full origin-top transform-gpu"
              initial={{ rotate: 15, scale: 1.2 }}
              animate={{
                rotate: [15, 45, 15],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
              style={{ filter: "blur(50px)" }}
            />

            {/* Card spotlights - for card area only */}
            <div className="absolute inset-0 right-0 hidden w-1/2 opacity-60 lg:block">
              <motion.div
                className="absolute w-40 h-40 rounded-full top-1/2 left-1/3 radial-spotlight transform-gpu"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.7, 0],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
                style={{
                  background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, rgba(251,191,36,0) 70%)",
                  filter: "blur(10px)"
                }}
              />

              <motion.div
                className="absolute top-[60%] left-[60%] w-60 h-60 rounded-full radial-spotlight transform-gpu"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [1, 1.3, 1]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: 3
                }}
                style={{
                  background: "radial-gradient(circle, rgba(251,191,36,0.05) 0%, rgba(251,191,36,0) 70%)",
                  filter: "blur(15px)"
                }}
              />
            </div>
          </div>

          {/* Subtle animated gold dust particles */}
          {isMounted && (
            <div className="absolute inset-0 opacity-30">
              <AnimatedParticles
                particleElements={Array.from({ length: 40 }, (_, i) => ({
                  id: `particle-element-luxury-${i}`,
                  xPos: Math.random() * 100,
                  yPos: Math.random() * 100,
                  scale: Math.random() * 0.3 + 0.1,
                  opacity: Math.random() * 0.4 + 0.1,
                  duration: 8 + Math.random() * 20
                }))}
              />
            </div>
          )}

          {/* Add glinting light effects */}
          {isMounted && (
            <div className="absolute inset-0 pointer-events-none">
              <AnimatedGlints glintElements={glintElements} />
            </div>
          )}
        </div>

        <div className="container relative h-screen px-4 mx-auto">
          <div className="grid items-center h-full grid-cols-1 lg:grid-cols-12 gap-x-8">
            {/* Content Column - enhanced typography and spacing */}
            <div className="lg:col-span-6 xl:col-span-5 z-10 mt-[-10vh]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8"
              >
                {/* Elegant badge with premium indicator */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="inline-flex items-center"
                >
                  <span className="relative flex overflow-hidden">
                    <span className="px-3 py-1.5 text-xs font-medium tracking-wider uppercase rounded-full border border-amber-700/30 bg-gradient-to-r from-amber-950/60 to-black/60 text-amber-300 backdrop-blur-sm">
                      <span className="relative z-10 flex items-center gap-2">
                          <div className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
                          Premium Experience
                      </span>
                    </span>
                    {/* Badge highlight effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-transparent opacity-60 blur-[1px]"></span>
                  </span>
                </motion.div>

                {/* Sophisticated headline with refined typography and animation */}
                <div className="space-y-3">
                  <motion.h1
                    key="hero-heading"
                    id="hero-heading"
                    className="font-serif text-5xl md:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.9,
                      delay: 0.4,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                  >
                    <span className="relative block mb-2">
                      <span className="relative z-10 text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-amber-300 bg-clip-text drop-shadow-sm knewave-regular">
                        The Royal Edge
                      </span>
                      {/* Subtle text shadow/glow effect */}
                      <span className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-amber-300/10 to-transparent blur-md opacity-70"></span>
                    </span>

                    <motion.span
                      className="relative block text-white knewave-regular"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.7, delay: 0.6 }}
                    >
                      Blackjack Experience
                      {/* Elegant underline that animates in */}
                      <motion.span
                        className="absolute left-0 h-px -bottom-3 bg-gradient-to-r from-amber-400/80 via-amber-400/40 to-transparent"
                        initial={{ width: 0 }}
                        animate={{ width: "50%" }}
                        transition={{ duration: 1.2, delay: 1.2 }}
                      ></motion.span>
                    </motion.span>
                  </motion.h1>
                </div>

                {/* Enhanced description with refined typography and spacing */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.8 }}
                  className="max-w-xl text-xl font-light leading-relaxed md:text-2xl text-gray-300/90 permanent-marker-regular"
                >
                  Immerse yourself in the <span className="font-medium text-amber-400">authentic allure</span> of Las Vegas with our meticulously crafted blackjack experience.
                </motion.p>

                {/* Premium CTA buttons with enhanced hover effects */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 1 }}
                  className="flex flex-wrap gap-5 pt-4"
                >
                  {/* Primary CTA with sophisticated hover animation */}
                  <button
                    className="relative px-8 py-4 overflow-hidden text-base font-medium text-black transition-all duration-300 ease-out transform rounded-lg shadow-lg group bg-gradient-to-r from-amber-500 to-amber-600 hover:shadow-amber-700/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2 focus:ring-offset-black"
                    aria-label="Play the blackjack game now"
                  >
                    <Link href="/game/blackjack" className="relative z-10 flex items-center">
                      <span className="mr-2">Play Now</span>
                      <span className="relative w-6 h-6 transition-all duration-300 transform group-hover:translate-x-1">
                        <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0">
                          →
                        </span>
                        <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                          →→
                        </span>
                      </span>
                    </Link>

                    {/* Premium button effects */}
                    <span className="absolute inset-0 w-full h-full transition-transform duration-500 transform -translate-x-full bg-gradient-to-r from-amber-600 to-amber-500 group-hover:translate-x-0"></span>
                    <span className="absolute inset-0 w-full h-full transition-opacity duration-300 opacity-0 bg-gradient-to-t from-white/20 via-white/5 to-transparent group-hover:opacity-100"></span>
                  </button>

                  {/* Secondary CTA with elegant styling */}
                  <button
                    className="relative px-8 py-4 overflow-hidden text-base font-medium transition-all duration-300 border-2 rounded-lg group border-amber-700/40 text-amber-300 hover:border-amber-600/60 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:ring-offset-2 focus:ring-offset-black"
                    aria-label="Learn blackjack strategy"
                  >
                    <Link href="/strategy-guide" className="relative z-10 flex items-center">
                      Master Strategy
                      <motion.span
                        className="ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatType: "loop",
                          ease: "easeInOut",
                          repeatDelay: 2
                        }}
                      >
                        →
                      </motion.span>
                    </Link>

                    {/* Subtle hover effect */}
                    <span className="absolute inset-0 w-full h-full transition-all duration-300 opacity-0 bg-gradient-to-br from-amber-900/40 to-black/0 group-hover:opacity-100"></span>
                    <span className="absolute bottom-0 left-0 w-full h-px transition-transform duration-300 origin-left transform scale-x-0 bg-gradient-to-r from-amber-500/60 via-amber-400/30 to-transparent group-hover:scale-x-100"></span>
                  </button>
                </motion.div>

                {/* Enhanced Social proof element with premium styling */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 1.3 }}
                  className="flex items-center pt-4 mt-8 border-t border-amber-900/20"
                >
                  {/* Premium player avatars with staggered animation */}
                  <div className="flex -space-x-3">
                    {playerAvatars.map((avatar, i) => (
                      <motion.div
                        key={avatar.id}
                        initial={{ opacity: 0, scale: 0.5, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 1.4 + avatar.delay,
                          type: "spring",
                          stiffness: 200
                        }}
                        className={`w-10 h-10 rounded-full ${avatar.color} relative ring-2 ${avatar.borderColor} ring-offset-2 ring-offset-black`}
                        style={{ zIndex: 40 - i * 10 }}
                        whileHover={{
                          y: -3,
                          boxShadow: "0 0 0 rgba(245, 158, 11, 0.4)",
                          transition: { duration: 0.2 }
                        }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>

                  <motion.div
                    className="ml-4 text-sm font-medium text-gray-300"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.7 }}
                  >
                    <span className="font-semibold text-amber-400">50,000+</span> players at our tables
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            {/* Visual Column - sophisticated 3D card visualization */}
            <div className="relative z-10 hidden h-full lg:block lg:col-span-6 xl:col-span-7">
              <div className="absolute inset-0 flex items-center justify-center perspective-[2000px]">
                {/* Enhanced card deck with premium visual effects */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.8 }}
                  className="relative w-full h-[30rem] transform-style-3d"
                >
                  {/* Floating cards with premium styling and realistic physics */}
                  {[
                    // Card data array with enhanced styling properties
                    {
                      icon: <GiCardAceSpades className="text-7xl transition-all duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />,
                      color: "bg-gradient-to-br from-slate-900 to-slate-950 text-white",
                      id: "ace-spades-premium",
                      suit: "Spades",
                      borderColor: "border-slate-700/80",
                      embossColor: "from-slate-700/80 to-slate-800/80",
                      sparkleColor: "bg-blue-100",
                      rotateY: "15deg",
                      rotateX: "-5deg",
                      translateZ: "100px",
                      translateX: "-5%"
                    },
                    {
                      icon: <GiCardAceHearts className="text-7xl transition-all duration-300 drop-shadow-[0_0_15px_rgba(255,100,100,0.4)]" />,
                      color: "bg-gradient-to-br from-red-900 to-red-950 text-red-400",
                      id: "ace-hearts-premium",
                      suit: "Hearts",
                      borderColor: "border-red-800/80",
                      embossColor: "from-red-800/80 to-red-900/80",
                      sparkleColor: "bg-red-100",
                      rotateY: "-10deg",
                      rotateX: "8deg",
                      translateZ: "50px",
                      translateX: "15%",
                      translateY: "10%"
                    },
                    {
                      icon: <GiCardAceDiamonds className="text-7xl transition-all duration-300 drop-shadow-[0_0_15px_rgba(255,100,100,0.4)]" />,
                      color: "bg-gradient-to-br from-red-900 to-red-950 text-red-400",
                      id: "ace-diamonds-premium",
                      suit: "Diamonds",
                      borderColor: "border-red-800/80",
                      embossColor: "from-red-800/80 to-red-900/80",
                      sparkleColor: "bg-red-100",
                      rotateY: "5deg",
                      rotateX: "-12deg",
                      translateZ: "150px",
                      translateX: "25%",
                      translateY: "-15%"
                    },
                    {
                      icon: <GiCardAceClubs className="text-7xl transition-all duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />,
                      color: "bg-gradient-to-br from-slate-900 to-slate-950 text-white",
                      id: "ace-clubs-premium",
                      suit: "Clubs",
                      borderColor: "border-slate-700/80",
                      embossColor: "from-slate-700/80 to-slate-800/80",
                      sparkleColor: "bg-blue-100",
                      rotateY: "-20deg",
                      rotateX: "3deg",
                      translateZ: "200px",
                      translateX: "-25%",
                      translateY: "-5%"
                    }
                  ].map((card, i) => (
                    <motion.div
                      key={card.id}
                      className={`absolute w-56 h-80 ${card.color} rounded-xl shadow-2xl flex items-center justify-center
                                 border-2 ${card.borderColor} cursor-pointer overflow-hidden will-change-transform`}
                      style={{
                        transformStyle: "preserve-3d",
                        backfaceVisibility: "hidden",
                        top: "50%",
                        left: "50%",
                        marginLeft: "-7rem",
                        marginTop: "-10rem",
                      }}
                      initial={{
                        opacity: 0,
                        rotateY: card.rotateY,
                        rotateX: card.rotateX,
                        translateZ: "0px",
                        translateX: "0%",
                        translateY: "0%"
                      }}
                      animate={{
                        opacity: 1,
                        rotateY: card.rotateY,
                        rotateX: card.rotateX,
                        translateZ: card.translateZ,
                        translateX: card.translateX,
                        translateY: card.translateY
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 50,
                        damping: 15,
                        delay: 1 + (i * 0.2)
                      }}
                      whileHover={{
                        scale: 1.05,
                        rotateY: "0deg",
                        rotateX: "0deg",
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 15
                        }
                      }}
                      aria-label={`Ace of ${card.suit}`}
                    >
                      {/* CSS-based card texture (replacing the image-based texture) */}
                      <div className="absolute inset-0 opacity-10 mix-blend-overlay">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/3"></div>
                        <div className="absolute inset-0" style={{
                          backgroundImage: `radial-gradient(circle at 10px 10px, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                          backgroundSize: '20px 20px'
                        }}></div>
                      </div>

                      {/* Card inner elements - enhanced with subtle details */}
                      <div className="relative flex items-center justify-center w-full h-full">
                        {/* Card corners with refined styling */}
                        <div className="absolute flex flex-col items-center top-3 left-3">
                          <span className="text-xl font-semibold">A</span>
                          <span className="text-xl mt-[-5px]">
                            {card.suit === "Hearts" && "♥"}
                            {card.suit === "Diamonds" && "♦"}
                            {card.suit === "Clubs" && "♣"}
                            {card.suit === "Spades" && "♠"}
                          </span>
                        </div>
                        <div className="absolute flex flex-col items-center rotate-180 bottom-3 right-3">
                          <span className="text-xl font-semibold">A</span>
                          <span className="text-xl mt-[-5px]">
                            {card.suit === "Hearts" && "♥"}
                            {card.suit === "Diamonds" && "♦"}
                            {card.suit === "Clubs" && "♣"}
                            {card.suit === "Spades" && "♠"}
                          </span>
                        </div>

                        {/* Card center icon with enhanced visual effects */}
                        <div className="relative flex items-center justify-center">
                          {card.icon}

                          {/* Enhanced embossed effect for premium look */}
                          <div className="absolute inset-[-30%] rounded-full bg-gradient-to-tl opacity-20 ${card.embossColor} blur-md scale-75"></div>

                          {/* Interactive sparkles with improved animation */}
                          {isMounted && <CardSparkles card={card} />}
                        </div>

                        {/* Premium card edge highlights */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30 rounded-xl"></div>

                        {/* Reflective light effect for 3D appearance */}
                        <div className="absolute inset-0 opacity-50 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-xl card-highlight-effect"></div>

                        {/* Card border glow on hover */}
                        <motion.div
                          className="absolute inset-0 opacity-0 rounded-xl ring-2 ring-amber-400/30 ring-offset-1 ring-offset-transparent"
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        ></motion.div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Enhanced lighting and ambient effects */}
              <div className="absolute w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-amber-500/5 to-transparent filter blur-[120px] opacity-70 animate-pulse animation-duration-8s top-1/4 left-1/4"></div>
              <div className="absolute w-[20vw] h-[20vw] rounded-full bg-gradient-to-br from-amber-400/5 to-transparent filter blur-[100px] opacity-50 animate-pulse animation-duration-12s top-1/2 left-1/3"></div>
            </div>
          </div>
        </div>

        {/* Elegant scroll indicator with enhanced animation */}
        <motion.div
          className="absolute z-20 flex flex-col items-center text-sm transform -translate-x-1/2 bottom-10 left-1/2 text-amber-300"
          initial={{ opacity: 0, y: -10 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { delay: 1.8, duration: 0.5 }
          }}
          whileHover={{ scale: 1.05, color: "#f59e0b" }}
          onClick={() => {
            document.getElementById('features-heading')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span className="mb-2 text-xs font-medium tracking-wider uppercase opacity-80">Discover More</span>
          <motion.div
            className="flex items-center justify-center w-8 h-12 border rounded-full cursor-pointer border-amber-500/30"
            animate={{ boxShadow: ["0 0 0px rgba(245, 158, 11, 0)", "0 0 10px rgba(245, 158, 11, 0.3)", "0 0 0px rgba(245, 158, 11, 0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1.5 h-3 bg-amber-400 rounded-full"
              animate={{
                y: [0, 6, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>

        {/* Premium accent line at the bottom */}
        <div className="absolute bottom-0 left-0 w-full">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-700/30 to-transparent"></div>
          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/10 to-transparent opacity-70"></div>
        </div>
      </section>

      {/* Features Section - Enhanced with refined cards and interaction */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-b from-amber-950/20" aria-labelledby="features-heading">
        {/* Add particle background effect */}
        {isMounted && (
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <AnimatedParticles particleElements={particleElements} />
          </div>
        )}

        <div className="container px-4 mx-auto">
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="max-w-3xl mx-auto mb-20 text-center"
          >
            <motion.h2
              id="features-heading"
              variants={itemVariants}
              className="mb-6 text-3xl font-bold tracking-tight text-transparent md:text-5xl font-playfair bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text"
            >
              Premium Casino Features
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-xl text-muted-foreground"
            >
              Our blackjack game offers the most authentic and feature-rich experience outside of Las Vegas.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={cn(
                  "bg-card hover:bg-card/90 transition-all duration-300 rounded-lg p-8",
                  "shadow-md hover:shadow-lg border border-amber-900/20 hover:border-amber-700/40",
                  "h-full flex flex-col relative overflow-hidden group"
                )}
                aria-labelledby={`feature-heading-${index}`}
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-br from-amber-700/5 to-transparent group-hover:opacity-100"></div>

                <div className="relative flex items-center justify-center w-20 h-20 mb-6 transition-colors duration-300 shadow-inner bg-amber-950/30 rounded-2xl group-hover:bg-amber-950/40">
                  <motion.div
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: [0, -5, 5, -5, 5, 0], transition: { duration: 0.5 } }}
                  >
                    {feature.icon}
                  </motion.div>
                </div>
                <h3 id={`feature-heading-${index}`} className="relative mb-3 text-2xl font-bold text-amber-300">
                  {feature.title}
                </h3>
                <p className="relative mb-4 text-lg text-muted-foreground">{feature.description}</p>

                <div className="mt-auto">
                  <div className="w-full h-px mb-4 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-transparent via-amber-800/20 to-transparent group-hover:opacity-100" />
                  <span className="inline-flex items-center text-sm font-medium transition-all duration-500 translate-y-2 opacity-0 text-amber-400/80 group-hover:opacity-100 group-hover:translate-y-0">
                    Learn more <ArrowRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How to Play Section - Advanced with detailed strategy info and sophisticated design */}
      <section className="relative py-24 overflow-hidden" aria-labelledby="how-to-play-heading">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[url('/table/pattern-dots.svg')] bg-[length:30px_30px] opacity-5"></div>

        {/* Card deck decorative element */}
        <div className="absolute hidden w-48 h-48 top-10 right-10 opacity-10 xl:block">
          <div className="absolute w-32 translate-x-3 translate-y-2 border-2 h-44 rounded-xl border-amber-600/30 rotate-12"></div>
          <div className="absolute w-32 translate-x-2 translate-y-1 border-2 h-44 rounded-xl border-amber-600/30 rotate-6"></div>
          <div className="absolute w-32 rotate-0 border-2 h-44 rounded-xl border-amber-600/30"></div>
        </div>

        <div className="container relative px-4 mx-auto">
          <div className="max-w-4xl mx-auto mb-16 text-center">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1 mb-4 text-sm font-medium rounded-full bg-amber-900/30 text-amber-400"
            >
              Game Rules
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              id="how-to-play-heading"
              className="mb-6 text-3xl font-bold tracking-tight text-transparent md:text-5xl font-playfair bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text"
            >
              How To Play Blackjack
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-xl text-muted-foreground"
            >
              Master the classic casino card game with these expert-guided steps and tips for optimal play
            </motion.p>
          </div>

          {/* Connected steps with enhanced design */}
          <div className="relative max-w-6xl mx-auto">
            {/* Connector line with animated gradient */}
            <div className="absolute hidden h-1 -translate-y-1/2 top-1/2 left-12 right-12 bg-gradient-to-r from-amber-900/0 via-amber-700/50 to-amber-900/0 lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent animate-pulse animation-duration-3s"></div>
            </div>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-3 lg:grid-cols-5 md:gap-8">
              {howToPlaySteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="relative flex flex-col p-6 transition-all duration-300 border rounded-lg shadow-lg bg-card hover:bg-card/90 border-amber-900/20 hover:border-amber-700/40 group"
                  aria-labelledby={`step-heading-${index}`}
                >
                  {/* Step number with enhanced design */}
                  <div className="absolute z-10 flex items-center justify-center w-16 h-16 -top-8 -left-2">
                    <div className="absolute inset-0 transition-transform duration-300 transform rounded-full bg-gradient-to-br from-amber-900 to-amber-950 group-hover:scale-110"></div>
                    <div className="absolute inset-0.5 bg-gradient-to-br from-amber-800 to-amber-950 rounded-full"></div>
                    <div className="relative z-10 text-xl font-bold text-amber-300">{step.number}</div>
                  </div>

                  {/* Header with icon */}
                  <div className="flex items-center mt-4 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 mr-3 transition-colors duration-300 rounded-full bg-amber-950/50 text-amber-400 group-hover:bg-amber-900/60 group-hover:text-amber-300">
                      {step.icon}
                    </div>
                    <h3 id={`step-heading-${index}`} className="text-xl font-bold text-amber-300 group-hover:text-amber-200">
                      {step.title}
                    </h3>
                  </div>

                  {/* Short description */}
                  <p className="mb-4 text-muted-foreground">{step.description}</p>

                  {/* Expanded content */}
                  <div className="relative overflow-hidden transition-all duration-500 max-h-0 group-hover:max-h-[200px]">
                    <div className="pt-2 pb-4">
                      <div className="w-full h-px mb-4 bg-gradient-to-r from-transparent via-amber-800/30 to-transparent"></div>
                      <p className="mb-4 text-sm text-muted-foreground/90">{step.detailedInfo}</p>

                      {/* Pro tips */}
                      <div className="pt-2">
                        <span className="text-xs font-medium uppercase text-amber-500/70">Pro Tips:</span>
                        <ul className="mt-2 space-y-1">
                          {step.tips.map((tip, i) => (
                            <li key={`${step.id}-tip-${i}`} className="flex items-start text-xs text-muted-foreground/80">
                              <span className="mr-2 text-amber-500/70">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Hover instruction */}
                  <div className="flex items-center justify-center pt-3 mt-auto">
                    <span className="inline-flex items-center text-xs transition-all duration-500 group-hover:opacity-0 text-amber-400/50">
                      <ArrowRight className="w-3 h-3 mr-1" /> Hover for details
                    </span>
                  </div>

                  {/* Arrow indicator for mobile */}
                  {index < howToPlaySteps.length - 1 && (
                    <div className="absolute transform -translate-x-1/2 -bottom-10 left-1/2 text-amber-700 md:hidden">
                      <ArrowRight className="w-5 h-5 rotate-90" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Advanced strategy and rules section */}
          <div className="max-w-3xl mx-auto mt-24">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Basic strategy card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative p-6 overflow-hidden transition-all duration-300 border rounded-lg shadow-md bg-gradient-to-br from-card to-card/80 border-amber-900/20 hover:border-amber-700/40 hover:shadow-lg group"
              >
                <div className="absolute top-0 right-0 p-2 text-amber-800/30">
                  <div className="w-20 h-20 border-t-2 border-r-2 rounded-tr-lg border-amber-800/20"></div>
                </div>

                <h4 className="mb-4 text-xl font-bold text-amber-300">Basic Strategy</h4>
                <p className="mb-6 text-muted-foreground">Learn the mathematically optimal play for every possible hand to reduce the house edge to a minimum.</p>

                <Button
                  variant="outline"
                  className="w-full border-amber-700/40 text-amber-400 hover:bg-amber-900/30 group-hover:border-amber-600/50"
                >
                  <Link href="/strategy-guide" className="flex items-center justify-center w-full">
                    View Strategy Chart <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>

              {/* House rules card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative p-6 overflow-hidden transition-all duration-300 border rounded-lg shadow-md bg-gradient-to-br from-card to-card/80 border-amber-900/20 hover:border-amber-700/40 hover:shadow-lg group"
              >
                <div className="absolute top-0 right-0 p-2 text-amber-800/30">
                  <div className="w-20 h-20 border-t-2 border-r-2 rounded-tr-lg border-amber-800/20"></div>
                </div>

                <h4 className="mb-4 text-xl font-bold text-amber-300">House Rules</h4>
                <p className="mb-6 text-muted-foreground">Understand the specific rules of our blackjack tables, including payouts, deck counts, and dealer procedures.</p>

                <Button
                  variant="outline"
                  className="w-full border-amber-700/40 text-amber-400 hover:bg-amber-900/30 group-hover:border-amber-600/50"
                >
                  <Link href="/house-rules" className="flex items-center justify-center w-full">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    View Complete Rules
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Interactive learning banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl p-8 mx-auto mt-24 border rounded-lg border-amber-900/20 bg-gradient-to-r from-amber-950/40 to-black/50"
          >
            <div className="flex flex-col items-center md:flex-row md:justify-between">
              <div className="mb-6 text-center md:mb-0 md:text-left md:pr-8">
                <h4 className="mb-2 text-2xl font-bold text-amber-300">New to Blackjack?</h4>
                <p className="text-muted-foreground">Try our interactive tutorial to learn hands-on with guided practice rounds.</p>
              </div>
              <Button
                className="relative overflow-hidden text-white shadow-md group bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 hover:shadow-lg"
              >
                <Link href="/tutorial" className="flex items-center justify-center">
                  Start Tutorial <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
                <span className="absolute inset-0 w-full h-full transition-transform duration-300 transform -translate-x-full bg-white/10 group-hover:translate-x-0"></span>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}