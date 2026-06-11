import { Response } from 'express';
import mongoose from 'mongoose';
import { Occurrence } from '../models/Occurrence';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import type { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const populateBase = [
  { path: 'createdBy', select: 'fullName email department cargo' },
  { path: 'assignedTo', select: 'fullName email department cargo' },
  { path: 'category', select: 'name color' },
  { path: 'equipment', select: 'name type ip location' },
  { path: 'service', select: 'name type provider' },
];

const canAccessOccurrence = async (
  userId: string,
  occurrence: { createdBy?: { toString(): string } }
): Promise<boolean> => {
  const user = await User.findById(userId);
  if (!user) return false;
  if (user.department === 'NOC') return true;
  return occurrence.createdBy?.toString() === userId;
};

const getNotifiedUserIds = (
  occurrence: { createdBy?: { toString(): string }; assignedTo?: { toString(): string } },
  currentUserId: string
): Set<string> => {
  const ids = new Set<string>();
  const createdById = occurrence.createdBy?.toString();
  const assignedToId = occurrence.assignedTo?.toString();
  if (createdById && createdById !== currentUserId) ids.add(createdById);
  if (assignedToId && assignedToId !== currentUserId) ids.add(assignedToId);
  return ids;
};

export const resolveOccurrence = async (req: AuthRequest, res: Response) => {
  try {
    const { resolucao } = req.body;
    const { id } = req.params;
    const occurrence = await Occurrence.findById(id);
    if (!occurrence) return res.status(404).json({ error: 'Ocorrência não encontrada' });
    if (occurrence.status === 'finalizada')
      return res.status(400).json({ error: 'Ocorrência já está finalizada' });

    const oldStatus = occurrence.status;
    occurrence.resolucao = resolucao;
    occurrence.resolvidoPor = req.userId as unknown as mongoose.Types.ObjectId;
    occurrence.resolvidoEm = new Date();
    occurrence.status = 'finalizada';
    occurrence.history.push(
      {
        field: 'status',
        oldValue: oldStatus,
        newValue: 'finalizada',
        changedBy: req.userId as unknown as mongoose.Types.ObjectId,
        changedAt: new Date(),
      },
      {
        field: 'resolucao',
        oldValue: '',
        newValue: 'Corretiva registrada',
        changedBy: req.userId as unknown as mongoose.Types.ObjectId,
        changedAt: new Date(),
      }
    );
    await occurrence.save();

    const resolver = await User.findById(req.userId);
    if (resolver) {
      const notifyUserIds = getNotifiedUserIds(occurrence, req.userId!);
      if (notifyUserIds.size > 0) {
        const notifications = Array.from(notifyUserIds).map((uid) => ({
          recipient: uid,
          type: 'status_change' as const,
          title: 'Ocorrência Resolvida',
          message: `${resolver.fullName} resolveu "${occurrence.title}"`,
          relatedOccurrence: occurrence._id.toString(),
          read: false,
        }));
        await Notification.insertMany(notifications);
      }
    }

    const updated = await occurrence.populate([
      ...populateBase,
      { path: 'resolvidoPor', select: 'fullName email department cargo' },
    ]);
    res.json(updated);
  } catch (error: unknown) {
    logger.error('[resolveOccurrence]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao resolver ocorrência' });
  }
};

export const assignOccurrence = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    const occurrence = await Occurrence.findById(id);
    if (!occurrence) return res.status(404).json({ error: 'Ocorrência não encontrada' });
    if (occurrence.status === 'finalizada')
      return res.status(400).json({ error: 'Não é possível atribuir uma ocorrência finalizada' });

    const oldAssigned = occurrence.assignedTo?.toString();
    if (assignedTo) {
      const user = await User.findById(assignedTo);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    occurrence.assignedTo = assignedTo || (null as unknown as mongoose.Types.ObjectId);
    occurrence.history.push({
      field: 'assignedTo',
      oldValue: oldAssigned || 'Nenhum',
      newValue: assignedTo || 'Nenhum',
      changedBy: req.userId as unknown as mongoose.Types.ObjectId,
      changedAt: new Date(),
    });
    await occurrence.save();

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
  } catch (error: unknown) {
    logger.error('[assignOccurrence]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao atribuir ocorrência' });
  }
};

export const addAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fileName, fileUrl } = req.body;
    if (!fileName || !fileUrl)
      return res.status(400).json({ error: 'fileName e fileUrl são obrigatórios' });

    const occurrence = await Occurrence.findById(id);
    if (!occurrence) return res.status(404).json({ error: 'Ocorrência não encontrada' });

    if (!(await canAccessOccurrence(req.userId!, occurrence))) {
      return res.status(403).json({ error: 'Acesso restrito às suas próprias ocorrências' });
    }
    if (occurrence.status === 'finalizada')
      return res
        .status(400)
        .json({ error: 'Não é possível anexar arquivos a uma ocorrência finalizada' });

    occurrence.attachments.push({ fileName, fileUrl, uploadedAt: new Date() });
    await occurrence.save();

    const updated = await occurrence.populate(populateBase);
    res.json(updated);
  } catch (error: unknown) {
    logger.error('[addAttachment]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao adicionar anexo' });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const occurrence = await Occurrence.findById(id);
    if (!occurrence) return res.status(404).json({ error: 'Occurrence not found' });

    if (!(await canAccessOccurrence(req.userId!, occurrence))) {
      return res.status(403).json({ error: 'Acesso restrito às suas próprias ocorrências' });
    }

    occurrence.comments.push({
      author: req.userId as unknown as mongoose.Types.ObjectId,
      text,
      createdAt: new Date(),
    });
    await occurrence.save();

    const commenter = await User.findById(req.userId);
    if (commenter) {
      const notifyUserIds = getNotifiedUserIds(occurrence, req.userId!);
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
      ...populateBase,
    ]);
    res.json(updated);
  } catch (error: unknown) {
    logger.error('[addComment]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao adicionar comentário' });
  }
};

export const startTimer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const occurrence = await Occurrence.findById(id);
    if (!occurrence) return res.status(404).json({ error: 'Ocorrência não encontrada' });
    if (occurrence.status === 'finalizada')
      return res.status(400).json({ error: 'Ocorrência finalizada' });

    occurrence.timeTracking = {
      startTime: new Date(),
      endTime: undefined,
      pausedMinutes: occurrence.timeTracking?.pausedMinutes || 0,
      status: 'running',
    };
    await occurrence.save();
    res.json(occurrence);
  } catch (error: unknown) {
    logger.error('[startTimer]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao iniciar timer' });
  }
};

export const pauseTimer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const occurrence = await Occurrence.findById(id);
    if (!occurrence) return res.status(404).json({ error: 'Ocorrência não encontrada' });
    if (!occurrence.timeTracking || occurrence.timeTracking.status !== 'running')
      return res.status(400).json({ error: 'Timer não está em execução' });
    if (!occurrence.timeTracking.startTime)
      return res.status(400).json({ error: 'Timer sem tempo de início' });

    const elapsed = (Date.now() - new Date(occurrence.timeTracking.startTime).getTime()) / 60000;
    occurrence.timeTracking.pausedMinutes += Math.round(elapsed * 100) / 100;
    occurrence.timeTracking.status = 'paused';
    occurrence.timeTracking.startTime = undefined;
    await occurrence.save();
    res.json(occurrence);
  } catch (error: unknown) {
    logger.error('[pauseTimer]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao pausar timer' });
  }
};

export const stopTimer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const occurrence = await Occurrence.findById(id);
    if (!occurrence) return res.status(404).json({ error: 'Ocorrência não encontrada' });
    if (
      occurrence.timeTracking?.status !== 'running' &&
      occurrence.timeTracking?.status !== 'paused'
    )
      return res.status(400).json({ error: 'Timer não iniciado' });

    let totalMinutes = occurrence.timeTracking.pausedMinutes || 0;
    if (occurrence.timeTracking.startTime) {
      totalMinutes += (Date.now() - new Date(occurrence.timeTracking.startTime).getTime()) / 60000;
    }
    occurrence.timeSpentMinutes += Math.round(totalMinutes);
    occurrence.timeTracking = {
      startTime: undefined,
      endTime: new Date(),
      pausedMinutes: 0,
      status: 'stopped',
    };
    await occurrence.save();
    res.json(occurrence);
  } catch (error: unknown) {
    logger.error('[stopTimer]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao parar timer' });
  }
};

export const addRCA = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { causaRaiz, tipo, impacto, acoesPreventivas } = req.body;
    const occurrence = await Occurrence.findById(id);
    if (!occurrence) return res.status(404).json({ error: 'Ocorrência não encontrada' });
    if (occurrence.status !== 'finalizada')
      return res
        .status(400)
        .json({ error: 'RCA só pode ser registrada em ocorrências finalizadas' });

    occurrence.rca = { causaRaiz, tipo, impacto, acoesPreventivas };
    occurrence.history.push({
      field: 'rca',
      oldValue: '',
      newValue: `RCA: ${causaRaiz.substring(0, 50)}...`,
      changedBy: req.userId as unknown as mongoose.Types.ObjectId,
      changedAt: new Date(),
    });
    await occurrence.save();
    const updated = await occurrence.populate(populateBase);
    res.json(updated);
  } catch (error: unknown) {
    logger.error('[addRCA]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao registrar RCA' });
  }
};

export const addCommLog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { contactName, contactType, description } = req.body;
    const occurrence = await Occurrence.findById(id);
    if (!occurrence) return res.status(404).json({ error: 'Ocorrência não encontrada' });

    if (!occurrence.commLog) occurrence.commLog = [];
    occurrence.commLog.push({
      contactName,
      contactType,
      description,
      createdAt: new Date(),
    });
    occurrence.history.push({
      field: 'commLog',
      oldValue: '',
      newValue: `Contato: ${contactName} (${contactType})`,
      changedBy: req.userId as unknown as mongoose.Types.ObjectId,
      changedAt: new Date(),
    });
    await occurrence.save();
    const updated = await occurrence.populate(populateBase);
    res.json(updated);
  } catch (error: unknown) {
    logger.error('[addCommLog]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao registrar contato' });
  }
};

export const toggleChecklistItem = async (req: AuthRequest, res: Response) => {
  try {
    const { id, itemId } = req.params;
    const { done } = req.body;

    const occurrence = await Occurrence.findById(id);
    if (!occurrence) return res.status(404).json({ error: 'Ocorrência não encontrada' });

    const item = (
      occurrence.checklist as unknown as {
        id(id: string): { done: boolean; doneBy?: string; doneAt?: Date } | undefined;
      }
    )?.id(itemId);
    if (!item) return res.status(404).json({ error: 'Item não encontrado' });

    item.done = done ?? !item.done;
    item.doneBy = item.done ? req.userId : undefined;
    item.doneAt = item.done ? new Date() : undefined;

    await occurrence.save();

    const updated = await occurrence.populate('checklist.doneBy', 'fullName');
    res.json(updated);
  } catch (error: unknown) {
    logger.error('[toggleChecklistItem]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao atualizar checklist' });
  }
};
