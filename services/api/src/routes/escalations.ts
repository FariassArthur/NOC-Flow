import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
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
router.post('/', validateBody(escalationRuleSchema), createEscalationRule);
router.put('/:id', validateBody(escalationRuleSchema.partial()), updateEscalationRule);
router.delete('/:id', deleteEscalationRule);

export default router;
