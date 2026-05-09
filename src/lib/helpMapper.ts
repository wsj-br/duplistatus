/**
 * Maps application routes to documentation URLs
 */
import { SOURCE_LOCALE } from './locales';

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
  'settings:monitoring': {
    url: 'user-guide/settings/backup-monitoring-settings',
    pageName: 'Backup Monitoring',
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
 * Gets the help URL and page name for a given route.
 * App routes have no locale segment (language is cookie / i18n); pathname is used as-is.
 *
 * @param pathname - The current pathname (e.g. `'/'`, `'/settings'`, `'/detail/123'`)
 * @param searchParams - Optional search params string (e.g. `'tab=notifications'`)
 * @param locale - Optional UI locale for the **documentation** site path (`de/…`, `pt-BR/…` when not {@link SOURCE_LOCALE})
 * @returns Object with full documentation URL and page name for tooltip
 */
export function getHelpUrl(
  pathname: string,
  searchParams?: string,
  locale?: string
): { url: string; pageName: string } {
  const pathForMatch = pathname || '/';

  const buildDocUrl = (docPath: string): string => {
    const localePrefix = locale && locale !== SOURCE_LOCALE ? `${locale}/` : '';
    return `${DOCS_BASE_URL}${localePrefix}${docPath}`;
  };

  if (pathForMatch === '/settings' || pathForMatch.startsWith('/settings?')) {
    if (searchParams) {
      const params = new URLSearchParams(searchParams);
      const tab = params.get('tab');
      if (tab) {
        const settingsKey = `settings:${tab}`;
        const mapping = HELP_MAP[settingsKey];
        if (mapping) {
          return {
            url: buildDocUrl(mapping.url),
            pageName: mapping.pageName,
          };
        }
      }
    }
    // Settings page without tab or unknown tab
    const settingsMapping = HELP_MAP['/settings'];
    return {
      url: buildDocUrl(settingsMapping.url),
      pageName: settingsMapping.pageName,
    };
  }

  if (pathForMatch.startsWith('/detail/')) {
    if (/^\/detail\/[^/]+\/backup\/[^/]+$/.test(pathForMatch)) {
      return {
        url: buildDocUrl('user-guide/server-details#backup-details'),
        pageName: "Backup Details",
      };
    }
    if (/^\/detail\/[^/]+$/.test(pathForMatch)) {
      return {
        url: buildDocUrl('user-guide/server-details'),
        pageName: "Server Details",
      };
    }
  }

  const exactMatch = HELP_MAP[pathForMatch];
  if (exactMatch) {
    return {
      url: buildDocUrl(exactMatch.url),
      pageName: exactMatch.pageName,
    };
  }

  // Fallback to default
  const defaultMapping = HELP_MAP['default'];
  return {
    url: buildDocUrl(defaultMapping.url),
    pageName: defaultMapping.pageName,
  };
}
