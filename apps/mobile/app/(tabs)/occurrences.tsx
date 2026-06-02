import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
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

  const fetch = useCallback(async () => {
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    const data = await occurrenceAPI.list(params);
    setOccurrences(data);
  }, [statusFilter, priorityFilter]);

  useEffect(() => { fetch().finally(() => setLoading(false)); }, [fetch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

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
            onPress={() => setStatusFilter(f.key)}
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
            onPress={() => setPriorityFilter(p.key)}
            style={{
              paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
              backgroundColor: priorityFilter === p.key ? '#f97316' : '#1e293b',
            }}
          >
            <Text style={{ color: priorityFilter === p.key ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: '600' }}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
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
