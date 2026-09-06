import type {
  BackupNotificationConfig,
  BackupStatus,
  DailySummaryJobRow,
  DailySummarySnapshot,
} from '@/lib/types';
import { defaultBackupNotificationConfig } from '@/lib/default-config';
import { GetNextBackupRunDate } from '@/lib/server_intervals';
import { getDefaultAllowedWeekDays } from '@/lib/interval-utils';
import { formatLocalCalendarDate } from '@/lib/daily-summary-schedule';

export interface SummaryServerRow {
  id: string;
  name: string;
  alias: string;
  note: string;
  server_url: string;
}

export interface SummaryLatestResultRow {
  last_backup_id: string;
  server_id: string;
  backup_name: string;
  last_backup_date: string;
  last_backup_status: string;
  duration_seconds: number;
  uploaded_size: number;
  source_size: number;
  storage_size: number;
  examined_files: number;
  warnings: number;
  errors: number;
  server_name: string;
  server_alias: string;
  server_note: string;
  server_url: string;
}

const VALID_STATUSES: readonly BackupStatus[] = ['Success', 'Unknown', 'Warning', 'Error', 'Fatal'];

function isBackupStatus(value: string): value is BackupStatus {
  return (VALID_STATUSES as readonly string[]).includes(value);
}

function jobKey(serverId: string, backupName: string): string {
  return `${serverId}:${backupName}`;
}

function displayName(alias: string, name: string): string {
  const trimmed = alias.trim();
  return trimmed.length > 0 ? trimmed : name;
}

function mergeSettings(
  backupSettings: Record<string, BackupNotificationConfig>,
  serverId: string,
  backupName: string
): BackupNotificationConfig {
  const explicit = backupSettings[jobKey(serverId, backupName)];
  const serverDefault = backupSettings[jobKey(serverId, '__default__')];
  return {
    ...defaultBackupNotificationConfig,
    ...(serverDefault ?? {}),
    ...(explicit ?? {}),
  };
}

function computeOverdue(
  settings: BackupNotificationConfig,
  lastBackupDate: string | null,
  generatedAt: Date,
  overdueToleranceMinutes: number
): { isOverdue: boolean; expectedBackupDate: string | null } {
  if (!settings.overdueBackupCheckEnabled || !lastBackupDate) {
    return { isOverdue: false, expectedBackupDate: settings.time || null };
  }
  try {
    const expectedBackupDate = GetNextBackupRunDate(
      lastBackupDate,
      settings.time || lastBackupDate,
      settings.expectedInterval || defaultBackupNotificationConfig.expectedInterval,
      settings.allowedWeekDays && settings.allowedWeekDays.length > 0
        ? settings.allowedWeekDays
        : getDefaultAllowedWeekDays()
    );
    if (!expectedBackupDate) {
      return { isOverdue: false, expectedBackupDate: null };
    }
    const expected = new Date(expectedBackupDate);
    if (Number.isNaN(expected.getTime())) {
      return { isOverdue: false, expectedBackupDate };
    }
    expected.setMinutes(expected.getMinutes() + overdueToleranceMinutes);
    return { isOverdue: generatedAt.getTime() > expected.getTime(), expectedBackupDate };
  } catch {
    return { isOverdue: false, expectedBackupDate: settings.time || null };
  }
}

function statusBucket(job: DailySummaryJobRow): BackupStatus | 'No report' {
  if (!job.hasReport || job.lastBackupStatus === null) {
    return 'No report';
  }
  return isBackupStatus(job.lastBackupStatus) ? job.lastBackupStatus : 'Unknown';
}

export function isProblemJob(job: DailySummaryJobRow): boolean {
  const bucket = statusBucket(job);
  return job.isOverdue || bucket !== 'Success';
}

export function compareSummaryJobs(a: DailySummaryJobRow, b: DailySummaryJobRow): number {
  const aProblem = isProblemJob(a) ? 0 : 1;
  const bProblem = isProblemJob(b) ? 0 : 1;
  if (aProblem !== bProblem) {
    return aProblem - bProblem;
  }
  const aName = displayName(a.serverAlias, a.serverName).localeCompare(displayName(b.serverAlias, b.serverName));
  if (aName !== 0) {
    return aName;
  }
  return a.backupName.localeCompare(b.backupName);
}

export function buildDailySummarySnapshot(input: {
  generatedAt: Date;
  timeZone: string;
  servers: SummaryServerRow[];
  latestResults: SummaryLatestResultRow[];
  backupSettings: Record<string, BackupNotificationConfig>;
  overdueToleranceMinutes: number;
}): DailySummarySnapshot {
  const serversById = new Map(input.servers.map((server) => [server.id, server]));
  const jobs = new Map<string, DailySummaryJobRow>();

  for (const result of input.latestResults) {
    const server = serversById.get(result.server_id);
    if (!server) {
      continue;
    }
    const settings = mergeSettings(input.backupSettings, result.server_id, result.backup_name);
    const overdue = computeOverdue(
      settings,
      result.last_backup_date,
      input.generatedAt,
      input.overdueToleranceMinutes
    );
    jobs.set(jobKey(result.server_id, result.backup_name), {
      serverId: result.server_id,
      serverName: result.server_name || server.name,
      serverAlias: result.server_alias || server.alias || '',
      serverNote: result.server_note || server.note || '',
      serverUrl: result.server_url || server.server_url || '',
      backupName: result.backup_name,
      lastBackupId: result.last_backup_id,
      lastBackupDate: result.last_backup_date,
      lastBackupStatus: isBackupStatus(result.last_backup_status) ? result.last_backup_status : 'Unknown',
      durationSeconds: result.duration_seconds,
      uploadedSize: Number(result.uploaded_size) || 0,
      sourceSize: Number(result.source_size) || 0,
      storageSize: Number(result.storage_size) || 0,
      examinedFiles: Number(result.examined_files) || 0,
      warnings: Number(result.warnings) || 0,
      errors: Number(result.errors) || 0,
      isOverdue: overdue.isOverdue,
      expectedBackupDate: overdue.expectedBackupDate,
      hasReport: true,
    });
  }

  for (const [key, settings] of Object.entries(input.backupSettings)) {
    const separator = key.indexOf(':');
    if (separator <= 0) {
      continue;
    }
    const serverId = key.slice(0, separator);
    const backupName = key.slice(separator + 1);
    if (!backupName || backupName === '__default__') {
      continue;
    }
    const server = serversById.get(serverId);
    if (!server || jobs.has(key)) {
      continue;
    }
    const overdue = computeOverdue(settings, null, input.generatedAt, input.overdueToleranceMinutes);
    jobs.set(key, {
      serverId,
      serverName: server.name,
      serverAlias: server.alias || '',
      serverNote: server.note || '',
      serverUrl: server.server_url || '',
      backupName,
      lastBackupId: null,
      lastBackupDate: null,
      lastBackupStatus: null,
      durationSeconds: null,
      uploadedSize: 0,
      sourceSize: 0,
      storageSize: 0,
      examinedFiles: 0,
      warnings: 0,
      errors: 0,
      isOverdue: overdue.isOverdue,
      expectedBackupDate: overdue.expectedBackupDate,
      hasReport: false,
    });
  }

  const sorted = [...jobs.values()].sort(compareSummaryJobs);
  const representedServers = new Set(sorted.map((job) => job.serverId));

  let successCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  let fatalCount = 0;
  let unknownCount = 0;
  let noReportCount = 0;
  let overdueCount = 0;
  let latestUploadedSize = 0;
  let latestSourceSize = 0;
  let latestStorageSize = 0;
  let latestFileCount = 0;
  let totalWarnings = 0;
  let totalErrors = 0;

  for (const job of sorted) {
    const bucket = statusBucket(job);
    switch (bucket) {
      case 'Success':
        successCount += 1;
        break;
      case 'Warning':
        warningCount += 1;
        break;
      case 'Error':
        errorCount += 1;
        break;
      case 'Fatal':
        fatalCount += 1;
        break;
      case 'Unknown':
        unknownCount += 1;
        break;
      case 'No report':
        noReportCount += 1;
        break;
      default: {
        const exhaustive: never = bucket;
        throw new Error(`Unhandled status bucket: ${String(exhaustive)}`);
      }
    }
    if (job.isOverdue) {
      overdueCount += 1;
    }
    if (job.hasReport) {
      latestUploadedSize += job.uploadedSize;
      latestSourceSize += job.sourceSize;
      latestStorageSize += job.storageSize;
      latestFileCount += job.examinedFiles;
      totalWarnings += job.warnings;
      totalErrors += job.errors;
    }
  }

  return {
    generatedAt: input.generatedAt.toISOString(),
    timeZone: input.timeZone,
    summaryDate: formatLocalCalendarDate(input.generatedAt, input.timeZone),
    jobs: sorted,
    serverCount: representedServers.size,
    jobCount: sorted.length,
    successCount,
    warningCount,
    errorCount,
    fatalCount,
    unknownCount,
    noReportCount,
    overdueCount,
    latestUploadedSize,
    latestSourceSize,
    latestStorageSize,
    latestFileCount,
    totalWarnings,
    totalErrors,
    omittedJobCount: 0,
  };
}
