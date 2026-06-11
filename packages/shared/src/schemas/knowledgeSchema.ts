import { z } from 'zod';

export const knowledgeArticleSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres'),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  relatedEquipmentTypes: z.array(z.string()).default([]),
  published: z.boolean().default(true),
});

export type KnowledgeArticleInput = z.infer<typeof knowledgeArticleSchema>;
