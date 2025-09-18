import { dbOps, formatDurationFromSeconds } from '@/lib/db';
import type { Backup, BackupStatus } from '@/lib/types';

interface ServerRow {
  id: string;
  name: string;
  backup_name: string;
  backup_id: string;
  created_at: string;
}

interface BackupRecord {
  id: string;
  server_id: string;
  backup_name: string;
  date: string;
  status: BackupStatus;
  warnings: number;
  errors: number;
  messages_actual_length: number;
  examined_files: number;
  size: number;
  uploaded_size: number;
  duration_seconds: number;
  known_file_size: number;
  backup_list_count: number;
  messages_array: string | null;
  warnings_array: string | null;
  errors_array: string | null;
  available_backups: string | null;
}

function mapBackupToJob(backup: BackupRecord): Backup {
  return {
    id: backup.id,
    server_id: backup.server_id,
    name: backup.backup_name,
    date: backup.date,
    status: backup.status,
    warnings: backup.warnings,
    errors: backup.errors,
    messages: backup.messages_actual_length,
    fileCount: backup.examined_files,
    fileSize: backup.size,
    uploadedSize: backup.uploaded_size,
    duration: formatDurationFromSeconds(backup.duration_seconds),
    duration_seconds: backup.duration_seconds,
    durationInMinutes: backup.duration_seconds / 60,
    knownFileSize: backup.known_file_size,
    backup_list_count: backup.backup_list_count,
    // Message arrays
    messages_array: backup.messages_array,
    warnings_array: backup.warnings_array,
    errors_array: backup.errors_array,
    available_backups: backup.available_backups ? JSON.parse(backup.available_backups) : []
  };
}

export async function GET(request: Request) {
  const { pathname } = new URL(request.url);
  const match = pathname.match(/api\/lastbackups\/([^\/]+)/);
  const serverId = match ? match[1] : undefined;

  // Always return JSON regardless of Accept header
  const jsonResponse = (data: Record<string, unknown>, status = 200) => {
    return Response.json(data, { 
      status,
      headers: {
        // Prevent caching to ensure fresh data
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        // Prevent Next.js from intercepting the response
        'X-Content-Type-Options': 'nosniff'
      }
    });
  };

  try {
    // Decode the serverId from URL encoding
    const identifier = serverId ? decodeURIComponent(serverId) : undefined;

    // First try to find server by ID
    let server = dbOps.getServerById.get(identifier) as ServerRow | null;
    
    // If not found by ID, try to find by name
    if (!server) {
      // Check for duplicate server names
      const serversWithSameName = dbOps.getAllServersByName.all(identifier) as ServerRow[];
      
      if (serversWithSameName.length > 1) {
        return jsonResponse({ 
          error: 'Multiple servers found with the same name',
          message: `Multiple servers found with name "${identifier}". Please use the server ID instead of the name. Available IDs: ${serversWithSameName.map(s => s.id).join(', ')}`,
          status: 400,
          duplicate_servers: serversWithSameName.map(s => ({ id: s.id, name: s.name }))
        }, 400);
      }
      
      server = serversWithSameName[0] || null;
    }

    if (!server) {     
      // Return JSON error response if server not found
      return jsonResponse({ 
        error: 'Server not found',
        message: `No server found with identifier: ${identifier}`,
        status: 404
      }, 404);
    }

    // Get all unique backup names for this server
    const backupNames = dbOps.getServerBackups.all(server.id) as BackupRecord[];
    const uniqueBackupNames = [...new Set(backupNames.map(b => b.backup_name))];

    // Get the latest backup for each backup job
    const latestBackups: Backup[] = [];
    for (const backupName of uniqueBackupNames) {
      const latestBackup = dbOps.getLatestBackupByName.get(server.id, backupName) as BackupRecord | undefined;
      if (latestBackup) {
        latestBackups.push(mapBackupToJob(latestBackup));
      }
    }

    return jsonResponse({
      server: {
        id: server.id,
        name: server.name,
        backup_name: server.backup_name,
        backup_id: server.backup_id,
        created_at: server.created_at
      },
      latest_backups: latestBackups,
      backup_jobs_count: latestBackups.length,
      backup_names: uniqueBackupNames,
      status: 200
    });
  } catch (error) {
    console.error('Error fetching server backup details:', error instanceof Error ? error.message : String(error));
    // Return JSON error response
    return jsonResponse({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: 500
    }, 500);
  }
}
