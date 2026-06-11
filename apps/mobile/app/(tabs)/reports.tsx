import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Share,
  Alert,
} from 'react-native';
import { occurrenceAPI, authAPI } from '../../lib/api';
import { statusCount, priorityCount } from '@ccore/shared';
import PieChart from '../../components/Charts/PieChart';
import BarChart from '../../components/Charts/BarChart';

export default function ReportsScreen() {
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [user, setUser] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const [occRes, me] = await Promise.all([
        occurrenceAPI.list(),
        authAPI.me().catch(() => null),
      ]);
      setOccurrences(occRes.data || occRes || []);
      setUser(me);
      setFetchError('');
    } catch {
      setFetchError('Erro ao carregar relatórios');
    }
  }, []);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, []);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

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

  const total = occurrences.length;
  const resolved = statusCount(occurrences, 'finalizada');
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const openUrgent = occurrences.filter(
    (o) => o.status !== 'finalizada' && (o.priority === 'alta' || o.priority === 'crítica')
  ).length;
  const avgResolucao = occurrences
    .filter((o) => o.status === 'finalizada' && o.resolvidoEm)
    .reduce((acc, o) => {
      const created = new Date(o.createdAt).getTime();
      const resolvedD = new Date(o.resolvidoEm).getTime();
      return acc + (resolvedD - created);
    }, 0);
  const avgDays = resolved > 0 ? Math.round(avgResolucao / resolved / 86400000) : 0;

  const handleExport = async () => {
    const header = 'Título;Status;Prioridade;Responsável;Criado em;Resolvido em\n';
    const rows = occurrences
      .map(
        (o) =>
          `"${o.title}";"${o.status}";"${o.priority}";"${o.assignedTo?.fullName || ''}";"${new Date(o.createdAt).toLocaleDateString('pt-BR')}";"${o.resolvidoEm ? new Date(o.resolvidoEm).toLocaleDateString('pt-BR') : ''}"`
      )
      .join('\n');
    const csv = '\uFEFF' + header + rows;
    try {
      await Share.share({ message: csv, title: 'relatorio-ocorrencias.csv' });
    } catch {
      /* noop */
    }
  };

  const cardStyle = {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  };

  if (fetchError) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0f172a',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 32,
        }}
      >
        <Text style={{ color: '#f87171', fontSize: 15, marginBottom: 12 }}>{fetchError}</Text>
        <TouchableOpacity
          onPress={() => {
            setLoading(true);
            fetchData().finally(() => setLoading(false));
          }}
          style={{
            backgroundColor: '#f97316',
            borderRadius: 12,
            paddingHorizontal: 24,
            paddingVertical: 12,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />
      }
    >
      <View style={{ padding: 16, gap: 16 }}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '700' }}>Relatórios</Text>
          <TouchableOpacity
            onPress={handleExport}
            style={{
              backgroundColor: '#f97316',
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Exportar CSV</Text>
          </TouchableOpacity>
        </View>

        {/* KPI cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <View style={{ flex: 1, minWidth: '45%', ...cardStyle }}>
            <Text style={{ color: '#34d399', fontSize: 24, fontWeight: '800' }}>
              {resolutionRate}%
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Taxa de Resolução</Text>
            <Text style={{ color: '#64748b', fontSize: 11 }}>
              {resolved} de {total} finalizadas
            </Text>
          </View>
          <View style={{ flex: 1, minWidth: '45%', ...cardStyle }}>
            <Text style={{ color: '#f87171', fontSize: 24, fontWeight: '800' }}>{openUrgent}</Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Abertas Urgentes</Text>
            <Text style={{ color: '#64748b', fontSize: 11 }}>Alta/Crítica não resolvidas</Text>
          </View>
          <View style={{ flex: 1, minWidth: '45%', ...cardStyle }}>
            <Text style={{ color: '#fbbf24', fontSize: 24, fontWeight: '800' }}>{avgDays}d</Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Tempo Médio</Text>
            <Text style={{ color: '#64748b', fontSize: 11 }}>Para resolução</Text>
          </View>
          <View style={{ flex: 1, minWidth: '45%', ...cardStyle }}>
            <Text style={{ color: '#94a3b8', fontSize: 24, fontWeight: '800' }}>{total}</Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Total</Text>
            <Text style={{ color: '#64748b', fontSize: 11 }}>Ocorrências registradas</Text>
          </View>
        </View>

        {/* Charts */}
        {occurrences.length > 0 && (
          <>
            <View style={cardStyle}>
              <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15, marginBottom: 12 }}>
                Distribuição por Status
              </Text>
              <PieChart data={statusPie} size={140} />
            </View>
            <View style={cardStyle}>
              <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15, marginBottom: 12 }}>
                Distribuição por Prioridade
              </Text>
              <BarChart data={priorityBars} width={280} />
            </View>
          </>
        )}

        {/* Summary table */}
        <View style={cardStyle}>
          <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15, marginBottom: 12 }}>
            Resumo Geral
          </Text>
          <View style={{ gap: 8 }}>
            {[
              { label: 'Total de ocorrências', value: total },
              { label: 'Abertas', value: statusCount(occurrences, 'aberta') },
              { label: 'Em execução', value: statusCount(occurrences, 'em_execucao') },
              { label: 'Finalizadas', value: resolved },
              {
                label: 'Críticas pendentes',
                value: occurrences.filter(
                  (o) => o.status !== 'finalizada' && o.priority === 'crítica'
                ).length,
              },
              {
                label: 'Com prazo vencido',
                value: occurrences.filter(
                  (o) => o.dueDate && o.status !== 'finalizada' && new Date(o.dueDate) < new Date()
                ).length,
              },
              { label: 'Sem responsável', value: occurrences.filter((o) => !o.assignedTo).length },
            ].map((r) => (
              <View
                key={r.label}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 6,
                  borderBottomWidth: 1,
                  borderBottomColor: '#334155',
                }}
              >
                <Text style={{ color: '#cbd5e1', fontSize: 13 }}>{r.label}</Text>
                <Text style={{ color: '#f1f5f9', fontSize: 13, fontWeight: '600' }}>{r.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
