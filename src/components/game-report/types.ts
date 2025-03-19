export interface HandHistoryItem {
    bet: number;
    playerTotal: number;
    dealerTotal: number;
    outcome: 'Win' | 'Loss' | 'Push' | 'Blackjack';
    profit: number;
}

export interface BlackjackReportProps {
    playerName: string;
    sessionDate: string;
    totalHands: number;
    winCount: number;
    lossCount: number;
    pushCount: number;
    blackjackCount: number;
    bustCount: number;
    totalBet: number;
    totalWinnings: number;
    netProfit: number;
    handHistory?: HandHistoryItem[];
}