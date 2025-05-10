import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CustomThemeProvider } from '@/contexts/theme-context';
import { AppHeader } from '@/components/app-header';
import { Toaster } from "@/components/ui/toaster";


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Backup Insights',
  description: 'Monitor your backup statuses and metrics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CustomThemeProvider>
          <div className="relative flex min-h-screen flex-col">
            <AppHeader />
            <main className="flex-1 w-[90%] max-w-screen-2xl mx-auto py-8">{children}</main>
          </div>
          <Toaster />
        </CustomThemeProvider>
      </body>
    </html>
  );
}
