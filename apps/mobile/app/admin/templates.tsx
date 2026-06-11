import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { templateAPI } from '../../lib/api';

export default function AdminTemplatesScreen() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    priority: '',
    category: '',
    service: '',
    equipment: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchTemplates = () => {
    setLoading(true);
    templateAPI
      .list()
      .then(setTemplates)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      description: '',
      priority: '',
      category: '',
      service: '',
      equipment: '',
    });
    setEditId(null);
    setShowForm(false);
    setError('');
  };

  const startEdit = (t: any) => {
    setEditId(t._id);
    setFormData({
      name: t.name || '',
      title: t.title || '',
      description: t.description || '',
      priority: t.priority || '',
      category: t.category || '',
      service: t.service || '',
      equipment: t.equipment || '',
    });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.title.trim()) {
      setError('Nome e título são obrigatórios');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editId) {
        const updated = await templateAPI.update(editId, formData);
        setTemplates((prev) => prev.map((t) => (t._id === editId ? updated : t)));
      } else {
        const created = await templateAPI.create(formData);
        setTemplates((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Excluir Template', `Tem certeza que deseja excluir "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await templateAPI.delete(id);
            setTemplates((prev) => prev.filter((t) => t._id !== id));
          } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao excluir');
          }
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
  const labelStyle = { color: '#94a3b8', fontSize: 12, marginBottom: 4 };

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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View style={{ padding: 16, gap: 16 }}>
        {error ? (
          <View style={{ backgroundColor: '#7f1d1d', borderRadius: 12, padding: 12 }}>
            <Text style={{ color: '#fca5a5', fontSize: 13 }}>{error}</Text>
          </View>
        ) : null}

        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Text style={{ color: '#64748b', fontSize: 13 }}>{templates.length} template(s)</Text>
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

        {showForm ? (
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
              {editId ? 'Editar Template' : 'Novo Template'}
            </Text>
            <View>
              <Text style={labelStyle}>Nome *</Text>
              <TextInput
                style={inputStyle}
                value={formData.name}
                onChangeText={(v) => setFormData({ ...formData, name: v })}
                placeholder="Ex: Link Lento"
                placeholderTextColor="#64748b"
              />
            </View>
            <View>
              <Text style={labelStyle}>Título *</Text>
              <TextInput
                style={inputStyle}
                value={formData.title}
                onChangeText={(v) => setFormData({ ...formData, title: v })}
                placeholder="Ex: Ocorrência de Link Lento"
                placeholderTextColor="#64748b"
              />
            </View>
            <View>
              <Text style={labelStyle}>Descrição</Text>
              <TextInput
                style={[inputStyle, { minHeight: 80, textAlignVertical: 'top' }]}
                value={formData.description}
                onChangeText={(v) => setFormData({ ...formData, description: v })}
                placeholder="Descrição padrão"
                placeholderTextColor="#64748b"
                multiline
              />
            </View>
            <View>
              <Text style={labelStyle}>Prioridade</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {[
                  { value: '', label: '-' },
                  { value: 'baixa', label: 'Baixa' },
                  { value: 'média', label: 'Média' },
                  { value: 'alta', label: 'Alta' },
                  { value: 'crítica', label: 'Crítica' },
                ].map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    onPress={() => setFormData({ ...formData, priority: p.value })}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: formData.priority === p.value ? '#f97316' : '#334155',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 11 }}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <Text style={labelStyle}>Categoria</Text>
              <TextInput
                style={inputStyle}
                value={formData.category}
                onChangeText={(v) => setFormData({ ...formData, category: v })}
                placeholder="Categoria padrão"
                placeholderTextColor="#64748b"
              />
            </View>
            <View>
              <Text style={labelStyle}>Serviço</Text>
              <TextInput
                style={inputStyle}
                value={formData.service}
                onChangeText={(v) => setFormData({ ...formData, service: v })}
                placeholder="Serviço padrão"
                placeholderTextColor="#64748b"
              />
            </View>
            <View>
              <Text style={labelStyle}>Equipamento</Text>
              <TextInput
                style={inputStyle}
                value={formData.equipment}
                onChangeText={(v) => setFormData({ ...formData, equipment: v })}
                placeholder="Equipamento padrão"
                placeholderTextColor="#64748b"
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
        ) : null}

        <View style={{ gap: 10 }}>
          {templates.map((t) => (
            <View
              key={t._id}
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
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 15 }}>
                    {t.name}
                  </Text>
                  <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{t.title}</Text>
                  {t.description ? (
                    <Text
                      style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}
                      numberOfLines={2}
                    >
                      {t.description}
                    </Text>
                  ) : null}
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    {t.priority ? (
                      <View
                        style={{
                          backgroundColor: '#334155',
                          borderRadius: 6,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}
                      >
                        <Text style={{ color: '#cbd5e1', fontSize: 11 }}>{t.priority}</Text>
                      </View>
                    ) : null}
                    {t.category ? (
                      <View
                        style={{
                          backgroundColor: '#334155',
                          borderRadius: 6,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}
                      >
                        <Text style={{ color: '#cbd5e1', fontSize: 11 }}>{t.category}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <TouchableOpacity
                    onPress={() => startEdit(t)}
                    style={{
                      backgroundColor: '#3b82f6',
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 11 }}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(t._id, t.name)}
                    style={{
                      backgroundColor: '#7f1d1d',
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ color: '#fca5a5', fontSize: 11 }}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
