import { dbOps, ensureDatabaseInitialized } from './db';

// Audit log categories
export type AuditCategory = 'auth' | 'user' | 'config' | 'backup' | 'server' | 'system';

// Audit log status
export type AuditStatus = 'success' | 'failure' | 'error';

// Audit log entry interface
export interface AuditLogEntry {
  userId?: string | null;
  username?: string | null;
  action: string;
  category: AuditCategory;
  targetType?: string | null;
  targetId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status: AuditStatus;
  errorMessage?: string | null;
}

// Audit log filter options
export interface AuditLogFilter {
  startDate?: string;
  endDate?: string;
  userId?: string;
  username?: string;
  action?: string;
  category?: AuditCategory;
  status?: AuditStatus;
  limit?: number;
  offset?: number;
}

// Audit log query result
export interface AuditLogResult {
  id: number;
  timestamp: string;
  userId: string | null;
  username: string | null;
  action: string;
  category: string;
  targetType: string | null;
  targetId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  status: string;
  errorMessage: string | null;
}

// Audit log statistics
export interface AuditLogStats {
  totalEvents: number;
  successCount: number;
  failureCount: number;
  errorCount: number;
}

/**
 * Audit Logger class for tracking all system changes and user actions
 */
export class AuditLogger {
  /**
   * Log an event to the audit log
   * @param entry - The audit log entry to write
   */
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      // Ensure database is ready
      await ensureDatabaseInitialized();

      // Sanitize details (remove sensitive data)
      const sanitizedDetails = entry.details ? this.sanitizeDetails(entry.details) : null;

      // Insert audit log entry
      const ipToStore = entry.ipAddress || null;
      console.log(`[AuditLogger] Inserting audit log: ${entry.action} (${entry.category}) - ${entry.username || 'system'}`);
      
      dbOps.insertAuditLog.run(
        entry.userId || null,
        entry.username || null,
        entry.action,
        entry.category,
        entry.targetType || null,
        entry.targetId || null,
        sanitizedDetails ? JSON.stringify(sanitizedDetails) : null,
        ipToStore,
        entry.userAgent || null,
        entry.status,
        entry.errorMessage || null
      );
    } catch (error) {
      // Log error but don't throw - audit logging should not break app functionality
      console.error('[AuditLogger] Failed to write audit log:', error);
    }
  }

  /**
   * Log authentication-related events
   */
  static async logAuth(
    action: string,
    userId: string | null,
    username: string | null,
    success: boolean,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
    errorMessage?: string
  ): Promise<void> {
    await this.log({
      userId,
      username,
      action,
      category: 'auth',
      details,
      ipAddress,
      userAgent,
      status: success ? 'success' : 'failure',
      errorMessage,
    });
  }

  /**
   * Log user management events
   */
  static async logUserManagement(
    action: string,
    actorId: string,
    actorUsername: string,
    targetId: string,
    targetUsername: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId: actorId,
      username: actorUsername,
      action,
      category: 'user',
      targetType: 'user',
      targetId,
      details: { ...details, targetUsername },
      ipAddress,
      userAgent,
      status: 'success',
    });
  }

  /**
   * Log configuration change events
   */
  static async logConfigChange(
    action: string,
    userId: string | null,
    username: string | null,
    configKey: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      username,
      action,
      category: 'config',
      targetType: 'configuration',
      targetId: configKey,
      details,
      ipAddress,
      userAgent,
      status: 'success',
    });
  }

  /**
   * Log backup operation events
   */
  static async logBackupOperation(
    action: string,
    userId: string | null,
    username: string | null,
    backupId: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      username,
      action,
      category: 'backup',
      targetType: 'backup',
      targetId: backupId,
      details,
      ipAddress,
      userAgent,
      status: 'success',
    });
  }

  /**
   * Log server management events
   */
  static async logServerOperation(
    action: string,
    userId: string | null,
    username: string | null,
    serverId: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      username,
      action,
      category: 'server',
      targetType: 'server',
      targetId: serverId,
      details,
      ipAddress,
      userAgent,
      status: 'success',
    });
  }

  /**
   * Log system events
   */
  static async logSystem(
    action: string,
    details?: Record<string, unknown>,
    status: AuditStatus = 'success',
    errorMessage?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      username: 'system',
      action,
      category: 'system',
      details,
      status,
      errorMessage,
      userAgent,
    });
  }

  /**
   * Query audit logs with filters
   */
  static async query(filter: AuditLogFilter = {}): Promise<{
    logs: AuditLogResult[];
    total: number;
  }> {
    try {
      await ensureDatabaseInitialized();

      const limit = filter.limit || 50;
      const offset = filter.offset || 0;

      // Build filter parameters
      const filterParams = {
        startDate: filter.startDate || null,
        endDate: filter.endDate || null,
        userId: filter.userId || null,
        username: filter.username || null,
        action: filter.action || null,
        category: filter.category || null,
        status: filter.status || null,
        limit,
        offset,
      };

      // Get logs
      const logs = dbOps.getAuditLogsFiltered.all(filterParams) as AuditLogResult[];

      // Get total count
      const countResult = dbOps.countAuditLogsFiltered.get(filterParams) as { count: number };
      const total = countResult.count;

      return { logs, total };
    } catch (error) {
      console.error('[AuditLogger] Failed to query audit logs:', error);
      return { logs: [], total: 0 };
    }
  }

  /**
   * Get audit log statistics
   */
  static async getStats(days: number = 7): Promise<AuditLogStats> {
    try {
      await ensureDatabaseInitialized();

      const stats = dbOps.getAuditLogStats.get(days) as AuditLogStats;
      return stats;
    } catch (error) {
      console.error('[AuditLogger] Failed to get audit log stats:', error);
      return {
        totalEvents: 0,
        successCount: 0,
        failureCount: 0,
        errorCount: 0,
      };
    }
  }

  /**
   * Clean up old audit logs based on retention policy
   * @param retentionDays - Number of days to retain logs (default: 90)
   * @param userId - Optional user ID who initiated the cleanup
   * @param username - Optional username who initiated the cleanup
   * @param ipAddress - Optional IP address of the user
   * @param userAgent - Optional user agent of the user
   * @returns Number of deleted entries
   */
  static async cleanup(
    retentionDays: number = 90,
    userId?: string | null,
    username?: string | null,
    ipAddress?: string | null,
    userAgent?: string | null
  ): Promise<number> {
    try {
      await ensureDatabaseInitialized();

      // Validate retention days
      if (retentionDays < 30 || retentionDays > 365) {
        throw new Error('Retention days must be between 30 and 365');
      }

      const result = dbOps.deleteOldAuditLogs.run(retentionDays);
      const deletedCount = result.changes;

      // Log the cleanup operation - use user context if provided, otherwise log as system
      if (userId && username) {
        await this.log({
          userId,
          username,
          action: 'audit_cleanup',
          category: 'system',
          details: {
            retentionDays,
            deletedCount,
          },
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          status: 'success',
        });
      } else {
        await this.logSystem('audit_cleanup', {
          retentionDays,
          deletedCount,
        }, 'success', undefined, userAgent || undefined);
      }

      console.log(`[AuditLogger] Cleanup completed: ${deletedCount} entries deleted`);
      return deletedCount;
    } catch (error) {
      console.error('[AuditLogger] Failed to cleanup audit logs:', error);
      
      // Log error - use user context if provided, otherwise log as system
      if (userId && username) {
        await this.log({
          userId,
          username,
          action: 'audit_cleanup',
          category: 'system',
          details: {
            retentionDays,
            error: error instanceof Error ? error.message : String(error),
          },
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          status: 'error',
          errorMessage: error instanceof Error ? error.message : String(error),
        });
      } else {
        await this.logSystem('audit_cleanup', {
          retentionDays,
          error: error instanceof Error ? error.message : String(error),
        }, 'error', error instanceof Error ? error.message : String(error), userAgent || undefined);
      }
      return 0;
    }
  }

  /**
   * Sanitize details object to remove sensitive information
   */
  private static sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...details };
    
    // List of sensitive keys to remove or redact
    const sensitiveKeys = [
      'password',
      'passwordHash',
      'password_hash',
      'csrfToken',
      'csrf_token',
      'sessionId',
      'session_id',
      'token',
      'secret',
      'apiKey',
      'api_key',
    ];

    // Remove or redact sensitive keys
    for (const key of Object.keys(sanitized)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

// Export convenience functions
export const auditLog = AuditLogger.log.bind(AuditLogger);
export const auditLogAuth = AuditLogger.logAuth.bind(AuditLogger);
export const auditLogUserManagement = AuditLogger.logUserManagement.bind(AuditLogger);
export const auditLogConfigChange = AuditLogger.logConfigChange.bind(AuditLogger);
export const auditLogBackupOperation = AuditLogger.logBackupOperation.bind(AuditLogger);
export const auditLogServerOperation = AuditLogger.logServerOperation.bind(AuditLogger);
export const auditLogSystem = AuditLogger.logSystem.bind(AuditLogger);

