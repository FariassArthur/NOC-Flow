import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import type { AuthRequest } from './auth';

export const checkPermission = (...requiredPermissions: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }
      if (user.role === 'admin') return next();
      const hasAll = requiredPermissions.every((p) => user.permissions?.includes(p));
      if (!hasAll) {
        return res.status(403).json({ error: 'Acesso restrito. Permissão necessária.' });
      }
      next();
    } catch {
      res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  };
};
