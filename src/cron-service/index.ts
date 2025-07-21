import { CronService } from './service';
import { CronServiceConfig } from './types';
import { getConfiguration } from '@/lib/db-utils';

// Default configuration
const defaultConfig: CronServiceConfig = {
  port: 9667, // Use a different port than the main app
  tasks: {
    'missed-backup-check': {
      cronExpression: '0,20,40 * * * *', // Every 20 minutes
      enabled: true
    }
  }
};

function loadConfig(): CronServiceConfig {
  try {
    // Try to load configuration from database
    const configJson = getConfiguration('cron_service');
    if (configJson) {
      const config = JSON.parse(configJson);
      return {
        ...defaultConfig,
        ...config,
        tasks: {
          ...defaultConfig.tasks,
          ...config.tasks
        }
      };
    }
  } catch (error) {
    console.error('Failed to load cron service configuration:', error);
  }
  return defaultConfig;
}

// Handle process signals
function setupProcessHandlers(service: CronService) {
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Stopping cron service...');
    service.stop();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received. Stopping cron service...');
    service.stop();
    process.exit(0);
  });
}

// Start the service
function main() {
  const config = loadConfig();
  const service = new CronService(config);
  
  setupProcessHandlers(service);
  
  service.start();
  
  console.log('Cron service started with configuration:', JSON.stringify(config, null, 2));
}

// Only start if this file is being run directly
if (require.main === module) {
  main();
} 