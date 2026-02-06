import { NextRequest, NextResponse } from 'next/server';
import { getConfigBackupSettings, getServerInfoById, setConfiguration } from '@/lib/db-utils';
import { defaultAPIConfig } from '@/lib/default-config';
import { getServerPassword } from '@/lib/secrets';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAuth } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';
import https from 'https';
import http from 'http';

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
    Rule: string;
    AllowedDays: string[];
  };
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
  scheduleTime?: string,
  lastRunTime?: string
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
      
      // Update schedule time (Schedule.Time - next scheduled run)
      if (scheduleTime) {
        backupSettings.time = scheduleTime;
      }
      
      // Update last backup date (Schedule.LastRun - last successful backup)
      if (lastRunTime) {
        backupSettings.lastBackupDate = lastRunTime;
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

export const POST = withCSRF(requireAuth(async (request: NextRequest, authContext) => {
  // Store server info for error logging
  let providedServerId: string | undefined;
  let serverNameForError: string | undefined;
  
  try {
    const requestBody = await request.json();
    const { 
      hostname, 
      port = defaultAPIConfig.duplicatiPort, 
      password, 
      serverId
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
        
        // Let detectProtocolAndConnect determine the correct protocol
        await detectProtocolAndConnect(hostname, port, password);
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
          { error: 'Hostname is required when serverId is not provided' },
          { status: 400 }
        );
      }

      if (!password) {
        return NextResponse.json(
          { error: 'Password is required when serverId is not provided' },
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

    // Step 3: Get system info to detect server ID
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

    // Check if Options array exists
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
    
    // Use detectedServerId for schedule updates
    const serverIdForSchedule = providedServerId || detectedServerId;
    
    // Ensure backup settings are complete for all servers and backups
    await getConfigBackupSettings();

    // Step 4: Get list of backups
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

    if (!backups.length) {
      return NextResponse.json({ 
        success: true,
        message: 'No backups found',
        serverName: detectedServerName,
        stats: {
          processed: 0,
          errors: 0
        }
      });
    }

    // Step 5: Process each backup to sync schedule information
    let processedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const backup of backups) {
      const backupId = backup.Backup.ID;
      const backupName = backup.Backup.Name;
      
      if (!backupName) {
        console.warn(`Backup ${backupId} has no name, skipping`);
        continue;
      }

      try {
        // Get schedule information from the backup data
        if (backup.Schedule) {
          const schedule = backup.Schedule;
          const repeatInterval = schedule.Repeat;
          const allowedWeekDaysString = extractAllowedWeekDaysFromRule(schedule.Rule);
          const scheduleTime = schedule.Time; // Extract the next scheduled run time
          const lastRunTime = schedule.LastRun; // Extract the last successful backup time

          // Convert AllowedWeekDays string to number array
          const allowedWeekDays = parseAllowedWeekDays(allowedWeekDaysString);
          
          // Update backup settings with schedule info including lastRunTime
          await updateBackupSettingsWithSchedule(
            serverIdForSchedule,
            backupName,
            repeatInterval,
            allowedWeekDays,
            scheduleTime,
            lastRunTime
          );
          
          processedCount++;
        } else {
          console.warn(`Backup ${backupName} has no schedule information`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error updating backup settings for ${backupName}:`, errorMessage);
        errorCount++;
        errors.push(`${backupName}: ${errorMessage}`);
      }
    }

    const responseData: {
      success: boolean;
      serverName: string;
      stats: {
        processed: number;
        errors: number;
      };
      errors?: string[];
    } = {
      success: true,
      serverName: detectedServerName,
      stats: {
        processed: processedCount,
        errors: errorCount
      }
    };

    if (errors.length > 0) {
      responseData.errors = errors;
    }

    // Log audit event
    const ipAddress = getClientIpAddress(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const finalServerId = providedServerId || detectedServerId || detectedServerName;
    const hasErrors = errorCount > 0;
    const status = hasErrors ? 'error' : 'success';
    
    await AuditLogger.log({
      userId: authContext.userId,
      username: authContext.username,
      action: 'backup_schedule_synced',
      category: 'backup',
      targetType: 'backup',
      targetId: finalServerId,
      details: {
        serverName: detectedServerName,
        processed: processedCount,
        errors: errorCount,
      },
      ipAddress,
      userAgent,
      status,
      errorMessage: hasErrors ? `Schedule sync completed with ${errorCount} error(s)` : undefined,
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error syncing backup schedules:', error instanceof Error ? error.message : String(error));
    
    // Log audit event for sync failure
    const ipAddress = getClientIpAddress(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const errorMessage = error instanceof Error ? error.message : 'Failed to sync backup schedules';
    const finalServerId = providedServerId || 'unknown';
    const finalServerName = serverNameForError || 'unknown';
    
    await AuditLogger.log({
      userId: authContext.userId,
      username: authContext.username,
      action: 'backup_schedule_synced',
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
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync backup schedules' },
      { status: 500 }
    );
  }
}));
