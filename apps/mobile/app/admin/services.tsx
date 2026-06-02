import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { serviceAPI, authAPI } from '../../lib/api';

const types = ['internet', 'mpls', 'voip', 'vpn', 'datacenter', 'outro'];
const statuses = ['ativo', 'inativo'];

export default function ServicesScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', type: 'internet', provider: '', contract: '', bandwidth: '', status: 'ativo' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [svcList, user] = await Promise.all([
        serviceAPI.list().catch(() => []),
        authAPI.me().catch(() => null),
      ]);
      setItems(svcList);
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
        type: form.type,
        provider: form.provider || undefined,
        contract: form.contract || undefined,
        bandwidth: form.bandwidth || undefined,
        status: form.status,
      };
      if (editing) {
        await serviceAPI.update(editing._id, data);
      } else {
        await serviceAPI.create(data);
      }
      setForm({ name: '', type: 'internet', provider: '', contract: '', bandwidth: '', status: 'ativo' });
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
      type: item.type,
      provider: item.provider || '',
      contract: item.contract || '',
      bandwidth: item.bandwidth || '',
      status: item.status,
    });
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Remover Serviço', `Tem certeza que deseja remover "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        try {
          await serviceAPI.delete(id);
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
          <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 15 }}>{editing ? 'Editar' : 'Novo'} Serviço</Text>
          
          <View>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Nome *</Text>
            <TextInput
              style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8 }}
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              placeholderTextColor="#64748b"
              placeholder="Ex: Link Internet - SP"
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Tipo</Text>
              <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
                {types.slice(0, 2).map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setForm({ ...form, type: t })}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: form.type === t ? '#f97316' : '#334155',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 11 }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Status</Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {statuses.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setForm({ ...form, status: s })}
                    style={{
                      flex: 1,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: form.status === s ? '#f97316' : '#334155',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 10 }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Provedor</Text>
            <TextInput
              style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8 }}
              value={form.provider}
              onChangeText={(v) => setForm({ ...form, provider: v })}
              placeholderTextColor="#64748b"
              placeholder="Ex: Telecom"
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Contrato</Text>
              <TextInput
                style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8 }}
                value={form.contract}
                onChangeText={(v) => setForm({ ...form, contract: v })}
                placeholderTextColor="#64748b"
                placeholder="Nº contrato"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Banda</Text>
              <TextInput
                style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8 }}
                value={form.bandwidth}
                onChangeText={(v) => setForm({ ...form, bandwidth: v })}
                placeholderTextColor="#64748b"
                placeholder="100Mbps"
              />
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
                onPress={() => { setEditing(null); setForm({ name: '', type: 'internet', provider: '', contract: '', bandwidth: '', status: 'ativo' }); }}
                style={{ flex: 1, backgroundColor: '#334155', borderRadius: 8, paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#cbd5e1', fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>{items.length} serviço(s)</Text>
          {items.map((item) => (
            <View key={item._id} style={{ backgroundColor: '#1e293b', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 13 }}>{item.name}</Text>
                  <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>{item.provider}</Text>
                </View>
                <View style={{ backgroundColor: item.status === 'ativo' ? '#10b981' : '#ef4444', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>{item.status}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <Text style={{ color: '#94a3b8', fontSize: 10, backgroundColor: '#0f172a', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>{item.type}</Text>
                {item.bandwidth && <Text style={{ color: '#94a3b8', fontSize: 10, backgroundColor: '#0f172a', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>📊 {item.bandwidth}</Text>}
                {item.contract && <Text style={{ color: '#94a3b8', fontSize: 10, backgroundColor: '#0f172a', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>#{item.contract}</Text>}
              </View>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={{ flex: 1, backgroundColor: '#3b82f6', borderRadius: 6, paddingVertical: 6, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id, item.name)} style={{ flex: 1, backgroundColor: '#7f1d1d', borderRadius: 6, paddingVertical: 6, alignItems: 'center' }}>
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
