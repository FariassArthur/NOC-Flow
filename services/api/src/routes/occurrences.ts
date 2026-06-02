import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { occurrenceSchema, updateOccurrenceSchema } from '@noc/shared';
import {
  listOccurrences,
  getOccurrence,
  createOccurrence,
  updateOccurrence,
  deleteOccurrence,
  addComment,
} from './occurrenceController';

const router = Router();

router.use(authMiddleware);

router.get('/', listOccurrences);
router.post('/', validateBody(occurrenceSchema), createOccurrence);
router.get('/:id', getOccurrence);
router.put('/:id', validateBody(updateOccurrenceSchema), updateOccurrence);
router.delete('/:id', deleteOccurrence);
router.post('/:id/comments', addComment);

export default router;
