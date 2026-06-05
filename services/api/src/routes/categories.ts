import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validateBody } from '../middleware/validation';
import { categorySchema } from '@noc/shared';
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
router.post('/', authorize('admin', 'analyst'), validateBody(categorySchema), createCategory);
router.put('/:id', authorize('admin', 'analyst'), validateBody(categorySchema.partial()), updateCategory);
router.delete('/:id', authorize('admin'), deleteCategory);

export default router;
