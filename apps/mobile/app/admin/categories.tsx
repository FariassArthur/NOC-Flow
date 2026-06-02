import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { categoryAPI, authAPI } from '../../lib/api';

const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6'];

export default function CategoriesScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', slaResponseMinutes: '', slaResolutionMinutes: '', color: '#6366f1' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [catList, user] = await Promise.all([
        categoryAPI.list().catch(() => []),
        authAPI.me().catch(() => null),
      ]);
      setItems(catList);
      setCurrentUser(user);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const isAdmin = currentUser?.role === 'admin';

  const handleSubmit = async () => {
    if (!form.name) { setError('Nome é obrigatório'); return; }
    setError('');
    setSaving(true);
    try {
      const data = {
        name: form.name,
        description: form.description || undefined,
        slaResponseMinutes: form.slaResponseMinutes ? Number(form.slaResponseMinutes) : undefined,
        slaResolutionMinutes: form.slaResolutionMinutes ? Number(form.slaResolutionMinutes) : undefined,
        color: form.color,
      };
      if (editing) {
        await categoryAPI.update(editing._id, data);
      } else {
        await categoryAPI.create(data);
      }
      setForm({ name: '', description: '', slaResponseMinutes: '', slaResolutionMinutes: '', color: '#6366f1' });
      setEditing(null);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description || '',
      slaResponseMinutes: item.slaResponseMinutes?.toString() || '',
      slaResolutionMinutes: item.slaResolutionMinutes?.toString() || '',
      color: item.color || '#6366f1',
    });
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Remover Categoria', `Tem certeza que deseja remover "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        try {
          await categoryAPI.delete(id);
          await load();
        } catch {}
      }},
    ]);
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View style={{ padding: 16, gap: 16 }}>
        {error ? (
          <View style={{ backgroundColor: '#7f1d1d', borderRadius: 12, padding: 12 }}>
            <Text style={{ color: '#fca5a5', fontSize: 13 }}>{error}</Text>
          </View>
        ) : null}

        <View style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#334155', gap: 12 }}>
          <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 15 }}>{editing ? 'Editar Categoria' : 'Nova Categoria'}</Text>
          
          <View>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Nome *</Text>
            <TextInput
              style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8 }}
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              placeholderTextColor="#64748b"
              placeholder="Ex: Rede, Servidor, etc"
            />
          </View>

          <View>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Descrição</Text>
            <TextInput
              style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, minHeight: 50 }}
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              placeholderTextColor="#64748b"
              multiline
              placeholder="Descrição da categoria"
            />
          </View>

          <View>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>SLA Resposta (minutos)</Text>
            <TextInput
              style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8 }}
              value={form.slaResponseMinutes}
              onChangeText={(v) => setForm({ ...form, slaResponseMinutes: v })}
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              placeholder="60"
            />
          </View>

          <View>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>SLA Resolução (minutos)</Text>
            <TextInput
              style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8 }}
              value={form.slaResolutionMinutes}
              onChangeText={(v) => setForm({ ...form, slaResolutionMinutes: v })}
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              placeholder="240"
            />
          </View>

          <View>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>Cor</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {colors.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setForm({ ...form, color: c })}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    backgroundColor: c,
                    borderWidth: form.color === c ? 3 : 0,
                    borderColor: '#f1f5f9',
                  }}
                />
              ))}
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={saving}
              style={{ flex: 1, backgroundColor: '#f97316', borderRadius: 8, paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>{saving ? 'Salvando...' : editing ? 'Atualizar' : 'Criar'}</Text>
            </TouchableOpacity>
            {editing && (
              <TouchableOpacity
                onPress={() => { setEditing(null); setForm({ name: '', description: '', slaResponseMinutes: '', slaResolutionMinutes: '', color: '#6366f1' }); }}
                style={{ flex: 1, backgroundColor: '#334155', borderRadius: 8, paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#cbd5e1', fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>{items.length} categoria(s)</Text>
          {items.map((item) => (
            <View key={item._id} style={{ backgroundColor: '#1e293b', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: item.color || '#6366f1' }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 13 }}>{item.name}</Text>
                  <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>{item.description}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={{ backgroundColor: '#3b82f6', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id, item.name)} style={{ backgroundColor: '#7f1d1d', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                  <Text style={{ color: '#fca5a5', fontSize: 11, fontWeight: '600' }}>Remover</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
