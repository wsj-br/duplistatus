/**
 * Client-side helpers for the UI language preference.
 *
 * The active locale still uses the NEXT_LOCALE cookie for SSR, but the durable
 * preference is stored per authenticated user in localStorage (same pattern as theme).
 */

import i18n, { loadLocale } from '@/i18n';
import {
  LOCALE_COOKIE_NAME,
  parseLocaleTag,
  type LocaleCode,
} from '@/lib/locales';

/** Base localStorage key; user-scoped via {@link getUserLocalStorageKey}. */
export const UI_LOCALE_STORAGE_KEY = 'ui-locale';

const LOCALE_COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

/**
 * Read the NEXT_LOCALE cookie value (decoded), or undefined if missing/invalid encoding.
 */
export function readLocaleCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)`),
  );
  if (!match) return undefined;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return undefined;
  }
}

/**
 * Persist the UI locale cookie used by the root layout and proxy for SSR.
 */
export function setLocaleCookie(locale: LocaleCode): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

/**
 * Load locale resources, switch i18next, and sync the SSR cookie.
 */
export async function applyUiLocale(locale: LocaleCode): Promise<void> {
  setLocaleCookie(locale);
  await loadLocale(locale);
  await i18n.changeLanguage(locale);
}

/**
 * Canonical locale currently active in i18next (falls back via parseLocaleTag).
 */
export function getActiveUiLocale(): LocaleCode | null {
  return parseLocaleTag(i18n.language);
}
