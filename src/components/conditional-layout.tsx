'use client';

import { usePathname } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import AppVersion from '@/components/app-version';
import { GithubLink } from '@/components/github-link';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
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
  );
}

