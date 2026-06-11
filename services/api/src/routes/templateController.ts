import { Response } from 'express';
import { Template } from '../models/Template';
import type { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const listTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const templates = await Template.find().sort({ name: 1 });
    res.json(templates);
  } catch (error: any) {
    logger.error('[listTemplates]', error.message);
    res.status(400).json({ error: 'Erro ao listar templates' });
  }
};

export const createTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const template = await Template.create(req.body);
    res.status(201).json(template);
  } catch (error: any) {
    logger.error('[createTemplate]', error.message);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Este nome de template já existe' });
    }
    res.status(400).json({ error: 'Erro ao criar template' });
  }
};

export const updateTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const template = await Template.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!template) return res.status(404).json({ error: 'Template não encontrado' });
    res.json(template);
  } catch (error: any) {
    logger.error('[updateTemplate]', error.message);
    res.status(400).json({ error: 'Erro ao atualizar template' });
  }
};

export const deleteTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template não encontrado' });
    res.json({ message: 'Template removido' });
  } catch (error: any) {
    logger.error('[deleteTemplate]', error.message);
    res.status(400).json({ error: 'Erro ao remover template' });
  }
};
