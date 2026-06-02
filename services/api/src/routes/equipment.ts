import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
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
router.post('/', validateBody(equipmentSchema), createEquipment);
router.put('/:id', validateBody(equipmentSchema.partial()), updateEquipment);
router.delete('/:id', deleteEquipment);

export default router;
