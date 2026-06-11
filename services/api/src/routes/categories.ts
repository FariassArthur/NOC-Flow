import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { validateBody } from '../middleware/validation';
import { categorySchema } from '@ccore/shared';
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from './categoryController';

const router = Router();
router.use(authMiddleware);

router.get('/', listCategories);
router.get('/:id', getCategory);
router.post('/', checkPermission('categories'), validateBody(categorySchema), createCategory);
router.put(
  '/:id',
  checkPermission('categories'),
  validateBody(categorySchema.partial()),
  updateCategory
);
router.delete('/:id', checkPermission('categories'), deleteCategory);

export default router;
