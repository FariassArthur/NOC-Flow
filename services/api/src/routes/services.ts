import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
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
router.post('/', authorize('admin', 'analyst'), validateBody(serviceSchema), createService);
router.put('/:id', authorize('admin', 'analyst'), validateBody(serviceSchema.partial()), updateService);
router.delete('/:id', authorize('admin'), deleteService);

export default router;
