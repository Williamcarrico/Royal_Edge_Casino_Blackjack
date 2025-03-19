'use client'

import { BlackjackReportPDF } from './BlackjackReportPDF';
import { PDFDownloadButton } from '@/components/ui/pdf-download-button';
import type { BlackjackReportProps } from './types';

interface GameReportButtonProps {
    readonly reportData: BlackjackReportProps;
}

export function GameReportButton({
    reportData,
}: GameReportButtonProps) {
    const fileName = `${reportData.playerName.replace(/\s+/g, '-')}-blackjack-report-${new Date().toISOString().split('T')[0]}.pdf`;

    return (
        <PDFDownloadButton
            document={<BlackjackReportPDF {...reportData} />}
            fileName={fileName}
        >
            Download Game Report
        </PDFDownloadButton>
    );
}