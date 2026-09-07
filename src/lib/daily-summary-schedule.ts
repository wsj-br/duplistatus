/**
 * Daily summary schedule evaluation.
 * Send time is stored as HH:mm UTC; the Settings UI edits browser-local wall time.
 */

import type { DailySummaryConfig } from '@/lib/types';

const LOCAL_TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MINUTE_MS = 60 * 1000;
export const DAILY_SUMMARY_SCHEDULE_TIME_ZONE = 'UTC';
/** Default Daily Summary send time (HH:mm UTC) and matching cron expression. */
export const DEFAULT_DAILY_SUMMARY_UTC_TIME = '01:00';

export function buildDailySummaryDispatchCronExpression(utcTime: string): string {
  const time = isValidLocalTime(utcTime) ? utcTime : DEFAULT_DAILY_SUMMARY_UTC_TIME;
  const { hour, minute } = parseLocalTime(time);
  return `${minute} ${hour} * * *`;
}

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

export function formatTimeLabel(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** Convert browser-local HH:mm to stored HH:mm UTC (same approach as Duplicati version start hour). */
export function localWallTimeToUtcTime(localTime: string, reference: Date = new Date()): string {
  const { hour, minute } = parseLocalTime(localTime);
  const local = new Date(reference);
  local.setHours(hour, minute, 0, 0);
  return formatTimeLabel(local.getUTCHours(), local.getUTCMinutes());
}

/** Convert stored HH:mm UTC to browser-local HH:mm for editing. */
export function utcTimeToLocalWallTime(utcTime: string, reference: Date = new Date()): string {
  const { hour, minute } = parseLocalTime(utcTime);
  const utc = new Date(reference);
  utc.setUTCHours(hour, minute, 0, 0);
  return formatTimeLabel(utc.getHours(), utc.getMinutes());
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

export function formatUtcCalendarDate(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function truncateToUtcMinuteMs(date: Date): number {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    0,
    0
  );
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

export function legacyLocalScheduleToUtcTime(
  localTime: string,
  timeZone: string,
  reference: Date = new Date()
): string {
  const parts = getZonedParts(reference, timeZone);
  const { hour, minute } = parseLocalTime(localTime);
  const instant = resolveZonedLocalDateTime(parts.year, parts.month, parts.day, hour, minute, timeZone);
  return formatTimeLabel(instant.getUTCHours(), instant.getUTCMinutes());
}

export function scheduledOccurrenceKey(summaryDate: string, utcTime: string): string {
  return `scheduled:${DAILY_SUMMARY_SCHEDULE_TIME_ZONE}:${summaryDate}:${utcTime}`;
}

export function manualOccurrenceKey(runId: string): string {
  return `manual:${runId}`;
}

function parseCalendarDate(summaryDate: string): { year: number; month: number; day: number } {
  const [year, month, day] = summaryDate.split('-').map((part) => Number.parseInt(part, 10));
  return { year, month, day };
}

export function getScheduledInstantForUtcDate(
  config: Pick<DailySummaryConfig, 'utcTime'>,
  summaryDate: string
): Date {
  const { hour, minute } = parseLocalTime(config.utcTime);
  const { year, month, day } = parseCalendarDate(summaryDate);
  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
}

export function findNextOccurrence(
  config: DailySummaryConfig,
  now: Date = new Date()
): Date | null {
  if (!isValidLocalTime(config.utcTime)) {
    return null;
  }
  const effectiveFrom = new Date(config.effectiveFromIso);
  const effectiveFromMinuteMs = Number.isNaN(effectiveFrom.getTime()) ? 0 : truncateToUtcMinuteMs(effectiveFrom);

  for (let offset = 0; offset < 4; offset += 1) {
    const probe = new Date(now.getTime() + offset * 24 * 60 * MINUTE_MS);
    const summaryDate = formatUtcCalendarDate(probe);
    const scheduledAt = getScheduledInstantForUtcDate(config, summaryDate);
    if (scheduledAt.getTime() < effectiveFromMinuteMs) {
      continue;
    }
    if (scheduledAt.getTime() + MINUTE_MS > now.getTime()) {
      return scheduledAt;
    }
  }
  return null;
}

export function defaultDailySummaryConfig(now: Date = new Date()): DailySummaryConfig {
  return {
    enabled: false,
    utcTime: DEFAULT_DAILY_SUMMARY_UTC_TIME,
    timeZone: 'UTC',
    effectiveFromIso: now.toISOString(),
    publicUrl: '',
    smtpRecipient: '',
  };
}
