"use client";

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export function ReadOnlyNotice() {
  return (
    <Alert className="mb-4">
      <Info className="h-4 w-4" />
      <AlertDescription>
        You are viewing this page in read-only mode. Only administrators can modify these settings.
      </AlertDescription>
    </Alert>
  );
}

