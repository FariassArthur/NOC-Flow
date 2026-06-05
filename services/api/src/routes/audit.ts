import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { listAuditLogs, getAuditLog, getAuditStats } from './auditController';

const router = Router();

router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/', listAuditLogs);
router.get('/stats', getAuditStats);
router.get('/:id', getAuditLog);

export default router;
