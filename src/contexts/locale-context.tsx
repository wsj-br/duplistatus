"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";
import { applyDirection } from "ai-i18n-tools/runtime";

const DEFAULT_LOCALE = "en";

const LocaleContext = createContext<string>(DEFAULT_LOCALE);

/**
 * Provides the active i18n locale (from react-i18next). Must render under I18nextProvider.
 */
export function ClientLocaleProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  useEffect(() => {
    document.documentElement.lang = locale;
    applyDirection(locale);
  }, [locale]);

  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

/**
 * Returns the current locale (e.g. "en", "de") for number/date formatting and labels.
 */
export function useLocale(): string {
  return useContext(LocaleContext);
}

/**
 * Returns paths without a locale prefix (language is driven by i18n, not the URL).
 */
export function usePrefixWithLocale() {
  return useCallback((path: string) => {
    if (path.startsWith("/")) return path;
    return `/${path}`;
  }, []);
}
