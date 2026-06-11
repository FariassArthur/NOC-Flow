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
import { departmentAPI } from '../../lib/api';

export default function AdminDepartmentsScreen() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchDepartments = () => {
    setLoading(true);
    departmentAPI
      .list()
      .then(setDepartments)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditId(null);
    setShowForm(false);
    setError('');
  };

  const startEdit = (d: any) => {
    setEditId(d._id);
    setFormData({ name: d.name || '', description: d.description || '' });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Nome do setor é obrigatório');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editId) {
        const updated = await departmentAPI.update(editId, formData);
        setDepartments((prev) => prev.map((d) => (d._id === editId ? updated : d)));
      } else {
        const created = await departmentAPI.create(formData);
        setDepartments((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar setor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Excluir Setor', `Tem certeza que deseja excluir "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await departmentAPI.delete(id);
            setDepartments((prev) => prev.filter((d) => d._id !== id));
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
          <Text style={{ color: '#64748b', fontSize: 13 }}>{departments.length} setor(es)</Text>
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
              {editId ? 'Editar Setor' : 'Novo Setor'}
            </Text>
            <View>
              <Text style={labelStyle}>Nome *</Text>
              <TextInput
                style={inputStyle}
                value={formData.name}
                onChangeText={(v) => setFormData({ ...formData, name: v })}
                placeholder="Ex: NOC, Suporte..."
                placeholderTextColor="#64748b"
              />
            </View>
            <View>
              <Text style={labelStyle}>Descrição</Text>
              <TextInput
                style={inputStyle}
                value={formData.description}
                onChangeText={(v) => setFormData({ ...formData, description: v })}
                placeholder="Descrição opcional"
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
          {departments.map((d) => (
            <View
              key={d._id}
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
                    {d.name}
                  </Text>
                  {d.description ? (
                    <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>
                      {d.description}
                    </Text>
                  ) : null}
                </View>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <TouchableOpacity
                    onPress={() => startEdit(d)}
                    style={{
                      backgroundColor: '#3b82f6',
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 11 }}>Editar</Text>
                  </TouchableOpacity>
                  {d.name !== 'NOC' && (
                    <TouchableOpacity
                      onPress={() => handleDelete(d._id, d.name)}
                      style={{
                        backgroundColor: '#7f1d1d',
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                      }}
                    >
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
