import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useGroupStore } from '../../store/useGroupStore';

const EMOJIS = ['💰', '✈️', '🏠', '🍕', '🎉', '🚗', '🛒', '⛺', '🎓', '💼'];

export default function NewGroup() {
    const router = useRouter();
    const addGroup = useGroupStore((s) => s.addGroup);

    const [name, setName] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('💰');

    const handleCreate = async () => {
        if (!name.trim()) return;
        const group = await addGroup(name.trim(), selectedEmoji);
        router.replace(`/group/${group.id}` as any);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.label}>Nombre del grupo</Text>
            <TextInput
                style={styles.input}
                placeholder="Ej: Viaje a Valencia"
                placeholderTextColor="#556677"
                value={name}
                onChangeText={setName}
                autoFocus
            />

            <Text style={styles.label}>Icono</Text>
            <View style={styles.emojiGrid}>
                {EMOJIS.map((emoji) => (
                    <Pressable
                        key={emoji}
                        style={[
                            styles.emojiBtn,
                            selectedEmoji === emoji && styles.emojiBtnSelected,
                        ]}
                        onPress={() => setSelectedEmoji(emoji)}
                    >
                        <Text style={styles.emojiText}>{emoji}</Text>
                    </Pressable>
                ))}
            </View>

            <Pressable
                style={[styles.createBtn, !name.trim() && styles.createBtnDisabled]}
                onPress={handleCreate}
                disabled={!name.trim()}
            >
                <Text style={styles.createBtnText}>Crear grupo</Text>
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
        fontSize: 18,
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    emojiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 32,
    },
    emojiBtn: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#1a1a2e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiBtnSelected: {
        backgroundColor: '#4ECDC4',
    },
    emojiText: {
        fontSize: 28,
    },
    createBtn: {
        backgroundColor: '#4ECDC4',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
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