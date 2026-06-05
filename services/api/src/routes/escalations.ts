import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validateBody } from '../middleware/validation';
import { escalationRuleSchema } from '@noc/shared';
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
router.post('/', authorize('admin', 'analyst'), validateBody(escalationRuleSchema), createEscalationRule);
router.put('/:id', authorize('admin', 'analyst'), validateBody(escalationRuleSchema.partial()), updateEscalationRule);
router.delete('/:id', authorize('admin'), deleteEscalationRule);

export default router;
