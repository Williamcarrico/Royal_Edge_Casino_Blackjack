"use client";

/** @jsxImportSource react */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Button } from '@/ui/layout/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    isNew: boolean;
}

export function NotificationsPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Sample notifications data
    const notifications: Notification[] = [
        { id: 1, title: "Daily Bonus Ready!", message: "Claim your 1,000 chip daily bonus now", time: "Just now", isNew: true },
        { id: 2, title: "Weekend Tournament", message: "Join our high-stakes tournament this weekend", time: "2 hours ago", isNew: true },
        { id: 3, title: "New Strategy Guide", message: "Check out our updated blackjack strategy guide", time: "Yesterday", isNew: false },
    ];

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Animation variants
    const panelVariants = {
        hidden: { opacity: 0, y: 10, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.2 } }
    };

    // Toggle panel
    const togglePanel = () => setIsOpen(!isOpen);

    return (
        <div className="relative" ref={panelRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={togglePanel}
                className="relative text-amber-400 hover:text-amber-300 hover:bg-amber-900/10"
                aria-label="Notifications"
                aria-expanded={isOpen}
            >
                <Bell size={20} />
                {notifications.some(n => n.isNew) && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 z-50 mt-2 overflow-hidden bg-black border rounded-md shadow-lg w-80 border-amber-900/30"
                    >
                        <div className="p-4 border-b border-amber-900/20">
                            <h3 className="font-semibold text-amber-400">Notifications</h3>
                        </div>

                        <div className="overflow-y-auto max-h-96">
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "p-4 hover:bg-amber-900/10 transition-colors border-b border-amber-900/10 relative",
                                            notification.isNew && "bg-amber-900/5"
                                        )}
                                    >
                                        {notification.isNew && (
                                            <span className="absolute w-2 h-2 rounded-full top-4 right-4 bg-amber-500" />
                                        )}
                                        <h4 className="font-medium text-white">{notification.title}</h4>
                                        <p className="mt-1 text-sm text-gray-400">{notification.message}</p>
                                        <span className="block mt-2 text-xs text-amber-500/70">{notification.time}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center">
                                    <p className="text-sm text-gray-400">No notifications</p>
                                </div>
                            )}
                        </div>

                        <div className="p-3 text-center bg-amber-900/10">
                            <Link
                                href="/notifications"
                                className="text-sm transition-colors text-amber-400 hover:text-amber-300"
                                onClick={() => setIsOpen(false)}
                            >
                                View All Notifications
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default NotificationsPanel;