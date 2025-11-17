import { NextRequest, NextResponse } from 'next/server';
import { dbOps, parseDurationToSeconds } from '@/lib/db';
import { dbUtils, getConfigBackupSettings, getServerInfoById } from '@/lib/db-utils';
import { extractAvailableBackups } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import https from 'https';
import http from 'http';
import { defaultAPIConfig } from '@/lib/default-config';
import { setConfiguration } from '@/lib/db-utils';
import { encryptData, getServerPassword } from '@/lib/secrets';
import { withCSRF } from '@/lib/csrf-middleware';
import { optionalAuth } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';

// Type definitions for API responses
interface SystemInfoOption {
  Name: string;
  DefaultValue: string;
}

interface SystemInfo {
  MachineName: string;
  Options?: SystemInfoOption[];
  CompressionModules?: unknown[];
  EncryptionModules?: unknown[];
  BackendModules?: unknown[];
  GenericModules?: unknown[];
  WebModules?: unknown[];
  ConnectionModules?: unknown[];
  SecretProviderModules?: unknown[];
  ServerModules?: unknown[];
  LogLevels?: unknown[];
  SupportedLocales?: unknown[];
}

interface BackupInfo {
  Backup: {
    ID: string;
    Name: string;
    TargetURL?: string;
  };
  Schedule?: {
    ID: number;
    Tags: string[];
    Time: string;
    Repeat: string;
    LastRun: string;
    Rule: string; // Changed from object to string
    AllowedDays: string[];
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

// Helper function to automatically detect the best protocol and connection options
async function detectProtocolAndConnect(
  hostname: string,
  port: number,
  password: string
): Promise<{
  baseUrl: string;
  requestOptions: RequestOptions;
  protocol: string;
}> {
  const loginEndpoint = '/api/v1/auth/login';
  const loginBody = JSON.stringify({
    Password: password,
    RememberMe: true
  });

  // Protocol attempts in order of preference
  const attempts = [
    {
      protocol: 'https',
      baseUrl: `https://${hostname}:${port}`,
      requestOptions: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        agent: new https.Agent({
          rejectUnauthorized: false // Allow self-signed certificates
        })
      }
    },
    {
      protocol: 'http',
      baseUrl: `http://${hostname}:${port}`,
      requestOptions: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    }
  ];

  const errors: string[] = [];

  for (const attempt of attempts) {
    try {
      const loginResponse = await makeRequest(`${attempt.baseUrl}${loginEndpoint}`, {
        ...attempt.requestOptions,
        method: 'POST',
        body: loginBody,
        timeout: defaultAPIConfig.requestTimeout
      });

      // If we get a response (success or authentication failure), the connection works
      if (loginResponse.ok || loginResponse.status === 401) {
        return {
          baseUrl: attempt.baseUrl,
          requestOptions: attempt.requestOptions,
          protocol: attempt.protocol
        };
      }
      
      errors.push(`${attempt.protocol.toUpperCase()}: ${loginResponse.statusText}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`${attempt.protocol.toUpperCase()}: ${errorMessage}`);
    }
  }

  // All attempts failed
  throw new Error(`Could not establish connection with any protocol. Attempts failed:\n${errors.join('\n')}`);
}

// Helper function to extract AllowedWeekDays from Rule string
function extractAllowedWeekDaysFromRule(ruleString: string): string {
  if (!ruleString) {
    return '';
  }
  
  // Parse format: "AllowedWeekDays=Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday"
  const match = ruleString.match(/AllowedWeekDays=([^,]+(?:,[^,]+)*)/);
  return match ? match[1] : '';
}

// Helper function to parse AllowedWeekDays string to number array
function parseAllowedWeekDays(allowedWeekDaysString: string): number[] {
  if (!allowedWeekDaysString) {
    return [0, 1, 2, 3, 4, 5, 6]; // Default to all days
  }
  
  // Map day names to numbers (0=Sunday, 1=Monday, etc.)
  const dayMap: Record<string, number> = {
    'Sunday': 0, 'sun': 0,
    'Monday': 1, 'mon': 1,
    'Tuesday': 2, 'tue': 2,
    'Wednesday': 3, 'wed': 3,
    'Thursday': 4, 'thu': 4,
    'Friday': 5, 'fri': 5,
    'Saturday': 6, 'sat': 6
  };
  
  // Parse the string format: "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday"
  const days = allowedWeekDaysString.split(',').map(day => day.trim());
  const dayNumbers = days.map(day => dayMap[day]).filter(num => num !== undefined);
  
  // If no valid days found, return all days
  return dayNumbers.length > 0 ? dayNumbers : [0, 1, 2, 3, 4, 5, 6];
}


// Simple in-memory lock for backup settings updates to prevent race conditions
const backupSettingsLock = new Map<string, Promise<void>>();

// Helper function to update backup settings with schedule information
async function updateBackupSettingsWithSchedule(
  serverId: string, 
  backupName: string, 
  repeatInterval: string, 
  allowedWeekDays: number[],
  scheduleTime?: string
): Promise<void> {
  const backupKey = `${serverId}:${backupName}`;
  
  // Check if there's already an update in progress for this backup
  if (backupSettingsLock.has(backupKey)) {
    // Wait for the existing update to complete
    await backupSettingsLock.get(backupKey);
  }
  
  // Create a new promise for this update
  const updatePromise = (async () => {
    try {
      // Get current backup settings
      const currentBackupSettings = await getConfigBackupSettings();
      
      // Get or create backup settings for this backup
      let backupSettings = currentBackupSettings[backupKey];
      if (!backupSettings) {
        // Import default configuration
        const { defaultBackupNotificationConfig } = await import('@/lib/default-config');
        backupSettings = { ...defaultBackupNotificationConfig };
      }
      
      // Update with schedule information
      backupSettings.expectedInterval = repeatInterval;
      backupSettings.allowedWeekDays = allowedWeekDays;
      
      // Update schedule time if provided
      if (scheduleTime) {
        backupSettings.time = scheduleTime;
      }
      
      // Update the settings
      currentBackupSettings[backupKey] = backupSettings;
      
      // Save to database
      setConfiguration('backup_settings', JSON.stringify(currentBackupSettings));
      
    } catch (error) {
      console.error(`Error updating backup settings for ${backupName}:`, error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      // Remove the lock when done
      backupSettingsLock.delete(backupKey);
    }
  })();
  
  // Store the promise in the lock map
  backupSettingsLock.set(backupKey, updatePromise);
  
  // Wait for the update to complete
  await updatePromise;
}

export const POST = withCSRF(optionalAuth(async (request: NextRequest, authContext) => {
  // Store server info for error logging
  let providedServerId: string | undefined;
  let serverNameForError: string | undefined;
  
  try {
    const requestBody = await request.json();
    const { 
      hostname, 
      port = defaultAPIConfig.duplicatiPort, 
      password, 
      serverId,
      downloadJson = false
    } = requestBody;
    
    providedServerId = serverId;

    let finalHostname: string;
    let finalPort: number;
    let finalPassword: string;

    // Handle three types of calls: hostname/port, serverID only, or serverID with updates
    if (serverId) {
      // Get server information from database
      const serverInfo = getServerInfoById(serverId);
      if (!serverInfo) {
        return NextResponse.json(
          { error: 'Server not found' },
          { status: 404 }
        );
      }

      // Check if hostname and password are provided (update case)
      if (hostname && password) {
        // Update case: use provided hostname/port/password and update database
        finalHostname = hostname;
        finalPort = port;
        finalPassword = password;
        
        // Update server URL and password in database
        // Let detectProtocolAndConnect determine the correct protocol
        await detectProtocolAndConnect(hostname, port, password);
        // Note: We'll update the server after getting the machine-id from the connection
      } else {
        // ServerID only case: get password from database
        try {
          const serverPassword = getServerPassword(serverId);
          if (!serverPassword) {
            return NextResponse.json(
              { 
                error: `No password stored for this server. Please provide hostname and password to update server credentials, or set the password in Settings.`,
                serverInfo: serverInfo
              },
              { status: 404 }
            );
          }
          finalPassword = serverPassword;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          // Check if this is a master key error
          if (errorMessage.includes('MASTER_KEY_INVALID')) {
            return NextResponse.json(
              { 
                error: 'The master key is no longer valid. All encrypted passwords and settings must be reconfigured.',
                masterKeyInvalid: true
              },
              { status: 400 }
            );
          }
          
          return NextResponse.json(
            { error: 'Failed to retrieve server password' },
            { status: 500 }
          );
        }

        // Parse server_url to extract hostname and port
        try {
          const serverUrl = new URL(serverInfo.server_url);
          finalHostname = serverUrl.hostname;
          finalPort = parseInt(serverUrl.port) || (serverUrl.protocol === 'https:' ? 443 : 80);
        } catch {
          return NextResponse.json(
            { error: 'Invalid server URL format' },
            { status: 400 }
          );
        }
      }
    } else {
      // Use provided hostname/port/password (no serverID)
      if (!hostname) {
        return NextResponse.json(
          { error: 'Hostname is required when providedServerId is not provided' },
          { status: 400 }
        );
      }

      if (!password) {
        return NextResponse.json(
          { error: 'Password is required when providedServerId is not provided' },
          { status: 400 }
        );
      }

      finalHostname = hostname;
      finalPort = port;
      finalPassword = password;
    }

    // Step 1: Auto-detect protocol and establish connection
    const { baseUrl, requestOptions } = await detectProtocolAndConnect(finalHostname, finalPort, finalPassword);
    
    const apiSysteminfoEndpoint = '/api/v1/systeminfo';
    const apiBackupsEndpoint = '/api/v1/backups';
    const apiLogBaseEndpoint = '/api/v1/backup';

    // Step 2: Get authentication token (we already validated connection in detectProtocolAndConnect)
    const loginEndpoint = '/api/v1/auth/login';
    let loginResponse;
    try {
      loginResponse = await makeRequest(`${baseUrl}${loginEndpoint}`, {
        ...requestOptions,
        method: 'POST',
        body: JSON.stringify({
          Password: finalPassword,
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

    // Check if Options array exists and log its contents
    if (!systemInfo.Options) {
      console.error('System info Options array is missing');
      throw new Error('System info Options array is missing - unable to find machine-id');
    }
   
    const detectedServerId = systemInfo.Options.find((opt) => opt.Name === 'machine-id')?.DefaultValue;
    const detectedServerName = systemInfo.MachineName;
    
    // Store server name for error logging
    serverNameForError = detectedServerName;

    // Detailed error reporting
    if (!detectedServerId) {
      console.error('Could not find machine-id in system options');
      console.error('Available option names:', systemInfo.Options.map(opt => opt.Name));
      throw new Error('Could not find machine-id in system options.');
    }
    
    if (!detectedServerName) {
      console.error('MachineName is missing from system info');
      console.error('System info structure:', Object.keys(systemInfo));
      throw new Error('MachineName is missing from system info');
    }
        
    // Check if server already exists
    const existingServer = dbOps.getServerById.get(detectedServerId) as { id: string; name: string; server_url: string; alias: string; note: string; created_at: string } | undefined;
    
    if (existingServer) {
      // Server exists - update server_url and password, preserve alias and note
      dbOps.upsertServer.run({
        id: detectedServerId,
        name: detectedServerName,
        server_url: baseUrl,
        server_password: encryptData(finalPassword),
        alias: existingServer.alias,  // Preserve existing alias
        note: existingServer.note     // Preserve existing note
      });
    } else {
      // Server doesn't exist - create new server with empty alias and note
      dbOps.upsertServer.run({
        id: detectedServerId,
        name: detectedServerName,
        server_url: baseUrl,
        server_password: encryptData(finalPassword),
        alias: '',
        note: ''
      });
      
      // Log audit event for server creation
      if (authContext) {
        const ipAddress = getClientIpAddress(request);
        const userAgent = request.headers.get('user-agent') || 'unknown';
        await AuditLogger.logServerOperation(
          'server_added',
          authContext.userId,
          authContext.username,
          detectedServerId,
          {
            serverName: detectedServerName,
            serverUrl: baseUrl,
          },
          ipAddress,
          userAgent
        );
      }
    }
    
    // Get the server information including alias from database
    const serverInfo = dbOps.getServerById.get(detectedServerId) as { id: string; name: string; server_url: string; alias: string; note: string; created_at: string } | undefined;
    const serverAlias = serverInfo?.alias || '';
    
    // Ensure backup settings are complete for all servers and backups
    // This will add default settings for any missing server-backup combinations
    // Ensure backup settings are complete (now handled automatically by getConfigBackupSettings)
    await getConfigBackupSettings();
  
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
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const collectedJsonData: Array<{
      backupId: string;
      backupName: string | undefined;
      messages: LogEntry[];
    }> = [];

    for (const backupId of backupIds) {
      // Parse schedule information and update backup settings
      const backupName = backups.find((b) => b.Backup.ID === backupId)?.Backup.Name;
      if (backupName) {
        try {
          // Get schedule information from the backup data
          const backupData = backups.find((b) => b.Backup.ID === backupId);
          if (backupData && backupData.Schedule) {
            const schedule = backupData.Schedule;
            const repeatInterval = schedule.Repeat;
            const allowedWeekDaysString = extractAllowedWeekDaysFromRule(schedule.Rule);
            const scheduleTime = schedule.Time; // Extract the schedule time

            // Convert AllowedWeekDays string to number array
            const allowedWeekDays = parseAllowedWeekDays(allowedWeekDaysString);
            
            // Update backup settings
            await updateBackupSettingsWithSchedule(serverId, backupName, repeatInterval, allowedWeekDays, scheduleTime);
          }
        } catch (error) {
          console.error(`Error updating backup settings for ${backupName}:`, error instanceof Error ? error.message : String(error));
        }
      }
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
        // receivedCount++; // Commented out as it was unused

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

        // Collect JSON data for download if requested
        if (downloadJson) {
          // Parse Message strings into proper JSON objects
          const parsedMessages = backupMessages.map((log) => {
            try {
              return {
                ...log,
                Message: JSON.parse(log.Message)
              };
            } catch (error) {
              console.error('Error parsing message for download:', error instanceof Error ? error.message : String(error));
              return {
                ...log,
                Message: log.Message // Keep as string if parsing fails
              };
            }
          });

          collectedJsonData.push({
            backupId: backupId,
            backupName: backups.find((b) => b.Backup.ID === backupId)?.Backup.Name,
            messages: parsedMessages
          });
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
            server_id: detectedServerId,
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
            server_id: detectedServerId,
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

      const responseData: {
      success: boolean;
      serverName: string;
      serverAlias: string;
      stats: {
        processed: number;
        skipped: number;
        errors: number;
      };
      backupSettings: {
        message: string;
      };
      jsonData?: string;
    } = {
      success: true,
      serverName: detectedServerName,
      serverAlias: serverAlias,
      stats: {
        processed: processedCount,
        skipped: skippedCount,
        errors: errorCount
      },
      backupSettings: {
        message: 'Backup settings completion handled automatically'
      }
    };

    // Include JSON data if download was requested
    if (downloadJson) {
       // remove sensitive data from the response 
       // keep only the beginning of TargetURL until the first ":"
       const backupsWithoutTargetURL = backups.map((backup) => {
         return {
           ...backup,
           Backup: {
             ...backup.Backup,
             TargetURL: backup.Backup.TargetURL 
               ? backup.Backup.TargetURL.split(':')[0] + ':***--REDACTED--***'
               : backup.Backup.TargetURL
           }
         };
       });

       // Filter system_info to remove unnecessary data
       const filteredSystemInfo = {
         ...systemInfo,
         Options: systemInfo.Options?.filter(option => option.Name === 'machine-id') || []
       };
       
       // Remove module arrays and other unnecessary fields
       const filteredSystemInfoTyped = filteredSystemInfo as SystemInfo;
       delete filteredSystemInfoTyped.CompressionModules;
       delete filteredSystemInfoTyped.EncryptionModules;
       delete filteredSystemInfoTyped.BackendModules;
       delete filteredSystemInfoTyped.GenericModules;
       delete filteredSystemInfoTyped.WebModules;
       delete filteredSystemInfoTyped.ConnectionModules;
       delete filteredSystemInfoTyped.SecretProviderModules;
       delete filteredSystemInfoTyped.ServerModules;
       delete filteredSystemInfoTyped.LogLevels;
       delete filteredSystemInfoTyped.SupportedLocales;

      // return the response data
      responseData.jsonData = JSON.stringify({
        system_info: filteredSystemInfoTyped,
        backups: backupsWithoutTargetURL,
        backup_logs: collectedJsonData
      }, null, 2);
    }

    // Log audit event - determine status based on results
    if (authContext) {
      const ipAddress = getClientIpAddress(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      const finalServerId = providedServerId || detectedServerId || detectedServerName;
      const hasErrors = errorCount > 0;
      const status = hasErrors ? 'error' : 'success';
      
      await AuditLogger.log({
        userId: authContext.userId,
        username: authContext.username,
        action: 'backup_collected',
        category: 'backup',
        targetType: 'backup',
        targetId: finalServerId,
        details: {
          serverName: detectedServerName,
          serverAlias,
          processed: processedCount,
          skipped: skippedCount,
          errors: errorCount,
        },
        ipAddress,
        userAgent,
        status,
        errorMessage: hasErrors ? `Collection completed with ${errorCount} error(s)` : undefined,
      });
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error collecting backups:', error instanceof Error ? error.message : String(error));
    
    // Log audit event for collection failure
    if (authContext) {
      const ipAddress = getClientIpAddress(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      const errorMessage = error instanceof Error ? error.message : 'Failed to collect backups';
      const finalServerId = providedServerId || 'unknown';
      const finalServerName = serverNameForError || 'unknown';
      
      await AuditLogger.log({
        userId: authContext.userId,
        username: authContext.username,
        action: 'backup_collected',
        category: 'backup',
        targetType: 'backup',
        targetId: finalServerId,
        details: {
          serverName: finalServerName,
          error: errorMessage,
        },
        ipAddress,
        userAgent,
        status: 'error',
        errorMessage,
      });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to collect backups' },
      { status: 500 }
    );
  }
})); 