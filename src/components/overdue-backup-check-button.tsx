"use client";

import { useState } from 'react';
import { RefreshCcwDot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import { useGlobalRefresh } from "@/contexts/global-refresh-context";

export function OverdueBackupCheckButton() {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const { refreshDashboard } = useGlobalRefresh();

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
      
      // Ensure result has the expected structure
      if (!result.statistics) {
        throw new Error('Invalid response format from overdue backup check');
      }
      
      const { checkedBackups, overdueBackupsFound, notificationsSent } = result.statistics;
      
      // Check if we're already on the dashboard page
      if (pathname === "/") {
        // If already on dashboard, show toast directly and refresh the dashboard data
        toast({
          title: "Overdue Backup Check Complete",
          description: `Checked ${checkedBackups} backups, found ${overdueBackupsFound} overdue backups, sent ${notificationsSent} notifications.`,
          duration: 3000,
        });
        await refreshDashboard();
      } else {
        // If on another page, store toast data and redirect to dashboard
        const toastData = {
          title: "Overdue Backup Check Complete",
          description: `Checked ${checkedBackups} backups, found ${overdueBackupsFound} overdue backups, sent ${notificationsSent} notifications.`,
          variant: "default" as const,
          duration: 3000,
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
        duration: 3000,
      });
    } finally {
      setIsChecking(false);
    }
  };

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
        <RefreshCcwDot className="h-4 w-4" />
      )}
    </Button>
  );
} 