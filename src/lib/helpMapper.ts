/**
 * Maps application routes to documentation URLs
 */

// the URL has to end in a trailing slash (/)
const DOCS_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://wsj-br.github.io/duplistatus/'
    : 'http://localhost:3000/';

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
    url: 'user-guide/settings/audit-logs-viewer',
    pageName: 'Audit Log Viewer',
  },
  'settings:audit-retention': {
    url: 'user-guide/settings/audit-logs-retention',
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
  // Normalize: strip optional locale prefix (e.g. /en, /de) for routing logic
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Za-z0-9]+)?/, "") || "/";

  // Handle settings routes with query parameters (/settings or /en/settings etc.)
  if (pathWithoutLocale === "/settings" || pathWithoutLocale.startsWith("/settings?")) {
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

  // Handle dynamic routes - server details (pathWithoutLocale: /detail/xxx or /detail/xxx/backup/yyy)
  if (pathWithoutLocale.startsWith("/detail/")) {
    if (/^\/detail\/[^/]+\/backup\/[^/]+$/.test(pathWithoutLocale)) {
      return {
        url: `${DOCS_BASE_URL}user-guide/server-details#backup-details`,
        pageName: "Backup Details",
      };
    }
    if (/^\/detail\/[^/]+$/.test(pathWithoutLocale)) {
      return {
        url: `${DOCS_BASE_URL}user-guide/server-details`,
        pageName: "Server Details",
      };
    }
  }

  // Exact path matches (dashboard / or /en -> /, etc.)
  const exactMatch = HELP_MAP[pathWithoutLocale];
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
