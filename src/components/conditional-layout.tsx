'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { useIntlayer } from 'react-intlayer';
import { AppHeader } from '@/components/app-header';
import AppVersion from '@/components/app-version';
import { GithubLink } from '@/components/github-link';
import { PasswordChangeGuard } from '@/components/password-change-guard';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const content = useIntlayer('conditional-layout');
  const pathname = usePathname();
  const isLoginPage = /\/login$/.test(pathname ?? "");

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Suspense fallback={<div className="sticky top-0 z-50 w-full border-b border-x-[20px] border-solid border-b-border border-x-transparent bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16" />}>
        <AppHeader />
      </Suspense>
      <PasswordChangeGuard>
        <main className="flex-1 w-[95%] mx-auto pt-1 pb-8">{children}</main>
      </PasswordChangeGuard>
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-6">
          <AppVersion />
          <GithubLink />
        </div>
        <span className="text-tiny text-muted-foreground text-center mb-4">
          {content.footerDisclaimer.value}
        </span>
      </div>
    </div>
  );
}

