import { Response } from 'express';
import { Notification } from '../models/Notification';
import type { AuthRequest } from '../middleware/auth';

export const listNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error: any) {
    console.error('[listNotifications]', error.message);
    res.status(400).json({ error: 'Erro ao listar notificações' });
  }
};

export const unreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const count = await Notification.countDocuments({ recipient: userId, read: false });
    res.json({ count });
  } catch (error: any) {
    console.error('[unreadCount]', error.message);
    res.status(400).json({ error: 'Erro ao buscar contagem de notificações' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: userId },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: 'Notificação não encontrada' });
    res.json(notification);
  } catch (error: any) {
    console.error('[markAsRead]', error.message);
    res.status(400).json({ error: 'Erro ao marcar notificação como lida' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    await Notification.updateMany({ recipient: userId, read: false }, { read: true });
    res.json({ message: 'Todas notificações marcadas como lidas' });
  } catch (error: any) {
    console.error('[markAllAsRead]', error.message);
    res.status(400).json({ error: 'Erro ao marcar notificações como lidas' });
  }
};
