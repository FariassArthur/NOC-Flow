import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
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
router.post('/', validateBody(runbookSchema), createRunbook);
router.put('/:id', validateBody(runbookSchema.partial()), updateRunbook);
router.delete('/:id', deleteRunbook);

export default router;
