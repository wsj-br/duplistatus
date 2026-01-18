"use client";

import { type ReactNode } from "react";
import { IntlayerProvider } from "react-intlayer";

interface IntlayerProviderWrapperProps {
  children: ReactNode;
  locale: string;
}

export function IntlayerProviderWrapper({ 
  children, 
  locale 
}: IntlayerProviderWrapperProps) {
  // Map locale codes to Intlayer Locales enum values
  // Intlayer expects locale strings like 'en', 'de', 'fr', 'es', 'pt-BR'
  const intlayerLocale = locale as 'en' | 'de' | 'fr' | 'es' | 'pt-BR';
  
  return (
    <IntlayerProvider locale={intlayerLocale}>
      {children}
    </IntlayerProvider>
  );
}
