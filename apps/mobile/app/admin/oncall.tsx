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
import { onCallAPI, userAPI } from '../../lib/api';

const DAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
const DAY_LABELS: Record<string, string> = {
  dom: 'Dom',
  seg: 'Seg',
  ter: 'Ter',
  qua: 'Qua',
  qui: 'Qui',
  sex: 'Sex',
  sab: 'Sáb',
};

export default function AdminOnCallScreen() {
  const [shifts, setShifts] = useState<Record<string, unknown>[]>([]);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: 'NOC',
    weekDays: [] as string[],
    startTime: '08:00',
    endTime: '18:00',
    userIds: [] as string[],
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      onCallAPI
        .list()
        .then((res) => setShifts(res.data))
        .catch(() => {}),
      userAPI
        .list()
        .then(setUsers)
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      department: 'NOC',
      weekDays: [],
      startTime: '08:00',
      endTime: '18:00',
      userIds: [],
      isActive: true,
    });
    setEditId(null);
    setShowForm(false);
    setError('');
  };

  const startEdit = (s: Record<string, unknown>) => {
    setEditId(s._id);
    setFormData({
      name: s.name,
      description: s.description || '',
      department: s.department,
      weekDays: s.weekDays || [],
      startTime: s.startTime,
      endTime: s.endTime,
      userIds: s.userIds || [],
      isActive: s.isActive,
    });
    setShowForm(true);
  };

  const toggleDay = (day: string) => {
    setFormData({
      ...formData,
      weekDays: formData.weekDays.includes(day)
        ? formData.weekDays.filter((d) => d !== day)
        : [...formData.weekDays, day],
    });
  };

  const toggleUser = (id: string) => {
    setFormData({
      ...formData,
      userIds: formData.userIds.includes(id)
        ? formData.userIds.filter((u) => u !== id)
        : [...formData.userIds, id],
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editId) await onCallAPI.update(editId, formData as Record<string, unknown>);
      else await onCallAPI.create(formData as Record<string, unknown>);
      resetForm();
      const res = await onCallAPI.list();
      setShifts(res.data);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Excluir', `Excluir "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await onCallAPI.delete(id);
          const res = await onCallAPI.list();
          setShifts(res.data);
        },
      },
    ]);
  };

  const inputStyle = {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  };

  if (loading)
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View style={{ padding: 16, gap: 12 }}>
        {error ? (
          <View style={{ backgroundColor: '#7f1d1d', borderRadius: 12, padding: 12 }}>
            <Text style={{ color: '#fca5a5', fontSize: 13 }}>{error}</Text>
          </View>
        ) : null}

        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Text style={{ color: '#64748b', fontSize: 13 }}>{shifts.length} plantão(ões)</Text>
          <TouchableOpacity
            onPress={() => {
              resetForm();
              setShowForm(true);
            }}
            style={{
              backgroundColor: '#f97316',
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Novo</Text>
          </TouchableOpacity>
        </View>

        {showForm && (
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
            <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 15 }}>
              {editId ? 'Editar Plantão' : 'Novo Plantão'}
            </Text>
            <View>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Nome *</Text>
              <TextInput
                style={inputStyle}
                value={formData.name}
                onChangeText={(v) => setFormData({ ...formData, name: v })}
                placeholderTextColor="#64748b"
              />
            </View>
            <View>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Dias</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                {DAYS.map((day) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => toggleDay(day)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: formData.weekDays.includes(day) ? '#f97316' : '#334155',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 11 }}>
                      {DAY_LABELS[day]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Início</Text>
                <TextInput
                  style={inputStyle}
                  value={formData.startTime}
                  onChangeText={(v) => setFormData({ ...formData, startTime: v })}
                  placeholder="08:00"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Fim</Text>
                <TextInput
                  style={inputStyle}
                  value={formData.endTime}
                  onChangeText={(v) => setFormData({ ...formData, endTime: v })}
                  placeholder="18:00"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>
            <View>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Plantinistas</Text>
              <View style={{ maxHeight: 120 }}>
                {users.map((u) => (
                  <TouchableOpacity
                    key={u._id}
                    onPress={() => toggleUser(u._id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      paddingVertical: 6,
                    }}
                  >
                    <View
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: formData.userIds.includes(u._id) ? '#f97316' : '#64748b',
                        backgroundColor: formData.userIds.includes(u._id)
                          ? '#f97316'
                          : 'transparent',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {formData.userIds.includes(u._id) && (
                        <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>
                      )}
                    </View>
                    <Text style={{ color: '#cbd5e1', fontSize: 13 }}>
                      {u.fullName} ({u.department})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>Ativo</Text>
              <Switch
                value={formData.isActive}
                onValueChange={(v) => setFormData({ ...formData, isActive: v })}
                trackColor={{ true: '#f97316' }}
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
                  paddingVertical: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {saving ? 'Salvando...' : editId ? 'Atualizar' : 'Criar'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={resetForm}
                style={{
                  flex: 1,
                  backgroundColor: '#334155',
                  borderRadius: 8,
                  paddingVertical: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#cbd5e1', fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ gap: 10 }}>
          {shifts.map((s) => (
            <View
              key={s._id}
              style={{
                backgroundColor: '#1e293b',
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: '#334155',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 15 }}>
                    {s.name}
                  </Text>
                  <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                    {(s.weekDays || []).map((d: string) => DAY_LABELS[d]).join(', ')}
                  </Text>
                  <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                    {s.startTime} - {s.endTime}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                    <View
                      style={{
                        backgroundColor: s.isActive ? '#065f46' : '#334155',
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                      }}
                    >
                      <Text style={{ color: s.isActive ? '#6ee7b7' : '#cbd5e1', fontSize: 11 }}>
                        {s.isActive ? 'Ativo' : 'Inativo'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => startEdit(s)}>
                    <Text style={{ color: '#f97316', fontSize: 13 }}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(s._id, s.name)}>
                    <Text style={{ color: '#f87171', fontSize: 13 }}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          {shifts.length === 0 && (
            <Text style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>
              Nenhum plantão
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
