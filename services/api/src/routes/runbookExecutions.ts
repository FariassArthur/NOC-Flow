import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';
import {
  startExecution,
  completeStep,
  cancelExecution,
  getExecution,
  listExecutions,
} from './runbookExecutionController';

const router = Router();

router.use(authMiddleware);

router.get('/', listExecutions);
router.get('/:id', getExecution);
router.post(
  '/',
  authorize('admin', 'analyst'),
  validateBody(
    z.object({
      runbookId: z.string().min(1),
      occurrenceId: z.string().optional(),
    })
  ),
  startExecution
);
router.put(
  '/:id/step',
  authorize('admin', 'analyst'),
  validateBody(
    z.object({
      notes: z.string().optional(),
      action: z.enum(['complete', 'skip']).default('complete'),
    })
  ),
  completeStep
);
router.put('/:id/cancel', authorize('admin', 'analyst'), cancelExecution);

export default router;
