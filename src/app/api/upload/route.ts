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
import { getClientIpAddress, getPeerIp } from '@/lib/ip-utils';
import { getDataDir } from '@/lib/paths';
import { authenticateExternalApiKey, getUploadLimitsConfig } from '@/lib/api-key-auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { readBoundedJson, RequestBodyTooLargeError } from '@/lib/request-body';

interface DuplicatiBackendStatistics {
  BytesUploaded?: number;
  BytesDownloaded?: number;
  KnownFileSize?: number;
  LastBackupDate?: string;
  BackupListCount?: number;
  ReportedQuotaError?: boolean;
  ReportedQuotaWarning?: boolean;
  MainOperation?: string;
  ParsedResult?: string;
  Interrupted?: boolean;
  Version?: string;
  BeginTime?: string;
  Duration?: string;
  WarningsActualLength?: number;
  ErrorsActualLength?: number;
}

interface DuplicatiDataSection {
  MainOperation?: string;
  ParsedResult?: BackupStatus;
  BeginTime?: string;
  Duration?: string;
  EndTime?: string;
  Version?: string;
  Interrupted?: boolean;
  PartialBackup?: boolean;
  Dryrun?: boolean;
  Warnings?: unknown;
  Errors?: unknown;
  Messages?: unknown;
  Exception?: string;
  WarningsActualLength?: number;
  ErrorsActualLength?: number;
  MessagesActualLength?: number;
  SizeOfExaminedFiles?: number;
  ExaminedFiles?: number;
  DeletedFiles?: number;
  DeletedFolders?: number;
  ModifiedFiles?: number;
  OpenedFiles?: number;
  AddedFiles?: number;
  SizeOfModifiedFiles?: number;
  SizeOfAddedFiles?: number;
  SizeOfOpenedFiles?: number;
  NotProcessedFiles?: number;
  AddedFolders?: number;
  TooLargeFiles?: number;
  FilesWithError?: number;
  ModifiedFolders?: number;
  ModifiedSymlinks?: number;
  AddedSymlinks?: number;
  DeletedSymlinks?: number;
  BackendStatistics?: DuplicatiBackendStatistics;
}

interface DuplicatiUploadPayload {
  Extra?: Record<string, string>;
  Data?: DuplicatiDataSection;
  LogLines?: unknown;
  Exception?: string;
}

export async function POST(request: NextRequest) {
  try {
    const limits = getUploadLimitsConfig();
    const peerIp = getPeerIp(request) || getClientIpAddress(request) || 'unknown';

    if (limits.enabled) {
      const limit = checkRateLimit(`upload:${peerIp}`, limits.perMinute, limits.perHour);
      if (!limit.allowed) {
        return NextResponse.json(
          { error: 'Too many upload requests', errorCode: 'UPLOAD_RATE_LIMITED', retryAfter: limit.retryAfterSeconds },
          { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
        );
      }
    }

    let data: DuplicatiUploadPayload;
    try {
      data = await readBoundedJson(request, limits.maxBytes) as DuplicatiUploadPayload;
    } catch (error) {
      if (error instanceof RequestBodyTooLargeError) {
        return NextResponse.json(
          { error: 'Upload payload is too large', errorCode: 'UPLOAD_TOO_LARGE', maxBytes: error.maxBytes },
          { status: 413 }
        );
      }
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { error: 'Invalid JSON', errorCode: 'INVALID_JSON' },
          { status: 400 }
        );
      }
      throw error;
    }

    const extra = data.Extra && typeof data.Extra === 'object' ? data.Extra : null;
    const keyAuth = await authenticateExternalApiKey(request, 'upload', extra);
    if (!keyAuth.ok) {
      return keyAuth.response;
    }

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

    const extraFields = data.Extra;
    const report = data.Data;
    const beginTime = report.BeginTime;
    const duration = report.Duration;
    const parsedResult = report.ParsedResult;
    if (!beginTime || !duration || !parsedResult) {
      return NextResponse.json(
        { error: 'Missing required fields in Extra or Data sections' },
        { status: 400 }
      );
    }

    // Check for duplicate backup
    const backupDate = new Date(beginTime).toISOString();
    const isDuplicate = await dbUtils.checkDuplicateBackup({
      server_id: extraFields['machine-id'], // Note: Duplicati API uses 'machine-id' field name
      backup_name: extraFields['backup-name'],
      date: backupDate
    });

    if (isDuplicate) {
      return NextResponse.json(
        { error: 'ignored, duplicated data' },
        { status: 409 }
      );
    }

    // Declare status in the outer scope so it can be used in the notification block
    let status: string = parsedResult;

    // Generate backup ID before transaction
    const backupId = uuidv4();

    // Get client info for audit logging
    const ipAddress = getClientIpAddress(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Start a transaction
    const transaction = db.transaction(() => {
      // Insert server information only if it doesn't exist
      dbOps.insertServerIfNotExistsWithDefaults.run({
        id: extraFields['machine-id'], // Note: Duplicati API uses 'machine-id' field name
        name: extraFields['machine-name'] // Note: Duplicati API uses 'machine-name' field name
      });

      // Map backup status
      status = parsedResult;
      if (status === "Success" && (report.WarningsActualLength ?? 0) > 0) {
        status = "Warning";
      }

      // Insert backup data with all fields
      dbOps.insertBackup.run({
        // Primary fields
        id: backupId,
        server_id: extraFields['machine-id'], // Note: Duplicati API uses 'machine-id' field name
        backup_name: extraFields['backup-name'],
        backup_id: extraFields['backup-id'],
        date: new Date(beginTime).toISOString(),
        status: status,
        duration_seconds: parseDurationToSeconds(duration),
        size: report.SizeOfExaminedFiles || 0,
        uploaded_size: report.BackendStatistics?.BytesUploaded || 0,
        examined_files: report.ExaminedFiles || 0,
        warnings: report.WarningsActualLength || 0,
        errors: report.ErrorsActualLength || 0,

        // Message arrays stored as JSON blobs
        messages_array:  data.LogLines ? JSON.stringify(data.LogLines) : // look for LogLines or Data.Messages
                        (report.Messages ? JSON.stringify(report.Messages) : null), 
        warnings_array: report.Warnings ? JSON.stringify(report.Warnings) : null,
        errors_array: (() => {
          // If Errors array exists and is not empty, use it
          if (report.Errors && Array.isArray(report.Errors) && report.Errors.length > 0) {
            return JSON.stringify(report.Errors);
          }
          // If Exception exists and errors_array is null/empty, use Exception
          const exception = report.Exception || data.Exception;
          if (exception && exception.trim() !== '') {
            return JSON.stringify([exception]);
          }
          return null;
        })(),
        available_backups: JSON.stringify(extractAvailableBackups(
          data.LogLines ? JSON.stringify(data.LogLines) : 
          (report.Messages ? JSON.stringify(report.Messages) : null)
        )),

        // Data fields
        deleted_files: report.DeletedFiles || 0,
        deleted_folders: report.DeletedFolders || 0,
        modified_files: report.ModifiedFiles || 0,
        opened_files: report.OpenedFiles || 0,
        added_files: report.AddedFiles || 0,
        size_of_modified_files: report.SizeOfModifiedFiles || 0,
        size_of_added_files: report.SizeOfAddedFiles || 0,
        size_of_examined_files: report.SizeOfExaminedFiles || 0,
        size_of_opened_files: report.SizeOfOpenedFiles || 0,
        not_processed_files: report.NotProcessedFiles || 0,
        added_folders: report.AddedFolders || 0,
        too_large_files: report.TooLargeFiles || 0,
        files_with_error: report.FilesWithError || 0,
        modified_folders: report.ModifiedFolders || 0,
        modified_symlinks: report.ModifiedSymlinks || 0,
        added_symlinks: report.AddedSymlinks || 0,
        deleted_symlinks: report.DeletedSymlinks || 0,
        partial_backup: report.PartialBackup ? 1 : 0,
        dryrun: report.Dryrun ? 1 : 0,
        main_operation: report.MainOperation,
        parsed_result: parsedResult,
        interrupted: report.Interrupted ? 1 : 0,
        version: report.Version,
        begin_time: new Date(beginTime).toISOString(),
        end_time: new Date(report.EndTime ?? beginTime).toISOString(),
        warnings_actual_length: report.WarningsActualLength || 0,
        errors_actual_length: report.ErrorsActualLength || 0,
        messages_actual_length: report.MessagesActualLength || 0,

        // BackendStatistics fields
        bytes_downloaded: report.BackendStatistics?.BytesDownloaded || 0,
        known_file_size: report.BackendStatistics?.KnownFileSize || 0,
        last_backup_date: report.BackendStatistics?.LastBackupDate ? new Date(report.BackendStatistics.LastBackupDate).toISOString() : null,
        backup_list_count: report.BackendStatistics?.BackupListCount || 0,
        reported_quota_error: report.BackendStatistics?.ReportedQuotaError ? 1 : 0,
        reported_quota_warning: report.BackendStatistics?.ReportedQuotaWarning ? 1 : 0,
        backend_main_operation: report.BackendStatistics?.MainOperation,
        backend_parsed_result: report.BackendStatistics?.ParsedResult,
        backend_interrupted: report.BackendStatistics?.Interrupted ? 1 : 0,
        backend_version: report.BackendStatistics?.Version,
        backend_begin_time: report.BackendStatistics?.BeginTime ? new Date(report.BackendStatistics.BeginTime).toISOString() : null,
        backend_duration: report.BackendStatistics?.Duration,
        backend_warnings_actual_length: report.BackendStatistics?.WarningsActualLength || 0,
        backend_errors_actual_length: report.BackendStatistics?.ErrorsActualLength || 0
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
          server_id: extraFields['machine-id'],
          server_name: extraFields['machine-name'],
          backup_name: extraFields['backup-name'],
          backup_id: extraFields['backup-id'],
          status: status,
          date: new Date(beginTime).toISOString(),
          duration_seconds: parseDurationToSeconds(duration),
          size: report.SizeOfExaminedFiles || 0,
          uploaded_size: report.BackendStatistics?.BytesUploaded || 0,
          examined_files: report.ExaminedFiles || 0,
          warnings: report.WarningsActualLength || 0,
          errors: report.ErrorsActualLength || 0,
          keyFingerprint: keyAuth.fingerprint,
          keyId: keyAuth.key?.id ?? null,
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
      const serverId = extraFields['machine-id']; // Note: Duplicati API uses 'machine-id' field name
      const serverName = extraFields['machine-name']; // Note: Duplicati API uses 'machine-name' field name
      const backupName = extraFields['backup-name'];
      
      // Create backup object for notification service
      const backup = {
        id: backupId, // Use the same ID that was used in the transaction
        server_id: serverId,
        name: backupName,
        date: new Date(beginTime).toISOString(),
        status: status as BackupStatus,
        warnings: report.WarningsActualLength || 0,
        errors: report.ErrorsActualLength || 0,
        messages: report.MessagesActualLength || 0,
        fileCount: report.ExaminedFiles || 0,
        fileSize: report.SizeOfExaminedFiles || 0,
        uploadedSize: report.BackendStatistics?.BytesUploaded || 0,
        duration: formatDurationHuman(parseDurationToSeconds(duration)),
        duration_seconds: parseDurationToSeconds(duration),
        durationInMinutes: parseDurationToSeconds(duration) / 60,
        knownFileSize: report.BackendStatistics?.KnownFileSize || 0,
        backup_list_count: report.BackendStatistics?.BackupListCount || 0,
        // Populate arrays with the same logic used for database insertion
        messages_array: data.LogLines ? JSON.stringify(data.LogLines) : 
                        (report.Messages ? JSON.stringify(report.Messages) : null),
        warnings_array: report.Warnings ? JSON.stringify(report.Warnings) : null,
        errors_array: (() => {
          // If Errors array exists and is not empty, use it
          if (report.Errors && Array.isArray(report.Errors) && report.Errors.length > 0) {
            return JSON.stringify(report.Errors);
          }
          // If Exception exists and errors_array is null/empty, use Exception
          const exception = report.Exception || data.Exception;
          if (exception && exception.trim() !== '') {
            return JSON.stringify([exception]);
          }
          return null;
        })(),
        available_backups: extractAvailableBackups(
          data.LogLines ? JSON.stringify(data.LogLines) : 
          (report.Messages ? JSON.stringify(report.Messages) : null)
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
        file_size: backup.fileSize, // pass raw number, will be formatted with locale in notification
        uploaded_size: backup.uploadedSize, // pass raw number
        storage_size: backup.knownFileSize, // pass raw number
        available_versions: backup.backup_list_count || 0,
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