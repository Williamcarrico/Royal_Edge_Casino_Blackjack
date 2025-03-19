"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Bell, Menu, X, ChevronDown, LogIn, LogOut, User, KeyRound, UserPlus } from "lucide-react";
import {
    GiDiamonds,
    GiClubs,
    GiSpades,
    GiHearts,
    GiCardAceClubs,
    GiPokerHand
} from "react-icons/gi";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/layout/button";
import { ModeToggle } from "@/ui/mode-toggle";

// Navigation Links Configuration
const navLinks = [
    { href: "/", label: "Home" },
    {
        label: "Casino Games",
        children: [
            { href: "/game/blackjack", label: "Blackjack", icon: <GiCardAceClubs className="text-amber-400" size={18} /> },
            { href: "/games/poker", label: "Poker (Coming Soon)", icon: <GiPokerHand className="text-amber-400" size={18} />, disabled: true },
            { href: "/games", label: "View All Games" }
        ]
    },
    {
        label: "Features",
        children: [
            { href: "/leaderboard", label: "Leaderboard", icon: <GiDiamonds className="text-amber-400" size={18} /> },
            { href: "/statistics", label: "Statistics", icon: <GiSpades className="text-amber-400" size={18} /> },
            { href: "/analytics", label: "Analytics (Coming Soon)", icon: <GiHearts className="text-amber-400" size={18} />, disabled: true }
        ]
    },
    {
        label: "Strategy",
        children: [
            { href: "/strategy-guide", label: "Strategy Guide", icon: <GiPokerHand className="text-amber-400" size={18} /> },
            { href: "/probability-charts", label: "Probability Charts", icon: <GiDiamonds className="text-amber-400" size={18} /> },
            { href: "/card-counting", label: "Card Counting", icon: <GiSpades className="text-amber-400" size={18} /> },
            { href: "/game-rules", label: "Game Rules", icon: <GiHearts className="text-amber-400" size={18} /> }
        ]
    },
    { href: "/responsible-gaming", label: "Responsible Gaming" },
];

// Account Links Configuration
const accountLinks = [
    { href: "/auth/profile", label: "Profile", icon: <User size={16} /> },
    { href: "/analytics", label: "Game Statistics", icon: <GiPokerHand size={16} /> },
    { href: "/cashier", label: "Cashier", icon: <GiDiamonds size={16} /> },
    { href: "/settings", label: "Settings", icon: <GiSpades size={16} /> },
    { href: "/auth/update-password", label: "Change Password", icon: <KeyRound size={16} /> },
];

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const pathname = usePathname();
    const { scrollY } = useScroll();
    const isLoggedIn = false; // Set to false for now, integrate with your auth system later

    // Dynamic header styling based on scroll position
    const headerOpacity = useTransform(
        scrollY,
        [0, 100],
        ["rgba(0, 0, 0, 0.5)", "rgba(0, 0, 0, 0.95)"]
    );

    const headerBlur = useTransform(
        scrollY,
        [0, 100],
        ["blur(0px)", "blur(10px)"]
    );

    const borderOpacity = useTransform(
        scrollY,
        [0, 100],
        [0, 0.2]
    );

    // Track scroll for header appearance changes
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Handle clicks outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeDropdown && dropdownRefs.current[activeDropdown] &&
                !dropdownRefs.current[activeDropdown]?.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [activeDropdown]);

    // Toggle dropdown menu
    const toggleDropdown = (label: string) => {
        setActiveDropdown(prev => prev === label ? null : label);
    };

    return (
        <motion.header
            style={{
                backgroundColor: headerOpacity,
                backdropFilter: headerBlur,
                borderBottom: `1px solid rgba(186, 138, 76, ${borderOpacity.get()})`,
            }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled && "bg-black/80 backdrop-blur-md border-gray-800/50 shadow-md"
            )}
        >
            <div className="container flex items-center justify-between h-20 px-4 mx-auto">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <motion.div
                        className="relative w-12 h-12 overflow-hidden"
                        whileHover={{
                            scale: 1.05,
                            transition: { duration: 0.4, ease: "easeOut" }
                        }}
                        whileTap={{ scale: 0.97 }}
                    >
                        {/* Animated background gradient */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-amber-700 via-amber-900 to-black rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                            animate={{
                                background: [
                                    "linear-gradient(135deg, rgba(180,83,9,0.95) 0%, rgba(146,64,14,0.95) 50%, rgba(0,0,0,0.95) 100%)",
                                    "linear-gradient(135deg, rgba(146,64,14,0.95) 0%, rgba(0,0,0,0.95) 50%, rgba(180,83,9,0.95) 100%)",
                                    "linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(180,83,9,0.95) 50%, rgba(146,64,14,0.95) 100%)"
                                ]
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }}
                        />

                        {/* Outer border */}
                        <div className="absolute inset-0.5 border border-amber-500/30 rounded-lg overflow-hidden">
                            {/* Card suits grid */}
                            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px p-0.5">
                                <motion.div
                                    className="flex items-center justify-center overflow-hidden rounded-tl-sm shadow-inner bg-gradient-to-br from-red-700 via-red-600 to-red-800"
                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                >
                                    <GiHearts className="w-full h-full p-1 text-white drop-shadow-lg" />
                                </motion.div>
                                <motion.div
                                    className="flex items-center justify-center overflow-hidden rounded-tr-sm shadow-inner bg-gradient-to-bl from-amber-600 via-amber-500 to-amber-700"
                                    whileHover={{ scale: 1.15, rotate: -5 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                >
                                    <GiDiamonds className="w-full h-full p-1 text-white drop-shadow-lg" />
                                </motion.div>
                                <motion.div
                                    className="flex items-center justify-center overflow-hidden rounded-bl-sm shadow-inner bg-gradient-to-tr from-gray-900 via-gray-800 to-black"
                                    whileHover={{ scale: 1.15, rotate: -5 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                >
                                    <GiSpades className="w-full h-full p-1 text-white drop-shadow-lg" />
                                </motion.div>
                                <motion.div
                                    className="flex items-center justify-center overflow-hidden rounded-br-sm shadow-inner bg-gradient-to-tl from-green-800 via-green-700 to-green-900"
                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                >
                                    <GiClubs className="w-full h-full p-1 text-white drop-shadow-lg" />
                                </motion.div>
                            </div>
                        </div>

                        {/* Shine overlay effect */}
                        <motion.div
                            className="absolute inset-0 opacity-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                            animate={{
                                opacity: [0, 0.5, 0],
                                left: ["-100%", "100%", "100%"]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                repeatDelay: 5
                            }}
                        />
                    </motion.div>

                    <div className="flex flex-col">
                        <div className="relative">
                            <motion.h1
                                key="royal-title"
                                className="text-xl font-bold tracking-widest text-transparent uppercase bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text cinzel-decorative-regular"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                            >
                                Royal
                            </motion.h1>

                            {/* Royal Experience with decorative elements */}
                            <div className="flex items-center gap-1.5 relative">
                                <motion.span
                                    className="h-0.5 w-3 bg-gradient-to-r from-transparent via-amber-500 to-transparent"
                                    initial={{ width: 0 }}
                                    animate={{ width: "12px" }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                />
                                <motion.h1
                                    key="experience-title"
                                    className="text-xl font-bold tracking-widest text-transparent uppercase bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text cinzel-decorative-regular"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                                >
                                    Experience
                                </motion.h1>
                                <motion.span
                                    className="h-0.5 w-3 bg-gradient-to-r from-amber-500 via-amber-500 to-transparent"
                                    initial={{ width: 0 }}
                                    animate={{ width: "12px" }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                />
                            </div>

                            {/* Decorative line */}
                            <motion.div
                                className="absolute left-0 right-0 h-px -bottom-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "100%" }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                            />
                        </div>

                        <motion.div
                            className="flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                        >
                            <motion.span
                                className="text-[0.7rem] font-medium text-gray-400 tracking-widest uppercase relative px-2 mt-1"
                                whileHover={{ color: "#f59e0b" }}
                                transition={{ duration: 0.3 }}
                            >
                                <span className="relative z-10">House Edge</span>
                                <span className="ml-1 font-bold text-amber-500">21</span>

                                {/* Small card suit icons */}
                                <motion.span
                                    className="absolute -left-3 top-0.5 text-amber-600/80"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.8, duration: 0.3 }}
                                >
                                    <GiDiamonds size={8} />
                                </motion.span>
                                <motion.span
                                    className="absolute -right-2 top-0.5 text-amber-600/80"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.9, duration: 0.3 }}
                                >
                                    <GiSpades size={8} />
                                </motion.span>
                            </motion.span>
                        </motion.div>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="items-center hidden gap-1 lg:flex">
                    {navLinks.map((link) => (
                        <div key={link.label} className="relative" ref={el => { dropdownRefs.current[link.label] = el; }}>
                            {link.children ? (
                                <>
                                    <Button
                                        variant="ghost"
                                        onClick={() => toggleDropdown(link.label)}
                                        className={cn(
                                            "px-4 py-2 text-base font-medium",
                                            activeDropdown === link.label ? "text-amber-300" : "text-gray-200 hover:text-amber-300",
                                            activeDropdown === link.label && "bg-amber-900/20"
                                        )}
                                    >
                                        {link.label}
                                        <ChevronDown
                                            size={16}
                                            className={cn(
                                                "ml-1 transition-transform duration-200",
                                                activeDropdown === link.label && "rotate-180"
                                            )}
                                        />
                                    </Button>

                                    <AnimatePresence>
                                        {activeDropdown === link.label && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-full -left-4 mt-1 bg-black/95 border border-amber-900/30 rounded-md shadow-xl py-2 min-w-[220px] z-50"
                                            >
                                                {link.children.map((child) => (
                                                    <Link
                                                        key={child.label}
                                                        href={child.disabled ? "#" : child.href}
                                                        className={cn(
                                                            "px-4 py-2 hover:bg-amber-900/20 text-gray-300 hover:text-amber-300 transition-colors flex items-center gap-2",
                                                            pathname === child.href && "bg-amber-900/30 text-amber-300",
                                                            child.disabled && "opacity-60 cursor-not-allowed"
                                                        )}
                                                        onClick={(e) => {
                                                            if (child.disabled) e.preventDefault();
                                                            setActiveDropdown(null);
                                                        }}
                                                    >
                                                        {child.icon}
                                                        <span>{child.label}</span>
                                                        {child.disabled && (
                                                            <span className="ml-auto text-xs px-1.5 py-0.5 bg-amber-900/30 text-amber-400 rounded">
                                                                SOON
                                                            </span>
                                                        )}
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            ) : (
                                <Link
                                    href={link.href}
                                    className={cn(
                                        "px-4 py-2 text-base font-medium transition-colors",
                                        pathname === link.href
                                            ? "text-amber-300 border-b-2 border-amber-500"
                                            : "text-gray-200 hover:text-amber-300"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Actions Section */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <ModeToggle />

                    {/* Notifications */}
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
                            aria-label="Notifications"
                        >
                            <Bell size={20} />
                            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </Button>
                    </div>

                    {/* User Menu */}
                    <div className="relative" ref={el => { dropdownRefs.current['account'] = el; }}>
                        <Button
                            variant={isLoggedIn ? "outline" : "default"}
                            size="sm"
                            onClick={() => toggleDropdown('account')}
                            className={cn(
                                "ml-2 border-amber-700/40 text-amber-400 hover:bg-amber-900/20",
                                isLoggedIn ? "bg-transparent" : "bg-gradient-to-r from-amber-600 to-amber-500"
                            )}
                        >
                            {isLoggedIn ? (
                                <>
                                    <div className="flex items-center justify-center w-6 h-6 mr-2 text-xs font-semibold text-black rounded-full bg-gradient-to-br from-amber-500 to-amber-700">
                                        VR
                                    </div>
                                    <span className="hidden sm:inline">My Account</span>
                                    <ChevronDown
                                        size={16}
                                        className={cn(
                                            "ml-1 transition-transform duration-200",
                                            activeDropdown === 'account' && "rotate-180"
                                        )}
                                    />
                                </>
                            ) : (
                                <>
                                    <LogIn size={16} className="mr-2" />
                                    <span>Sign In</span>
                                </>
                            )}
                        </Button>

                        <AnimatePresence>
                            {isLoggedIn && activeDropdown === 'account' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full right-0 mt-1 bg-black/95 border border-amber-900/30 rounded-md shadow-xl py-2 min-w-[220px] z-50"
                                >
                                    <div className="px-4 py-2 border-b border-amber-900/20">
                                        <p className="font-medium text-amber-300">Vegas Royal VIP</p>
                                        <p className="text-xs text-gray-400">1,250 chips available</p>
                                    </div>

                                    {accountLinks.map((link) => (
                                        <Link
                                            key={link.label}
                                            href={link.href}
                                            className={cn(
                                                "px-4 py-2 hover:bg-amber-900/20 text-gray-300 hover:text-amber-300 transition-colors flex items-center gap-2",
                                                pathname === link.href && "bg-amber-900/30 text-amber-300"
                                            )}
                                            onClick={() => setActiveDropdown(null)}
                                        >
                                            {link.icon}
                                            <span>{link.label}</span>
                                        </Link>
                                    ))}

                                    <div className="pt-1 mt-1 border-t border-amber-900/20">
                                        <button
                                            className="flex items-center w-full gap-2 px-4 py-2 text-left text-gray-300 transition-colors hover:bg-amber-900/20 hover:text-amber-300"
                                            onClick={() => {
                                                // Handle logout
                                                setActiveDropdown(null);
                                            }}
                                        >
                                            <LogOut size={16} />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {!isLoggedIn && activeDropdown === 'account' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full right-0 mt-1 bg-black/95 border border-amber-900/30 rounded-md shadow-xl py-2 min-w-[220px] z-50"
                                >
                                    <Link
                                        href="/auth/sign-in"
                                        className="flex items-center w-full gap-2 px-4 py-2 text-left text-gray-300 transition-colors hover:bg-amber-900/20 hover:text-amber-300"
                                        onClick={() => setActiveDropdown(null)}
                                    >
                                        <LogIn size={16} />
                                        <span>Sign In</span>
                                    </Link>
                                    <Link
                                        href="/auth/sign-up"
                                        className="flex items-center w-full gap-2 px-4 py-2 text-left text-gray-300 transition-colors hover:bg-amber-900/20 hover:text-amber-300"
                                        onClick={() => setActiveDropdown(null)}
                                    >
                                        <UserPlus size={16} />
                                        <span>Sign Up</span>
                                    </Link>
                                    <div className="pt-1 mt-1 border-t border-amber-900/20">
                                        <Link
                                            href="/auth/reset-password"
                                            className="flex items-center w-full gap-2 px-4 py-2 text-left text-gray-300 transition-colors hover:bg-amber-900/20 hover:text-amber-300"
                                            onClick={() => setActiveDropdown(null)}
                                        >
                                            <KeyRound size={16} />
                                            <span>Forgot Password</span>
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 lg:hidden text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t lg:hidden bg-black/95 border-amber-900/20"
                    >
                        <div className="container px-4 py-4 mx-auto">
                            <nav className="flex flex-col space-y-1">
                                {navLinks.map((link) => (
                                    <div key={link.label}>
                                        {link.children ? (
                                            <>
                                                <button
                                                    onClick={() => toggleDropdown(link.label)}
                                                    className={cn(
                                                        "w-full text-left px-4 py-3 rounded-md flex items-center justify-between",
                                                        activeDropdown === link.label
                                                            ? "bg-amber-900/20 text-amber-300"
                                                            : "text-gray-200 hover:bg-amber-900/10 hover:text-amber-300"
                                                    )}
                                                >
                                                    {link.label}
                                                    <ChevronDown
                                                        size={16}
                                                        className={cn(
                                                            "transition-transform duration-200",
                                                            activeDropdown === link.label && "rotate-180"
                                                        )}
                                                    />
                                                </button>

                                                <AnimatePresence>
                                                    {activeDropdown === link.label && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="pl-4 mt-1 space-y-1"
                                                        >
                                                            {link.children.map((child) => (
                                                                <Link
                                                                    key={child.label}
                                                                    href={child.disabled ? "#" : child.href}
                                                                    className={cn(
                                                                        "px-4 py-2 rounded-md text-gray-300 hover:text-amber-300 flex items-center gap-2",
                                                                        pathname === child.href && "bg-amber-900/30 text-amber-300",
                                                                        child.disabled && "opacity-60 cursor-not-allowed"
                                                                    )}
                                                                    onClick={(e) => {
                                                                        if (child.disabled) e.preventDefault();
                                                                    }}
                                                                >
                                                                    {child.icon}
                                                                    <span>{child.label}</span>
                                                                    {child.disabled && (
                                                                        <span className="ml-auto text-xs px-1.5 py-0.5 bg-amber-900/30 text-amber-400 rounded">
                                                                            SOON
                                                                        </span>
                                                                    )}
                                                                </Link>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className={cn(
                                                    "px-4 py-3 rounded-md text-gray-300 hover:text-amber-300 flex items-center gap-2",
                                                    pathname === link.href
                                                        ? "bg-amber-900/20 text-amber-300"
                                                        : "text-gray-200 hover:bg-amber-900/10 hover:text-amber-300"
                                                )}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {link.label}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </nav>

                            {/* Mobile User Account Section */}
                            {isLoggedIn ? (
                                <div className="pt-6 mt-6 border-t border-amber-900/20">
                                    <div className="flex items-center gap-3 px-4 mb-4">
                                        <div className="flex items-center justify-center w-10 h-10 font-semibold text-black rounded-full bg-gradient-to-br from-amber-500 to-amber-700">
                                            VR
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Vegas Royal</p>
                                            <p className="text-sm text-amber-400">1,250 chips</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        {accountLinks.map((link) => (
                                            <Link
                                                key={link.label}
                                                href={link.href}
                                                className={cn(
                                                    "px-4 py-3 rounded-md text-gray-300 hover:text-amber-300 flex items-center gap-2",
                                                    pathname === link.href && "bg-amber-900/30 text-amber-300"
                                                )}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {link.icon}
                                                <span>{link.label}</span>
                                            </Link>
                                        ))}

                                        {/* Theme Toggle - Mobile */}
                                        <div className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-300">Theme</span>
                                                <ModeToggle />
                                            </div>
                                        </div>

                                        <button
                                            className="flex items-center w-full gap-2 px-4 py-3 mt-2 text-left text-gray-300 rounded-md hover:text-amber-300"
                                            onClick={() => {
                                                // Handle logout
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            <LogOut size={16} />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="pt-6 mt-6 space-y-1 border-t border-amber-900/20">
                                    <Link
                                        href="/auth/sign-in"
                                        className="flex items-center w-full gap-2 px-4 py-3 text-left text-gray-300 rounded-md hover:text-amber-300"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <LogIn size={16} />
                                        <span>Sign In</span>
                                    </Link>
                                    <Link
                                        href="/auth/sign-up"
                                        className="flex items-center w-full gap-2 px-4 py-3 text-left text-gray-300 rounded-md hover:text-amber-300"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <UserPlus size={16} />
                                        <span>Sign Up</span>
                                    </Link>
                                    <Link
                                        href="/auth/reset-password"
                                        className="flex items-center w-full gap-2 px-4 py-3 text-left text-gray-300 rounded-md hover:text-amber-300"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <KeyRound size={16} />
                                        <span>Forgot Password</span>
                                    </Link>

                                    {/* Theme Toggle - Mobile */}
                                    <div className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-300">Theme</span>
                                            <ModeToggle />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}

export default Header;