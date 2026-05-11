import { getServerById, getBackupLogs } from '@/lib/db-utils';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { MessageSquare, AlertTriangle, XCircle, Info } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { formatDateTime } from '@/lib/date-format';
import { formatBytes, formatInteger } from '@/lib/number-format';
import { BackButton } from '@/components/ui/back-button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { requireServerAuth } from "@/lib/auth-server";
import { getServerI18n, getServerLocalePreference } from "@/lib/i18n-server";
import type { TFunction } from "i18next";

interface BackupLogPageProps {
  params: Promise<{
    serverId: string;
    backupId: string;
  }>;
}

// Force dynamic rendering - this page uses dynamic APIs (cookies, headers) via requireServerAuth
export const dynamic = 'force-dynamic';

const cleanLogMessage = (message: string): string => {
  return message.replace(/\[.*?\]:/g, '');
};

const wrapTextAtLength = (text: string, maxLength: number = 150): string[] => {
  if (text.length <= maxLength) {
    return [text];
  }
  
  const lines: string[] = [];
  let currentLine = '';
  
  // Split by words to avoid breaking words
  const words = text.split(' ');
  
  for (const word of words) {
    // If adding this word would exceed the limit, start a new line
    if (currentLine.length + word.length + 1 > maxLength) {
      if (currentLine.length > 0) {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        // If a single word is longer than maxLength, break it
        lines.push(word.substring(0, maxLength));
        currentLine = word.substring(maxLength);
      }
    } else {
      currentLine += (currentLine.length > 0 ? ' ' : '') + word;
    }
  }
  
  if (currentLine.length > 0) {
    lines.push(currentLine.trim());
  }
  
  return lines;
};

const getLogSectionBorderClass = (variant: "messages" | "errors" | "warning") => {
  switch (variant) {
    case "errors": return "border-red-500";
    case "warning": return "border-yellow-500";
    default: return "";
  }
};

const getLogSectionTitleClass = (variant: "messages" | "errors" | "warning") => {
  switch (variant) {
    case "errors": return "text-red-600";
    case "warning": return "text-yellow-600";
    default: return "";
  }
};

const LogSection = ({ title, items, variant = "messages", expectedLines, t }: { 
  title: string; 
  items: string[]; 
  variant?: "messages" | "errors" | "warning";
  expectedLines: number;
  t: TFunction;
}) => {
  if (items.length === 0) return null;

  const isTruncated = items.length < expectedLines;

  return (
    <Card className={getLogSectionBorderClass(variant)}>
      <CardHeader>
        <CardTitle className={getLogSectionTitleClass(variant)}>
          {title}
        </CardTitle>
        <CardDescription>
          {isTruncated ? (
            <div className="text-sm font-normal text-muted-foreground flex items-center gap-2">
              {t("Showing only first {{count}} of {{total}} messages", {
                count: items.length,
                total: expectedLines,
              })}
              <Tooltip delayDuration={0}>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help ml-1" />
                </TooltipTrigger>
                <TooltipContent className="max-w-lg">
                <p className="mt-1">
                  {t(
                    "If the backup log was collected using the Collect backup logs feature, the number of messages is limited to 20 due to a hardcoded limit in the Duplicati Server when saving to the local database.",
                  )}
                </p>
                <p className="mt-2">
                  {t(
                    "If the backup log was received directly from the Duplicati server, ensure you are using the following options: send-http-log-level=Information and send-http-max-log-lines=0 in the Duplicati server configuration.",
                  )}
                </p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="text-sm font-normal text-muted-foreground">
              {t("Showing all messages ({{count}})", { count: expectedLines })}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className="bg-muted text-muted-foreground border rounded-md p-3 font-mono text-xs custom-scrollbar"
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            overflowX: 'hidden',
            width: '100%'
          }}
        >
          {items.map((item, index) => {
            const cleanedMessage = cleanLogMessage(item);
            const wrappedLines = wrapTextAtLength(cleanedMessage, 150);
            
            return (
              <div key={index} className="text-foreground leading-tight">
                {wrappedLines.map((line, lineIndex) => (
                  <div key={lineIndex}>
                    {line}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const parseJsonArray = (jsonString: string | null): string[] => {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return [];
  }
};

const AvailableBackupsTable = ({ availableBackups, currentBackupDate, t, locale }: { 
  availableBackups: string[] | null; 
  currentBackupDate: string;
  t: TFunction;
  locale: string;
}) => {
  if (!availableBackups || availableBackups.length === 0) {
    return <span className="text-sm text-muted-foreground"> </span>;
  }

  return (
    <div className="mt-2 w-fit ml-4">
      <Table className="w-auto text-xs">
        <TableHeader>
          <TableRow className="border-b">
            <TableCell className="font-medium text-blue-400 font-bold w-8 py-1 px-2 text-xs">{t("#")}</TableCell>
            <TableCell className="font-medium text-blue-400 font-bold py-1 px-2 text-xs">{t("Backup Date")}</TableCell>
            <TableCell className="font-medium text-blue-400 font-bold py-1 px-2 text-xs">{t("When")}</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* First row: Current backup date */}
          <TableRow className="border-b">
            <TableCell className="w-8 py-1 px-2 text-xs">1</TableCell>
            <TableCell className="py-1 px-2 text-xs">{formatDateTime(currentBackupDate, locale)}</TableCell>
            <TableCell className="py-1 px-2 text-xs">{formatRelativeTime(currentBackupDate)}</TableCell>
          </TableRow>
          {/* Additional available versions starting from #2 */}
          {availableBackups.map((timestamp, index) => (
            <TableRow key={index} className="border-b">
              <TableCell className="w-8 py-1 px-2 text-xs">{index + 2}</TableCell>
              <TableCell className="py-1 px-2 text-xs">{formatDateTime(timestamp, locale)}</TableCell>
              <TableCell className="py-1 px-2 text-xs">{formatRelativeTime(timestamp)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default async function BackupLogPage({ params }: BackupLogPageProps) {
  // Require authentication - redirects to login if not authenticated
  await requireServerAuth();
  
  const { serverId, backupId } = await params;

  const i18n = await getServerI18n();
  const t = i18n.t.bind(i18n);
  const locale = await getServerLocalePreference();
  
  // Add error handling for database operations
  let server;
  try {
    server = await getServerById(serverId);
  } catch (error) {
    console.error('Failed to fetch server data:', error instanceof Error ? error.message : String(error));
    // Return a more user-friendly error page
    return (
      <div className="w-[95%] mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-2xl font-bold text-red-600">{t("Database Error")}</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              {t(
                "Unable to load backup data. The database may be temporarily unavailable. Please try again later or contact your administrator.",
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!server) {
    notFound();
  }

  const backup = server.backups?.find(b => b.id === backupId);
  if (!backup) {
    notFound();
  }

  const backupLogs = await getBackupLogs(backupId);
  const MAX_LOG_LINES = 1000;
  
  const messages = parseJsonArray(backupLogs?.messages_array || null).slice(0, MAX_LOG_LINES);
  const warnings = parseJsonArray(backupLogs?.warnings_array || null).slice(0, MAX_LOG_LINES);
  const errors = parseJsonArray(backupLogs?.errors_array || null).slice(0, MAX_LOG_LINES);
  
  // Handle available_backups field - it should already be parsed as an array from db-utils
  const availableBackups = (backup as { available_backups?: string[] }).available_backups || [];

  // Ensure all required properties exist with fallbacks
  const safeBackup = {
    ...backup,
    messages: backup.messages ?? 0,
    warnings: backup.warnings ?? 0,
    errors: backup.errors ?? 0,
    name: backup.name ?? 'Unknown',
    date: backup.date ? new Date(backup.date).toISOString() : new Date().toISOString(),
    status: backup.status ?? 'Failed' as const
  };

  return (
    <div className="w-[95%] mx-auto py-6 space-y-6" data-screenshot-target="backup-detail">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-2xl font-bold">{t("Backup details:")}
            <span className="text-blue-600 font-normal"> {backup.name}</span>
            <span className="text-muted-foreground font-normal" title={server.alias ? server.name : undefined}> ({server.alias || server.name})</span>
        </h1>
      </div>

      <div className="space-y-6">
        {/* Backup Details Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle 
                  className="text-xl"
                  title={server.alias ? server.name : undefined}
                >
                  {server.alias || server.name}
                  {server.alias ? ` (${server.name})` : ''}
                  {server.note && (
                    <span className="text-muted-foreground font-normal text-lg ml-2">
                       -  {server.note}
                    </span>
                  )}
                </CardTitle>
              </div>
              <StatusBadge status={safeBackup.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <dt className="font-medium  mb-2">{t("Backup Information")} - {backup.name}</dt>
                  
                  <dd className="mx-4 flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">{t("Date:")}</span>
                      <span>{formatDateTime(safeBackup.date, locale)}</span>
                      <span className="text-sm text-muted-foreground">
                        ({formatRelativeTime(safeBackup.date)})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">{t("ID:")}</span>
                      <span>{backupId}</span>
                    </div>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium mb-2">{t("Backup Statistics")}</dt>
                  <dd className="mx-4 grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">{t("File Count:")}</span>
                      <span>{formatInteger(backup.fileCount ?? 0, locale)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">{t("File Size:")}</span>
                      <span>{formatBytes(backup.fileSize || 0, locale)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">{t("Uploaded Size:")}</span>
                      <span>{formatBytes(backup.uploadedSize || 0, locale)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">{t("Duration:")}</span>
                      <span>{backup.duration || '00:00:00'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">{t("Storage Size:")}</span>
                      <span>{formatBytes(backup.knownFileSize || 0, locale)}</span>
                    </div>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium mb-2">{t("Log Summary")}</dt>
                  <dd className="mx-4 flex items-center gap-6">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{t("Messages:")} {formatInteger(safeBackup.messages, locale)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{t("Warnings:")} {formatInteger(safeBackup.warnings, locale)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{t("Errors:")} {formatInteger(safeBackup.errors, locale)}</span>
                    </div>
                  </dd>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <dt className="font-medium mb-2">
                     {!availableBackups || availableBackups.length === 0 ? '' : t(
                       "Available versions at the time of the backup:",
                     )}
                </dt>
                <dd className="text-sm">
                  <AvailableBackupsTable availableBackups={availableBackups} currentBackupDate={safeBackup.date} t={t} locale={locale} />
                </dd>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Log Sections */}
        <TooltipProvider>
          <LogSection title={t("Errors")} items={errors} variant="errors" expectedLines={safeBackup.errors} t={t} />
          <LogSection title={t("Warnings")} items={warnings} variant="warning" expectedLines={safeBackup.warnings} t={t} />
          <LogSection title={t("Messages")} items={messages} variant="messages" expectedLines={safeBackup.messages} t={t} />
        </TooltipProvider>
      </div>
    </div>
  );
}
