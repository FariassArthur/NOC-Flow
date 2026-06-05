import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { exportCSV, exportPDF, reportSummary } from './reportController';

const router = Router();

router.use(authMiddleware);

router.get('/csv', exportCSV);
router.get('/pdf', exportPDF);
router.get('/summary', reportSummary);

export default router;
