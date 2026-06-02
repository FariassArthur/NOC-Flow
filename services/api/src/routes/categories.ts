import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
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
router.post('/', validateBody(categorySchema), createCategory);
router.put('/:id', validateBody(categorySchema.partial()), updateCategory);
router.delete('/:id', deleteCategory);

export default router;
