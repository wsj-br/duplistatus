import { checkMissedBackups } from '@/lib/missed-backup-checker';
import * as cron from 'node-cron';

// Ensure this runs in Node.js runtime, not Edge Runtime
export const runtime = 'nodejs';

interface PeriodicTaskConfig {
  cronExpression: string;
  taskName: string;
  taskFunction: () => Promise<unknown>;
}

class PeriodicTaskManager {
  private tasks: Map<string, cron.ScheduledTask> = new Map();
  private isInitialized = false;

  /**
   * Initialize the periodic task manager
   */
  public initialize(): void {
    if (this.isInitialized) {
      console.log('PeriodicTaskManager already initialized');
      return;
    }

    console.log('Initializing PeriodicTaskManager with node-cron...');
    this.isInitialized = true;

    // Start the missed backup check task
    this.startMissedBackupCheck();
  }

  /**
   * Start the missed backup check task
   * Runs every 20 minutes (at minute 0, 20, 40 of every hour)
   */
  private startMissedBackupCheck(): void {
    const config: PeriodicTaskConfig = {
      cronExpression: '0,20,40 * * * *', // Every 20 minutes
      taskName: 'missed-backup-check',
      taskFunction: checkMissedBackups
    };

    this.startTask(config);
  }

  /**
   * Start a periodic task using cron expression
   */
  private startTask(config: PeriodicTaskConfig): void {
    const { cronExpression, taskName, taskFunction } = config;

    console.log(`Starting periodic task: ${taskName} (cron: ${cronExpression})`);

    // Validate cron expression
    if (!cron.validate(cronExpression)) {
      console.error(`Invalid cron expression for task ${taskName}: ${cronExpression}`);
      return;
    }

    // Execute the task immediately on startup
    this.executeTask(taskName, taskFunction);

    // Schedule the task using node-cron
    const scheduledTask = cron.schedule(cronExpression, () => {
      this.executeTask(taskName, taskFunction);
    }, {
      timezone: 'UTC'
    });

    this.tasks.set(taskName, scheduledTask);
  }

  /**
   * Execute a specific task
   */
  private async executeTask(taskName: string, taskFunction: () => Promise<unknown>): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] Executing periodic task: ${taskName}`);
      
      await taskFunction();
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error executing task ${taskName}:`, error);
    }
  }

  /**
   * Stop all periodic tasks
   */
  public stopAllTasks(): void {
    console.log('Stopping all periodic tasks...');
    
    for (const [taskName, scheduledTask] of this.tasks) {
      console.log(`Stopping task: ${taskName}`);
      scheduledTask.stop();
    }
    
    this.tasks.clear();
    this.isInitialized = false;
  }

  /**
   * Get the status of all tasks
   */
  public getTaskStatus(): { taskName: string; isRunning: boolean }[] {
    return Array.from(this.tasks.keys()).map(taskName => ({
      taskName,
      isRunning: true
    }));
  }

  /**
   * Add a new task with custom cron expression
   */
  public addTask(config: PeriodicTaskConfig): void {
    if (!this.isInitialized) {
      console.error('PeriodicTaskManager not initialized. Call initialize() first.');
      return;
    }

    this.startTask(config);
  }

  /**
   * Remove a specific task
   */
  public removeTask(taskName: string): boolean {
    const scheduledTask = this.tasks.get(taskName);
    if (scheduledTask) {
      console.log(`Removing task: ${taskName}`);
      scheduledTask.stop();
      this.tasks.delete(taskName);
      return true;
    }
    return false;
  }
}

// Create a singleton instance
const periodicTaskManager = new PeriodicTaskManager();

// Initialize the task manager when this module is imported
// Only initialize if we're in a Node.js environment (not Edge Runtime)
if (typeof window === 'undefined' && typeof process !== 'undefined' && process.versions && process.versions.node) {
  // Only run on server side with Node.js support
  periodicTaskManager.initialize();
}

export { periodicTaskManager }; 