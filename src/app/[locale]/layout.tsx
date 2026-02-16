import { type ReactNode } from "react";
import { IntlayerProviderWrapper } from "./intlayer-provider-wrapper";

const LOCALES = ["en", "de", "fr", "es", "pt-BR"] as const;

/**
 * Normalizes a locale string to the canonical format.
 * Accepts both "pt-br" and "pt-BR" and normalizes to "pt-BR".
 */
function normalizeLocale(locale: string): string {
  const normalized = locale.toLowerCase() === "pt-br" ? "pt-BR" : locale;
  // Validate against supported locales, fallback to "en" if invalid
  if (LOCALES.includes(normalized as (typeof LOCALES)[number])) {
    return normalized;
  }
  return "en"; // Default fallback
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: { 
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Normalize locale to handle both pt-br and pt-BR
  const normalizedLocale = normalizeLocale(locale);
  
  return (
    <IntlayerProviderWrapper locale={normalizedLocale}>
      {children}
    </IntlayerProviderWrapper>
  );
}
