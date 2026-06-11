import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';
import { userUpdateSchema } from '@ccore/shared';
import {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
  updatePassword,
  createUser,
  resetUserPassword,
} from './userController';
import { checkPermission } from '../middleware/permissions';

const router = Router();

router.use(authMiddleware);

router.get('/', listUsers);
router.get('/:id', getUser);
router.post('/', checkPermission('users'), createUser);
router.put('/profile', validateBody(userUpdateSchema), updateProfile);
router.put(
  '/password',
  validateBody(z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(5) })),
  updatePassword
);
router.put('/:id', validateBody(userUpdateSchema), checkPermission('users'), updateUser);
router.put(
  '/:id/reset-password',
  checkPermission('users'),
  validateBody(z.object({ newPassword: z.string().min(5) })),
  resetUserPassword
);
router.delete('/:id', checkPermission('users'), deleteUser);

export default router;
