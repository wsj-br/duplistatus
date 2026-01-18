import { type ReactNode } from "react";
import { IntlayerProviderWrapper } from "./intlayer-provider-wrapper";

const LOCALES = ["en", "de", "fr", "es", "pt-BR"] as const;

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
  
  return (
    <IntlayerProviderWrapper locale={locale}>
      {children}
    </IntlayerProviderWrapper>
  );
}
