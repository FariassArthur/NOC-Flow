import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { occurrenceAPI, authAPI } from '../../lib/api';
import { statusCount, priorityCount } from '@noc/shared';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import PieChart from '../../components/Charts/PieChart';
import BarChart from '../../components/Charts/BarChart';
import LineChart from '../../components/Charts/LineChart';

function groupBy<T>(arr: T[], fn: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const key = fn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

const screenWidth = Dimensions.get('window').width;

export default function Dashboard() {
  const router = useRouter();
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [occRes, me] = await Promise.all([
        occurrenceAPI.list(),
        authAPI.me().catch(() => null),
      ]);
      setOccurrences(occRes.data || occRes || []);
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

  const statusPie = [
    { label: 'Abertas', value: statusCount(occurrences, 'aberta'), color: '#f87171' },
    { label: 'Execução', value: statusCount(occurrences, 'em_execucao'), color: '#fbbf24' },
    { label: 'Finalizadas', value: statusCount(occurrences, 'finalizada'), color: '#34d399' },
  ];

  const priorityBars = [
    { label: 'Crítica', value: priorityCount(occurrences, 'crítica'), color: '#dc2626' },
    { label: 'Alta', value: priorityCount(occurrences, 'alta'), color: '#f87171' },
    { label: 'Média', value: priorityCount(occurrences, 'média'), color: '#fbbf24' },
    { label: 'Baixa', value: priorityCount(occurrences, 'baixa'), color: '#60a5fa' },
  ];

  const timelineData = (() => {
    const buckets: Record<string, number> = {};
    occurrences.forEach((o) => {
      const d = new Date(o.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      buckets[d] = (buckets[d] || 0) + 1;
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => {
        const parseDateDM = (s: string) => {
          const [d, m, y] = s.split('/').map(Number);
          return y ? new Date(y, m - 1, d).getTime() : new Date(2025, m - 1, d).getTime();
        };
        return parseDateDM(a) - parseDateDM(b);
      })
      .slice(-7)
      .map(([label, value]) => ({ label, value }));
  })();

  const userStats = (() => {
    const groups = groupBy(occurrences, (o) => o.createdBy?.fullName || 'Desconhecido');
    return Object.entries(groups).map(([name, occs]) => ({
      name,
      total: occs.length,
      abertas: occs.filter((o) => o.status === 'aberta').length,
      execucao: occs.filter((o) => o.status === 'em_execucao').length,
      finalizadas: occs.filter((o) => o.status === 'finalizada').length,
    })).sort((a, b) => b.total - a.total);
  })();

  const recent = occurrences.slice(0, 5);

  const cardStyle = { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#334155' };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f172a' }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />}>
      <View style={{ padding: 16, gap: 16 }}>
        {user && (
          <Text style={{ color: '#94a3b8', fontSize: 14 }}>
            {user.fullName} · {user.department}
          </Text>
        )}

        {/* Stats cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {stats.map((s) => (
            <View key={s.label} style={{ flex: 1, minWidth: '45%', ...cardStyle, shadowColor: '#f97316', shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 }}>
              <Text style={{ color: s.color, fontSize: 28, fontWeight: '800' }}>{s.value}</Text>
              <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Charts section */}
        {occurrences.length > 0 && (
          <>
            <View style={cardStyle}>
              <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15, marginBottom: 12 }}>Status</Text>
              <PieChart data={statusPie} size={Math.min(screenWidth - 64, 160)} />
            </View>

            <View style={cardStyle}>
              <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15, marginBottom: 12 }}>Prioridade</Text>
              <BarChart data={priorityBars} width={Math.min(screenWidth - 32, 320)} />
            </View>

            {timelineData.length > 1 && (
              <View style={cardStyle}>
                <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15, marginBottom: 12 }}>Ocorrências ao longo do tempo</Text>
                <LineChart data={timelineData} width={Math.min(screenWidth - 32, 320)} />
              </View>
            )}
          </>
        )}

        {/* Occurrences per user */}
        {userStats.length > 0 && (
          <View style={cardStyle}>
            <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15, marginBottom: 12 }}>Ocorrências por Usuário</Text>
            <View style={{ gap: 8 }}>
              {userStats.slice(0, 8).map((u) => (
                <View key={u.name} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: '#cbd5e1', fontSize: 13, flex: 1 }} numberOfLines={1}>{u.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <Text style={{ color: '#f87171', fontSize: 12 }}>{u.abertas}</Text>
                    <Text style={{ color: '#fbbf24', fontSize: 12 }}>{u.execucao}</Text>
                    <Text style={{ color: '#34d399', fontSize: 12 }}>{u.finalizadas}</Text>
                    <Text style={{ color: '#64748b', fontSize: 12 }}>({u.total})</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent occurrences */}
        {occurrences.length === 0 ? (
          <View style={{ ...cardStyle, alignItems: 'center', padding: 32 }}>
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
            <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '700' }}>Ocorrências Recentes</Text>
            {recent.map((occ: any) => (
              <TouchableOpacity
                key={occ._id}
                onPress={() => router.push(`/occurrences/${occ._id}`)}
                style={cardStyle}
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
