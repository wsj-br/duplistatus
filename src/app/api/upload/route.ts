import { NextRequest, NextResponse } from 'next/server';
import { db, dbOps, parseDurationToSeconds } from '@/lib/db';
import { dbUtils } from '@/lib/db-utils';
import { extractAvailableBackups } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Log received data in development mode
    if (process.env.NODE_ENV != 'production') {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${timestamp}.json`;
      const dataDir = path.join(process.cwd(), 'data');
      const filePath = path.join(dataDir, filename);
      
      // Ensure data directory exists
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // Write the data to file with pretty formatting
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Logged request data to ${filePath}`);
    }

    // Only process if MainOperation is "Backup"
    if (data.Data?.MainOperation !== "Backup") {
      return NextResponse.json(
        { error: 'Only backup operations are supported' },
        { status: 400 }
      );
    }

    // Validate required fields from Extra
    if (!data.Extra?.['machine-id'] || !data.Extra['machine-name'] || !data.Extra['backup-name'] || !data.Extra['backup-id']) {
      return NextResponse.json(
        { error: 'Missing required machine or backup information' },
        { status: 400 }
      );
    }

    // Validate required fields from Data
    if (!data.Data?.ParsedResult || !data.Data?.BeginTime || !data.Data?.Duration) {
      return NextResponse.json(
        { error: 'Missing required backup data' },
        { status: 400 }
      );
    }

    // Check for duplicate backup
    const backupDate = new Date(data.Data.BeginTime).toISOString();
    const isDuplicate = await dbUtils.checkDuplicateBackup({
      machine_id: data.Extra['machine-id'],
      backup_name: data.Extra['backup-name'],
      date: backupDate
    });

    if (isDuplicate) {
      return NextResponse.json(
        { error: 'ignored, duplicated data' },
        { status: 409 }
      );
    }

    // Start a transaction
    const transaction = db.transaction(() => {
      // Upsert machine information (only basic info now)
      dbOps.upsertMachine.run({
        id: data.Extra['machine-id'],
        name: data.Extra['machine-name']
      });

      // Map backup status
      let status = data.Data.ParsedResult;
      if (status === "Success" && data.Data.WarningsActualLength > 0) {
        status = "Warning";
      }

      // Insert backup data with all fields
      dbOps.insertBackup.run({
        // Primary fields
        id: uuidv4(),
        machine_id: data.Extra['machine-id'],
        backup_name: data.Extra['backup-name'],
        backup_id: data.Extra['backup-id'],
        date: new Date(data.Data.BeginTime).toISOString(),
        status: status,
        duration_seconds: parseDurationToSeconds(data.Data.Duration),
        size: data.Data.SizeOfExaminedFiles || 0,
        uploaded_size: data.Data.BackendStatistics?.BytesUploaded || 0,
        examined_files: data.Data.ExaminedFiles || 0,
        warnings: data.Data.WarningsActualLength || 0,
        errors: data.Data.ErrorsActualLength || 0,

        // Message arrays stored as JSON blobs
        messages_array:  data.LogLines ? JSON.stringify(data.LogLines) : // look for LogLines or Data.Messages
                        (data.Data.Messages ? JSON.stringify(data.Data.Messages) : null), 
        warnings_array: data.Data.Warnings ? JSON.stringify(data.Data.Warnings) : null,
        errors_array: data.Data.Errors ? JSON.stringify(data.Data.Errors) : null,
        available_backups: JSON.stringify(extractAvailableBackups(
          data.LogLines ? JSON.stringify(data.LogLines) : 
          (data.Data.Messages ? JSON.stringify(data.Data.Messages) : null)
        )),

        // Data fields
        deleted_files: data.Data.DeletedFiles || 0,
        deleted_folders: data.Data.DeletedFolders || 0,
        modified_files: data.Data.ModifiedFiles || 0,
        opened_files: data.Data.OpenedFiles || 0,
        added_files: data.Data.AddedFiles || 0,
        size_of_modified_files: data.Data.SizeOfModifiedFiles || 0,
        size_of_added_files: data.Data.SizeOfAddedFiles || 0,
        size_of_examined_files: data.Data.SizeOfExaminedFiles || 0,
        size_of_opened_files: data.Data.SizeOfOpenedFiles || 0,
        not_processed_files: data.Data.NotProcessedFiles || 0,
        added_folders: data.Data.AddedFolders || 0,
        too_large_files: data.Data.TooLargeFiles || 0,
        files_with_error: data.Data.FilesWithError || 0,
        modified_folders: data.Data.ModifiedFolders || 0,
        modified_symlinks: data.Data.ModifiedSymlinks || 0,
        added_symlinks: data.Data.AddedSymlinks || 0,
        deleted_symlinks: data.Data.DeletedSymlinks || 0,
        partial_backup: data.Data.PartialBackup ? 1 : 0,
        dryrun: data.Data.Dryrun ? 1 : 0,
        main_operation: data.Data.MainOperation,
        parsed_result: data.Data.ParsedResult,
        interrupted: data.Data.Interrupted ? 1 : 0,
        version: data.Data.Version,
        begin_time: new Date(data.Data.BeginTime).toISOString(),
        end_time: new Date(data.Data.EndTime).toISOString(),
        warnings_actual_length: data.Data.WarningsActualLength || 0,
        errors_actual_length: data.Data.ErrorsActualLength || 0,
        messages_actual_length: data.Data.MessagesActualLength || 0,

        // BackendStatistics fields
        bytes_downloaded: data.Data.BackendStatistics?.BytesDownloaded || 0,
        known_file_size: data.Data.BackendStatistics?.KnownFileSize || 0,
        last_backup_date: data.Data.BackendStatistics?.LastBackupDate ? new Date(data.Data.BackendStatistics.LastBackupDate).toISOString() : null,
        backup_list_count: data.Data.BackendStatistics?.BackupListCount || 0,
        reported_quota_error: data.Data.BackendStatistics?.ReportedQuotaError ? 1 : 0,
        reported_quota_warning: data.Data.BackendStatistics?.ReportedQuotaWarning ? 1 : 0,
        backend_main_operation: data.Data.BackendStatistics?.MainOperation,
        backend_parsed_result: data.Data.BackendStatistics?.ParsedResult,
        backend_interrupted: data.Data.BackendStatistics?.Interrupted ? 1 : 0,
        backend_version: data.Data.BackendStatistics?.Version,
        backend_begin_time: data.Data.BackendStatistics?.BeginTime ? new Date(data.Data.BackendStatistics.BeginTime).toISOString() : null,
        backend_duration: data.Data.BackendStatistics?.Duration,
        backend_warnings_actual_length: data.Data.BackendStatistics?.WarningsActualLength || 0,
        backend_errors_actual_length: data.Data.BackendStatistics?.ErrorsActualLength || 0
      });
    });

    // Execute the transaction
    transaction();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing backup data:', error);
    return NextResponse.json(
      { error: 'Failed to process backup data' },
      { status: 500 }
    );
  }
} 