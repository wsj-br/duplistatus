import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { ConfigMenu } from '@/components/config-menu';
import { DatabaseMaintenanceMenu } from '@/components/database-maintenance-menu';

export function AppHeader() {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-x-[20px] border-solid border-b-border border-x-transparent bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center py-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <div className="p-1">
            <Image
              src="/images/duplistatus_logo.png"
              alt="duplistatus Logo"
              width={64}
              height={64}
              className="h-14 w-14"
            />
          </div>
          <span className="text-3xl text-blue-600 sm:inline-block">
            duplistatus
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <DatabaseMaintenanceMenu />
          <ConfigMenu />
          <ThemeToggleButton />
        </div>
      </div>
    </div>
  );
}
