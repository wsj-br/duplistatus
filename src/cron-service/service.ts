import express, { Request, Response } from 'express';
import * as cron from 'node-cron';
import { checkMissedBackups } from '@/lib/missed-backup-checker';
import { CronServiceStatus, TaskExecutionResult, CronServiceConfig } from './types';

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
      res.json(this.getStatus());
    });

    // Trigger task manually endpoint
    this.app.post('/trigger/:taskName', async (req: Request, res: Response) => {
      const { taskName } = req.params;
      try {
        const result = await this.executeTask(taskName);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    });

    // Stop task endpoint
    this.app.post('/stop/:taskName', (req: Request, res: Response) => {
      const { taskName } = req.params;
      const task = this.tasks.get(taskName);
      if (task) {
        task.stop();
        this.tasks.delete(taskName);
        res.json({ message: `Task ${taskName} stopped` });
      } else {
        res.status(404).json({ error: `Task ${taskName} not found` });
      }
    });

    // Start task endpoint
    this.app.post('/start/:taskName', (req: Request, res: Response) => {
      const { taskName } = req.params;
      if (this.config.tasks[taskName]) {
        this.startTask(taskName);
        res.json({ message: `Task ${taskName} started` });
      } else {
        res.status(404).json({ error: `Task ${taskName} not found in configuration` });
      }
    });
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
      throw new Error(`Invalid task configuration for ${taskName}`);
    }

    const task = cron.schedule(taskConfig.cronExpression, async () => {
      await this.executeTask(taskName);
    }, {
      timezone: 'UTC'
    });

    this.tasks.set(taskName, task);
  }

  private async executeTask(taskName: string): Promise<TaskExecutionResult> {
    try {
      let result: unknown;
      
      switch (taskName) {
        case 'missed-backup-check':
          result = await checkMissedBackups();
          break;
        default:
          throw new Error(`Unknown task: ${taskName}`);
      }

      this.lastRunTimes[taskName] = new Date().toISOString();
      delete this.errors[taskName];

      return {
        taskName,
        success: true,
        message: 'Task executed successfully',
        statistics: result as Record<string, unknown>
      };
    } catch (error) {
      const errorMessage = String(error);
      this.errors[taskName] = errorMessage;
      
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
      console.log(`Cron service listening on port ${this.config.port}`);
    });
  }

  public stop() {
    this.tasks.forEach(task => task.stop());
    this.tasks.clear();
  }
}

export { CronService }; 