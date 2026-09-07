import { db, dbOps, vacuumDatabase } from '@/lib/db';
import { AuditLogger } from '@/lib/audit-logger';
import { pruneOldDeliveries } from '@/lib/daily-summary-ledger';
import {
  clearRequestCache,
  getConfigOverdueNotifications,
  getRawBackupSettingsMap,
  invalidateDataCache,
  setConfigBackupSettings,
  setConfigOverdueNotifications,
} from '@/lib/db-utils';
import { pruneConfigurationRecord } from '@/lib/orphaned-configuration';
import { pruneOrphanedBackupAndServerRows } from '@/lib/orphaned-table-rows';

export interface DatabaseCompactResult {
  backupSettingsRemoved: number;
  overdueNotificationsRemoved: number;
  dailySummaryDeliveriesRemoved: number;
  orphanedBackupsRemoved: number;
  orphanedServersRemoved: number;
  pageCountBefore: number | null;
  pageCountAfter: number | null;
  vacuumed: boolean;
}

let compactInProgress = false;

interface SummaryServerIdRow {
  id: string;
}

interface SummaryJobNameRow {
  server_id: string;
  backup_name: string;
}

function collectLiveConfigurationKeys(): {
  liveJobKeys: Set<string>;
  liveServerIds: Set<string>;
} {
  const servers = dbOps.getAllServers.all() as SummaryServerIdRow[];
  const jobs = dbOps.getServersBackupNames.all() as SummaryJobNameRow[];
  return {
    liveServerIds: new Set(servers.map((server) => server.id)),
    liveJobKeys: new Set(jobs.map((job) => `${job.server_id}:${job.backup_name}`)),
  };
}

export function pruneOrphanedNotificationConfiguration(): {
  backupSettingsRemoved: number;
  overdueNotificationsRemoved: number;
} {
  const { liveJobKeys, liveServerIds } = collectLiveConfigurationKeys();

  const backupSettings = getRawBackupSettingsMap();
  const prunedSettings = pruneConfigurationRecord(backupSettings, liveJobKeys, liveServerIds);
  if (prunedSettings.removedKeys.length > 0) {
    setConfigBackupSettings(prunedSettings.kept);
  }

  const overdueNotifications = getConfigOverdueNotifications();
  const prunedOverdue = pruneConfigurationRecord(overdueNotifications, liveJobKeys, liveServerIds);
  if (prunedOverdue.removedKeys.length > 0) {
    setConfigOverdueNotifications(prunedOverdue.kept);
  }

  return {
    backupSettingsRemoved: prunedSettings.removedKeys.length,
    overdueNotificationsRemoved: prunedOverdue.removedKeys.length,
  };
}

export async function compactDatabase(): Promise<DatabaseCompactResult> {
  if (compactInProgress) {
    throw new Error('Database compact is already running');
  }
  compactInProgress = true;

  try {
    const tableRows = pruneOrphanedBackupAndServerRows(db);
    const pruned = pruneOrphanedNotificationConfiguration();
    const dailySummaryDeliveriesRemoved = pruneOldDeliveries(db);
    invalidateDataCache();
    clearRequestCache();

    const vacuum = vacuumDatabase();
    const result: DatabaseCompactResult = {
      ...pruned,
      ...tableRows,
      dailySummaryDeliveriesRemoved,
      pageCountBefore: vacuum.pageCountBefore,
      pageCountAfter: vacuum.pageCountAfter,
      vacuumed: true,
    };

    await AuditLogger.logSystem('database_compacted', {
      trigger: 'cron',
      ...result,
    });

    return result;
  } finally {
    compactInProgress = false;
  }
}
