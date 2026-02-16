'use client';

import { useIntlayer } from 'react-intlayer';
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
  const content = useIntlayer('key-changed-modal');
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <DialogTitle>{content.title.value}</DialogTitle>
          </div>
          <DialogDescription>
            {content.description.value}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
            <div className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
              <p className="font-semibold">{content.warningTitle.value}</p>
              <p>{content.reconfigurePrompt.value}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{content.smtpPasswords.value}</li>
                <li>{content.serverPasswords.value}</li>
              </ul>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              {content.explanation.value}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            {content.buttonUnderstand.value}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
