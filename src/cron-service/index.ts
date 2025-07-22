import { CronService } from './service';
import { getCronConfig, setCronConfig } from '@/lib/db-utils';

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
  // Read port from environment variable, fallback to 9667
  const envPort = process.env.CRON_PORT ? parseInt(process.env.CRON_PORT, 10) : 9667;

  let config = getCronConfig();
  if (config.port !== envPort) {
    config = { ...config, port: envPort };
    setCronConfig(config);
  }

  const service = new CronService(config);
  setupProcessHandlers(service);
  service.start();
}

// Only start if this file is being run directly
if (require.main === module) {
  main();
} 