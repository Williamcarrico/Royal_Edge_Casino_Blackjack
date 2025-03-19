"use client";

import { motion } from "framer-motion";
import { FaHeart } from "react-icons/fa";
import { GiClubs, GiSpades, GiDiamonds } from "react-icons/gi";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    variant?: "default" | "subtle";
    label?: string;
}

export function LoadingSpinner({
    size = "md",
    variant = "default",
    label,
}: Readonly<LoadingSpinnerProps>) {
    // Sizing
    const sizeMap = {
        sm: {
            container: "h-16 w-16",
            icon: "h-5 w-5",
            text: "text-xs",
            orbit: 5,
        },
        md: {
            container: "h-24 w-24",
            icon: "h-6 w-6",
            text: "text-sm",
            orbit: 8,
        },
        lg: {
            container: "h-32 w-32",
            icon: "h-7 w-7",
            text: "text-base",
            orbit: 10,
        },
    };

    // Styling
    const variantMap = {
        default: {
            text: "text-white/90",
            bgColor: "bg-black/75 backdrop-blur-md",
            borderColor: "border-amber-600/30",
        },
        subtle: {
            text: "text-white/80",
            bgColor: "bg-black/30 backdrop-blur-sm",
            borderColor: "border-amber-600/20",
        },
    };

    const { container, icon, text, orbit } = sizeMap[size];
    const { text: textColor, bgColor, borderColor } = variantMap[variant];

    // Animation variants
    const containerVariants = {
        animate: {
            rotate: 360,
            transition: {
                duration: 10,
                ease: "linear",
                repeat: Infinity,
            },
        },
    };

    const iconVariants = {
        animate: (i: number) => ({
            scale: [1, 1.2, 1],
            y: [0, -2, 0],
            transition: {
                duration: 1.5,
                delay: i * 0.25,
                repeat: Infinity,
                repeatType: "reverse" as const,
            },
        }),
    };

    const cardSuits = [
        { id: "spades", icon: <GiSpades className={`${icon} text-white`} />, color: "bg-black" },
        { id: "hearts", icon: <FaHeart className={`${icon} text-red-600`} />, color: "bg-red-100" },
        { id: "diamonds", icon: <GiDiamonds className={`${icon} text-amber-500`} />, color: "bg-amber-100" },
        { id: "clubs", icon: <GiClubs className={`${icon} text-green-700`} />, color: "bg-green-100" },
    ];

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className={`relative ${container}`}>
                {/* Decorative circle */}
                <div className={`absolute inset-0 rounded-full border-2 ${borderColor} ${bgColor}`} />

                {/* Spinning outer circle */}
                <motion.div
                    className="absolute inset-0"
                    variants={containerVariants}
                    animate="animate"
                >
                    {cardSuits.map((suit, index) => {
                        // Position suits in a circle
                        const angle = (index * (2 * Math.PI)) / cardSuits.length;
                        const x = Math.cos(angle) * orbit;
                        const y = Math.sin(angle) * orbit;

                        return (
                            <motion.div
                                key={suit.id}
                                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 p-1 rounded-full ${suit.color}`}
                                style={{
                                    x: `${x}rem`,
                                    y: `${y}rem`,
                                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
                                }}
                                variants={iconVariants}
                                custom={index}
                                animate="animate"
                            >
                                {suit.icon}
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Vegas21 chip in the center */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-gradient-to-r from-amber-800 to-amber-700 flex items-center justify-center border-2 border-amber-500 shadow-lg">
                    <motion.div
                        className="text-xs font-bold text-amber-300"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        VEGAS21
                    </motion.div>
                </div>
            </div>

            {/* Optional label */}
            {label && (
                <motion.p
                    className={`${text} ${textColor} font-medium`}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    {label}
                </motion.p>
            )}
        </div>
    );
}

// Loading Spinner with context
export function FullPageLoadingSpinner({ message = "Loading..." }: Readonly<{ message?: string }>) {
    // Using the Z_INDEX.LOADING constant for the full page spinner
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-50">
            <div className="bg-black/80 p-8 rounded-xl border border-amber-900/30 shadow-lg shadow-amber-900/10 flex flex-col items-center">
                <LoadingSpinner size="lg" label={message} />
            </div>
        </div>
    );
}

// Smaller inline spinner
export function InlineLoadingSpinner() {
    return <LoadingSpinner size="sm" variant="subtle" />;
}

export default LoadingSpinner;