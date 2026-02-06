import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import BalanceSummary from '../../components/BalanceSummary';
import { getParticipantsMapByGroup } from '../../database/queries';
import { useExpenseStore } from '../../store/useExpenseStore';
import { useGroupStore } from '../../store/useGroupStore';
import { Debt, Expense, Member } from '../../types';
import { calculateBalances } from '../../utils/balance';
import { formatAmount } from '../../utils/currency';

export default function GroupDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const navigation = useNavigation();
    const { groups, members, loadMembers } = useGroupStore();
    const { expenses, loadExpenses } = useExpenseStore();

    const group = groups.find((g) => g.id === id);
    const groupMembers = members[id!] || [];
    const groupExpenses = expenses[id!] || [];

    const [debts, setDebts] = useState<Debt[]>([]);

    // Título dinámico sin causar loop
    useLayoutEffect(() => {
        if (group) {
            navigation.setOptions({ title: `${group.emoji} ${group.name}` });
        }
    }, [group, navigation]);

    const loadData = useCallback(async () => {
        if (!id) return;
        await loadMembers(id);
        await loadExpenses(id);
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const recalculate = async () => {
            if (!id || groupMembers.length === 0 || groupExpenses.length === 0) {
                setDebts([]);
                return;
            }
            const participantsMap = await getParticipantsMapByGroup(id);
            const { debts: newDebts } = calculateBalances(groupMembers, groupExpenses, participantsMap);
            setDebts(newDebts);
        };
        recalculate();
    }, [groupMembers, groupExpenses]);

    const getMemberName = (memberId: string) => {
        return groupMembers.find((m) => m.id === memberId)?.name || '???';
    };

    const getMemberColor = (memberId: string) => {
        return groupMembers.find((m) => m.id === memberId)?.color || '#888';
    };

    if (!group) {
        return (
            <View style={styles.center}>
                <Text style={styles.text}>Grupo no encontrado</Text>
            </View>
        );
    }

    const renderMember = ({ item }: { item: Member }) => (
        <View style={[styles.memberChip, { backgroundColor: item.color + '30' }]}>
            <View style={[styles.memberDot, { backgroundColor: item.color }]} />
            <Text style={[styles.memberChipText, { color: item.color }]}>{item.name}</Text>
        </View>
    );

    const renderExpense = ({ item }: { item: Expense }) => (
        <Pressable style={styles.expenseCard}
        onPress={() => router.push(`/group/${id}/expense/${item.id}`)}
        >
            <View style={styles.expenseLeft}>
                <Text style={styles.expenseDesc}>{item.description}</Text>
                <Text style={styles.expensePayer}>
                    Pagó{' '}
                    <Text style={{ color: getMemberColor(item.paid_by) }}>
                        {getMemberName(item.paid_by)}
                    </Text>
                    {'  ·  '}
                    {new Date(item.created_at).toLocaleDateString('es-ES')}
                </Text>
            </View>
            <Text style={styles.expenseAmount}>{formatAmount(item.amount)}</Text>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={groupExpenses}
                keyExtractor={(item) => item.id}
                renderItem={renderExpense}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <>
                        {/* Miembros */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Miembros</Text>
                                <Pressable onPress={() => router.push(`/group/${id}/members`)}>
                                    <Text style={styles.link}>Gestionar</Text>
                                </Pressable>
                            </View>

                            {groupMembers.length === 0 ? (
                                <Pressable
                                    style={styles.emptyCard}
                                    onPress={() => router.push(`/group/${id}/members`)}
                                >
                                    <Text style={styles.emptyCardText}>👥 Añade miembros para empezar</Text>
                                </Pressable>
                            ) : (
                                <FlatList
                                    data={groupMembers}
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderMember}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.membersList}
                                />
                            )}
                        </View>

                        {/* Balances */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Balances</Text>
                        </View>
                        {groupExpenses.length === 0 ? (
                            <View style={styles.placeholderCard}>
                                <Text style={styles.placeholderText}>
                                    📊 Los balances aparecerán cuando haya gastos
                                </Text>
                            </View>
                        ) : (
                            <BalanceSummary debts={debts} members={groupMembers} />
                        )}

                        {/* Título gastos */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Gastos</Text>
                        </View>
                    </>
                }
                ListEmptyComponent={
                    <View style={styles.placeholderCard}>
                        <Text style={styles.placeholderText}>🧾 Aún no hay gastos registrados</Text>
                    </View>
                }
            />

            {groupMembers.length >= 2 && (
                <Pressable
                    style={styles.fab}
                    onPress={() => router.push(`/group/${id}/expense/new`)}
                >
                    <Text style={styles.fabText}>+ Gasto</Text>
                </Pressable>
            )}
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
    listContent: {
        paddingBottom: 100,
    },
    section: {
        padding: 16,
        paddingBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        color: '#8899aa',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    link: {
        color: '#4ECDC4',
        fontSize: 14,
        fontWeight: '600',
    },
    membersList: {
        gap: 8,
    },
    memberChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    memberDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    memberChipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyCard: {
        backgroundColor: '#1a1a2e',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 16,
    },
    emptyCardText: {
        color: '#556677',
        fontSize: 15,
    },
    placeholderCard: {
        backgroundColor: '#1a1a2e',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 16,
    },
    placeholderText: {
        color: '#556677',
        fontSize: 14,
    },
    expenseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        padding: 14,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 8,
    },
    expenseLeft: {
        flex: 1,
    },
    expenseDesc: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    expensePayer: {
        color: '#8899aa',
        fontSize: 13,
        marginTop: 4,
    },
    expenseAmount: {
        color: '#4ECDC4',
        fontSize: 18,
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 32,
        backgroundColor: '#4ECDC4',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fabText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});