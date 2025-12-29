import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/',
    component: ComponentCreator('/', 'e5f'),
    exact: true
  },
  {
    path: '/',
    component: ComponentCreator('/', '8b1'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', '6a5'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', 'e10'),
            routes: [
              {
                path: '/api-reference/administration-apis',
                component: ComponentCreator('/api-reference/administration-apis', 'f9e'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/api-reference/api-endpoint-list',
                component: ComponentCreator('/api-reference/api-endpoint-list', '703'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/api-reference/authentication-security',
                component: ComponentCreator('/api-reference/authentication-security', 'cf7'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/api-reference/chart-data-apis',
                component: ComponentCreator('/api-reference/chart-data-apis', 'b1d'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/api-reference/configuration-apis',
                component: ComponentCreator('/api-reference/configuration-apis', '999'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/api-reference/core-operations',
                component: ComponentCreator('/api-reference/core-operations', '442'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/api-reference/cron-service-apis',
                component: ComponentCreator('/api-reference/cron-service-apis', '223'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/api-reference/external-apis',
                component: ComponentCreator('/api-reference/external-apis', 'f6b'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/api-reference/monitoring-apis',
                component: ComponentCreator('/api-reference/monitoring-apis', '7bd'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/api-reference/notification-apis',
                component: ComponentCreator('/api-reference/notification-apis', 'c6d'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/api-reference/overview',
                component: ComponentCreator('/api-reference/overview', '080'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/api-reference/session-management-apis',
                component: ComponentCreator('/api-reference/session-management-apis', 'e62'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/development/cron-service',
                component: ComponentCreator('/development/cron-service', '68f'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/development/database',
                component: ComponentCreator('/development/database', 'cb0'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/development/devel',
                component: ComponentCreator('/development/devel', 'e20'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/development/development-guidelines',
                component: ComponentCreator('/development/development-guidelines', 'e1a'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/development/documentation-tools',
                component: ComponentCreator('/development/documentation-tools', '4a4'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/development/how-i-build-with-ai',
                component: ComponentCreator('/development/how-i-build-with-ai', 'd0d'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/development/podman-testing',
                component: ComponentCreator('/development/podman-testing', '975'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/development/release-management',
                component: ComponentCreator('/development/release-management', '2d7'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/development/setup',
                component: ComponentCreator('/development/setup', 'da1'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/development/test-scripts',
                component: ComponentCreator('/development/test-scripts', '977'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/development/workspace-admin-scripts-commands',
                component: ComponentCreator('/development/workspace-admin-scripts-commands', '758'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/installation',
                component: ComponentCreator('/installation', '43d'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/installation/configure-tz-lang',
                component: ComponentCreator('/installation/configure-tz-lang', '481'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/installation/duplicati-server-configuration',
                component: ComponentCreator('/installation/duplicati-server-configuration', '5ee'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/installation/environment-variables',
                component: ComponentCreator('/installation/environment-variables', 'fe3'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/installation/https-setup',
                component: ComponentCreator('/installation/https-setup', 'b8e'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/intro',
                component: ComponentCreator('/intro', '9af'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/LICENSE',
                component: ComponentCreator('/LICENSE', '86c'),
                exact: true
              },
              {
                path: '/migration/api-changes',
                component: ComponentCreator('/migration/api-changes', '030'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/migration/version_upgrade',
                component: ComponentCreator('/migration/version_upgrade', '352'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/release-notes/0.7.x',
                component: ComponentCreator('/release-notes/0.7.x', '85a'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/release-notes/0.8.x',
                component: ComponentCreator('/release-notes/0.8.x', 'd1b'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/release-notes/0.9.x',
                component: ComponentCreator('/release-notes/0.9.x', '354'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/release-notes/1.0.x',
                component: ComponentCreator('/release-notes/1.0.x', 'a3e'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/admin-recovery',
                component: ComponentCreator('/user-guide/admin-recovery', '86e'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/backup-metrics',
                component: ComponentCreator('/user-guide/backup-metrics', '8d8'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/collect-backup-logs',
                component: ComponentCreator('/user-guide/collect-backup-logs', 'f89'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/dashboard',
                component: ComponentCreator('/user-guide/dashboard', '5fb'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/duplicati-configuration',
                component: ComponentCreator('/user-guide/duplicati-configuration', '24d'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/homepage-integration',
                component: ComponentCreator('/user-guide/homepage-integration', 'f1f'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/overdue-monitoring',
                component: ComponentCreator('/user-guide/overdue-monitoring', '680'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/overview',
                component: ComponentCreator('/user-guide/overview', 'ffc'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/server-details',
                component: ComponentCreator('/user-guide/server-details', '843'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/settings/audit-log-settings',
                component: ComponentCreator('/user-guide/settings/audit-log-settings', '328'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/settings/backup-notifications-settings',
                component: ComponentCreator('/user-guide/settings/backup-notifications-settings', '9fa'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/settings/database-maintenance',
                component: ComponentCreator('/user-guide/settings/database-maintenance', '708'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/settings/display-settings',
                component: ComponentCreator('/user-guide/settings/display-settings', 'fe4'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/settings/email-settings',
                component: ComponentCreator('/user-guide/settings/email-settings', 'a4b'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/settings/notification-templates',
                component: ComponentCreator('/user-guide/settings/notification-templates', '845'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/settings/ntfy-settings',
                component: ComponentCreator('/user-guide/settings/ntfy-settings', 'ab1'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/settings/overdue-settings',
                component: ComponentCreator('/user-guide/settings/overdue-settings', '38f'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/settings/overview',
                component: ComponentCreator('/user-guide/settings/overview', '7bc'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/settings/server-settings',
                component: ComponentCreator('/user-guide/settings/server-settings', 'bd5'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/settings/user-management-settings',
                component: ComponentCreator('/user-guide/settings/user-management-settings', 'c78'),
                exact: true,
                sidebar: "mainSidebar"
              },
              {
                path: '/user-guide/troubleshooting',
                component: ComponentCreator('/user-guide/troubleshooting', '464'),
                exact: true,
                sidebar: "mainSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
