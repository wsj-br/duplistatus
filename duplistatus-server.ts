import { createServer, type ServerResponse, type IncomingMessage } from 'http';
import next from 'next';
import { randomBytes } from 'crypto';
import { existsSync, writeFileSync, chmodSync, statSync, readFileSync, lstatSync } from 'fs';
import { join, extname, resolve, normalize } from 'path';

import { requestUrlStorage } from './src/lib/request-url-storage';

const formatTimestamp = (): string =>
  new Date().toLocaleString(undefined, { hour12: false });

const createServerLogger = (baseLogger: (...args: unknown[]) => void) => {
  return (...args: unknown[]) => {
    if (!args.length) {
      baseLogger();
      return;
    }

    const [first, ...rest] = args;
    if (typeof first === 'string' && first.startsWith('[Server]')) {
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

const serverLog = createServerLogger(console.log);
const serverWarn = createServerLogger(console.warn);
const serverError = createServerLogger(console.error);

import { waitForDatabaseReady, performDatabaseCleanup } from './src/lib/db';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; //always listen on 0.0.0.0
const port = parseInt(process.env.PORT || '9666', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Register signal handlers EARLY, before app.prepare() completes
// This ensures handlers are registered even if SIGTERM arrives during startup
let serverInstance: ReturnType<typeof createServer> | null = null;
let isShuttingDown = false;

const gracefulShutdown = (signal: string) => {
  serverLog(`\n[Server] 🔔 Received ${signal} signal`);
  
  // Prevent multiple shutdown attempts
  if (isShuttingDown) {
    process.exit(1);
    return;
  }

  isShuttingDown = true;

  if (!serverInstance) {
    performDatabaseCleanup();
    serverLog('[Server] ✅ Shutdown complete');
    process.exit(0);
    return;
  }

  // Set a timeout to force exit if shutdown takes too long
  const shutdownTimeout = setTimeout(() => {
    performDatabaseCleanup();
    serverLog('[Server] ✅ Shutdown complete');
    process.exit(0);
  }, 10000);

  // Close the server
  serverInstance.close(() => {
    clearTimeout(shutdownTimeout);
    performDatabaseCleanup('server-shutdown');
    serverLog('[Server] ✅ Shutdown complete');
    process.exit(0);
  });

  // Close existing connections immediately
  serverInstance.closeAllConnections();
};

// Register signal handlers immediately
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));


// Function to check if a language is supported
function isLangSupported(lang: string): boolean {
  try {
    // Remove encoding suffixes (e.g., .UTF-8, .utf8) from locale string
    // Locale format can be like "en_GB.UTF-8" or "en_GB.utf8", we only need "en_GB"
    const langWithoutEncoding = lang.split('.')[0];

    // The locale string is case-insensitive, but it's good practice to normalize it.
    // Replace hyphens with underscores, if necessary, to match the format of env variables.
    const normalizedLang = langWithoutEncoding.replace(/_/g, '-');

    // Intl.supportedLocalesOf() returns an array of the locales that are recognized.
    // If the input locale is in this array, it is supported.
    const supported = Intl.DateTimeFormat.supportedLocalesOf([normalizedLang]);

    // The locale is considered supported if it appears in the returned array.
    return supported.includes(normalizedLang);
  } catch (error) {
    // This can catch issues like invalid locale string formats.
    serverError(`An error occurred while checking locale ${lang}:`, error);
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
    serverError('❌ SECURITY ERROR: .duplistatus.key file has incorrect permissions!');
    serverError(`   Expected: 0400 (r--------)`);
    serverError(`   Actual:   0${permissions.toString(8).padStart(3, '0')} (${permissions.toString(8)})`);
    serverError('   The key file must have permissions 0400 for security reasons.');
    serverError('   Please fix the permissions or delete the file to regenerate it.');
    serverError('   run chmod 0400 .duplistatus.key to fix the permissions');
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
    serverLog('🔑 Creating new .duplistatus.key file...');
    const key = randomBytes(32);
    writeFileSync(keyFilePath, key);
    chmodSync(keyFilePath, 0o400); // Set permissions to r-------- (0400)
    serverLog('   ✅ Key file created successfully with restricted permissions');
  }
};

// MIME type mapping
const getMimeType = (filePath: string): string => {
  const ext = extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.htm': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.xml': 'application/xml',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.webmanifest': 'application/manifest+json',
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

// Function to serve static files from public/docs
const serveDocsFile = (reqUrl: string | undefined, res: ServerResponse): boolean => {
  try {
    if (!reqUrl) {
      return false;
    }

    // Parse URL and remove query string
    let urlPath: string;
    try {
      // Try parsing as full URL first
      const url = new URL(reqUrl, 'http://localhost');
      urlPath = url.pathname;
    } catch {
      // If that fails, assume it's already a path
      urlPath = reqUrl.split('?')[0]; // Remove query string if present
    }

    // Check if request is for /docs
    if (!urlPath.startsWith('/docs')) {
      return false;
    }

    // Remove /docs prefix and normalize path
    let filePath = urlPath.replace(/^\/docs/, '');

    // Handle root /docs request
    if (filePath === '' || filePath === '/') {
      filePath = '/index.html';
    }

    // Resolve to public/docs directory
    const docsDir = join(process.cwd(), 'public', 'docs');
    const resolvedDocsDir = resolve(docsDir);
    let resolvedPath = resolve(docsDir, normalize(filePath).replace(/^\//, ''));

    // Security check: ensure the resolved path is within docsDir
    if (!resolvedPath.startsWith(resolvedDocsDir)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return true;
    }

    // Check if file exists - if not, try with .html extension (for Docusaurus clean URLs)
    if (!existsSync(resolvedPath)) {
      const htmlPath = resolvedPath + '.html';
      // Security check for .html path too
      if (htmlPath.startsWith(resolvedDocsDir) && existsSync(htmlPath)) {
        resolvedPath = htmlPath;
      } else {
        res.statusCode = 404;
        res.end('Not Found');
        return true;
      }
    }

    // Check if it's a directory - try index.html
    const stats = lstatSync(resolvedPath);
    if (stats.isDirectory()) {
      const indexPath = join(resolvedPath, 'index.html');
      if (existsSync(indexPath)) {
        const content = readFileSync(indexPath);
        res.setHeader('Content-Type', getMimeType(indexPath));
        res.setHeader('Content-Length', content.length);
        res.statusCode = 200;
        res.end(content);
        return true;
      } else {
        res.statusCode = 404;
        res.end('Not Found');
        return true;
      }
    }

    // Not a directory - read and serve as file
    const content = readFileSync(resolvedPath);
    res.setHeader('Content-Type', getMimeType(resolvedPath));
    res.setHeader('Content-Length', content.length);
    res.statusCode = 200;
    res.end(content);
    return true;
  } catch (err) {
    serverError('Error serving docs file:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
    return true;
  }
};

app.prepare().then(async () => {
  // Ensure key file exists before starting server
  ensureKeyFile();
  
  // Ensure database is initialized so cleanup handlers are ready
  try {
    await waitForDatabaseReady();
  } catch (error) {
    serverError('[Server] ❌ Failed to initialize database:', error);
    // Continue anyway - database will be initialized on first use
  }


  const server = createServer(async (req, res) => {
    try {
      // Check if this is a /docs request and serve static files
      if (serveDocsFile(req.url, res)) {
        return; // File was served, don't continue to Next.js handler
      }

      // Parse URL and store it in AsyncLocalStorage for server components
      // This is the only reliable way to pass URL info from custom server to server components
      let pathname = '/';
      let searchParams = '';

      if (req.url) {
        try {
          // Parse the URL using WHATWG URL API
          const url = new URL(req.url, 'http://localhost');
          pathname = url.pathname;
          searchParams = url.searchParams.toString();
        } catch (err) {
          // If URL parsing fails, use default values
          serverError('[Server] Error parsing URL for redirect:', err);
          pathname = '/';
          searchParams = '';
        }
      }

      // Store URL info in AsyncLocalStorage so server components can access it
      // This runs the Next.js handler within the AsyncLocalStorage context
      await requestUrlStorage.run({ pathname, searchParams }, async () => {
        await handle(req, res);
      });
    } catch (err) {
      serverError('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Store server instance for graceful shutdown
  serverInstance = server;

  server.listen(port, hostname, () => {
    serverLog('\n🌐 duplistatus (v' + process.env.VERSION + ')');
    serverLog(`  🛜 Ready on http://${hostname}:${port}`);
    if (dev) {
      serverLog(`  🔧 dev mode`);
    }
    else {
      serverLog(`  🚀 production mode\n`);
    }
    serverLog('    Environment variables:');
    serverLog('      VERSION=' + process.env.VERSION);
    serverLog('      PORT=' + process.env.PORT);
    serverLog('      CRON_PORT=' + process.env.CRON_PORT);
    serverLog('      NODE_ENV=' + process.env.NODE_ENV);
    serverLog('      NEXT_TELEMETRY_DISABLED=' + process.env.NEXT_TELEMETRY_DISABLED);
    serverLog('      TZ=' + process.env.TZ);
    serverLog('      LANG=' + process.env.LANG);
    if (!isLangSupported(process.env.LANG || 'en_GB')) {
      serverError('❌ ERROR: LANG environment variable is not supported!');
      serverError('   The locale must be supported by the system.');
      serverError('   Please fix your docker configuration or remove the LANG environment variable,');
      serverError('   it will default to LANG=en_GB');
    }

    // show the time of the start
    serverLog('\nstarted at:', new Date().toLocaleString(undefined, { hour12: false, timeZoneName: 'short' }));
  });
});

