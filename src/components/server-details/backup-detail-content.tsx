"use client";

import { useIntlayer } from 'react-intlayer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Server, Backup, BackupStatus } from "@/lib/types";
import { formatBytes } from "@/lib/utils";
import { formatDateTime } from "@/lib/date-format";
import { formatInteger } from "@/lib/number-format";
import { getStatusColor } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface BackupDetailContentProps {
  server: Server | null;
  backup?: Backup | null;
  backupId: string;
  locale: string;
  error?: boolean;
}

const MAX_MESSAGES_DISPLAY = 20;

const parseJsonArray = (jsonString: string | null): string[] => {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function BackupDetailContent({
  server,
  backup,
  backupId,
  locale,
  error = false,
}: BackupDetailContentProps) {
  const content = useIntlayer('backup-detail-content');

  // Process data in the component (matching server detail page pattern)
  if (error || !server || !backup) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{content.databaseError.value}</AlertTitle>
          <AlertDescription>
            {content.unableToLoadBackupData.value}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Parse JSON arrays
  const messages = parseJsonArray(backup.messages_array || null);
  const warnings = parseJsonArray(backup.warnings_array || null);
  const errors = parseJsonArray(backup.errors_array || null);
  const availableBackups = (backup as { available_backups?: string[] }).available_backups || [];

  // Create safe backup object
  const safeBackup = {
    messages: backup.messages ?? 0,
    warnings: backup.warnings ?? 0,
    errors: backup.errors ?? 0,
    name: backup.name ?? "Unknown",
    date: backup.date ? new Date(backup.date).toISOString() : new Date().toISOString(),
    status: (backup.status ?? "Unknown") as BackupStatus,
  };

  const totalMessages = messages.length;
  const showAllMessages = totalMessages <= MAX_MESSAGES_DISPLAY;
  const displayedMessages = showAllMessages ? messages : messages.slice(0, MAX_MESSAGES_DISPLAY);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{content.backupDetails.value}</h1>
        <p className="text-muted-foreground">
          {server.alias || server.name} - {safeBackup.name}
        </p>
      </div>

      {/* Backup Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>{content.backupInformation.value}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">{content.id.value}</div>
              <div className="font-mono text-sm">{backupId}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{content.backupDate.value}</div>
              <div>{formatDateTime(safeBackup.date, locale)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{content.when.value}</div>
              <div>{formatDateTime(safeBackup.date, locale)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge className={getStatusColor(safeBackup.status)}>
                {safeBackup.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>{content.backupStatistics.value}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">{content.fileCount.value}</div>
              <div className="text-lg font-semibold">
                {backup.fileCount !== null && backup.fileCount !== undefined
                  ? formatInteger(backup.fileCount, locale)
                  : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{content.fileSize.value}</div>
              <div className="text-lg font-semibold">
                {backup.fileSize !== null && backup.fileSize !== undefined
                  ? formatBytes(backup.fileSize)
                  : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{content.uploadedSize.value}</div>
              <div className="text-lg font-semibold">
                {backup.uploadedSize !== null && backup.uploadedSize !== undefined
                  ? formatBytes(backup.uploadedSize)
                  : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{content.duration.value}</div>
              <div className="text-lg font-semibold">
                {backup.duration || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{content.storageSize.value}</div>
              <div className="text-lg font-semibold">
                {backup.knownFileSize !== null && backup.knownFileSize !== undefined
                  ? formatBytes(backup.knownFileSize)
                  : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{content.warningsLabel.value}</div>
              <div className="text-lg font-semibold">{safeBackup.warnings}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{content.errorsLabel.value}</div>
              <div className="text-lg font-semibold">{safeBackup.errors}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>{content.logSummary.value}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages Section */}
          {messages.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{content.messagesTitle.value}</h3>
                <div className="text-sm text-muted-foreground">
                  {showAllMessages
                    ? content.showingAllMessages.value.replace('{count}', totalMessages.toString())
                    : content.showingOnlyFirst.value
                        .replace('{count}', MAX_MESSAGES_DISPLAY.toString())
                        .replace('{total}', totalMessages.toString())}
                </div>
              </div>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <div className="space-y-1">
                  {displayedMessages.map((message, index) => (
                    <div key={index} className="text-sm font-mono">
                      {message}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Warnings Section */}
          {warnings.length > 0 && (
            <div>
              <Separator className="my-4" />
              <h3 className="font-semibold mb-2 text-yellow-600">{content.warnings.value}</h3>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <div className="space-y-1">
                  {warnings.map((warning, index) => (
                    <div key={index} className="text-sm font-mono text-yellow-700 dark:text-yellow-400">
                      {warning}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Errors Section */}
          {errors.length > 0 && (
            <div>
              <Separator className="my-4" />
              <h3 className="font-semibold mb-2 text-red-600">{content.errors.value}</h3>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <div key={index} className="text-sm font-mono text-red-700 dark:text-red-400">
                      {error}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Info about message limits */}
          {!showAllMessages && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Message Limit</AlertTitle>
              <AlertDescription>
                <div className="space-y-2">
                  <p>{content.collectBackupLogsTooltip.value}</p>
                  <p>{content.duplicatiServerOptions.value}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Available Versions Card */}
      {availableBackups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{content.availableVersionsAtTime.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableBackups.map((version, index) => (
                <div key={index} className="text-sm font-mono">
                  {formatDateTime(version, locale)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
