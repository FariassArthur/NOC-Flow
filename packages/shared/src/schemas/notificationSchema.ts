import { z } from 'zod';

export const notificationSchema = z.object({
  recipient: z.string().min(1, 'Destinatário é obrigatório'),
  type: z.enum(['new_occurrence', 'status_change', 'assignment', 'comment', 'escalation']),
  title: z.string().min(1),
  message: z.string().min(1),
  relatedOccurrence: z.string().optional(),
  read: z.boolean().default(false),
});

export type NotificationInput = z.infer<typeof notificationSchema>;
