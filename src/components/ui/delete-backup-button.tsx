"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { isDevelopmentMode } from "@/lib/utils";

interface DeleteBackupButtonProps {
  backupId: string;
  backupName: string;
  backupDate: string;
  onDelete?: () => void;
}

export function DeleteBackupButton({ 
  backupId, 
  backupName, 
  backupDate, 
  onDelete 
}: DeleteBackupButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const { toast } = useToast();

  // Check development mode on component mount
  React.useEffect(() => {
    const devMode = isDevelopmentMode();
    setIsDevMode(devMode);
  }, []);

  // Only show in development mode
  if (!isDevMode) {
    return null;
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/backups/${backupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete backup');
      }

      const result = await response.json();
      
      toast({
        title: "Backup deleted",
        description: result.message,
        duration: 2000,
      });

      // Call the callback to refresh the data
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete backup",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    // Prevent the row click event from firing
    e.stopPropagation();
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            disabled={isDeleting}
            onClick={handleButtonClick}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete backup</span>
          </Button>
        </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Backup</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the backup &ldquo;{backupName}&rdquo; from {new Date(backupDate).toLocaleString()}?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}
