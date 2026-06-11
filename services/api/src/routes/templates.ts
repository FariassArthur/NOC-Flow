import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';
import { validateBody } from '../middleware/validation';
import { templateSchema } from '@ccore/shared';
import {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from './templateController';

const router = Router();
router.use(authMiddleware);

router.get('/', listTemplates);
router.post('/', checkPermission('templates'), validateBody(templateSchema), createTemplate);
router.put(
  '/:id',
  checkPermission('templates'),
  validateBody(templateSchema.partial()),
  updateTemplate
);
router.delete('/:id', checkPermission('templates'), deleteTemplate);

export default router;
