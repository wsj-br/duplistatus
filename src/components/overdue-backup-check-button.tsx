"use client";

import { useState, useEffect } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import type { NotificationConfig } from '@/lib/types';

export function OverdueBackupCheckButton() {
  const [isChecking, setIsChecking] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Function to check backup configuration
  const checkBackupConfiguration = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/configuration');
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      
      const config: NotificationConfig = await response.json();
      
      // Check if there's at least one backup with overdueBackupCheckEnabled: true
      const hasEnabledBackups = Object.values(config.backupSettings || {}).some(
        backupConfig => backupConfig.overdueBackupCheckEnabled
      );
      
      setShouldShow(hasEnabledBackups);
    } catch (error) {
      console.error('Error checking backup configuration:', error instanceof Error ? error.message : String(error));
      setShouldShow(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check configuration on mount
  useEffect(() => {
    checkBackupConfiguration();
  }, []);

  // Recheck configuration when pathname changes (navigation)
  useEffect(() => {
    checkBackupConfiguration();
  }, [pathname]);

  // Listen for configuration save events
  useEffect(() => {
    const handleConfigurationSaved = () => {
      checkBackupConfiguration();
    };

    // Listen for custom event when configuration is saved
    window.addEventListener('configuration-saved', handleConfigurationSaved);

    // Also listen for storage events in case configuration is saved in another tab
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'notifications' || event.key === 'backup_settings') {
        checkBackupConfiguration();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('configuration-saved', handleConfigurationSaved);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleCheckOverdueBackups = async () => {
    try {
      setIsChecking(true);

      // Run the overdue backup check
      const response = await fetch('/api/notifications/check-overdue', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to run overdue backup check');
      }

      const result = await response.json();
      
      // Check if we're already on the dashboard page
      if (pathname === "/") {
        // If already on dashboard, show toast directly and refresh the page
        toast({
          title: "Overdue Backup Check Complete",
          description: `Checked ${result.statistics.checkedBackups} backups, found ${result.statistics.overdueBackupsFound} overdue backups, sent ${result.statistics.notificationsSent} notifications.`,
          duration: 10000,
        });
        router.refresh();
      } else {
        // If on another page, store toast data and redirect to dashboard
        const toastData = {
          title: "Overdue Backup Check Complete",
          description: `Checked ${result.statistics.checkedBackups} backups, found ${result.statistics.overdueBackupsFound} overdue backups, sent ${result.statistics.notificationsSent} notifications.`,
          variant: "default" as const,
          duration: 10000,
        };
        localStorage.setItem("overdue-backup-check-toast", JSON.stringify(toastData));
        router.push("/");
      }
    } catch (error) {
      console.error('Error running overdue backup check:', error instanceof Error ? error.message : String(error));
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to run overdue backup check",
        variant: "destructive",
        duration: 10000,
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Don't render anything while loading or if no backups are configured
  if (isLoading || !shouldShow) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleCheckOverdueBackups}
      disabled={isChecking}
      title="Check Overdue Backups"
    >
      {isChecking ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
    </Button>
  );
} 