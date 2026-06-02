import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { occurrenceAPI, authAPI } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';

const statusCount = (list: any[], status: string) => list.filter((o: any) => o.status === status).length;

export default function Dashboard() {
  const router = useRouter();
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [occList, me] = await Promise.all([
        occurrenceAPI.list(),
        authAPI.me().catch(() => null),
      ]);
      setOccurrences(occList);
      setUser(me);
    } catch {}
  }, []);

  useEffect(() => { fetchData().finally(() => setLoading(false)); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const stats = [
    { label: 'Total', value: occurrences.length, color: '#94a3b8' },
    { label: 'Aberta', value: statusCount(occurrences, 'aberta'), color: '#f87171' },
    { label: 'Execução', value: statusCount(occurrences, 'em_execucao'), color: '#fbbf24' },
    { label: 'Finalizada', value: statusCount(occurrences, 'finalizada'), color: '#34d399' },
  ];

  const recent = occurrences.slice(0, 5);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f172a' }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />}>
      <View style={{ padding: 16 }}>
        {user && (
          <Text style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>
            {user.fullName} · {user.department}
          </Text>
        )}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {stats.map((s) => (
            <View key={s.label} style={{
              flex: 1, minWidth: '45%', backgroundColor: '#1e293b', borderRadius: 16, padding: 16,
              borderWidth: 1, borderColor: '#334155',
              shadowColor: '#f97316', shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
            }}>
              <Text style={{ color: s.color, fontSize: 28, fontWeight: '800' }}>{s.value}</Text>
              <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {occurrences.length === 0 ? (
          <View style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#334155' }}>
            <Text style={{ color: '#94a3b8', fontSize: 15, marginBottom: 16 }}>Nenhuma ocorrência ainda</Text>
            <TouchableOpacity
              onPress={() => router.push('/occurrences/new')}
              style={{ backgroundColor: '#f97316', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Criar Primeira</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Ocorrências Recentes</Text>
            {recent.map((occ: any) => (
              <TouchableOpacity
                key={occ._id}
                onPress={() => router.push(`/occurrences/${occ._id}`)}
                style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#334155' }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 15, marginBottom: 4 }} numberOfLines={1}>{occ.title}</Text>
                    <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }} numberOfLines={1}>{occ.description}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: '#64748b', fontSize: 11 }}>{occ.createdBy?.fullName || 'N/A'}</Text>
                      <Text style={{ color: '#475569', fontSize: 11 }}>
                        {new Date(occ.createdAt).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <StatusBadge status={occ.status} />
                    <PriorityBadge priority={occ.priority} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}
