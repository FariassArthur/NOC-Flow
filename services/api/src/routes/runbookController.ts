import { Response } from 'express';
import { Runbook } from '../models/Runbook';
import type { AuthRequest } from '../middleware/auth';

export const listRunbooks = async (req: AuthRequest, res: Response) => {
  try {
    const { category, search } = req.query;
    const filter: any = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    const items = await Runbook.find(filter)
      .populate('category', 'name color')
      .sort({ title: 1 });
    res.json(items);
  } catch (error: any) {
    console.error('[listRunbooks]', error.message);
    res.status(400).json({ error: 'Erro ao listar runbooks' });
  }
};

export const getRunbook = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Runbook.findById(req.params.id)
      .populate('category', 'name color');
    if (!item) return res.status(404).json({ error: 'Runbook não encontrado' });
    res.json(item);
  } catch (error: any) {
    console.error('[getRunbook]', error.message);
    res.status(400).json({ error: 'Erro ao buscar runbook' });
  }
};

export const createRunbook = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Runbook.create(req.body);
    const populated = await item.populate('category', 'name color');
    res.status(201).json(populated);
  } catch (error: any) {
    console.error('[createRunbook]', error.message);
    res.status(400).json({ error: 'Erro ao criar runbook' });
  }
};

export const updateRunbook = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Runbook.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate('category', 'name color');
    if (!item) return res.status(404).json({ error: 'Runbook não encontrado' });
    res.json(item);
  } catch (error: any) {
    console.error('[updateRunbook]', error.message);
    res.status(400).json({ error: 'Erro ao atualizar runbook' });
  }
};

export const deleteRunbook = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Runbook.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Runbook não encontrado' });
    res.json({ message: 'Runbook removido' });
  } catch (error: any) {
    console.error('[deleteRunbook]', error.message);
    res.status(400).json({ error: 'Erro ao remover runbook' });
  }
};
