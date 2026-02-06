import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { getExpenseParticipants } from '../../../../database/queries';
import { useExpenseStore } from '../../../../store/useExpenseStore';
import { useGroupStore } from '../../../../store/useGroupStore';
import { Member } from '../../../../types';
import { formatAmount } from '../../../../utils/currency';

export default function ExpenseDetail() {
    const { id, expenseId } = useLocalSearchParams<{ id: string; expenseId: string }>();
    const router = useRouter();
    const navigation = useNavigation();
    const { members, loadMembers } = useGroupStore();
    const { expenses, loadExpenses, removeExpense } = useExpenseStore();

    const groupMembers = members[id!] || [];
    const groupExpenses = expenses[id!] || [];
    const expense = groupExpenses.find((e) => e.id === expenseId);

    const [participantIds, setParticipantIds] = useState<string[]>([]);

    useLayoutEffect(() => {
        navigation.setOptions({ title: expense?.description || 'Gasto' });
    }, [expense, navigation]);

    useEffect(() => {
        if (id) loadMembers(id);
        if (id && groupExpenses.length === 0) loadExpenses(id);
    }, [id]);

    useEffect(() => {
        const loadParticipants = async () => {
            if (!expenseId) return;
            const participants = await getExpenseParticipants(expenseId);
            setParticipantIds(participants.map((p) => p.member_id));
        };
        loadParticipants();
    }, [expenseId]);

    const getMember = (memberId: string): Member | undefined => {
        return groupMembers.find((m) => m.id === memberId);
    };

    const handleDelete = () => {
        Alert.alert(
            'Eliminar gasto',
            '¿Estás seguro de que quieres eliminar este gasto?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        await removeExpense(id!, expenseId!);
                        router.back();
                    },
                },
            ]
        );
    };

    if (!expense) {
        return (
            <View style={styles.center}>
                <Text style={styles.text}>Gasto no encontrado</Text>
            </View>
        );
    }

    const payer = getMember(expense.paid_by);
    const sharePerPerson = participantIds.length > 0
        ? Math.floor(expense.amount / participantIds.length)
        : 0;

    return (
        <View style={styles.container}>
            {/* Importe */}
            <View style={styles.amountSection}>
                <Text style={styles.amount}>{formatAmount(expense.amount)}</Text>
                <Text style={styles.description}>{expense.description}</Text>
                <Text style={styles.date}>
                    {new Date(expense.created_at).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </Text>
            </View>

            {/* Quién pagó */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pagado por</Text>
                <View style={styles.row}>
                    <View style={[styles.avatar, { backgroundColor: payer?.color || '#888' }]}>
                        <Text style={styles.avatarText}>
                            {payer?.name.charAt(0).toUpperCase() || '?'}
                        </Text>
                    </View>
                    <Text style={styles.memberName}>{payer?.name || '???'}</Text>
                    <Text style={styles.memberAmount}>{formatAmount(expense.amount)}</Text>
                </View>
            </View>

            {/* Participantes */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Dividido entre {participantIds.length} personas
                </Text>
                {participantIds.map((memberId) => {
                    const member = getMember(memberId);
                    return (
                        <View key={memberId} style={styles.row}>
                            <View style={[styles.avatar, { backgroundColor: member?.color || '#888' }]}>
                                <Text style={styles.avatarText}>
                                    {member?.name.charAt(0).toUpperCase() || '?'}
                                </Text>
                            </View>
                            <Text style={styles.memberName}>{member?.name || '???'}</Text>
                            <Text style={styles.memberShare}>{formatAmount(sharePerPerson)}</Text>
                        </View>
                    );
                })}
            </View>

            {/* Botón eliminar */}
            <Pressable style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.deleteBtnText}>🗑️ Eliminar gasto</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#16213e',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#16213e',
    },
    text: {
        color: '#fff',
        fontSize: 16,
    },
    amountSection: {
        alignItems: 'center',
        paddingVertical: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a2e',
    },
    amount: {
        color: '#4ECDC4',
        fontSize: 42,
        fontWeight: 'bold',
    },
    description: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 8,
    },
    date: {
        color: '#8899aa',
        fontSize: 14,
        marginTop: 6,
        textTransform: 'capitalize',
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        color: '#8899aa',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    memberName: {
        color: '#fff',
        fontSize: 16,
        flex: 1,
    },
    memberAmount: {
        color: '#4ECDC4',
        fontSize: 16,
        fontWeight: 'bold',
    },
    memberShare: {
        color: '#FF6B6B',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteBtn: {
        marginHorizontal: 16,
        marginTop: 8,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#2a1a2e',
        alignItems: 'center',
    },
    deleteBtnText: {
        color: '#FF6B6B',
        fontSize: 16,
        fontWeight: '600',
    },
});