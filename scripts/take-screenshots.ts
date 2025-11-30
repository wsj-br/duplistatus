import puppeteer, { type Page } from 'puppeteer';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:8666';
const ADMIN_USERNAME = 'admin';
const USER_USERNAME = 'user';
const SCREENSHOT_DIR = 'website/static/img';
const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
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
    execSync('pnpm generate-test-data --servers=12', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('Test data generated successfully');
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
    console.log('Error during logout:', error);
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
  console.log(`Deleting server ${serverId}...`);
  
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
  
  console.log(`Successfully deleted server ${serverId}`);
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
}) {
  const waitTime = options?.waitTime ?? 2000;
  const isSettingsPage = options?.isSettingsPage ?? false;
  const isSettingsSidebar = options?.isSettingsSidebar ?? false;
  const cropBottom = options?.cropBottom ?? 0;
  const clip = options?.clip;
  
  console.log(`Taking screenshot: ${filename}...`);
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
  
  logSuccess(`Screenshot saved: ${filepath}`);
}

async function waitForDashboardLoad(page: Page) {
  // Wait for dashboard content to load
  try {
    await page.waitForSelector('[data-testid="dashboard"], .dashboard, main', { timeout: 10000 });
  } catch (error) {
    console.log('Dashboard selector not found, continuing anyway...');
  }
  await delay(2000); // Additional wait for animations
}

async function switchToTableView(page: Page) {
  console.log('Switching to table view...');
  try {
    // Wait for the dashboard to load
    await delay(2000);
    
    // Check current view mode
    const currentViewMode = await page.evaluate(() => {
      // Check localStorage for view mode
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.includes('dashboard-view-mode') || key.includes('view-mode')) {
          return localStorage.getItem(key);
        }
      }
      return null;
    });
    
    console.log(`Current view mode: ${currentViewMode}`);
    
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
          const newViewMode = await page.evaluate(() => {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
              if (key.includes('dashboard-view-mode') || key.includes('view-mode')) {
                return localStorage.getItem(key);
              }
            }
            return null;
          });
          
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
        console.log('Could not click view mode button using evaluate method, trying CSS selector...');
        // Fallback: try CSS selector approach
        try {
          await page.waitForSelector('button:has(svg[class*="LayoutDashboard"]), button:has(svg[class*="Sheet"])', { timeout: 5000 });
          await page.click('button:has(svg[class*="LayoutDashboard"]), button:has(svg[class*="Sheet"])');
          await delay(2000);
        } catch (selectorError) {
          console.log('Could not click view mode button using CSS selector either');
        }
      }
    }
  } catch (error) {
    console.log('Error switching to table view:', error);
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
    console.log('Error getting NTFY config:', error);
    return null;
  }
}

async function updateNtfyTopic(page: Page, newTopic: string): Promise<string | null> {
  console.log(`Updating NTFY topic to: ${newTopic}`);
  try {
    // Get current config
    const currentConfig = await getNtfyConfig(page);
    if (!currentConfig) {
      console.log('Could not get current NTFY config');
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
      console.log('Failed to update NTFY topic');
      return null;
    }
  } catch (error) {
    console.log('Error updating NTFY topic:', error);
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
    console.log('Error deleting server_deletion audit logs:', error);
    return 0;
  }
}

async function captureCollectButtonPopup(page: Page) {
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
      
      if (popupBounds) {
        await takeScreenshot(page, 'screen-collect-button-popup.png', {
          clip: popupBounds
        });
        console.log('Captured collect button popup');
      } else {
        console.log('Could not find collect button popup bounds');
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
          await takeScreenshot(page, 'screen-collect-button-right-click-popup.png', {
            clip: menuBounds
          });
          console.log('Captured collect button right-click popup');
        } else {
          console.log('Could not find collect button right-click popup bounds');
        }
        
        // Close menu
        await page.keyboard.press('Escape');
        await delay(500);
      }
    } else {
      console.log('Could not find collect button');
    }
  } catch (error) {
    console.log('Error capturing collect button popup:', error);
  }
}

async function captureNtfyConfigureDevicePopup(page: Page) {
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
        await takeScreenshot(page, 'screen-settings-ntfy-configure-device-popup.png', {
          clip: dialogBounds
        });
      }
      
      // Close dialog
      await page.keyboard.press('Escape');
      await delay(500);
    }
  } catch (error) {
    console.log('Error capturing NTFY Configure Device popup:', error);
  }
}

async function captureOverdueBackupHoverCard(page: Page) {
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
        await takeScreenshot(page, 'screen-overdue-backup-hover-card.png', {
          clip: tooltipBounds
        });
        console.log('Captured overdue backup hover card');
      } else {
        console.log('Could not find overdue backup tooltip bounds');
      }
    } else {
      console.log('Could not find overdue backup item to hover');
    }
  } catch (error) {
    console.log('Error capturing overdue backup hover card:', error);
  }
}

async function main() {
  console.log('Starting screenshot automation...');
  
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
    await takeScreenshot(page, 'screen-main-dashboard-card-mode.png', { cropBottom: 80 });
    
    // Capture overdue backup hover card
    await captureOverdueBackupHoverCard(page);
    
    // Capture collect button popups
    await captureCollectButtonPopup(page);
    
    // Get list of servers
    const servers = await getServers(page);
    console.log(`Found ${servers.length} servers`);
    
    // Keep only 3 servers, delete the rest
    if (servers.length > 3) {
      const serversToDelete = servers.slice(3);
      console.log(`Deleting ${serversToDelete.length} servers, keeping 3...`);
      
      for (const server of serversToDelete) {
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
      const serversToConfigure = remainingServersAfterDeletion.slice(0, 2);
      
      // Configure first server: http://{servername}.local:8200
      const firstServer = serversToConfigure[0];
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
      const secondServer = serversToConfigure[1];
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
      
      // Refresh the page to see updated server configurations
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      await waitForDashboardLoad(page);
    }
    
    // Switch to table view
    await switchToTableView(page);
    await delay(2000);
    
    // Take screenshot of dashboard in table mode
    await takeScreenshot(page, 'screen-main-dashboard-table-mode.png', { cropBottom: 80 });
    
    // Get the remaining servers
    const remainingServers = await getServers(page);
    if (remainingServers.length === 0) {
      throw new Error('No servers available for screenshots');
    }
    
    // Navigate to first server's backup list page
    const firstServer = remainingServers[0];
    console.log(`Navigating to server backup list: ${firstServer.name} (${firstServer.id})`);
    await page.goto(`${BASE_URL}/detail/${firstServer.id}`, { waitUntil: 'networkidle0' });
    await delay(3000); // Wait for backup list to load
    await takeScreenshot(page, 'screen-server-backup-list.png', { cropBottom: 80 });
    
    // Get backup details for this server
    const backupDetails = await page.evaluate(async (serverId) => {
      const res = await fetch(`/api/detail/${serverId}`);
      return res.json();
    }, firstServer.id);
    
    // Navigate to a backup detail page if backups exist
    if (backupDetails.server && backupDetails.server.backups && backupDetails.server.backups.length > 0) {
      const firstBackup = backupDetails.server.backups[0];
      console.log(`Navigating to backup detail: ${firstBackup.id}`);
      await page.goto(`${BASE_URL}/detail/${firstServer.id}/backup/${firstBackup.id}`, { waitUntil: 'networkidle0' });
      await delay(2000);
      await takeScreenshot(page, 'screen-backup-detail.png', { cropBottom: 80 });
    } else {
      console.log('No backups found for screenshot');
      // Take screenshot anyway of the empty state
      await takeScreenshot(page, 'screen-backup-detail.png', { cropBottom: 80 });
    }
    
    // Navigate to settings page
    console.log('Navigating to settings page...');
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle0' });
    await delay(2000);
    
    // Take screenshot of settings page left panel (as admin)
    await takeScreenshot(page, 'screen-settings-left-panel-admin.png', { isSettingsSidebar: true });
    
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
      await takeScreenshot(page, filename, { isSettingsPage: true });
      
      // Capture NTFY Configure Device popup after NTFY settings screenshot
      if (tab === 'ntfy') {
        await captureNtfyConfigureDevicePopup(page);
        
        // Restore old NTFY topic after capturing popup
        if (oldNtfyTopic) {
          await updateNtfyTopic(page, oldNtfyTopic);
          await delay(1000);
        }
      }
    }
    
    // Logout and login as non-admin user
    await logout(page);
    await login(page, USER_USERNAME, USER_PASSWORD!);
    
    // Navigate to settings page as non-admin
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle0' });
    await delay(2000);
    
    // Take screenshot of settings page left panel (as non-admin)
    await takeScreenshot(page, 'screen-settings-left-panel-non-admin.png', { isSettingsSidebar: true });
    
    console.log('All screenshots completed successfully!');
    
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
