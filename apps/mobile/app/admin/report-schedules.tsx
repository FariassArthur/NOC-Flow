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
import { reportScheduleAPI } from '../../lib/api';

const freqLabels: Record<string, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
};

export default function AdminReportSchedulesScreen() {
  const [schedules, setSchedules] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    format: 'csv',
    filters: '',
    recipients: '',
    active: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    reportScheduleAPI
      .list()
      .then((res) => setSchedules(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      frequency: 'daily',
      format: 'csv',
      filters: '',
      recipients: '',
      active: true,
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
      frequency: s.frequency,
      format: s.format,
      filters: JSON.stringify(s.filters || {}),
      recipients: (s.recipients || []).join(', '),
      active: s.active,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    setSaving(true);
    setError('');
    try {
      let parsedFilters = {};
      try {
        if (formData.filters.trim()) parsedFilters = JSON.parse(formData.filters);
      } catch {
        setError('Filtros JSON inválidos');
        setSaving(false);
        return;
      }
      const data: Record<string, unknown> = {
        ...formData,
        filters: parsedFilters,
        recipients: formData.recipients
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean),
      };
      if (editId) await reportScheduleAPI.update(editId, data);
      else await reportScheduleAPI.create(data);
      resetForm();
      const res = await reportScheduleAPI.list();
      setSchedules(res.data);
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
          await reportScheduleAPI.delete(id);
          const res = await reportScheduleAPI.list();
          setSchedules(res.data);
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
          <Text style={{ color: '#64748b', fontSize: 13 }}>{schedules.length} relatório(s)</Text>
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
              {editId ? 'Editar' : 'Novo Relatório Programado'}
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
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Frequência</Text>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {['daily', 'weekly', 'monthly'].map((f) => (
                    <TouchableOpacity
                      key={f}
                      onPress={() => setFormData({ ...formData, frequency: f })}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 6,
                        backgroundColor: formData.frequency === f ? '#f97316' : '#334155',
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 11 }}>
                        {freqLabels[f]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Formato</Text>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {['csv', 'pdf'].map((f) => (
                    <TouchableOpacity
                      key={f}
                      onPress={() => setFormData({ ...formData, format: f })}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 6,
                        backgroundColor: formData.format === f ? '#f97316' : '#334155',
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 11 }}>
                        {f.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            <View>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>
                Filtros (JSON)
              </Text>
              <TextInput
                style={[inputStyle, { minHeight: 60, textAlignVertical: 'top' }]}
                value={formData.filters}
                onChangeText={(v) => setFormData({ ...formData, filters: v })}
                multiline
                placeholder='{"status": "aberta"}'
                placeholderTextColor="#64748b"
              />
            </View>
            <View>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>
                Destinatários (emails separados por vírgula)
              </Text>
              <TextInput
                style={inputStyle}
                value={formData.recipients}
                onChangeText={(v) => setFormData({ ...formData, recipients: v })}
                placeholder="email1@, email2@"
                placeholderTextColor="#64748b"
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>Ativo</Text>
              <Switch
                value={formData.active}
                onValueChange={(v) => setFormData({ ...formData, active: v })}
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
          {schedules.map((s) => (
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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 15 }}>
                    {s.name}
                  </Text>
                  <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                    {freqLabels[s.frequency]} · {s.format?.toUpperCase()}
                  </Text>
                  <Text style={{ color: '#64748b', fontSize: 11 }}>
                    Última execução:{' '}
                    {s.lastRunAt ? new Date(s.lastRunAt).toLocaleString('pt-BR') : 'Nunca'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
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
          {schedules.length === 0 && (
            <Text style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>
              Nenhum relatório programado
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
