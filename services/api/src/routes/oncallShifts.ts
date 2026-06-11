import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { validateBody } from '../middleware/validation';
import { onCallShiftSchema } from '@ccore/shared';
import {
  listShifts,
  getShift,
  createShift,
  updateShift,
  deleteShift,
  getCurrentOnCall,
} from './oncallShiftController';

const router = Router();
router.use(authMiddleware);

router.get('/current', getCurrentOnCall);
router.get('/', listShifts);
router.get('/:id', getShift);
router.post('/', checkPermission('oncall'), validateBody(onCallShiftSchema), createShift);
router.put(
  '/:id',
  checkPermission('oncall'),
  validateBody(onCallShiftSchema.partial()),
  updateShift
);
router.delete('/:id', checkPermission('oncall'), deleteShift);

export default router;
