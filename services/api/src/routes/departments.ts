import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { validateBody } from '../middleware/validation';
import { departmentSchema } from '@ccore/shared';
import {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from './departmentController';

const router = Router();
router.use(authMiddleware);

router.get('/', listDepartments);
router.post('/', checkPermission('departments'), validateBody(departmentSchema), createDepartment);
router.put(
  '/:id',
  checkPermission('departments'),
  validateBody(departmentSchema.partial()),
  updateDepartment
);
router.delete('/:id', checkPermission('departments'), deleteDepartment);

export default router;
