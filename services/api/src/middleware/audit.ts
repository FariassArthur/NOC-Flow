import { AuditLog } from '../models/AuditLog';
import type { AuthRequest } from './auth';
import type { AuditAction } from '@ccore/shared';
import { logger } from '../utils/logger';

interface AuditEntry {
  action: AuditAction;
  targetId?: string;
  targetType?: string;
  details?: string;
}

export const logAudit = async (req: AuthRequest, entry: AuditEntry) => {
  try {
    await AuditLog.create({
      action: entry.action,
      userId: req.userId,
      userName: req.user?.fullName,
      userDepartment: req.user?.department,
      targetId: entry.targetId,
      targetType: entry.targetType,
      details: entry.details,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
  } catch (error) {
    logger.error('[audit] Failed to log:', error);
  }
};

export const auditMiddleware = (action: AuditAction, targetType?: string) => {
  return async (req: AuthRequest, res: any, next: any) => {
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      const targetId = req.params.id || body?._id || body?.id;
      logAudit(req, {
        action,
        targetId: targetId?.toString(),
        targetType: targetType || req.baseUrl?.split('/').pop(),
      });
      return originalJson(body);
    };
    next();
  };
};
