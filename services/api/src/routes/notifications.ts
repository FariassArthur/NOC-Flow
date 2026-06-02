import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { listNotifications, unreadCount, markAsRead, markAllAsRead } from './notificationController';

const router = Router();

router.use(authMiddleware);

router.get('/', listNotifications);
router.get('/unread-count', unreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;
