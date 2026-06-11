import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { validateBody } from '../middleware/validation';
import { serviceSchema } from '@ccore/shared';
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
router.post('/', checkPermission('services'), validateBody(serviceSchema), createService);
router.put(
  '/:id',
  checkPermission('services'),
  validateBody(serviceSchema.partial()),
  updateService
);
router.delete('/:id', checkPermission('services'), deleteService);

export default router;
