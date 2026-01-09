import { join, resolve } from 'path';

/**
 * Get the application log filename from environment variable.
 * Defaults to 'application.log' if not set (matches docker-entrypoint.sh default).
 */
export function getApplicationLogFilename(): string {
  return process.env.APP_LOG_NAME || 'application.log';
}

/**
 * Get the repository root directory.
 * When running in Next.js standalone mode, process.cwd() may be .next/standalone/,
 * so we need to detect this and resolve to the actual repository root.
 */
function getRepoRoot(): string {
  const cwd = process.cwd();
  const cwdResolved = resolve(cwd);
  
  // Check if we're running from .next/standalone/ directory
  // Look for the pattern .next/standalone in the path
  const normalizedPath = cwdResolved.replace(/\\/g, '/');
  const standaloneIndex = normalizedPath.indexOf('.next/standalone');
  
  if (standaloneIndex !== -1) {
    // We're inside .next/standalone, extract the path up to .next
    const pathUpToNext = normalizedPath.substring(0, standaloneIndex);
    if (pathUpToNext) {
      // Return the directory containing .next (repo root)
      return resolve(pathUpToNext.endsWith('/') ? pathUpToNext.slice(0, -1) : pathUpToNext);
    } else {
      // If .next/standalone is at the start, we're at the root, go up two levels
      // This shouldn't happen in practice, but handle it anyway
      return resolve(cwd, '..', '..');
    }
  }
  
  // Also check if cwd itself is .next/standalone (relative path case)
  if (cwd.endsWith('.next/standalone') || cwd.endsWith('.next\\standalone')) {
    return resolve(cwd, '..', '..');
  }
  
  // Default: use current working directory (should be repo root in dev mode)
  return cwdResolved;
}

/**
 * Get the data directory path.
 * Properly resolves to the repository root even when running in Next.js standalone mode
 * where process.cwd() might be .next/standalone/.
 */
export function getDataDir(): string {
  return join(getRepoRoot(), 'data');
}

/**
 * Get the application log file path.
 * Uses the same path resolution strategy as the database.
 */
export function getApplicationLogPath(): string {
  return join(getDataDir(), 'logs', getApplicationLogFilename());
}
