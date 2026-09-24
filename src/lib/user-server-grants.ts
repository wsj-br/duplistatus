import { dbOps } from './db';
import { setUserServerAccess } from './db-utils';

export interface UserServerGrant {
  accessAllServers: boolean;
  serverIds: string[];
}

export function readUserServerGrant(
  userId: string,
  isAdmin: boolean,
  accessAllServersFlag: number
): UserServerGrant {
  if (isAdmin || accessAllServersFlag !== 0) {
    return { accessAllServers: true, serverIds: [] };
  }
  const rows = dbOps.getUserServerIds.all(userId) as Array<{ server_id: string }>;
  return {
    accessAllServers: false,
    serverIds: rows.map((row) => row.server_id),
  };
}

export function grantsByUserId(): Map<string, string[]> {
  const rows = dbOps.getAllUserServerAssignments.all() as Array<{ user_id: string; server_id: string }>;
  const grants = new Map<string, string[]>();
  for (const row of rows) {
    const existing = grants.get(row.user_id);
    if (existing) {
      existing.push(row.server_id);
    } else {
      grants.set(row.user_id, [row.server_id]);
    }
  }
  return grants;
}

export function grantFromList(
  isAdmin: boolean,
  accessAllServersFlag: number,
  serverIds: string[]
): UserServerGrant {
  if (isAdmin || accessAllServersFlag !== 0) {
    return { accessAllServers: true, serverIds: [] };
  }
  return { accessAllServers: false, serverIds };
}

export function parseServerGrantInput(
  isAdmin: boolean,
  accessAllServers: unknown,
  serverIds: unknown
): { grant: UserServerGrant } | { error: string } {
  if (isAdmin || accessAllServers !== false) {
    return { grant: { accessAllServers: true, serverIds: [] } };
  }
  if (!Array.isArray(serverIds) || serverIds.some((id) => typeof id !== 'string' || id.trim() === '')) {
    return { error: 'serverIds must be an array of server ids' };
  }
  return { grant: { accessAllServers: false, serverIds } };
}

export function saveUserServerGrant(userId: string, grant: UserServerGrant): void {
  setUserServerAccess(userId, grant.accessAllServers, grant.serverIds);
}
