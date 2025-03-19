"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
    Github,
    Twitter,
    Instagram,
    Facebook,
    ChevronUp,
    Shield,
    HelpCircle,
    ArrowUpRight,
    Lightbulb,
    ExternalLink
} from "lucide-react";
import { Button } from "@/ui/layout/button";
import { cn } from "@/lib/utils";

// Define link group type
interface FooterLinkGroup {
    title: string;
    links: Array<{
        label: string;
        href: string;
        isNew?: boolean;
        isExternal?: boolean;
    }>;
}

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            delay: delay * 0.1
        }
    })
};

// FooterLinkGroup component
const FooterLinkGroupComponent = ({
    title,
    links,
    delay = 0
}: FooterLinkGroup & { delay?: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    return (
        <motion.div
            ref={ref}
            variants={fadeInUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            custom={delay}
            className="flex flex-col gap-3"
        >
            <h3 className="text-sm font-semibold tracking-wider uppercase text-amber-300 font-playfair">
                {title}
            </h3>
            <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                    <li key={link.label}>
                        <Link
                            href={link.href}
                            target={link.isExternal ? "_blank" : undefined}
                            rel={link.isExternal ? "noopener noreferrer" : undefined}
                            className="flex items-center gap-1 text-sm text-gray-300 transition-colors hover:text-amber-300 group"
                        >
                            {link.label}
                            {link.isExternal && (
                                <ExternalLink size={12} className="text-gray-500 group-hover:text-amber-300" />
                            )}
                            {link.isNew && (
                                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-amber-900/30 text-amber-300 rounded-sm">
                                    NEW
                                </span>
                            )}
                        </Link>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
};

export function Footer() {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [emailValue, setEmailValue] = useState("");
    const [emailError, setEmailError] = useState("");
    const [emailSuccess, setEmailSuccess] = useState(false);

    const currentYear = new Date().getFullYear();
    const footerRef = useRef(null);
    const newsletterRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(footerRef, { once: true, amount: 0.1 });
    const isNewsletterInView = useInView(newsletterRef, { once: true, amount: 0.5 });

    // Footer link groups
    const linkGroups: FooterLinkGroup[] = [
        {
            title: "Casino",
            links: [
                { label: "Home", href: "/" },
                { label: "Games", href: "/game" },
                { label: "Leaderboard", href: "/leaderboard" },
                { label: "Tournaments", href: "/tournaments", isNew: true },
            ],
        },
        {
            title: "Account",
            links: [
                { label: "Sign In", href: "/auth/sign-in" },
                { label: "Sign Up", href: "/auth/sign-up" },
                { label: "Profile", href: "/auth/profile" },
                { label: "Reset Password", href: "/auth/reset-password" },
                { label: "VIP Program", href: "/vip", isNew: true },
            ],
        },
        {
            title: "Resources",
            links: [
                { label: "Strategy Guide", href: "/strategy-guide" },
                { label: "Probability Charts", href: "/probability" },
                { label: "Card Counting", href: "/card-counting" },
                { label: "Game Rules", href: "/house-rules" },
            ],
        },
        {
            title: "Support",
            links: [
                { label: "Contact Us", href: "/contact-us" },
                { label: "FAQ", href: "/faq" },
                { label: "Terms & Conditions", href: "/terms-of-service" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "About Us", href: "/about-us" },
            ],
        },
        {
            title: "Community",
            links: [
                { label: "Twitter", href: "https://twitter.com", isExternal: true },
                { label: "Discord", href: "https://discord.com", isExternal: true },
                { label: "Blog", href: "/blog" },
                { label: "Responsible Gaming", href: "/responsible-gaming" },
            ],
        },
    ];

    // Handle email submission
    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Simple email validation
        if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
            setEmailError("Please enter a valid email address");
            setEmailSuccess(false);
            return;
        }

        // Success state
        setEmailError("");
        setEmailSuccess(true);
        setEmailValue("");

        // Reset success message after 3 seconds
        setTimeout(() => {
            setEmailSuccess(false);
        }, 3000);
    };

    // Scroll to top button visibility
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Scroll to top handler
    const handleScrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <footer
            ref={footerRef}
            className="relative pt-10 bg-black border-t border-amber-900/20"
        >
            {/* Main Footer Content */}
            <div className="container relative z-10 px-4 mx-auto mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6"
                >
                    {/* Logo & Description */}
                    <div className="flex flex-col gap-4 lg:col-span-2">
                        <div className="flex items-center gap-2">
                            <div className="flex">
                                <div className="flex items-center justify-center w-8 h-8 bg-black border rounded-md shadow-lg border-amber-700/50">
                                    <div className="text-2xl text-transparent bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text">21</div>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300 bg-clip-text font-playfair">
                                    HOUSE EDGE BLACKJACK
                                </h2>
                                <span className="-mt-1 text-xs tracking-widest uppercase text-amber-500/70">Royal Experience</span>
                            </div>
                        </div>

                        <p className="text-sm leading-relaxed text-gray-400">
                            Experience the authentic thrill of Las Vegas in our premium blackjack game.
                            Featuring realistic card physics, advanced betting systems, and sophisticated
                            probability analysis for the ultimate casino experience.
                        </p>

                        {/* Social Media */}
                        <div className="flex gap-4 mt-1">
                            {[
                                { icon: <Twitter size={18} />, href: "https://twitter.com" },
                                { icon: <Facebook size={18} />, href: "https://facebook.com" },
                                { icon: <Instagram size={18} />, href: "https://instagram.com" },
                                { icon: <Github size={18} />, href: "https://github.com" }
                            ].map((social) => (
                                <motion.a
                                    key={social.href}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-gray-500 transition-colors hover:text-amber-400"
                                >
                                    {social.icon}
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Link Groups */}
                    {linkGroups.map((group, i) => (
                        <FooterLinkGroupComponent
                            key={group.title}
                            title={group.title}
                            links={group.links}
                            delay={i}
                        />
                    ))}
                </motion.div>

                {/* Responsible Gaming Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="relative px-6 py-5 mt-10 border rounded-xl bg-gradient-to-r from-amber-950 via-amber-900/20 to-amber-950 border-amber-800/30"
                >
                    <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-amber-900/30">
                                <Shield className="text-amber-400" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-amber-300 font-playfair">Responsible Gaming</h3>
                                <p className="mt-1 text-sm text-gray-400">Play for entertainment, not for profit.</p>
                            </div>
                        </div>

                        <div className="flex items-center flex-1">
                            <div className="hidden w-px h-full mr-6 bg-amber-900/30 md:block"></div>
                            <p className="text-sm text-gray-300">
                                We promote responsible gaming and are committed to providing a safe, fair, and enjoyable experience for all our players.
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="whitespace-nowrap border-amber-700/40 text-amber-400 hover:bg-amber-900/30 hover:text-amber-300"
                        >
                            <HelpCircle size={14} className="mr-2" />
                            Get Support
                        </Button>
                    </div>
                </motion.div>

                {/* Newsletter */}
                <motion.div
                    ref={newsletterRef}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isNewsletterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-col items-center gap-8 pt-8 mt-8 border-t md:flex-row border-amber-900/20"
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-xl font-semibold text-white">
                            <Lightbulb size={18} className="text-amber-400" />
                            <div>Get Blackjack Tips & Offers</div>
                        </div>
                        <div className="mt-2 text-sm text-gray-400">
                            Join our newsletter for exclusive gambling strategies, promotions, and casino news.
                        </div>
                    </div>

                    <form className="flex flex-col flex-1 w-full gap-2" onSubmit={handleEmailSubmit}>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Your email address"
                                value={emailValue}
                                onChange={(e) => setEmailValue(e.target.value)}
                                className={cn(
                                    "bg-black/50 border text-white px-4 py-2 rounded-l-md w-full focus:outline-none focus:ring-1",
                                    emailError ? "border-red-700/50 focus:ring-red-600" : "border-amber-900/30 focus:ring-amber-600"
                                )}
                            />
                            <Button
                                type="submit"
                                className="font-medium text-black border-0 rounded-l-none bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400"
                            >
                                Subscribe
                                <ArrowUpRight size={16} className="ml-2" />
                            </Button>
                        </div>

                        {/* Form feedback messages */}
                        <AnimatePresence mode="wait">
                            {emailError && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-xs text-red-400"
                                >
                                    {emailError}
                                </motion.p>
                            )}

                            {emailSuccess && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-xs text-green-400"
                                >
                                    Thank you for subscribing!
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </form>
                </motion.div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-amber-900/10 bg-black/50">
                <div className="container px-4 py-4 mx-auto">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="text-sm text-gray-500">
                            &copy; {currentYear} HOUSE EDGE BLACKJACK. All rights reserved.
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-xs text-gray-600">
                                <Link href="/terms-of-service" className="transition-colors hover:text-amber-400">Terms</Link>
                                <span className="mx-2">•</span>
                                <Link href="/privacy-policy" className="transition-colors hover:text-amber-400">Privacy</Link>
                                <span className="mx-2">•</span>
                                <Link href="/cookies" className="transition-colors hover:text-amber-400">Cookies</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll to top button */}
            <motion.button
                onClick={handleScrollToTop}
                className="fixed z-50 p-3 text-white rounded-full shadow-lg bottom-6 right-6 bg-amber-800/80 hover:bg-amber-700"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                    opacity: showScrollTop ? 1 : 0,
                    scale: showScrollTop ? 1 : 0.8,
                    y: showScrollTop ? 0 : 20
                }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Scroll to top"
            >
                <ChevronUp size={20} />
            </motion.button>
        </footer>
    );
}

export default Footer;