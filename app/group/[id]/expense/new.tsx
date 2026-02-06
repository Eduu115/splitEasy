import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useExpenseStore } from '../../../../store/useExpenseStore';
import { useGroupStore } from '../../../../store/useGroupStore';
import { eurosToCents } from '../../../../utils/currency';

export default function NewExpense() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { members, loadMembers } = useGroupStore();
    const addExpense = useExpenseStore((s) => s.addExpense);

    const groupMembers = members[id!] || [];
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState<string | null>(null);
    const [participants, setParticipants] = useState<string[]>([]);

    useEffect(() => {
        if (id) loadMembers(id);
    }, [id]);

    // Seleccionar todos por defecto cuando cargan los miembros
    useEffect(() => {
        if (groupMembers.length > 0 && participants.length === 0) {
            setParticipants(groupMembers.map((m) => m.id));
        }
    }, [groupMembers]);

    const toggleParticipant = (memberId: string) => {
        setParticipants((prev) =>
            prev.includes(memberId)
                ? prev.filter((id) => id !== memberId)
                : [...prev, memberId]
        );
    };

    const isValid = description.trim() && parseFloat(amount) > 0 && paidBy && participants.length > 0;

    const handleCreate = async () => {
        if (!isValid) return;

        const cents = eurosToCents(parseFloat(amount));
        await addExpense(id!, description.trim(), cents, paidBy!, participants);
        router.back();
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Importe */}
            <Text style={styles.label}>Importe (€)</Text>
            <TextInput
                style={styles.inputAmount}
                placeholder="0,00"
                placeholderTextColor="#556677"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                autoFocus
            />

            {/* Descripción */}
            <Text style={styles.label}>Descripción</Text>
            <TextInput
                style={styles.input}
                placeholder="Ej: Cena en restaurante"
                placeholderTextColor="#556677"
                value={description}
                onChangeText={setDescription}
            />

            {/* Quién pagó */}
            <Text style={styles.label}>¿Quién pagó?</Text>
            <View style={styles.memberGrid}>
                {groupMembers.map((member) => (
                    <Pressable
                        key={member.id}
                        style={[
                            styles.memberBtn,
                            paidBy === member.id && { backgroundColor: member.color },
                        ]}
                        onPress={() => setPaidBy(member.id)}
                    >
                        <Text
                            style={[
                                styles.memberBtnText,
                                paidBy === member.id && { color: '#fff' },
                            ]}
                        >
                            {member.name}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Entre quiénes se divide */}
            <Text style={styles.label}>¿Entre quiénes se divide?</Text>
            <View style={styles.memberGrid}>
                {groupMembers.map((member) => {
                    const isSelected = participants.includes(member.id);
                    return (
                        <Pressable
                            key={member.id}
                            style={[
                                styles.memberBtn,
                                isSelected && { backgroundColor: member.color },
                            ]}
                            onPress={() => toggleParticipant(member.id)}
                        >
                            <Text
                                style={[
                                    styles.memberBtnText,
                                    isSelected && { color: '#fff' },
                                ]}
                            >
                                {isSelected ? '✓ ' : ''}{member.name}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* Botón crear */}
            <Pressable
                style={[styles.createBtn, !isValid && styles.createBtnDisabled]}
                onPress={handleCreate}
                disabled={!isValid}
            >
                <Text style={styles.createBtnText}>Registrar gasto</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#16213e',
    },
    content: {
        padding: 20,
    },
    label: {
        color: '#8899aa',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: '#1a1a2e',
        color: '#fff',
        fontSize: 16,
        padding: 14,
        borderRadius: 12,
        marginBottom: 24,
    },
    inputAmount: {
        backgroundColor: '#1a1a2e',
        color: '#4ECDC4',
        fontSize: 36,
        fontWeight: 'bold',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        textAlign: 'center',
    },
    memberGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    memberBtn: {
        backgroundColor: '#1a1a2e',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    memberBtnText: {
        color: '#8899aa',
        fontSize: 15,
        fontWeight: '600',
    },
    createBtn: {
        backgroundColor: '#4ECDC4',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    createBtnDisabled: {
        opacity: 0.4,
    },
    createBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});