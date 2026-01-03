'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface KeyChangedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyChangedModal({ open, onOpenChange }: KeyChangedModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <DialogTitle>Master Key File Changed</DialogTitle>
          </div>
          <DialogDescription>
            The encryption key file (.duplistatus.key) has been changed or replaced.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
            <div className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
              <p className="font-semibold">All encrypted passwords have been cleared for security reasons.</p>
              <p>You will need to reconfigure the following:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>SMTP email passwords (in Email Settings)</li>
                <li>Duplicati server passwords (in Server Settings)</li>
              </ul>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              This typically happens when restoring from a backup or migrating to a new system. 
              The old encrypted passwords cannot be decrypted with the new key, so they have been cleared to prevent errors.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
