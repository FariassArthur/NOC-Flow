import { Response } from 'express';
import EscalationRule from '../models/EscalationRule';
import type { AuthRequest } from '../middleware/auth';

export const listEscalationRules = async (req: AuthRequest, res: Response) => {
  try {
    const items = await EscalationRule.find().sort({ priority: 1, triggerMinutes: 1 });
    res.json(items);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getEscalationRule = async (req: AuthRequest, res: Response) => {
  try {
    const item = await EscalationRule.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Regra de escalonamento não encontrada' });
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const createEscalationRule = async (req: AuthRequest, res: Response) => {
  try {
    const item = await EscalationRule.create(req.body);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateEscalationRule = async (req: AuthRequest, res: Response) => {
  try {
    const item = await EscalationRule.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!item) return res.status(404).json({ error: 'Regra não encontrada' });
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteEscalationRule = async (req: AuthRequest, res: Response) => {
  try {
    const item = await EscalationRule.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Regra não encontrada' });
    res.json({ message: 'Regra removida' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
