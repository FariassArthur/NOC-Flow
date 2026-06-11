import { Response } from 'express';
import { Category } from '../models/Category';
import type { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const listCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error: any) {
    logger.error('[listCategories]', error.message);
    res.status(400).json({ error: 'Erro ao listar categorias' });
  }
};

export const getCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.json(category);
  } catch (error: any) {
    logger.error('[getCategory]', error.message);
    res.status(400).json({ error: 'Erro ao buscar categoria' });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error: any) {
    logger.error('[createCategory]', error.message);
    res.status(400).json({ error: 'Erro ao criar categoria' });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.json(category);
  } catch (error: any) {
    logger.error('[updateCategory]', error.message);
    res.status(400).json({ error: 'Erro ao atualizar categoria' });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.json({ message: 'Categoria removida' });
  } catch (error: any) {
    logger.error('[deleteCategory]', error.message);
    res.status(400).json({ error: 'Erro ao remover categoria' });
  }
};
