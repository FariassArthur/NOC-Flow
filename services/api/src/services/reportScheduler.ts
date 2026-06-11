import { logger } from '../utils/logger';

const CHECK_INTERVAL_MS = 60 * 60 * 1000;
let intervalHandle: ReturnType<typeof setInterval> | null = null;

export const startReportScheduler = () => {
  if (intervalHandle) return;
  console.log('[ReportScheduler] Started (interval: 1h)');
  intervalHandle = setInterval(checkAndSendReports, CHECK_INTERVAL_MS);
};

export const stopReportScheduler = () => {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    console.log('[ReportScheduler] Stopped');
  }
};

const checkAndSendReports = async () => {
  try {
    const ReportScheduleModel = (await import('../models/ReportSchedule')).ReportSchedule;
    const schedules = await ReportScheduleModel.find({ active: true });

    for (const schedule of schedules) {
      const now = new Date();
      const lastRun = schedule.lastRunAt || new Date(0);
      const diffMs = now.getTime() - lastRun.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      let shouldRun = false;

      switch (schedule.frequency) {
        case 'daily':
          if (diffHours >= 24) shouldRun = true;
          break;
        case 'weekly':
          if (diffHours >= 168) shouldRun = true;
          break;
        case 'monthly':
          if (diffHours >= 720) shouldRun = true;
          break;
      }

      if (!shouldRun) continue;

      const { emitToUser } = await import('./socketManager');
      emitToUser(schedule.createdBy, 'scheduled_report', {
        title: `Relatório: ${schedule.name}`,
        message: `Relatório programado "${schedule.name}" foi gerado.`,
      });

      schedule.lastRunAt = now;
      await schedule.save();
    }
  } catch (error) {
    logger.error('[ReportScheduler] Error:', error);
  }
};
