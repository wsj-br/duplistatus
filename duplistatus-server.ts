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
    console.log('\n🌐 duplistatus (v' + process.env.VERSION + ')');
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
    console.log('      TZ=' + process.env.TZ);
    
    // SMTP Configuration Status
    const smtpVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'SMTP_MAILTO'];
    const hasAnySmtpVar = smtpVars.some(varName => process.env[varName]);
    
    if (!hasAnySmtpVar) {
      console.log('      SMTP: (no SMTP configuration)');
    } else {
      console.log('      SMTP Configuration:');
      const missingVars: string[] = [];
      
      smtpVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
          // Mask sensitive values
          if (varName === 'SMTP_PASSWORD') {
            console.log(`        ${varName}=***`);
          } else {
            console.log(`        ${varName}=${value}`);
          }
        } else {
          console.log(`        ${varName}=*** missing ***`);
          missingVars.push(varName);
        }
      });
      
      if (missingVars.length > 0) {
        console.log('        SMTP will be disabled, missing variables');
      }
    }

    // show the time of the start
    console.log('\nstarted at:', new Date().toLocaleString(undefined, { hour12: false, timeZoneName: 'short' }));
  });
});

