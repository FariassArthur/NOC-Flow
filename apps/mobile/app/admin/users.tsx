import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { authAPI, userAPI } from '../../lib/api';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([userAPI.list(), authAPI.me().catch(() => null)])
      .then(([userList, user]) => { setUsers(userList); setCurrentUser(user); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const isAdmin = currentUser?.role === 'admin';

  const startEdit = (user: any) => {
    setEditId(user._id);
    setEditData({
      fullName: user.fullName || '',
      department: user.department || '',
      cargo: user.cargo || '',
      role: user.role || 'viewer',
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    setError('');
    try {
      const updated = await userAPI.update(editId, editData);
      setUsers((prev) => prev.map((u) => (u._id === editId ? updated : u)));
      setEditId(null);
      setEditData({});
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

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

        <Text style={{ color: '#64748b', fontSize: 13 }}>{users.length} usuário(s) cadastrado(s)</Text>

        {editId ? (
          <View style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#334155', gap: 12 }}>
            <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 15 }}>Editar Usuário</Text>
            <View>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Nome</Text>
              <TextInput
                style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8 }}
                value={editData.fullName}
                onChangeText={(v) => setEditData({ ...editData, fullName: v })}
                placeholderTextColor="#64748b"
              />
            </View>
            <View>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Departamento</Text>
              <TextInput
                style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8 }}
                value={editData.department}
                onChangeText={(v) => setEditData({ ...editData, department: v })}
                placeholderTextColor="#64748b"
              />
            </View>
            <View>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Cargo</Text>
              <TextInput
                style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8 }}
                value={editData.cargo}
                onChangeText={(v) => setEditData({ ...editData, cargo: v })}
                placeholderTextColor="#64748b"
              />
            </View>
            <View>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Função</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {['admin', 'analyst', 'viewer'].map((role) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => setEditData({ ...editData, role })}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: editData.role === role ? '#f97316' : '#334155',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>
                      {role === 'admin' ? 'Admin' : role === 'analyst' ? 'Analista' : 'Viewer'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={saveEdit}
                disabled={saving}
                style={{ flex: 1, backgroundColor: '#f97316', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>{saving ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={cancelEdit}
                style={{ flex: 1, backgroundColor: '#334155', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
              >
                <Text style={{ color: '#cbd5e1', fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

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
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      <TouchableOpacity
                        onPress={() => startEdit(u)}
                        style={{ backgroundColor: '#3b82f6', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}
                      >
                        <Text style={{ color: '#fff', fontSize: 11 }}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(u._id, u.fullName)}
                        style={{ backgroundColor: '#7f1d1d', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}
                      >
                        <Text style={{ color: '#fca5a5', fontSize: 11 }}>Excluir</Text>
                      </TouchableOpacity>
                    </View>
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
