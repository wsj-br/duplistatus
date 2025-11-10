import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { CustomThemeProvider } from '@/contexts/theme-context';
import { ConfigProvider } from '@/contexts/config-context';
import { GlobalRefreshProvider } from '@/contexts/global-refresh-context';
import { ServerSelectionProvider } from '@/contexts/server-selection-context';
import { ConfigurationProvider } from '@/contexts/configuration-context';
import { AvailableBackupsModalProvider } from '@/components/ui/available-backups-modal';
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionInitializer } from '@/components/session-initializer';
import { GlobalSessionErrorHandler } from '@/components/global-session-error-handler';
import { ConditionalLayout } from '@/components/conditional-layout';

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
  const baseTitle = 'duplistatus';
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // Get version from package.json
    const version = process.env.npm_package_version || 'v?.?.?';
    return `${baseTitle} (dev v${version})`;
  }
  
  return baseTitle;
};

export const metadata: Metadata = {
  title: getTitle(),
  description: 'Monitor the execution and metrics of your Duplicatibackups.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
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
        <CustomThemeProvider>
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
        </CustomThemeProvider>
      </body>
    </html>
  );
}
