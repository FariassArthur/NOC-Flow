import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { validateBody } from '../middleware/validation';
import { escalationRuleSchema } from '@ccore/shared';
import {
  listEscalationRules,
  getEscalationRule,
  createEscalationRule,
  updateEscalationRule,
  deleteEscalationRule,
} from './escalationController';

const router = Router();
router.use(authMiddleware);

router.get('/', listEscalationRules);
router.get('/:id', getEscalationRule);
router.post(
  '/',
  checkPermission('escalations'),
  validateBody(escalationRuleSchema),
  createEscalationRule
);
router.put(
  '/:id',
  checkPermission('escalations'),
  validateBody(escalationRuleSchema.partial()),
  updateEscalationRule
);
router.delete('/:id', checkPermission('escalations'), deleteEscalationRule);

export default router;
