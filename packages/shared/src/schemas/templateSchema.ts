import { z } from 'zod';

export const templateSchema = z.object({
  name: z.string().min(2, 'Nome do template deve ter pelo menos 2 caracteres'),
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  priority: z.string().optional(),
  category: z.string().optional(),
  service: z.string().optional(),
  equipment: z.string().optional(),
});

export type TemplateInput = z.infer<typeof templateSchema>;
