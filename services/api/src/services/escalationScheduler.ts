import { EscalationRule } from '../models/EscalationRule';
import { Occurrence } from '../models/Occurrence';
import { Notification } from '../models/Notification';
import { AuditLog } from '../models/AuditLog';
import { logger } from '../utils/logger';

const CHECK_INTERVAL_MS = 5 * 60 * 1000;
let intervalHandle: ReturnType<typeof setInterval> | null = null;

export const startEscalationScheduler = () => {
  if (intervalHandle) return;
  console.log('[EscalationScheduler] Started (interval: 5min)');
  runEscalationCheck();
  intervalHandle = setInterval(runEscalationCheck, CHECK_INTERVAL_MS);
};

export const stopEscalationScheduler = () => {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    console.log('[EscalationScheduler] Stopped');
  }
};

const runEscalationCheck = async () => {
  try {
    const activeRules = await EscalationRule.find({ active: true });

    for (const rule of activeRules) {
      let occurrences: any[] = [];

      if (rule.triggerType === 'sla_breach') {
        const threshold = new Date(Date.now() - rule.triggerMinutes * 60 * 1000);
        occurrences = await Occurrence.find({
          status: { $ne: 'finalizada' },
          priority: rule.priority,
          createdAt: { $lte: threshold },
          slaStatus: { $ne: 'violado' },
        });
      } else if (rule.triggerType === 'time_passed') {
        const threshold = new Date(Date.now() - rule.triggerMinutes * 60 * 1000);
        occurrences = await Occurrence.find({
          status: { $ne: 'finalizada' },
          priority: rule.priority,
          createdAt: { $lte: threshold },
        });
      }

      for (const occ of occurrences) {
        const alreadyNotified = await Notification.findOne({
          relatedOccurrence: occ._id.toString(),
          type: 'escalation',
          title: { $regex: rule.name },
        });

        if (alreadyNotified) continue;

        await Notification.create({
          recipient: rule.targetRole || 'admin',
          type: 'escalation' as any,
          title: `Escalonamento: ${rule.name}`,
          message: `Ocorrência "${occ.title}" atingiu o gatilho "${rule.name}" (${rule.triggerType})`,
          relatedOccurrence: occ._id.toString(),
          read: false,
        });

        await AuditLog.create({
          action: 'escalation_triggered',
          targetId: occ._id.toString(),
          targetType: 'occurrence',
          details: `Regra "${rule.name}" disparada para "${occ.title}"`,
        });

        occ.slaStatus = 'violado';
        occ.slaBreachedAt = new Date();
        await occ.save();
      }
    }
  } catch (error) {
    logger.error('[EscalationScheduler] Error:', error);
  }
};
