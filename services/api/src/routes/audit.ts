import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { listAuditLogs, getAuditLog, getAuditStats } from './auditController';

const router = Router();

router.use(authMiddleware);
router.use(checkPermission('audit'));

router.get('/', listAuditLogs);
router.get('/stats', getAuditStats);
router.get('/:id', getAuditLog);

export default router;
