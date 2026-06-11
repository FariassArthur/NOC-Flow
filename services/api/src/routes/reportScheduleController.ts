import { Response } from 'express';
import { ReportSchedule } from '../models/ReportSchedule';
import type { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const listSchedules = async (req: AuthRequest, res: Response) => {
  try {
    const schedules = await ReportSchedule.find({ createdBy: req.userId }).sort({ name: 1 });
    res.json({ data: schedules });
  } catch (error: unknown) {
    logger.error('[listSchedules]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao listar relatórios programados' });
  }
};

export const createSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const schedule = await ReportSchedule.create({
      ...req.body,
      createdBy: req.userId,
    });
    res.status(201).json(schedule);
  } catch (error: unknown) {
    logger.error('[createSchedule]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao criar relatório programado' });
  }
};

export const updateSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const schedule = await ReportSchedule.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!schedule) return res.status(404).json({ error: 'Relatório não encontrado' });
    res.json(schedule);
  } catch (error: unknown) {
    logger.error('[updateSchedule]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao atualizar relatório programado' });
  }
};

export const deleteSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const schedule = await ReportSchedule.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId,
    });
    if (!schedule) return res.status(404).json({ error: 'Relatório não encontrado' });
    res.json({ message: 'Relatório programado removido' });
  } catch (error: unknown) {
    logger.error('[deleteSchedule]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao remover relatório programado' });
  }
};
