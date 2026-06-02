import { View, Text } from 'react-native';

const priorityConfig: Record<string, { label: string; color: string }> = {
  baixa: { label: 'Baixa', color: '#60a5fa' },
  média: { label: 'Média', color: '#fbbf24' },
  alta: { label: 'Alta', color: '#f87171' },
  crítica: { label: 'Crítica', color: '#ef4444' },
};

export default function PriorityBadge({ priority }: { priority: string }) {
  const cfg = priorityConfig[priority] || { label: priority, color: '#94a3b8' };
  return (
    <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '700' }}>{cfg.label.toUpperCase()}</Text>
  );
}
