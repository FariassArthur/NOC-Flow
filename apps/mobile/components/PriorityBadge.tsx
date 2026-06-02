import { View, Text } from 'react-native';

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  baixa: { label: 'Baixa', color: '#60a5fa', bg: '#1e3a5f' },
  média: { label: 'Média', color: '#fbbf24', bg: '#451a03' },
  alta: { label: 'Alta', color: '#f87171', bg: '#450a0a' },
  crítica: { label: 'Crítica', color: '#ef4444', bg: '#7f1d1d' },
};

export default function PriorityBadge({ priority }: { priority: string }) {
  const cfg = priorityConfig[priority] || { label: priority, color: '#94a3b8', bg: '#1e293b' };
  return (
    <View style={{ backgroundColor: cfg.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700' }}>{cfg.label.toUpperCase()}</Text>
    </View>
  );
}
