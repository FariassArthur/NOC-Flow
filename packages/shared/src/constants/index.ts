export const STATUS_OPTIONS = {
  aberta: { label: 'Aberta', color: '#ef4444' },
  em_andamento: { label: 'Em Andamento', color: '#f59e0b' },
  pausada: { label: 'Pausada', color: '#8b5cf6' },
  fechada: { label: 'Fechada', color: '#10b981' },
} as const;

export const PRIORITY_OPTIONS = {
  baixa: { label: 'Baixa', color: '#3b82f6' },
  média: { label: 'Média', color: '#f59e0b' },
  alta: { label: 'Alta', color: '#ef4444' },
  crítica: { label: 'Crítica', color: '#7c2d12' },
} as const;

export const ROLE_OPTIONS = {
  viewer: 'Visualizador',
  analyst: 'Analista',
  admin: 'Administrador',
} as const;

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  aberta: ['em_andamento', 'pausada'],
  em_andamento: ['pausada', 'fechada'],
  pausada: ['em_andamento', 'fechada'],
  fechada: [],
};
