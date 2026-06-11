import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1e293b' },
        headerTintColor: '#f1f5f9',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerBackTitle: 'Voltar',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Administração' }} />
      <Stack.Screen name="users" options={{ title: 'Usuários' }} />
      <Stack.Screen name="categories" options={{ title: 'Categorias' }} />
      <Stack.Screen name="equipment" options={{ title: 'Equipamentos' }} />
      <Stack.Screen name="services" options={{ title: 'Serviços' }} />
      <Stack.Screen name="escalations" options={{ title: 'Escalações' }} />
      <Stack.Screen name="templates" options={{ title: 'Templates' }} />
      <Stack.Screen name="departments" options={{ title: 'Setores' }} />
      <Stack.Screen name="oncall" options={{ title: 'Plantão' }} />
      <Stack.Screen name="knowledge" options={{ title: 'Conhecimento' }} />
      <Stack.Screen name="report-schedules" options={{ title: 'Rel. Programados' }} />
    </Stack>
  );
}
