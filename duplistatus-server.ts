import { createServer, type ServerResponse } from 'http';
import next from 'next';
import { randomBytes } from 'crypto';
import { existsSync, writeFileSync, chmodSync, statSync, readFileSync, lstatSync } from 'fs';
import { join, extname, resolve, normalize } from 'path';
import { error } from 'console';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; //always listen on 0.0.0.0
const port = parseInt(process.env.PORT || '9666', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();


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
    const resolvedPath = resolve(docsDir, normalize(filePath).replace(/^\//, ''));
    
    // Security check: ensure the resolved path is within docsDir
    if (!resolvedPath.startsWith(resolve(docsDir))) {
      res.statusCode = 403;
      res.end('Forbidden');
      return true;
    }

    // Check if file exists
    if (!existsSync(resolvedPath)) {
      res.statusCode = 404;
      res.end('Not Found');
      return true;
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

    // Read and serve the file
    const content = readFileSync(resolvedPath);
    res.setHeader('Content-Type', getMimeType(resolvedPath));
    res.setHeader('Content-Length', content.length);
    res.statusCode = 200;
    res.end(content);
    return true;
  } catch (err) {
    console.error('Error serving docs file:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
    return true;
  }
};

app.prepare().then(() => {
  // Ensure key file exists before starting server
  ensureKeyFile();
  
  
  const server = createServer(async (req, res) => {
    try {
      // Check if this is a /docs request and serve static files
      if (serveDocsFile(req.url, res)) {
        return; // File was served, don't continue to Next.js handler
      }
      
      // Use the original req.url for Next.js handler, as handle expects (req, res, parsedUrl?)
      await handle(req, res);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Graceful shutdown handlers
  let isShuttingDown = false;
  const gracefulShutdown = (signal: string) => {
    // Prevent multiple shutdown attempts
    if (isShuttingDown) {
      console.log(`\n⚠️  Already shutting down, forcing exit...`);
      process.exit(1);
      return;
    }
    
    isShuttingDown = true;
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    console.log(`   Server terminated at: ${new Date().toLocaleString()}`);
    
    // Set a timeout to force exit if shutdown takes too long
    const shutdownTimeout = setTimeout(() => {
      console.log('   ⚠️  Shutdown timeout reached, forcing exit...');
      process.exit(0);
    }, 5000); // 5 second timeout
    
    // Close the server
    server.close(() => {
      clearTimeout(shutdownTimeout);
      console.log('   ✅ Server closed successfully');
      process.exit(0);
    });
    
    // Also close all existing connections immediately
    server.closeAllConnections();
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

