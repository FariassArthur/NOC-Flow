import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().min(2, 'Nome do setor deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;
