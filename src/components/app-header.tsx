'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Settings } from 'lucide-react';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { DisplayMenu } from '@/components/display-menu';
import { DatabaseMaintenanceMenu } from '@/components/database-maintenance-menu';
import { BackupCollectMenu } from '@/components/backup-collect-menu';
import { MissedBackupCheckButton } from '@/components/missed-backup-check-button';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  const pathname = usePathname();
  const isDashboardPage = pathname === '/';

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
        
        {!isDashboardPage && (
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors ml-4"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-sm font-medium">Return to Dashboard</span>
          </Link>
        )}
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <MissedBackupCheckButton />
          <BackupCollectMenu />
          <DatabaseMaintenanceMenu />
          <DisplayMenu />
          <Link href="/settings">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <ThemeToggleButton />
        </div>
      </div>
    </div>
  );
}
