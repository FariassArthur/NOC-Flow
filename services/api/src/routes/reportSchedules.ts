import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';
import {
  listSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from './reportScheduleController';

const router = Router();
router.use(authMiddleware);

const scheduleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  format: z.enum(['csv', 'pdf']).default('csv'),
  filters: z.record(z.string()).optional(),
  recipients: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

router.get('/', listSchedules);
router.post('/', validateBody(scheduleSchema), createSchedule);
router.put('/:id', validateBody(scheduleSchema.partial()), updateSchedule);
router.delete('/:id', deleteSchedule);

export default router;
