import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { authAPI, userAPI } from '../../lib/api';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([userAPI.list(), authAPI.me().catch(() => null)])
      .then(([userList, user]) => { setUsers(userList); setCurrentUser(user); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const isAdmin = currentUser?.role === 'admin';

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ color: '#94a3b8', fontSize: 15, textAlign: 'center' }}>Acesso restrito ao departamento NOC.</Text>
      </View>
    );
  }

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Excluir Usuário', `Tem certeza que deseja excluir "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          await userAPI.delete(id);
          setUsers((prev) => prev.filter((u) => u._id !== id));
        } catch (err: any) {
          setError(err.response?.data?.error || 'Erro ao excluir');
        }
      }},
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View style={{ padding: 16, gap: 16 }}>
        {error ? (
          <View style={{ backgroundColor: '#7f1d1d', borderRadius: 12, padding: 12 }}>
            <Text style={{ color: '#fca5a5', fontSize: 13 }}>{error}</Text>
          </View>
        ) : null}

        <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '700' }}>Administrar Usuários</Text>
        <Text style={{ color: '#64748b', fontSize: 13 }}>{users.length} usuário(s) cadastrado(s)</Text>

        {/* User cards for mobile */}
        <View style={{ gap: 10 }}>
          {users.map((u) => (
            <View key={u._id} style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#334155' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 15 }}>{u.fullName}</Text>
                  <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>@{u.username} · {u.email}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                    <View style={{ backgroundColor: '#334155', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ color: '#cbd5e1', fontSize: 11 }}>{u.department}</Text>
                    </View>
                    <View style={{ backgroundColor: '#334155', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ color: '#cbd5e1', fontSize: 11 }}>{u.cargo}</Text>
                    </View>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <View style={{ backgroundColor: u.role === 'admin' ? '#f97316' : u.role === 'analyst' ? '#3b82f6' : '#64748b', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>
                      {u.role === 'admin' ? 'Admin' : u.role === 'analyst' ? 'Analista' : 'Viewer'}
                    </Text>
                  </View>
                  {u._id !== currentUser?._id && (
                    <TouchableOpacity onPress={() => handleDelete(u._id, u.fullName)} style={{ backgroundColor: '#7f1d1d', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ color: '#fca5a5', fontSize: 11 }}>Excluir</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
