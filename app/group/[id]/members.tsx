import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useGroupStore } from '../../../store/useGroupStore';
import { Member } from '../../../types';
import { getNextColor } from '../../../utils/colors';

export default function Members() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { members, loadMembers, addMember } = useGroupStore();
    const [name, setName] = useState('');

    const groupMembers = members[id!] || [];

    useEffect(() => {
        if (id) loadMembers(id);
    }, [id]);

    const handleAdd = async () => {
        if (!name.trim()) return;

        const usedColors = groupMembers.map((m) => m.color);
        const color = getNextColor(usedColors);

        await addMember(id!, name.trim(), color);
        setName('');
    };

    const renderMember = ({ item }: { item: Member }) => (
        <View style={styles.memberRow}>
            <View style={[styles.avatar, { backgroundColor: item.color }]}>
                <Text style={styles.avatarText}>
                    {item.name.charAt(0).toUpperCase()}
                </Text>
            </View>
            <Text style={styles.memberName}>{item.name}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    placeholder="Nombre del miembro"
                    placeholderTextColor="#556677"
                    value={name}
                    onChangeText={setName}
                    onSubmitEditing={handleAdd}
                    returnKeyType="done"
                />
                <Pressable
                    style={[styles.addBtn, !name.trim() && styles.addBtnDisabled]}
                    onPress={handleAdd}
                    disabled={!name.trim()}
                >
                    <Text style={styles.addBtnText}>+</Text>
                </Pressable>
            </View>

            <FlatList
                data={groupMembers}
                keyExtractor={(item) => item.id}
                renderItem={renderMember}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        Añade miembros al grupo para empezar
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#16213e',
    },
    inputRow: {
        flexDirection: 'row',
        padding: 16,
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        color: '#fff',
        fontSize: 16,
        padding: 14,
        borderRadius: 12,
    },
    addBtn: {
        width: 50,
        backgroundColor: '#4ECDC4',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addBtnDisabled: {
        opacity: 0.4,
    },
    addBtnText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    list: {
        padding: 16,
        paddingTop: 0,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        padding: 14,
        borderRadius: 12,
        marginBottom: 8,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    memberName: {
        color: '#fff',
        fontSize: 16,
    },
    emptyText: {
        color: '#556677',
        textAlign: 'center',
        marginTop: 40,
        fontSize: 15,
    },
});