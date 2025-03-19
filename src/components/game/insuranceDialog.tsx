'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/ui/dialog';
import { Button } from '@/ui/layout/button';
import {
    calculateInsuranceBet,
    getDealerBlackjackProbability,
    getInsuranceExpectedValue
} from '@/services/insurance-service';
import { useGameStore, useCardCounting } from '@/store/hooks/useGameStore';
import { formatCurrency } from '@/lib/utils/format';
import { motion } from 'framer-motion';

// Define props interface with clear types
interface InsuranceDialogProps {
    isOpen: boolean;
    onInsurance: () => void;
    onDecline: () => void;
    onEvenMoney?: () => void;
    showProbability?: boolean;
}

// Wrap component with React.memo to prevent unnecessary re-renders
export const InsuranceDialog = React.memo(({
    isOpen,
    onInsurance,
    onDecline,
    onEvenMoney,
    showProbability = false
}: InsuranceDialogProps) => {
    // Use individual primitive selectors to avoid object reference changes
    const chips = useGameStore(state => state.chips);
    const bet = useGameStore(state => state.bet);
    const playerHand = useGameStore(state => state.playerHand);

    // Use the memoized hook for card counting data
    const { runningCount } = useCardCounting();

    const [animateCard, setAnimateCard] = useState(false);

    // Memoize all derived values to avoid recalculations
    const insuranceAmount = useMemo(() => calculateInsuranceBet(bet), [bet]);

    // Safely access playerHand properties with null checks
    const hasBlackjack = useMemo(() => Boolean(playerHand?.isBlackjack), [playerHand]);

    // Memoize probability calculations
    const blackjackProbability = useMemo(() =>
        getDealerBlackjackProbability(runningCount, 6),
        [runningCount]
    );

    const probabilityPercent = useMemo(() =>
        Math.round(blackjackProbability * 100),
        [blackjackProbability]
    );

    const expectedValue = useMemo(() =>
        getInsuranceExpectedValue(insuranceAmount, blackjackProbability),
        [insuranceAmount, blackjackProbability]
    );

    const isEVPositive = useMemo(() => expectedValue > 0, [expectedValue]);
    const canAffordInsurance = useMemo(() => chips >= insuranceAmount, [chips, insuranceAmount]);

    // Format currency values for display
    const formattedInsuranceAmount = useMemo(() => formatCurrency(insuranceAmount), [insuranceAmount]);
    const formattedInsurancePayout = useMemo(() => formatCurrency(insuranceAmount * 2), [insuranceAmount]);
    const formattedExpectedValue = useMemo(() => formatCurrency(expectedValue), [expectedValue]);

    // Animation methods with stable callback references
    const showAnimation = useCallback(() => {
        setTimeout(() => {
            setAnimateCard(true);
        }, 300);
    }, []);

    const hideAnimation = useCallback(() => {
        setAnimateCard(false);
    }, []);

    // Effect for showing animation when dialog opens
    useEffect(() => {
        if (!isOpen) return;
        showAnimation();
    }, [isOpen, showAnimation]);

    // Separate effect for hiding animation when dialog closes
    useEffect(() => {
        if (isOpen) return;
        hideAnimation();
    }, [isOpen, hideAnimation]);

    // Prevent uncontrolled component issues by avoiding transitions between
    // controlled and uncontrolled states
    const handleClose = useCallback(() => {
        onDecline();
    }, [onDecline]);

    // Memoize button components to prevent unnecessary re-renders
    const declineButton = useMemo(() => (
        <Button
            variant="destructive"
            onClick={onDecline}
        >
            Decline
        </Button>
    ), [onDecline]);

    const insuranceButton = useMemo(() => (
        <Button
            variant="outline"
            disabled={!canAffordInsurance}
            onClick={onInsurance}
            className="border-amber-500 text-amber-400 hover:bg-amber-900"
        >
            Take Insurance ({formattedInsuranceAmount})
        </Button>
    ), [canAffordInsurance, onInsurance, formattedInsuranceAmount]);

    const evenMoneyButton = useMemo(() => {
        if (!hasBlackjack || !onEvenMoney) return null;

        return (
            <Button
                variant="default"
                onClick={onEvenMoney}
                className="bg-green-600 hover:bg-green-700"
            >
                Take Even Money
            </Button>
        );
    }, [hasBlackjack, onEvenMoney]);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="text-white bg-gray-900 border-gray-700 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">Insurance Offered</DialogTitle>
                    <DialogDescription className="text-gray-300">
                        Dealer is showing an Ace. Would you like to take insurance?
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="flex flex-col items-center justify-center">
                        <motion.div
                            initial={{ rotateY: 0 }}
                            animate={animateCard ? { rotateY: 360 } : {}}
                            transition={{ duration: 0.7 }}
                            className="flex items-center justify-center w-20 h-32 mb-4 text-4xl font-bold text-red-600 bg-white rounded-lg"
                        >
                            A&hearts;
                        </motion.div>
                        <div className="text-sm text-amber-400">Dealer&apos;s Up Card</div>
                    </div>

                    <div className="flex flex-col justify-center">
                        <h3 className="mb-2 text-lg font-bold">Insurance Details</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Cost:</span>
                                <span className="font-medium">{formattedInsuranceAmount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Pays:</span>
                                <span className="font-medium">2:1</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Win amount:</span>
                                <span className="font-medium">{formattedInsurancePayout}</span>
                            </div>

                            {showProbability && (
                                <>
                                    <div className="flex justify-between">
                                        <span>Dealer BJ Probability:</span>
                                        <span className="font-medium">{probabilityPercent}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Expected Value:</span>
                                        <span className={isEVPositive ? "text-green-400" : "text-red-400"}>
                                            {formattedExpectedValue}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-row">
                    {declineButton}
                    {insuranceButton}
                    {evenMoneyButton}
                </DialogFooter>

                {!canAffordInsurance && (
                    <div className="mt-2 text-sm text-center text-red-400">
                        Not enough chips for insurance bet
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
});

// Add display name for better debugging
InsuranceDialog.displayName = 'InsuranceDialog';

export default InsuranceDialog;