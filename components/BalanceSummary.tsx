import { StyleSheet, Text, View } from 'react-native';
import { Debt, Member } from '../types';
import { formatAmount } from '../utils/currency';

interface Props {
    debts: Debt[];
    members: Member[];
}

export default function BalanceSummary({ debts, members }: Props) {
    const getName = (id: string) => members.find((m) => m.id === id)?.name || '???';
    const getColor = (id: string) => members.find((m) => m.id === id)?.color || '#888';

    if (debts.length === 0) {
        return (
            <View style={styles.settled}>
                <Text style={styles.settledText}>✅ ¡Todo liquidado!</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {debts.map((debt, index) => (
                <View key={index} style={styles.debtRow}>
                    <Text style={[styles.name, { color: getColor(debt.from) }]}>
                        {getName(debt.from)}
                    </Text>
                    <View style={styles.arrowContainer}>
                        <View style={styles.arrowLine} />
                        <Text style={styles.debtAmount}>{formatAmount(debt.amount)}</Text>
                        <Text style={styles.arrowHead}>→</Text>
                    </View>
                    <Text style={[styles.name, { color: getColor(debt.to) }]}>
                        {getName(debt.to)}
                    </Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 16,
        gap: 12,
    },
    settled: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 16,
        alignItems: 'center',
    },
    settledText: {
        color: '#4ECDC4',
        fontSize: 16,
        fontWeight: '600',
    },
    debtRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        fontSize: 14,
        fontWeight: '700',
        flex: 1,
    },
    arrowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    arrowLine: {
        height: 1,
        width: 20,
        backgroundColor: '#556677',
    },
    debtAmount: {
        color: '#FF6B6B',
        fontSize: 13,
        fontWeight: 'bold',
        marginHorizontal: 6,
    },
    arrowHead: {
        color: '#556677',
        fontSize: 16,
    },
});