import { ReactElement } from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { BlackjackReportProps } from './types';

// Define styles for PDF
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    header: {
        backgroundColor: '#282C34',
        padding: 20,
        marginBottom: 10,
    },
    headerText: {
        fontSize: 24,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    reportMetadata: {
        fontSize: 10,
        color: '#969696',
        textAlign: 'center',
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 16,
        color: '#0066CC',
        marginTop: 20,
        marginBottom: 8,
    },
    statsGrid: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    statItem: {
        width: '50%',
        padding: 5,
    },
    statLabel: {
        fontSize: 10,
        color: '#505050',
    },
    statValue: {
        fontSize: 14,
        color: '#282828',
        fontWeight: 'bold',
    },
    gameHistoryTable: {
        marginTop: 10,
        marginBottom: 20,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        paddingVertical: 5,
    },
    tableHeader: {
        backgroundColor: '#F4F4F4',
    },
    tableCell: {
        flex: 1,
        fontSize: 10,
        padding: 5,
    },
    outcomeWin: {
        color: '#38A169',
    },
    outcomeLoss: {
        color: '#E53E3E',
    },
    outcomePush: {
        color: '#718096',
    },
    footer: {
        position: 'absolute',
        bottom: 10,
        left: 20,
        right: 20,
        fontSize: 9,
        color: '#969696',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

// Format date for display
const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Get outcome style based on result
const getOutcomeStyle = (outcome: string) => {
    switch (outcome.toLowerCase()) {
        case 'win':
            return styles.outcomeWin;
        case 'loss':
            return styles.outcomeLoss;
        case 'push':
            return styles.outcomePush;
        default:
            return {};
    }
};

export function BlackjackReportPDF({
    playerName,
    sessionDate,
    totalHands,
    winCount,
    lossCount,
    pushCount,
    blackjackCount,
    bustCount,
    netProfit,
    handHistory,
}: Readonly<BlackjackReportProps>): ReactElement {
    const currentYear = new Date().getFullYear();
    const winRate = totalHands > 0 ? (winCount / totalHands * 100).toFixed(1) : '0.0';

    return (
        <Document title="House Edge Blackjack - Game Report">
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>House Edge Blackjack - Game Report</Text>
                    <Text style={styles.reportMetadata}>
                        Session for {playerName} on {formatDate(sessionDate)}
                    </Text>
                </View>

                {/* Game Stats Summary */}
                <Text style={styles.sectionTitle}>Game Statistics</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total Hands</Text>
                        <Text style={styles.statValue}>{totalHands}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Win Rate</Text>
                        <Text style={styles.statValue}>{winRate}%</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Wins</Text>
                        <Text style={styles.statValue}>{winCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Losses</Text>
                        <Text style={styles.statValue}>{lossCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Pushes</Text>
                        <Text style={styles.statValue}>{pushCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Blackjacks</Text>
                        <Text style={styles.statValue}>{blackjackCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Busts</Text>
                        <Text style={styles.statValue}>{bustCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Net Profit</Text>
                        <Text style={{ ...styles.statValue, color: netProfit >= 0 ? '#38A169' : '#E53E3E' }}>
                            ${netProfit.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Hand History */}
                {handHistory && handHistory.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Hand History</Text>
                        <View style={styles.gameHistoryTable}>
                            {/* Table Header */}
                            <View style={{ ...styles.tableRow, ...styles.tableHeader }}>
                                <Text style={styles.tableCell}>Hand #</Text>
                                <Text style={styles.tableCell}>Bet</Text>
                                <Text style={styles.tableCell}>Player</Text>
                                <Text style={styles.tableCell}>Dealer</Text>
                                <Text style={styles.tableCell}>Outcome</Text>
                                <Text style={styles.tableCell}>Profit</Text>
                            </View>

                            {/* Table Rows */}
                            {handHistory.map((hand, index) => {
                                // Create a stable key from hand properties
                                const stableKey = `hand-${hand.playerTotal}-${hand.dealerTotal}-${hand.outcome}-${hand.bet}-${hand.profit}`;

                                return (
                                    <View key={stableKey} style={styles.tableRow}>
                                        <Text style={styles.tableCell}>{index + 1}</Text>
                                        <Text style={styles.tableCell}>${hand.bet.toFixed(2)}</Text>
                                        <Text style={styles.tableCell}>{hand.playerTotal}</Text>
                                        <Text style={styles.tableCell}>{hand.dealerTotal}</Text>
                                        <Text style={{ ...styles.tableCell, ...getOutcomeStyle(hand.outcome) }}>
                                            {hand.outcome}
                                        </Text>
                                        <Text style={{
                                            ...styles.tableCell,
                                            color: hand.profit >= 0 ? '#38A169' : '#E53E3E'
                                        }}>
                                            ${hand.profit.toFixed(2)}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>© {currentYear} House Edge Blackjack. All rights reserved.</Text>
                    <Text render={({ pageNumber, totalPages }) => (
                        `Page ${pageNumber} of ${totalPages}`
                    )} />
                </View>
            </Page>
        </Document>
    );
}