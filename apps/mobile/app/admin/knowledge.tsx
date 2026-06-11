import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { knowledgeAPI } from '../../lib/api';

export default function AdminKnowledgeScreen() {
  const [articles, setArticles] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    relatedEquipmentTypes: '',
    published: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchArticles = () => {
    setLoading(true);
    knowledgeAPI
      .list({ search, page, limit: 20 })
      .then((res) => {
        setArticles(res.data);
        setTotalPages(res.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, [page, search]);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: '',
      tags: '',
      relatedEquipmentTypes: '',
      published: true,
    });
    setEditId(null);
    setShowForm(false);
    setError('');
  };

  const startEdit = (a: Record<string, unknown>) => {
    setEditId(a._id);
    setFormData({
      title: a.title,
      content: a.content,
      category: a.category || '',
      tags: (a.tags || []).join(', '),
      relatedEquipmentTypes: (a.relatedEquipmentTypes || []).join(', '),
      published: a.published,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Título e conteúdo são obrigatórios');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        relatedEquipmentTypes: formData.relatedEquipmentTypes
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (editId) await knowledgeAPI.update(editId, data);
      else await knowledgeAPI.create(data);
      resetForm();
      fetchArticles();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Excluir', `Excluir "${title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await knowledgeAPI.delete(id);
          fetchArticles();
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View style={{ padding: 16, gap: 12 }}>
        {error ? (
          <View style={{ backgroundColor: '#7f1d1d', borderRadius: 12, padding: 12 }}>
            <Text style={{ color: '#fca5a5', fontSize: 13 }}>{error}</Text>
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={[inputStyle, { flex: 1 }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar..."
            placeholderTextColor="#64748b"
          />
        </View>

        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Text style={{ color: '#64748b', fontSize: 13 }}>{articles.length} artigo(s)</Text>
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
              {editId ? 'Editar Artigo' : 'Novo Artigo'}
            </Text>
            <View>
              <Text style={labelStyle}>Título *</Text>
              <TextInput
                style={inputStyle}
                value={formData.title}
                onChangeText={(v) => setFormData({ ...formData, title: v })}
                placeholderTextColor="#64748b"
              />
            </View>
            <View>
              <Text style={labelStyle}>Conteúdo *</Text>
              <TextInput
                style={[inputStyle, { minHeight: 120, textAlignVertical: 'top' }]}
                value={formData.content}
                onChangeText={(v) => setFormData({ ...formData, content: v })}
                multiline
                placeholderTextColor="#64748b"
              />
            </View>
            <View>
              <Text style={labelStyle}>Categoria</Text>
              <TextInput
                style={inputStyle}
                value={formData.category}
                onChangeText={(v) => setFormData({ ...formData, category: v })}
                placeholderTextColor="#64748b"
              />
            </View>
            <View>
              <Text style={labelStyle}>Tags (separadas por vírgula)</Text>
              <TextInput
                style={inputStyle}
                value={formData.tags}
                onChangeText={(v) => setFormData({ ...formData, tags: v })}
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
        )}

        <View style={{ gap: 10 }}>
          {articles.map((a) => (
            <View
              key={a._id}
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
                    {a.title}
                  </Text>
                  <Text style={{ color: '#94a3b8', fontSize: 12 }} numberOfLines={2}>
                    {a.content?.substring(0, 100)}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    {a.category && (
                      <View
                        style={{
                          backgroundColor: '#334155',
                          borderRadius: 6,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                        }}
                      >
                        <Text style={{ color: '#cbd5e1', fontSize: 11 }}>{a.category}</Text>
                      </View>
                    )}
                    <View
                      style={{
                        backgroundColor: a.published ? '#065f46' : '#334155',
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                      }}
                    >
                      <Text style={{ color: a.published ? '#6ee7b7' : '#cbd5e1', fontSize: 11 }}>
                        {a.published ? 'Publicado' : 'Rascunho'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => startEdit(a)}>
                    <Text style={{ color: '#f97316', fontSize: 13 }}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(a._id, a.title)}>
                    <Text style={{ color: '#f87171', fontSize: 13 }}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          {articles.length === 0 && !loading && (
            <Text style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>
              Nenhum artigo encontrado
            </Text>
          )}
        </View>

        {totalPages > 1 && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setPage(i + 1)}
                style={{
                  backgroundColor: page === i + 1 ? '#f97316' : '#334155',
                  borderRadius: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>{i + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
