"use client";

import { type ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { IntlayerProvider } from "react-intlayer";
import { EditorProvider } from "@intlayer/editor-react";

interface IntlayerProviderClientProps {
  children: ReactNode;
}

export function IntlayerProviderClient({ children }: IntlayerProviderClientProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // We only set mounted to true after the component has mounted on the client
    // This is to avoid hydration mismatch when using client-only features like window.postMessage
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Extract locale from pathname (e.g., /es/dashboard -> es)
  const localeMatch = pathname?.match(/^\/([^/]+)/);
  const locale = (localeMatch?.[1] && ['en', 'de', 'fr', 'es', 'pt-BR'].includes(localeMatch[1]))
    ? localeMatch[1] as 'en' | 'de' | 'fr' | 'es' | 'pt-BR'
    : 'en'; // Default to 'en' if no valid locale found

  return (
    <IntlayerProvider locale={locale}>
      {mounted ? (
        <EditorProvider
          postMessage={window.postMessage.bind(window)}
          allowedOrigins={["http://localhost:8000"]}
          mode="client"
        >
          {children}
        </EditorProvider>
      ) : (
        children
      )}
    </IntlayerProvider>
  );
}
