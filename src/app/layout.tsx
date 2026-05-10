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
import { I18nProvider } from "@/components/i18n-provider";
import { getTextDirection } from "ai-i18n-tools/runtime";
import {
  SOURCE_LOCALE,
  LOCALE_COOKIE_NAME,
  parseLocaleTag,
  resolveLocaleFromAcceptLanguage,
  type LocaleCode,
} from "@/lib/locales";

/**
 * Gets the locale from server-side sources (cookies, headers, or default).
 * Used for setting HTML lang attribute in root layout.
 * Silently falls back to default locale during static generation.
 */
async function getServerLocale(): Promise<LocaleCode> {
  try {
    // 1. Check cookie for persisted locale preference
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
    if (cookieLocale) {
      const parsed = parseLocaleTag(cookieLocale);
      if (parsed) return parsed;
    }

    // 2. Check Accept-Language header (canonical routes have no locale segment; cookie covers persisted choice)
    const headersList = await headers();
    const fromAccept = resolveLocaleFromAcceptLanguage(
      headersList.get("accept-language"),
    );
    if (fromAccept) return fromAccept;
  } catch (error) {
    // If cookies/headers are not available (e.g., during static generation),
    // silently fall back to default locale. This is expected behavior.
    // The error is typically "Dynamic server usage" during static generation.
  }

  // 3. Fallback to source locale
  return SOURCE_LOCALE;
}

/**
 * Maps locale code to HTML lang attribute value.
 */
function getHtmlLang(locale: LocaleCode): string {
  return locale;
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
  // in individual page components or generateMetadata() where needed
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
                  // Initial theme before React hydration — mirrors theme-context + user keys (theme:user-*)
                  function readThemePreference() {
                    var legacy = localStorage.getItem('theme');
                    if (legacy === 'light' || legacy === 'dark' || legacy === 'system') {
                      return legacy;
                    }
                    for (var i = 0; i < localStorage.length; i++) {
                      var key = localStorage.key(i);
                      if (key && key.indexOf('theme:') === 0) {
                        var v = localStorage.getItem(key);
                        if (v === 'light' || v === 'dark' || v === 'system') return v;
                      }
                    }
                    return null;
                  }
                  var pref = readThemePreference();
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var useDark = false;
                  if (pref === 'light') useDark = false;
                  else if (pref === 'dark') useDark = true;
                  else if (pref === 'system' || pref === null) useDark = prefersDark;
                  else useDark = true;
                  if (useDark) document.documentElement.classList.add('dark');
                  else document.documentElement.classList.remove('dark');
                } catch (e) {
                  console.error('Error applying initial theme:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <I18nProvider>
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
        </I18nProvider>
      </body>
    </html>
  );
}
