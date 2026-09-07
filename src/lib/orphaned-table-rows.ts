import type Database from 'better-sqlite3';

export interface OrphanedTableRowCounts {
  orphanedBackupsRemoved: number;
  orphanedServersRemoved: number;
}

export function pruneOrphanedBackupAndServerRows(database: Database.Database): OrphanedTableRowCounts {
  const run = database.transaction(() => {
    const backups = database.prepare(`
      DELETE FROM backups
      WHERE TRIM(COALESCE(server_id, '')) = ''
         OR server_id NOT IN (SELECT id FROM servers)
    `).run();

    const servers = database.prepare(`
      DELETE FROM servers
      WHERE id NOT IN (SELECT DISTINCT server_id FROM backups)
    `).run();

    return {
      orphanedBackupsRemoved: backups.changes,
      orphanedServersRemoved: servers.changes,
    };
  });

  return run();
}
