// Content organization for duplistatus internationalization
// Note: Intlayer automatically discovers *.content.ts files, so this file is mainly for type exports
// Component-specific content files are co-located with their components

import commonContentModule from './common.content';
import settingsContentModule from './settings.content';
import authContentModule from './auth.content';
import apiContentModule from './api.content';
import notificationsContentModule from './notifications.content';

export { default as commonContent } from './common.content';
export { default as settingsContent } from './settings.content';
export { default as authContent } from './auth.content';
export { default as apiContent } from './api.content';
export { default as notificationsContent } from './notifications.content';

export type {
  CommonContent,
  SettingsContent,
  AuthContent,
  ApiContent,
  NotificationsContent,
  ContentTypes,
  ContentStructure,
  SupportedLocale,
  // Component-specific content types (hybrid per-component approach)
  OverviewCardsContent,
  DashboardTableContent,
  OverviewChartsPanelContent,
  DashboardPageContent,
  DashboardSummaryCardsContent,
  ServerBackupTableContent,
  ServerDetailSummaryItemsContent,
  ServerDetailsContentContent,
  ServerSettingsFormContent,
  EmailConfigurationFormContent,
  NtfyFormContent,
  NotificationTemplatesFormContent,
  BackupMonitoringFormContent,
  UserManagementFormContent,
  AuditLogViewerContent,
  DatabaseMaintenanceFormContent,
  BackupTooltipContentContent,
  AvailableBackupsModalContent,
  LoginPageContent,
} from './types';

export { contentKeys } from './types';

// Content map for centralized content files only
// Component-specific content files are auto-discovered by Intlayer
export const contentMap = {
  common: () => import('./common.content'),
  settings: () => import('./settings.content'),
  auth: () => import('./auth.content'),
  api: () => import('./api.content'),
  notifications: () => import('./notifications.content'),
};

// Utility function to get all content keys
export const getAllContentKeys = () => Object.keys(contentMap);

// Default export containing centralized content only
// Component-specific content is auto-discovered by Intlayer
const defaultExport = {
  commonContent: commonContentModule,
  settingsContent: settingsContentModule,
  authContent: authContentModule,
  apiContent: apiContentModule,
  notificationsContent: notificationsContentModule,
  contentMap,
  getAllContentKeys,
};

export default defaultExport;