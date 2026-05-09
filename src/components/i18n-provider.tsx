"use client";

import { type ReactNode, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { loadLocale } from "@/i18n";
import {
  LOCALE_COOKIE_NAME,
  resolveLocalePreference,
} from "@/lib/locales";

function readLocaleCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)`)
  );
  if (!m) return undefined;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return undefined;
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const canonical = resolveLocalePreference(readLocaleCookie());
    void (async () => {
      await loadLocale(canonical);
      await i18n.changeLanguage(canonical);
    })();
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
