'use client'

import { ReactNode, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

export default function AuthLayout({ children }: { readonly children: ReactNode }) {
    // Handle theme initialization to reduce flash of incorrect theme
    const { setTheme, resolvedTheme } = useTheme()

    useEffect(() => {
        // Check user preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (!resolvedTheme) {
            setTheme(prefersDark ? 'dark' : 'light')
        }
    }, [resolvedTheme, setTheme])

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1,
                duration: 0.3
            }
        }
    }

    const childVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100
            }
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4 pt-24 overflow-hidden sm:p-6 sm:pt-28 md:p-8 md:pt-32">
            {/* Enhanced background with subtle pattern overlay */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-black dark:to-slate-900">
                <div className="absolute inset-0 opacity-[0.03] bg-[url('/assets/noise.png')] pointer-events-none" aria-hidden="true" />
                <div className="absolute inset-0 bg-grid-slate-950/[0.02] bg-[size:20px_20px] pointer-events-none dark:bg-grid-slate-100/[0.02]" aria-hidden="true" />
            </div>

            {/* Content container with staggered animations */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 w-full max-w-md"
            >
                {/* Card effect with subtle shadow - increased opacity for better readability */}
                <motion.div
                    variants={childVariants}
                    className="relative overflow-hidden rounded-2xl border border-slate-200/20 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 shadow-xl dark:shadow-2xl-dark text-slate-900 dark:text-slate-100"
                >
                    {/* Top highlight effect */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/20 to-transparent" />

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                        {children}
                    </div>

                    {/* Bottom highlight effect */}
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-900/10 to-transparent" />
                </motion.div>

                {/* Subtle branding or attribution if needed */}
                <motion.div
                    variants={childVariants}
                    className="mt-4 text-center"
                >
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        Royal Edge Casino © {new Date().getFullYear()}
                    </p>
                </motion.div>
            </motion.div>
        </div>
    )
}