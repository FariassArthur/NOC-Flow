import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validateBody } from '../middleware/validation';
import { equipmentSchema } from '@noc/shared';
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
router.post('/', authorize('admin', 'analyst'), validateBody(equipmentSchema), createEquipment);
router.put('/:id', authorize('admin', 'analyst'), validateBody(equipmentSchema.partial()), updateEquipment);
router.delete('/:id', authorize('admin'), deleteEquipment);

export default router;
