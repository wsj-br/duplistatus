import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { CustomThemeProvider } from '@/contexts/theme-context';
import { ConfigProvider } from '@/contexts/config-context';
import { GlobalRefreshProvider } from '@/contexts/global-refresh-context';
import { ServerSelectionProvider } from '@/contexts/server-selection-context';
import { ConfigurationProvider } from '@/contexts/configuration-context';
import { AvailableBackupsModalProvider } from '@/components/ui/available-backups-modal';
import { AppHeader } from '@/components/app-header';
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GithubLink } from '@/components/github-link';
import AppVersion from '@/components/app-version';

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
            <GlobalRefreshProvider>
              <ServerSelectionProvider>
                <ConfigurationProvider>
                  <AvailableBackupsModalProvider>
                    <TooltipProvider delayDuration={300}>
                      <ToastProvider>
                      <div className="relative flex min-h-screen flex-col">
                        <AppHeader />
                        <main className="flex-1 w-[95%] mx-auto pt-1 pb-8">{children}</main>
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex items-center gap-6">
                            <AppVersion />
                            <GithubLink />
                          </div>
                          <span className="text-tiny text-muted-foreground text-center mb-4">
                             Product names and icons belong to their respective owners and are used for identification purposes only.
                          </span>
                        </div>
                      </div>
                      <Toaster />
                    </ToastProvider>
                    </TooltipProvider>
                  </AvailableBackupsModalProvider>
                </ConfigurationProvider>
              </ServerSelectionProvider>
            </GlobalRefreshProvider>
          </ConfigProvider>
        </CustomThemeProvider>
      </body>
    </html>
  );
}
