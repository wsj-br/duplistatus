export const SERVER_DEFAULT_BACKUP_NAME = '__default__';

export function parseConfigurationBackupKey(key: string): { serverId: string; backupName: string } | null {
  const separator = key.indexOf(':');
  if (separator <= 0) {
    return null;
  }
  const serverId = key.slice(0, separator);
  const backupName = key.slice(separator + 1);
  if (!serverId || !backupName) {
    return null;
  }
  return { serverId, backupName };
}

export function shouldKeepConfigurationBackupKey(
  key: string,
  liveJobKeys: ReadonlySet<string>,
  liveServerIds: ReadonlySet<string>
): boolean {
  const parsed = parseConfigurationBackupKey(key);
  if (!parsed) {
    return false;
  }
  if (parsed.backupName === SERVER_DEFAULT_BACKUP_NAME) {
    return liveServerIds.has(parsed.serverId);
  }
  return liveJobKeys.has(key);
}

export function pruneConfigurationRecord<T>(
  record: Record<string, T>,
  liveJobKeys: ReadonlySet<string>,
  liveServerIds: ReadonlySet<string>
): { kept: Record<string, T>; removedKeys: string[] } {
  const kept: Record<string, T> = {};
  const removedKeys: string[] = [];

  for (const [key, value] of Object.entries(record)) {
    if (shouldKeepConfigurationBackupKey(key, liveJobKeys, liveServerIds)) {
      kept[key] = value;
    } else {
      removedKeys.push(key);
    }
  }

  return { kept, removedKeys };
}
