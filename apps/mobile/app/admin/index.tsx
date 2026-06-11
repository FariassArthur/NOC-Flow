import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const adminLinks = [
  { route: '/admin/users', label: 'Usuários', icon: 'U' },
  { route: '/admin/departments', label: 'Setores', icon: 'S' },
  { route: '/admin/categories', label: 'Categorias', icon: 'C' },
  { route: '/admin/equipment', label: 'Equipamentos', icon: 'E' },
  { route: '/admin/services', label: 'Serviços', icon: 'S' },
  { route: '/admin/templates', label: 'Templates', icon: 'T' },
  { route: '/admin/escalations', label: 'Escalações', icon: 'E' },
];

export default function AdminIndex() {
  const router = useRouter();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ color: '#f1f5f9', fontSize: 20, fontWeight: '700', marginBottom: 4 }}>
          Administração
        </Text>
        <Text style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>
          Gerencie recursos do sistema
        </Text>
        {adminLinks.map((link) => (
          <TouchableOpacity
            key={link.route}
            onPress={() => router.push(link.route as any)}
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#334155',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#f97316',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{link.icon}</Text>
            </View>
            <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 15 }}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
