import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { authorizeNoc } from '../middleware/authorize';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';
import {
  occurrenceSchema,
  updateOccurrenceSchema,
  resolucaoSchema,
  commentSchema,
  rcaSchema,
  commLogSchema,
} from '@ccore/shared';
import {
  listOccurrences,
  getOccurrence,
  createOccurrence,
  updateOccurrence,
  deleteOccurrence,
} from './occurrenceController';
import {
  resolveOccurrence,
  addComment,
  assignOccurrence,
  addAttachment,
  startTimer,
  pauseTimer,
  stopTimer,
  addRCA,
  addCommLog,
} from './occurrenceActionsController';

const router = Router();

router.use(authMiddleware);

router.get('/', listOccurrences);
router.post('/', validateBody(occurrenceSchema), createOccurrence);
router.get('/:id', getOccurrence);
router.post('/:id/comments', validateBody(commentSchema), addComment);
router.post(
  '/:id/attachments',
  validateBody(z.object({ fileName: z.string().min(1), fileUrl: z.string().min(1) })),
  addAttachment
);

router.use(authorizeNoc);

router.put('/:id', validateBody(updateOccurrenceSchema), updateOccurrence);
router.put('/:id/resolver', validateBody(resolucaoSchema), resolveOccurrence);
router.put(
  '/:id/assign',
  validateBody(z.object({ assignedTo: z.string().optional() })),
  assignOccurrence
);
router.delete('/:id', deleteOccurrence);
router.post('/:id/timer/start', startTimer);
router.post('/:id/timer/pause', pauseTimer);
router.post('/:id/timer/stop', stopTimer);
router.put('/:id/rca', validateBody(rcaSchema), addRCA);
router.post('/:id/commlog', validateBody(commLogSchema), addCommLog);

export default router;
