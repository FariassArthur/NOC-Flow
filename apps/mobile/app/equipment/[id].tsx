import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { equipmentAPI, equipmentHistoryAPI } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';

const slaConfig: Record<string, { label: string; color: string }> = {
  dentro: { label: 'OK', color: '#10b981' },
  atrasado: { label: 'Atrasado', color: '#eab308' },
  violado: { label: 'Violado', color: '#ef4444' },
};

export default function EquipmentHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [equipment, setEquipment] = useState<Record<string, unknown> | null>(null);
  const [occurrences, setOccurrences] = useState<Record<string, unknown>[]>([]);
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eq, hist, sum] = await Promise.all([
        equipmentAPI.get(id),
        equipmentHistoryAPI.list(id, { page, limit: 10 }),
        equipmentHistoryAPI.summary(id),
      ]);
      setEquipment(eq);
      setOccurrences(hist.data || []);
      setTotalPages(hist.totalPages || 1);
      setSummary(sum);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id, page]);

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

  if (!equipment) {
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
        <Text style={{ color: '#94a3b8', fontSize: 15 }}>Equipamento não encontrado</Text>
      </View>
    );
  }

  const cardStyle = {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View style={{ padding: 16, gap: 16 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={{ color: '#f1f5f9', fontSize: 20, fontWeight: '700' }}>
            {equipment.name}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 13 }}>
            {equipment.type} {equipment.ip ? `- ${equipment.ip}` : ''}
          </Text>
        </View>

        {/* Summary cards */}
        {summary && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {[
              { label: 'Total', value: summary.total, color: '#94a3b8' },
              { label: 'Resolvidas', value: summary.finalizadas, color: '#10b981' },
              { label: 'Críticas', value: summary.criticas, color: '#ef4444' },
              {
                label: 'Tempo Médio',
                value: summary.avgResolutionTime
                  ? `${Math.round(summary.avgResolutionTime)}min`
                  : '0min',
                color: '#f97316',
              },
            ].map((s) => (
              <View key={s.label} style={{ flex: 1, minWidth: '45%', ...cardStyle }}>
                <Text style={{ color: s.color, fontSize: 24, fontWeight: '800' }}>{s.value}</Text>
                <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Equipment info */}
        <View style={cardStyle}>
          <View style={{ gap: 8 }}>
            {[
              { label: 'Marca', value: equipment.brand || '-' },
              { label: 'Modelo', value: equipment.equipmentModel || '-' },
              { label: 'Localização', value: equipment.location || '-' },
              { label: 'Status', value: equipment.status || '-' },
            ].map((f) => (
              <View key={f.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#94a3b8', fontSize: 13 }}>{f.label}</Text>
                <Text style={{ color: '#f1f5f9', fontSize: 13 }}>{f.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Occurrence history */}
        <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '700' }}>
          Histórico de Ocorrências
        </Text>

        {occurrences.map((occ: Record<string, unknown>) => (
          <TouchableOpacity
            key={occ._id}
            onPress={() => router.push(`/occurrences/${occ._id}`)}
            style={cardStyle}
          >
            <Text
              style={{ color: '#f1f5f9', fontWeight: '600', fontSize: 14, marginBottom: 6 }}
              numberOfLines={1}
            >
              {occ.title}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}>
              <StatusBadge status={occ.status} />
              <PriorityBadge priority={occ.priority} />
              {occ.slaStatus && (
                <View
                  style={{
                    backgroundColor: (slaConfig[occ.slaStatus]?.color || '#64748b') + '20',
                    borderRadius: 4,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{
                      color: slaConfig[occ.slaStatus]?.color || '#64748b',
                      fontSize: 10,
                      fontWeight: '600',
                    }}
                  >
                    SLA {slaConfig[occ.slaStatus]?.label || occ.slaStatus}
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ color: '#64748b', fontSize: 11 }}>
              {new Date(occ.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          </TouchableOpacity>
        ))}

        {occurrences.length === 0 && (
          <View style={{ ...cardStyle, alignItems: 'center', padding: 32 }}>
            <Text style={{ color: '#94a3b8', fontSize: 14 }}>
              Nenhuma ocorrência para este equipamento
            </Text>
          </View>
        )}

        {/* Pagination */}
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
