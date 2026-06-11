import { z } from 'zod';

export const weekDaySchema = z.enum(['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']);

export const onCallShiftSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  department: z.string().min(1, 'Departamento é obrigatório'),
  weekDays: z.array(weekDaySchema).min(1, 'Selecione pelo menos um dia'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:mm'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:mm'),
  userIds: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export type OnCallShiftInput = z.infer<typeof onCallShiftSchema>;
