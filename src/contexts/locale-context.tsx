"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";

const SUPPORTED_LOCALES = ["en", "de", "fr", "es", "pt-BR"] as const;
const DEFAULT_LOCALE = "en";

const LocaleContext = createContext<string>(DEFAULT_LOCALE);

function getLocaleFromPathname(pathname: string | null): string {
  if (!pathname) return DEFAULT_LOCALE;
  const m = pathname.match(/^\/([^/]+)/);
  return m && SUPPORTED_LOCALES.includes(m[1] as (typeof SUPPORTED_LOCALES)[number])
    ? m[1]
    : DEFAULT_LOCALE;
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
