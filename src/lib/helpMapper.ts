/**
 * Maps application routes to documentation URLs
 */

const DOCS_BASE_URL = 'https://wsj-br.github.io/duplistatus/';

interface HelpMapping {
  url: string;
  pageName: string;
}

/**
 * Route-to-documentation mapping
 * Keys are route patterns, values are documentation paths and page names
 */
const HELP_MAP: Record<string, HelpMapping> = {
  // Dashboard
  '/': {
    url: 'user-guide/dashboard',
    pageName: 'Dashboard',
  },
  
  // Settings routes (handled via query params)
  'settings:notifications': {
    url: 'user-guide/settings/backup-notifications-settings',
    pageName: 'Backup Notifications',
  },
  'settings:overdue': {
    url: 'user-guide/settings/overdue-settings',
    pageName: 'Overdue Monitoring',
  },
  'settings:templates': {
    url: 'user-guide/settings/notification-templates',
    pageName: 'Notification Templates',
  },
  'settings:ntfy': {
    url: 'user-guide/settings/ntfy-settings',
    pageName: 'NTFY Settings',
  },
  'settings:email': {
    url: 'user-guide/settings/email-settings',
    pageName: 'Email Settings',
  },
  'settings:server': {
    url: 'user-guide/settings/server-settings',
    pageName: 'Server Settings',
  },
  'settings:display': {
    url: 'user-guide/settings/display-settings',
    pageName: 'Display Settings',
  },
  'settings:database-maintenance': {
    url: 'user-guide/settings/database-maintenance',
    pageName: 'Database Maintenance',
  },
  'settings:users': {
    url: 'user-guide/settings/user-management-settings',
    pageName: 'User Management',
  },
  'settings:audit': {
    url: 'user-guide/settings/audit-log-settings',
    pageName: 'Audit Log',
  },
  'settings:audit-retention': {
    url: 'user-guide/settings/audit-log-settings',
    pageName: 'Audit Log Retention',
  },
  'settings:application-logs': {
    url: 'user-guide/settings/application-logs-settings',
    pageName: 'Application Logs',
  },
  '/settings': {
    url: 'user-guide/settings/overview',
    pageName: 'Settings',
  },
  
  // Default fallback
  'default': {
    url: 'user-guide/overview',
    pageName: 'User Guide',
  },
};

/**
 * Gets the help URL and page name for a given route
 * @param pathname - The current pathname (e.g., '/', '/settings', '/detail/123')
 * @param searchParams - Optional search params string (e.g., 'tab=notifications')
 * @returns Object with full documentation URL and page name for tooltip
 */
export function getHelpUrl(
  pathname: string,
  searchParams?: string
): { url: string; pageName: string } {
  // Handle settings routes with query parameters
  if (pathname === '/settings') {
    if (searchParams) {
      const params = new URLSearchParams(searchParams);
      const tab = params.get('tab');
      if (tab) {
        const settingsKey = `settings:${tab}`;
        const mapping = HELP_MAP[settingsKey];
        if (mapping) {
          return {
            url: `${DOCS_BASE_URL}${mapping.url}`,
            pageName: mapping.pageName,
          };
        }
      }
    }
    // Settings page without tab or unknown tab
    const settingsMapping = HELP_MAP['/settings'];
    return {
      url: `${DOCS_BASE_URL}${settingsMapping.url}`,
      pageName: settingsMapping.pageName,
    };
  }

  // Handle dynamic routes - server details
  if (pathname.startsWith('/detail/')) {
    // Check if it's a backup detail page (pattern: /detail/[serverId]/backup/[backupId])
    if (/^\/detail\/[^/]+\/backup\/[^/]+$/.test(pathname)) {
      return {
        url: `${DOCS_BASE_URL}user-guide/backup-metrics`,
        pageName: 'Backup Metrics',
      };
    }
    // Regular server detail page (pattern: /detail/[serverId])
    if (/^\/detail\/[^/]+$/.test(pathname)) {
      return {
        url: `${DOCS_BASE_URL}user-guide/server-details`,
        pageName: 'Server Details',
      };
    }
  }

  // Exact path matches
  const exactMatch = HELP_MAP[pathname];
  if (exactMatch) {
    return {
      url: `${DOCS_BASE_URL}${exactMatch.url}`,
      pageName: exactMatch.pageName,
    };
  }

  // Fallback to default
  const defaultMapping = HELP_MAP['default'];
  return {
    url: `${DOCS_BASE_URL}${defaultMapping.url}`,
    pageName: defaultMapping.pageName,
  };
}
