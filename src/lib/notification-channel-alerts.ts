import { db } from '@/lib/db';
import { getConfiguration, setConfiguration, withDb } from '@/lib/db-utils';
import { isNextProductionBuild } from '@/lib/next-build-phase';

export const NOTIFICATION_CHANNEL_ALERT_CLEARS_KEY = 'notification_channel_alert_clears';

export const NOTIFICATION_CHANNELS = ['email', 'ntfy'] as const;

export type NotificationChannelId = (typeof NOTIFICATION_CHANNELS)[number];

const TRACKED_ACTIONS = [
  'email_failed',
  'email_sent',
  'notification_failed',
  'notification_sent',
  'daily_summary_sent',
] as const;

type TrackedAction = (typeof TRACKED_ACTIONS)[number];

type DeliveryOutcome = 'success' | 'failure';

export interface NotificationChannelAlert {
  channel: NotificationChannelId;
  error: string;
  latestTimestamp: string;
  latestFailureId: number;
  failureCount: number;
  settingsTab: NotificationChannelId;
  host?: string;
  topic?: string;
}

export interface NotificationChannelAlertView {
  channel: NotificationChannelId;
  error: string;
  latestTimestamp: string;
  failureCount: number;
  settingsTab: NotificationChannelId;
  host?: string;
  topic?: string;
}

interface AuditNotificationRow {
  id: number;
  timestamp: string;
  action: TrackedAction;
  details: string | null;
  errorMessage: string | null;
}

interface ChannelEvent {
  id: number;
  timestamp: string;
  channel: NotificationChannelId;
  outcome: DeliveryOutcome;
  error: string;
  host?: string;
  topic?: string;
}

type ClearMap = Partial<Record<NotificationChannelId, number>>;
type ClearsByUser = Record<string, ClearMap>;

function isNotificationChannelId(value: unknown): value is NotificationChannelId {
  return value === 'email' || value === 'ntfy';
}

function asTrackedAction(action: string): TrackedAction | null {
  switch (action) {
    case 'email_failed':
    case 'email_sent':
    case 'notification_failed':
    case 'notification_sent':
    case 'daily_summary_sent':
      return action;
    default:
      return null;
  }
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asChannel(value: unknown): NotificationChannelId | null {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return isNotificationChannelId(normalized) ? normalized : null;
}

function parseDetails(raw: string | null): Record<string, unknown> | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readClearId(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    return undefined;
  }
  return value;
}

function parseClears(raw: string | null): ClearsByUser {
  if (!raw) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    const result: ClearsByUser = {};
    for (const [userId, value] of Object.entries(parsed)) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        continue;
      }
      const entry: ClearMap = {};
      const record = value as Record<string, unknown>;
      for (const channel of NOTIFICATION_CHANNELS) {
        const id = readClearId(record[channel]);
        if (id !== undefined) {
          entry[channel] = id;
        }
      }
      if (Object.keys(entry).length > 0) {
        result[userId] = entry;
      }
    }
    return result;
  } catch {
    return {};
  }
}

function errorText(row: AuditNotificationRow, details: Record<string, unknown> | null, fallback?: string): string {
  const fromColumn = optionalString(row.errorMessage);
  if (fromColumn) {
    return fromColumn;
  }
  const fromDetails = optionalString(details?.error);
  if (fromDetails) {
    return fromDetails;
  }
  return optionalString(fallback) ?? '';
}

function directEvent(
  channel: NotificationChannelId,
  outcome: DeliveryOutcome,
  row: AuditNotificationRow,
  details: Record<string, unknown> | null
): ChannelEvent {
  return {
    id: row.id,
    timestamp: row.timestamp,
    channel,
    outcome,
    error: outcome === 'failure' ? errorText(row, details) : '',
    host: optionalString(details?.host),
    topic: optionalString(details?.topic),
  };
}

function readSucceededChannels(value: unknown): NotificationChannelId[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const channels: NotificationChannelId[] = [];
  for (const item of value) {
    if (typeof item === 'string') {
      const channel = asChannel(item);
      if (channel) {
        channels.push(channel);
      }
      continue;
    }
    if (item && typeof item === 'object' && 'channel' in item) {
      const channel = asChannel((item as { channel?: unknown }).channel);
      if (channel) {
        channels.push(channel);
      }
    }
  }
  return channels;
}

function readFailedChannels(value: unknown): Array<{ channel: NotificationChannelId; error: string }> {
  if (!Array.isArray(value)) {
    return [];
  }
  const failed: Array<{ channel: NotificationChannelId; error: string }> = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const record = item as Record<string, unknown>;
    const channel = asChannel(record.channel);
    if (!channel) {
      continue;
    }
    failed.push({
      channel,
      error: optionalString(record.error) ?? '',
    });
  }
  return failed;
}

function eventsFromDailySummary(row: AuditNotificationRow, details: Record<string, unknown> | null): ChannelEvent[] {
  const failed = readFailedChannels(details?.failed);
  const failedChannels = new Set(failed.map((item) => item.channel));
  const events: ChannelEvent[] = [];
  for (const item of failed) {
    events.push({
      id: row.id,
      timestamp: row.timestamp,
      channel: item.channel,
      outcome: 'failure',
      error: item.error || errorText(row, details),
      host: optionalString(details?.host),
      topic: optionalString(details?.topic),
    });
  }
  for (const channel of readSucceededChannels(details?.succeeded)) {
    if (failedChannels.has(channel)) {
      continue;
    }
    events.push({
      id: row.id,
      timestamp: row.timestamp,
      channel,
      outcome: 'success',
      error: '',
    });
  }
  return events;
}

function eventsFromRow(row: AuditNotificationRow): ChannelEvent[] {
  const details = parseDetails(row.details);
  switch (row.action) {
    case 'email_failed':
      return [directEvent('email', 'failure', row, details)];
    case 'email_sent':
      return [directEvent('email', 'success', row, details)];
    case 'notification_failed':
    case 'notification_sent': {
      const channelName = typeof details?.channel === 'string' ? details.channel.toLowerCase() : 'ntfy';
      if (channelName !== 'ntfy') {
        return [];
      }
      const outcome: DeliveryOutcome = row.action === 'notification_failed' ? 'failure' : 'success';
      return [directEvent('ntfy', outcome, row, details)];
    }
    case 'daily_summary_sent':
      return eventsFromDailySummary(row, details);
    default: {
      const exhaustive: never = row.action;
      return exhaustive;
    }
  }
}

/**
 * One open alert per channel whose newest delivery after the admin's clear
 * marker is a failure. The failure count is the streak after the later of
 * that marker and the last success.
 */
export function buildNotificationChannelAlerts(
  rows: AuditNotificationRow[],
  clears: ClearMap
): NotificationChannelAlert[] {
  const events: ChannelEvent[] = [];
  for (const row of rows) {
    events.push(...eventsFromRow(row));
  }
  events.sort((left, right) => left.id - right.id);

  const alerts: NotificationChannelAlert[] = [];
  for (const channel of NOTIFICATION_CHANNELS) {
    const clearId = clears[channel] ?? 0;
    const relevant = events.filter((event) => event.channel === channel && event.id > clearId);
    const newest = relevant[relevant.length - 1];
    if (!newest || newest.outcome !== 'failure') {
      continue;
    }

    let streakFloor = clearId;
    for (const event of relevant) {
      if (event.outcome === 'success' && event.id < newest.id) {
        streakFloor = event.id;
      }
    }

    let failureCount = 0;
    for (const event of relevant) {
      if (event.outcome === 'failure' && event.id > streakFloor) {
        failureCount += 1;
      }
    }
    if (failureCount < 1) {
      continue;
    }

    alerts.push({
      channel,
      error: newest.error,
      latestTimestamp: newest.timestamp,
      latestFailureId: newest.id,
      failureCount,
      settingsTab: channel,
      host: channel === 'email' ? newest.host : undefined,
      topic: channel === 'ntfy' ? newest.topic : undefined,
    });
  }
  return alerts;
}

function toView(alert: NotificationChannelAlert): NotificationChannelAlertView {
  return {
    channel: alert.channel,
    error: alert.error.slice(0, 500),
    latestTimestamp: alert.latestTimestamp,
    failureCount: alert.failureCount,
    settingsTab: alert.settingsTab,
    host: alert.host,
    topic: alert.topic,
  };
}

function loadAuditNotificationRows(): AuditNotificationRow[] {
  if (isNextProductionBuild()) {
    return [];
  }
  const statement = db.prepare(`
    SELECT id, timestamp, action, details, error_message as errorMessage
    FROM audit_log
    WHERE action IN ('email_failed', 'email_sent', 'notification_failed', 'notification_sent', 'daily_summary_sent')
    ORDER BY id ASC
  `);
  const rows = statement.all() as Array<{
    id: number;
    timestamp: string;
    action: string;
    details: string | null;
    errorMessage: string | null;
  }>;
  const result: AuditNotificationRow[] = [];
  for (const row of rows) {
    const action = asTrackedAction(row.action);
    if (!action) {
      continue;
    }
    result.push({
      id: row.id,
      timestamp: typeof row.timestamp === 'string' ? row.timestamp : String(row.timestamp),
      action,
      details: row.details,
      errorMessage: row.errorMessage,
    });
  }
  return result;
}

function readClearsByUser(): ClearsByUser {
  return parseClears(getConfiguration(NOTIFICATION_CHANNEL_ALERT_CLEARS_KEY));
}

export function getNotificationChannelAlerts(userId: string): NotificationChannelAlertView[] {
  return withDb(() => {
    const rows = loadAuditNotificationRows();
    const clears = readClearsByUser()[userId] ?? {};
    return buildNotificationChannelAlerts(rows, clears).map(toView);
  });
}

export function clearNotificationChannelAlerts(
  userId: string,
  channels: NotificationChannelId[]
): NotificationChannelAlertView[] {
  return withDb(() => {
    const rows = loadAuditNotificationRows();
    const allClears = readClearsByUser();
    const userClears: ClearMap = { ...(allClears[userId] ?? {}) };
    const open = buildNotificationChannelAlerts(rows, userClears);
    let changed = false;

    for (const channel of channels) {
      const alert = open.find((item) => item.channel === channel);
      if (!alert || userClears[channel] === alert.latestFailureId) {
        continue;
      }
      userClears[channel] = alert.latestFailureId;
      changed = true;
    }

    if (changed) {
      allClears[userId] = userClears;
      setConfiguration(NOTIFICATION_CHANNEL_ALERT_CLEARS_KEY, JSON.stringify(allClears));
    }

    return buildNotificationChannelAlerts(rows, userClears).map(toView);
  });
}

export function parseNotificationChannels(value: unknown): NotificationChannelId[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }
  const channels: NotificationChannelId[] = [];
  for (const item of value) {
    if (!isNotificationChannelId(item)) {
      return null;
    }
    if (!channels.includes(item)) {
      channels.push(item);
    }
  }
  return channels;
}
