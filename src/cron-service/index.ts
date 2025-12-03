import { CronService } from './service';
import { getCronConfig, setCronConfig } from '@/lib/db-utils';
import { performDatabaseCleanup } from '@/lib/db';

const formatTimestamp = (): string =>
  new Date().toLocaleString(undefined, { hour12: false });

const createCronLogger = (baseLogger: (...args: unknown[]) => void) => {
  return (...args: unknown[]) => {
    if (!args.length) {
      baseLogger();
      return;
    }

    const [first, ...rest] = args;
    if (typeof first === 'string' && first.startsWith('[')) {
      const closing = first.indexOf(']');
      if (closing !== -1) {
        const label = first.slice(0, closing + 1);
        const remainder = first.slice(closing + 1);
        baseLogger(`${label} ${formatTimestamp()}${remainder}`, ...rest);
        return;
      }
    }

    baseLogger(...args);
  };
};

const cronLog = createCronLogger(console.log);
const cronError = createCronLogger(console.error);

// Handle process signals
function setupProcessHandlers(service: CronService) {
  let isShuttingDown = false;

  const shutdown = (signal: string) => {
    if (isShuttingDown) {
      cronLog(`${signal} received but shutdown already in progress. Ignoring duplicate signal.`);
      return;
    }

    isShuttingDown = true;
    cronLog(`${signal} received. Stopping cron service...`);

    try {
      service.stop();
    } catch (error) {
      cronError('Error while stopping cron service:', error instanceof Error ? error.message : String(error));
    } finally {
      performDatabaseCleanup('cron-shutdown');
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Start the service
function main() {
  // Read port from environment variables with fallback logic
  const envPort = (() => {
    // Try to get CRON_PORT first
    const cronPort = process.env.CRON_PORT;
    if (cronPort) {
      return parseInt(cronPort, 10);
    }
    
    // Fallback to PORT + 1
    const basePort = process.env.PORT;
    if (basePort) {
      return parseInt(basePort, 10) + 1;
    }
    
    // Default fallback
    return 9667;
  })();

  let config = getCronConfig();
  if (config.port !== envPort) {
    config = { ...config, port: envPort };
    setCronConfig(config);
  }

  const service = new CronService(config);
  setupProcessHandlers(service);
  service.start();
}

// Only start if this file is being run directly (ES module equivalent)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 