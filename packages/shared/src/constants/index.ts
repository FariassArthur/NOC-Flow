export const STATUS_OPTIONS = {
  aberta: { label: 'Aberta', color: '#ef4444' },
  em_execucao: { label: 'Em Execução', color: '#f59e0b' },
  finalizada: { label: 'Finalizada', color: '#10b981' },
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
  aberta: ['em_execucao'],
  em_execucao: ['finalizada'],
  finalizada: [],
};

export const NOTIFICATION_TYPE_OPTIONS = {
  new_occurrence: { label: 'Nova Ocorrência', color: '#f97316' },
  status_change: { label: 'Mudança de Status', color: '#3b82f6' },
  assignment: { label: 'Atribuição', color: '#8b5cf6' },
  comment: { label: 'Comentário', color: '#10b981' },
} as const;
