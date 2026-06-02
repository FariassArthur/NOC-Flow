import { Router } from 'express';
import { login, register, getMe } from './authController';
import { loginSchema, userSchema } from '@noc/shared';
import { validateBody } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', validateBody(loginSchema), login);
router.post('/register', validateBody(userSchema), register);
router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out' });
});

export default router;
