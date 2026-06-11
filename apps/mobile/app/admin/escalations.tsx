import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { escalationAPI, authAPI } from '../../lib/api';

const priorities = ['baixa', 'média', 'alta', 'crítica'];
const triggerTypes = ['sla_breach', 'time_passed'];

export default function EscalationsScreen() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({
    name: '',
    priority: 'alta',
    triggerType: 'sla_breach',
    triggerMinutes: '60',
    targetRole: '',
    targetDepartment: '',
    notifyAlso: '',
    active: true,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [escList, user] = await Promise.all([
        escalationAPI.list().catch(() => []),
        authAPI.me().catch(() => null),
      ]);
      setItems(escList);
      setCurrentUser(user);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  const handleSubmit = async () => {
    if (!form.name) {
      setError('Nome é obrigatório');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const data = {
        name: form.name,
        priority: form.priority,
        triggerType: form.triggerType,
        triggerMinutes: Number(form.triggerMinutes),
        targetRole: form.targetRole || undefined,
        targetDepartment: form.targetDepartment || undefined,
        notifyAlso: form.notifyAlso
          ? form.notifyAlso
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        active: form.active,
      };
      if (editing) {
        await escalationAPI.update(editing._id, data as Record<string, unknown>);
      } else {
        await escalationAPI.create(data as Record<string, unknown>);
      }
      setForm({
        name: '',
        priority: 'alta',
        triggerType: 'sla_breach',
        triggerMinutes: '60',
        targetRole: '',
        targetDepartment: '',
        notifyAlso: '',
        active: true,
      });
      setEditing(null);
      await load();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Record<string, unknown>) => {
    setEditing(item);
    setForm({
      name: item.name,
      priority: item.priority,
      triggerType: item.triggerType,
      triggerMinutes: item.triggerMinutes?.toString() || '60',
      targetRole: item.targetRole || '',
      targetDepartment: item.targetDepartment || '',
      notifyAlso: item.notifyAlso?.join(', ') || '',
      active: item.active ?? true,
    });
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Remover Escalação', `Tem certeza que deseja remover "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await escalationAPI.delete(id);
            await load();
          } catch {}
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0f172a',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0f172a',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 32,
        }}
      >
        <Text style={{ color: '#94a3b8', fontSize: 15, textAlign: 'center' }}>
          Acesso restrito ao departamento NOC.
        </Text>
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

        <View
          style={{
            backgroundColor: '#1e293b',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#334155',
            gap: 12,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 15 }}>
              {editing ? 'Editar' : 'Nova'} Escalação
            </Text>
            <Switch
              value={form.active}
              onValueChange={(v) => setForm({ ...form, active: v })}
              trackColor={{ false: '#334155', true: '#10b981' }}
              thumbColor={form.active ? '#f1f5f9' : '#64748b'}
            />
          </View>

          <View>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Nome *</Text>
            <TextInput
              style={{
                backgroundColor: '#0f172a',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#334155',
                color: '#f1f5f9',
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              placeholderTextColor="#64748b"
              placeholder="Ex: Escalação de Crítica"
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Prioridade</Text>
              <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
                {priorities.map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setForm({ ...form, priority: p })}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: form.priority === p ? '#f97316' : '#334155',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 10 }}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>
                Tipo de Gatilho
              </Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {triggerTypes.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setForm({ ...form, triggerType: t })}
                    style={{
                      flex: 1,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: form.triggerType === t ? '#f97316' : '#334155',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 10 }}>
                      {t === 'sla_breach' ? 'SLA' : 'Tempo'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Minutos</Text>
              <TextInput
                style={{
                  backgroundColor: '#0f172a',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#334155',
                  color: '#f1f5f9',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
                value={form.triggerMinutes}
                onChangeText={(v) => setForm({ ...form, triggerMinutes: v })}
                placeholderTextColor="#64748b"
                keyboardType="number-pad"
                placeholder="60"
              />
            </View>
          </View>

          <View>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Função Alvo</Text>
            <TextInput
              style={{
                backgroundColor: '#0f172a',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#334155',
                color: '#f1f5f9',
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
              value={form.targetRole}
              onChangeText={(v) => setForm({ ...form, targetRole: v })}
              placeholderTextColor="#64748b"
              placeholder="admin, analyst..."
            />
          </View>

          <View>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>
              Departamento Alvo
            </Text>
            <TextInput
              style={{
                backgroundColor: '#0f172a',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#334155',
                color: '#f1f5f9',
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
              value={form.targetDepartment}
              onChangeText={(v) => setForm({ ...form, targetDepartment: v })}
              placeholderTextColor="#64748b"
              placeholder="NOC..."
            />
          </View>

          <View>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>
              Notificar Também
            </Text>
            <TextInput
              style={{
                backgroundColor: '#0f172a',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#334155',
                color: '#f1f5f9',
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
              value={form.notifyAlso}
              onChangeText={(v) => setForm({ ...form, notifyAlso: v })}
              placeholderTextColor="#64748b"
              placeholder="email1@test.com, email2@test.com"
              multiline
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={saving}
              style={{
                flex: 1,
                backgroundColor: '#f97316',
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>
                {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Criar'}
              </Text>
            </TouchableOpacity>
            {editing && (
              <TouchableOpacity
                onPress={() => {
                  setEditing(null);
                  setForm({
                    name: '',
                    priority: 'alta',
                    triggerType: 'sla_breach',
                    triggerMinutes: '60',
                    targetRole: '',
                    targetDepartment: '',
                    notifyAlso: '',
                    active: true,
                  });
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#334155',
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#cbd5e1', fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>{items.length} escalação(ões)</Text>
          {items.map((item) => (
            <View
              key={item._id}
              style={{
                backgroundColor: '#1e293b',
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: '#334155',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 13 }}>
                      {item.name}
                    </Text>
                    {item.active && (
                      <View
                        style={{
                          backgroundColor: '#10b981',
                          borderRadius: 4,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 9, fontWeight: '600' }}>Ativo</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    backgroundColor: '#334155',
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: '600' }}>
                    {item.priority}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                <Text
                  style={{
                    color: '#94a3b8',
                    fontSize: 10,
                    backgroundColor: '#0f172a',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                >
                  {item.triggerType === 'sla_breach' ? 'SLA' : 'Tempo'}: {item.triggerMinutes}m
                </Text>
                {item.targetRole && (
                  <Text
                    style={{
                      color: '#94a3b8',
                      fontSize: 10,
                      backgroundColor: '#0f172a',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}
                  >
                    👤 {item.targetRole}
                  </Text>
                )}
                {item.targetDepartment && (
                  <Text
                    style={{
                      color: '#94a3b8',
                      fontSize: 10,
                      backgroundColor: '#0f172a',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}
                  >
                    🏢 {item.targetDepartment}
                  </Text>
                )}
              </View>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <TouchableOpacity
                  onPress={() => handleEdit(item)}
                  style={{
                    flex: 1,
                    backgroundColor: '#3b82f6',
                    borderRadius: 6,
                    paddingVertical: 6,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item._id, item.name)}
                  style={{
                    flex: 1,
                    backgroundColor: '#7f1d1d',
                    borderRadius: 6,
                    paddingVertical: 6,
                    alignItems: 'center',
                  }}
                >
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
