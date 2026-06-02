import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { runbookAPI, categoryAPI, authAPI } from '../../lib/api';

export default function RunbooksScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    title: '',
    category: '',
    priority: '',
    tags: '',
    steps: [{ order: 1, description: '' }],
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const [r, c, u] = await Promise.all([
        runbookAPI.list().catch(() => []),
        categoryAPI.list().catch(() => []),
        authAPI.me().catch(() => null),
      ]);
      setItems(r);
      setCategories(c);
      setCurrentUser(u);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const isAdmin = currentUser?.role === 'admin';

  const addStep = () => {
    setForm({
      ...form,
      steps: [...form.steps, { order: form.steps.length + 1, description: '' }],
    });
  };

  const removeStep = (idx: number) => {
    const newSteps = form.steps
      .filter((_, i) => i !== idx)
      .map((s, i) => ({ ...s, order: i + 1 }));
    setForm({ ...form, steps: newSteps });
  };

  const updateStep = (idx: number, val: string) => {
    const newSteps = form.steps.map((s, i) => (i === idx ? { ...s, description: val } : s));
    setForm({ ...form, steps: newSteps });
  };

  const handleSubmit = async () => {
    if (!form.title) { setError('Título é obrigatório'); return; }
    if (form.steps.filter((s) => s.description.trim()).length === 0) { setError('Pelo menos um passo é necessário'); return; }
    setError('');
    setSaving(true);
    try {
      const data = {
        title: form.title,
        category: form.category || undefined,
        priority: form.priority || undefined,
        steps: form.steps.filter((s) => s.description.trim()),
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      if (editing) {
        await runbookAPI.update(editing._id, data);
      } else {
        await runbookAPI.create(data);
      }
      setForm({ title: '', category: '', priority: '', tags: '', steps: [{ order: 1, description: '' }] });
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
      title: item.title,
      category: item.category || '',
      priority: item.priority || '',
      tags: item.tags?.join(', ') || '',
      steps: item.steps || [{ order: 1, description: '' }],
    });
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Remover Runbook', `Tem certeza que deseja remover "${title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        try {
          await runbookAPI.delete(id);
          await load();
        } catch {}
      }},
    ]);
  };

  const filtered = items.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />}
    >
      <View style={{ padding: 16, gap: 16 }}>
        {error ? (
          <View style={{ backgroundColor: '#7f1d1d', borderRadius: 12, padding: 12 }}>
            <Text style={{ color: '#fca5a5', fontSize: 13 }}>{error}</Text>
          </View>
        ) : null}

        <TextInput
          style={{ backgroundColor: '#1e293b', borderRadius: 8, borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 10 }}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#64748b"
          placeholder="🔍 Buscar runbooks..."
        />

        {isAdmin && (
          <View style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#334155', gap: 12 }}>
            <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 15 }}>{editing ? 'Editar' : 'Novo'} Runbook</Text>

            <View>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Título *</Text>
              <TextInput
                style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8 }}
                value={form.title}
                onChangeText={(v) => setForm({ ...form, title: v })}
                placeholderTextColor="#64748b"
                placeholder="Ex: Restaurar Serviço de DNS"
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Categoria</Text>
                <TextInput
                  style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8 }}
                  value={form.category}
                  onChangeText={(v) => setForm({ ...form, category: v })}
                  placeholderTextColor="#64748b"
                  placeholder="Selecione..."
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Prioridade</Text>
                <TextInput
                  style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8 }}
                  value={form.priority}
                  onChangeText={(v) => setForm({ ...form, priority: v })}
                  placeholderTextColor="#64748b"
                  placeholder="Alta, Média..."
                />
              </View>
            </View>

            <View>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Tags</Text>
              <TextInput
                style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', color: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8 }}
                value={form.tags}
                onChangeText={(v) => setForm({ ...form, tags: v })}
                placeholderTextColor="#64748b"
                placeholder="tag1, tag2, tag3"
              />
            </View>

            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: '#94a3b8', fontSize: 12 }}>Passos ({form.steps.length})</Text>
                <TouchableOpacity onPress={addStep} style={{ backgroundColor: '#3b82f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>+ Passo</Text>
                </TouchableOpacity>
              </View>
              {form.steps.map((step, idx) => (
                <View key={idx} style={{ backgroundColor: '#0f172a', borderRadius: 8, borderWidth: 1, borderColor: '#334155', padding: 8, marginBottom: 8, flexDirection: 'row', gap: 8 }}>
                  <View style={{ backgroundColor: '#f97316', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 4, justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>{step.order}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={{ color: '#f1f5f9', fontSize: 12, minHeight: 40 }}
                      value={step.description}
                      onChangeText={(v) => updateStep(idx, v)}
                      placeholderTextColor="#64748b"
                      placeholder="Descrição do passo"
                      multiline
                    />
                  </View>
                  {idx > 0 && (
                    <TouchableOpacity onPress={() => removeStep(idx)} style={{ backgroundColor: '#7f1d1d', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, justifyContent: 'center' }}>
                      <Text style={{ color: '#fca5a5', fontSize: 11, fontWeight: '600' }}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
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
                  onPress={() => {
                    setEditing(null);
                    setForm({ title: '', category: '', priority: '', tags: '', steps: [{ order: 1, description: '' }] });
                  }}
                  style={{ flex: 1, backgroundColor: '#334155', borderRadius: 8, paddingVertical: 12, alignItems: 'center' }}
                >
                  <Text style={{ color: '#cbd5e1', fontWeight: '600' }}>Cancelar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={{ gap: 8 }}>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>{filtered.length} runbook(s)</Text>
          {filtered.map((item) => (
            <TouchableOpacity
              key={item._id}
              onPress={() => isAdmin && handleEdit(item)}
              style={{ backgroundColor: '#1e293b', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155' }}
            >
              <View style={{ marginBottom: 8 }}>
                <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 13 }}>{item.title}</Text>
              </View>

              {item.tags && item.tags.length > 0 && (
                <View style={{ flexDirection: 'row', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                  {item.tags.map((tag: string) => (
                    <View key={tag} style={{ backgroundColor: '#334155', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ color: '#94a3b8', fontSize: 10 }}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              <Text style={{ color: '#64748b', fontSize: 11 }}>📝 {item.steps?.length || 0} passos</Text>

              {isAdmin && (
                <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={() => handleEdit(item)}
                    style={{ flex: 1, backgroundColor: '#3b82f6', borderRadius: 6, paddingVertical: 6, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item._id, item.title)}
                    style={{ flex: 1, backgroundColor: '#7f1d1d', borderRadius: 6, paddingVertical: 6, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#fca5a5', fontSize: 11, fontWeight: '600' }}>Remover</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
