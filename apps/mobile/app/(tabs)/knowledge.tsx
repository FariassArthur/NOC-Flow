import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { knowledgeAPI } from '../../lib/api';

export default function KnowledgeScreen() {
  const [articles, setArticles] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<Record<string, unknown> | null>(null);

  const fetchArticles = () => {
    setLoading(true);
    knowledgeAPI
      .list({ search, page, limit: 10 })
      .then((res) => {
        setArticles(res.data || []);
        setTotalPages(res.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArticles();
  }, [page, search]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const cardStyle = {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  };

  if (selectedArticle) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <View style={{ padding: 16, gap: 16 }}>
          <TouchableOpacity
            onPress={() => setSelectedArticle(null)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Text style={{ color: '#94a3b8', fontSize: 14 }}>{'< '}</Text>
            <Text style={{ color: '#94a3b8', fontSize: 14 }}>Voltar</Text>
          </TouchableOpacity>

          <View style={cardStyle}>
            <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
              {selectedArticle.title}
            </Text>

            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {selectedArticle.category && (
                <View
                  style={{
                    backgroundColor: '#f97316' + '20',
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ color: '#f97316', fontSize: 11, fontWeight: '600' }}>
                    {selectedArticle.category}
                  </Text>
                </View>
              )}
              {(selectedArticle.tags || []).map((tag: string, i: number) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: '#334155',
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ color: '#94a3b8', fontSize: 11 }}>{tag}</Text>
                </View>
              ))}
            </View>

            <Text style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 22 }}>
              {selectedArticle.content}
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View style={{ padding: 16, gap: 16 }}>
        <Text style={{ color: '#f1f5f9', fontSize: 20, fontWeight: '700' }}>
          Base de Conhecimento
        </Text>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
            placeholder="Buscar artigos..."
            placeholderTextColor="#64748b"
            style={{
              flex: 1,
              backgroundColor: '#1e293b',
              borderRadius: 12,
              padding: 12,
              color: '#f1f5f9',
              fontSize: 14,
              borderWidth: 1,
              borderColor: '#334155',
            }}
            returnKeyType="search"
          />
          <TouchableOpacity
            onPress={handleSearch}
            style={{
              backgroundColor: '#f97316',
              borderRadius: 12,
              paddingHorizontal: 16,
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 32 }} />
        ) : (
          articles.map((a) => (
            <TouchableOpacity key={a._id} onPress={() => setSelectedArticle(a)} style={cardStyle}>
              <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 15, marginBottom: 8 }}>
                {a.title}
              </Text>
              <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }} numberOfLines={3}>
                {a.content?.substring(0, 200)}
              </Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {a.category && (
                  <View
                    style={{
                      backgroundColor: '#f97316' + '20',
                      borderRadius: 4,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ color: '#f97316', fontSize: 10, fontWeight: '600' }}>
                      {a.category}
                    </Text>
                  </View>
                )}
                {(a.tags || []).slice(0, 3).map((tag: string, i: number) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: '#334155',
                      borderRadius: 4,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ color: '#94a3b8', fontSize: 10 }}>{tag}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))
        )}

        {!loading && articles.length === 0 && (
          <View style={{ ...cardStyle, alignItems: 'center', padding: 32 }}>
            <Text style={{ color: '#94a3b8', fontSize: 14 }}>Nenhum artigo encontrado</Text>
          </View>
        )}

        {totalPages > 1 && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setPage(i + 1)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: page === i + 1 ? '#f97316' : '#334155',
                  justifyContent: 'center',
                  alignItems: 'center',
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
