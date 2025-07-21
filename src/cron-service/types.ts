import { NotificationConfig } from '@/lib/types';

export interface CronServiceStatus {
  isRunning: boolean;
  activeTasks: string[];
  lastRunTimes: Record<string, string>;
  errors: Record<string, string>;
}

export interface TaskExecutionResult {
  taskName: string;
  success: boolean;
  message?: string;
  error?: string;
  statistics?: Record<string, unknown>;
}

export interface CronServiceConfig {
  port: number;
  tasks: {
    [taskName: string]: {
      cronExpression: string;
      enabled: boolean;
    };
  };
  notificationConfig?: NotificationConfig;
} 