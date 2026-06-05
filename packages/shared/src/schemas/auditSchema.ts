import { z } from 'zod';

export const auditLogSchema = z.object({
  action: z.enum([
    'login', 'logout', 'register',
    'create_occurrence', 'update_occurrence', 'delete_occurrence',
    'resolve_occurrence', 'assign_occurrence', 'add_comment',
    'upload_file', 'create_user', 'update_user', 'delete_user',
    'escalation_triggered', 'runbook_executed',
  ]),
  userId: z.string().optional(),
  userName: z.string().optional(),
  userDepartment: z.string().optional(),
  targetId: z.string().optional(),
  targetType: z.string().optional(),
  details: z.string().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
});

export type AuditLogInput = z.infer<typeof auditLogSchema>;
