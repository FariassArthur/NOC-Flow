import mongoose from 'mongoose';
import type { AuditLog as AuditLogType } from '@ccore/shared';

const auditLogSchema = new mongoose.Schema<AuditLogType>(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    userId: { type: String, index: true },
    userName: String,
    userDepartment: String,
    targetId: { type: String, index: true },
    targetType: String,
    details: String,
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog = mongoose.model<AuditLogType>('AuditLog', auditLogSchema);
