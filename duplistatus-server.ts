import { createServer } from 'http';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; //always listen on 0.0.0.0
const port = parseInt(process.env.PORT || '9666', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Use the original req.url for Next.js handler, as handle expects (req, res, parsedUrl?)
      await handle(req, res);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Graceful shutdown handlers
  const gracefulShutdown = (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    console.log(`   Server terminated at: ${new Date().toLocaleString()}`);
    server.close(() => {
      console.log('   ✅ Server closed successfully');
      process.exit(0);
    });
  };

  // Listen for termination signals
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));

  server.listen(port, hostname, () => {
    console.log('\n\n🌐 duplistatus-server (v' + process.env.VERSION + ')');
    console.log(`  🛜 Ready on http://${hostname}:${port}`);
    if(dev) {
      console.log(`  🔧 dev mode`);
    }
    else {
      console.log(`  🚀 production mode\n`);
    }
    console.log('    Environment variables:');
    console.log('      VERSION=' + process.env.VERSION);
    console.log('      PORT=' + process.env.PORT);
    console.log('      CRON_PORT=' + process.env.CRON_PORT);
    console.log('      NODE_ENV=' + process.env.NODE_ENV);
    console.log('      NEXT_TELEMETRY_DISABLED=' + process.env.NEXT_TELEMETRY_DISABLED);
    console.log('      LANG=' + process.env.LANG);
    console.log('      TZ=' + process.env.TZ);
    console.log('\nstarted at:', new Date().toLocaleString());
  });
});

