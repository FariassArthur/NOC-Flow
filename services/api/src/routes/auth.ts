import { Router } from 'express';
import { login, register, registerNoc, getMe } from './authController';
import { loginSchema, userRegisterSchema, userNocSchema } from '@noc/shared';
import { validateBody } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

router.post('/login', validateBody(loginSchema), login);
router.post('/register', validateBody(userRegisterSchema), register);
router.post('/register/noc', authMiddleware, authorize('admin'), validateBody(userNocSchema), registerNoc);
router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out' });
});

export default router;
