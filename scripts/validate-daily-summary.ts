#!/usr/bin/env tsx

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { DatabaseMigrator, DAILY_SUMMARY_DELIVERIES_SCHEMA, LATEST_SCHEMA_VERSION } from '../src/lib/db-migrations';
import {
  evaluateScheduledOccurrence,
  findNextOccurrence,
  isValidIanaTimeZone,
  resolveZonedLocalDateTime,
  type DueEvaluation,
} from '../src/lib/daily-summary-schedule';
import { buildDailySummarySnapshot } from '../src/lib/daily-summary-aggregate';
import {
  claimDelivery,
  ensureDeliveryRows,
  finalizeDeliveryFailure,
  finalizeDeliverySuccess,
} from '../src/lib/daily-summary-ledger';
import { renderMarkdownEmail, substitutePlainTemplate } from '../src/lib/notification-template-renderer';
import { truncateNtfyAtLineBoundary, utf8ByteLength } from '../src/lib/notification-template-validation';
import type { BackupNotificationConfig, DailySummaryConfig, DailySummaryRenderedPayload } from '../src/lib/types';

function pass(name: string): void {
  console.log(`  ✓ ${name}`);
}

function testSchedule(): void {
  console.log('Schedule');
  assert.equal(isValidIanaTimeZone('Europe/London'), true);
  assert.equal(isValidIanaTimeZone('Not/AZone'), false);

  const config: DailySummaryConfig = {
    enabled: true,
    localTime: '08:00',
    timeZone: 'UTC',
    sendNtfy: false,
    effectiveFromIso: '2026-04-01T10:00:00.000Z',
  };
  const before = evaluateScheduledOccurrence(config, new Date('2026-04-01T07:59:00.000Z'));
  assert.equal(before.due, false);
  const after = evaluateScheduledOccurrence(config, new Date('2026-04-01T08:00:00.000Z'));
  assert.equal(after.due, false, 'enable after due time must skip today');

  const alreadyEnabled: DailySummaryConfig = {
    ...config,
    effectiveFromIso: '2026-03-01T00:00:00.000Z',
  };
  const catchUp: DueEvaluation = evaluateScheduledOccurrence(alreadyEnabled, new Date('2026-04-01T15:00:00.000Z'));
  assert.equal(catchUp.due, true);

  const londonGap = resolveZonedLocalDateTime(2026, 3, 29, 1, 30, 'Europe/London');
  const gapParts = londonGap.toISOString();
  assert.match(gapParts, /2026-03-29T0[12]:/);

  const londonOverlapFirst = resolveZonedLocalDateTime(2026, 10, 25, 1, 30, 'Europe/London');
  const londonOverlapLater = new Date(londonOverlapFirst.getTime() + 60 * 60 * 1000);
  assert.ok(londonOverlapFirst.getTime() < londonOverlapLater.getTime());

  const next = findNextOccurrence({
    ...alreadyEnabled,
    localTime: '20:00',
  }, new Date('2026-04-01T15:00:00.000Z'));
  assert.ok(next);
  assert.equal(next?.toISOString(), '2026-04-01T20:00:00.000Z');
  pass('due evaluation, catch-up, DST, next occurrence');
}

function testSnapshot(): void {
  console.log('Snapshot');
  const generatedAt = new Date('2026-04-01T12:00:00.000Z');
  const settings: Record<string, BackupNotificationConfig> = {
    's1:Documents': {
      notificationEvent: 'warnings',
      overdueBackupCheckEnabled: true,
      expectedInterval: '1D',
      allowedWeekDays: [0, 1, 2, 3, 4, 5, 6],
      time: '2026-03-30T08:00:00.000Z',
      ntfyEnabled: true,
      emailEnabled: true,
    },
    's1:ConfiguredOnly': {
      notificationEvent: 'warnings',
      overdueBackupCheckEnabled: false,
      expectedInterval: '1D',
      allowedWeekDays: [0, 1, 2, 3, 4, 5, 6],
      time: '',
      ntfyEnabled: true,
      emailEnabled: true,
    },
    'missing:Orphan': {
      notificationEvent: 'warnings',
      overdueBackupCheckEnabled: true,
      expectedInterval: '1D',
      allowedWeekDays: [0, 1, 2, 3, 4, 5, 6],
      time: '',
      ntfyEnabled: true,
      emailEnabled: true,
    },
  };
  const snapshot = buildDailySummarySnapshot({
    generatedAt,
    timeZone: 'UTC',
    servers: [{ id: 's1', name: 'fileserver', alias: 'Files', note: '', server_url: 'http://example.invalid' }],
    latestResults: [{
      last_backup_id: 'b1',
      server_id: 's1',
      backup_name: 'Documents',
      last_backup_date: '2026-03-30T08:00:00.000Z',
      last_backup_status: 'Warning',
      duration_seconds: 12,
      uploaded_size: 100,
      source_size: 200,
      storage_size: 300,
      examined_files: 4,
      warnings: 1,
      errors: 0,
      server_name: 'fileserver',
      server_alias: 'Files',
      server_note: '',
      server_url: 'http://example.invalid',
    }],
    backupSettings: settings,
    overdueToleranceMinutes: 0,
  });
  assert.equal(snapshot.jobCount, 2);
  assert.equal(snapshot.warningCount, 1);
  assert.equal(snapshot.noReportCount, 1);
  assert.equal(snapshot.successCount + snapshot.warningCount + snapshot.errorCount + snapshot.fatalCount + snapshot.unknownCount + snapshot.noReportCount, snapshot.jobCount);
  const empty = buildDailySummarySnapshot({
    generatedAt,
    timeZone: 'UTC',
    servers: [],
    latestResults: [],
    backupSettings: {},
    overdueToleranceMinutes: 0,
  });
  assert.equal(empty.jobCount, 0);
  pass('known jobs, no-report, orphan exclusion, empty install');
}

function testRenderer(): void {
  console.log('Renderer');
  const rendered = renderMarkdownEmail(
    'Subject {status}',
    'Hello **{name}**\n\n{problem_table}\n\n<script>alert(1)</script>\n\n[ok](https://example.com)\n\n![x](javascript:alert(1))',
    {
      status: 'Success\nInjected',
      name: 'a | b **notbold** <img>',
      problem_table: '<table class="email-table"><tbody><tr><td>row</td></tr></tbody></table>',
    }
  );
  assert.equal(rendered.subject.includes('\n'), false);
  assert.equal(rendered.html.includes('<script>'), false);
  assert.equal(rendered.html.includes('<img'), false);
  assert.equal(rendered.html.includes('javascript:'), false);
  assert.ok(rendered.html.includes('a | b **notbold**'));
  assert.ok(rendered.html.includes('<table'));
  const ntfy = truncateNtfyAtLineBoundary('one\ntwo\nthree', 20, 'omitted');
  assert.ok(utf8ByteLength(ntfy) <= 20 + utf8ByteLength('\nomitted'));
  const plain = substitutePlainTemplate('Hello {name}', { name: '*not markdown*' });
  assert.equal(plain, 'Hello *not markdown*');
  pass('markdown, sanitizer, subject, truncation');
}

function testLedger(): void {
  console.log('Ledger');
  const database = new Database(':memory:');
  database.exec(DAILY_SUMMARY_DELIVERIES_SCHEMA);
  const payload: DailySummaryRenderedPayload = {
    subject: 's',
    emailHtml: '<p>e</p>',
    emailText: 'e',
    ntfyTitle: 'n',
    ntfyMessage: 'n',
    ntfyPriority: 'default',
    ntfyTags: 't',
  };
  ensureDeliveryRows(database, {
    occurrenceKey: 'scheduled:UTC:2026-04-01',
    channels: ['email', 'ntfy'],
    trigger: 'scheduled',
    summaryDate: '2026-04-01',
    timeZone: 'UTC',
    payload,
  });
  const email = claimDelivery(database, 'scheduled:UTC:2026-04-01', 'email');
  const emailAgain = claimDelivery(database, 'scheduled:UTC:2026-04-01', 'email');
  assert.ok(email);
  assert.equal(emailAgain, null);
  finalizeDeliverySuccess(database, email.id);
  const ntfy = claimDelivery(database, 'scheduled:UTC:2026-04-01', 'ntfy');
  assert.ok(ntfy);
  finalizeDeliveryFailure(database, ntfy.id, 'boom');
  const retry = claimDelivery(database, 'scheduled:UTC:2026-04-01', 'ntfy', new Date(Date.now() + 2 * 60 * 1000));
  assert.ok(retry);
  const sentEmail = claimDelivery(database, 'scheduled:UTC:2026-04-01', 'email');
  assert.equal(sentEmail, null);
  pass('claim isolation, success, retry');
}

function testMigration(): void {
  console.log('Migration 4.2');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'duplistatus-ds-'));
  const dbPath = path.join(dir, 'test.db');
  const database = new Database(dbPath);
  database.exec(`
    CREATE TABLE db_version (version TEXT PRIMARY KEY, applied_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE configurations (key TEXT PRIMARY KEY NOT NULL, value TEXT);
    CREATE TABLE api_keys (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      key_hash TEXT UNIQUE NOT NULL,
      key_prefix TEXT NOT NULL,
      key_suffix TEXT NOT NULL,
      scope TEXT NOT NULL DEFAULT 'read',
      description TEXT DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1
    );
  `);
  database.prepare('INSERT INTO db_version (version) VALUES (?)').run('4.1');
  database.prepare('INSERT INTO configurations (key, value) VALUES (?, ?)').run(
    'notification_templates',
    JSON.stringify({ language: 'en-GB', success: { title: 'custom', message: 'keep', priority: 'default', tags: 'x' }, warning: { title: 'w', message: 'w', priority: 'high', tags: 'y' }, overdueBackup: { title: 'o', message: 'o', priority: 'default', tags: 'z' } })
  );
  const migrator = new DatabaseMigrator(database, dbPath);
  migrator.runMigrationsSync();
  const version = database.prepare('SELECT version FROM db_version ORDER BY applied_at DESC LIMIT 1').get() as { version: string };
  assert.equal(version.version, LATEST_SCHEMA_VERSION);
  const table = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='daily_summary_deliveries'").get();
  assert.ok(table);
  const stored = database.prepare('SELECT value FROM configurations WHERE key = ?').get('notification_templates') as { value: string };
  const parsed = JSON.parse(stored.value) as { success: { message: string } };
  assert.equal(parsed.success.message, 'keep');
  database.close();
  fs.rmSync(dir, { recursive: true, force: true });
  pass('upgrade from 4.1 preserves customized templates');
}

testSchedule();
testSnapshot();
testRenderer();
testLedger();
testMigration();
console.log('\nDaily summary validation passed.');
