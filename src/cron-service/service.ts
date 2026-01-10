import express, { Request, Response } from 'express';
import * as cron from 'node-cron';
import { checkOverdueBackups } from '@/lib/overdue-backup-checker';
import { AuditLogger } from '@/lib/audit-logger';
import { getConfiguration } from '@/lib/db-utils';
import { CronServiceStatus, TaskExecutionResult, CronServiceConfig, OverdueBackupCheckResult } from '@/lib/types';
import { getCronConfig } from '@/lib/db-utils';

const timestamp = () => new Date().toLocaleString(undefined, { hour12: false, timeZoneName: 'short' }).replace(',', '');

class CronService {
  private app = express();
  private tasks = new Map<string, cron.ScheduledTask>();
  private lastRunTimes: Record<string, string> = {};
  private errors: Record<string, string> = {};
  private config: CronServiceConfig;

  constructor(config: CronServiceConfig) {
    this.config = config;
    this.setupExpress();
    this.setupTasks();
  }


  private setupExpress() {

    this.app.use(express.json());

    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      console.log(`[CronService] ${timestamp()}: Health check requested`);
      res.json(this.getStatus());
    });

    // Trigger task manually endpoint
    this.app.post('/trigger/:taskName', async (req: Request, res: Response) => {
      const taskName = Array.isArray(req.params.taskName) ? req.params.taskName[0] : req.params.taskName;
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

    // Stop task endpoint
    this.app.post('/stop/:taskName', (req: Request, res: Response) => {
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

    // Start task endpoint
    this.app.post('/start/:taskName', (req: Request, res: Response) => {
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

    // Reload configuration endpoint
    this.app.post('/reload-config', (req: Request, res: Response) => {
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
    // Stop all current tasks
    this.stop();
    
    // Reload configuration from database using the utility function
    console.log('[CronService] ' + timestamp() + ': Loading new configuration from database');
    const newConfig = getCronConfig();
    
    // Update the service configuration
    this.config = newConfig;

    // Setup tasks with new configuration
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
      //console.log(`[CronService] ${timestamp()}: Running scheduled task: ${taskName}`);
      await this.executeTask(taskName);
    }, {
      timezone: 'UTC'
    });

    this.tasks.set(taskName, task);
    console.log(`[CronService] ${timestamp()}: Task ${taskName} scheduled with cron expression: ${taskConfig.cronExpression.replace(/\s+/g, ' ').trim()}`);
  }

  private async executeTask(taskName: string): Promise<TaskExecutionResult> {
    // console.log(`[CronService] ${timestamp()}: Executing task: ${taskName}`);
    try {
      let result: OverdueBackupCheckResult | { deletedCount: number; message: string };
      
      switch (taskName) {
        case 'overdue-backup-check':
          result = await checkOverdueBackups(undefined, false); // Don't force recalculation on automatic checks
          break;
        case 'audit-log-cleanup':
          // Get retention days from configuration
          const retentionConfig = getConfiguration('audit_retention_days');
          const retentionDays = retentionConfig ? parseInt(retentionConfig, 10) : 90;
          const deletedCount = await AuditLogger.cleanup(isNaN(retentionDays) ? 90 : retentionDays);
          result = {
            deletedCount,
            message: `Cleaned up ${deletedCount} audit log entries older than ${retentionDays} days`
          };
          console.log(`[CronService] ${timestamp()}: Task ${taskName} executed successfully: ${result.message}`);
          this.lastRunTimes[taskName] = new Date().toISOString();
          delete this.errors[taskName];
          return {
            taskName,
            success: true,
            message: result.message,
          };
        default:
          throw new Error(`Unknown task: ${taskName}`);
      }

      this.lastRunTimes[taskName] = new Date().toISOString();
      delete this.errors[taskName];

      // Check if statistics exist before accessing them
      if (result.statistics) {
        if(result.statistics.notificationsSent>0) { // only log if notifications were sent
          console.log(`[CronService] ${timestamp()}: Task ${taskName} executed successfully: checked:${result.statistics.checkedBackups}, overdue:${result.statistics.overdueBackupsFound}, notifications:${result.statistics.notificationsSent}`);
        }
        return {
          taskName,
          success: true,
          message: 'Task executed successfully',
          statistics: result.statistics
        };
      } else {
        console.log(`[CronService] ${timestamp()}: Task ${taskName} executed with message: ${result.message}`);
        return {
          taskName,
          success: true,
          message: result.message,
          statistics: { checkedBackups: 0, overdueBackupsFound: 0, notificationsSent: 0 }
        };
      }
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
    this.app.listen(this.config.port, () => {
      console.log(`[CronService] ${timestamp()}: Cron service listening on port ${this.config.port}`);
    });
  }

  public stop() {
    this.tasks.forEach(task => task.stop());
    this.tasks.clear();
  }
}

export { CronService }; 