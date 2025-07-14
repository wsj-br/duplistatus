import { dbOps, formatDurationFromSeconds } from '@/lib/db';
import type { Backup, BackupStatus } from '@/lib/types';

interface MachineRow {
  id: string;
  name: string;
  backup_name: string;
  backup_id: string;
  created_at: string;
}

interface BackupRecord {
  id: string;
  machine_id: string;
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

function mapBackupToType(backup: BackupRecord): Backup {
  return {
    id: backup.id,
    machine_id: backup.machine_id,
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
  const match = pathname.match(/api\/lastbackup\/([^\/]+)/);
  const machineId = match ? match[1] : undefined;

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
    // Decode the machineId from URL encoding
    const identifier = machineId ? decodeURIComponent(machineId) : undefined;

    // First try to find machine by ID
    let machine = dbOps.getMachine.get(identifier) as MachineRow | null;
    
    // If not found by ID, try to find by name
    if (!machine) {
      machine = dbOps.getMachineByName.get(identifier) as MachineRow | null;
    }

    if (!machine) {     
      // Return JSON error response if machine not found
      return jsonResponse({ 
        error: 'Machine not found',
        message: `No machine found with identifier: ${identifier}`,
        status: 404
      }, 404);
    }

    // Get latest backup
    const latestBackup = dbOps.getLatestBackup.get(machine.id) as BackupRecord | undefined;
    if (!latestBackup) {
      return jsonResponse({
        machine: {
          id: machine.id,
          name: machine.name,
          backup_name: machine.backup_name,
          backup_id: machine.backup_id,
          created_at: machine.created_at
        },
        latest_backup: null,
        status: 200
      });
    }

    return jsonResponse({
      machine: {
        id: machine.id,
        name: machine.name,
        backup_name: machine.backup_name,
        backup_id: machine.backup_id,
        created_at: machine.created_at
      },
      latest_backup: mapBackupToType(latestBackup),
      status: 200
    });
  } catch (error) {
    console.error('Error fetching machine details:', error);
    // Return JSON error response
    return jsonResponse({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      status: 500
    }, 500);
  }
} 