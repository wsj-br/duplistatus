import { dbOps } from './db';

export interface ServerAccess {
  unrestricted: boolean;
  serverIds: ReadonlySet<string>;
}

export interface ServerAccessUser {
  userId: string;
  isAdmin: boolean;
}

export function getServerAccess(user: ServerAccessUser): ServerAccess {
  if (user.isAdmin) {
    return { unrestricted: true, serverIds: new Set() };
  }

  const row = dbOps.getUserById.get(user.userId) as { access_all_servers?: number } | undefined;
  if (!row || row.access_all_servers !== 0) {
    return { unrestricted: true, serverIds: new Set() };
  }

  const assignments = dbOps.getUserServerIds.all(user.userId) as Array<{ server_id: string }>;
  return {
    unrestricted: false,
    serverIds: new Set(assignments.map((assignment) => assignment.server_id)),
  };
}

export function serverAllowed(access: ServerAccess, serverId: string): boolean {
  return access.unrestricted || access.serverIds.has(serverId);
}

export function filterBackupSettings<T>(
  access: ServerAccess,
  settings: Record<string, T>
): Record<string, T> {
  if (access.unrestricted) {
    return settings;
  }
  const filtered: Record<string, T> = {};
  for (const [key, value] of Object.entries(settings)) {
    const serverId = key.split(':')[0];
    if (serverId && access.serverIds.has(serverId)) {
      filtered[key] = value;
    }
  }
  return filtered;
}

export function filterByServerId<T>(
  access: ServerAccess,
  items: T[],
  idOf: (item: T) => string
): T[] {
  if (access.unrestricted) {
    return items;
  }
  return items.filter((item) => access.serverIds.has(idOf(item)));
}
