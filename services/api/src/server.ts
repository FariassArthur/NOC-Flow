import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import path from 'path';
import { connectDB } from './config';
import { initSocketIO } from './services/socketManager';
import { authLimiter, apiLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import occurrenceRoutes from './routes/occurrences';
import userRoutes from './routes/users';
import notificationRoutes from './routes/notifications';
import uploadRoutes from './routes/upload';
import categoryRoutes from './routes/categories';
import equipmentRoutes from './routes/equipment';
import serviceRoutes from './routes/services';
import runbookRoutes from './routes/runbooks';
import runbookExecutionRoutes from './routes/runbookExecutions';
import escalationRoutes from './routes/escalations';
import auditRoutes from './routes/audit';
import reportRoutes from './routes/reports';
import departmentRoutes from './routes/departments';
import templateRoutes from './routes/templates';
import oncallShiftRoutes from './routes/oncallShifts';
import knowledgeRoutes from './routes/knowledge';
import dashboardRoutes from './routes/dashboard';
import equipmentHistoryRoutes from './routes/equipmentHistory';
import reportScheduleRoutes from './routes/reportSchedules';
import { authMiddleware } from './middleware/auth';
import { startEscalationScheduler } from './services/escalationScheduler';
import { startReportScheduler } from './services/reportScheduler';
import { logger } from './utils/logger';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
    credentials: true,
  })
);
app.use(express.json());
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth-protected file download
app.get('/uploads/:filename', authMiddleware, (req, res) => {
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  const filePath = path.resolve(uploadsDir, req.params.filename);
  if (!filePath.startsWith(uploadsDir)) {
    return res.status(403).json({ error: 'Caminho inválido' });
  }
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).json({ error: 'Arquivo não encontrado' });
  });
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/occurrences', occurrenceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/runbook-executions', runbookExecutionRoutes);
app.use('/api/runbooks', runbookRoutes);
app.use('/api/escalations', escalationRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/oncall-shifts', oncallShiftRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/equipment-history', equipmentHistoryRoutes);
app.use('/api/report-schedules', reportScheduleRoutes);

// Error handling
app.use(
  (err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('[Error]', err instanceof Error ? err.message : String(err));
    const status =
      typeof err === 'object' &&
      err !== null &&
      'status' in err &&
      typeof (err as Record<string, unknown>).status === 'number'
        ? (err as { status: number }).status
        : 500;
    res.status(status).json({ error: 'Erro interno do servidor' });
  }
);

// Start server
const start = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    await connectDB();
    initSocketIO(httpServer);
    startEscalationScheduler();
    startReportScheduler();
    httpServer.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Socket.IO running on ws://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
