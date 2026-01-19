import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import localFont from "next/font/local";
import "./globals.css";
import { CustomThemeProvider } from "@/contexts/theme-context";
import { ConfigProvider } from "@/contexts/config-context";
import { GlobalRefreshProvider } from "@/contexts/global-refresh-context";
import { ServerSelectionProvider } from "@/contexts/server-selection-context";
import { ConfigurationProvider } from "@/contexts/configuration-context";
import { AvailableBackupsModalProvider } from "@/components/ui/available-backups-modal";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionInitializer } from "@/components/session-initializer";
import { GlobalSessionErrorHandler } from "@/components/global-session-error-handler";
import { ConditionalLayout } from "@/components/conditional-layout";
import { ClientLocaleProvider } from "@/contexts/locale-context";
import { IntlayerProviderClient } from "./intlayer-provider-client";
import { getTextDirection } from "@/lib/rtl-utils";

const SUPPORTED_LOCALES = ["en", "de", "fr", "es", "pt-BR"] as const;
const DEFAULT_LOCALE = "en";
const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Normalizes a locale string to the canonical format.
 * Accepts both "pt-br" and "pt-BR" and normalizes to "pt-BR".
 */
function normalizeLocale(locale: string): SupportedLocale | null {
  const normalized = locale.toLowerCase() === "pt-br" ? "pt-BR" : locale;
  if (SUPPORTED_LOCALES.includes(normalized as SupportedLocale)) {
    return normalized as SupportedLocale;
  }
  return null;
}

/**
 * Gets the locale from server-side sources (cookies, headers, or default).
 * Used for setting HTML lang attribute in root layout.
 * Silently falls back to default locale during static generation.
 */
async function getServerLocale(): Promise<SupportedLocale> {
  try {
    // 1. Check cookie for persisted locale preference
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
    if (cookieLocale) {
      const normalized = normalizeLocale(cookieLocale);
      if (normalized) {
        return normalized;
      }
    }

    // 2. Check pathname header (set by proxy/middleware) to extract locale
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "";
    const pathLocaleMatch = pathname.match(/^\/([^/]+)/);
    if (pathLocaleMatch) {
      const pathLocale = pathLocaleMatch[1];
      const normalized = normalizeLocale(pathLocale);
      if (normalized) {
        return normalized;
      }
    }

    // 3. Check Accept-Language header
    const acceptLanguage = headersList.get("accept-language");
    if (acceptLanguage) {
      const languages = acceptLanguage
        .split(",")
        .map((lang) => {
          const [code, q = "q=1"] = lang.trim().split(";");
          const quality = parseFloat(q.replace("q=", "")) || 1;
          return { code: code.toLowerCase().split("-")[0], quality };
        })
        .sort((a, b) => b.quality - a.quality);

      for (const { code } of languages) {
        let mappedLocale: SupportedLocale | null = null;
        if (code === "en") mappedLocale = "en";
        else if (code === "de") mappedLocale = "de";
        else if (code === "fr") mappedLocale = "fr";
        else if (code === "es") mappedLocale = "es";
        else if (code === "pt") mappedLocale = "pt-BR";

        if (mappedLocale && SUPPORTED_LOCALES.includes(mappedLocale)) {
          return mappedLocale;
        }
      }
    }
  } catch (error) {
    // If cookies/headers are not available (e.g., during static generation),
    // silently fall back to default locale. This is expected behavior.
    // The error is typically "Dynamic server usage" during static generation.
  }

  // 4. Fallback to default locale
  return DEFAULT_LOCALE;
}

/**
 * Maps locale code to HTML lang attribute value.
 * pt-BR -> pt-BR, others use the same code.
 */
function getHtmlLang(locale: SupportedLocale): string {
  return locale; // pt-BR is already correct, others are fine as-is
}

const geistSans = localFont({
  src: [
    {
      path: '../../public/fonts/Geist-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Geist-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Geist-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Geist-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-geist-sans',
});

const geistMono = localFont({
  src: [
    {
      path: '../../public/fonts/GeistMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GeistMono-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GeistMono-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GeistMono-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-geist-mono',
});

// Dynamic title based on environment
const getTitle = () => {
  const baseTitle = "duplistatus";
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    const version = process.env.npm_package_version || "v?.?.?";
    return `${baseTitle} (dev v${version})`;
  }

  return baseTitle;
};

// Generate metadata - can be made async if needed for locale-specific descriptions
export const metadata: Metadata = {
  title: getTitle(),
  description: "Monitor the execution and metrics of your Duplicatibackups.",
  icons: {
    icon: "/favicon.ico",
  },
  // Note: For locale-specific metadata, consider using generateMetadata() function
  // in individual page components or [locale]/layout.tsx
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get locale for HTML lang and dir attributes (server-side)
  const locale = await getServerLocale();
  const htmlLang = getHtmlLang(locale);
  const direction = getTextDirection(locale);

  return (
    <html lang={htmlLang} dir={direction} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Initial theme load before React hydration
                  // Note: User-specific themes are handled by React after mount
                  // This script provides a fallback for initial page load
                  // Default to dark theme for headless browsers and SSR
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    // Default to dark: if theme is 'dark', or no theme preference exists
                    // (including headless browsers where system preference may not be available)
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  console.error('Error applying initial theme:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <IntlayerProviderClient>
          <CustomThemeProvider>
            <ClientLocaleProvider>
            <ConfigProvider>
              <ConfigurationProvider>
                <GlobalRefreshProvider>
                  <ServerSelectionProvider>
                    <AvailableBackupsModalProvider>
                      <TooltipProvider delayDuration={300}>
                        <ToastProvider>
                        <SessionInitializer />
                        <GlobalSessionErrorHandler />
                        <ConditionalLayout>{children}</ConditionalLayout>
                        <Toaster />
                      </ToastProvider>
                      </TooltipProvider>
                    </AvailableBackupsModalProvider>
                  </ServerSelectionProvider>
                </GlobalRefreshProvider>
              </ConfigurationProvider>
            </ConfigProvider>
            </ClientLocaleProvider>
          </CustomThemeProvider>
        </IntlayerProviderClient>
      </body>
    </html>
  );
}
