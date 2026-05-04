"use client";

import { type ReactNode, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { loadLocale } from "@/i18n";
import { LOCALE_COOKIE_NAME } from "@/i18n-config";

function readLocaleCookie(): string {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)`)
  );
  if (!m) return "en";
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return "en";
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const loc = readLocaleCookie();
    const normalized = loc.toLowerCase() === "pt-br" ? "pt-BR" : loc;
    void (async () => {
      await loadLocale(normalized);
      await i18n.changeLanguage(normalized);
    })();
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
