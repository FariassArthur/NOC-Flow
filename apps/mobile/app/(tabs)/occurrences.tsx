import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { occurrenceAPI } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';

export default function OccurrencesScreen() {
  const router = useRouter();
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [fetchError, setFetchError] = useState('');

  const fetch = useCallback(async () => {
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search) params.search = search;
      const res = await occurrenceAPI.list(params);
      setOccurrences(res.data || res);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
      setFetchError('');
    } catch {
      setFetchError('Erro ao carregar ocorrências');
    }
  }, [statusFilter, priorityFilter, search, page]);

  useEffect(() => { fetch().finally(() => setLoading(false)); }, [fetch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const filters = [
    { key: '', label: 'Todas' },
    { key: 'aberta', label: 'Aberta' },
    { key: 'em_execucao', label: 'Execução' },
    { key: 'finalizada', label: 'Finalizada' },
  ];

  const priorities = [
    { key: '', label: 'Todas' },
    { key: 'baixa', label: 'Baixa' },
    { key: 'média', label: 'Média' },
    { key: 'alta', label: 'Alta' },
    { key: 'crítica', label: 'Crítica' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 48, borderBottomWidth: 1, borderBottomColor: '#1e293b' }} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => { setStatusFilter(f.key); setPage(1); }}
            style={{
              paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
              backgroundColor: statusFilter === f.key ? '#f97316' : '#1e293b',
            }}
          >
            <Text style={{ color: statusFilter === f.key ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: '600' }}>{f.label}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ width: 1, backgroundColor: '#334155', marginHorizontal: 4 }} />
        {priorities.map((p) => (
          <TouchableOpacity
            key={p.key}
            onPress={() => { setPriorityFilter(p.key); setPage(1); }}
            style={{
              paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
              backgroundColor: priorityFilter === p.key ? '#f97316' : '#1e293b',
            }}
          >
            <Text style={{ color: priorityFilter === p.key ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: '600' }}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search bar */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: '#1e293b' }}>
        <TextInput
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Buscar..."
          placeholderTextColor="#64748b"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: '#f1f5f9', fontSize: 14, borderWidth: 1, borderColor: '#334155' }}
        />
        <TouchableOpacity onPress={handleSearch} style={{ backgroundColor: '#f97316', borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Buscar</Text>
        </TouchableOpacity>
        {search ? (
          <TouchableOpacity
            onPress={() => { setSearchInput(''); setSearch(''); setPage(1); }}
            style={{ justifyContent: 'center', paddingHorizontal: 4 }}
          >
            <Text style={{ color: '#64748b', fontSize: 12 }}>Limpar</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {fetchError ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ color: '#f87171', fontSize: 15, marginBottom: 12 }}>{fetchError}</Text>
          <TouchableOpacity onPress={() => { setLoading(true); fetch().finally(() => setLoading(false)); }} style={{ backgroundColor: '#f97316', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : occurrences.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ color: '#94a3b8', fontSize: 15, marginBottom: 16 }}>Nenhuma ocorrência encontrada</Text>
          <TouchableOpacity onPress={() => router.push('/occurrences/new')} style={{ backgroundColor: '#f97316', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Criar Ocorrência</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={{ color: '#64748b', fontSize: 12, paddingHorizontal: 16, paddingTop: 8 }}>{total} ocorrência(s)</Text>
          <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />}>
            <View style={{ padding: 16, gap: 10 }}>
              {occurrences.map((occ: any) => (
                <TouchableOpacity
                  key={occ._id}
                  onPress={() => router.push(`/occurrences/${occ._id}`)}
                  style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#334155' }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 15, marginBottom: 4 }} numberOfLines={1}>{occ.title}</Text>
                      <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 6 }} numberOfLines={2}>{occ.description}</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                        {occ.tags?.map((tag: string) => (
                          <View key={tag} style={{ backgroundColor: '#334155', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                            <Text style={{ color: '#cbd5e1', fontSize: 10 }}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <StatusBadge status={occ.status} />
                      <PriorityBadge priority={occ.priority} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#1e293b' }}>
              <TouchableOpacity
                onPress={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: page <= 1 ? '#1e293b' : '#334155', opacity: page <= 1 ? 0.4 : 1 }}
              >
                <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600' }}>Anterior</Text>
              </TouchableOpacity>
              <Text style={{ color: '#64748b', fontSize: 13 }}>
                {page} / {totalPages}
              </Text>
              <TouchableOpacity
                onPress={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: page >= totalPages ? '#1e293b' : '#334155', opacity: page >= totalPages ? 0.4 : 1 }}
              >
                <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600' }}>Próximo</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      <TouchableOpacity
        onPress={() => router.push('/occurrences/new')}
        style={{ position: 'absolute', bottom: 20, right: 20, backgroundColor: '#f97316', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#f97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
      >
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 30 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
