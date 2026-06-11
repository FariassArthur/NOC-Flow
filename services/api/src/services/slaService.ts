import { Occurrence } from '../models/Occurrence';
import { Category } from '../models/Category';
import { logger } from '../utils/logger';

const SLA_PRIORITY_MAP: Record<string, number> = {
  baixa: 1440, // 24h
  média: 480, // 8h
  alta: 120, // 2h
  crítica: 60, // 1h
};

export const calculateSlaDeadline = async (
  priority: string,
  categoryId?: string
): Promise<Date | null> => {
  let slaMinutes: number | undefined;

  if (categoryId) {
    const category = await Category.findById(categoryId);
    if (category?.slaResolutionMinutes) {
      slaMinutes = category.slaResolutionMinutes;
    }
  }

  if (!slaMinutes) {
    slaMinutes = SLA_PRIORITY_MAP[priority];
  }

  if (!slaMinutes) return null;

  return new Date(Date.now() + slaMinutes * 60 * 1000);
};

export const checkOccurrenceSla = async (occurrenceId: string) => {
  try {
    const occurrence = await Occurrence.findById(occurrenceId);
    if (!occurrence || occurrence.status === 'finalizada') return;

    const slaDeadline = await calculateSlaDeadline(
      occurrence.priority,
      occurrence.category?.toString()
    );

    if (!slaDeadline) return;

    const now = new Date();

    if (now >= slaDeadline) {
      if (!occurrence.slaStatus || occurrence.slaStatus === 'dentro') {
        const thresholdWarning = new Date(slaDeadline.getTime() - 30 * 60 * 1000);
        if (now >= thresholdWarning && now < slaDeadline) {
          occurrence.slaStatus = 'atrasado';
        } else {
          occurrence.slaStatus = 'violado';
          occurrence.slaBreachedAt = now;
        }
        await occurrence.save();
      }
    } else {
      occurrence.slaStatus = 'dentro';
      await occurrence.save();
    }
  } catch (error) {
    logger.error('[slaService] Error checking SLA:', error);
  }
};

export const slaStatusLabel = (status: string | undefined): { label: string; color: string } => {
  switch (status) {
    case 'dentro':
      return { label: 'Dentro do SLA', color: '#22c55e' };
    case 'atrasado':
      return { label: 'Em atraso', color: '#eab308' };
    case 'violado':
      return { label: 'SLA Violado', color: '#ef4444' };
    default:
      return { label: 'Sem SLA', color: '#6b7280' };
  }
};
