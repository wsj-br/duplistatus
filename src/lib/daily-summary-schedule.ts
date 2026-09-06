/**
 * Timezone-aware due evaluation for daily summary notifications.
 * All calendar arithmetic uses the administrator-saved IANA timezone.
 */

import type { DailySummaryConfig } from '@/lib/types';

const LOCAL_TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MINUTE_MS = 60 * 1000;

export function isValidLocalTime(value: string): boolean {
  return typeof value === 'string' && LOCAL_TIME_RE.test(value);
}

export function isValidIanaTimeZone(timeZone: string): boolean {
  if (!timeZone || typeof timeZone !== 'string' || timeZone.length > 128) {
    return false;
  }
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date(0));
    return true;
  } catch {
    return false;
  }
}

export function parseLocalTime(value: string): { hour: number; minute: number } {
  const match = LOCAL_TIME_RE.exec(value);
  if (!match) {
    throw new Error(`Invalid local time: ${value}`);
  }
  return { hour: Number.parseInt(match[1], 10), minute: Number.parseInt(match[2], 10) };
}

export interface ZonedDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function getZonedParts(date: Date, timeZone: string): ZonedDateTimeParts {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = dtf.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value ?? '0';
    return Number.parseInt(value, 10);
  };
  let hour = read('hour');
  if (hour === 24) {
    hour = 0;
  }
  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour,
    minute: read('minute'),
    second: read('second'),
  };
}

export function formatLocalCalendarDate(date: Date, timeZone: string): string {
  const parts = getZonedParts(date, timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

function addCalendarDays(year: number, month: number, day: number, days: number): { year: number; month: number; day: number } {
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

/**
 * Resolve a local wall clock time on a calendar date in `timeZone` to a UTC instant.
 * Spring-forward gaps use the first valid minute after the missing time.
 * Repeated fall-back hours use the earliest matching instant.
 */
export function resolveZonedLocalDateTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const windowStart = Date.UTC(year, month - 1, day, 0, 0, 0) - 14 * 60 * MINUTE_MS;
  const windowEnd = Date.UTC(year, month - 1, day, 0, 0, 0) + 38 * 60 * MINUTE_MS;
  let earliestExact: number | null = null;
  let firstAfterRequested: number | null = null;
  let firstOnDate: number | null = null;

  for (let timestamp = windowStart; timestamp <= windowEnd; timestamp += MINUTE_MS) {
    const parts = getZonedParts(new Date(timestamp), timeZone);
    if (parts.year !== year || parts.month !== month || parts.day !== day) {
      continue;
    }
    if (firstOnDate === null) {
      firstOnDate = timestamp;
    }
    if (parts.hour === hour && parts.minute === minute) {
      earliestExact = timestamp;
      break;
    }
    if (
      firstAfterRequested === null
      && (parts.hour > hour || (parts.hour === hour && parts.minute > minute))
    ) {
      firstAfterRequested = timestamp;
    }
  }

  if (earliestExact !== null) {
    return new Date(earliestExact);
  }
  if (firstAfterRequested !== null) {
    return new Date(firstAfterRequested);
  }
  if (firstOnDate !== null) {
    return new Date(firstOnDate);
  }

  const next = addCalendarDays(year, month, day, 1);
  return resolveZonedLocalDateTime(next.year, next.month, next.day, 0, 0, timeZone);
}

export function scheduledOccurrenceKey(timeZone: string, summaryDate: string): string {
  return `scheduled:${timeZone}:${summaryDate}`;
}

export function manualOccurrenceKey(runId: string): string {
  return `manual:${runId}`;
}

export interface DueEvaluation {
  due: boolean;
  summaryDate: string;
  occurrenceKey: string;
  scheduledAt: Date;
  reason?: string;
}

function parseCalendarDate(summaryDate: string): { year: number; month: number; day: number } {
  const [year, month, day] = summaryDate.split('-').map((part) => Number.parseInt(part, 10));
  return { year, month, day };
}

export function getScheduledInstantForLocalDate(
  config: Pick<DailySummaryConfig, 'localTime' | 'timeZone'>,
  summaryDate: string
): Date {
  const { hour, minute } = parseLocalTime(config.localTime);
  const { year, month, day } = parseCalendarDate(summaryDate);
  return resolveZonedLocalDateTime(year, month, day, hour, minute, config.timeZone);
}

export function evaluateScheduledOccurrence(
  config: DailySummaryConfig,
  now: Date = new Date()
): DueEvaluation {
  if (!config.enabled) {
    const summaryDate = formatLocalCalendarDate(now, config.timeZone);
    return {
      due: false,
      summaryDate,
      occurrenceKey: scheduledOccurrenceKey(config.timeZone, summaryDate),
      scheduledAt: getScheduledInstantForLocalDate(config, summaryDate),
      reason: 'disabled',
    };
  }

  const summaryDate = formatLocalCalendarDate(now, config.timeZone);
  const scheduledAt = getScheduledInstantForLocalDate(config, summaryDate);
  const occurrenceKey = scheduledOccurrenceKey(config.timeZone, summaryDate);
  const effectiveFrom = new Date(config.effectiveFromIso);
  const effectiveFromMs = Number.isNaN(effectiveFrom.getTime()) ? 0 : effectiveFrom.getTime();

  if (now.getTime() < scheduledAt.getTime()) {
    return { due: false, summaryDate, occurrenceKey, scheduledAt, reason: 'not_yet' };
  }
  if (scheduledAt.getTime() < effectiveFromMs) {
    return { due: false, summaryDate, occurrenceKey, scheduledAt, reason: 'before_effective_from' };
  }
  return { due: true, summaryDate, occurrenceKey, scheduledAt };
}

export function findNextOccurrence(
  config: DailySummaryConfig,
  now: Date = new Date()
): Date | null {
  if (!isValidLocalTime(config.localTime) || !isValidIanaTimeZone(config.timeZone)) {
    return null;
  }
  const effectiveFrom = new Date(config.effectiveFromIso);
  const floor = Number.isNaN(effectiveFrom.getTime()) ? now : new Date(Math.max(now.getTime(), effectiveFrom.getTime()));

  for (let offset = 0; offset < 4; offset += 1) {
    const probe = new Date(floor.getTime() + offset * 24 * 60 * MINUTE_MS);
    const summaryDate = formatLocalCalendarDate(probe, config.timeZone);
    const scheduledAt = getScheduledInstantForLocalDate(config, summaryDate);
    if (scheduledAt.getTime() >= floor.getTime()) {
      return scheduledAt;
    }
  }
  return null;
}

export function defaultDailySummaryConfig(now: Date = new Date()): DailySummaryConfig {
  return {
    enabled: false,
    localTime: '08:00',
    timeZone: 'UTC',
    sendNtfy: false,
    effectiveFromIso: now.toISOString(),
  };
}
