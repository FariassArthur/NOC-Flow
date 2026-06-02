import { View, Text } from 'react-native';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  aberta: { label: 'Aberta', color: '#f87171', bg: '#450a0a' },
  em_execucao: { label: 'Em Execução', color: '#fbbf24', bg: '#451a03' },
  finalizada: { label: 'Finalizada', color: '#34d399', bg: '#022c22' },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || { label: status, color: '#94a3b8', bg: '#1e293b' };
  return (
    <View style={{ backgroundColor: cfg.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text style={{ color: cfg.color, fontSize: 12, fontWeight: '600' }}>{cfg.label}</Text>
    </View>
  );
}
