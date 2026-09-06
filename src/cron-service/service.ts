import express, { Request, Response, NextFunction } from 'express';
import * as cron from 'node-cron';
import { checkOverdueBackups } from '@/lib/overdue-backup-checker';
import { AuditLogger } from '@/lib/audit-logger';
import { getConfiguration, clearRequestCache } from '@/lib/db-utils';
import { CronServiceStatus, TaskExecutionResult, CronServiceConfig, DAILY_SUMMARY_DISPATCH_TASK } from '@/lib/types';
import { getCronConfig } from '@/lib/db-utils';
import { refreshDuplicatiVersions } from '@/lib/duplicati-version-service';
import { dispatchScheduledDailySummary } from '@/lib/daily-summary';

const timestamp = () => new Date().toLocaleString(undefined, { hour12: false, timeZoneName: 'short' }).replace(',', '');

const KNOWN_TASKS = [
  'overdue-backup-check',
  'audit-log-cleanup',
  'duplicati-version-refresh',
  DAILY_SUMMARY_DISPATCH_TASK,
] as const;

type KnownTaskName = (typeof KNOWN_TASKS)[number];

function isKnownTaskName(taskName: string): taskName is KnownTaskName {
  return (KNOWN_TASKS as readonly string[]).includes(taskName);
}

function isLoopbackHost(host: string): boolean {
  return host === '127.0.0.1' || host === '::1' || host === 'localhost';
}

class CronService {
  private app = express();
  private tasks = new Map<string, cron.ScheduledTask>();
  private lastRunTimes: Record<string, string> = {};
  private errors: Record<string, string> = {};
  private config: CronServiceConfig;
  private bindHost: string;
  private serviceSecret: string | undefined;

  constructor(config: CronServiceConfig) {
    this.config = config;
    this.bindHost = process.env.CRON_BIND_HOST || '127.0.0.1';
    this.serviceSecret = process.env.CRON_SERVICE_SECRET;
    if (!isLoopbackHost(this.bindHost) && !this.serviceSecret) {
      throw new Error('CRON_SERVICE_SECRET is required when the cron service is not bound to a loopback address');
    }
    this.setupExpress();
    this.setupTasks();
  }

  private authorize(req: Request, res: Response, next: NextFunction): void {
    if (!this.serviceSecret) {
      next();
      return;
    }
    const provided = req.header('x-cron-service-secret');
    if (provided !== this.serviceSecret) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    next();
  }

  private setupExpress() {
    this.app.use(express.json());

    this.app.get('/health', (req: Request, res: Response) => {
      if (this.serviceSecret) {
        const provided = req.header('x-cron-service-secret');
        if (provided && provided !== this.serviceSecret) {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }
      }
      console.log(`[CronService] ${timestamp()}: Health check requested`);
      res.json(this.getStatus());
    });

    this.app.post('/trigger/:taskName', this.authorize.bind(this), async (req: Request, res: Response) => {
      const taskName = Array.isArray(req.params.taskName) ? req.params.taskName[0] : req.params.taskName;
      if (taskName === DAILY_SUMMARY_DISPATCH_TASK) {
        res.status(403).json({ error: 'This task cannot be triggered via the generic endpoint' });
        return;
      }
      console.log(`[CronService] ${timestamp()}: Manual trigger requested for task: ${taskName}`);
      try {
        const result = await this.executeTask(taskName);
        console.log(`[CronService] ${timestamp()}: Task ${taskName} triggered successfully:`, result);
        res.json(result);
      } catch (error) {
        console.error(`[CronService] ${timestamp()}: Error triggering task ${taskName}:`, error instanceof Error ? error.message : String(error));
        res.status(500).json({ error: String(error) });
      }
    });

    this.app.post('/stop/:taskName', this.authorize.bind(this), (req: Request, res: Response) => {
      const taskName = Array.isArray(req.params.taskName) ? req.params.taskName[0] : req.params.taskName;
      console.log(`[CronService] ${timestamp()}: Stop requested for task: ${taskName}`);
      const task = this.tasks.get(taskName);
      if (task) {
        task.stop();
        this.tasks.delete(taskName);
        console.log(`[CronService] ${timestamp()}: Task ${taskName} stopped successfully`);
        res.json({ message: `Task ${taskName} stopped` });
      } else {
        console.warn(`[CronService] ${timestamp()}: Task ${taskName} not found for stopping`);
        res.status(404).json({ error: `Task ${taskName} not found` });
      }
    });

    this.app.post('/start/:taskName', this.authorize.bind(this), (req: Request, res: Response) => {
      const taskName = Array.isArray(req.params.taskName) ? req.params.taskName[0] : req.params.taskName;
      console.log(`[CronService] ${timestamp()}: Start requested for task: ${taskName}`);
      if (this.config.tasks[taskName]) {
        this.startTask(taskName);
        console.log(`[CronService] ${timestamp()}: Task ${taskName} started successfully`);
        res.json({ message: `Task ${taskName} started` });
      } else {
        console.warn(`[CronService] ${timestamp()}: Task ${taskName} not found in configuration`);
        res.status(404).json({ error: `Task ${taskName} not found in configuration` });
      }
    });

    this.app.post('/reload-config', this.authorize.bind(this), (req: Request, res: Response) => {
      console.log('[CronService] ' + timestamp() + ': Configuration reload requested');
      try {
        this.reloadConfiguration();
        console.log('[CronService] ' + timestamp() + ': Configuration reloaded successfully');
        res.json({ message: 'Configuration reloaded successfully' });
      } catch (error) {
        console.error('[CronService] ' + timestamp() + ': Error reloading configuration:', error instanceof Error ? error.message : String(error));
        res.status(500).json({ error: String(error) });
      }
    });
  }

  private reloadConfiguration() {
    this.stop();
    console.log('[CronService] ' + timestamp() + ': Loading new configuration from database');
    const newConfig = getCronConfig();
    this.config = newConfig;
    this.setupTasks();
  }

  private setupTasks() {
    Object.entries(this.config.tasks).forEach(([taskName, config]) => {
      if (config.enabled) {
        this.startTask(taskName);
      }
    });
  }

  private startTask(taskName: string) {
    const taskConfig = this.config.tasks[taskName];
    if (!taskConfig || !cron.validate(taskConfig.cronExpression)) {
      const error = `Invalid task configuration for ${taskName}`;
      console.error(`[CronService] ${timestamp()}: ${error}`);
      throw new Error(error);
    }

    const task = cron.schedule(taskConfig.cronExpression, async () => {
      await this.executeTask(taskName);
    }, {
      timezone: 'UTC'
    });

    this.tasks.set(taskName, task);
    console.log(`[CronService] ${timestamp()}: Task ${taskName} scheduled with cron expression: ${taskConfig.cronExpression.replace(/\s+/g, ' ').trim()}`);
  }

  private async executeKnownTask(taskName: KnownTaskName): Promise<TaskExecutionResult> {
    switch (taskName) {
      case 'overdue-backup-check': {
        const result = await checkOverdueBackups(undefined, false);
        this.lastRunTimes[taskName] = new Date().toISOString();
        delete this.errors[taskName];
        if (result.statistics && result.statistics.notificationsSent > 0) {
          console.log(`[CronService] ${timestamp()}: Task ${taskName} executed successfully: checked:${result.statistics.checkedBackups}, overdue:${result.statistics.overdueBackupsFound}, notifications:${result.statistics.notificationsSent}`);
        }
        return {
          taskName,
          success: true,
          message: result.message,
          statistics: result.statistics,
        };
      }
      case 'audit-log-cleanup': {
        const retentionConfig = getConfiguration('audit_retention_days');
        const retentionDays = retentionConfig ? parseInt(retentionConfig, 10) : 90;
        const deletedCount = await AuditLogger.cleanup(isNaN(retentionDays) ? 90 : retentionDays);
        const message = `Cleaned up ${deletedCount} audit log entries older than ${retentionDays} days`;
        console.log(`[CronService] ${timestamp()}: Task ${taskName} executed successfully: ${message}`);
        this.lastRunTimes[taskName] = new Date().toISOString();
        delete this.errors[taskName];
        return { taskName, success: true, message };
      }
      case 'duplicati-version-refresh': {
        const refreshResult = await refreshDuplicatiVersions({ force: true, trigger: 'cron' });
        if (!refreshResult.success) {
          throw new Error(refreshResult.message);
        }
        console.log(`[CronService] ${timestamp()}: Task ${taskName} executed successfully: ${refreshResult.message}`);
        this.lastRunTimes[taskName] = new Date().toISOString();
        delete this.errors[taskName];
        return { taskName, success: true, message: refreshResult.message };
      }
      case 'daily-summary-dispatch': {
        const result = await dispatchScheduledDailySummary();
        this.lastRunTimes[taskName] = new Date().toISOString();
        delete this.errors[taskName];
        const message = result.skippedReason
          ? `Daily summary dispatch skipped (${result.skippedReason})`
          : `Daily summary dispatch completed (succeeded: ${result.succeeded.join(',') || 'none'})`;
        if (result.succeeded.length > 0 || result.failed.length > 0) {
          console.log(`[CronService] ${timestamp()}: ${message}`);
        }
        return {
          taskName,
          success: result.failed.length === 0,
          message,
          statistics: {
            attempted: result.attempted,
            succeeded: result.succeeded,
            failed: result.failed,
          },
        };
      }
      default: {
        const exhaustive: never = taskName;
        throw new Error(`Unhandled task: ${String(exhaustive)}`);
      }
    }
  }

  private async executeTask(taskName: string): Promise<TaskExecutionResult> {
    try {
      clearRequestCache();
      if (!isKnownTaskName(taskName)) {
        throw new Error(`Unknown task: ${taskName}`);
      }
      return await this.executeKnownTask(taskName);
    } catch (error) {
      const errorMessage = String(error);
      this.errors[taskName] = errorMessage;
      console.error(`[CronService] ${timestamp()}: Error executing task ${taskName}:`, errorMessage);
      return {
        taskName,
        success: false,
        error: errorMessage
      };
    }
  }

  public getStatus(): CronServiceStatus {
    return {
      isRunning: true,
      activeTasks: Array.from(this.tasks.keys()),
      lastRunTimes: this.lastRunTimes,
      errors: this.errors
    };
  }

  public start() {
    this.app.listen(this.config.port, this.bindHost, () => {
      console.log(`[CronService] ${timestamp()}: Cron service listening on ${this.bindHost}:${this.config.port}`);
    });
  }

  public stop() {
    this.tasks.forEach(task => task.stop());
    this.tasks.clear();
  }
}

export { CronService };
