import { Response } from 'express';
import { Service } from '../models/Service';
import type { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const listServices = async (req: AuthRequest, res: Response) => {
  try {
    const { type, status, search } = req.query;
    const filter: any = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { provider: { $regex: search, $options: 'i' } },
      ];
    }
    const items = await Service.find(filter).sort({ name: 1 });
    res.json(items);
  } catch (error: any) {
    logger.error('[listServices]', error.message);
    res.status(400).json({ error: 'Erro ao listar serviços' });
  }
};

export const getService = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Service.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Serviço não encontrado' });
    res.json(item);
  } catch (error: any) {
    logger.error('[getService]', error.message);
    res.status(400).json({ error: 'Erro ao buscar serviço' });
  }
};

export const createService = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Service.create(req.body);
    res.status(201).json(item);
  } catch (error: any) {
    logger.error('[createService]', error.message);
    res.status(400).json({ error: 'Erro ao criar serviço' });
  }
};

export const updateService = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ error: 'Serviço não encontrado' });
    res.json(item);
  } catch (error: any) {
    logger.error('[updateService]', error.message);
    res.status(400).json({ error: 'Erro ao atualizar serviço' });
  }
};

export const deleteService = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Service.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Serviço não encontrado' });
    res.json({ message: 'Serviço removido' });
  } catch (error: any) {
    logger.error('[deleteService]', error.message);
    res.status(400).json({ error: 'Erro ao remover serviço' });
  }
};
