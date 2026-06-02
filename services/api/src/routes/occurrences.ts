import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { occurrenceSchema, updateOccurrenceSchema, resolucaoSchema, commentSchema, rcaSchema, commLogSchema } from '@noc/shared';
import {
  listOccurrences,
  getOccurrence,
  createOccurrence,
  updateOccurrence,
  resolveOccurrence,
  deleteOccurrence,
  addComment,
  assignOccurrence,
  addAttachment,
  startTimer,
  pauseTimer,
  stopTimer,
  addRCA,
  addCommLog,
} from './occurrenceController';

const router = Router();

router.use(authMiddleware);

router.get('/', listOccurrences);
router.post('/', validateBody(occurrenceSchema), createOccurrence);
router.get('/:id', getOccurrence);
router.put('/:id', validateBody(updateOccurrenceSchema), updateOccurrence);
router.put('/:id/resolver', validateBody(resolucaoSchema), resolveOccurrence);
router.put('/:id/assign', assignOccurrence);
router.post('/:id/attachments', addAttachment);
router.delete('/:id', deleteOccurrence);
router.post('/:id/comments', validateBody(commentSchema), addComment);
router.post('/:id/timer/start', startTimer);
router.post('/:id/timer/pause', pauseTimer);
router.post('/:id/timer/stop', stopTimer);
router.put('/:id/rca', validateBody(rcaSchema), addRCA);
router.post('/:id/commlog', validateBody(commLogSchema), addCommLog);

export default router;
