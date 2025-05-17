"use client";

import { Settings, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useConfig } from "@/contexts/config-context";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { usePathname, useRouter } from "next/navigation";

export function ConfigMenu() {
  const {
    backupRetentionPeriod,
    setBackupRetentionPeriod,
    tablePageSize,
    setTablePageSize,
    chartTimeRange,
    setChartTimeRange,
    chartMetricSelection,
    setChartMetricSelection,
    deleteOldBackups,
  } = useConfig();
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  const handleDeleteBackups = async () => {
    try {
      setIsDeleting(true);
      await deleteOldBackups();
      
      // Show success toast
      toast({
        title: "Backups deleted",
        description: "Old backups have been successfully deleted.",
        variant: "default",
        duration: 5000,
      });
      
      // Force a complete refresh of the page data
      router.refresh();
      
      // Wait a short delay to ensure the refresh completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Location reload as a fallback if router.refresh() doesn't fully update
      if (pathname.startsWith('/detail/')) {
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete old backups. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Settings</h4>
            <p className="text-sm text-muted-foreground">
              Configure your DupliDash preferences
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="backup-retention">Backup Retention Period</Label>
              <Select
                value={backupRetentionPeriod}
                onValueChange={(value) => setBackupRetentionPeriod(value as any)}
              >
                <SelectTrigger id="backup-retention">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Delete all data">Delete all data</SelectItem>
                  <SelectItem value="6 months">6 months</SelectItem>
                  <SelectItem value="1 year">1 year</SelectItem>
                  <SelectItem value="2 years">2 years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="table-page-size">Table Page Size</Label>
              <Select
                value={tablePageSize.toString()}
                onValueChange={(value) => setTablePageSize(parseInt(value) as any)}
              >
                <SelectTrigger id="table-page-size">
                  <SelectValue placeholder="Select page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 rows</SelectItem>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="15">15 rows</SelectItem>
                  <SelectItem value="20">20 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="chart-time-range">Chart Time Range</Label>
              <Select
                value={chartTimeRange}
                onValueChange={(value: any) => setChartTimeRange(value)}
              >
                <SelectTrigger id="chart-time-range">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2 weeks">Last 2 weeks</SelectItem>
                  <SelectItem value="1 month">Last month</SelectItem>
                  <SelectItem value="3 months">Last quarter</SelectItem>
                  <SelectItem value="6 months">Last semester</SelectItem>
                  <SelectItem value="1 year">Last year</SelectItem>
                  <SelectItem value="2 years">Last 2 years</SelectItem>
                  <SelectItem value="All data">All available data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="chart-metric">Default Chart Metric</Label>
              <Select
                value={chartMetricSelection}
                onValueChange={(value: any) => setChartMetricSelection(value)}
              >
                <SelectTrigger id="chart-metric">
                  <SelectValue placeholder="Select default metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uploadedSize">Uploaded Size</SelectItem>
                  <SelectItem value="duration">Duration (Minutes)</SelectItem>
                  <SelectItem value="fileCount">File Count</SelectItem>
                  <SelectItem value="fileSize">Total File Size</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label>Cleanup Old Backups</Label>
              <Button 
                variant="destructive" 
                onClick={handleDeleteBackups}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Old Backups
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                This will delete all backups older than the selected retention period.
              </p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 