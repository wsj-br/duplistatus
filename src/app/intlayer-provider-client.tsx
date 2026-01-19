"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { IntlayerProvider } from "react-intlayer";

interface IntlayerProviderClientProps {
  children: ReactNode;
}

export function IntlayerProviderClient({ children }: IntlayerProviderClientProps) {
  const pathname = usePathname();
  
  // Extract locale from pathname (e.g., /es/dashboard -> es)
  const localeMatch = pathname?.match(/^\/([^/]+)/);
  const locale = (localeMatch?.[1] && ['en', 'de', 'fr', 'es', 'pt-BR'].includes(localeMatch[1]))
    ? localeMatch[1] as 'en' | 'de' | 'fr' | 'es' | 'pt-BR'
    : 'en'; // Default to 'en' if no valid locale found
  
  return (
    <IntlayerProvider locale={locale}>
      {children}
    </IntlayerProvider>
  );
}
