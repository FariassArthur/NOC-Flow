export type AuditAction =
  | 'login'
  | 'logout'
  | 'register'
  | 'create_occurrence'
  | 'update_occurrence'
  | 'delete_occurrence'
  | 'resolve_occurrence'
  | 'assign_occurrence'
  | 'add_comment'
  | 'upload_file'
  | 'create_user'
  | 'update_user'
  | 'delete_user'
  | 'escalation_triggered'
  | 'runbook_executed';

export interface AuditLog {
  _id?: string;
  action: AuditAction;
  userId?: string;
  userName?: string;
  userDepartment?: string;
  targetId?: string;
  targetType?: string;
  details?: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}
