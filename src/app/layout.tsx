// src/app/layout.tsx
import React from 'react';
import { Inter, Playfair_Display } from 'next/font/google';
import { Metadata, Viewport } from 'next';
import { Header } from '@/lib/layout/Navbar';
import { Footer } from '@/lib/layout/Footer';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/ui/theme-provider';
import { Toaster } from '@/ui/toaster';
import './globals.css';
import { Toaster as SonnerToaster } from 'sonner';
import { AuthProvider } from '@/contexts/auth-context';

// Configure fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'House Edge Blackjack | Premium Casino Experience',
  description: 'Experience the authentic thrill of Las Vegas in our premium blackjack game with realistic card physics, advanced betting systems, and sophisticated probability analysis.',
  keywords: 'blackjack, casino, card game, gambling, strategy, vegas',
  authors: [{ name: 'House Edge Gaming' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const themeColor = "#000000";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn(
        'min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white antialiased',
        inter.variable,
        playfair.variable,
        'font-sans'
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="relative flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
            <SonnerToaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}