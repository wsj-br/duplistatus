import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { CustomThemeProvider } from '@/contexts/theme-context';
import { ConfigProvider } from '@/contexts/config-context';
import { GlobalRefreshProvider } from '@/contexts/global-refresh-context';
import { AppHeader } from '@/components/app-header';
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/use-toast";
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

export const metadata: Metadata = {
  title: 'duplistatus',
  description: 'Monitor the status and metrics of your Duplicati backups.',
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
              <ToastProvider>
                <div className="relative flex min-h-screen flex-col">
                  <AppHeader />
                  <main className="flex-1 w-[90%] max-w-screen-2xl mx-auto py-8">{children}</main>
                  <div className="flex items-center justify-center gap-4">
                    <AppVersion />
                    <GithubLink />
                  </div>
                </div>
                <Toaster />
              </ToastProvider>
            </GlobalRefreshProvider>
          </ConfigProvider>
        </CustomThemeProvider>
      </body>
    </html>
  );
}
