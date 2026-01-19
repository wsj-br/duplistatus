"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";
import { getTextDirection } from "@/lib/rtl-utils";

const SUPPORTED_LOCALES = ["en", "de", "fr", "es", "pt-BR"] as const;
const DEFAULT_LOCALE = "en";

const LocaleContext = createContext<string>(DEFAULT_LOCALE);

/**
 * Normalizes a locale string to the canonical format.
 * Accepts both "pt-br" and "pt-BR" and normalizes to "pt-BR".
 */
function normalizeLocale(locale: string): string | null {
  const normalized = locale.toLowerCase() === "pt-br" ? "pt-BR" : locale;
  if (SUPPORTED_LOCALES.includes(normalized as (typeof SUPPORTED_LOCALES)[number])) {
    return normalized;
  }
  return null;
}

function getLocaleFromPathname(pathname: string | null): string {
  if (!pathname) return DEFAULT_LOCALE;
  const m = pathname.match(/^\/([^/]+)/);
  if (m) {
    const normalized = normalizeLocale(m[1]);
    if (normalized) {
      return normalized;
    }
  }
  return DEFAULT_LOCALE;
}

/**
 * Provides the current locale derived from the URL pathname (e.g. /en/settings -> "en").
 * Use when inside [locale] routes. Falls back to "en" for /api, /not-found, or root /.
 */
export function ClientLocaleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useMemo(() => getLocaleFromPathname(pathname), [pathname]);

  useEffect(() => {
    document.documentElement.lang = locale;
    // Set text direction based on locale (RTL or LTR)
    const direction = getTextDirection(locale);
    document.documentElement.dir = direction;
  }, [locale]);

  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

/**
 * Returns the current locale (e.g. "en", "de"). Use for building locale-prefixed paths.
 * Defaults to "en" when not in a [locale] route (e.g. /api, /not-found).
 */
export function useLocale(): string {
  return useContext(LocaleContext);
}

/**
 * Prefixes a path with the current locale. Use for Link href and router.push.
 * @example prefixWithLocale("/settings") => "/en/settings"
 * @example prefixWithLocale("/detail/abc") => "/en/detail/abc"
 */
export function usePrefixWithLocale() {
  const locale = useLocale();
  return useCallback(
    (path: string) => (path.startsWith("/") ? `/${locale}${path}` : `/${locale}/${path}`),
    [locale]
  );
}
