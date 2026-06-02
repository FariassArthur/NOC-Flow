import { Request, Response } from 'express';
import { Occurrence } from '../models/Occurrence';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { occurrenceSchema, updateOccurrenceSchema } from '@noc/shared';
import type { AuthRequest } from '../middleware/auth';

export const listOccurrences = async (req: AuthRequest, res: Response) => {
  try {
    const { status, assignedTo, priority, search, page, limit } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;

    if (search && typeof search === 'string') {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [
        { title: regex },
        { description: regex },
        { tags: regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [occurrences, total] = await Promise.all([
      Occurrence.find(filter)
        .populate('createdBy', 'fullName email department cargo')
        .populate('assignedTo', 'fullName email department cargo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Occurrence.countDocuments(filter),
    ]);

    res.json({
      data: occurrences,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getOccurrence = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const occurrence = await Occurrence.findById(id)
      .populate('createdBy', 'fullName email department cargo')
      .populate('assignedTo', 'fullName email department cargo')
      .populate('comments.author', 'fullName email department cargo')
      .populate('history.changedBy', 'fullName email department cargo');

    if (!occurrence) {
      return res.status(404).json({ error: 'Occurrence not found' });
    }

    res.json(occurrence);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
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

    // Notify users from other sectors
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

    const populated = await occurrence.populate([
      { path: 'createdBy', select: 'fullName email department cargo' },
      { path: 'assignedTo', select: 'fullName email department cargo' },
    ]);

    res.status(201).json(populated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateOccurrence = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateOccurrenceSchema.parse(req.body);

    const occurrence = await Occurrence.findById(id);
    if (!occurrence) {
      return res.status(404).json({ error: 'Occurrence not found' });
    }

    const oldData = occurrence.toObject();
    Object.assign(occurrence, data);
    await occurrence.save();

    // Add to history
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

    // Notify on status change
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

    const updated = await occurrence.populate([
      { path: 'createdBy', select: 'fullName email department cargo' },
      { path: 'assignedTo', select: 'fullName email department cargo' },
    ]);

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const resolveOccurrence = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.department !== 'NOC') {
      return res.status(403).json({ error: 'Apenas usuários do NOC podem registrar corretivas' });
    }

    const { resolucao } = req.body;

    const { id } = req.params;
    const occurrence = await Occurrence.findById(id);
    if (!occurrence) {
      return res.status(404).json({ error: 'Ocorrência não encontrada' });
    }

    if (occurrence.status === 'finalizada') {
      return res.status(400).json({ error: 'Ocorrência já está finalizada' });
    }

    const oldStatus = occurrence.status;

    occurrence.resolucao = resolucao;
    occurrence.resolvidoPor = req.userId as any;
    occurrence.resolvidoEm = new Date();
    occurrence.status = 'finalizada';

    occurrence.history.push({
      field: 'status',
      oldValue: oldStatus,
      newValue: 'finalizada',
      changedBy: req.userId as any,
      changedAt: new Date(),
    });
    occurrence.history.push({
      field: 'resolucao',
      oldValue: '',
      newValue: 'Corretiva registrada',
      changedBy: req.userId as any,
      changedAt: new Date(),
    });

    await occurrence.save();

    const updated = await occurrence.populate([
      { path: 'createdBy', select: 'fullName email department cargo' },
      { path: 'assignedTo', select: 'fullName email department cargo' },
      { path: 'resolvidoPor', select: 'fullName email department cargo' },
    ]);

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteOccurrence = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const occurrence = await Occurrence.findByIdAndDelete(id);

    if (!occurrence) {
      return res.status(404).json({ error: 'Occurrence not found' });
    }

    res.json({ message: 'Occurrence deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const addAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fileName, fileUrl } = req.body;

    if (!fileName || !fileUrl) {
      return res.status(400).json({ error: 'fileName e fileUrl são obrigatórios' });
    }

    const occurrence = await Occurrence.findById(id);
    if (!occurrence) {
      return res.status(404).json({ error: 'Ocorrência não encontrada' });
    }
    if (occurrence.status === 'finalizada') {
      return res.status(400).json({ error: 'Não é possível anexar arquivos a uma ocorrência finalizada' });
    }

    occurrence.attachments.push({
      fileName,
      fileUrl,
      uploadedAt: new Date(),
    });

    await occurrence.save();

    const updated = await occurrence.populate([
      { path: 'createdBy', select: 'fullName email department cargo' },
      { path: 'assignedTo', select: 'fullName email department cargo' },
    ]);

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const assignOccurrence = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const occurrence = await Occurrence.findById(id);
    if (!occurrence) {
      return res.status(404).json({ error: 'Ocorrência não encontrada' });
    }

    if (occurrence.status === 'finalizada') {
      return res.status(400).json({ error: 'Não é possível atribuir uma ocorrência finalizada' });
    }

    const oldAssigned = occurrence.assignedTo?.toString();

    if (assignedTo) {
      const user = await User.findById(assignedTo);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
    }

    occurrence.assignedTo = assignedTo || null as any;
    occurrence.history.push({
      field: 'assignedTo',
      oldValue: oldAssigned || 'Nenhum',
      newValue: assignedTo || 'Nenhum',
      changedBy: req.userId as any,
      changedAt: new Date(),
    });
    await occurrence.save();

    // Notify assigned user
    const assigner = await User.findById(req.userId);
    if (assignedTo && assigner) {
      await Notification.create({
        recipient: assignedTo,
        type: 'assignment',
        title: 'Atribuição de Ocorrência',
        message: `${assigner.fullName} atribuiu "${occurrence.title}" para você`,
        relatedOccurrence: occurrence._id.toString(),
        read: false,
      });
    }

    const updated = await occurrence.populate([
      { path: 'createdBy', select: 'fullName email department cargo' },
      { path: 'assignedTo', select: 'fullName email department cargo' },
    ]);

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const occurrence = await Occurrence.findById(id);
    if (!occurrence) {
      return res.status(404).json({ error: 'Occurrence not found' });
    }

    occurrence.comments.push({
      author: req.userId as any,
      text,
      createdAt: new Date(),
    });

    await occurrence.save();

    // Notify on comment
    const commenter = await User.findById(req.userId);
    if (commenter) {
      const notifyUserIds = new Set<string>();
      const createdById = occurrence.createdBy?.toString();
      const assignedToId = occurrence.assignedTo?.toString();
      if (createdById && createdById !== req.userId) notifyUserIds.add(createdById);
      if (assignedToId && assignedToId !== req.userId) notifyUserIds.add(assignedToId);

      if (notifyUserIds.size > 0) {
        const notifications = Array.from(notifyUserIds).map((uid) => ({
          recipient: uid,
          type: 'comment' as const,
          title: 'Novo Comentário',
          message: `${commenter.fullName} comentou em "${occurrence.title}"`,
          relatedOccurrence: occurrence._id.toString(),
          read: false,
        }));
        await Notification.insertMany(notifications);
      }
    }

    const updated = await occurrence.populate([
      { path: 'comments.author', select: 'fullName email department cargo' },
      { path: 'createdBy', select: 'fullName email department cargo' },
    ]);

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
