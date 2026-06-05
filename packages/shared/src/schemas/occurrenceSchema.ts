import { z } from 'zod';

export const occurrenceSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  status: z.enum(['aberta', 'em_execucao', 'finalizada']).default('aberta'),
  priority: z.enum(['baixa', 'média', 'alta', 'crítica']).default('média'),
  tags: z.array(z.string()).default([]),
  assignedTo: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  timeSpentMinutes: z.number().default(0),
  category: z.string().optional(),
  equipment: z.string().optional(),
  service: z.string().optional(),
});

export const resolucaoSchema = z.object({
  resolucao: z.string().min(10, 'Descreva a ação corretiva (mínimo 10 caracteres)'),
});

export const rcaSchema = z.object({
  causaRaiz: z.string().min(3, 'Descreva a causa raiz'),
  tipo: z.enum(['hardware', 'software', 'provedor', 'humano', 'outro']),
  impacto: z.string().min(3, 'Descreva o impacto'),
  acoesPreventivas: z.string().optional(),
});

export const commentSchema = z.object({
  text: z.string().min(1, 'Comentário não pode estar vazio'),
});

export const commLogSchema = z.object({
  contactName: z.string().min(1, 'Nome do contato é obrigatório'),
  contactType: z.enum(['provedor', 'cliente', 'fornecedor', 'interno']),
  description: z.string().min(1, 'Descrição é obrigatória'),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  slaResponseMinutes: z.number().optional(),
  slaResolutionMinutes: z.number().optional(),
  color: z.string().optional(),
});

export const equipmentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['roteador', 'switch', 'firewall', 'link', 'servidor', 'outro']),
  ip: z.string().optional(),
  brand: z.string().optional(),
  equipmentModel: z.string().optional(),
  location: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(['ativo', 'inativo', 'manutencao']).default('ativo'),
});

export const serviceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['internet', 'mpls', 'voip', 'vpn', 'datacenter', 'outro']),
  provider: z.string().optional(),
  contract: z.string().optional(),
  bandwidth: z.string().optional(),
  status: z.enum(['ativo', 'inativo']).default('ativo'),
});

export const runbookSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  category: z.string().optional(),
  priority: z.string().optional(),
  steps: z.array(z.object({
    order: z.number(),
    description: z.string().min(1, 'Descrição do passo é obrigatória'),
  })),
  tags: z.array(z.string()).optional(),
});

export const escalationRuleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  priority: z.string().min(1, 'Prioridade é obrigatória'),
  triggerType: z.enum(['sla_breach', 'time_passed']),
  triggerMinutes: z.number().min(1),
  targetRole: z.string().optional(),
  targetDepartment: z.string().optional(),
  notifyAlso: z.array(z.string()).optional(),
  active: z.boolean().default(true),
});

export const updateOccurrenceSchema = occurrenceSchema.partial();

export type OccurrenceInput = z.infer<typeof occurrenceSchema>;
export type UpdateOccurrenceInput = z.infer<typeof updateOccurrenceSchema>;
export type ResolucaoInput = z.infer<typeof resolucaoSchema>;
export type RCAInput = z.infer<typeof rcaSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type CommLogEntryInput = z.infer<typeof commLogSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type EquipmentInput = z.infer<typeof equipmentSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type RunbookInput = z.infer<typeof runbookSchema>;
export type EscalationRuleInput = z.infer<typeof escalationRuleSchema>;
