import type { DailySummaryTemplateSet, NotificationTemplate, SupportedTemplateLanguage } from '@/lib/types';
import { parseLocaleTag, SOURCE_LOCALE } from '@/lib/locales';
import templatesDe from '@/locales/templates/de.json';
import templatesEnGB from '@/locales/templates/en-GB.json';
import templatesEs from '@/locales/templates/es.json';
import templatesFr from '@/locales/templates/fr.json';
import templatesHi from '@/locales/templates/hi.json';
import templatesPtBR from '@/locales/templates/pt-BR.json';
import templatesZhHans from '@/locales/templates/zh-Hans.json';

/** Default notification templates loaded from per-locale JSON (source: en-GB). */
export type DefaultNotificationTemplatesData = {
  overdueBackup: NotificationTemplate;
  success: NotificationTemplate;
  warning: NotificationTemplate;
  dailySummary: DailySummaryTemplateSet;
};

function asTemplates(data: DefaultNotificationTemplatesData): DefaultNotificationTemplatesData {
  return data;
}

export const defaultNotificationTemplatesByLanguage: Record<
  SupportedTemplateLanguage,
  DefaultNotificationTemplatesData
> = {
  [SOURCE_LOCALE]: asTemplates(templatesEnGB),
  de: asTemplates(templatesDe),
  fr: asTemplates(templatesFr),
  es: asTemplates(templatesEs),
  'pt-BR': asTemplates(templatesPtBR),
  hi: asTemplates(templatesHi),
  'zh-Hans': asTemplates(templatesZhHans),
};

/** Source-locale defaults (en-GB). */
export const defaultNotificationTemplatesEn = defaultNotificationTemplatesByLanguage[SOURCE_LOCALE];

/**
 * @deprecated Use getDefaultNotificationTemplates(language) instead.
 */
export const defaultNotificationTemplates = defaultNotificationTemplatesEn;

export function getDefaultNotificationTemplates(
  language: SupportedTemplateLanguage = SOURCE_LOCALE,
): DefaultNotificationTemplatesData {
  return defaultNotificationTemplatesByLanguage[language] ?? defaultNotificationTemplatesByLanguage[SOURCE_LOCALE];
}

export function getDefaultDailySummaryTemplates(
  language: SupportedTemplateLanguage = SOURCE_LOCALE,
): DailySummaryTemplateSet {
  return getDefaultNotificationTemplates(language).dailySummary;
}

export function getDefaultNotificationTemplate(
  language: SupportedTemplateLanguage,
  templateType: 'success' | 'warning' | 'overdueBackup',
): NotificationTemplate {
  const templates = getDefaultNotificationTemplates(language);
  return templates[templateType];
}

export function isValidTemplateLanguage(language: string): language is SupportedTemplateLanguage {
  return parseLocaleTag(language) !== null;
}
