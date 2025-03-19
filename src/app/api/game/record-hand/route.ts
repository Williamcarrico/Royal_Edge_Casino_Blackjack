import { NextRequest, NextResponse } from 'next/server'
import { GameService } from '@/services/supabase/game-service'
import { AuthService } from '@/services/supabase/auth-service'
import { Card, RoundResult } from '@/lib/utils/gameLogic'

/**
 * API route for recording a completed hand
 */
export async function POST(request: NextRequest) {
    try {
        const { user, error } = await AuthService.getCurrentUser()

        if (!user || error) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const {
            sessionId,
            betAmount,
            playerCards,
            dealerCards,
            actions,
            result,
            payout,
            sideBets
        } = await request.json() as {
            sessionId: string;
            betAmount: number;
            playerCards: Card[];
            dealerCards: Card[];
            actions: string[];
            result: RoundResult;
            payout: number;
            sideBets?: any;
        }

        // Record the hand in the database
        const handId = await GameService.recordHand(
            sessionId,
            user.id,
            betAmount,
            playerCards,
            dealerCards,
            actions,
            result,
            payout,
            sideBets
        )

        // Update user chips
        const userProfile = await AuthService.getUserProfile(user.id)
        if (userProfile) {
            const newChips = userProfile.chips + payout - betAmount
            await AuthService.updateUserProfile(user.id, { chips: newChips })
        }

        return NextResponse.json({
            success: true,
            handId
        })
    } catch (error) {
        console.error('Error recording hand:', error)
        return NextResponse.json(
            { error: 'Failed to record hand' },
            { status: 500 }
        )
    }
}