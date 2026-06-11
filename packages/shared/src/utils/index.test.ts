import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatTimeSpent,
  calculateDaysUntilDue,
  statusCount,
  priorityCount,
} from './index';

describe('formatDate', () => {
  it('formats a date string to pt-BR locale', () => {
    const result = formatDate('2024-01-15T12:00:00');
    expect(result).toBe('15/01/2024');
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date(2024, 0, 15, 12, 0, 0));
    expect(result).toBe('15/01/2024');
  });
});

describe('formatDateTime', () => {
  it('includes hours and minutes', () => {
    const result = formatDateTime('2024-01-15T14:30:00');
    expect(result).toContain('15/01/2024');
    expect(result).toContain('14:30');
  });
});

describe('formatTimeSpent', () => {
  it('returns only minutes when less than 60', () => {
    expect(formatTimeSpent(45)).toBe('45m');
  });

  it('returns only hours when exact', () => {
    expect(formatTimeSpent(120)).toBe('2h');
  });

  it('returns hours and minutes', () => {
    expect(formatTimeSpent(150)).toBe('2h 30m');
  });
});

describe('calculateDaysUntilDue', () => {
  it('returns positive days for future dates', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    expect(calculateDaysUntilDue(future)).toBe(5);
  });

  it('returns negative days for past dates', () => {
    const past = new Date();
    past.setDate(past.getDate() - 3);
    expect(calculateDaysUntilDue(past)).toBe(-3);
  });
});

describe('statusCount', () => {
  it('counts items with matching status', () => {
    const items = [{ status: 'aberta' }, { status: 'finalizada' }, { status: 'aberta' }];
    expect(statusCount(items, 'aberta')).toBe(2);
    expect(statusCount(items, 'finalizada')).toBe(1);
  });
});

describe('priorityCount', () => {
  it('counts items with matching priority', () => {
    const items = [{ priority: 'alta' }, { priority: 'baixa' }, { priority: 'alta' }];
    expect(priorityCount(items, 'alta')).toBe(2);
    expect(priorityCount(items, 'baixa')).toBe(1);
  });
});
