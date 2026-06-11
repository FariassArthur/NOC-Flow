import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getEquipmentHistory, getEquipmentSummary } from './equipmentHistoryController';

const router = Router();
router.use(authMiddleware);

router.get('/:equipmentId/summary', getEquipmentSummary);
router.get('/:equipmentId', getEquipmentHistory);

export default router;
