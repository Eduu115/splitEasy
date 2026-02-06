import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useGroupStore } from '../store/useGroupStore';
import { Group } from '../types';

export default function Home() {
    const router = useRouter();
    const { groups, loading, loadGroups } = useGroupStore();

    useEffect(() => {
        loadGroups();
    }, []);

    const renderGroup = ({ item }: { item: Group }) => (
        <Pressable
            style={styles.card}
            onPress={() => router.push(`/group/${item.id}` as any)}
        >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>
                    Creado: {new Date(item.created_at).toLocaleDateString('es-ES')}
                </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
        </Pressable>
    );

    const renderEmpty = () => (
        <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>👋</Text>
            <Text style={styles.emptyTitle}>¡Bienvenido a SplitEasy!</Text>
            <Text style={styles.emptyText}>
                Crea tu primer grupo para empezar a compartir gastos.
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4ECDC4" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={groups}
                keyExtractor={(item) => item.id}
                renderItem={renderGroup}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={groups.length === 0 ? styles.emptyList : styles.list}
            />
            <Pressable
                style={styles.fab}
                onPress={() => router.push('/group/new')}
            >
                <Text style={styles.fabText}>+</Text>
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
    list: {
        padding: 16,
    },
    emptyList: {
        flex: 1,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    emoji: {
        fontSize: 32,
        marginRight: 12,
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    cardSub: {
        color: '#8899aa',
        fontSize: 13,
        marginTop: 4,
    },
    arrow: {
        color: '#4ECDC4',
        fontSize: 24,
        fontWeight: 'bold',
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyText: {
        color: '#8899aa',
        fontSize: 16,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 32,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4ECDC4',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fabText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: -2,
    },
});