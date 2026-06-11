import { Response } from 'express';
import { KnowledgeArticle } from '../models/KnowledgeArticle';
import type { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const listArticles = async (req: AuthRequest, res: Response) => {
  try {
    const { search, category, published, page, limit } = req.query;
    const filter: Record<string, unknown> = {};

    if (search && typeof search === 'string') {
      filter.$text = { $search: search };
    }
    if (category) filter.category = category;
    if (published !== undefined) filter.published = published === 'true';

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [articles, total] = await Promise.all([
      KnowledgeArticle.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      KnowledgeArticle.countDocuments(filter),
    ]);

    res.json({ data: articles, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error: unknown) {
    logger.error('[listArticles]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao listar artigos' });
  }
};

export const getArticle = async (req: AuthRequest, res: Response) => {
  try {
    const article = await KnowledgeArticle.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Artigo não encontrado' });
    res.json(article);
  } catch (error: unknown) {
    logger.error('[getArticle]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao buscar artigo' });
  }
};

export const createArticle = async (req: AuthRequest, res: Response) => {
  try {
    const article = await KnowledgeArticle.create({
      ...req.body,
      author: req.userId,
    });
    res.status(201).json(article);
  } catch (error: unknown) {
    logger.error('[createArticle]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao criar artigo' });
  }
};

export const updateArticle = async (req: AuthRequest, res: Response) => {
  try {
    const article = await KnowledgeArticle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!article) return res.status(404).json({ error: 'Artigo não encontrado' });
    res.json(article);
  } catch (error: unknown) {
    logger.error('[updateArticle]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao atualizar artigo' });
  }
};

export const deleteArticle = async (req: AuthRequest, res: Response) => {
  try {
    const article = await KnowledgeArticle.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ error: 'Artigo não encontrado' });
    res.json({ message: 'Artigo removido' });
  } catch (error: unknown) {
    logger.error('[deleteArticle]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao remover artigo' });
  }
};

export const listArticleCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await KnowledgeArticle.distinct('category', { category: { $ne: null } });
    res.json(categories.filter(Boolean));
  } catch (error: unknown) {
    logger.error('[listArticleCategories]', error instanceof Error ? error.message : String(error));
    res.status(400).json({ error: 'Erro ao listar categorias' });
  }
};
