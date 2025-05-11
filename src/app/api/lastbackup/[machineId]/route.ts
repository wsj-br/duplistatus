import { NextRequest, NextResponse } from 'next/server';
import { dbOps } from '@/lib/db';
import type { Machine, Backup } from '@/lib/types';

interface MachineRow {
  id: string;
  name: string;
  backup_name: string;
  backup_id: string;
  created_at: string;
}

function mapBackupToType(backup: any): Backup {
  return {
    id: backup.id,
    name: `Backup ${backup.id}`,
    date: backup.date,
    status: backup.status,
    warnings: backup.warnings,
    errors: backup.errors,
    fileCount: backup.examined_files,
    fileSize: backup.size,
    uploadedSize: backup.uploaded_size,
    duration: backup.duration_seconds,
    durationInMinutes: Math.floor(backup.duration_seconds / 60),
    knownFileSize: backup.known_file_size
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { machineId: string } }
) {
  // Always return JSON regardless of Accept header
  const jsonResponse = (data: any, status = 200) => {
    return new NextResponse(
      JSON.stringify(data),
      { 
        status,
        headers: {
          'Content-Type': 'application/json',
          // Prevent caching to ensure fresh data
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          // Prevent Next.js from intercepting the response
          'X-Content-Type-Options': 'nosniff'
        }
      }
    );
  };

  try {
    const identifier = params.machineId;

    // First try to find machine by ID
    let machine = dbOps.getMachine.get(identifier) as MachineRow | null;
    
    // If not found by ID, try to find by name
    if (!machine) {
      machine = dbOps.getMachineByName.get(identifier) as MachineRow | null;
    }

    if (!machine) {
      // Return JSON error response
      return jsonResponse({ 
        error: 'Machine not found',
        message: `No machine found with identifier: ${identifier}`,
        status: 404
      }, 404);
    }

    // Get latest backup
    const latestBackup = dbOps.getLatestBackup.get(machine.id);
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

    // Get all backups for the machine
    const backups = dbOps.getMachineBackups.all(machine.id);

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