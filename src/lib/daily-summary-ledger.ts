import { randomUUID } from 'crypto';
import type Database from 'better-sqlite3';
import type {
  DailySummaryChannel,
  DailySummaryDeliveryState,
  DailySummaryRenderedPayload,
  DailySummaryTrigger,
} from '@/lib/types';

export const DAILY_SUMMARY_LEASE_MS = 2 * 60 * 1000;
export const DAILY_SUMMARY_MAX_ATTEMPTS = 8;
export const DAILY_SUMMARY_RETENTION_DAYS = 30;

export interface DailySummaryDeliveryRecord {
  id: string;
  occurrenceKey: string;
  channel: DailySummaryChannel;
  trigger: DailySummaryTrigger;
  summaryDate: string;
  timeZone: string;
  payloadJson: string | null;
  state: DailySummaryDeliveryState;
  attemptCount: number;
  nextRetryAt: string | null;
  leaseExpiresAt: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
}

interface DeliveryRow {
  id: string;
  occurrence_key: string;
  channel: DailySummaryChannel;
  trigger: DailySummaryTrigger;
  summary_date: string;
  time_zone: string;
  payload_json: string | null;
  state: DailySummaryDeliveryState;
  attempt_count: number;
  next_retry_at: string | null;
  lease_expires_at: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
}

function mapRow(row: DeliveryRow): DailySummaryDeliveryRecord {
  return {
    id: row.id,
    occurrenceKey: row.occurrence_key,
    channel: row.channel,
    trigger: row.trigger,
    summaryDate: row.summary_date,
    timeZone: row.time_zone,
    payloadJson: row.payload_json,
    state: row.state,
    attemptCount: row.attempt_count,
    nextRetryAt: row.next_retry_at,
    leaseExpiresAt: row.lease_expires_at,
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sentAt: row.sent_at,
  };
}

export function retryDelayMs(attemptCount: number): number {
  const minutes = [1, 2, 4, 8, 15, 30, 60, 60];
  const index = Math.min(Math.max(attemptCount, 1), minutes.length) - 1;
  return minutes[index] * 60 * 1000;
}

export function ensureDeliveryRows(
  database: Database.Database,
  input: {
    occurrenceKey: string;
    channels: DailySummaryChannel[];
    trigger: DailySummaryTrigger;
    summaryDate: string;
    timeZone: string;
    payload: DailySummaryRenderedPayload;
  }
): DailySummaryDeliveryRecord[] {
  const now = new Date().toISOString();
  const payloadJson = JSON.stringify(input.payload);
  const insert = database.prepare(`
    INSERT OR IGNORE INTO daily_summary_deliveries (
      id, occurrence_key, channel, trigger, summary_date, time_zone, payload_json,
      state, attempt_count, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?)
  `);
  const updatePayload = database.prepare(`
    UPDATE daily_summary_deliveries
    SET payload_json = COALESCE(payload_json, ?)
    WHERE occurrence_key = ? AND channel = ? AND payload_json IS NULL
  `);

  const tx = database.transaction(() => {
    for (const channel of input.channels) {
      insert.run(
        randomUUID(),
        input.occurrenceKey,
        channel,
        input.trigger,
        input.summaryDate,
        input.timeZone,
        payloadJson,
        now,
        now
      );
      updatePayload.run(payloadJson, input.occurrenceKey, channel);
    }
  });
  tx();
  return getDeliveriesForOccurrence(database, input.occurrenceKey);
}

export function claimDelivery(
  database: Database.Database,
  occurrenceKey: string,
  channel: DailySummaryChannel,
  now: Date = new Date()
): DailySummaryDeliveryRecord | null {
  const nowIso = now.toISOString();
  const leaseExpires = new Date(now.getTime() + DAILY_SUMMARY_LEASE_MS).toISOString();
  const tx = database.transaction(() => {
    const row = database.prepare(`
      SELECT * FROM daily_summary_deliveries
      WHERE occurrence_key = ? AND channel = ?
    `).get(occurrenceKey, channel) as DeliveryRow | undefined;
    if (!row) {
      return null;
    }
    if (row.state === 'sent') {
      return null;
    }
    const retryReady = !row.next_retry_at || row.next_retry_at <= nowIso;
    const leaseExpired = !row.lease_expires_at || row.lease_expires_at <= nowIso;
    const claimable =
      (row.state === 'pending' && retryReady)
      || (row.state === 'failed' && retryReady)
      || (row.state === 'sending' && leaseExpired);
    if (!claimable) {
      return null;
    }
    const result = database.prepare(`
      UPDATE daily_summary_deliveries
      SET state = 'sending',
          lease_expires_at = ?,
          attempt_count = attempt_count + 1,
          updated_at = ?
      WHERE id = ?
        AND (
          state IN ('pending', 'failed')
          OR (state = 'sending' AND (lease_expires_at IS NULL OR lease_expires_at <= ?))
        )
    `).run(leaseExpires, nowIso, row.id, nowIso);
    if (result.changes !== 1) {
      return null;
    }
    return database.prepare('SELECT * FROM daily_summary_deliveries WHERE id = ?').get(row.id) as DeliveryRow;
  });
  const claimed = tx();
  return claimed ? mapRow(claimed) : null;
}

export function finalizeDeliverySuccess(
  database: Database.Database,
  id: string,
  now: Date = new Date()
): void {
  const nowIso = now.toISOString();
  database.prepare(`
    UPDATE daily_summary_deliveries
    SET state = 'sent',
        error = NULL,
        next_retry_at = NULL,
        lease_expires_at = NULL,
        sent_at = ?,
        updated_at = ?
    WHERE id = ?
  `).run(nowIso, nowIso, id);
}

export function finalizeDeliveryFailure(
  database: Database.Database,
  id: string,
  error: string,
  now: Date = new Date()
): void {
  const row = database.prepare('SELECT attempt_count FROM daily_summary_deliveries WHERE id = ?').get(id) as { attempt_count: number } | undefined;
  const attemptCount = row?.attempt_count ?? 1;
  const nowIso = now.toISOString();
  const nextRetry = attemptCount >= DAILY_SUMMARY_MAX_ATTEMPTS
    ? null
    : new Date(now.getTime() + retryDelayMs(attemptCount)).toISOString();
  database.prepare(`
    UPDATE daily_summary_deliveries
    SET state = 'failed',
        error = ?,
        next_retry_at = ?,
        lease_expires_at = NULL,
        updated_at = ?
    WHERE id = ?
  `).run(error.slice(0, 2000), nextRetry, nowIso, id);
}

export function getDeliveriesForOccurrence(
  database: Database.Database,
  occurrenceKey: string
): DailySummaryDeliveryRecord[] {
  const rows = database.prepare(`
    SELECT * FROM daily_summary_deliveries WHERE occurrence_key = ? ORDER BY channel
  `).all(occurrenceKey) as DeliveryRow[];
  return rows.map(mapRow);
}

function latestRowForChannel(
  database: Database.Database,
  channel: DailySummaryChannel
): DailySummaryDeliveryRecord | null {
  const row = database.prepare(`
    SELECT * FROM daily_summary_deliveries
    WHERE channel = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).get(channel) as DeliveryRow | undefined;
  return row ? mapRow(row) : null;
}

export function getLatestDeliveriesByChannel(
  database: Database.Database
): Record<DailySummaryChannel, DailySummaryDeliveryRecord | null> {
  return {
    email: latestRowForChannel(database, 'email'),
    ntfy: latestRowForChannel(database, 'ntfy'),
  };
}

export function getLatestSuccessAt(
  database: Database.Database,
  channel: DailySummaryChannel
): string | null {
  const row = database.prepare(`
    SELECT sent_at FROM daily_summary_deliveries
    WHERE channel = ? AND state = 'sent' AND sent_at IS NOT NULL
    ORDER BY sent_at DESC
    LIMIT 1
  `).get(channel) as { sent_at: string } | undefined;
  return row?.sent_at ?? null;
}

export function getFailedRetryableDeliveries(
  database: Database.Database,
  occurrenceKey?: string
): DailySummaryDeliveryRecord[] {
  const nowIso = new Date().toISOString();
  if (occurrenceKey) {
    const rows = database.prepare(`
      SELECT * FROM daily_summary_deliveries
      WHERE occurrence_key = ? AND state = 'failed'
        AND (next_retry_at IS NULL OR next_retry_at <= ?)
    `).all(occurrenceKey, nowIso) as DeliveryRow[];
    return rows.map(mapRow);
  }
  const rows = database.prepare(`
    SELECT * FROM daily_summary_deliveries
    WHERE state = 'failed' AND (next_retry_at IS NULL OR next_retry_at <= ?)
    ORDER BY updated_at DESC
  `).all(nowIso) as DeliveryRow[];
  return rows.map(mapRow);
}

export function parseStoredPayload(payloadJson: string | null): DailySummaryRenderedPayload | null {
  if (!payloadJson) {
    return null;
  }
  try {
    const parsed = JSON.parse(payloadJson) as DailySummaryRenderedPayload & {
      ntfyTitle?: string;
      ntfyMessage?: string;
    };
    if (
      typeof parsed.subject === 'string'
      && typeof parsed.emailHtml === 'string'
      && typeof parsed.emailText === 'string'
    ) {
      return {
        subject: parsed.subject,
        emailHtml: parsed.emailHtml,
        emailText: parsed.emailText,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function pruneOldDeliveries(
  database: Database.Database,
  retentionDays: number = DAILY_SUMMARY_RETENTION_DAYS
): number {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
  const result = database.prepare(`
    DELETE FROM daily_summary_deliveries
    WHERE created_at < ? AND state IN ('sent', 'failed')
  `).run(cutoff);
  return result.changes;
}
