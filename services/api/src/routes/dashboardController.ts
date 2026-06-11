import { Response } from 'express';
import { Occurrence } from '../models/Occurrence';
import type { PipelineStage } from 'mongoose';
import type { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

interface DateFilter {
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

export const dashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const { from, to } = req.query;
    const dateFilter: DateFilter = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from as string);
      if (to) {
        const endDate = new Date(to as string);
        endDate.setDate(endDate.getDate() + 1);
        dateFilter.createdAt.$lte = endDate;
      }
    }

    const [
      totalOccurrences,
      openOccurrences,
      statusCounts,
      priorityCounts,
      departmentCounts,
      avgResolutionTime,
      slaStats,
      equipmentCounts,
    ] = await Promise.all([
      Occurrence.countDocuments(dateFilter),
      Occurrence.countDocuments({ ...dateFilter, status: { $ne: 'finalizada' } }),
      Occurrence.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Occurrence.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Occurrence.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'creator',
          },
        },
        { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } },
        { $match: dateFilter },
        {
          $group: {
            _id: '$creator.department',
            count: { $sum: 1 },
          },
        },
      ]),
      Occurrence.aggregate([
        { $match: { ...dateFilter, status: 'finalizada', resolvidoEm: { $ne: null } } },
        {
          $project: {
            resolutionTime: {
              $divide: [{ $subtract: ['$resolvidoEm', '$createdAt'] }, 60000],
            },
          },
        },
        { $group: { _id: null, avgMinutes: { $avg: '$resolutionTime' } } },
      ]),
      Occurrence.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            dentro: { $sum: { $cond: [{ $eq: ['$slaStatus', 'dentro'] }, 1, 0] } },
            atrasado: { $sum: { $cond: [{ $eq: ['$slaStatus', 'atrasado'] }, 1, 0] } },
            violado: { $sum: { $cond: [{ $eq: ['$slaStatus', 'violado'] }, 1, 0] } },
            semSLA: {
              $sum: {
                $cond: [
                  { $or: [{ $eq: ['$slaStatus', null] }, { $eq: ['$slaStatus', undefined] }] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      Occurrence.aggregate([
        { $match: { ...dateFilter, equipment: { $ne: null } } },
        {
          $group: {
            _id: '$equipment',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      totalOccurrences,
      openOccurrences,
      statusCounts: Object.fromEntries(
        statusCounts.map((s: { _id: string; count: number }) => [s._id, s.count])
      ),
      priorityCounts: Object.fromEntries(
        priorityCounts.map((p: { _id: string; count: number }) => [p._id, p.count])
      ),
      departmentCounts: Object.fromEntries(
        departmentCounts.map((d: { _id: string | null; count: number }) => [
          d._id || 'Sem departamento',
          d.count,
        ])
      ),
      avgResolutionTimeMinutes: Math.round(avgResolutionTime[0]?.avgMinutes || 0),
      slaStats: slaStats[0] || { dentro: 0, atrasado: 0, violado: 0, semSLA: 0 },
      topEquipmentCounts: equipmentCounts.map((e: { _id: string; count: number }) => ({
        equipmentId: e._id,
        count: e.count,
      })),
    });
  } catch (error: unknown) {
    logger.error('[dashboardStats]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao carregar dashboard' });
  }
};

export const occurrenceTimeline = async (req: AuthRequest, res: Response) => {
  try {
    const { days } = req.query;
    const numDays = Math.min(90, Math.max(1, parseInt(days as string) || 30));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numDays);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const data = await Occurrence.aggregate(pipeline);

    const dateMap = new Map<string, number>();
    for (let i = 0; i < numDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dateMap.set(key, 0);
    }
    for (const item of data) {
      if (dateMap.has(item._id)) {
        dateMap.set(item._id, item.count);
      }
    }

    const timeline = Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    res.json(timeline);
  } catch (error: unknown) {
    logger.error('[occurrenceTimeline]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao carregar timeline' });
  }
};

export const departmentSla = async (req: AuthRequest, res: Response) => {
  try {
    const { from, to } = req.query;
    const dateFilter: DateFilter = {};
    if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from as string);
      if (to) {
        const endDate = new Date(to as string);
        endDate.setDate(endDate.getDate() + 1);
        dateFilter.createdAt.$lte = endDate;
      }
    }

    const data = await Occurrence.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator',
        },
      },
      { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } },
      { $match: dateFilter },
      {
        $group: {
          _id: '$creator.department',
          total: { $sum: 1 },
          dentro: { $sum: { $cond: [{ $eq: ['$slaStatus', 'dentro'] }, 1, 0] } },
          atrasado: { $sum: { $cond: [{ $eq: ['$slaStatus', 'atrasado'] }, 1, 0] } },
          violado: { $sum: { $cond: [{ $eq: ['$slaStatus', 'violado'] }, 1, 0] } },
        },
      },
    ]);

    res.json(data);
  } catch (error: unknown) {
    logger.error('[departmentSla]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao carregar SLA por departamento' });
  }
};
