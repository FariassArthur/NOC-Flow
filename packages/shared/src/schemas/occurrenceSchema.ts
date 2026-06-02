import { z } from 'zod';

export const occurrenceSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  status: z.enum(['aberta', 'em_andamento', 'pausada', 'fechada']).default('aberta'),
  priority: z.enum(['baixa', 'média', 'alta', 'crítica']).default('média'),
  tags: z.array(z.string()).default([]),
  assignedTo: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  timeSpentMinutes: z.number().default(0),
});

export const updateOccurrenceSchema = occurrenceSchema.partial();

export type OccurrenceInput = z.infer<typeof occurrenceSchema>;
export type UpdateOccurrenceInput = z.infer<typeof updateOccurrenceSchema>;
