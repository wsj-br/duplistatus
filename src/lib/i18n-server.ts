import { cookies } from 'next/headers';
import { createInstance, type i18n as I18nType } from 'i18next';
import aiI18n from 'ai-i18n-tools/runtime';
import stringsJson from '@/locales/strings.json';
import uiLanguages from '@/locales/ui-languages.json';
import {
  SOURCE_LOCALE,
  LOCALE_COOKIE_NAME,
  resolveLocalePreference,
  type LocaleCode,
} from '@/lib/locales';

// Paths must stay aligned with `src/i18n.ts` and `ui` in ai-i18n-tools.config.json.
const localeLoaders = aiI18n.makeLocaleLoadersFromManifest(
  uiLanguages,
  SOURCE_LOCALE,
  (code) => () => import(`../locales/${code}.json`),
);

async function buildServerI18n(locale: LocaleCode): Promise<I18nType> {
  const instance = createInstance();
  await instance.init({
    ...aiI18n.defaultI18nInitOptions(SOURCE_LOCALE),
    lng: locale,
  });

  aiI18n.setupKeyAsDefaultT(instance, {
    stringsJson,
  });

  instance.on('languageChanged', aiI18n.applyDirection);
  aiI18n.applyDirection(instance.language);

  const loadLocale = aiI18n.makeLoadLocale(instance, localeLoaders, SOURCE_LOCALE);
  await loadLocale(locale);
  await instance.changeLanguage(locale);

  return instance;
}

/**
 * Locale string for number/date formatting (e.g. from NEXT_LOCALE cookie).
 */
export async function getServerLocalePreference(): Promise<string> {
  const cookieStore = await cookies();
  return resolveLocalePreference(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}

/**
 * i18next instance for Server Components / non-React code (notifications, RSC).
 * Wired like `src/i18n.ts`: manifest-driven locale loaders, `setupKeyAsDefaultT`, RTL handling.
 */
export async function getServerI18n(): Promise<I18nType> {
  const cookieStore = await cookies();
  const locale = resolveLocalePreference(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
  return buildServerI18n(locale);
}

/**
 * Same wiring as {@link getServerI18n} but uses an explicit language tag (e.g. notification template language),
 * not the session cookie.
 */
export async function getServerI18nForLanguage(language: string): Promise<I18nType> {
  const locale = resolveLocalePreference(language);
  return buildServerI18n(locale);
}
