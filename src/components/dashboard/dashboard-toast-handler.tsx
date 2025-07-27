"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface StoredToastData {
  title: string;
  description: string;
  variant?: "default" | "destructive";
  duration?: number;
}

export function DashboardToastHandler() {
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored toast data in localStorage
    const storedToastData = localStorage.getItem("backup-collection-toast");
    const storedMissedBackupToastData = localStorage.getItem("missed-backup-check-toast");
    
    if (storedToastData) {
      try {
        const toastData: StoredToastData = JSON.parse(storedToastData);
        
        // Show the toast with the stored data
        toast({
          title: toastData.title,
          description: toastData.description,
          variant: toastData.variant || "default",
          duration: toastData.duration || 10000, // 10 seconds
        });
        
        // Remove the stored toast data
        localStorage.removeItem("backup-collection-toast");
      } catch (error) {
        console.error("Error parsing stored toast data:", error instanceof Error ? error.message : String(error));
        // Clean up invalid data
        localStorage.removeItem("backup-collection-toast");
      }
    }

    if (storedMissedBackupToastData) {
      try {
        const toastData: StoredToastData = JSON.parse(storedMissedBackupToastData);
        
        // Show the toast with the stored data
        toast({
          title: toastData.title,
          description: toastData.description,
          variant: toastData.variant || "default",
          duration: toastData.duration || 10000, // 10 seconds
        });
        
        // Remove the stored toast data
        localStorage.removeItem("missed-backup-check-toast");
      } catch (error) {
        console.error("Error parsing stored missed backup toast data:", error instanceof Error ? error.message : String(error));
        // Clean up invalid data
        localStorage.removeItem("missed-backup-check-toast");
      }
    }
  }, [toast]);

  // This component doesn't render anything
  return null;
} 