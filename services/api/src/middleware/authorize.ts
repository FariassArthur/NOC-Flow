import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import type { AuthRequest } from './auth';

export const authorize = (...allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Acesso restrito. Permissão necessária: ' + allowedRoles.join(', ') });
      }
      req.user = user;
      next();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
};

export const authorizeNoc = () => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.userId);
      if (!user || user.department !== 'NOC') {
        return res.status(403).json({ error: 'Apenas usuários do NOC podem realizar esta ação' });
      }
      req.user = user;
      next();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
};
