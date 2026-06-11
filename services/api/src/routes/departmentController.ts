import { Response } from 'express';
import { Department } from '../models/Department';
import type { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const listDepartments = async (req: AuthRequest, res: Response) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (error: any) {
    logger.error('[listDepartments]', error.message);
    res.status(400).json({ error: 'Erro ao listar setores' });
  }
};

export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const department = await Department.create({ name, description });
    res.status(201).json(department);
  } catch (error: any) {
    logger.error('[createDepartment]', error.message);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Este setor já existe' });
    }
    res.status(400).json({ error: 'Erro ao criar setor' });
  }
};

export const updateDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!department) {
      return res.status(404).json({ error: 'Setor não encontrado' });
    }
    res.json(department);
  } catch (error: any) {
    logger.error('[updateDepartment]', error.message);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Este nome de setor já existe' });
    }
    res.status(400).json({ error: 'Erro ao atualizar setor' });
  }
};

export const deleteDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Setor não encontrado' });
    }
    res.json({ message: 'Setor removido com sucesso' });
  } catch (error: any) {
    logger.error('[deleteDepartment]', error.message);
    res.status(400).json({ error: 'Erro ao remover setor' });
  }
};
