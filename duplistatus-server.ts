import { createServer } from 'http';
import next from 'next';
import { randomBytes } from 'crypto';
import { existsSync, writeFileSync, chmodSync, statSync } from 'fs';
import { join } from 'path';
import { error } from 'console';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; //always listen on 0.0.0.0
const port = parseInt(process.env.PORT || '9666', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();


// Function to check if a language is supported
function isLangSupported(lang: string): boolean {
  try {
    // The locale string is case-insensitive, but it's good practice to normalize it.
    // Replace hyphens with underscores, if necessary, to match the format of env variables.
    const normalizedLang = lang.replace(/_/g, '-');

    // Intl.supportedLocalesOf() returns an array of the locales that are recognized.
    // If the input locale is in this array, it is supported.
    const supported = Intl.DateTimeFormat.supportedLocalesOf([normalizedLang]);

    // The locale is considered supported if it appears in the returned array.
    return supported.includes(normalizedLang);
  } catch (error) {
    // This can catch issues like invalid locale string formats.
    console.error(`An error occurred while checking locale ${lang}:`, error);
    return false;
  }
}

// Function to validate key file permissions
const validateKeyFilePermissions = (keyFilePath: string) => {
  if (!existsSync(keyFilePath)) {
    return; // File doesn't exist, will be created with correct permissions
  }
  
  const stats = statSync(keyFilePath);
  const permissions = stats.mode & 0o777; // Get the last 3 octal digits
  
  if (permissions !== 0o400) {
    console.error('❌ SECURITY ERROR: .duplistatus.key file has incorrect permissions!');
    console.error(`   Expected: 0400 (r--------)`);
    console.error(`   Actual:   0${permissions.toString(8).padStart(3, '0')} (${permissions.toString(8)})`);
    console.error('   The key file must have permissions 0400 for security reasons.');
    console.error('   Please fix the permissions or delete the file to regenerate it.');
    console.error('   run chmod 0400 .duplistatus.key to fix the permissions');
    process.exit(1);
  }
  // all ok, continue
};

// Function to verify and create .duplistatus.key file
const ensureKeyFile = () => {
  const dataDir = join(process.cwd(), 'data');
  const keyFilePath = join(dataDir, '.duplistatus.key');
  
  // First validate existing file permissions
  validateKeyFilePermissions(keyFilePath);
  
  if (!existsSync(keyFilePath)) {
    console.log('🔑 Creating new .duplistatus.key file...');
    const key = randomBytes(32);
    writeFileSync(keyFilePath, key);
    chmodSync(keyFilePath, 0o400); // Set permissions to r-------- (0400)
    console.log('   ✅ Key file created successfully with restricted permissions');
  }
};

app.prepare().then(() => {
  // Ensure key file exists before starting server
  ensureKeyFile();
  
  
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
    console.log('      LANG=' + process.env.LANG);
    if(!isLangSupported(process.env.LANG || 'en_GB')) {
      console.error('❌ ERROR: LANG environment variable is not supported!');
      console.error('   The locale must be supported by the system.');
      console.error('   Please fix your docker configuration or remove the LANG environment variable,');
      console.error('   it will default to LANG=en_GB');
    }
 
    // show the time of the start
    console.log('\nstarted at:', new Date().toLocaleString(undefined, { hour12: false, timeZoneName: 'short' }));
  });
});

