import type { OccurrenceStatus, Priority } from '../types/occurrence';
import type { NotificationType } from '../types/notification';

export const STATUS_OPTIONS = {
  aberta: { label: 'Aberta', color: '#ef4444' },
  em_execucao: { label: 'Em Execução', color: '#f59e0b' },
  finalizada: { label: 'Finalizada', color: '#10b981' },
} as const satisfies Record<OccurrenceStatus, { label: string; color: string }>;

export const PRIORITY_OPTIONS = {
  baixa: { label: 'Baixa', color: '#3b82f6' },
  média: { label: 'Média', color: '#f59e0b' },
  alta: { label: 'Alta', color: '#ef4444' },
  crítica: { label: 'Crítica', color: '#7c2d12' },
} as const satisfies Record<Priority, { label: string; color: string }>;

export const ROLE_OPTIONS = {
  viewer: 'Visualizador',
  analyst: 'Analista',
  admin: 'Administrador',
} as const;

export const STATUS_TRANSITIONS: Record<OccurrenceStatus, OccurrenceStatus[]> = {
  aberta: ['em_execucao'],
  em_execucao: ['finalizada'],
  finalizada: [],
};

export const PERMISSIONS = {
  users: { label: 'Gerenciar Usuários', description: 'Criar, editar e excluir usuários' },
  departments: { label: 'Gerenciar Setores', description: 'Criar, editar e excluir setores' },
  categories: { label: 'Gerenciar Categorias', description: 'Criar, editar e excluir categorias' },
  equipment: {
    label: 'Gerenciar Equipamentos',
    description: 'Criar, editar e excluir equipamentos',
  },
  services: { label: 'Gerenciar Serviços', description: 'Criar, editar e excluir serviços' },
  runbooks: { label: 'Gerenciar Runbooks', description: 'Criar, editar e excluir runbooks' },
  escalations: {
    label: 'Gerenciar Escalonamentos',
    description: 'Criar, editar e excluir regras de escalonamento',
  },
  templates: {
    label: 'Gerenciar Templates',
    description: 'Criar, editar e excluir templates de ocorrências',
  },
  audit: { label: 'Visualizar Auditoria', description: 'Acessar logs de auditoria do sistema' },
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export const NOTIFICATION_TYPE_OPTIONS = {
  new_occurrence: { label: 'Nova Ocorrência', color: '#f97316' },
  status_change: { label: 'Mudança de Status', color: '#3b82f6' },
  assignment: { label: 'Atribuição', color: '#8b5cf6' },
  comment: { label: 'Comentário', color: '#10b981' },
  escalation: { label: 'Escalonamento', color: '#ec4899' },
  scheduled_report: { label: 'Relatório Agendado', color: '#14b8a6' },
} as const satisfies Record<NotificationType, { label: string; color: string }>;
