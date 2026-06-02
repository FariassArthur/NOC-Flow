import { Response } from 'express';
import Category from '../models/Category';
import type { AuthRequest } from '../middleware/auth';

export const listCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
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
    res.status(400).json({ error: error.message });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.json({ message: 'Categoria removida' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
