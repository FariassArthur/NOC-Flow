import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { dashboardStats, occurrenceTimeline, departmentSla } from './dashboardController';

const router = Router();
router.use(authMiddleware);

router.get('/stats', dashboardStats);
router.get('/timeline', occurrenceTimeline);
router.get('/department-sla', departmentSla);

export default router;
