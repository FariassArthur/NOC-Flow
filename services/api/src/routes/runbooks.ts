import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validateBody } from '../middleware/validation';
import { runbookSchema } from '@noc/shared';
import {
  listRunbooks,
  getRunbook,
  createRunbook,
  updateRunbook,
  deleteRunbook,
} from './runbookController';

const router = Router();
router.use(authMiddleware);

router.get('/', listRunbooks);
router.get('/:id', getRunbook);
router.post('/', authorize('admin', 'analyst'), validateBody(runbookSchema), createRunbook);
router.put('/:id', authorize('admin', 'analyst'), validateBody(runbookSchema.partial()), updateRunbook);
router.delete('/:id', authorize('admin'), deleteRunbook);

export default router;
