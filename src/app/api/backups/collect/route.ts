import { NextRequest, NextResponse } from 'next/server';
import { dbOps, parseDurationToSeconds } from '@/lib/db';
import { dbUtils } from '@/lib/db-utils';
import { extractAvailableBackups } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { defaultAPIConfig } from '@/lib/default-config';

// Type definitions for API responses
interface SystemInfoOption {
  Name: string;
  DefaultValue: string;
}

interface SystemInfo {
  MachineName: string;
  Options?: SystemInfoOption[];
}

interface BackupInfo {
  Backup: {
    ID: string;
    Name: string;
  };
}

interface LogEntry {
  Message: string;
}

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  agent?: https.Agent;
}

interface RequestResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<unknown>;
}



// Helper function to make HTTP/HTTPS requests
async function makeRequest(url: string, options: RequestOptions): Promise<RequestResponse> {
  const { timeout = defaultAPIConfig.requestTimeout, ...requestOptions } = options;

  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    // kick off the request
    const req = protocol.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        clearTimeout(connectTimer);
        try {
          const parsedData = JSON.parse(data);
          const statusCode = res.statusCode ?? 500;
          resolve({
            ok: statusCode >= 200 && statusCode < 300,
            status: statusCode,
            statusText: res.statusMessage ?? 'Unknown status',
            json: async () => parsedData
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    // 1) CONNECTION‐TIMEOUT: if socket never connects within `timeout`
    const connectTimer = setTimeout(() => {
      req.destroy(new Error(`Connection timed out after ${timeout}ms`));
    }, timeout);

    // once the socket is assigned, we can also clear the connect timer on "connect"
    req.on('socket', (socket) => {
      socket.once('connect', () => clearTimeout(connectTimer));
    });

    // 2) IDLE‐TIMEOUT (what you already had)
    req.setTimeout(timeout, () => {
      req.destroy(new Error(`Idle timeout after ${timeout}ms`));
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

export async function POST(request: NextRequest) {
  try {
    const { 
      hostname, 
      port = defaultAPIConfig.duplicatiPort, 
      password, 
      protocol = defaultAPIConfig.duplicatiProtocol,
      allowSelfSigned = false
    } = await request.json();

    if (!hostname) {
      return NextResponse.json(
        { error: 'Hostname is required' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Validate protocol
    if (protocol !== 'http' && protocol !== 'https') {
      return NextResponse.json(
        { error: 'Protocol must be either "http" or "https"' },
        { status: 400 }
      );
    }

    const baseUrl = `${protocol}://${hostname}:${port}`;
    const loginEndpoint = '/api/v1/auth/login';
    const apiSysteminfoEndpoint = '/api/v1/systeminfo';
    const apiBackupsEndpoint = '/api/v1/backups';
    const apiLogBaseEndpoint = '/api/v1/backup';

    // Create request options
    const requestOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...(protocol === 'https' && {
        agent: new https.Agent({
          rejectUnauthorized: !allowSelfSigned
        })
      })
    };

    // Step 1: Login and get token
    let loginResponse;
    try {
      loginResponse = await makeRequest(`${baseUrl}${loginEndpoint}`, {
        ...requestOptions,
        method: 'POST',
        body: JSON.stringify({
          Password: password,
          RememberMe: true
        })
      });
    } catch (error) {
      console.error('Error during login request:', error instanceof Error ? error.message : String(error));
      throw new Error(`Login request failed: ${String(error)}`);
    }

    if (!loginResponse.ok) {
      console.error('Login failed:', loginResponse.statusText);
      throw new Error(`Login failed: ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json() as { AccessToken?: string };
    const authToken = loginData.AccessToken;

    if (!authToken) {
      console.error('No authentication token received');
      throw new Error('No authentication token received');
    }

    // Step 2: Get system info
    let systemInfoResponse;
    try {
      systemInfoResponse = await makeRequest(`${baseUrl}${apiSysteminfoEndpoint}`, {
        ...requestOptions,
        headers: {
          ...requestOptions.headers,
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      console.error('Error during system info request:', error instanceof Error ? error.message : String(error));
      throw new Error(`System info request failed: ${String(error)}`);
    }

    if (!systemInfoResponse.ok) {
      throw new Error(`Failed to get system info: ${systemInfoResponse.statusText}`);
    }

    const systemInfo: SystemInfo = await systemInfoResponse.json() as SystemInfo;
    const machineId = systemInfo.Options?.find((opt) => opt.Name === 'machine-id')?.DefaultValue;
    const machineName = systemInfo.MachineName;

    if (!machineId || !machineName) {
      console.error('Could not get machine information');
      throw new Error('Could not get machine information');
    }
    
    // Upsert machine information in the database
    dbOps.upsertMachine.run({
        id: machineId,
        name: machineName
      });
  
    // Step 3: Get list of backups
    let backupsResponse;
    try {
      backupsResponse = await makeRequest(`${baseUrl}${apiBackupsEndpoint}`, {
        ...requestOptions,
        headers: {
          ...requestOptions.headers,
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      console.error('Error during backups list request:', error instanceof Error ? error.message : String(error));
      throw new Error(`Backups list request failed: ${String(error)}`);
    }

    if (!backupsResponse.ok) {
      console.error('Failed to get backups list:', backupsResponse.statusText);
      throw new Error(`Failed to get backups list: ${backupsResponse.statusText}`);
    }

    const backups: BackupInfo[] = await backupsResponse.json() as BackupInfo[];
    const backupIds = backups.map((b) => b.Backup.ID);

    if (!backupIds.length) {
      return NextResponse.json({ message: 'No backups found' });
    }

    // Step 4: Process each backup
    let receivedCount = 0;
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const backupId of backupIds) {
      try {
        const logEndpoint = `${apiLogBaseEndpoint}/${backupId}/log?pagesize=999`;
        let logResponse;
        try {
          logResponse = await makeRequest(`${baseUrl}${logEndpoint}`, {
            ...requestOptions,
            headers: {
              ...requestOptions.headers,
              'Authorization': `Bearer ${authToken}`
            }
          });
        } catch (error) {
          console.error(`Error during log request for backup ${backupId}:`, error instanceof Error ? error.message : String(error));
          throw new Error(`Log request for backup ${backupId} failed: ${String(error)}`);
        }

        if (!logResponse.ok) {
          console.error(`Failed to get log for backup ${backupId}:`, logResponse.statusText);
          throw new Error(`Failed to get log for backup ${backupId}: ${logResponse.statusText}`);
        }

        // Increment the received count
        receivedCount++;

        const logs: LogEntry[] = await logResponse.json() as LogEntry[];
        const backupMessages = logs.filter((log) => {
          try {
            // Parse the Message string into JSON
            const messageObj = JSON.parse(log.Message);
            return messageObj?.MainOperation === 'Backup';
          } catch (error) {
            console.error('Error parsing log message:', error instanceof Error ? error.message : String(error));
            return false;
          }
        });

        // Log received data in development mode
        if (process.env.NODE_ENV !== 'production') {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `backup-collect-${timestamp}-${receivedCount}.json`;
          const dataDir = path.join(process.cwd(), 'data');
          const filePath = path.join(dataDir, filename);

          // Ensure data directory exists
          if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
          }

          // Write the data to file with pretty formatting
          fs.writeFileSync(filePath, JSON.stringify(backupMessages, null, 2));
          console.log(`Logged collected data to ${filePath}`);
        }


        for (const log of backupMessages) {
          // Parse the message string into JSON for each log entry, with error handling
          let message;
          try {
            message = JSON.parse(log.Message);
          } catch (parseError) {
            console.error(`Error parsing log.Message for backup ${backupId}:`, log.Message, parseError);
            errorCount++;
            continue;
          }
          const backupDate = new Date(message.BeginTime).toISOString();

          // Check for duplicate
          const backupName = backups.find((b) => b.Backup.ID === backupId)?.Backup.Name;
          if (!backupName) continue;
          
          const isDuplicate = await dbUtils.checkDuplicateBackup({
            machine_id: machineId,
            backup_name: backupName,
            date: backupDate
          });

          if (isDuplicate) {
            skippedCount++;
            continue;
          }

          // Map backup status
          let status = message.ParsedResult;
          if (status === "Success" && message.WarningsActualLength > 0) {
            status = "Warning";
          }

          // Insert backup data
          dbOps.insertBackup.run({
            id: uuidv4(),
            machine_id: machineId,
            backup_name: backupName,
            backup_id: backupId,
            date: backupDate,
            status: status,
            duration_seconds: parseDurationToSeconds(message.Duration),
            size: message.SizeOfExaminedFiles || 0,
            uploaded_size: message.BackendStatistics?.BytesUploaded || 0,
            examined_files: message.ExaminedFiles || 0,
            warnings: message.WarningsActualLength || 0,
            errors: message.ErrorsActualLength || 0,

            // Message arrays stored as JSON blobs
            messages_array: message.Messages ? JSON.stringify(message.Messages) : null,
            warnings_array: message.Warnings ? JSON.stringify(message.Warnings) : null,
            errors_array: message.Errors ? JSON.stringify(message.Errors) : null,
            available_backups: JSON.stringify(extractAvailableBackups(
              message.Messages ? JSON.stringify(message.Messages) : null
            )),

            // Data fields
            deleted_files: message.DeletedFiles || 0,
            deleted_folders: message.DeletedFolders || 0,
            modified_files: message.ModifiedFiles || 0,
            opened_files: message.OpenedFiles || 0,
            added_files: message.AddedFiles || 0,
            size_of_modified_files: message.SizeOfModifiedFiles || 0,
            size_of_added_files: message.SizeOfAddedFiles || 0,
            size_of_examined_files: message.SizeOfExaminedFiles || 0,
            size_of_opened_files: message.SizeOfOpenedFiles || 0,
            not_processed_files: message.NotProcessedFiles || 0,
            added_folders: message.AddedFolders || 0,
            too_large_files: message.TooLargeFiles || 0,
            files_with_error: message.FilesWithError || 0,
            modified_folders: message.ModifiedFolders || 0,
            modified_symlinks: message.ModifiedSymlinks || 0,
            added_symlinks: message.AddedSymlinks || 0,
            deleted_symlinks: message.DeletedSymlinks || 0,
            partial_backup: message.PartialBackup ? 1 : 0,
            dryrun: message.Dryrun ? 1 : 0,
            main_operation: message.MainOperation,
            parsed_result: message.ParsedResult,
            interrupted: message.Interrupted ? 1 : 0,
            version: message.Version,
            begin_time: new Date(message.BeginTime).toISOString(),
            end_time: new Date(message.EndTime).toISOString(),
            warnings_actual_length: message.WarningsActualLength || 0,
            errors_actual_length: message.ErrorsActualLength || 0,
            messages_actual_length: message.MessagesActualLength || 0,

            // BackendStatistics fields
            bytes_downloaded: message.BackendStatistics?.BytesDownloaded || 0,
            known_file_size: message.BackendStatistics?.KnownFileSize || 0,
            last_backup_date: message.BackendStatistics?.LastBackupDate ? new Date(message.BackendStatistics.LastBackupDate).toISOString() : null,
            backup_list_count: message.BackendStatistics?.BackupListCount || 0,
            reported_quota_error: message.BackendStatistics?.ReportedQuotaError ? 1 : 0,
            reported_quota_warning: message.BackendStatistics?.ReportedQuotaWarning ? 1 : 0,
            backend_main_operation: message.BackendStatistics?.MainOperation,
            backend_parsed_result: message.BackendStatistics?.ParsedResult,
            backend_interrupted: message.BackendStatistics?.Interrupted ? 1 : 0,
            backend_version: message.BackendStatistics?.Version,
            backend_begin_time: message.BackendStatistics?.BeginTime ? new Date(message.BackendStatistics.BeginTime).toISOString() : null,
            backend_duration: message.BackendStatistics?.Duration,
            backend_warnings_actual_length: message.BackendStatistics?.WarningsActualLength || 0,
            backend_errors_actual_length: message.BackendStatistics?.ErrorsActualLength || 0
          });

          processedCount++;
        }
      } catch (error) {
        console.error(`Error processing backup ${backupId}:`, error instanceof Error ? error.message : String(error));
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      machineName: machineName,
      stats: {
        processed: processedCount,
        skipped: skippedCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('Error collecting backups:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to collect backups' },
      { status: 500 }
    );
  }
} 