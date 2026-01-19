import { NextRequest, NextResponse } from 'next/server';
import { db, dbOps, parseDurationToSeconds } from '@/lib/db';
import { dbUtils, getConfigBackupSettings, invalidateDataCache, clearRequestCache } from '@/lib/db-utils';
import { extractAvailableBackups } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { sendBackupNotification, NotificationContext, extractLogText } from '@/lib/notifications';
import { formatDurationHuman } from '@/lib/utils';
import { formatBytes } from '@/lib/number-format';
import { BackupStatus } from '@/lib/types';
import { AuditLogger } from '@/lib/audit-logger';
import { getClientIpAddress } from '@/lib/ip-utils';
import { getDataDir } from '@/lib/paths';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Log received data in development mode
    if (process.env.NODE_ENV != 'production') {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${timestamp}.json`;
      const dataDir = getDataDir();
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

    // Validate Extra section exists
    if (!data.Extra) {
      return NextResponse.json(
        { error: 'Missing Extra section in request data' },
        { status: 400 }
      );
    }

    // Validate required fields from Extra with specific error messages
    const missingFields: string[] = [];
    
    if (!data.Extra['machine-id']) {
      missingFields.push('machine-id');
    }
    if (!data.Extra['machine-name']) {
      missingFields.push('machine-name');
    }
    if (!data.Extra['backup-name']) {
      missingFields.push('backup-name');
    }
    if (!data.Extra['backup-id']) {
      missingFields.push('backup-id');
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing required fields in Extra section: ${missingFields.join(', ')}`,
          missingFields: missingFields,
          extraSection: data.Extra
        },
        { status: 400 }
      );
    }

    // Validate Data section exists
    if (!data.Data) {
      return NextResponse.json(
        { error: 'Missing Data section in request data' },
        { status: 400 }
      );
    }

    // Validate required fields from Data with specific error messages
    const missingDataFields: string[] = [];
    
    if (!data.Data.ParsedResult) {
      missingDataFields.push('ParsedResult');
    }
    if (!data.Data.BeginTime) {
      missingDataFields.push('BeginTime');
    }
    if (!data.Data.Duration) {
      missingDataFields.push('Duration');
    }

    if (missingDataFields.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing required fields in Data section: ${missingDataFields.join(', ')}`,
          missingFields: missingDataFields,
          dataSection: data.Data
        },
        { status: 400 }
      );
    }

    // Check for duplicate backup
    const backupDate = new Date(data.Data.BeginTime).toISOString();
    const isDuplicate = await dbUtils.checkDuplicateBackup({
      server_id: data.Extra['machine-id'], // Note: Duplicati API uses 'machine-id' field name
      backup_name: data.Extra['backup-name'],
      date: backupDate
    });

    if (isDuplicate) {
      return NextResponse.json(
        { error: 'ignored, duplicated data' },
        { status: 409 }
      );
    }

    // Declare status in the outer scope so it can be used in the notification block
    let status: string = data.Data.ParsedResult;

    // Generate backup ID before transaction
    const backupId = uuidv4();

    // Get client info for audit logging
    const ipAddress = getClientIpAddress(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Start a transaction
    const transaction = db.transaction(() => {
      // Insert server information only if it doesn't exist
      dbOps.insertServerIfNotExistsWithDefaults.run({
        id: data.Extra['machine-id'], // Note: Duplicati API uses 'machine-id' field name
        name: data.Extra['machine-name'] // Note: Duplicati API uses 'machine-name' field name
      });

      // Map backup status
      status = data.Data.ParsedResult;
      if (status === "Success" && data.Data.WarningsActualLength > 0) {
        status = "Warning";
      }

      // Insert backup data with all fields
      dbOps.insertBackup.run({
        // Primary fields
        id: backupId,
        server_id: data.Extra['machine-id'], // Note: Duplicati API uses 'machine-id' field name
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
        errors_array: (() => {
          // If Errors array exists and is not empty, use it
          if (data.Data.Errors && Array.isArray(data.Data.Errors) && data.Data.Errors.length > 0) {
            return JSON.stringify(data.Data.Errors);
          }
          // If Exception exists and errors_array is null/empty, use Exception
          const exception = data.Data.Exception || data.Exception;
          if (exception && exception.trim() !== '') {
            return JSON.stringify([exception]);
          }
          return null;
        })(),
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

    // Invalidate data cache after backup insertion to ensure fresh data on next request
    // This ensures that when users refresh or auto-refresh triggers, they see the new backup
    invalidateDataCache();
    clearRequestCache();

    // Log audit entry for backup upload
    try {
      await AuditLogger.logBackupOperation(
        'backup_upload',
        null, // userId - null for external API
        null, // username - null for external API
        backupId,
        {
          server_id: data.Extra['machine-id'],
          server_name: data.Extra['machine-name'],
          backup_name: data.Extra['backup-name'],
          backup_id: data.Extra['backup-id'],
          status: status,
          date: new Date(data.Data.BeginTime).toISOString(),
          duration_seconds: parseDurationToSeconds(data.Data.Duration),
          size: data.Data.SizeOfExaminedFiles || 0,
          uploaded_size: data.Data.BackendStatistics?.BytesUploaded || 0,
          examined_files: data.Data.ExaminedFiles || 0,
          warnings: data.Data.WarningsActualLength || 0,
          errors: data.Data.ErrorsActualLength || 0,
        },
        ipAddress,
        userAgent
      );
    } catch (auditError) {
      // Log audit error but don't fail the request
      console.error('Failed to create audit log entry:', auditError instanceof Error ? auditError.message : String(auditError));
    }

    // Ensure backup settings are complete for all servers and backups
    // This will add default settings for any missing server-backup combinations
    // Ensure backup settings are complete (now handled automatically by getConfigBackupSettings)
    await getConfigBackupSettings();

    // Send notification after successful backup insertion
    try {
      const serverId = data.Extra['machine-id']; // Note: Duplicati API uses 'machine-id' field name
      const serverName = data.Extra['machine-name']; // Note: Duplicati API uses 'machine-name' field name
      const backupName = data.Extra['backup-name'];
      
      // Create backup object for notification service
      const backup = {
        id: backupId, // Use the same ID that was used in the transaction
        server_id: serverId,
        name: backupName,
        date: new Date(data.Data.BeginTime).toISOString(),
        status: status as BackupStatus,
        warnings: data.Data.WarningsActualLength || 0,
        errors: data.Data.ErrorsActualLength || 0,
        messages: data.Data.MessagesActualLength || 0,
        fileCount: data.Data.ExaminedFiles || 0,
        fileSize: data.Data.SizeOfExaminedFiles || 0,
        uploadedSize: data.Data.BackendStatistics?.BytesUploaded || 0,
        duration: formatDurationHuman(parseDurationToSeconds(data.Data.Duration)),
        duration_seconds: parseDurationToSeconds(data.Data.Duration),
        durationInMinutes: parseDurationToSeconds(data.Data.Duration) / 60,
        knownFileSize: data.Data.BackendStatistics?.KnownFileSize || 0,
        backup_list_count: data.Data.BackendStatistics?.BackupListCount || 0,
        // Populate arrays with the same logic used for database insertion
        messages_array: data.LogLines ? JSON.stringify(data.LogLines) : 
                        (data.Data.Messages ? JSON.stringify(data.Data.Messages) : null),
        warnings_array: data.Data.Warnings ? JSON.stringify(data.Data.Warnings) : null,
        errors_array: (() => {
          // If Errors array exists and is not empty, use it
          if (data.Data.Errors && Array.isArray(data.Data.Errors) && data.Data.Errors.length > 0) {
            return JSON.stringify(data.Data.Errors);
          }
          // If Exception exists and errors_array is null/empty, use Exception
          const exception = data.Data.Exception || data.Exception;
          if (exception && exception.trim() !== '') {
            return JSON.stringify([exception]);
          }
          return null;
        })(),
        available_backups: extractAvailableBackups(
          data.LogLines ? JSON.stringify(data.LogLines) : 
          (data.Data.Messages ? JSON.stringify(data.Data.Messages) : null)
        ),
      };

      // Create notification context derived from backup object to eliminate duplication
      const notificationContext: NotificationContext = {
        server_id: serverId,
        server_name: serverName,
        server_alias: '', // will be populated by the notification service
        server_note: '', // will be populated by the notification service
        server_url: '', // will be populated by the notification service
        backup_name: backup.name,
        backup_date: backup.date,
        status: backup.status,
        messages_count: backup.messages,
        warnings_count: backup.warnings,
        errors_count: backup.errors,
        duration: backup.duration,
        file_count: backup.fileCount,
        file_size: formatBytes(backup.fileSize, 'en'), // API route uses default locale
        uploaded_size: formatBytes(backup.uploadedSize, 'en'), // API route uses default locale
        storage_size: formatBytes(backup.knownFileSize, 'en'), // API route uses default locale
        available_versions: backup.backup_list_count,
        log_text: extractLogText(backup),
      };

      await sendBackupNotification(backup, serverId, serverName, notificationContext);
    } catch (notificationError) {
      // Log notification errors but don't fail the request
      console.error('Failed to send backup notification:', notificationError instanceof Error ? notificationError.message : String(notificationError));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing backup data:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to process backup data' },
      { status: 500 }
    );
  }
} 