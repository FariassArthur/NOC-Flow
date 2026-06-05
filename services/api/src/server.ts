import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import path from 'path';
import { connectDB } from './config';
import { initSocketIO } from './services/socketManager';
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
import { authMiddleware } from './middleware/auth';
import { startEscalationScheduler } from './services/escalationScheduler';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  credentials: true,
}));
app.use(express.json());

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
app.use('/api/auth', authRoutes);
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

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Error]', err?.message || err || 'Unknown error');
  const status = typeof err?.status === 'number' ? err.status : 500;
  res.status(status).json({ error: 'Erro interno do servidor' });
});

// Start server
const start = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    await connectDB();
    initSocketIO(httpServer);
    startEscalationScheduler();
    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Socket.IO running on ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
