import { Response } from 'express';
import { Equipment } from '../models/Equipment';
import type { AuthRequest } from '../middleware/auth';

export const listEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const { type, status, search } = req.query;
    const filter: any = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { ip: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }
    const items = await Equipment.find(filter).sort({ name: 1 });
    res.json(items);
  } catch (error: any) {
    console.error('[listEquipment]', error.message);
    res.status(400).json({ error: 'Erro ao listar equipamentos' });
  }
};

export const getEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Equipamento não encontrado' });
    res.json(item);
  } catch (error: any) {
    console.error('[getEquipment]', error.message);
    res.status(400).json({ error: 'Erro ao buscar equipamento' });
  }
};

export const createEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Equipment.create(req.body);
    res.status(201).json(item);
  } catch (error: any) {
    console.error('[createEquipment]', error.message);
    res.status(400).json({ error: 'Erro ao criar equipamento' });
  }
};

export const updateEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!item) return res.status(404).json({ error: 'Equipamento não encontrado' });
    res.json(item);
  } catch (error: any) {
    console.error('[updateEquipment]', error.message);
    res.status(400).json({ error: 'Erro ao atualizar equipamento' });
  }
};

export const deleteEquipment = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Equipment.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Equipamento não encontrado' });
    res.json({ message: 'Equipamento removido' });
  } catch (error: any) {
    console.error('[deleteEquipment]', error.message);
    res.status(400).json({ error: 'Erro ao remover equipamento' });
  }
};
