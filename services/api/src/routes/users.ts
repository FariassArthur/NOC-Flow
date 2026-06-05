import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';
import { userUpdateSchema } from '@noc/shared';
import { listUsers, getUser, updateUser, deleteUser, updateProfile, updatePassword } from './userController';
import { authorize } from '../middleware/authorize';

const router = Router();

router.use(authMiddleware);

router.get('/', listUsers);
router.get('/:id', getUser);
router.put('/profile', validateBody(userUpdateSchema), updateProfile);
router.put('/password', validateBody(z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(5) })), updatePassword);
router.put('/:id', validateBody(userUpdateSchema), authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
