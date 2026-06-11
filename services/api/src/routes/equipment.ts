import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { validateBody } from '../middleware/validation';
import { equipmentSchema } from '@ccore/shared';
import {
  listEquipment,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from './equipmentController';

const router = Router();
router.use(authMiddleware);

router.get('/', listEquipment);
router.get('/:id', getEquipment);
router.post('/', checkPermission('equipment'), validateBody(equipmentSchema), createEquipment);
router.put(
  '/:id',
  checkPermission('equipment'),
  validateBody(equipmentSchema.partial()),
  updateEquipment
);
router.delete('/:id', checkPermission('equipment'), deleteEquipment);

export default router;
