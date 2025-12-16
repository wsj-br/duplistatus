import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  mainSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Installation',
      items: [
        'installation/installation',
        'installation/configure-tz-lang',
        'installation/environment-variables',
        'installation/duplicati-server-configuration',
        'installation/https-setup',
      ],
    },
    {
      type: 'category',
      label: 'User Guide',
      items: [
        'user-guide/overview',
        'user-guide/dashboard',
        'user-guide/server-details',
        'user-guide/backup-metrics',
        'user-guide/collect-backup-logs',
        'user-guide/overdue-monitoring',
        'user-guide/duplicati-configuration',
        {
          type: 'category',
          label: 'Settings',
          items: [
            'user-guide/settings/overview',
            'user-guide/settings/backup-notifications-settings',
            'user-guide/settings/overdue-settings',
            'user-guide/settings/notification-templates',
            'user-guide/settings/ntfy-settings',
            'user-guide/settings/email-settings',
            'user-guide/settings/server-settings',
            'user-guide/settings/display-settings',
            'user-guide/settings/database-maintenance',
            'user-guide/settings/user-management-settings',
            'user-guide/settings/audit-log-settings',
          ],
        },
        'user-guide/homepage-integration',
        'user-guide/admin-recovery',
        'user-guide/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Migration',
      items: [
        'migration/version_upgrade',
        'migration/api-changes',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api-reference/overview',
        'api-reference/authentication-security',
        'api-reference/core-operations',
        'api-reference/administration-apis',
        'api-reference/chart-data-apis',
        'api-reference/configuration-apis',
        'api-reference/cron-service-apis',
        'api-reference/external-apis',
        'api-reference/monitoring-apis',
        'api-reference/notification-apis',
        'api-reference/session-management-apis',
        'api-reference/api-endpoint-list',
      ],
    },
    {
      type: 'category',
      label: 'Development',
      items: [
        'development/setup',
        'development/devel',
        'development/database',
        'development/documentation-tools',
        'development/podman-testing',
        'development/release-management',
        'development/test-scripts',
        'development/workspace-admin-scripts-commands',
        'development/cron-service',
        'development/development-guidelines',
        'development/how-i-build-with-ai',
      ],
    },
    {
      type: 'category',
      label: 'Release Notes',
      items: [
        'release-notes/1.0.x',
        'release-notes/0.9.x',
        'release-notes/0.8.x',
        'release-notes/0.7.x',
      ],
    },
  ],
};

export default sidebars;
