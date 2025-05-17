"use client";

import { Settings } from "lucide-react";
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
        <Button variant="outline" size="icon" className="mr-2">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Open configuration menu</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Configuration</h4>
            <p className="text-sm text-muted-foreground">
              Customize your backup and display settings.
            </p>
          </div>
          <Separator />
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="backup-retention">Backup Retention Period</Label>
              <Select
                value={backupRetentionPeriod}
                onValueChange={(value: any) => setBackupRetentionPeriod(value)}
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full mt-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Old Backups Now"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {backupRetentionPeriod === 'Delete all data' 
                        ? "This action will permanently delete ALL backup data and machine records. This cannot be undone and will completely clear your database."
                        : `This action will permanently delete all backups older than ${backupRetentionPeriod}. This action cannot be undone. This will permanently delete your backup data and remove it from our servers.`
                      }
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteBackups}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, delete old backups
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 