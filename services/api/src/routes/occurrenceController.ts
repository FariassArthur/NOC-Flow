import { Response } from 'express';
import { Occurrence } from '../models/Occurrence';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { occurrenceSchema, updateOccurrenceSchema } from '@ccore/shared';
import type { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const sanitize = (val: unknown): string => {
  if (typeof val !== 'string') return '';
  if (val.startsWith('$') || val.includes('$')) return '';
  return val;
};

const populateBase = [
  { path: 'createdBy', select: 'fullName email department cargo' },
  { path: 'assignedTo', select: 'fullName email department cargo' },
  { path: 'category', select: 'name color' },
  { path: 'equipment', select: 'name type ip location' },
  { path: 'service', select: 'name type provider' },
];

export const listOccurrences = async (req: AuthRequest, res: Response) => {
  try {
    const { status, assignedTo, priority, search, page, limit } = req.query;
    const filter: any = {};

    if (status && typeof status === 'string') filter.status = sanitize(status);
    if (assignedTo && typeof assignedTo === 'string') filter.assignedTo = sanitize(assignedTo);
    if (priority && typeof priority === 'string') filter.priority = sanitize(priority);

    if (search && typeof search === 'string') {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [{ title: regex }, { description: regex }, { tags: regex }];
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [occurrences, total] = await Promise.all([
      Occurrence.find(filter)
        .populate(populateBase)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Occurrence.countDocuments(filter),
    ]);

    res.json({ data: occurrences, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error: any) {
    logger.error('[listOccurrences]', error.message);
    res.status(400).json({ error: 'Erro ao listar ocorrências' });
  }
};

export const getOccurrence = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const occurrence = await Occurrence.findById(id)
      .populate(populateBase)
      .populate('comments.author', 'fullName email department cargo')
      .populate('history.changedBy', 'fullName email department cargo');

    if (!occurrence) return res.status(404).json({ error: 'Occurrence not found' });
    res.json(occurrence);
  } catch (error: any) {
    logger.error('[getOccurrence]', error.message);
    res.status(400).json({ error: 'Erro ao buscar ocorrência' });
  }
};

export const createOccurrence = async (req: AuthRequest, res: Response) => {
  try {
    const data = occurrenceSchema.parse(req.body);
    const occurrence = await Occurrence.create({
      ...data,
      createdBy: req.userId,
      comments: [],
      attachments: [],
      history: [],
    });

    const creator = await User.findById(req.userId);
    if (creator) {
      const otherUsers = await User.find({
        _id: { $ne: req.userId },
        department: { $ne: creator.department },
      });

      const notifications = otherUsers.map((user) => ({
        recipient: user._id.toString(),
        type: 'new_occurrence' as const,
        title: 'Nova Ocorrência',
        message: `${creator.fullName} (${creator.department}) abriu "${occurrence.title}"`,
        relatedOccurrence: occurrence._id.toString(),
        read: false,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    const populated = await occurrence.populate(populateBase);
    res.status(201).json(populated);
  } catch (error: any) {
    logger.error('[createOccurrence]', error.message);
    res.status(400).json({ error: 'Erro ao criar ocorrência' });
  }
};

export const updateOccurrence = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateOccurrenceSchema.parse(req.body);

    const occurrence = await Occurrence.findById(id);
    if (!occurrence) return res.status(404).json({ error: 'Occurrence not found' });

    const oldData = occurrence.toObject();
    Object.assign(occurrence, data);

    for (const key of Object.keys(data)) {
      if (oldData[key as keyof typeof oldData] !== data[key as keyof typeof data]) {
        occurrence.history.push({
          field: key,
          oldValue: String(oldData[key as keyof typeof oldData] || ''),
          newValue: String(data[key as keyof typeof data] || ''),
          changedBy: req.userId as any,
          changedAt: new Date(),
        });
      }
    }
    await occurrence.save();

    if (data.status && data.status !== oldData.status) {
      const updater = await User.findById(req.userId);
      if (updater) {
        const notifyUserIds = new Set<string>();
        const createdId = oldData.createdBy?.toString();
        const assignedId = oldData.assignedTo?.toString();
        if (createdId && createdId !== req.userId) notifyUserIds.add(createdId);
        if (assignedId && assignedId !== req.userId) notifyUserIds.add(assignedId);

        if (notifyUserIds.size > 0) {
          const notifications = Array.from(notifyUserIds).map((uid) => ({
            recipient: uid,
            type: 'status_change' as const,
            title: 'Status Alterado',
            message: `${updater.fullName} alterou "${occurrence.title}" para "${data.status}"`,
            relatedOccurrence: occurrence._id.toString(),
            read: false,
          }));
          await Notification.insertMany(notifications);
        }
      }
    }

    const updated = await occurrence.populate(populateBase);
    res.json(updated);
  } catch (error: any) {
    logger.error('[updateOccurrence]', error.message);
    res.status(400).json({ error: 'Erro ao atualizar ocorrência' });
  }
};

export const deleteOccurrence = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const occurrence = await Occurrence.findByIdAndDelete(id);
    if (!occurrence) return res.status(404).json({ error: 'Occurrence not found' });
    res.json({ message: 'Occurrence deleted' });
  } catch (error: any) {
    logger.error('[deleteOccurrence]', error.message);
    res.status(400).json({ error: 'Erro ao excluir ocorrência' });
  }
};
