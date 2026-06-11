import { Response } from 'express';
import { Occurrence } from '../models/Occurrence';
import type { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const populateBase = [
  { path: 'createdBy', select: 'fullName email department' },
  { path: 'assignedTo', select: 'fullName email department' },
];

export const getEquipmentHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { equipmentId } = req.params;
    const { page, limit } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [occurrences, total] = await Promise.all([
      Occurrence.find({ equipment: equipmentId })
        .populate(populateBase)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Occurrence.countDocuments({ equipment: equipmentId }),
    ]);

    res.json({ data: occurrences, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error: unknown) {
    logger.error('[getEquipmentHistory]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao buscar histórico do equipamento' });
  }
};

export const getEquipmentSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { equipmentId } = req.params;

    const stats = await Occurrence.aggregate([
      { $match: { equipment: equipmentId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          abertas: { $sum: { $cond: [{ $eq: ['$status', 'aberta'] }, 1, 0] } },
          emExecucao: { $sum: { $cond: [{ $eq: ['$status', 'em_execucao'] }, 1, 0] } },
          finalizadas: { $sum: { $cond: [{ $eq: ['$status', 'finalizada'] }, 1, 0] } },
          criticas: { $sum: { $cond: [{ $eq: ['$priority', 'crítica'] }, 1, 0] } },
          slaViolado: { $sum: { $cond: [{ $eq: ['$slaStatus', 'violado'] }, 1, 0] } },
          avgResolutionTime: {
            $avg: {
              $cond: [
                { $and: [{ $ne: ['$resolvidoEm', null] }, { $ne: ['$createdAt', null] }] },
                { $divide: [{ $subtract: ['$resolvidoEm', '$createdAt'] }, 60000] },
                null,
              ],
            },
          },
        },
      },
    ]);

    res.json(
      stats[0] || {
        total: 0,
        abertas: 0,
        emExecucao: 0,
        finalizadas: 0,
        criticas: 0,
        slaViolado: 0,
        avgResolutionTime: 0,
      }
    );
  } catch (error: unknown) {
    logger.error('[getEquipmentSummary]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao buscar resumo do equipamento' });
  }
};
