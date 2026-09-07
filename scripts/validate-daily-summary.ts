#!/usr/bin/env tsx

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { DatabaseMigrator, DAILY_SUMMARY_DELIVERIES_SCHEMA, LATEST_SCHEMA_VERSION } from '../src/lib/db-migrations';
import {
  buildDailySummaryDispatchCronExpression,
  findNextOccurrence,
  isValidIanaTimeZone,
  resolveZonedLocalDateTime,
} from '../src/lib/daily-summary-schedule';
import { buildDailySummarySnapshot } from '../src/lib/daily-summary-aggregate';
import { pruneConfigurationRecord } from '../src/lib/orphaned-configuration';
import { pruneOrphanedBackupAndServerRows } from '../src/lib/orphaned-table-rows';
import {
  claimDelivery,
  ensureDeliveryRows,
  finalizeDeliveryFailure,
  finalizeDeliverySuccess,
  getLatestSuccessAt,
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

  assert.equal(buildDailySummaryDispatchCronExpression('20:12'), '12 20 * * *');
  assert.equal(buildDailySummaryDispatchCronExpression('01:00'), '0 1 * * *');
  assert.equal(buildDailySummaryDispatchCronExpression('00:00'), '0 0 * * *');
  assert.equal(buildDailySummaryDispatchCronExpression('invalid'), '0 1 * * *');

  const alreadyEnabled: DailySummaryConfig = {
    enabled: true,
    utcTime: '08:00',
    timeZone: 'UTC',
    effectiveFromIso: '2026-03-01T00:00:00.000Z',
    publicUrl: '',
    smtpRecipient: '',
  };

  const londonGap = resolveZonedLocalDateTime(2026, 3, 29, 1, 30, 'Europe/London');
  const gapParts = londonGap.toISOString();
  assert.match(gapParts, /2026-03-29T0[12]:/);

  const londonOverlapFirst = resolveZonedLocalDateTime(2026, 10, 25, 1, 30, 'Europe/London');
  const londonOverlapLater = new Date(londonOverlapFirst.getTime() + 60 * 60 * 1000);
  assert.ok(londonOverlapFirst.getTime() < londonOverlapLater.getTime());

  const next = findNextOccurrence({
    ...alreadyEnabled,
    utcTime: '20:00',
  }, new Date('2026-04-01T15:00:00.000Z'));
  assert.ok(next);
  assert.equal(next?.toISOString(), '2026-04-01T20:00:00.000Z');

  const savedDuringMinute: DailySummaryConfig = {
    ...alreadyEnabled,
    utcTime: '19:50',
    effectiveFromIso: '2026-09-07T19:50:41.000Z',
  };
  const nextDuringMinute = findNextOccurrence(
    savedDuringMinute,
    new Date('2026-09-07T19:50:41.000Z')
  );
  assert.equal(nextDuringMinute?.toISOString(), '2026-09-07T19:50:00.000Z');
  pass('cron expression, DST, next occurrence');
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
  assert.equal(snapshot.jobCount, 1);
  assert.equal(snapshot.warningCount, 1);
  assert.equal(snapshot.noReportCount, 0);
  assert.equal(snapshot.jobs[0]?.backupName, 'Documents');
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
  pass('latest backup jobs only, leftover settings ignored, empty install');
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
  assert.equal(/<img\b/i.test(rendered.html), false);
  assert.equal(rendered.html.includes('href="javascript:'), false);
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
  };
  ensureDeliveryRows(database, {
    occurrenceKey: 'scheduled:UTC:2026-04-01:08:00',
    channels: ['email'],
    trigger: 'scheduled',
    summaryDate: '2026-04-01',
    timeZone: 'UTC',
    payload,
  });
  const email = claimDelivery(database, 'scheduled:UTC:2026-04-01:08:00', 'email');
  const emailAgain = claimDelivery(database, 'scheduled:UTC:2026-04-01:08:00', 'email');
  assert.ok(email);
  assert.equal(emailAgain, null);
  finalizeDeliverySuccess(database, email.id);
  const sentEmail = claimDelivery(database, 'scheduled:UTC:2026-04-01:08:00', 'email');
  assert.equal(sentEmail, null);
  ensureDeliveryRows(database, {
    occurrenceKey: 'scheduled:UTC:2026-04-01:08:30',
    channels: ['email'],
    trigger: 'scheduled',
    summaryDate: '2026-04-01',
    timeZone: 'UTC',
    payload,
  });
  const laterTime = claimDelivery(database, 'scheduled:UTC:2026-04-01:08:30', 'email');
  assert.ok(laterTime, 'a later send time on the same date must still be claimable');
  finalizeDeliverySuccess(database, laterTime.id);
  const latestSuccess = getLatestSuccessAt(database, 'email');
  assert.ok(latestSuccess);
  ensureDeliveryRows(database, {
    occurrenceKey: 'manual:pending',
    channels: ['email'],
    trigger: 'manual',
    summaryDate: '2026-04-01',
    timeZone: 'UTC',
    payload,
  });
  assert.equal(getLatestSuccessAt(database, 'email'), latestSuccess);
  pass('claim isolation, success, and schedule-change key');
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

function testOrphanPrune(): void {
  console.log('Orphan prune');
  const liveJobKeys = new Set(['s1:Documents']);
  const liveServerIds = new Set(['s1']);
  const { kept, removedKeys } = pruneConfigurationRecord(
    {
      's1:Documents': 1,
      's1:ConfiguredOnly': 2,
      's1:__default__': 3,
      'missing:Orphan': 4,
    },
    liveJobKeys,
    liveServerIds
  );
  assert.deepEqual(kept, { 's1:Documents': 1, 's1:__default__': 3 });
  assert.equal(removedKeys.sort().join(','), 'missing:Orphan,s1:ConfiguredOnly');
  pass('keeps live jobs and server defaults, drops leftovers');
}

function testOrphanTableRows(): void {
  console.log('Orphan table rows');
  const database = new Database(':memory:');
  database.exec(`
    CREATE TABLE servers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
    CREATE TABLE backups (
      id TEXT PRIMARY KEY,
      server_id TEXT NOT NULL,
      backup_name TEXT NOT NULL
    );
  `);
  database.prepare('INSERT INTO servers (id, name) VALUES (?, ?)').run('live', 'Live Server');
  database.prepare('INSERT INTO servers (id, name) VALUES (?, ?)').run('empty', 'Empty Server');
  database.prepare('INSERT INTO backups (id, server_id, backup_name) VALUES (?, ?, ?)').run('b1', 'live', 'System');
  database.prepare('INSERT INTO backups (id, server_id, backup_name) VALUES (?, ?, ?)').run('b2', 'missing', 'Files');

  const result = pruneOrphanedBackupAndServerRows(database);
  assert.equal(result.orphanedBackupsRemoved, 1);
  assert.equal(result.orphanedServersRemoved, 1);

  const remainingServers = database.prepare('SELECT id FROM servers ORDER BY id').all() as Array<{ id: string }>;
  const remainingBackups = database.prepare('SELECT id FROM backups ORDER BY id').all() as Array<{ id: string }>;
  assert.deepEqual(remainingServers.map((row) => row.id), ['live']);
  assert.deepEqual(remainingBackups.map((row) => row.id), ['b1']);
  database.close();
  pass('drops backups without a server and servers without backups');
}

testSchedule();
testSnapshot();
testRenderer();
testLedger();
testMigration();
testOrphanPrune();
testOrphanTableRows();
console.log('\nDaily summary validation passed.');
