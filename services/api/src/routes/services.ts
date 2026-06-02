import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { serviceSchema } from '@noc/shared';
import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} from './serviceController';

const router = Router();
router.use(authMiddleware);

router.get('/', listServices);
router.get('/:id', getService);
router.post('/', validateBody(serviceSchema), createService);
router.put('/:id', validateBody(serviceSchema.partial()), updateService);
router.delete('/:id', deleteService);

export default router;
