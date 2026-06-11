import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { validateBody } from '../middleware/validation';
import { runbookSchema } from '@ccore/shared';
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
router.post('/', checkPermission('runbooks'), validateBody(runbookSchema), createRunbook);
router.put(
  '/:id',
  checkPermission('runbooks'),
  validateBody(runbookSchema.partial()),
  updateRunbook
);
router.delete('/:id', checkPermission('runbooks'), deleteRunbook);

export default router;
