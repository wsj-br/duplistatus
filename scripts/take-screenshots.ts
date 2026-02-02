/**
 * Take screenshots for documentation.
 * Options: --locale en[,de,...] (optional); -h/--help for usage.
 */
import puppeteer, { type Page } from 'puppeteer';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

const BASE_URL = 'http://localhost:8666';
const ADMIN_USERNAME = 'admin';
const USER_USERNAME = 'user';
const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;

const LOCALES = ['en', 'de', 'fr', 'es', 'pt-BR'] as const;

type Locale = (typeof LOCALES)[number];

/** Screenshot filenames in capture order (Phase A then Phase B) for summary table. */
const ORDERED_SCREENSHOT_FILENAMES: string[] = [
  'screen-main-dashboard-card-mode.png',
  'screen-overdue-backup-hover-card.png',
  'screen-backup-tooltip.png',
  'screen-dashboard-summary.png',
  'screen-overview-side-status.png',
  'screen-overview-side-charts.png',
  'screen-collect-button-popup.png',
  'screen-collect-button-right-click-popup.png',
  'screen-duplicati-configuration.png',
  'screen-user-menu-admin.png',
  'screen-main-dashboard-table-mode.png',
  'screen-metrics.png',
  'screen-dashboard-summary-table.png',
  'screen-server-backup-list.png',
  'screen-backup-history.png',
  'screen-available-backups-modal.png',
  'screen-backup-detail.png',
  'screen-server-overdue-message.png',
  'screen-settings-left-panel-admin.png',
  'screen-settings-notifications.png',
  'screen-settings-notifications-bulk.png',
  'screen-settings-notifications-server.png',
  'screen-settings-overdue.png',
  'screen-settings-server.png',
  'screen-settings-ntfy.png',
  'screen-settings-email.png',
  'screen-settings-templates.png',
  'screen-settings-users.png',
  'screen-settings-audit.png',
  'screen-settings-audit-retention.png',
  'screen-settings-display.png',
  'screen-settings-database-maintenance.png',
  'screen-settings-application-logs.png',
  'screen-user-menu-user.png',
  'screen-settings-left-panel-non-admin.png'
];

// Timing: two globals (no timedCapture); recordDuration called inside capture functions
let scriptStartTime: number | null = null;
let lastOperationTimestamp: number = 0;
let currentCaptureLocale: Locale | null = null;
const screenshotDurations = new Map<string, Map<Locale, number>>();

function recordDuration(filename: string, ms: number): void {
  if (currentCaptureLocale != null) {
    let inner = screenshotDurations.get(filename);
    if (!inner) {
      inner = new Map<Locale, number>();
      screenshotDurations.set(filename, inner);
    }
    inner.set(currentCaptureLocale, ms);
  }
  lastOperationTimestamp = Date.now();
}

function formatElapsedMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** Format milliseconds as HH:MM:SS.S for summary and table. */
function formatDurationHms(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${tenths}`;
}

function captureLog(msg: string): string {
  if (scriptStartTime == null) return msg;
  return `[${formatElapsedMs(Date.now() - scriptStartTime)}] ${msg}`;
}

/** Parse --locale from argv. Returns list of locales to capture; if not passed, returns all. */
function parseLocaleArg(): Locale[] {
  const validSet = new Set<string>(LOCALES);
  for (let i = 0; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === '--locale') {
      const value = process.argv[i + 1];
      if (!value || value.startsWith('--')) {
        logError('--locale requires one or more locales (comma-separated). Example: --locale en,de');
        process.exit(1);
      }
      const requested = value.split(',').map(s => s.trim()).filter(Boolean);
      const invalid = requested.filter(l => !validSet.has(l));
      if (invalid.length > 0) {
        logError(`Invalid locale(s): ${invalid.join(', ')}. Valid: ${LOCALES.join(', ')}`);
        process.exit(1);
      }
      return requested as Locale[];
    }
    if (arg.startsWith('--locale=')) {
      const value = arg.slice('--locale='.length).trim();
      if (!value) {
        logError('--locale= requires one or more locales (comma-separated). Example: --locale=en,de');
        process.exit(1);
      }
      const requested = value.split(',').map(s => s.trim()).filter(Boolean);
      const invalid = requested.filter(l => !validSet.has(l));
      if (invalid.length > 0) {
        logError(`Invalid locale(s): ${invalid.join(', ')}. Valid: ${LOCALES.join(', ')}`);
        process.exit(1);
      }
      return requested as Locale[];
    }
  }
  return [...LOCALES];
}

function getScreenshotDir(locale: Locale): string {
  if (locale === 'en') {
    return 'documentation/static/assets';
  }
  return `documentation/i18n/${locale}/docusaurus-plugin-content-docs/current/assets`;
}

function makeUrl(locale: Locale, pathWithLeadingSlash: string): string {
  const path = pathWithLeadingSlash.startsWith('/') ? pathWithLeadingSlash : `/${pathWithLeadingSlash}`;
  return `${BASE_URL}/${locale}${path}`;
}

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

function logError(message: string): void {
  console.error(`${colors.red}${message}${colors.reset}`);
}

function logSuccess(message: string): void {
  console.log(`${colors.blue}${message}${colors.reset}`);
}

function showEnvFormat(): void {
  console.log(`${colors.yellow}Environment variables:${colors.reset}`);
  console.log(`ADMIN_PASSWORD="your-admin-password"`);
  console.log(`USER_PASSWORD="your-user-password"`);
  console.log(`${colors.reset}`);
}

function showHelp(): void {
  const script = process.argv[1]?.split(/[/\\]/).pop() ?? 'take-screenshots.ts';
  console.log(`Usage: pnpm ${script} [options]
       
Take screenshots of the application for documentation.

Options:
  --locale <locales>   Comma-separated locales to capture (default: all). 
                       Valid: ${LOCALES.join(', ')}

                       note: locales are case-sensitive.

  -h, --help           Show this help and exit.

Environment (required unless --help):
  ADMIN_PASSWORD       Password for admin account.
  USER_PASSWORD        Password for regular user account.

Requirements:
  Development server running at ${BASE_URL}

Examples:
  pnpm ${script}                          # All locales
  pnpm ${script} --locale pt-BR           # English only
  pnpm ${script} --locale en,de,pt-BR
`);
}

// --help / -h before password check so help works without env
if (process.argv.some(a => a === '--help' || a === '-h')) {
  showHelp();
  process.exit(0);
}

// Read passwords from environment variables
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const USER_PASSWORD = process.env.USER_PASSWORD;

// Validate that passwords are set
if (!ADMIN_PASSWORD) {
  logError('ADMIN_PASSWORD environment variable is not set. Please set it before running the script.');
  showEnvFormat();
  process.exit(1);
}

if (!USER_PASSWORD) {
  logError('USER_PASSWORD environment variable is not set. Please set it before running the script.');
  showEnvFormat();
  process.exit(1);
}

interface Server {
  id: string;
  name: string;
}

async function ensureDirectoryExists(dir: string) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to wait for server detail page content to load
async function waitForServerDetailContent(page: Page, maxWaitMs: number = 15000): Promise<boolean> {
  const startTime = Date.now();
  let lastCardCount = 0;
  
  while (Date.now() - startTime < maxWaitMs) {
    // Check if content has loaded by looking for cards or the data-screenshot-target
    const contentInfo = await page.evaluate(() => {
      // Check for any Card elements
      const cards = document.querySelectorAll('[class*="Card"]');
      const cardCount = cards.length;
      
      // Check for data-screenshot-target elements
      const targets = document.querySelectorAll('[data-screenshot-target]');
      
      // Check for server detail summary
      const summary = document.querySelector('[data-screenshot-target="server-detail-summary"]');
      
      // Check for backup history table
      const backupHistory = document.querySelector('[data-screenshot-target="backup-history-table"]');
      
      // Check if there's actual content (not just empty cards)
      const hasTable = document.querySelector('table') !== null;
      const hasBackupHistoryTitle = Array.from(cards).some(card => {
        const title = card.querySelector('h3, [class*="CardTitle"]');
        return title && title.textContent?.includes('Backup History');
      });
      
      return {
        cardCount,
        hasTargets: targets.length > 0,
        hasSummary: !!summary,
        hasBackupHistory: !!backupHistory,
        hasTable,
        hasBackupHistoryTitle
      };
    });
    
    // If we have cards and they're stable (not changing), content is loaded
    if (contentInfo.cardCount > 0 && contentInfo.cardCount === lastCardCount) {
      // Wait a bit more for any animations or final rendering
      await delay(1000);
      return true;
    }
    
    // If we have the backup history table or summary, content is loaded
    if (contentInfo.hasBackupHistory || contentInfo.hasSummary || (contentInfo.hasTable && contentInfo.hasBackupHistoryTitle)) {
      await delay(1000);
      return true;
    }
    
    lastCardCount = contentInfo.cardCount;
    await delay(300);
  }
  
  // Final check - even if timeout, see if we have any content
  const finalCheck = await page.evaluate(() => {
    const cards = document.querySelectorAll('[class*="Card"]');
    return cards.length > 0;
  });
  
  return finalCheck;
}

async function checkHealth(): Promise<boolean> {
  console.log('Checking if application is running...');
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (!response.ok) {
      logError(`Health check failed: ${response.status} ${response.statusText}`);
      return false;
    }
    const data = await response.json();
    console.log(`Application is running. Status: ${data.status}`);
    return data.status === 'healthy' || data.status === 'degraded';
  } catch (error) {
    logError('Health check failed: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

async function generateTestData() {
  console.log('Generating test data...');
  try {
    const command = 'pnpm generate-test-data --servers=12 --quiet';
    console.log(`Executing: ${command}`);
    console.log(`Working directory: ${process.cwd()}`);
    
    execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env }
    });
    
    // Verify that data was actually generated
    try {
      const dbModule = await import('../src/lib/db');
      await dbModule.ensureDatabaseInitialized();
      const db = dbModule.db;
      
      const serverCount = db.prepare('SELECT COUNT(*) as count FROM servers').get() as { count: number };
      const backupCount = db.prepare('SELECT COUNT(*) as count FROM backups').get() as { count: number };
      
      console.log(`Verification: ${serverCount.count} server(s) and ${backupCount.count} backup(s) found in database`);
      
      if (serverCount.count === 0 || backupCount.count === 0) {
        logError(`Warning: Test data generation completed but database appears empty (servers: ${serverCount.count}, backups: ${backupCount.count})`);
      } else {
        console.log('Test data generated successfully');
      }
    } catch (verifyError) {
      logError(`Warning: Could not verify test data generation: ${verifyError instanceof Error ? verifyError.message : String(verifyError)}`);
      console.log('Test data generation command completed (verification failed)');
    }
    
    console.log('-------------------------------------------------------');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = error instanceof Error && 'code' in error ? ` (code: ${error.code})` : '';
    logError(`Failed to generate test data: ${errorMessage}${errorDetails}`);
    
    // Log additional details if available
    if (error instanceof Error && 'stderr' in error) {
      logError(`stderr: ${String((error as any).stderr)}`);
    }
    if (error instanceof Error && 'stdout' in error) {
      console.log(`stdout: ${String((error as any).stdout)}`);
    }
    
    throw error;
  }
}

async function setDarkTheme(page: Page, userId: string) {
  console.log(`Setting dark theme for user ${userId}...`);
  await page.evaluate((uid) => {
    // Set theme in localStorage
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.includes('theme') && key.includes(uid)) {
        localStorage.setItem(key, 'dark');
      }
    }
    // Also set global theme preference
    localStorage.setItem('theme', 'dark');
    // Apply dark class to document
    document.documentElement.classList.add('dark');
  }, userId);
  await delay(500);
}

async function login(page: Page, locale: Locale, username: string, password: string) {
  console.log(`Logging in as ${username}...`);
  // Keep login + post-login redirect inside the requested locale.
  await page.goto(makeUrl(locale, '/login?redirect=%2F'), { waitUntil: 'networkidle0' });
  
  // Wait for the form to be ready
  await page.waitForSelector('#username', { visible: true });
  await page.waitForSelector('#password', { visible: true });
  
  // Fill in credentials
  await page.type('#username', username, { delay: 50 });
  await page.type('#password', password, { delay: 50 });
  
  // Submit the form
  await page.click('button[type="submit"]');
  
  // Wait for navigation after login
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
  
  // Verify we're logged in by checking if we're redirected away from login page
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    throw new Error(`Failed to login as ${username}. Still on login page.`);
  }
  
  console.log(`Successfully logged in as ${username}`);
  
  // Get user ID and set dark theme
  const userId = await page.evaluate(() => {
    // Try to get user ID from localStorage or API
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.includes('user') && key.includes('id')) {
        return localStorage.getItem(key);
      }
    }
    return null;
  });
  
  if (userId) {
    await setDarkTheme(page, userId);
  } else {
    // Fallback: set dark theme globally
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
  }
}

async function getCSRFToken(page: Page): Promise<string> {
  const response = await page.evaluate(async () => {
    const res = await fetch('/api/csrf');
    return res.json();
  });
  return response.token || response.csrfToken || '';
}

async function logout(page: Page, locale: Locale) {
  console.log('Logging out...');
  try {
    // Get CSRF token
    const csrfToken = await getCSRFToken(page);
    
    // Make logout request
    await page.evaluate(async (token: string) => {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token
        },
        credentials: 'include'
      });
    }, csrfToken);
    
    // Navigate to login page to ensure we're logged out
    await page.goto(makeUrl(locale, '/login'), { waitUntil: 'domcontentloaded' });
    console.log('Logged out');
  } catch (error) {
    logError('Error during logout: ' + (error instanceof Error ? error.message : String(error)));
    // Try navigating to login page anyway
    await page.goto(makeUrl(locale, '/login'), { waitUntil: 'domcontentloaded' });
  }
}

async function getServers(page: Page): Promise<Server[]> {
  console.log('Fetching servers list...');
  const response = await page.evaluate(async () => {
    const res = await fetch('/api/servers');
    return res.json();
  });
  return response as Server[];
}

async function deleteServerDirect(serverId: string): Promise<{ success: boolean; backupCount: number; error?: string }> {
  console.log(`  Deleting server ${serverId}...`);
  
  try {
    const dbModule = await import('../src/lib/db');
    await dbModule.ensureDatabaseInitialized();
    const dbUtilsModule = await import('../src/lib/db-utils');
    
    // Verify server exists before deletion
    const serverInfo = dbUtilsModule.getServerInfoById(serverId);
    if (!serverInfo) {
      console.log(`  Server ${serverId} not found in database, skipping deletion`);
      return { success: false, backupCount: 0, error: 'Server not found' };
    }
    
    // Use dbUtils.deleteServer which handles the transaction and cleanup
    // This will throw an error if server is not found, but we already checked above
    const result = dbUtilsModule.dbUtils.deleteServer(serverId);
    
    if (result.serverChanges === 0) {
      return { success: false, backupCount: result.backupChanges, error: 'No server was deleted' };
    }
    
    console.log(`  Successfully deleted server ${serverId} and ${result.backupChanges} backup(s)`);
    return { success: true, backupCount: result.backupChanges };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    // If error is "Server not found", treat it as success (already deleted)
    if (errorMsg.includes('not found')) {
      console.log(`  Server ${serverId} not found (may already be deleted)`);
      return { success: false, backupCount: 0, error: 'Server not found' };
    }
    logError(`Failed to delete server ${serverId}: ${errorMsg}`);
    return { success: false, backupCount: 0, error: errorMsg };
  }
}

async function updateServerUrl(serverId: string, serverUrl: string) {
  console.log(`Updating server ${serverId} URL to: ${serverUrl}`);
  
  try {
    const dbModule = await import('../src/lib/db');
    await dbModule.ensureDatabaseInitialized();
    
    const dbUtilsModule = await import('../src/lib/db-utils');
    
    // Get existing server info to preserve alias and note
    const existingServer = dbUtilsModule.getServerInfoById(serverId);
    if (!existingServer) {
      // Server doesn't exist - this can happen if it was deleted
      // Return early instead of throwing to allow the script to continue
      console.log(`  Warning: Server ${serverId} not found in database, skipping URL update`);
      return;
    }
    
    // Update only the URL, preserving existing alias and note
    const result = dbUtilsModule.dbUtils.updateServer(serverId, { 
      server_url: serverUrl,
      alias: existingServer.alias,
      note: existingServer.note
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update server URL');
    }
    
    console.log(`Successfully updated server ${serverId} URL`);
  } catch (error) {
    throw new Error(`Failed to update server ${serverId} URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function updateServerPassword(serverId: string, password: string) {
  console.log(`Updating server ${serverId} password...`);
  
  try {
    const dbModule = await import('../src/lib/db');
    await dbModule.ensureDatabaseInitialized();
    
    const secretsModule = await import('../src/lib/secrets');
    
    const success = secretsModule.setServerPassword(serverId, password);
    
    if (!success) {
      throw new Error('Failed to update server password');
    }
    
    console.log(`Successfully updated server ${serverId} password`);
  } catch (error) {
    throw new Error(`Failed to update server ${serverId} password: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function takeScreenshot(
  page: Page,
  filename: string,
  screenshotDir: string,
  options?: {
  waitTime?: number;
  isSettingsPage?: boolean;
  isSettingsSidebar?: boolean;
  cropBottom?: number;
  clip?: { x: number; y: number; width: number; height: number };
  }
): Promise<boolean> {
  const waitTime = options?.waitTime ?? 2000;
  const isSettingsPage = options?.isSettingsPage ?? false;
  const isSettingsSidebar = options?.isSettingsSidebar ?? false;
  const cropBottom = options?.cropBottom ?? 0;
  const clip = options?.clip;
  
  console.log(colors.cyan, ` 📸 Taking screenshot: ${filename}...`, colors.reset);
  await delay(waitTime);

  // Resolve to absolute path so the file is always written under project root (avoids cwd issues)
  const filepath = resolve(process.cwd(), screenshotDir, filename);

  try {
  if (clip) {
    // Use clip for precise cropping
    await page.screenshot({ 
      path: filepath, 
      type: 'png',
      clip
    });
  } else if (isSettingsSidebar) {
    // For settings sidebar, capture only the sidebar and crop at the end of content
    const bounds = await page.evaluate(() => {
      // Find the sidebar with data attribute
      const sidebar = document.querySelector('[data-screenshot-target="settings-left-panel"]') as HTMLElement;
      if (sidebar) {
        const rect = sidebar.getBoundingClientRect();
        
        // Find the content area (the div with navigation items, excluding the header)
        const contentArea = sidebar.querySelector('div.space-y-4, div[class*="space-y"]');
        if (contentArea) {
          const contentRect = contentArea.getBoundingClientRect();
          
          // Find the last visible navigation button or group
          const buttons = Array.from(sidebar.querySelectorAll('button')) as HTMLElement[];
          const groups = Array.from(sidebar.querySelectorAll('div > div')) as HTMLElement[];
          
          let lastBottom = contentRect.top;
          
          // Check buttons
          for (const btn of buttons) {
            const btnRect = btn.getBoundingClientRect();
            if (btnRect.bottom > lastBottom && btnRect.top >= rect.top) {
              lastBottom = btnRect.bottom;
            }
          }
          
          // Check groups (like the notice for non-admin users)
          for (const group of groups) {
            const groupRect = group.getBoundingClientRect();
            // Only consider groups that are actually visible and have content
            if (groupRect.height > 0 && groupRect.bottom > lastBottom && groupRect.top >= rect.top) {
              lastBottom = groupRect.bottom;
            }
          }
          
          // Add a small padding at the bottom (16px)
          const padding = 16;
          const contentHeight = Math.min(lastBottom + padding - rect.top, rect.height);
          
          return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: Math.round(contentHeight)
          };
        }
        
        // Fallback: use full sidebar height
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        };
      }
      return null;
    });
    
    if (bounds) {
      await page.screenshot({ 
        path: filepath, 
        type: 'png',
        clip: {
          x: Math.round(bounds.x),
          y: Math.round(bounds.y),
          width: Math.round(bounds.width),
          height: bounds.height
        }
      });
    } else {
      // Fallback to full page
      await page.screenshot({ 
        path: filepath, 
        fullPage: true,
        type: 'png'
      });
    }
  } else if (isSettingsPage) {
    // For settings pages, capture only the right content area with a margin
    const bounds = await page.evaluate(() => {
      // First, try to find the element with the data attribute
      const contentCard = document.querySelector('[data-screenshot-target="settings-content-card"]');
      if (contentCard) {
        const rect = contentCard.getBoundingClientRect();
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        };
      }
      // Fallback: Find the settings content area (right side, excluding left panel, header, footer)
      const contentArea = document.querySelector('[role="main"] main, main > div, .settings-content');
      if (contentArea) {
        const rect = contentArea.getBoundingClientRect();
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        };
      }
      // Fallback: try to find the card/content container
      const card = document.querySelector('[class*="Card"], [class*="card"]');
      if (card) {
        const rect = card.getBoundingClientRect();
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        };
      }
      return null;
    });
    
    if (bounds) {
      const margin = 10;
      const viewportSize = await page.viewport();
      const pageWidth = viewportSize?.width || VIEWPORT_WIDTH;
      const pageHeight = viewportSize?.height || VIEWPORT_HEIGHT;
      
      // Calculate clip with margin, ensuring we don't go outside page bounds
      const clipX = Math.max(0, Math.round(bounds.x - margin));
      const clipY = Math.max(0, Math.round(bounds.y - margin));
      const clipWidth = Math.min(
        Math.round(bounds.width + (margin * 2)),
        pageWidth - clipX
      );
      const clipHeight = Math.min(
        Math.round(bounds.height + (margin * 2)),
        pageHeight - clipY
      );
      
      await page.screenshot({ 
        path: filepath, 
        type: 'png',
        clip: {
          x: clipX,
          y: clipY,
          width: clipWidth,
          height: clipHeight
        }
      });
    } else {
      // Fallback to full page
      await page.screenshot({ 
        path: filepath, 
        fullPage: true,
        type: 'png'
      });
    }
  } else {
    // For non-settings pages, capture full page but crop bottom
    const fullPageBounds = await page.evaluate(() => {
      return {
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight
      };
    });
    
    if (cropBottom > 0 && fullPageBounds.height > cropBottom) {
      await page.screenshot({ 
        path: filepath, 
        type: 'png',
        clip: {
          x: 0,
          y: 0,
          width: fullPageBounds.width,
          height: fullPageBounds.height - cropBottom
        }
      });
    } else {
      await page.screenshot({ 
        path: filepath, 
        fullPage: true,
        type: 'png'
      });
    }
  }

  recordDuration(filename, Date.now() - lastOperationTimestamp);
  logSuccess(`  💾 Screenshot saved: ${filepath}`);
  return true;
  } catch (err) {
    recordDuration(filename, Date.now() - lastOperationTimestamp);
    throw err;
  }
}

async function waitForDashboardLoad(page: Page) {
  // Wait for dashboard content to load
  try {
    await page.waitForSelector('[data-testid="dashboard"], .dashboard, main', { timeout: 10000 });
  } catch (error) {
    console.log(colors.yellow, 'Dashboard selector not found, continuing anyway...', colors.reset);
  }
  await delay(2000); // Additional wait for animations
}

async function switchToTableView(page: Page) {
  console.log('-------------------------------------------------------');
  console.log('Switching to table view...');
  try {
    // Wait for the dashboard to load
    await delay(2000);
    
    // Get user ID first to construct the proper localStorage key
    const userId = await page.evaluate(async () => {
      // Try to get user ID from API
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (data.authenticated && data.user && data.user.id) {
          return data.user.id;
        }
      } catch (e) {
        // Fallback: try to find user ID in localStorage
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.includes('user') && key.includes('id') && !key.includes('dashboard')) {
            const value = localStorage.getItem(key);
            if (value && value.length > 10) { // UUIDs are longer
              return value;
            }
          }
        }
      }
      return null;
    });
    
    // Check current view mode using the proper user-specific key
    const currentViewMode = await page.evaluate((uid) => {
      if (uid) {
        // Try user-specific key first: dashboard-view-mode:user-{userId}
        const userKey = `dashboard-view-mode:user-${uid}`;
        const value = localStorage.getItem(userKey);
        if (value) {
          return value;
        }
      }
      
      // Fallback: search all keys that contain dashboard-view-mode
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.includes('dashboard-view-mode')) {
          return localStorage.getItem(key);
        }
      }
      
      // If not found, return null (will default to clicking to switch)
      return null;
    }, userId);
    
    console.log(`Current view mode: ${currentViewMode || 'null (will switch to table)'}`);
    
    // If we're in overview mode, click once to get to table mode
    // If we're already in table mode, we don't need to click
    if (currentViewMode !== 'table') {
      // Try the evaluate method first (more reliable)
      try {
        const clicked = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          for (const btn of buttons) {
            const svg = btn.querySelector('svg');
            if (svg) {
              const svgClasses = svg.className.baseVal || svg.className;
              if (svgClasses.includes('LayoutDashboard') || svgClasses.includes('layout-dashboard')) {
                (btn as HTMLButtonElement).click();
                return true;
              }
            }
          }
          return false;
        });
        
        if (clicked) {
          await delay(2000);
          
          // Verify we're in table view now
          const newViewMode = await page.evaluate((uid) => {
            if (uid) {
              // Try user-specific key first
              const userKey = `dashboard-view-mode:user-${uid}`;
              const value = localStorage.getItem(userKey);
              if (value) {
                return value;
              }
            }
            
            // Fallback: search all keys
            const keys = Object.keys(localStorage);
            for (const key of keys) {
              if (key.includes('dashboard-view-mode')) {
                return localStorage.getItem(key);
              }
            }
            return null;
          }, userId);
          
          if (newViewMode !== 'table') {
            // Click again if we're still not in table view
            await page.evaluate(() => {
              const buttons = Array.from(document.querySelectorAll('button'));
              for (const btn of buttons) {
                const svg = btn.querySelector('svg');
                if (svg) {
                  const svgClasses = svg.className.baseVal || svg.className;
                  if (svgClasses.includes('LayoutDashboard') || svgClasses.includes('layout-dashboard')) {
                    (btn as HTMLButtonElement).click();
                    return;
                  }
                }
              }
            });
            await delay(2000);
          }
        } else {
          throw new Error('Button not found in evaluate method');
        }
      } catch (error) {
        console.log(colors.yellow, 'Could not click view mode button using evaluate method, trying CSS selector...', colors.reset);
        // Fallback: try CSS selector approach
        try {
          await page.waitForSelector('button:has(svg[class*="LayoutDashboard"]), button:has(svg[class*="Sheet"])', { timeout: 5000 });
          await page.click('button:has(svg[class*="LayoutDashboard"]), button:has(svg[class*="Sheet"])');
          await delay(2000);
        } catch (selectorError) {
          console.log(colors.red, 'Could not click view mode button using CSS selector either', colors.reset);
        }
      }
    }
  } catch (error) {
    logError('Error switching to table view: ' + (error instanceof Error ? error.message : String(error)));
  }
}


async function configureNtfyTopic(newTopic: string): Promise<void> {
  console.log(`Configuring NTFY topic to: ${newTopic}`);
  try {
    const dbUtilsModule = await import('../src/lib/db-utils');
    const defaultConfigModule = await import('../src/lib/default-config');
    
    const ntfyConfig = {
      ...defaultConfigModule.defaultNtfyConfig,
      topic: newTopic
    };
    
    dbUtilsModule.setNtfyConfig(ntfyConfig);
    console.log(`NTFY topic configured to "${newTopic}"`);
  } catch (error) {
    logError('Error configuring NTFY topic: ' + (error instanceof Error ? error.message : String(error)));
    throw error;
  }
}

async function configureSMTPConfig(): Promise<void> {
  console.log('Configuring SMTP config...');
  try {
    const dbUtilsModule = await import('../src/lib/db-utils');
    const smtpConfig = {
      host: 'localhost',
      port: 25,
      connectionType: 'plain' as const,
      username: '',
      password: '',
      mailto: 'user@somedomain.com',
      fromAddress: 'duplistatus@somedomain.com',
      requireAuth: false
    };
    
    dbUtilsModule.setSMTPConfig(smtpConfig);
    console.log('SMTP config configured successfully');
  } catch (error) {
    logError('Error configuring SMTP config: ' + (error instanceof Error ? error.message : String(error)));
    throw error;
  }
}

async function resetUsers(): Promise<void> {
  console.log('Resetting users table...');
  try {
    const dbModule = await import('../src/lib/db');
    await dbModule.ensureDatabaseInitialized();
    const db = dbModule.db;
    const bcryptModule = await import('bcrypt');
    const bcrypt = bcryptModule.default || bcryptModule;
    const { randomUUID } = await import('crypto');
    
    // Delete all users
    const deleteResult = db.prepare('DELETE FROM users').run();
    console.log(`Deleted ${deleteResult.changes} users`);
    
    // Create admin user
    const adminId = randomUUID();
    const adminPasswordHash = bcrypt.hashSync(ADMIN_PASSWORD!, 12);
    db.prepare(`
      INSERT INTO users (id, username, password_hash, is_admin, must_change_password)
      VALUES (?, ?, ?, ?, ?)
    `).run(adminId, ADMIN_USERNAME, adminPasswordHash, 1, 0);
    console.log(`Created admin user: ${ADMIN_USERNAME}`);
    
    // Create regular user
    const userId = randomUUID();
    const userPasswordHash = bcrypt.hashSync(USER_PASSWORD!, 12);
    db.prepare(`
      INSERT INTO users (id, username, password_hash, is_admin, must_change_password)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, USER_USERNAME, userPasswordHash, 0, 0);
    console.log(`Created user: ${USER_USERNAME}`);
    
    // Delete all sessions to force re-login
    db.prepare('DELETE FROM sessions').run();
    console.log('Cleared all sessions');
  } catch (error) {
    logError('Error resetting users: ' + (error instanceof Error ? error.message : String(error)));
    throw error;
  }
}

async function clearAuditLog(): Promise<void> {
  console.log('Clearing audit log...');
  try {
    const dbModule = await import('../src/lib/db');
    await dbModule.ensureDatabaseInitialized();
    const db = dbModule.db;
    
    const result = db.prepare('DELETE FROM audit_log').run();
    console.log(`Deleted ${result.changes} audit log entries`);
  } catch (error) {
    logError('Error clearing audit log: ' + (error instanceof Error ? error.message : String(error)));
    throw error;
  }
}

async function deleteServerDeletionAuditLogs(): Promise<number> {
  console.log('Deleting server_deletion audit log entries...');
  try {
    // Use direct database access in Node.js context
    const dbModule = await import('../src/lib/db');
    await dbModule.ensureDatabaseInitialized();
    const db = dbModule.db;
    
    const result = db.prepare('DELETE FROM audit_log WHERE action = ?').run('server_deleted');
    console.log(`Deleted ${result.changes} server_deletion audit log entries`);
    return result.changes;
  } catch (error) {
    logError('Error deleting server_deletion audit logs: ' + (error instanceof Error ? error.message : String(error)));
    return 0;
  }
}

async function findServersWithBackups(): Promise<string[]> {
  try {
    const dbModule = await import('../src/lib/db');
    await dbModule.ensureDatabaseInitialized();
    const db = dbModule.db;
    
    // Find all servers that have at least one backup
    const serversWithBackups = db.prepare(`
      SELECT DISTINCT server_id
      FROM backups
      ORDER BY server_id
    `).all() as { server_id: string }[];
    
    return serversWithBackups.map(row => row.server_id);
  } catch (error) {
    logError(`Error finding servers with backups: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

// Function to find servers that have overdue backups
async function findServersWithOverdueBackups(): Promise<string[]> {
  try {
    const dbUtilsModule = await import('../src/lib/db-utils');
    const dbModule = await import('../src/lib/db');
    await dbModule.ensureDatabaseInitialized();
    
    // Get all servers
    const allServers = dbModule.dbOps.getAllServers.all() as Array<{ id: string; name: string }>;
    const serversWithOverdue: string[] = [];
    
    // Check each server for overdue backups
    for (const server of allServers) {
      try {
        const overdueBackups = await dbUtilsModule.getOverdueBackupsForServer(server.id);
        if (overdueBackups && overdueBackups.length > 0) {
          serversWithOverdue.push(server.id);
        }
      } catch (error) {
        // Skip servers that fail to check (might not have backup settings configured)
        continue;
      }
    }
    
    return serversWithOverdue;
  } catch (error) {
    logError(`Error finding servers with overdue backups: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

async function deleteRecentBackupsToCreateOverdue(serverId: string, count: number = 1): Promise<boolean> {
  console.log(`Deleting ${count} recent backup(s) from server ${serverId} to create overdue backup...`);
  try {
    const dbModule = await import('../src/lib/db');
    await dbModule.ensureDatabaseInitialized();
    const db = dbModule.db;
    
    // Get all unique backup configurations (backup_name) for this server
    const backupConfigs = db.prepare(`
      SELECT DISTINCT backup_name
      FROM backups
      WHERE server_id = ?
      ORDER BY backup_name
    `).all(serverId) as { backup_name: string }[];
    
    if (backupConfigs.length === 0) {
      logError(`No backup configurations found for server ${serverId}`);
      return false;
    }
    
    // Use the first backup configuration
    const backupName = backupConfigs[0].backup_name;
    console.log(`  Using backup type: ${backupName}`);
    
    // Get the most recent backups for this server/backup_name combination
    const recentBackups = db.prepare(`
      SELECT id, date
      FROM backups
      WHERE server_id = ? AND backup_name = ?
      ORDER BY date DESC
      LIMIT ?
    `).all(serverId, backupName, count) as { id: string; date: string }[];
    
    if (recentBackups.length === 0) {
      logError(`No backups found for server ${serverId} with backup name ${backupName}`);
      return false;
    }
    
    console.log(`  Found ${recentBackups.length} backup(s) to delete`);
    
    // Delete the backups
    const deleteTransaction = db.transaction(() => {
      let deletedCount = 0;
      for (const backup of recentBackups) {
        const result = db.prepare('DELETE FROM backups WHERE id = ?').run(backup.id);
        if (result.changes > 0) {
          deletedCount++;
        }
      }
      return deletedCount;
    });
    
    const deletedCount = deleteTransaction();
    
    if (deletedCount > 0) {
      console.log(`  Successfully deleted ${deletedCount} backup(s) from server ${serverId}, backup type ${backupName}`);
      return true;
    } else {
      logError(`Failed to delete backups (no rows affected)`);
      return false;
    }
  } catch (error) {
    logError(`Error deleting recent backups: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function keepOnlyOneBackup(serverId: string): Promise<boolean> {
  console.log(`Keeping only one backup for server ${serverId} (keeping from backup_name with most entries)...`);
  try {
    const dbModule = await import('../src/lib/db');
    await dbModule.ensureDatabaseInitialized();
    const db = dbModule.db;
    
    // First, find which backup_name has the most entries
    const backupNameCounts = db.prepare(`
      SELECT backup_name, COUNT(*) as count
      FROM backups
      WHERE server_id = ?
      GROUP BY backup_name
      ORDER BY count DESC
    `).all(serverId) as { backup_name: string; count: number }[];
    
    if (backupNameCounts.length === 0) {
      console.log(`  No backups found for server ${serverId}`);
      return false;
    }
    
    // Get the backup_name with the most entries
    const backupNameWithMostEntries = backupNameCounts[0].backup_name;
    const entryCount = backupNameCounts[0].count;
    
    console.log(`  Found ${backupNameCounts.length} backup_name(s), ${backupNameWithMostEntries} has the most entries (${entryCount})`);
    
    // Get all backups for this server
    const allBackups = db.prepare(`
      SELECT id, date, backup_name
      FROM backups
      WHERE server_id = ?
      ORDER BY backup_name = ? DESC, date DESC
    `).all(serverId, backupNameWithMostEntries) as { id: string; date: string; backup_name: string }[];
    
    if (allBackups.length === 0) {
      console.log(`  No backups found for server ${serverId}`);
      return false;
    }
    
    if (allBackups.length === 1) {
      console.log(`  Server ${serverId} already has only one backup`);
      return true;
    }
    
    // Keep the most recent backup from the backup_name with most entries
    const backupToKeep = allBackups[0];
    const backupsToDelete = allBackups.slice(1);
    
    console.log(`  Found ${allBackups.length} backup(s), keeping most recent from ${backupNameWithMostEntries} (date: ${backupToKeep.date}), deleting ${backupsToDelete.length} other(s)`);
    
    // Delete all backups except the one we're keeping
    const deleteTransaction = db.transaction(() => {
      let deletedCount = 0;
      for (const backup of backupsToDelete) {
        const result = db.prepare('DELETE FROM backups WHERE id = ?').run(backup.id);
        if (result.changes > 0) {
          deletedCount++;
        }
      }
      return deletedCount;
    });
    
    const deletedCount = deleteTransaction();
    
    if (deletedCount > 0) {
      console.log(`  Successfully deleted ${deletedCount} backup(s) from server ${serverId}, kept 1 backup from ${backupNameWithMostEntries} (${entryCount} entries originally)`);
      return true;
    } else {
      logError(`Failed to delete backups (no rows affected)`);
      return false;
    }
  } catch (error) {
    logError(`Error keeping only one backup: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function captureCollectButtonPopup(
  page: Page,
  locale: Locale,
  screenshotDir: string,
  skipNavigation?: boolean
): Promise<{ popup: boolean; rightClick: boolean }> {
  try {
    if (!skipNavigation) {
      // Navigate to blank page; use networkidle0 so header (client-rendered) is ready
      console.log('🌐 Navigating to blank page (/blank)...');
      await page.goto(makeUrl(locale, '/blank'), { waitUntil: 'networkidle0' });
      await page.waitForSelector('[data-screenshot-target="collect-button"]', { timeout: 15000, visible: true });
    }
    
    // Find the collect button using locale-stable data attribute
    const collectButton = await page.$('[data-screenshot-target="collect-button"]');
    const collectButtonFound = !!collectButton;
    if (collectButton) {
      await collectButton.click();
    }

    if (collectButtonFound) {
      await delay(800); // Wait for popover to appear
      
      // Wait for popover to appear
      try {
        await page.waitForSelector('[data-screenshot-target="collect-button-popup"]', { timeout: 3000 });
      } catch (e) {
        // Fallback: wait for any popover
        await page.waitForSelector('[role="dialog"], [data-radix-popper-content-wrapper], [data-radix-popover-content]', { timeout: 2000 });
      }
      
      // Capture the popup
      const popupBounds = await page.evaluate(() => {
        // First try to find element with data attribute
        const popover = document.querySelector('[data-screenshot-target="collect-button-popup"]');
        if (popover) {
          const rect = popover.getBoundingClientRect();
          return {
            x: Math.max(0, rect.x - 10),
            y: Math.max(0, rect.y - 10),
            width: rect.width + 20,
            height: rect.height + 20
          };
        }
        // Fallback to generic selectors
        const fallbackPopover = document.querySelector('[data-radix-popover-content], [role="dialog"], [data-radix-popper-content-wrapper]');
        if (fallbackPopover) {
          const rect = fallbackPopover.getBoundingClientRect();
          return {
            x: Math.max(0, rect.x - 10),
            y: Math.max(0, rect.y - 10),
            width: rect.width + 20,
            height: rect.height + 20
          };
        }
        return null;
      });
      
      let popupSuccess = false;
      if (popupBounds) {
        popupSuccess = await takeScreenshot(page, 'screen-collect-button-popup.png', screenshotDir, {
          clip: popupBounds
        });
        console.log('Captured collect button popup');
      } else {
        logError('Could not find collect button popup bounds');
      }
      
      // Close popup by clicking outside or pressing Escape
      await page.keyboard.press('Escape');
      await delay(300);
      
      // Right click to show context menu - use Puppeteer native right-click so React's onContextMenu runs
      const collectBtnForRightClick = await page.$('[data-screenshot-target="collect-button"]');
      let rightClickPopupSuccess = false;
      if (collectBtnForRightClick) {
        await collectBtnForRightClick.click({ button: 'right' });
        await delay(800); // Wait for right-click menu to appear
        
        // Wait for context menu or modal
        try {
          await page.waitForSelector('[data-screenshot-target="collect-button-right-click-popup"]', { timeout: 3000 });
        } catch (e) {
          // Fallback: wait for modal/dialog
          await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 2000 });
        }
        
        // Capture right-click menu
        const menuBounds = await page.evaluate(() => {
          // First try to find element with data attribute
          const rightClickPopup = document.querySelector('[data-screenshot-target="collect-button-right-click-popup"]');
          if (rightClickPopup) {
            const rect = rightClickPopup.getBoundingClientRect();
            return {
              x: Math.max(0, rect.x - 10),
              y: Math.max(0, rect.y - 10),
              width: rect.width + 20,
              height: rect.height + 20
            };
          }
          // Fallback: look for the modal div
          const modal = document.querySelector('.fixed.inset-0 .bg-background.border.rounded-lg');
          if (modal) {
            const rect = modal.getBoundingClientRect();
            return {
              x: Math.max(0, rect.x - 10),
              y: Math.max(0, rect.y - 10),
              width: rect.width + 20,
              height: rect.height + 20
            };
          }
          // Fallback to generic selectors
          const fallbackMenu = document.querySelector('[role="dialog"]');
          if (fallbackMenu) {
            const rect = fallbackMenu.getBoundingClientRect();
            return {
              x: Math.max(0, rect.x - 10),
              y: Math.max(0, rect.y - 10),
              width: rect.width + 20,
              height: rect.height + 20
            };
          }
          return null;
        });
        
        if (menuBounds) {
          rightClickPopupSuccess = await takeScreenshot(page, 'screen-collect-button-right-click-popup.png', screenshotDir, {
            clip: menuBounds
          });
          console.log('Captured collect button right-click popup');
        } else {
          logError('Could not find collect button right-click popup bounds');
        }
        
        // Close menu
        await page.keyboard.press('Escape');
        await delay(500);
      }
      
      return { popup: popupSuccess, rightClick: rightClickPopupSuccess };
    } else {
      logError('Could not find collect button');
      return { popup: false, rightClick: false };
    }
  } catch (error) {
    logError('Error capturing collect button popup: ' + (error instanceof Error ? error.message : String(error)));
    return { popup: false, rightClick: false };
  }
}

const OVERDUE_HOVER_MAX_ATTEMPTS = 3;
const OVERDUE_HOVER_RETRY_DELAY_MS = 1500;
const OVERDUE_HOVER_WAIT_SELECTOR_MS = 5000;

async function captureOverdueBackupHoverCard(page: Page, screenshotDir: string): Promise<boolean> {
  const selector = '[data-screenshot-target="overdue-backup-item"]';
  let lastError = '';

  for (let attempt = 1; attempt <= OVERDUE_HOVER_MAX_ATTEMPTS; attempt++) {
    try {
      if (attempt > 1) {
        console.log(captureLog(`Overdue hover card attempt ${attempt}/${OVERDUE_HOVER_MAX_ATTEMPTS}...`));
        await delay(OVERDUE_HOVER_RETRY_DELAY_MS);
      }

      // Wait for overdue item to be present (handles late render/expansion)
      const hoverElement = await page.waitForSelector(selector, { timeout: OVERDUE_HOVER_WAIT_SELECTOR_MS }).catch(() => null);

      if (!hoverElement) {
        lastError = 'Could not find overdue backup item to hover';
        if (attempt < OVERDUE_HOVER_MAX_ATTEMPTS) {
          logError(lastError + ` (attempt ${attempt}/${OVERDUE_HOVER_MAX_ATTEMPTS})`);
        }
        continue;
      }

      await hoverElement.hover();
      await delay(1200); // Wait for tooltip to appear (delayDuration is 1000ms)

      const tooltipBounds = await page.evaluate(() => {
        const tooltip = document.querySelector('[data-screenshot-target="overdue-backup-tooltip"]');
        if (tooltip) {
          const rect = tooltip.getBoundingClientRect();
          return {
            x: Math.max(0, rect.x - 10),
            y: Math.max(0, rect.y - 10),
            width: rect.width + 20,
            height: rect.height + 20
          };
        }
        const fallbackTooltip = document.querySelector('[role="tooltip"], [data-radix-tooltip-content]');
        if (fallbackTooltip) {
          const rect = fallbackTooltip.getBoundingClientRect();
          return {
            x: Math.max(0, rect.x - 10),
            y: Math.max(0, rect.y - 10),
            width: rect.width + 20,
            height: rect.height + 20
          };
        }
        return null;
      });

      if (!tooltipBounds) {
        lastError = 'Could not find overdue backup tooltip bounds';
        if (attempt < OVERDUE_HOVER_MAX_ATTEMPTS) {
          logError(lastError + ` (attempt ${attempt}/${OVERDUE_HOVER_MAX_ATTEMPTS})`);
        }
        continue;
      }

      const success = await takeScreenshot(page, 'screen-overdue-backup-hover-card.png', screenshotDir, {
        clip: tooltipBounds
      });
      if (success) {
        console.log('Captured overdue backup hover card');
        return true;
      }
      lastError = 'Screenshot failed';
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < OVERDUE_HOVER_MAX_ATTEMPTS) {
        logError('Error capturing overdue backup hover card: ' + lastError + ` (attempt ${attempt}/${OVERDUE_HOVER_MAX_ATTEMPTS})`);
      }
    }
  }

  logError(lastError || 'Could not find overdue backup item to hover');
  return false;
}

async function captureBackupTooltip(page: Page, locale: Locale, screenshotDir: string): Promise<boolean> {
  try {
    // Navigate to dashboard in card mode
    await page.goto(makeUrl(locale, '/'), { waitUntil: 'networkidle0' });
    await waitForDashboardLoad(page);
    await delay(500);
    
    // Find all backup items
    const backupItems = await page.$$('[data-screenshot-trigger="backup-item"]');
    console.log(`Found ${backupItems.length} backup item(s)`);
    
    if (backupItems.length === 0) {
      logError('No backup items found on the page');
      return false;
    }
    
    let backupItemHandle: any = null;
    
    // Find the first backup item that is NOT overdue
    // Simplified check: just look for the AlertTriangle icon (overdue indicator)
    for (const item of backupItems) {
      const isOverdue = await item.evaluate((el) => {
        // Check if it has overdue warning icon (AlertTriangle)
        const hasOverdueIcon = el.querySelector('svg[class*="AlertTriangle"]') !== null;
        return hasOverdueIcon;
      });
      
      if (!isOverdue) {
        backupItemHandle = item;
        console.log('Found non-overdue backup item');
        break;
      }
    }
    
    // If all items are overdue, use the first one anyway (we'll still get a tooltip)
    if (!backupItemHandle && backupItems.length > 0) {
      backupItemHandle = backupItems[0];
      console.log('All backup items are overdue, using first item anyway');
    }
    
    if (backupItemHandle) {
      // Get the element's position to trigger mouse events properly
      const elementInfo = await backupItemHandle.evaluate((el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      });
      
      // Move mouse to the element and hover
      await page.mouse.move(elementInfo.x, elementInfo.y);
      await delay(500);
      
      // Trigger mouseenter event to ensure tooltip appears
      await backupItemHandle.evaluate((el: HTMLElement) => {
        const event = new MouseEvent('mouseenter', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        el.dispatchEvent(event);
      });
      
      // Wait for tooltip to appear (delayDuration is 1000ms, so wait at least 1500ms)
      await delay(1500);
      
      // Wait for tooltip to appear - check for both non-overdue and overdue tooltips
      try {
        await page.waitForSelector('[data-screenshot-target="backup-tooltip"], [data-screenshot-target="overdue-backup-tooltip"]', { timeout: 3000 });
      } catch (e) {
        // Try alternative selectors
        try {
          await page.waitForSelector('[data-radix-tooltip-content]', { timeout: 2000 });
        } catch (e2) {
          logError('Tooltip did not appear after hovering');
          // Debug: check what's on the page
          const debugInfo = await page.evaluate(() => {
            const items = document.querySelectorAll('[data-screenshot-trigger="backup-item"]');
            const tooltips = document.querySelectorAll('[data-screenshot-target="backup-tooltip"], [data-screenshot-target="overdue-backup-tooltip"]');
            return {
              backupItems: items.length,
              tooltips: tooltips.length,
              tooltipVisible: Array.from(tooltips).some((t: Element) => {
                const style = window.getComputedStyle(t);
                return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
              })
            };
          });
          console.log(`Debug info: ${JSON.stringify(debugInfo)}`);
          return false;
        }
      }
      await delay(500);
      
      // Capture the tooltip using data-screenshot-target (prefer non-overdue, but accept overdue too)
      const tooltipBounds = await page.evaluate(() => {
        // First try non-overdue tooltip
        let tooltip = document.querySelector('[data-screenshot-target="backup-tooltip"]');
        // If not found, try overdue tooltip
        if (!tooltip) {
          tooltip = document.querySelector('[data-screenshot-target="overdue-backup-tooltip"]');
        }
        // Fallback to any Radix tooltip
        if (!tooltip) {
          tooltip = document.querySelector('[data-radix-tooltip-content]');
        }
        
        if (tooltip) {
          const rect = tooltip.getBoundingClientRect();
          // Check if tooltip is actually visible
          const style = window.getComputedStyle(tooltip);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return null;
          }
          return {
            x: Math.max(0, rect.x - 10),
            y: Math.max(0, rect.y - 10),
            width: rect.width + 20,
            height: rect.height + 20
          };
        }
        return null;
      });
      
      if (tooltipBounds) {
        const success = await takeScreenshot(page, 'screen-backup-tooltip.png', screenshotDir, {
          clip: tooltipBounds
        });
        console.log('Captured backup tooltip');
        
        // Move mouse away to close tooltip
        await page.mouse.move(0, 0);
        
        return success;
      } else {
        logError('Could not find backup tooltip bounds');
        return false;
      }
    } else {
      logError('Could not find backup item to hover');
      return false;
    }
  } catch (error) {
    logError('Error capturing backup tooltip: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

async function captureDuplicatiConfiguration(page: Page, locale: Locale, screenshotDir: string, skipNavigation?: boolean): Promise<boolean> {
  try {
    if (!skipNavigation) {
      // Navigate to blank page; use networkidle0 so header is ready, then wait for trigger
      console.log('🌐 Navigating to blank page (/blank)...');
      await page.goto(makeUrl(locale, '/blank'), { waitUntil: 'networkidle0' });
      await page.waitForSelector('[data-screenshot-target="duplicati-configuration-trigger"]', { timeout: 15000, visible: true });
      await delay(500);
    }
    
    // Find and click the Duplicati button using locale-stable data attribute
    const button = await page.$('[data-screenshot-target="duplicati-configuration-trigger"]');
    
    if (button) {
      await button.click();
      await delay(800); // Wait for popover to appear
      
      // Wait for dropdown to appear
      try {
        await page.waitForSelector('[data-screenshot-target="duplicati-configuration"]', { timeout: 5000, visible: true });
      } catch (e) {
        logError('Duplicati dropdown did not appear');
        await page.keyboard.press('Escape');
        return false;
      }
      
      // Capture the dropdown using data-screenshot-target
      const dropdownBounds = await page.evaluate(() => {
        const dropdown = document.querySelector('[data-screenshot-target="duplicati-configuration"]');
        if (dropdown) {
          const rect = dropdown.getBoundingClientRect();
          return {
            x: Math.max(0, rect.x - 10),
            y: Math.max(0, rect.y - 10),
            width: rect.width + 20,
            height: rect.height + 20
          };
        }
        return null;
      });
      
      if (dropdownBounds) {
        const success = await takeScreenshot(page, 'screen-duplicati-configuration.png', screenshotDir, {
          clip: dropdownBounds
        });
        console.log('Captured Duplicati configuration dropdown');
        
        // Close dropdown
        await page.keyboard.press('Escape');
        await delay(500);
        return success;
      } else {
        logError('Could not find Duplicati dropdown bounds');
        // Close dropdown anyway
        await page.keyboard.press('Escape');
        await delay(500);
        return false;
      }
    } else {
      logError('Could not find Duplicati button');
      return false;
    }
  } catch (error) {
    logError('Error capturing Duplicati configuration: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

async function captureUserMenu(page: Page, locale: Locale, screenshotDir: string, userType: 'admin' | 'user', skipNavigation?: boolean): Promise<boolean> {
  try {
    if (!skipNavigation) {
      // Header is client-rendered; user menu trigger appears only after /api/auth/me completes.
      // Start listening before navigation so we don't miss the response.
      console.log('🌐 Navigating to blank page (/blank)...');
      const authMePromise = page.waitForResponse(
        (res) => res.url().includes('/api/auth/me'),
        { timeout: 18000 }
      ).catch(() => null);
      await page.goto(makeUrl(locale, '/blank'), { waitUntil: 'networkidle0' });
      await authMePromise;
      // Allow React to setState and re-render the header with the user trigger
      await delay(1200);
    } else {
      // When reusing same page, ensure any open overlay is closed and trigger is ready
      await page.keyboard.press('Escape');
      await page.keyboard.press('Escape');
      await delay(600);
    }

    // Wait for user menu trigger (data attribute only present after user is loaded)
    const buttonSelector = '[data-screenshot-target="user-menu-trigger"]';
    try {
      await page.waitForSelector(buttonSelector, { timeout: 15000, visible: true });
    } catch {
      logError('Could not find user menu button (wait for selector timed out)');
      return false;
    }
    
    const button = await page.$(buttonSelector);
    if (!button) {
      logError('Could not select user menu button element');
      return false;
    }
    
    await button.click();
    await delay(800); // Wait for dropdown animation to complete
    
    // Wait for the dropdown menu to appear using data-screenshot-target
    try {
      await page.waitForSelector('[data-screenshot-target="user-menu"]', { timeout: 5000, visible: true });
    } catch (e) {
      logError('User menu dropdown did not appear');
      // Debug: Check if element exists but not visible
      const exists = await page.$('[data-screenshot-target="user-menu"]');
      if (exists) {
        logError('Menu element exists but is not visible');
      } else {
        logError('Menu element does not exist in DOM');
      }
      return false;
    }
    
    // Capture both the button and dropdown menu with external margins
    const combinedBounds = await page.evaluate(() => {
      // Find the button (stable selector; only present when user is loaded)
      const buttonElement = document.querySelector('[data-screenshot-target="user-menu-trigger"]');
      
      // Find the dropdown menu
      const menuContent = document.querySelector('[data-screenshot-target="user-menu"]');
      
      if (buttonElement && menuContent) {
        const buttonRect = buttonElement.getBoundingClientRect();
        const menuRect = menuContent.getBoundingClientRect();
        
        // Calculate combined bounds with margin
        const margin = 5;
        const x = Math.min(buttonRect.x, menuRect.x);
        const y = Math.min(buttonRect.y, menuRect.y);
        const maxX = Math.max(buttonRect.x + buttonRect.width, menuRect.x + menuRect.width);
        const maxY = Math.max(buttonRect.y + buttonRect.height, menuRect.y + menuRect.height);
        
        return {
          x: Math.max(0, x - margin),
          y: Math.max(0, y - margin),
          width: (maxX - x) + 2*margin,
          height: (maxY - y) + 2*margin
        };
      }
      return null;
    });
    
    if (combinedBounds) {
      const filename = `screen-user-menu-${userType}.png`;
      const success = await takeScreenshot(page, filename, screenshotDir, {
        clip: combinedBounds
      });
      console.log(`Captured user menu dropdown: ${filename}`);
      
      await page.keyboard.press('Escape');
      return success;
    } else {
      logError('Could not find user menu button or dropdown bounds');
      await page.keyboard.press('Escape');
      return false;
    }
  } catch (error) {
    logError('Error capturing user menu: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

async function captureDashboardSummary(page: Page, locale: Locale, screenshotDir: string, filename: string): Promise<boolean> {
  try {
    // Navigate to dashboard
    await page.goto(makeUrl(locale, '/'), { waitUntil: 'networkidle0' });
    await waitForDashboardLoad(page);
    await delay(500);
    
    // Wait for the summary card to appear
    try {
      await page.waitForSelector('[data-screenshot-target="dashboard-summary"]', { timeout: 5000 });
    } catch (e) {
      logError('Dashboard summary card did not appear on the page');
      return false;
    }
    await delay(500);
    
    // Capture the summary card
    const summaryBounds = await page.evaluate(() => {
      const summaryDiv = document.querySelector('[data-screenshot-target="dashboard-summary"]');
      if (summaryDiv) {
        const rect = summaryDiv.getBoundingClientRect();
        return {
          x: Math.max(0, rect.x - 10),
          y: Math.max(0, rect.y - 10),
          width: rect.width + 20,
          height: rect.height + 20
        };
      }
      return null;
    });
    
    if (summaryBounds) {
      const success = await takeScreenshot(page, filename, screenshotDir, {
        clip: summaryBounds
      });
      console.log(`Captured dashboard summary card: ${filename}`);
      return success;
    } else {
      logError('Could not find dashboard summary card bounds');
      return false;
    }
  } catch (error) {
    logError('Error capturing dashboard summary card: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

async function captureOverviewSidePanel(page: Page, locale: Locale, screenshotDir: string): Promise<{ status: boolean; charts: boolean }> {
  try {
    // Navigate to dashboard
    await page.goto(makeUrl(locale, '/'), { waitUntil: 'networkidle0' });
    await waitForDashboardLoad(page);
    await delay(500);
    
    // Ensure we're in overview mode (the side panel only appears in overview mode)
    // Check current view mode and switch if needed
    const currentViewMode = await page.evaluate(() => {
      const userId = localStorage.getItem('user-id') || '';
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.includes('dashboard-view-mode') && key.includes(userId)) {
          return localStorage.getItem(key);
        }
      }
      // Fallback: search all keys
      for (const key of keys) {
        if (key.includes('dashboard-view-mode')) {
          return localStorage.getItem(key);
        }
      }
      return null;
    });
    
    if (currentViewMode !== 'overview') {
      console.log('Switching to overview mode...');
      // Switch to overview mode by clicking the view mode toggle
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        for (const btn of buttons) {
          const svg = btn.querySelector('svg');
          if (svg) {
            const svgClasses = svg.className.baseVal || svg.className;
            // Look for LayoutDashboard icon (overview mode) or Sheet icon (table mode)
            if (svgClasses.includes('LayoutDashboard') || svgClasses.includes('Sheet')) {
              // Click until we're in overview mode
              let currentMode = null;
              const keys = Object.keys(localStorage);
              for (const key of keys) {
                if (key.includes('dashboard-view-mode')) {
                  currentMode = localStorage.getItem(key);
                  break;
                }
              }
              // If we're in table mode, click once to get to overview
              if (currentMode === 'table') {
                (btn as HTMLButtonElement).click();
              }
              // If we're not in overview, click again
              setTimeout(() => {
                const keys2 = Object.keys(localStorage);
                for (const key of keys2) {
                  if (key.includes('dashboard-view-mode')) {
                    const mode = localStorage.getItem(key);
                    if (mode !== 'overview') {
                      (btn as HTMLButtonElement).click();
                    }
                  }
                }
              }, 100);
              return;
            }
          }
        }
      });
      await delay(500);
    }
    
    // Wait for the side panel to appear
    try {
      await page.waitForSelector('[data-screenshot-target="overview-side-panel"]', { timeout: 5000 });
    } catch (e) {
      logError('Overview side panel did not appear on the page');
      return { status: false, charts: false };
    }
    
    // Check current state using locale-stable data attribute on the toggle
    const currentState = await page.evaluate(() => {
      const panel = document.querySelector('[data-screenshot-target="overview-side-panel"]');
      if (!panel) return null;
      const toggleButton = panel.querySelector('[data-screenshot-target="overview-side-panel-toggle"]');
      if (toggleButton) {
        const state = toggleButton.getAttribute('data-overview-panel-state');
        if (state === 'status' || state === 'chart') return state;
      }
      return null;
    });
    
    if (!currentState) {
      logError('Could not determine current overview side panel state');
      return { status: false, charts: false };
    }
    
    console.log(`Current overview side panel state: ${currentState}`);
    
    let statusSuccess = false;
    let chartsSuccess = false;
    
    // Capture the first state (status)
    if (currentState === 'status') {
      const statusBounds = await page.evaluate(() => {
        const panelDiv = document.querySelector('[data-screenshot-target="overview-side-panel"]');
        if (panelDiv) {
          const rect = panelDiv.getBoundingClientRect();
          return {
            x: Math.max(0, rect.x - 10),
            y: Math.max(0, rect.y - 10),
            width: rect.width + 20,
            height: 200 + 20 // Crop to top 200 pixels
          };
        }
        return null;
      });
      
      if (statusBounds) {
        statusSuccess = await takeScreenshot(page, 'screen-overview-side-status.png', screenshotDir, {
          clip: statusBounds
        });
        console.log('Captured overview side panel (status state)');
      } else {
        logError('Could not find overview side panel bounds (status)');
      }
      
      // Click the toggle button to switch to chart mode
      await page.evaluate(() => {
        const panel = document.querySelector('[data-screenshot-target="overview-side-panel"]');
        if (panel) {
          const toggleButton = panel.querySelector('button[title*="Switch"], button[aria-label*="Switch"]');
          if (toggleButton) {
            (toggleButton as HTMLButtonElement).click();
          }
        }
      });
      await delay(1500); // Wait for the state to change
      
      // Capture the second state (charts)
      const chartsBounds = await page.evaluate(() => {
        const panelDiv = document.querySelector('[data-screenshot-target="overview-side-panel"]');
        if (panelDiv) {
          const rect = panelDiv.getBoundingClientRect();
          return {
            x: Math.max(0, rect.x - 10),
            y: Math.max(0, rect.y - 10),
            width: rect.width + 20,
            height: 200 + 20 // Crop to top 200 pixels
          };
        }
        return null;
      });
      
      if (chartsBounds) {
        chartsSuccess = await takeScreenshot(page, 'screen-overview-side-charts.png', screenshotDir, {
          clip: chartsBounds
        });
        console.log('Captured overview side panel (charts state)');
      } else {
        logError('Could not find overview side panel bounds (charts)');
      }
    } else {
      // We're in chart mode, capture charts first, then switch to status
      const chartsBounds = await page.evaluate(() => {
        const panelDiv = document.querySelector('[data-screenshot-target="overview-side-panel"]');
        if (panelDiv) {
          const rect = panelDiv.getBoundingClientRect();
          return {
            x: Math.max(0, rect.x - 10),
            y: Math.max(0, rect.y - 10),
            width: rect.width + 20,
            height: 200 + 20 // Crop to top 200 pixels
          };
        }
        return null;
      });
      
      if (chartsBounds) {
        chartsSuccess = await takeScreenshot(page, 'screen-overview-side-charts.png', screenshotDir, {
          clip: chartsBounds
        });
        console.log('Captured overview side panel (charts state)');
      } else {
        logError('Could not find overview side panel bounds (charts)');
      }
      
      // Click the toggle button to switch to status mode
      await page.evaluate(() => {
        const toggleButton = document.querySelector('[data-screenshot-target="overview-side-panel-toggle"]');
        if (toggleButton) {
          (toggleButton as HTMLButtonElement).click();
        }
      });
      await delay(1500); // Wait for the state to change
      
      // Capture the second state (status)
      const statusBounds = await page.evaluate(() => {
        const panelDiv = document.querySelector('[data-screenshot-target="overview-side-panel"]');
        if (panelDiv) {
          const rect = panelDiv.getBoundingClientRect();
          return {
            x: Math.max(0, rect.x - 10),
            y: Math.max(0, rect.y - 10),
            width: rect.width + 20,
            height: 200 + 20 // Crop to top 200 pixels
          };
        }
        return null;
      });
      
      if (statusBounds) {
        statusSuccess = await takeScreenshot(page, 'screen-overview-side-status.png', screenshotDir, {
          clip: statusBounds
        });
        console.log('Captured overview side panel (status state)');
      } else {
        logError('Could not find overview side panel bounds (status)');
      }
    }
    
    return { status: statusSuccess, charts: chartsSuccess };
  } catch (error) {
    logError('Error capturing overview side panel: ' + (error instanceof Error ? error.message : String(error)));
    return { status: false, charts: false };
  }
}

async function captureBackupHistoryTable(page: Page, locale: Locale, screenshotDir: string, serverId: string, skipNavigation?: boolean): Promise<boolean> {
  try {
    if (!skipNavigation) {
      // Navigate to server details page
      await page.goto(makeUrl(locale, `/detail/${serverId}`), { waitUntil: 'networkidle0' });
    }
    
    // Wait for content to load (client component fetches data after page load)
    const contentLoaded = await waitForServerDetailContent(page, 15000);
    if (!contentLoaded) {
      logError('Server detail content did not load in time');
    }
    
    // Wait for the backup history table to appear
    try {
      await page.waitForSelector('[data-screenshot-target="backup-history-table"]', { timeout: 10000 });
    } catch (e) {
      // Try waiting for any Card element as fallback
      try {
        await page.waitForSelector('[class*="Card"]', { timeout: 3000 });
        // Check if backup history card exists using evaluate
        const cardExists = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('[class*="Card"]'));
          return cards.some(card => {
            const title = card.querySelector('h3, [class*="CardTitle"]');
            return title && title.textContent?.includes('Backup History');
          });
        });
        if (!cardExists) {
          throw new Error('Backup History card not found');
        }
      } catch (e2) {
        logError('Backup history table did not appear on the page');
        // Debug: check what's on the page
        const debugInfo = await page.evaluate(() => {
          const cards = document.querySelectorAll('[class*="Card"]');
          const titles = Array.from(cards).map(card => {
            const title = card.querySelector('h3, [class*="CardTitle"]');
            return title?.textContent || '';
          });
          const allTargets = Array.from(document.querySelectorAll('[data-screenshot-target]')).map(el => el.getAttribute('data-screenshot-target'));
          const hasTable = document.querySelector('table') !== null;
          const url = window.location.href;
          return {
            totalCards: cards.length,
            cardTitles: titles,
            hasBackupHistoryTarget: !!document.querySelector('[data-screenshot-target="backup-history-table"]'),
            allScreenshotTargets: allTargets,
            hasTable,
            pageTitle: document.title,
            url
          };
        });
        console.log(`Debug info: ${JSON.stringify(debugInfo, null, 2)}`);
        
        // Try to get server data from API to see if server has backups
        try {
          const serverData = await page.evaluate(async (serverId) => {
            const res = await fetch(`/api/detail/${serverId}`);
            if (!res.ok) return { error: `API returned ${res.status}` };
            return await res.json();
          }, serverId);
          console.log(`Server API data: ${JSON.stringify({ 
            hasServer: !!serverData.server, 
            backupCount: serverData.server?.backups?.length || 0,
            serverName: serverData.server?.name 
          }, null, 2)}`);
        } catch (apiError) {
          console.log(`Failed to fetch server data: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
        }
        
        return false;
      }
    }
    await delay(500);
    
    // Find the backup history table section using data-screenshot-target
    const tableBounds = await page.evaluate(() => {
      // First try the data attribute
      let card = document.querySelector('[data-screenshot-target="backup-history-table"]');
      
      // Fallback: find Card with "Backup History" title
      if (!card) {
        const cards = Array.from(document.querySelectorAll('[class*="Card"]'));
        for (const c of cards) {
          const title = c.querySelector('h3, [class*="CardTitle"]');
          if (title && title.textContent?.includes('Backup History')) {
            card = c as HTMLElement;
            break;
          }
        }
      }
      
      // Fallback: find any Card containing a table
      if (!card) {
        const cards = Array.from(document.querySelectorAll('[class*="Card"]'));
        for (const c of cards) {
          const table = c.querySelector('table');
          if (table) {
            card = c as HTMLElement;
            break;
          }
        }
      }
      
      if (card) {
        const rect = card.getBoundingClientRect();
        return {
          x: Math.max(0, rect.x - 10),
          y: Math.max(0, rect.y - 10),
          width: rect.width + 20,
          height: rect.height + 20
        };
      }
      return null;
    });
    
    if (tableBounds) {
      const success = await takeScreenshot(page, 'screen-backup-history.png', screenshotDir, {
        clip: tableBounds
      });
      console.log('Captured backup history table');
      return success;
    } else {
      logError('Could not find backup history table bounds');
      return false;
    }
  } catch (error) {
    logError('Error capturing backup history table: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

/** Find metrics chart bounds on the current page (dashboard table view or server detail). */
async function findMetricsChartBounds(page: Page): Promise<{ x: number; y: number; width: number; height: number } | null> {
  return page.evaluate(() => {
    const chartSelectors = '[class*="chart"], [class*="recharts"], canvas, svg[class*="chart"], svg[class*="recharts"]';
    const cards = Array.from(document.querySelectorAll('[class*="Card"], [class*="card"]'));
    for (const card of cards) {
      const header = card.querySelector('h2, h3, [class*="CardTitle"]');
      const hasChart = card.querySelector(chartSelectors);
      if (hasChart || (header && (header.textContent || '').includes('Metrics'))) {
        const rect = card.getBoundingClientRect();
        return {
          x: Math.max(0, rect.x - 10),
          y: Math.max(0, rect.y - 10),
          width: rect.width + 20,
          height: rect.height + 20
        };
      }
    }
    const chart = document.querySelector(chartSelectors);
    if (chart) {
      const rect = chart.getBoundingClientRect();
      return {
        x: Math.max(0, rect.x - 10),
        y: Math.max(0, rect.y - 10),
        width: rect.width + 20,
        height: rect.height + 20
      };
    }
    return null;
  });
}

/** Capture the metrics chart on the current page (no navigation). Used on dashboard table view. */
async function captureMetricsChartOnCurrentPage(page: Page, screenshotDir: string): Promise<boolean> {
  try {
    const chartBounds = await findMetricsChartBounds(page);
    if (chartBounds) {
      const success = await takeScreenshot(page, 'screen-metrics.png', screenshotDir, {
        clip: chartBounds
      });
      console.log('Captured metrics chart');
      return success;
    }
    logError('Could not find metrics chart bounds');
    return false;
  } catch (error) {
    logError('Error capturing metrics chart: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

async function captureMetricsChart(page: Page, locale: Locale, screenshotDir: string, serverId: string, skipNavigation?: boolean): Promise<boolean> {
  try {
    if (!skipNavigation) {
      await page.goto(makeUrl(locale, `/detail/${serverId}`), { waitUntil: 'networkidle0' });
      const contentLoaded = await waitForServerDetailContent(page, 15000);
      if (!contentLoaded) {
        logError('Server detail content did not load in time');
      }
    }
    const chartBounds = await findMetricsChartBounds(page);
    if (chartBounds) {
      const success = await takeScreenshot(page, 'screen-metrics.png', screenshotDir, {
        clip: chartBounds
      });
      console.log('Captured metrics chart');
      return success;
    }
    logError('Could not find metrics chart bounds');
    return false;
  } catch (error) {
    logError('Error capturing metrics chart: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

async function captureAvailableBackupsModal(page: Page, locale: Locale, screenshotDir: string, serverId: string, skipNavigation?: boolean): Promise<boolean> {
  try {
    if (!skipNavigation) {
      // Navigate to server details page (should already be there, but ensure we're on the right page)
      await page.goto(makeUrl(locale, `/detail/${serverId}`), { waitUntil: 'networkidle0' });
    }
    
    // Wait for content to load (client component fetches data after page load)
    const contentLoaded = await waitForServerDetailContent(page, 15000);
    if (!contentLoaded) {
      logError('Server detail content did not load in time');
    }
    
    // Find and click the AvailableBackupsIcon button (button with History icon)
    const buttonFound = await page.evaluate(() => {
      // Find all buttons with History icon (lucide-react History icon)
      const buttons = Array.from(document.querySelectorAll('button'));
      for (const btn of buttons) {
        const svg = btn.querySelector('svg');
        if (svg) {
          // Check if button has the blue color class (text-blue-600) which indicates it's clickable
          const hasBlueClass = btn.classList.contains('text-blue-600') || 
                              btn.className.includes('text-blue-600');
          
          // Check if the button is inside a div that contains "Available Versions" label
          // Look in parent elements up to 5 levels
          let current: HTMLElement | null = btn.parentElement;
          let hasAvailableVersionsLabel = false;
          let levels = 0;
          while (current && levels < 5) {
            if (current.textContent?.includes('Available Versions')) {
              hasAvailableVersionsLabel = true;
              break;
            }
            current = current.parentElement;
            levels++;
          }
          
          if (hasBlueClass && hasAvailableVersionsLabel) {
            (btn as HTMLButtonElement).click();
            return true;
          }
        }
      }
      return false;
    });
    
    if (!buttonFound) {
      logError('Could not find AvailableBackupsIcon button');
      return false;
    }
    
    await delay(1500); // Wait for modal to appear
    
    // Wait for dialog to appear
    try {
      await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
    } catch (e) {
      logError('Dialog did not appear after clicking AvailableBackupsIcon');
      return false;
    }
    await delay(500);
    
    // Capture the dialog/modal
    const dialogBounds = await page.evaluate(() => {
      // Find the DialogContent (the actual modal content)
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        // Find the DialogContent inside the dialog
        const dialogContent = dialog.querySelector('[class*="DialogContent"], [class*="dialog-content"]');
        if (dialogContent) {
          const rect = dialogContent.getBoundingClientRect();
          return {
            x: Math.max(0, rect.x - 10),
            y: Math.max(0, rect.y - 10),
            width: rect.width + 20,
            height: rect.height + 20
          };
        }
        // Fallback: use the dialog itself
        const rect = dialog.getBoundingClientRect();
        return {
          x: Math.max(0, rect.x - 10),
          y: Math.max(0, rect.y - 10),
          width: rect.width + 20,
          height: rect.height + 20
        };
      }
      return null;
    });
    
    if (dialogBounds) {
      const success = await takeScreenshot(page, 'screen-available-backups-modal.png', screenshotDir, {
        clip: dialogBounds
      });
      console.log('Captured AvailableBackupsIcon modal');
      
      // Close dialog
      await page.keyboard.press('Escape');
      return success;
    } else {
      logError('Could not find AvailableBackupsIcon modal bounds');
      // Close dialog anyway
      await page.keyboard.press('Escape');
      return false;
    }
  } catch (error) {
    logError('Error capturing AvailableBackupsIcon modal: ' + (error instanceof Error ? error.message : String(error)));
    // Try to close dialog if it's open
    try {
      await page.keyboard.press('Escape');
    } catch (e) {
      // Ignore
    }
    return false;
  }
}

async function captureServerOverdueMessage(page: Page, locale: Locale, screenshotDir: string): Promise<boolean> {
  try {
    // Get all servers from database (more reliable than API)
    const dbModule = await import('../src/lib/db');
    await dbModule.ensureDatabaseInitialized();
    const allDbServers = dbModule.dbOps.getAllServers.all() as Array<{ id: string; name: string; server_url: string; alias: string; note: string }>;
    const servers: Server[] = allDbServers.map(s => ({
      id: s.id,
      name: s.name,
      alias: s.alias || '',
      note: s.note || '',
      server_url: s.server_url || '',
      backups: []
    }));
    
    // Find a server with overdue backups
    let serverWithOverdue: Server | null = null;
    for (const server of servers) {
      const serverDetails = await page.evaluate(async (serverId) => {
        const res = await fetch(`/api/detail/${serverId}`);
        return res.json();
      }, server.id);
      
      if (serverDetails.overdueBackups && serverDetails.overdueBackups.length > 0) {
        serverWithOverdue = server;
        break;
      }
    }
    
    if (!serverWithOverdue) {
      logError('Could not find a server with overdue backups');
      return false;
    }
    
    console.log(`Found server with overdue backups: ${serverWithOverdue.name} (${serverWithOverdue.id})`);
    
    // Navigate to the server detail page of the server that has overdue backups (so the overdue message is shown)
    const overdueDetailUrl = makeUrl(locale, `/detail/${serverWithOverdue.id}`);
    console.log(`🌐 Navigating to server-with-overdue detail page: ${overdueDetailUrl}`);
    await page.goto(overdueDetailUrl, { waitUntil: 'networkidle0' });
    
    // Verify we are on the correct server's detail page (URL should contain this server id)
    const currentUrl = page.url();
    if (!currentUrl.includes(serverWithOverdue.id)) {
      logError(`After navigation we are not on server-with-overdue page: current URL ${currentUrl}, expected to contain ${serverWithOverdue.id}`);
      return false;
    }
    
    // Wait for content to load (client component fetches data after page load)
    const contentLoaded = await waitForServerDetailContent(page, 15000);
    if (!contentLoaded) {
      logError('Server detail content did not load in time');
    }
    
    // Allow time for client hydration and DetailAutoRefresh to refetch from API (fresh overdue data)
    await delay(4000);
    
    // Wait for the overdue message to appear (longer timeout for client refetch + render)
    try {
      await page.waitForSelector('[data-screenshot-target="server-overdue-message"]', { timeout: 15000 });
    } catch (e) {
      logError('Overdue message did not appear on the page');
      return false;
    }
    await delay(500);
    
    // Capture the overdue message div
    const messageBounds = await page.evaluate(() => {
      const messageDiv = document.querySelector('[data-screenshot-target="server-overdue-message"]');
      if (messageDiv) {
        const rect = messageDiv.getBoundingClientRect();
        return {
          x: Math.max(0, rect.x - 10),
          y: Math.max(0, rect.y - 10),
          width: rect.width + 20,
          height: rect.height + 20
        };
      }
      return null;
    });
    
    if (messageBounds) {
      const success = await takeScreenshot(page, 'screen-server-overdue-message.png', screenshotDir, {
        clip: messageBounds
      });
      console.log('Captured server overdue message');
      return success;
    } else {
      logError('Could not find server overdue message bounds');
      return false;
    }
  } catch (error) {
    logError('Error capturing server overdue message: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

async function main() {
  const localesToRun = parseLocaleArg();
  console.log(colors.green, '\n');
  console.log('-------------------------------------------------------' );
  console.log('Starting screenshot automation');
  console.log(`Locales: ${localesToRun.join(', ')}`);
  console.log('-------------------------------------------------------\n',colors.reset);
  
  
  // Arrays to track screenshot results
  const successful: string[] = [];
  const failed: string[] = [];
  screenshotDurations.clear();
  scriptStartTime = Date.now();
  lastOperationTimestamp = Date.now();

  function formatDuration(ms: number): string {
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.round(ms)}ms`;
  }
  
  // Reset users and clear audit log at the beginning
  await resetUsers();
  await clearAuditLog();
  
  // Check health first
  const isHealthy = await checkHealth();
  if (!isHealthy) {
    logError('Application is not running or health check failed. Please start the application on port 8666.');
    process.exit(1);
  }
  
  // Generate test data
  await generateTestData();
  
  // Configure NTFY topic and SMTP config after test data generation
  await configureNtfyTopic('duplicati-screenshots');
  await configureSMTPConfig();
  
  // Ensure screenshot directories exist (per locale)
  for (const locale of localesToRun) {
    await ensureDirectoryExists(getScreenshotDir(locale));
  }
  
  const browser = await puppeteer.launch({
    headless: true, // Run in headless mode for server environments
    defaultViewport: {
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      // Additional performance flags:
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-breakpad',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection',
      '--disable-popup-blocking',
      '--disable-renderer-backgrounding',
      '--disable-sync',
      '--disable-translate',
      '--metrics-recording-only',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
    ]
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
  
  try {
    // Login once (admin) to establish auth cookies; we will switch locales via URL prefix.
    await login(page, 'en', ADMIN_USERNAME, ADMIN_PASSWORD!);

    // Get a server with backups for Phase A metrics screenshot (more data before cleanup)
    const dbModuleForMetrics = await import('../src/lib/db');
    await dbModuleForMetrics.ensureDatabaseInitialized();
    const serversWithBackupsForMetrics = await findServersWithBackups();
    const metricsServerId = serversWithBackupsForMetrics.length > 0 ? serversWithBackupsForMetrics[0] : null;
    if (!metricsServerId) console.log('Warning: No server with backups found for Phase A metrics screenshot');

    // -------------------------
    // Phase A (pre-cleanup): capture for requested locales
    // -------------------------
    const preparation1Ms = Date.now() - lastOperationTimestamp;
    lastOperationTimestamp = Date.now();
    const origLog = console.log;
    const origErr = console.error;
    console.log = (...args: unknown[]) => {
      const first = args[0];
      const prefixed = typeof first === 'string' ? [captureLog(first), ...args.slice(1)] : [captureLog(''), ...args];
      origLog.apply(console, prefixed);
    };
    console.error = (...args: unknown[]) => {
      const first = args[0];
      const prefixed = typeof first === 'string' ? [captureLog(first), ...args.slice(1)] : [captureLog(''), ...args];
      origErr.apply(console, prefixed);
    };

    for (const locale of localesToRun) {
      const screenshotDir = getScreenshotDir(locale);
      currentCaptureLocale = locale;

      console.log('-------------------------------------------------------');
      console.log(`🌐 [Phase A] Capturing locale: ${locale}`);

      // Navigate to dashboard
      console.log('🌐 Navigating to dashboard page (/)...');
      await page.goto(makeUrl(locale, '/'), { waitUntil: 'networkidle0' });
      await waitForDashboardLoad(page);

      // Dashboard (card/overview) screenshot
      console.log('-------------------------------------------------------');
      console.log('Taking screenshot of dashboard in card mode (overview mode)...');
      const dashboardCardMode = await takeScreenshot(page, 'screen-main-dashboard-card-mode.png', screenshotDir, { cropBottom: 80 });
      if (dashboardCardMode) successful.push('screen-main-dashboard-card-mode.png');
      else failed.push('screen-main-dashboard-card-mode.png');

      // Overdue backup hover card (uses current dashboard state)
      console.log('-------------------------------------------------------');
      console.log('Capturing overdue backup hover card...');
      const overdueHoverCard = await captureOverdueBackupHoverCard(page, screenshotDir);
      if (overdueHoverCard) successful.push('screen-overdue-backup-hover-card.png');
      else failed.push('screen-overdue-backup-hover-card.png');

      // Regular backup tooltip (navigates internally)
      console.log('-------------------------------------------------------');
      console.log('Capturing backup tooltip...');
      const backupTooltip = await captureBackupTooltip(page, locale, screenshotDir);
      if (backupTooltip) successful.push('screen-backup-tooltip.png');
      else failed.push('screen-backup-tooltip.png');

      // Dashboard summary card (navigates internally)
      console.log('-------------------------------------------------------');
      console.log('Capturing dashboard summary card (screen-dashboard-summary.png)...');
      const dashboardSummary = await captureDashboardSummary(page, locale, screenshotDir, 'screen-dashboard-summary.png');
      if (dashboardSummary) successful.push('screen-dashboard-summary.png');
      else failed.push('screen-dashboard-summary.png');

      // Overview side panel (navigates internally)
      console.log('-------------------------------------------------------');
      console.log('Capturing overview side panel...');
      const overviewSidePanel = await captureOverviewSidePanel(page, locale, screenshotDir);
      if (overviewSidePanel.status) successful.push('screen-overview-side-status.png');
      else failed.push('screen-overview-side-status.png');
      if (overviewSidePanel.charts) successful.push('screen-overview-side-charts.png');
      else failed.push('screen-overview-side-charts.png');

      // Toolbar elements (blank page): each capture navigates to /blank for a clean state
      console.log('-------------------------------------------------------');
      console.log('Capturing collect button popup...');
      const collectPopups = await captureCollectButtonPopup(page, locale, screenshotDir);
      if (collectPopups.popup) successful.push('screen-collect-button-popup.png');
      else failed.push('screen-collect-button-popup.png');
      if (collectPopups.rightClick) successful.push('screen-collect-button-right-click-popup.png');
      else failed.push('screen-collect-button-right-click-popup.png');

      console.log('-------------------------------------------------------');
      console.log('Capturing Duplicati configuration dropdown...');
      const duplicatiConfig = await captureDuplicatiConfiguration(page, locale, screenshotDir);
      if (duplicatiConfig) successful.push('screen-duplicati-configuration.png');
      else failed.push('screen-duplicati-configuration.png');

      console.log('-------------------------------------------------------');
      console.log('Capturing user menu dropdown (admin)...');
      const userMenuAdmin = await captureUserMenu(page, locale, screenshotDir, 'admin');
      if (userMenuAdmin) successful.push('screen-user-menu-admin.png');
      else failed.push('screen-user-menu-admin.png');
    }
    
    // Get list of servers from database (more reliable than API)
    // This will be our source of truth for available servers
    const mainDbModule = await import('../src/lib/db');
    await mainDbModule.ensureDatabaseInitialized();
    const dbUtilsModule = await import('../src/lib/db-utils');
    
    // Get all servers from database
    const mainAllDbServers = mainDbModule.dbOps.getAllServers.all() as Array<{ id: string; name: string; server_url: string; alias: string; note: string }>;
    
    // Convert to Server format for consistency
    let availableServers: Server[] = mainAllDbServers.map(s => ({
      id: s.id,
      name: s.name,
      alias: s.alias || '',
      note: s.note || '',
      server_url: s.server_url || '',
      backups: []
    }));
    
    console.log(`Found ${availableServers.length} servers in database`);
    
    // Find servers that have backups - we need to keep at least one of these
    const serversWithBackups = await findServersWithBackups();
    console.log(`Found ${serversWithBackups.length} server(s) with backups`);
    
    // Find servers with overdue backups - prefer these for protection
    const serversWithOverdue = await findServersWithOverdueBackups();
    console.log(`Found ${serversWithOverdue.length} server(s) with overdue backups`);
    
    // Identify which server to protect (keep) - prefer servers with overdue backups
    let protectedServerId: string | null = null;
    
    // First, try to find a server with overdue backups
    if (serversWithOverdue.length > 0) {
      // Find the first server in our list that has overdue backups
      for (const server of availableServers) {
        if (serversWithOverdue.includes(server.id)) {
          protectedServerId = server.id;
          console.log(`Protecting server ${server.name} (${server.id}) - it has overdue backups and will be used for overdue screenshot`);
          break;
        }
      }
    }
    
    // Fallback: if no server with overdue backups found, use first server with backups
    if (!protectedServerId && serversWithBackups.length > 0) {
      for (const server of availableServers) {
        if (serversWithBackups.includes(server.id)) {
          protectedServerId = server.id;
          console.log(`Protecting server ${server.name} (${server.id}) - it has backups (no overdue backups found, will create one later)`);
          break;
        }
      }
    }
    
    // Keep only 3 servers, delete the rest (but never delete the protected server)
    console.log('-------------------------------------------------------');
    console.log('Keeping only 3 servers, deleting the rest...');
    if (availableServers.length > 3) {
      // Sort servers: protected server first, then others
      const sortedServers = [...availableServers].sort((a, b) => {
        if (a.id === protectedServerId) return -1;
        if (b.id === protectedServerId) return 1;
        return 0;
      });
      
      // Keep first 3 (which includes protected server if it exists)
      const serversToKeep = sortedServers.slice(0, 3);
      const serversToDelete = sortedServers.slice(3);
      
      // Double-check: if protected server is not in keep list, add it and remove last one
      if (protectedServerId && !serversToKeep.some(s => s.id === protectedServerId)) {
        // Remove the last server from keep list and add protected server
        serversToKeep.pop();
        const protectedServer = availableServers.find(s => s.id === protectedServerId);
        if (protectedServer) {
          serversToKeep.push(protectedServer);
          // Remove protected server from delete list if it's there
          const deleteIndex = serversToDelete.findIndex(s => s.id === protectedServerId);
          if (deleteIndex >= 0) {
            serversToDelete.splice(deleteIndex, 1);
          }
        }
      }
      
      console.log(`Deleting ${serversToDelete.length} server(s), keeping 3...`);
      if (protectedServerId) {
        console.log(`  Protected server (has backups): ${availableServers.find(s => s.id === protectedServerId)?.name || protectedServerId}`);
      }
      
      for (const server of serversToDelete) {
        // Never delete the protected server
        if (server.id === protectedServerId) {
          console.log(`  Skipping protected server ${server.name} (${server.id})`);
          continue;
        }
        
        // Delete server directly using database operations
        const deleteResult = await deleteServerDirect(server.id);
        
        if (deleteResult.success) {
          // Remove from available servers list immediately after successful deletion
          availableServers = availableServers.filter(s => s.id !== server.id);
        } else {
          // Verify if server still exists - if not, deletion actually succeeded
          const dbUtilsModule = await import('../src/lib/db-utils');
          const stillExists = dbUtilsModule.getServerInfoById(server.id);
          if (!stillExists) {
            console.log(`  Server ${server.id} was deleted successfully (verified in database)`);
            availableServers = availableServers.filter(s => s.id !== server.id);
          } else {
            logError(`Failed to delete server ${server.id}: ${deleteResult.error || 'Unknown error'}`);
          }
        }
        
        await delay(500); // Small delay between deletions
      }
      
      // Log how many servers remain in the database after deletion
      const dbModule = await import('../src/lib/db');
      await dbModule.ensureDatabaseInitialized();
      const remainingServerCount = dbModule.db.prepare('SELECT COUNT(*) as count FROM servers').get() as { count: number };
      console.log(`  Deletion complete. ${remainingServerCount.count} server(s) remaining in database.`);
      
      // Refresh the page to see updated server list
      await page.goto(makeUrl('en', '/'), { waitUntil: 'networkidle0' });
      await waitForDashboardLoad(page);
    }
    
    // Now availableServers contains only the remaining servers
    // No need to fetch from API or verify - we already have the source of truth
    
    // For one of the servers (not the protected one), keep only one backup
    if (availableServers.length > 0) {
      console.log('-------------------------------------------------------');
      console.log('Keeping only one backup for a non-protected server...');
      
      // Find a server that is NOT the protected server and has backups
      const serversWithBackups = await findServersWithBackups();
      let serverToReduce: Server | null = null;
      
      for (const server of availableServers) {
        // Skip the protected server (never reduce its backups; we need it for the overdue message screenshot)
        if (server.id === protectedServerId) {
          continue;
        }
        // Check if this server has backups
        if (serversWithBackups.includes(server.id)) {
          serverToReduce = server;
          break;
        }
      }
      
      if (serverToReduce) {
        console.log(`Reducing backups for server ${serverToReduce.name} (${serverToReduce.id}) to only one backup...`);
        await keepOnlyOneBackup(serverToReduce.id);
        await delay(500);
      } else {
        console.log('No non-protected server with backups found to reduce (this is okay)');
      }
    }
    
    if (availableServers.length < 2) {
      console.log(`Warning: Only ${availableServers.length} server(s) remaining, need at least 2 to configure`);
    } else {
      // Configure 2 servers with URLs and passwords
      // Make sure we don't configure the protected server if we only have 2 servers
      const serversToConfigure = availableServers
        .filter(s => protectedServerId ? s.id !== protectedServerId : true)
        .slice(0, 2);
      
      // If we filtered out protected server and don't have 2 servers, use remaining servers
      const actualServersToConfigure = serversToConfigure.length >= 2 
        ? serversToConfigure 
        : availableServers.slice(0, 2);
      
      // Configure first server: http://{servername}.local:8200
      const firstServer = actualServersToConfigure[0];
      const firstServerUrl = `http://${firstServer.name}.local:8200`;
      console.log(`Configuring server 1: ${firstServer.name} with URL: ${firstServerUrl}`);
      try {
        await updateServerUrl(firstServer.id, firstServerUrl);
        await delay(500);
        await updateServerPassword(firstServer.id, 'no-password');
        await delay(500);
      } catch (error) {
        logError(`Error configuring server ${firstServer.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Configure second server: http://192.168.x.y:8200 where x and y are random 40-250
      if (actualServersToConfigure.length >= 2) {
        const secondServer = actualServersToConfigure[1];
        const x = Math.floor(Math.random() * (250 - 40 + 1)) + 40;
        const y = Math.floor(Math.random() * (250 - 40 + 1)) + 40;
        const secondServerUrl = `http://192.168.${x}.${y}:8200`;
        console.log(`Configuring server 2: ${secondServer.name} with URL: ${secondServerUrl}`);
        try {
          await updateServerUrl(secondServer.id, secondServerUrl);
          await delay(500);
          await updateServerPassword(secondServer.id, 'no-password');
          await delay(500);
        } catch (error) {
          logError(`Error configuring server ${secondServer.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      // Refresh the page to see updated server configurations
      await page.goto(makeUrl('en', '/'), { waitUntil: 'networkidle0' });
      await waitForDashboardLoad(page);
    }
    
    // Check if we already have a server with overdue backups (from test data generation)
    // If so, we don't need to create more overdue backups
    const finalServers = availableServers;
    const currentServersWithOverdue = await findServersWithOverdueBackups();
    
    if (currentServersWithOverdue.length > 0) {
      console.log('-------------------------------------------------------');
      console.log(`Found ${currentServersWithOverdue.length} server(s) with overdue backups (from test data generation)`);
      console.log('Skipping redundant backup deletion - overdue backups already exist');
      
      // Verify that at least one of the remaining servers has overdue backups
      const remainingServersWithOverdue = finalServers.filter(s => currentServersWithOverdue.includes(s.id));
      if (remainingServersWithOverdue.length === 0) {
        logError('Warning: No remaining servers have overdue backups after deletion');
        // Find a server with backups to create overdue backup
        const currentServersWithBackups = await findServersWithBackups();
        let serverToMakeOverdue: Server | null = null;
        for (const server of finalServers) {
          if (currentServersWithBackups.includes(server.id)) {
            serverToMakeOverdue = server;
            console.log(`Creating overdue backup for server ${server.name} (no overdue backups in remaining servers)`);
            break;
          }
        }
        
        if (serverToMakeOverdue) {
          const backupsToDelete = Math.min(2, Math.floor(Math.random() * 2) + 1);
          await deleteRecentBackupsToCreateOverdue(serverToMakeOverdue.id, backupsToDelete);
          await delay(300);
        }
      } else {
        console.log(`✅ At least one remaining server (${remainingServersWithOverdue[0].name}) has overdue backups`);
      }
    } else {
      // No overdue backups found - create one (shouldn't happen if test data generation worked correctly)
      console.log('-------------------------------------------------------');
      console.log('Warning: No servers with overdue backups found. Creating one now...');
      const currentServersWithBackups = await findServersWithBackups();
      let serverToMakeOverdue: Server | null = null;
      
      // Prefer protected server if it has backups
      if (protectedServerId) {
        serverToMakeOverdue = finalServers.find(s => s.id === protectedServerId) || null;
        if (serverToMakeOverdue && currentServersWithBackups.includes(serverToMakeOverdue.id)) {
          console.log(`Using protected server for overdue backup: ${serverToMakeOverdue.name}`);
        } else {
          serverToMakeOverdue = null;
        }
      }
      
      // If protected server not found or doesn't have backups, find first server with backups
      if (!serverToMakeOverdue) {
        for (const server of finalServers) {
          if (currentServersWithBackups.includes(server.id)) {
            serverToMakeOverdue = server;
            console.log(`Using server with backups for overdue backup: ${server.name}`);
            break;
          }
        }
      }
      
      if (serverToMakeOverdue) {
        const backupsToDelete = Math.min(2, Math.floor(Math.random() * 2) + 1);
        await deleteRecentBackupsToCreateOverdue(serverToMakeOverdue.id, backupsToDelete);
        await delay(1000);
      } else {
        logError('Could not find any server with backups to make overdue');
      }
    }
    
    // -------------------------
    // Phase B (post-cleanup): capture for requested locales
    // -------------------------
    const preparation2Ms = Date.now() - lastOperationTimestamp;
    lastOperationTimestamp = Date.now();

    for (const locale of localesToRun) {
      const screenshotDir = getScreenshotDir(locale);
      currentCaptureLocale = locale;

      console.log('-------------------------------------------------------');
      console.log(`🌐 [Phase B] Capturing locale: ${locale}`);

      // Navigate to dashboard and switch to table view
      await page.goto(makeUrl(locale, '/'), { waitUntil: 'networkidle0' });
      await waitForDashboardLoad(page);
      await switchToTableView(page);
      await delay(500);

      console.log('-------------------------------------------------------');
      console.log('Taking screenshot of dashboard in table mode...');
      const dashboardTableMode = await takeScreenshot(page, 'screen-main-dashboard-table-mode.png', screenshotDir, { cropBottom: 80 });
      if (dashboardTableMode) successful.push('screen-main-dashboard-table-mode.png');
      else failed.push('screen-main-dashboard-table-mode.png');

      // Metrics chart on dashboard table view (same page, no navigation)
      console.log('-------------------------------------------------------');
      console.log('Capturing metrics chart...');
      const metricsChart = await captureMetricsChartOnCurrentPage(page, screenshotDir);
      if (metricsChart) successful.push('screen-metrics.png');
      else failed.push('screen-metrics.png');

      console.log('-------------------------------------------------------');
      console.log('Capturing dashboard summary card (screen-dashboard-summary-table.png)...');
      const dashboardSummaryTable = await captureDashboardSummary(page, locale, screenshotDir, 'screen-dashboard-summary-table.png');
      if (dashboardSummaryTable) successful.push('screen-dashboard-summary-table.png');
      else failed.push('screen-dashboard-summary-table.png');

      // Get the remaining servers from database (more reliable than API)
      const remainingDbModule = await import('../src/lib/db');
      await remainingDbModule.ensureDatabaseInitialized();
      const remainingAllDbServers = remainingDbModule.dbOps.getAllServers.all() as Array<{ id: string; name: string; server_url: string; alias: string; note: string }>;
      const remainingServers: Server[] = remainingAllDbServers.map(s => ({
        id: s.id,
        name: s.name,
        alias: s.alias || '',
        note: s.note || '',
        server_url: s.server_url || '',
        backups: []
      }));

      if (remainingServers.length === 0) {
        throw new Error('No servers available for screenshots');
      }

      // Find a server with backups by checking the API
      let firstServer: Server | null = null;
      for (const server of remainingServers) {
        try {
          const serverDetails = await page.evaluate(async (serverId) => {
            const res = await fetch(`/api/detail/${serverId}`);
            if (!res.ok) return null;
            return res.json();
          }, server.id);

          if (serverDetails && serverDetails.server && serverDetails.server.backups && serverDetails.server.backups.length > 0) {
            firstServer = server;
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!firstServer) {
        firstServer = remainingServers[0];
        console.log(`Warning: No server with backups found, using first server: ${firstServer.name}`);
      }

      console.log('Navigating to first server\'s backup list page...');
      console.log(`🌐 Navigating to server detail page (/detail/${firstServer.id})...`);
      await page.goto(makeUrl(locale, `/detail/${firstServer.id}`), { waitUntil: 'networkidle0' });

      const contentLoaded = await waitForServerDetailContent(page, 15000);
      if (!contentLoaded) {
        logError('Server detail content did not load in time');
      }

      console.log('-------------------------------------------------------');
      console.log('Capturing server backup list...');
      const serverBackupList = await takeScreenshot(page, 'screen-server-backup-list.png', screenshotDir, { cropBottom: 80 });
      if (serverBackupList) successful.push('screen-server-backup-list.png');
      else failed.push('screen-server-backup-list.png');

      // Reuse current detail page for backup history and available backups modal (no extra navigation)
      console.log('-------------------------------------------------------');
      console.log('Capturing backup history table...');
      const backupHistory = await captureBackupHistoryTable(page, locale, screenshotDir, firstServer.id, true);
      if (backupHistory) successful.push('screen-backup-history.png');
      else failed.push('screen-backup-history.png');

      console.log('-------------------------------------------------------');
      console.log('Capturing AvailableBackupsIcon modal...');
      const availableBackupsModal = await captureAvailableBackupsModal(page, locale, screenshotDir, firstServer.id, true);
      if (availableBackupsModal) successful.push('screen-available-backups-modal.png');
      else failed.push('screen-available-backups-modal.png');

      const backupDetails = await page.evaluate(async (serverId) => {
        const res = await fetch(`/api/detail/${serverId}`);
        return res.json();
      }, firstServer.id);

      let backupDetail = false;
      console.log('-------------------------------------------------------');
      console.log('Capturing backup detail...');
      backupDetail = await (async () => {
        if (backupDetails.server && backupDetails.server.backups && backupDetails.server.backups.length > 0) {
          const firstBackup = backupDetails.server.backups[0];
          console.log(`🌐 Navigating to backup detail page (/detail/${firstServer.id}/backup/${firstBackup.id})...`);
          await page.goto(makeUrl(locale, `/detail/${firstServer.id}/backup/${firstBackup.id}`), { waitUntil: 'networkidle0' });
          await delay(2000);
          return takeScreenshot(page, 'screen-backup-detail.png', screenshotDir, { cropBottom: 80 });
        }
        return takeScreenshot(page, 'screen-backup-detail.png', screenshotDir, { cropBottom: 80 });
      })();
      if (backupDetail) successful.push('screen-backup-detail.png');
      else failed.push('screen-backup-detail.png');

      console.log('-------------------------------------------------------');
      console.log('Capturing server overdue message...');
      const serverOverdueMessage = await captureServerOverdueMessage(page, locale, screenshotDir);
      if (serverOverdueMessage) successful.push('screen-server-overdue-message.png');
      else failed.push('screen-server-overdue-message.png');

      // Settings (admin)
      console.log('🌐 Navigating to settings page (/settings)...');
      await page.goto(makeUrl(locale, '/settings'), { waitUntil: 'domcontentloaded' });
      await delay(500);

      console.log('-------------------------------------------------------');
      console.log('Taking screenshot of settings page left panel (as admin)...');
      const settingsLeftPanelAdmin = await takeScreenshot(page, 'screen-settings-left-panel-admin.png', screenshotDir, { isSettingsSidebar: true });
      if (settingsLeftPanelAdmin) successful.push('screen-settings-left-panel-admin.png');
      else failed.push('screen-settings-left-panel-admin.png');

      const adminSettingsTabs = [
        'notifications',
        'overdue',
        'server',
        'ntfy',
        'email',
        'templates',
        'users',
        'audit',
        'audit-retention',
        'display',
        'database-maintenance',
        'application-logs'
      ];

      for (const tab of adminSettingsTabs) {
        if (tab === 'audit') {
          await deleteServerDeletionAuditLogs();
          await delay(1000);
        }

        await page.goto(makeUrl(locale, `/settings?tab=${tab}`), { waitUntil: 'networkidle0' });
        await delay(500);

        if (tab === 'notifications') {
          try {
            await page.waitForSelector('table tbody tr', { timeout: 10000 });
            await delay(500);

            // Screenshot 1
            const filename1 = 'screen-settings-notifications.png';
            console.log('-------------------------------------------------------');
            console.log(`Taking screenshot of settings tab: ${tab}...`);
            const screenshot1 = await takeScreenshot(page, filename1, screenshotDir, { isSettingsPage: true });
            if (screenshot1) successful.push(filename1);
            else failed.push(filename1);
            await delay(300);

            // Screenshot 2: Select 2 servers (server-level checkboxes)
            console.log('Taking screenshot 2: After selecting 2 servers...');
            const allRows = await page.$$('table tbody tr');
            console.log(`  📍 Found ${allRows.length} total rows in table`);
            let serverRowsFound = 0;

            for (let i = 0; i < allRows.length && serverRowsFound < 2; i++) {
              const row = allRows[i];
              const firstCell = await row.$('td:first-child');
              if (firstCell) {
                const classList = await firstCell.evaluate(el => Array.from(el.classList));
                // Server rows have pl-4, backup rows have pl-12
                const isServerRow = classList.some(cls => cls === 'pl-4' || cls.includes('pl-4'));

                if (isServerRow) {
                  console.log(`  📍 Row ${i + 1} is a server row`);
                  const checkbox = await firstCell.$('[role="checkbox"]');
                  if (checkbox) {
                    await checkbox.click();
                    serverRowsFound++;
                    console.log(`  ✅ Selected server ${serverRowsFound}`);
                    await delay(300);
                  } else {
                    console.log(`  ⚠️  Row ${i + 1} is a server row but no checkbox found`);
                  }
                }
              }
            }

            if (serverRowsFound < 2) {
              logError(`Could not select 2 servers (selected ${serverRowsFound})`);
              recordDuration('screen-settings-notifications-bulk.png', 0);
              recordDuration('screen-settings-notifications-server.png', 0);
              failed.push('screen-settings-notifications-bulk.png');
              failed.push('screen-settings-notifications-server.png');
              continue;
            }

            await delay(300);

            const filename2 = 'screen-settings-notifications-bulk.png';
            const bulkCardBounds = await page.evaluate(() => {
              const bulkBar = document.querySelector('[data-screenshot-target="settings-notifications-bulk-bar"]');
              if (bulkBar) {
                const rect = bulkBar.getBoundingClientRect();
                return {
                  x: Math.max(0, rect.x - 4),
                  y: Math.max(0, rect.y - 4),
                  width: rect.width + 8,
                  height: rect.height + 8
                };
              }
              return null;
            });

            if (bulkCardBounds) {
              console.log('-------------------------------------------------------');
              console.log('Taking screenshot 2: After selecting 2 servers...');
              const screenshot2 = await takeScreenshot(page, filename2, screenshotDir, {
                clip: bulkCardBounds
              });
              if (screenshot2) successful.push(filename2);
              else failed.push(filename2);
            } else {
              logError('Could not find bulk action bar bounds');
              recordDuration(filename2, 0);
              failed.push(filename2);
            }

            await delay(300);

            // Screenshot 3: Expand first server and its first backup row
            console.log('Taking screenshot 3: Expanding server and backup rows...');
            const filename3 = 'screen-settings-notifications-server.png';

            const expandSuccess = await page.evaluate(() => {
              const rows = Array.from(document.querySelectorAll('table tbody tr'));
              for (const row of rows) {
                const firstCell = row.querySelector('td:first-child');
                if (firstCell) {
                  const isServerRow = firstCell.classList.contains('pl-4') || firstCell.className.includes('pl-4');
                  if (isServerRow) {
                    const expandBtn =
                      row.querySelector('button svg.lucide-chevron-right')?.closest('button') ||
                      row.querySelector('button svg.lucide-chevron-down')?.closest('button');
                    if (expandBtn) {
                      (expandBtn as HTMLButtonElement).click();
                      return true;
                    }
                  }
                }
              }
              return false;
            });

            if (!expandSuccess) {
              recordDuration(filename3, 0);
              failed.push(filename3);
              continue;
            }

            await delay(800);

            await page.evaluate(() => {
              const rows = Array.from(document.querySelectorAll('table tbody tr'));
              for (const row of rows) {
                const firstCell = row.querySelector('td:first-child');
                if (firstCell) {
                  const isBackupRow = firstCell.classList.contains('pl-12') || firstCell.className.includes('pl-12');
                  if (isBackupRow) {
                    const expandBtn =
                      row.querySelector('button svg.lucide-chevron-right')?.closest('button') ||
                      row.querySelector('button svg.lucide-chevron-down')?.closest('button');
                    if (expandBtn) {
                      (expandBtn as HTMLButtonElement).click();
                      break;
                    }
                  }
                }
              }
            });

            await delay(800);

            const tableElement = await page.$('table');
            if (tableElement) {
              const tableBounds = await tableElement.boundingBox();
              if (tableBounds) {
                console.log('-------------------------------------------------------');
                console.log('Taking screenshot 3: Expanding server and backup rows...');
                const screenshot3 = await takeScreenshot(page, filename3, screenshotDir, {
                  clip: {
                    x: tableBounds.x,
                    y: tableBounds.y,
                    width: tableBounds.width,
                    height: Math.min(tableBounds.height, VIEWPORT_HEIGHT - tableBounds.y - 20)
                  }
                });
                if (screenshot3) successful.push(filename3);
                else failed.push(filename3);
              } else {
                recordDuration(filename3, 0);
                failed.push(filename3);
              }
            } else {
              recordDuration(filename3, 0);
              failed.push(filename3);
            }
          } catch (error) {
            console.log(`  ❌ Warning: Failed to interact with notifications page: ${error instanceof Error ? error.message : String(error)}`);
            for (const f of ['screen-settings-notifications.png', 'screen-settings-notifications-bulk.png', 'screen-settings-notifications-server.png']) {
              if (!successful.includes(f) && !failed.includes(f)) {
                recordDuration(f, 0);
                failed.push(f);
              }
            }
          }
        } else {
          const filename = `screen-settings-${tab}.png`;
          console.log('-------------------------------------------------------');
          console.log(`Taking screenshot of settings tab: ${tab}...`);
          const settingsTabResult = await takeScreenshot(page, filename, screenshotDir, { isSettingsPage: true });
          if (settingsTabResult) successful.push(filename);
          else failed.push(filename);
        }
      }

      // Non-admin captures (per locale)
      console.log('Logging out and logging in as non-admin user...');
      await logout(page, locale);
      await login(page, locale, USER_USERNAME, USER_PASSWORD!);

      console.log('-------------------------------------------------------');
      console.log('Capturing user menu dropdown (user)...');
      const userMenuUser = await captureUserMenu(page, locale, screenshotDir, 'user');
      if (userMenuUser) successful.push('screen-user-menu-user.png');
      else failed.push('screen-user-menu-user.png');

      console.log('🌐 Navigating to settings page as non-admin (/settings)...');
      await page.goto(makeUrl(locale, '/settings'), { waitUntil: 'domcontentloaded' });
      await delay(500);

      console.log('-------------------------------------------------------');
      console.log('Taking screenshot of settings page left panel (as non-admin)...');
      const settingsLeftPanelNonAdmin = await takeScreenshot(page, 'screen-settings-left-panel-non-admin.png', screenshotDir, { isSettingsSidebar: true });
      if (settingsLeftPanelNonAdmin) successful.push('screen-settings-left-panel-non-admin.png');
      else failed.push('screen-settings-left-panel-non-admin.png');

      // Restore admin session for next locale in Phase B (except after last)
      await logout(page, locale);
      await login(page, locale, ADMIN_USERNAME, ADMIN_PASSWORD!);
    }

    // Restore console so summary is not prefixed with elapsed
    console.log = origLog;
    console.error = origErr;

    // Display summary
    let totalMs = 0;
    let count = 0;
    for (const inner of screenshotDurations.values()) {
      for (const ms of inner.values()) {
        totalMs += ms;
        count++;
      }
    }
    const averageMs = count > 0 ? totalMs / count : 0;

    console.log('\n\n' + '='.repeat(60));
    console.log('📸 SCREENSHOT GENERATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Preparation (before Phase A): ${formatDurationHms(preparation1Ms)}`);
    console.log(`Preparation (between Phase A and Phase B): ${formatDurationHms(preparation2Ms)}`);

    // Table: rows = filenames, columns = locales, cells = elapsed time (HH:MM:SS.S); fixed column width; Average row; Total row
    const sumPerLocale = localesToRun.map(locale =>
      ORDERED_SCREENSHOT_FILENAMES.reduce((s, f) => s + (screenshotDurations.get(f)?.get(locale) ?? 0), 0)
    );
    const countPerLocale = localesToRun.map(locale =>
      ORDERED_SCREENSHOT_FILENAMES.filter(f => screenshotDurations.get(f)?.has(locale)).length
    );
    const averagePerLocale = localesToRun.map((_, i) =>
      countPerLocale[i] > 0 ? sumPerLocale[i] / countPerLocale[i] : 0
    );

    const headerCells = ['filename', ...localesToRun];
    const separatorCells = ['---', ...localesToRun.map(() => '---')];
    const dataRows: string[][] = ORDERED_SCREENSHOT_FILENAMES.map(filename =>
      [filename, ...localesToRun.map(locale => {
        const ms = screenshotDurations.get(filename)?.get(locale);
        return ms !== undefined ? formatDurationHms(ms) : '-';
      })]
    );
    const averageRow = ['Average', ...averagePerLocale.map(ms => formatDurationHms(ms))];
    const totalRow = ['Total', ...sumPerLocale.map(ms => formatDurationHms(ms))];

    const allRows = [headerCells, separatorCells, ...dataRows, averageRow, totalRow];
    const colCount = headerCells.length;
    const colWidths = Array.from({ length: colCount }, (_, j) =>
      Math.max(...allRows.map(row => row[j].length), 10)
    );
    const padRow = (row: string[]) =>
      '| ' + row.map((cell, j) => cell.padEnd(colWidths[j])).join(' | ') + ' |';

    console.log('\n' + padRow(headerCells));
    console.log(padRow(separatorCells));
    for (const row of dataRows) console.log(padRow(row));
    console.log(padRow(averageRow));
    console.log(padRow(totalRow));

    console.log('\n' + '='.repeat(60));
    console.log(`Total: ${count} | ✅ ${successful.length} | ❌ ${failed.length}`);
    const totalWithPreparationMs = preparation1Ms + preparation2Ms + totalMs;
    console.log(`Time: capture total ${formatDurationHms(totalMs)} | with preparation ${formatDurationHms(totalWithPreparationMs)}`);
    console.log(`Average per screenshot: ${formatDurationHms(averageMs)}`);
    console.log('='.repeat(60) + '\n');

    if (failed.length > 0) {
      logError(`⚠️  Warning: ${failed.length} screenshot(s) failed to generate.`);
    } else {
      console.log('🎉 All screenshots generated successfully!');
    }
    
  } catch (error) {
    logError('Error during screenshot automation: ' + (error instanceof Error ? error.message : String(error)));
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the script
main().catch((error) => {
  logError('Fatal error: ' + (error instanceof Error ? error.message : String(error)));
  process.exit(1);
});
