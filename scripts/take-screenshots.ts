import puppeteer, { type Page } from 'puppeteer';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const BASE_URL = 'http://localhost:8666';
const ADMIN_USERNAME = 'admin';
const USER_USERNAME = 'user';
const SCREENSHOT_DIR = 'docs/static/img';
const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;

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

// Read passwords from environment variables
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const USER_PASSWORD = process.env.USER_PASSWORD;

// Validate that passwords are set
if (!ADMIN_PASSWORD) {
  logError('ADMIN_PASSWORD environment variable is not set. Please set it before running the script.');
  process.exit(1);
}

if (!USER_PASSWORD) {
  logError('USER_PASSWORD environment variable is not set. Please set it before running the script.');
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
    execSync('pnpm generate-test-data --servers=12 --quiet', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('Test data generated successfully');
    console.log('-------------------------------------------------------');
  } catch (error) {
    logError('Failed to generate test data: ' + (error instanceof Error ? error.message : String(error)));
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

async function login(page: Page, username: string, password: string) {
  console.log(`Logging in as ${username}...`);
  await page.goto(`${BASE_URL}/login?redirect=%2F`, { waitUntil: 'networkidle0' });
  
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

async function logout(page: Page) {
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
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    console.log('Logged out');
  } catch (error) {
    logError('Error during logout: ' + (error instanceof Error ? error.message : String(error)));
    // Try navigating to login page anyway
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
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

async function deleteServer(page: Page, serverId: string) {
  console.log(`  Deleting server ${serverId}...`);
  
  // Get CSRF token
  const csrfToken = await getCSRFToken(page);
  
  // Make DELETE request
  const response = await page.evaluate(async (serverId: string, csrfToken: string) => {
    const res = await fetch(`/api/servers/${serverId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'include'
    });
    return { ok: res.ok, status: res.status, json: await res.json() };
  }, serverId, csrfToken);
  
  if (!response.ok) {
    throw new Error(`Failed to delete server ${serverId}: ${response.json.error || 'Unknown error'}`);
  }
  
  console.log(`  Successfully deleted server ${serverId}`);
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
      throw new Error(`Server ${serverId} not found`);
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

async function takeScreenshot(page: Page, filename: string, options?: {
  waitTime?: number;
  isSettingsPage?: boolean;
  isSettingsSidebar?: boolean;
  cropBottom?: number;
  clip?: { x: number; y: number; width: number; height: number };
}): Promise<boolean> {
  const waitTime = options?.waitTime ?? 2000;
  const isSettingsPage = options?.isSettingsPage ?? false;
  const isSettingsSidebar = options?.isSettingsSidebar ?? false;
  const cropBottom = options?.cropBottom ?? 0;
  const clip = options?.clip;
  
  console.log(colors.cyan, ` 📸 Taking screenshot: ${filename}...`, colors.reset);
  await delay(waitTime);
  
  const filepath = join(SCREENSHOT_DIR, filename);
  
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
  
  logSuccess(`  💾 Screenshot saved: ${filepath}`);
  return true;
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

async function getNtfyConfig(page: Page): Promise<{ url?: string; topic?: string; enabled?: boolean; accessToken?: string } | null> {
  console.log('Getting NTFY configuration...');
  try {
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/configuration/unified');
      return res.json();
    });
    return response?.ntfy || null;
  } catch (error) {
    logError('Error getting NTFY config: ' + (error instanceof Error ? error.message : String(error)));
    return null;
  }
}

async function updateNtfyTopic(page: Page, newTopic: string): Promise<string | null> {
  console.log(`Updating NTFY topic to: ${newTopic}`);
  try {
    // Get current config
    const currentConfig = await getNtfyConfig(page);
    if (!currentConfig) {
      logError('Could not get current NTFY config');
      return null;
    }
    
    const oldTopic = currentConfig.topic || null;
    
    // Update via API
    const csrfToken = await getCSRFToken(page);
    const response = await page.evaluate(async (config: any, token: string) => {
      const res = await fetch('/api/configuration/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': token
        },
        credentials: 'include',
        body: JSON.stringify({ ntfy: config })
      });
      return res.ok;
    }, { ...currentConfig, topic: newTopic }, csrfToken);
    
    if (response) {
      console.log(`NTFY topic updated from "${oldTopic}" to "${newTopic}"`);
      return oldTopic;
    } else {
      logError('Failed to update NTFY topic');
      return null;
    }
  } catch (error) {
    logError('Error updating NTFY topic: ' + (error instanceof Error ? error.message : String(error)));
    return null;
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

async function captureCollectButtonPopup(page: Page): Promise<{ popup: boolean; rightClick: boolean }> {
  console.log('-------------------------------------------------------');
  console.log('Capturing collect button popup...');
  try {
    // Navigate to blank page first to reduce background noise
    await page.goto(`${BASE_URL}/blank`, { waitUntil: 'networkidle0' });
    await delay(1000);
    
    // Find the collect button by looking for button with Download icon
    const collectButtonFound = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      for (const btn of buttons) {
        const svg = btn.querySelector('svg');
        if (svg) {
          // Check if this is the Download icon (collect button)
          const svgPath = svg.querySelector('path');
          if (svgPath) {
            const pathData = svgPath.getAttribute('d') || '';
            // Download icon has specific path data, or we can check by button title
            const title = btn.getAttribute('title') || '';
            if (title.includes('Collect') || pathData.includes('M12') && pathData.includes('L12')) {
              (btn as HTMLButtonElement).click();
              return true;
            }
          }
        }
      }
      return false;
    });
    
    if (collectButtonFound) {
      await delay(1500); // Wait for popover to appear
      
      // Wait for popover to appear
      try {
        await page.waitForSelector('[data-screenshot-target="collect-button-popup"]', { timeout: 3000 });
      } catch (e) {
        // Fallback: wait for any popover
        await page.waitForSelector('[role="dialog"], [data-radix-popper-content-wrapper], [data-radix-popover-content]', { timeout: 2000 });
      }
      await delay(500);
      
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
        popupSuccess = await takeScreenshot(page, 'screen-collect-button-popup.png', {
          clip: popupBounds
        });
        console.log('Captured collect button popup');
      } else {
        logError('Could not find collect button popup bounds');
      }
      
      // Close popup by clicking outside or pressing Escape
      await page.keyboard.press('Escape');
      await delay(1000);
      
      // Right click to show context menu - find button again
      const rightClickSuccess = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        for (const btn of buttons) {
          const svg = btn.querySelector('svg');
          if (svg) {
            const title = btn.getAttribute('title') || '';
            if (title.includes('Collect')) {
              const event = new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                view: window
              });
              btn.dispatchEvent(event);
              return true;
            }
          }
        }
        return false;
      });
      
      let rightClickPopupSuccess = false;
      if (rightClickSuccess) {
        await delay(1500); // Wait for right-click menu to appear
        
        // Wait for context menu or modal
        try {
          await page.waitForSelector('[data-screenshot-target="collect-button-right-click-popup"]', { timeout: 3000 });
        } catch (e) {
          // Fallback: wait for modal/dialog
          await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 2000 });
        }
        await delay(500);
        
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
          rightClickPopupSuccess = await takeScreenshot(page, 'screen-collect-button-right-click-popup.png', {
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

async function captureNtfyConfigureDevicePopup(page: Page): Promise<boolean> {
  console.log('-------------------------------------------------------');

  console.log('Capturing NTFY Configure Device popup...');
  try {
    // Navigate to NTFY settings
    await page.goto(`${BASE_URL}/settings?tab=ntfy`, { waitUntil: 'networkidle0' });
    await delay(2000);
    
    // Find and click "Configure Device" button using text content
    const buttonFound = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      for (const btn of buttons) {
        const text = btn.textContent || '';
        if (text.includes('Configure Device')) {
          (btn as HTMLButtonElement).click();
          return true;
        }
      }
      return false;
    });
    
    if (buttonFound) {
      await delay(1000);
      
      // Wait for dialog to appear
      await page.waitForSelector('[data-screenshot-target="ntfy-configure-device-popup"], [role="dialog"]', { timeout: 3000 });
      await delay(500);
      
      // Capture the dialog
      const dialogBounds = await page.evaluate(() => {
        // First try to find element with data attribute
        const dialog = document.querySelector('[data-screenshot-target="ntfy-configure-device-popup"]');
        if (dialog) {
          const rect = dialog.getBoundingClientRect();
          return {
            x: Math.max(0, rect.x - 10),
            y: Math.max(0, rect.y - 10),
            width: rect.width + 20,
            height: rect.height + 20
          };
        }
        // Fallback to generic dialog selector
        const fallbackDialog = document.querySelector('[role="dialog"]');
        if (fallbackDialog) {
          const rect = fallbackDialog.getBoundingClientRect();
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
        const success = await takeScreenshot(page, 'screen-settings-ntfy-configure-device-popup.png', {
          clip: dialogBounds
        });
        
        // Close dialog
        await page.keyboard.press('Escape');
        await delay(500);
        return success;
      } else {
        // Close dialog anyway
        await page.keyboard.press('Escape');
        await delay(500);
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    logError('Error capturing NTFY Configure Device popup: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

async function captureOverdueBackupHoverCard(page: Page): Promise<boolean> {
  console.log('-------------------------------------------------------');
  console.log('Capturing overdue backup hover card...');
  try {
    // Find an overdue backup item using the data attribute
    const hoverElement = await page.$('[data-screenshot-target="overdue-backup-item"]');
    
    if (hoverElement) {
      // Use Puppeteer's hover method
      await hoverElement.hover();
      await delay(2000); // Wait for tooltip to appear (delayDuration is 1000ms)
      
      // Capture the tooltip/card
      const tooltipBounds = await page.evaluate(() => {
        // First try to find element with data attribute
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
        // Fallback to generic tooltip selectors
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
      
      if (tooltipBounds) {
        const success = await takeScreenshot(page, 'screen-overdue-backup-hover-card.png', {
          clip: tooltipBounds
        });
        console.log('Captured overdue backup hover card');
        return success;
      } else {
        logError('Could not find overdue backup tooltip bounds');
        return false;
      }
    } else {
      logError('Could not find overdue backup item to hover');
      return false;
    }
  } catch (error) {
    logError('Error capturing overdue backup hover card: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

async function captureBackupTooltip(page: Page): Promise<boolean> {
  console.log('-------------------------------------------------------');
  console.log('Capturing backup tooltip...');
  try {
    // Navigate to dashboard in card mode
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await waitForDashboardLoad(page);
    await delay(2000);
    
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
        const success = await takeScreenshot(page, 'screen-backup-tooltip.png', {
          clip: tooltipBounds
        });
        console.log('Captured backup tooltip');
        
        // Move mouse away to close tooltip
        await page.mouse.move(0, 0);
        await delay(500);
        
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

async function captureDuplicatiConfiguration(page: Page): Promise<boolean> {
  console.log('-------------------------------------------------------');
  console.log('Capturing Duplicati configuration dropdown...');
  try {
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await waitForDashboardLoad(page);
    await delay(2000);
    
    // Find and click the Duplicati button (button with title "Duplicati configuration")
    const button = await page.$('button[title="Duplicati configuration"]');
    
    if (button) {
      await button.click();
      await delay(1000); // Wait for popover to appear
      
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
        const success = await takeScreenshot(page, 'screen-duplicati-configuration.png', {
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

async function captureDashboardSummary(page: Page, filename: string): Promise<boolean> {
  console.log('-------------------------------------------------------');
  console.log(`Capturing dashboard summary card (${filename})...`);
  try {
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await waitForDashboardLoad(page);
    await delay(2000);
    
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
      const success = await takeScreenshot(page, filename, {
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

async function captureOverviewSidePanel(page: Page): Promise<{ status: boolean; charts: boolean }> {
  console.log('-------------------------------------------------------');
  console.log('Capturing overview side panel...');
  try {
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await waitForDashboardLoad(page);
    await delay(2000);
    
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
      await delay(2000);
    }
    
    // Wait for the side panel to appear
    try {
      await page.waitForSelector('[data-screenshot-target="overview-side-panel"]', { timeout: 5000 });
    } catch (e) {
      logError('Overview side panel did not appear on the page');
      return { status: false, charts: false };
    }
    await delay(500);
    
    // Check current state by looking at the toggle button title
    const currentState = await page.evaluate(() => {
      const panel = document.querySelector('[data-screenshot-target="overview-side-panel"]');
      if (!panel) return null;
      
      // Find the toggle button inside the panel
      const toggleButton = panel.querySelector('button[title*="Switch"], button[aria-label*="Switch"]');
      if (toggleButton) {
        const title = toggleButton.getAttribute('title') || toggleButton.getAttribute('aria-label') || '';
        // If title says "Switch to chart view", we're in status mode
        // If title says "Switch to status view", we're in chart mode
        if (title.includes('chart')) return 'status';
        if (title.includes('status')) return 'chart';
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
        statusSuccess = await takeScreenshot(page, 'screen-overview-side-status.png', {
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
        chartsSuccess = await takeScreenshot(page, 'screen-overview-side-charts.png', {
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
        chartsSuccess = await takeScreenshot(page, 'screen-overview-side-charts.png', {
          clip: chartsBounds
        });
        console.log('Captured overview side panel (charts state)');
      } else {
        logError('Could not find overview side panel bounds (charts)');
      }
      
      // Click the toggle button to switch to status mode
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
        statusSuccess = await takeScreenshot(page, 'screen-overview-side-status.png', {
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

async function captureBackupHistoryTable(page: Page, serverId: string): Promise<boolean> {
  console.log('-------------------------------------------------------');
  console.log('Capturing backup history table...');
  try {
    // Navigate to server details page
    await page.goto(`${BASE_URL}/detail/${serverId}`, { waitUntil: 'networkidle0' });
    await delay(3000);
    
    // Find the backup history table section using data-screenshot-target
    const tableBounds = await page.evaluate(() => {
      const card = document.querySelector('[data-screenshot-target="backup-history-table"]');
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
      const success = await takeScreenshot(page, 'screen-backup-history.png', {
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

async function captureMetricsChart(page: Page, serverId: string): Promise<boolean> {
  console.log('-------------------------------------------------------');
  console.log('Capturing metrics chart...');
  try {
    // Navigate to server details page
    await page.goto(`${BASE_URL}/detail/${serverId}`, { waitUntil: 'networkidle0' });
    await delay(3000);
    
    // Find the metrics chart section
    const chartBounds = await page.evaluate(() => {
      // Look for the metrics chart card
      const cards = Array.from(document.querySelectorAll('[class*="Card"], [class*="card"]'));
      for (const card of cards) {
        const header = card.querySelector('h2, h3, [class*="CardTitle"]');
        const hasChart = card.querySelector('[class*="chart"], canvas, svg[class*="chart"]');
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
      // Fallback: look for any chart element
      const chart = document.querySelector('[class*="chart"], canvas, svg[class*="chart"]');
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
    
    if (chartBounds) {
      const success = await takeScreenshot(page, 'screen-metrics.png', {
        clip: chartBounds
      });
      console.log('Captured metrics chart');
      return success;
    } else {
      logError('Could not find metrics chart bounds');
      return false;
    }
  } catch (error) {
    logError('Error capturing metrics chart: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

async function captureAvailableBackupsModal(page: Page, serverId: string): Promise<boolean> {
  console.log('-------------------------------------------------------');
  console.log('Capturing AvailableBackupsIcon modal...');
  try {
    // Navigate to server details page (should already be there, but ensure we're on the right page)
    await page.goto(`${BASE_URL}/detail/${serverId}`, { waitUntil: 'networkidle0' });
    await delay(3000);
    
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
      const success = await takeScreenshot(page, 'screen-available-backups-modal.png', {
        clip: dialogBounds
      });
      console.log('Captured AvailableBackupsIcon modal');
      
      // Close dialog
      await page.keyboard.press('Escape');
      await delay(500);
      return success;
    } else {
      logError('Could not find AvailableBackupsIcon modal bounds');
      // Close dialog anyway
      await page.keyboard.press('Escape');
      await delay(500);
      return false;
    }
  } catch (error) {
    logError('Error capturing AvailableBackupsIcon modal: ' + (error instanceof Error ? error.message : String(error)));
    // Try to close dialog if it's open
    try {
      await page.keyboard.press('Escape');
      await delay(500);
    } catch (e) {
      // Ignore
    }
    return false;
  }
}

async function captureServerOverdueMessage(page: Page): Promise<boolean> {
  console.log('-------------------------------------------------------');
  console.log('Capturing server overdue message...');
  try {
    // Get all servers
    const servers = await getServers(page);
    
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
    
    // Navigate to the server detail page
    await page.goto(`${BASE_URL}/detail/${serverWithOverdue.id}`, { waitUntil: 'networkidle0' });
    await delay(3000);
    
    // Wait for the overdue message to appear
    try {
      await page.waitForSelector('[data-screenshot-target="server-overdue-message"]', { timeout: 5000 });
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
      const success = await takeScreenshot(page, 'screen-server-overdue-message.png', {
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

async function captureServerDetailSummary(page: Page): Promise<boolean> {
  console.log('-------------------------------------------------------');
  console.log('Capturing server detail summary...');
  try {
    // Get all servers
    const servers = await getServers(page);
    
    // Find a server without overdue backups
    let serverWithoutOverdue: Server | null = null;
    for (const server of servers) {
      const serverDetails = await page.evaluate(async (serverId) => {
        const res = await fetch(`/api/detail/${serverId}`);
        return res.json();
      }, server.id);
      
      if (!serverDetails.overdueBackups || serverDetails.overdueBackups.length === 0) {
        serverWithoutOverdue = server;
        break;
      }
    }
    
    if (!serverWithoutOverdue) {
      logError('Could not find a server without overdue backups');
      return false;
    }
    
    console.log(`Found server without overdue backups: ${serverWithoutOverdue.name} (${serverWithoutOverdue.id})`);
    
    // Navigate to the server detail page
    await page.goto(`${BASE_URL}/detail/${serverWithoutOverdue.id}`, { waitUntil: 'networkidle0' });
    await delay(3000);
    
    // Wait for the summary div to appear
    try {
      await page.waitForSelector('[data-screenshot-target="server-detail-summary"]', { timeout: 5000 });
    } catch (e) {
      logError('Server detail summary did not appear on the page');
      return false;
    }
    await delay(500);
    
    // Capture the summary div
    const summaryBounds = await page.evaluate(() => {
      const summaryDiv = document.querySelector('[data-screenshot-target="server-detail-summary"]');
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
      const success = await takeScreenshot(page, 'screen-detail-summary.png', {
        clip: summaryBounds
      });
      console.log('Captured server detail summary');
      return success;
    } else {
      logError('Could not find server detail summary bounds');
      return false;
    }
  } catch (error) {
    logError('Error capturing server detail summary: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

async function captureCollectBackupLogs(page: Page): Promise<boolean> {
  console.log('-------------------------------------------------------');
  console.log('Capturing collect backup logs interface...');
  try {
    // The collect backup logs popup is already captured as screen-collect-button-popup.png
    // But we need screen-collect-backup-logs.png which might be the same or a different view
    // For now, we'll use the same popup screenshot
    // Navigate to blank page first
    await page.goto(`${BASE_URL}/blank`, { waitUntil: 'networkidle0' });
    await delay(1000);
    
    // Find and click the collect button
    const collectButtonFound = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      for (const btn of buttons) {
        const svg = btn.querySelector('svg');
        if (svg) {
          const title = btn.getAttribute('title') || '';
          if (title.includes('Collect')) {
            (btn as HTMLButtonElement).click();
            return true;
          }
        }
      }
      return false;
    });
    
    if (collectButtonFound) {
      await delay(1500); // Wait for popover to appear
      
      // Capture the popup (same as collect-button-popup but save with different name)
      const popupBounds = await page.evaluate(() => {
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
        const fallbackPopover = document.querySelector('[data-radix-popover-content], [role="dialog"]');
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
      
      if (popupBounds) {
        const success = await takeScreenshot(page, 'screen-collect-backup-logs.png', {
          clip: popupBounds
        });
        console.log('Captured collect backup logs interface');
        
        // Close popup
        await page.keyboard.press('Escape');
        await delay(500);
        return success;
      } else {
        // Close popup anyway
        await page.keyboard.press('Escape');
        await delay(500);
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    logError('Error capturing collect backup logs: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

async function captureOverdueMonitoringTableRows(page: Page): Promise<boolean> {
  console.log('-------------------------------------------------------');
  console.log('Capturing overdue monitoring table rows...');
  try {
    // Wait for the table to appear
    try {
      await page.waitForSelector('[data-screenshot-target="settings-overdue-monitoring-table"]', { timeout: 5000 });
    } catch (e) {
      logError('Overdue monitoring table did not appear on the page');
      return false;
    }
    await delay(500);
    
    // Capture the first 2 rows of the table
    const tableRowsBounds = await page.evaluate(() => {
      const tableBody = document.querySelector('[data-screenshot-target="settings-overdue-monitoring-table"]');
      if (!tableBody) return null;
      
      // Get all table rows (excluding header)
      const rows = Array.from(tableBody.querySelectorAll('tr'));
      if (rows.length === 0) return null;
      
      // Get the first row bounds
      const firstRow = rows[0] as HTMLElement;
      const firstRowRect = firstRow.getBoundingClientRect();
      
      // Get the second row bounds if it exists
      let lastRowRect = firstRowRect;
      if (rows.length >= 2) {
        const secondRow = rows[1] as HTMLElement;
        lastRowRect = secondRow.getBoundingClientRect();
      }
      
      // Calculate bounds for first 2 rows
      const x = Math.max(0, firstRowRect.x - 10);
      const y = Math.max(0, firstRowRect.y - 10);
      const width = firstRowRect.width + 20;
      const height = (lastRowRect.bottom - firstRowRect.top) + 20;
      
      return { x, y, width, height };
    });
    
    if (tableRowsBounds) {
      const success = await takeScreenshot(page, 'screen-settings-overdue-bkp.png', {
        clip: tableRowsBounds
      });
      console.log('Captured overdue monitoring table rows (first 2 rows)');
      return success;
    } else {
      logError('Could not find overdue monitoring table rows bounds');
      return false;
    }
  } catch (error) {
    logError('Error capturing overdue monitoring table rows: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

async function captureOverdueMonitoringConfig(page: Page): Promise<boolean> {
  console.log('-------------------------------------------------------');
  console.log('Capturing overdue monitoring configuration card...');
  try {
    // Wait for the "Overdue tolerance:" label to appear
    try {
      await page.waitForSelector('label[for="overdue-tolerance"]', { timeout: 5000 });
    } catch (e) {
      logError('Overdue tolerance label did not appear on the page');
      return false;
    }
    await delay(500);
    
    // Find the card containing the "Overdue tolerance:" label and capture from that label to the end
    const configBounds = await page.evaluate(() => {
      // Find the label
      const label = document.querySelector('label[for="overdue-tolerance"]');
      if (!label) return null;
      
      // Find the card containing this label (closest Card ancestor)
      const card = label.closest('[class*="Card"], [class*="card"]');
      if (!card) return null;
      
      const cardRect = card.getBoundingClientRect();
      const labelRect = label.getBoundingClientRect();
      
      // Calculate bounds from the label's top to the card's bottom
      const x = Math.max(0, cardRect.x - 10);
      const y = Math.max(0, labelRect.y - 10);
      const width = cardRect.width + 20;
      const height = (cardRect.bottom - labelRect.y) + 20;
      
      return { x, y, width, height };
    });
    
    if (configBounds) {
      const success = await takeScreenshot(page, 'screen-settings-overdue-conf.png', {
        clip: configBounds
      });
      console.log('Captured overdue monitoring configuration card');
      return success;
    } else {
      logError('Could not find overdue monitoring configuration card bounds');
      return false;
    }
  } catch (error) {
    logError('Error capturing overdue monitoring configuration card: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

async function captureBackupNotificationsDetail(page: Page) {
  console.log('-------------------------------------------------------');
  console.log('Capturing backup notifications detail page...');
  try {
    // Navigate to notifications settings
    await page.goto(`${BASE_URL}/settings?tab=notifications`, { waitUntil: 'networkidle0' });
    await delay(2000);
    
    // Find and click on a backup to view its detail
    const backupClicked = await page.evaluate(() => {
      // Look for backup rows or items in the notifications table
      const rows = Array.from(document.querySelectorAll('tr, [class*="row"], [class*="Row"]'));
      for (const row of rows) {
        // Check if this is a clickable backup row
        if (row.getAttribute('onclick') || row.classList.contains('cursor-pointer')) {
          (row as HTMLElement).click();
          return true;
        }
      }
      // Fallback: look for any clickable element in the notifications table
      const clickable = document.querySelector('[class*="cursor-pointer"], button, a');
      if (clickable) {
        (clickable as HTMLElement).click();
        return true;
      }
      return false;
    });
    
    if (backupClicked) {
      await delay(2000); // Wait for detail page/modal to appear
      
      // Capture the detail view
      const detailBounds = await page.evaluate(() => {
        // Look for modal or detail card
        const modal = document.querySelector('[role="dialog"], [data-radix-dialog-content]');
        if (modal) {
          const rect = modal.getBoundingClientRect();
          return {
            x: Math.max(0, rect.x - 10),
            y: Math.max(0, rect.y - 10),
            width: rect.width + 20,
            height: rect.height + 20
          };
        }
        // Fallback: look for detail card
        const card = document.querySelector('[class*="Card"], [class*="card"]');
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
      
      if (detailBounds) {
        const success = await takeScreenshot(page, 'screen-settings-backup-notifications-detail.png', {
          clip: detailBounds,
          isSettingsPage: true
        });
        console.log('Captured backup notifications detail');
        
        // Close modal if open
        await page.keyboard.press('Escape');
        await delay(500);
        return success;
      } else {
        // Fallback: take full page screenshot
        const success = await takeScreenshot(page, 'screen-settings-backup-notifications-detail.png', {
          isSettingsPage: true
        });
        
        // Close modal if open
        await page.keyboard.press('Escape');
        await delay(500);
        return success;
      }
    } else {
      // If no backup to click, just take a screenshot of the notifications page
      // which might show the detail view already
      const success = await takeScreenshot(page, 'screen-settings-backup-notifications-detail.png', {
        isSettingsPage: true
      });
      return success;
    }
  } catch (error) {
    logError('Error capturing backup notifications detail: ' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
}

async function main() {
  console.log(colors.green, '\n');
  console.log('-------------------------------------------------------' );
  console.log('Starting screenshot automation');
  console.log('-------------------------------------------------------\n',colors.reset);
  
  
  // Arrays to track screenshot results
  const successful: string[] = [];
  const failed: string[] = [];
  
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
  
  // Ensure screenshot directory exists
  await ensureDirectoryExists(SCREENSHOT_DIR);
  
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
      '--disable-gpu'
    ]
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
  
  try {
    // Login as admin
    await login(page, ADMIN_USERNAME, ADMIN_PASSWORD!);
    
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await waitForDashboardLoad(page);
    
    // Take screenshot of dashboard in card mode (overview mode)
    console.log('-------------------------------------------------------');
    console.log('Taking screenshot of dashboard in card mode (overview mode)...');
    const dashboardCardMode = await takeScreenshot(page, 'screen-main-dashboard-card-mode.png', { cropBottom: 80 });
    if (dashboardCardMode) successful.push('screen-main-dashboard-card-mode.png');
    else failed.push('screen-main-dashboard-card-mode.png');
    
    // Capture overdue backup hover card
    const overdueHoverCard = await captureOverdueBackupHoverCard(page);
    if (overdueHoverCard) successful.push('screen-overdue-backup-hover-card.png');
    else failed.push('screen-overdue-backup-hover-card.png');
    
    // Capture regular backup tooltip
    const backupTooltip = await captureBackupTooltip(page);
    if (backupTooltip) successful.push('screen-backup-tooltip.png');
    else failed.push('screen-backup-tooltip.png');
    
    // Capture collect button popups
    const collectPopups = await captureCollectButtonPopup(page);
    if (collectPopups.popup) successful.push('screen-collect-button-popup.png');
    else failed.push('screen-collect-button-popup.png');
    if (collectPopups.rightClick) successful.push('screen-collect-button-right-click-popup.png');
    else failed.push('screen-collect-button-right-click-popup.png');
    
    // Capture collect backup logs interface
    const collectBackupLogs = await captureCollectBackupLogs(page);
    if (collectBackupLogs) successful.push('screen-collect-backup-logs.png');
    else failed.push('screen-collect-backup-logs.png');
    
    // Capture Duplicati configuration dropdown
    const duplicatiConfig = await captureDuplicatiConfiguration(page);
    if (duplicatiConfig) successful.push('screen-duplicati-configuration.png');
    else failed.push('screen-duplicati-configuration.png');
    
    // Capture dashboard summary card
    const dashboardSummary = await captureDashboardSummary(page, 'screen-dashboard-summary.png');
    if (dashboardSummary) successful.push('screen-dashboard-summary.png');
    else failed.push('screen-dashboard-summary.png');
    
    // Capture overview side panel (both states)
    const overviewSidePanel = await captureOverviewSidePanel(page);
    if (overviewSidePanel.status) successful.push('screen-overview-side-status.png');
    else failed.push('screen-overview-side-status.png');
    if (overviewSidePanel.charts) successful.push('screen-overview-side-charts.png');
    else failed.push('screen-overview-side-charts.png');
    
    // Get list of servers
    const servers = await getServers(page);
    console.log(`Found ${servers.length} servers`);
    
    // Find servers that have backups - we need to keep at least one of these
    const serversWithBackups = await findServersWithBackups();
    console.log(`Found ${serversWithBackups.length} server(s) with backups`);
    
    // Identify which server to protect (keep) - prefer the first server with backups
    let protectedServerId: string | null = null;
    if (serversWithBackups.length > 0) {
      // Find the first server in our list that has backups
      for (const server of servers) {
        if (serversWithBackups.includes(server.id)) {
          protectedServerId = server.id;
          console.log(`Protecting server ${server.name} (${server.id}) - it has backups and will be used for overdue screenshot`);
          break;
        }
      }
    }
    
    // Keep only 3 servers, delete the rest (but never delete the protected server)
    console.log('-------------------------------------------------------');
    console.log('Keeping only 3 servers, deleting the rest...');
    if (servers.length > 3) {
      // Sort servers: protected server first, then others
      const sortedServers = [...servers].sort((a, b) => {
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
        const protectedServer = servers.find(s => s.id === protectedServerId);
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
        console.log(`  Protected server (has backups): ${servers.find(s => s.id === protectedServerId)?.name || protectedServerId}`);
      }
      
      for (const server of serversToDelete) {
        // Never delete the protected server
        if (server.id === protectedServerId) {
          console.log(`  Skipping protected server ${server.name} (${server.id})`);
          continue;
        }
        
        try {
          await deleteServer(page, server.id);
          await delay(1000); // Wait between deletions
        } catch (error) {
          logError(`Error deleting server ${server.id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      // Refresh the page to see updated server list
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      await waitForDashboardLoad(page);
    }
    
    // Get the remaining servers after deletion
    const remainingServersAfterDeletion = await getServers(page);
    if (remainingServersAfterDeletion.length < 2) {
      console.log(`Warning: Only ${remainingServersAfterDeletion.length} server(s) remaining, need at least 2 to configure`);
    } else {
      // Configure 2 servers with URLs and passwords
      // Make sure we don't configure the protected server if we only have 2 servers
      const serversToConfigure = remainingServersAfterDeletion
        .filter(s => protectedServerId ? s.id !== protectedServerId : true)
        .slice(0, 2);
      
      // If we filtered out protected server and don't have 2 servers, use remaining servers
      const actualServersToConfigure = serversToConfigure.length >= 2 
        ? serversToConfigure 
        : remainingServersAfterDeletion.slice(0, 2);
      
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
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      await waitForDashboardLoad(page);
    }
    
    // Delete recent backup(s) from the protected server (or first server with backups) to create overdue backup
    console.log('-------------------------------------------------------');
    console.log('Deleting recent backup(s) to create overdue backup...');
    const finalServers = await getServers(page);
    
    // Find the server to make overdue - prefer protected server, otherwise find first server with backups
    let serverToMakeOverdue: Server | null = null;
    
    if (protectedServerId) {
      serverToMakeOverdue = finalServers.find(s => s.id === protectedServerId) || null;
      if (serverToMakeOverdue) {
        console.log(`Using protected server for overdue backup: ${serverToMakeOverdue.name}`);
      }
    }
    
    // If protected server not found, find first server with backups
    if (!serverToMakeOverdue) {
      const currentServersWithBackups = await findServersWithBackups();
      for (const server of finalServers) {
        if (currentServersWithBackups.includes(server.id)) {
          serverToMakeOverdue = server;
          console.log(`Using server with backups for overdue backup: ${server.name}`);
          break;
        }
      }
    }
    
    // Fallback to first server if no server with backups found
    if (!serverToMakeOverdue && finalServers.length > 0) {
      serverToMakeOverdue = finalServers[0];
      console.log(`Warning: No server with backups found, using first server: ${serverToMakeOverdue.name}`);
    }
    
    if (serverToMakeOverdue) {
      // Delete 1-2 recent backups to ensure we have an overdue backup
      const backupsToDelete = Math.min(2, Math.floor(Math.random() * 2) + 1);
      await deleteRecentBackupsToCreateOverdue(serverToMakeOverdue.id, backupsToDelete);
      await delay(1000);
    } else {
      logError('Could not find any server to make overdue');
    }
    
    // Switch to table view
    await switchToTableView(page);
    await delay(2000);
    
    // Take screenshot of dashboard in table mode
    console.log('Taking screenshot of dashboard in table mode...');
    const dashboardTableMode = await takeScreenshot(page, 'screen-main-dashboard-table-mode.png', { cropBottom: 80 });
    if (dashboardTableMode) successful.push('screen-main-dashboard-table-mode.png');
    else failed.push('screen-main-dashboard-table-mode.png');
    
    // Capture dashboard summary card in table mode
    const dashboardSummaryTable = await captureDashboardSummary(page, 'screen-dashboard-summary-table.png');
    if (dashboardSummaryTable) successful.push('screen-dashboard-summary-table.png');
    else failed.push('screen-dashboard-summary-table.png');
    
    // Get the remaining servers
    const remainingServers = await getServers(page);
    if (remainingServers.length === 0) {
      throw new Error('No servers available for screenshots');
    }
    
    // Navigate to first server's backup list page
    console.log('-------------------------------------------------------');
    console.log('Navigating to first server\'s backup list page...');
    const firstServer = remainingServers[0];
    console.log(`Navigating to server backup list: ${firstServer.name} (${firstServer.id})`);
    await page.goto(`${BASE_URL}/detail/${firstServer.id}`, { waitUntil: 'networkidle0' });
    await delay(3000); // Wait for backup list to load
    const serverBackupList = await takeScreenshot(page, 'screen-server-backup-list.png', { cropBottom: 80 });
    if (serverBackupList) successful.push('screen-server-backup-list.png');
    else failed.push('screen-server-backup-list.png');
    
    // Capture backup history table
    const backupHistory = await captureBackupHistoryTable(page, firstServer.id);
    if (backupHistory) successful.push('screen-backup-history.png');
    else failed.push('screen-backup-history.png');
    
    // Capture metrics chart
    const metricsChart = await captureMetricsChart(page, firstServer.id);
    if (metricsChart) successful.push('screen-metrics.png');
    else failed.push('screen-metrics.png');
    
    // Capture AvailableBackupsIcon modal
    const availableBackupsModal = await captureAvailableBackupsModal(page, firstServer.id);
    if (availableBackupsModal) successful.push('screen-available-backups-modal.png');
    else failed.push('screen-available-backups-modal.png');
    
    // Get backup details for this server
    const backupDetails = await page.evaluate(async (serverId) => {
      const res = await fetch(`/api/detail/${serverId}`);
      return res.json();
    }, firstServer.id);
    
    // Navigate to a backup detail page if backups exist
    console.log('-------------------------------------------------------');
    console.log('Navigating to backup detail page...');
    let backupDetail = false;
    if (backupDetails.server && backupDetails.server.backups && backupDetails.server.backups.length > 0) {
      const firstBackup = backupDetails.server.backups[0];
      console.log(`Navigating to backup detail: ${firstBackup.id}`);
      await page.goto(`${BASE_URL}/detail/${firstServer.id}/backup/${firstBackup.id}`, { waitUntil: 'networkidle0' });
      await delay(2000);
      backupDetail = await takeScreenshot(page, 'screen-backup-detail.png', { cropBottom: 80 });
    } else {
      console.log('No backups found for screenshot');
      // Take screenshot anyway of the empty state
      backupDetail = await takeScreenshot(page, 'screen-backup-detail.png', { cropBottom: 80 });
    }
    if (backupDetail) successful.push('screen-backup-detail.png');
    else failed.push('screen-backup-detail.png');
    
    // Capture server overdue message
    const serverOverdueMessage = await captureServerOverdueMessage(page);
    if (serverOverdueMessage) successful.push('screen-server-overdue-message.png');
    else failed.push('screen-server-overdue-message.png');
    
    // Capture server detail summary (server without overdue backups)
    const serverDetailSummary = await captureServerDetailSummary(page);
    if (serverDetailSummary) successful.push('screen-detail-summary.png');
    else failed.push('screen-detail-summary.png');
    
    // Navigate to settings page
    console.log('Navigating to settings page...');
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle0' });
    await delay(2000);
    
    // Take screenshot of settings page left panel (as admin)
    console.log('-------------------------------------------------------');
    console.log('Taking screenshot of settings page left panel (as admin)...');
    const settingsLeftPanelAdmin = await takeScreenshot(page, 'screen-settings-left-panel-admin.png', { isSettingsSidebar: true });
    if (settingsLeftPanelAdmin) successful.push('screen-settings-left-panel-admin.png');
    else failed.push('screen-settings-left-panel-admin.png');
    
    // Take screenshots of all available settings options as admin
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
      'database-maintenance'
    ];
    
    let oldNtfyTopic: string | null = null;
    
    for (const tab of adminSettingsTabs) {
      console.log('-------------------------------------------------------');
      console.log(`Taking screenshot of settings tab: ${tab}`);
      
      // Special handling for NTFY tab - update topic before screenshot
      if (tab === 'ntfy') {
        oldNtfyTopic = await updateNtfyTopic(page, 'duplistatus-screencapture');
        await delay(1000);
      }
      
      // Special handling for audit tab - delete server_deletion entries before screenshot
      if (tab === 'audit') {
        await deleteServerDeletionAuditLogs();
        await delay(1000);
      }
      
      await page.goto(`${BASE_URL}/settings?tab=${tab}`, { waitUntil: 'networkidle0' });
      await delay(2000);
      
      // Sanitize tab name for filename
      const filename = `screen-settings-${tab}.png`;
      const settingsTabResult = await takeScreenshot(page, filename, { isSettingsPage: true });
      if (settingsTabResult) successful.push(filename);
      else failed.push(filename);
      
      // Capture NTFY Configure Device popup after NTFY settings screenshot
      if (tab === 'ntfy') {
        const ntfyPopup = await captureNtfyConfigureDevicePopup(page);
        if (ntfyPopup) successful.push('screen-settings-ntfy-configure-device-popup.png');
        else failed.push('screen-settings-ntfy-configure-device-popup.png');
        
        // Restore old NTFY topic after capturing popup
        if (oldNtfyTopic) {
          await updateNtfyTopic(page, oldNtfyTopic);
          await delay(1000);
        }
      }
      
      // Capture backup notifications detail after notifications settings screenshot
      if (tab === 'notifications') {
        const notificationsDetail = await captureBackupNotificationsDetail(page);
        if (notificationsDetail) successful.push('screen-settings-backup-notifications-detail.png');
        else failed.push('screen-settings-backup-notifications-detail.png');
      }
      
      // Capture overdue monitoring table rows and configuration card
      if (tab === 'overdue') {
        const overdueTableRows = await captureOverdueMonitoringTableRows(page);
        if (overdueTableRows) successful.push('screen-settings-overdue-bkp.png');
        else failed.push('screen-settings-overdue-bkp.png');
        
        const overdueConfig = await captureOverdueMonitoringConfig(page);
        if (overdueConfig) successful.push('screen-settings-overdue-conf.png');
        else failed.push('screen-settings-overdue-conf.png');
      }
    }
    
    // Logout and login as non-admin user
    console.log('-------------------------------------------------------');
    console.log('Logging out and logging in as non-admin user...');
    await logout(page);
    await login(page, USER_USERNAME, USER_PASSWORD!);
    
    // Navigate to settings page as non-admin
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle0' });
    await delay(2000);
    
    // Take screenshot of settings page left panel (as non-admin)
    console.log('-------------------------------------------------------');
    console.log('Taking screenshot of settings page left panel (as non-admin)...');
    const settingsLeftPanelNonAdmin = await takeScreenshot(page, 'screen-settings-left-panel-non-admin.png', { isSettingsSidebar: true });
    if (settingsLeftPanelNonAdmin) successful.push('screen-settings-left-panel-non-admin.png');
    else failed.push('screen-settings-left-panel-non-admin.png');
    
    // Display summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📸 SCREENSHOT GENERATION SUMMARY');
    console.log('='.repeat(60));
    
    if (successful.length > 0) {
      console.log(`\n✅ Successful (${successful.length}):`);
      successful.forEach(filename => {
        console.log(`   ✅ ${filename}`);
      });
    }
    
    if (failed.length > 0) {
      console.log(`\n❌ Failed (${failed.length}):`);
      failed.forEach(filename => {
        logError(`   ❌ ${filename}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`Total: ${successful.length + failed.length} | ✅ ${successful.length} | ❌ ${failed.length}`);
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
