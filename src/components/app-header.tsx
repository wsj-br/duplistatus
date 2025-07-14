'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { ConfigMenu } from '@/components/config-menu';
import { DatabaseMaintenanceMenu } from '@/components/database-maintenance-menu';
import { BackupCollectMenu } from '@/components/backup-collect-menu';
import { usePathname } from 'next/navigation';

export function AppHeader() {
  const pathname = usePathname();
  const isDetailPage = pathname.startsWith('/detail/');

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
        
        {isDetailPage && (
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors ml-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">return to Dashboard</span>
          </Link>
        )}
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <BackupCollectMenu />
          <DatabaseMaintenanceMenu />
          <ConfigMenu />
          <ThemeToggleButton />
        </div>
      </div>
    </div>
  );
}
