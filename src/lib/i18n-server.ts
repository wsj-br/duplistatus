import { cookies } from "next/headers";
import { createInstance, type i18n as I18nType } from "i18next";
import {
  defaultI18nInitOptions,
  wrapI18nWithKeyTrim,
} from "ai-i18n-tools/runtime";
import { SOURCE_LOCALE, LOCALE_COOKIE_NAME } from "@/i18n-config";
import de from "@/locales/de.json";
import fr from "@/locales/fr.json";
import es from "@/locales/es.json";
import ptBR from "@/locales/pt-BR.json";

const SUPPORTED = ["en", "de", "fr", "es", "pt-BR"] as const;

const bundles: Record<string, Record<string, string>> = {
  de: de as Record<string, string>,
  fr: fr as Record<string, string>,
  es: es as Record<string, string>,
  "pt-BR": ptBR as Record<string, string>,
};

function normalizeLocale(raw: string | undefined): string {
  if (!raw) return SOURCE_LOCALE;
  const n = raw.toLowerCase() === "pt-br" ? "pt-BR" : raw;
  return SUPPORTED.includes(n as (typeof SUPPORTED)[number]) ? n : SOURCE_LOCALE;
}

/**
 * i18next instance for Server Components / non-React code (notifications, RSC).
 */
/** Locale string for number/date formatting (e.g. from NEXT_LOCALE cookie). */
export async function getServerLocalePreference(): Promise<string> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}

export async function getServerI18n(): Promise<I18nType> {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);

  const instance = createInstance();
  await instance.init({
    ...defaultI18nInitOptions(SOURCE_LOCALE),
    lng: locale,
  });
  wrapI18nWithKeyTrim(instance as unknown as Parameters<typeof wrapI18nWithKeyTrim>[0]);

  if (locale !== SOURCE_LOCALE && bundles[locale]) {
    instance.addResourceBundle(locale, "translation", bundles[locale], true, true);
  }
  await instance.changeLanguage(locale);
  return instance;
}
