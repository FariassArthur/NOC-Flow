import { Response } from 'express';
import { AuditLog } from '../models/AuditLog';
import type { AuthRequest } from '../middleware/auth';

export const listAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { action, userId, targetId, page, limit } = req.query;
    const filter: any = {};

    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    if (targetId) filter.targetId = targetId;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      data: logs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    console.error('[listAuditLogs]', error.message);
    res.status(400).json({ error: 'Erro ao listar logs de auditoria' });
  }
};

export const getAuditLog = async (req: AuthRequest, res: Response) => {
  try {
    const log = await AuditLog.findById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log não encontrado' });
    res.json(log);
  } catch (error: any) {
    console.error('[getAuditLog]', error.message);
    res.status(400).json({ error: 'Erro ao buscar log' });
  }
};

export const getAuditStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalLogs, actions, recentLogins] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      AuditLog.find({ action: 'login' })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('userName createdAt ip'),
    ]);

    res.json({ totalLogs, actions, recentLogins });
  } catch (error: any) {
    console.error('[getAuditStats]', error.message);
    res.status(400).json({ error: 'Erro ao buscar estatísticas de auditoria' });
  }
};
