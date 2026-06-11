import { Response } from 'express';
import { OnCallShift } from '../models/OnCallShift';
import type { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const listShifts = async (req: AuthRequest, res: Response) => {
  try {
    const { department, active } = req.query;
    const filter: Record<string, unknown> = {};
    if (department) filter.department = department;
    if (active !== undefined) filter.isActive = active === 'true';
    const shifts = await OnCallShift.find(filter).sort({ name: 1 });
    res.json({ data: shifts });
  } catch (error: unknown) {
    logger.error('[listShifts]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao listar plantões' });
  }
};

export const getShift = async (req: AuthRequest, res: Response) => {
  try {
    const shift = await OnCallShift.findById(req.params.id);
    if (!shift) return res.status(404).json({ error: 'Plantão não encontrado' });
    res.json(shift);
  } catch (error: unknown) {
    logger.error('[getShift]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao buscar plantão' });
  }
};

export const createShift = async (req: AuthRequest, res: Response) => {
  try {
    const shift = await OnCallShift.create(req.body);
    res.status(201).json(shift);
  } catch (error: unknown) {
    logger.error('[createShift]', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && 'code' in error && (error as { code: number }).code === 11000) {
      return res.status(409).json({ error: 'Este nome de plantão já existe' });
    }
    res.status(400).json({ error: 'Erro ao criar plantão' });
  }
};

export const updateShift = async (req: AuthRequest, res: Response) => {
  try {
    const shift = await OnCallShift.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!shift) return res.status(404).json({ error: 'Plantão não encontrado' });
    res.json(shift);
  } catch (error: unknown) {
    logger.error('[updateShift]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao atualizar plantão' });
  }
};

export const deleteShift = async (req: AuthRequest, res: Response) => {
  try {
    const shift = await OnCallShift.findByIdAndDelete(req.params.id);
    if (!shift) return res.status(404).json({ error: 'Plantão não encontrado' });
    res.json({ message: 'Plantão removido' });
  } catch (error: unknown) {
    logger.error('[deleteShift]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao remover plantão' });
  }
};

export const getCurrentOnCall = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const weekDayNames = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    const today = weekDayNames[now.getDay()];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const shift = await OnCallShift.findOne({
      isActive: true,
      weekDays: today,
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime },
    });

    if (!shift) {
      return res.json({ onCall: false, message: 'Nenhum plantonista no momento' });
    }

    res.json({ onCall: true, shift });
  } catch (error: unknown) {
    logger.error('[getCurrentOnCall]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao buscar plantão atual' });
  }
};
