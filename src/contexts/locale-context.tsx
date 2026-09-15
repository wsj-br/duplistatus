"use client";

import {
  createContext,
  useContext,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";
import { applyDirection } from "ai-i18n-tools/runtime";
import { SOURCE_LOCALE, parseLocaleTag } from "@/lib/locales";

const LocaleContext = createContext<string>(SOURCE_LOCALE);

/**
 * Provides the active i18n locale (from react-i18next). Must render under I18nextProvider.
 */
export function ClientLocaleProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  useEffect(() => {
    document.documentElement.lang = locale;
    // Client-only signal: SSR already sets html lang from the cookie, so Playwright
    // must not treat that as "translations are loaded".
    document.documentElement.dataset.i18nReady = parseLocaleTag(locale) ?? locale;
    applyDirection(locale);
  }, [locale]);

  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

/**
 * Returns the current locale (e.g. {@link SOURCE_LOCALE}, "de") for number/date formatting and labels.
 */
export function useLocale(): string {
  return useContext(LocaleContext);
}
