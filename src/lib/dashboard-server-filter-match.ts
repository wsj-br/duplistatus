import type { ServerSummary } from "@/lib/types";

/**
 * Returns true if the dashboard filter query matches this server (display fields,
 * URL, id, or any backup job name). Empty query matches everything.
 */
export function serverMatchesDashboardFilter(
  server: ServerSummary,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  if (server.name.toLowerCase().includes(q)) return true;
  if (server.alias?.toLowerCase().includes(q)) return true;
  if (server.note?.toLowerCase().includes(q)) return true;
  if (server.id.toLowerCase().includes(q)) return true;
  if (server.server_url?.toLowerCase().includes(q)) return true;

  return server.backupInfo.some((b) => b.name.toLowerCase().includes(q));
}

/**
 * Row-level match for flattened server+backup rows (server fields or this backup name).
 */
export function backupRowMatchesDashboardFilter(
  server: ServerSummary,
  backupName: string,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  if (server.name.toLowerCase().includes(q)) return true;
  if (server.alias?.toLowerCase().includes(q)) return true;
  if (server.note?.toLowerCase().includes(q)) return true;
  if (server.id.toLowerCase().includes(q)) return true;
  if (server.server_url?.toLowerCase().includes(q)) return true;
  return backupName.toLowerCase().includes(q);
}
