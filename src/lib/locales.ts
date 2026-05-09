import uiLanguages from '@/locales/ui-languages.json';

// Type derived from ui-languages.json
export type LocaleCode = (typeof uiLanguages)[number]['code'];

// Source locale — must match `src/i18n.ts` usage and `sourceLocale` in ai-i18n-tools.config.json
export const SOURCE_LOCALE: LocaleCode = 'en-GB';

/** Cookie name for UI locale (root layout, proxy, client locale sync). Safe for Server Components. */
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

// Static locale code list for validation
export const LOCALE_CODE_LIST = uiLanguages.map((l) => l.code) as LocaleCode[];

// Locale labels (local language name like "Deutsch", "Français")
export const LABEL: Record<LocaleCode, string> = Object.fromEntries(
  uiLanguages.map((l) => [l.code, l.label])
) as Record<LocaleCode, string>;

// English names (like "German", "French")
export const ENGLISH_NAME: Record<LocaleCode, string> = Object.fromEntries(
  uiLanguages.map((l) => [l.code, l.englishName])
) as Record<LocaleCode, string>;

/**
 * Get the list of locale codes for runtime validation.
 */
export function getLocaleCodeList(): readonly LocaleCode[] {
  return LOCALE_CODE_LIST;
}

/**
 * Get the display label for a locale (local language name).
 */
export function getLocaleLabel(locale: LocaleCode): string {
  return LABEL[locale] ?? locale;
}

/**
 * Get the English name for a locale.
 */
export function getLocaleEnglishName(locale: LocaleCode): string {
  return ENGLISH_NAME[locale] ?? locale;
}

/**
 * Check if a locale code is supported (exact match against configured codes).
 */
export function isSupportedLocale(locale: string): locale is LocaleCode {
  return LOCALE_CODE_LIST.includes(locale as LocaleCode);
}

/**
 * Map a user-supplied locale tag to a canonical LocaleCode, or null if unsupported.
 * Case-insensitive match against configured codes.
 */
export function parseLocaleTag(raw: string): LocaleCode | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  const match = LOCALE_CODE_LIST.find((c) => c.toLowerCase() === lower);
  return match ?? null;
}

/**
 * Cookie or preference string → LocaleCode, falling back to {@link SOURCE_LOCALE} when empty or unknown.
 */
export function resolveLocalePreference(raw: string | undefined): LocaleCode {
  return parseLocaleTag(raw ?? '') ?? SOURCE_LOCALE;
}

/**
 * Best-effort UI locale from an `Accept-Language` header value, or null when no match.
 */
export function resolveLocaleFromAcceptLanguage(
  acceptLanguage: string | null | undefined,
): LocaleCode | null {
  if (!acceptLanguage?.trim()) return null;
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, q = 'q=1'] = lang.trim().split(';');
      const quality = parseFloat(q.replace('q=', '')) || 1;
      return { code: code.toLowerCase().split('-')[0], quality };
    })
    .sort((a, b) => b.quality - a.quality);

  const sourceBase = SOURCE_LOCALE.split('-')[0].toLowerCase();
  for (const { code } of languages) {
    if (code === sourceBase) return SOURCE_LOCALE;
    const match = LOCALE_CODE_LIST.find(
      (c) => c.toLowerCase() === code || c.toLowerCase().startsWith(`${code}-`),
    );
    if (match) return match;
  }
  return null;
}