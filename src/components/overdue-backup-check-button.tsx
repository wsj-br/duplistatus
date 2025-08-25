"use client";

import { useState } from 'react';
import { RefreshCcwDot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { usePathname } from 'next/navigation';
import { useGlobalRefresh } from "@/contexts/global-refresh-context";

export function OverdueBackupCheckButton() {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const pathname = usePathname();
  const { refreshDashboard, refreshDetail } = useGlobalRefresh();

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
      
      // Show success toast
      toast({
        title: "Overdue Backup Check Complete",
        description: `Checked ${checkedBackups} backups, found ${overdueBackupsFound} overdue backups, sent ${notificationsSent} notifications.`,
        duration: 3000,
      });

      // Refresh the current page data using global refresh
      if (pathname === "/" || pathname === "/dashboard-auto") {
        // If on dashboard pages, refresh dashboard data
        await refreshDashboard();
      } else if (pathname.startsWith('/detail/') && !pathname.includes('/backup/')) {
        // If on detail pages, refresh detail data
        const match = pathname.match(/^\/detail\/([^\/]+)$/);
        if (match) {
          await refreshDetail(match[1]);
        }
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
      title="Check overdue backups now"
    >
      {isChecking ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCcwDot className="h-4 w-4" />
      )}
    </Button>
  );
} 