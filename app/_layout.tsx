import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: '#1a1a2e' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
                contentStyle: { backgroundColor: '#16213e' },
            }}
        >
            <Stack.Screen
                name="index"
                options={{ title: 'SplitEasy 🧾' }}
            />
            <Stack.Screen
                name="group/new"
                options={{ title: 'Nuevo grupo', presentation: 'modal' }}
            />
            <Stack.Screen
                name="group/[id]"
                options={{ title: 'Grupo' }}
            />
            <Stack.Screen
                name="group/[id]/members"
                options={{ title: 'Miembros' }}
            />
            <Stack.Screen
                name="group/[id]/expense/new"
                options={{ title: 'Nuevo gasto' }}
            />
            <Stack.Screen
                name="group/[id]/expense/[expenseId]"
                options={{ title: 'Gasto' }}
            />
        </Stack>
    );
}