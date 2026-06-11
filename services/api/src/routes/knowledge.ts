import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { validateBody } from '../middleware/validation';
import { knowledgeArticleSchema } from '@ccore/shared';
import {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  listArticleCategories,
} from './knowledgeController';

const router = Router();
router.use(authMiddleware);

router.get('/categories', listArticleCategories);
router.get('/', listArticles);
router.get('/:id', getArticle);
router.post('/', checkPermission('knowledge'), validateBody(knowledgeArticleSchema), createArticle);
router.put(
  '/:id',
  checkPermission('knowledge'),
  validateBody(knowledgeArticleSchema.partial()),
  updateArticle
);
router.delete('/:id', checkPermission('knowledge'), deleteArticle);

export default router;
