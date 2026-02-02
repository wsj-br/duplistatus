import { getServerById } from '@/lib/db-utils';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { MessageSquare, AlertTriangle, XCircle, Info } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { formatBytes } from '@/lib/number-format';
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
import { useIntlayer } from 'next-intlayer/server';

interface BackupLogPageProps {
  params: Promise<{
    locale: string;
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

const LogSection = ({ title, items, variant = "messages", expectedLines, content }: { 
  title: string; 
  items: string[]; 
  variant?: "messages" | "errors" | "warning";
  expectedLines: number;
  content: any;
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
              {content.showingOnlyFirst.value
                .replace('{count}', items.length.toString())
                .replace('{total}', expectedLines.toString())}
              <Tooltip delayDuration={0}>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help ml-1" />
                </TooltipTrigger>
                <TooltipContent className="max-w-lg">
                <p className="mt-1">
                  {content.collectBackupLogsTooltip.value}
                </p>
                <p className="mt-2">
                  {content.duplicatiServerOptions.value}
                </p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="text-sm font-normal text-muted-foreground">
              {content.showingAllMessages.value.replace('{count}', expectedLines.toString())}
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

const AvailableBackupsTable = ({ availableBackups, currentBackupDate, content }: { 
  availableBackups: string[] | null; 
  currentBackupDate: string;
  content: any;
}) => {
  if (!availableBackups || availableBackups.length === 0) {
    return <span className="text-sm text-muted-foreground"> </span>;
  }

  return (
    <div className="mt-2 w-fit ml-4">
      <Table className="w-auto text-xs">
        <TableHeader>
          <TableRow className="border-b">
            <TableCell className="font-medium text-blue-400 font-bold w-8 py-1 px-2 text-xs">{content.tableNumber.value}</TableCell>
            <TableCell className="font-medium text-blue-400 font-bold py-1 px-2 text-xs">{content.backupDate.value}</TableCell>
            <TableCell className="font-medium text-blue-400 font-bold py-1 px-2 text-xs">{content.when.value}</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* First row: Current backup date */}
          <TableRow className="border-b">
            <TableCell className="w-8 py-1 px-2 text-xs">1</TableCell>
            <TableCell className="py-1 px-2 text-xs">{new Date(currentBackupDate).toLocaleString()}</TableCell>
            <TableCell className="py-1 px-2 text-xs">{formatRelativeTime(currentBackupDate)}</TableCell>
          </TableRow>
          {/* Additional available versions starting from #2 */}
          {availableBackups.map((timestamp, index) => (
            <TableRow key={index} className="border-b">
              <TableCell className="w-8 py-1 px-2 text-xs">{index + 2}</TableCell>
              <TableCell className="py-1 px-2 text-xs">{new Date(timestamp).toLocaleString()}</TableCell>
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
  
  const { locale, serverId, backupId } = await params;
  
  // Get translations
  const content = useIntlayer('backup-detail-page', locale);
  
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
          <h1 className="text-2xl font-bold text-red-600">{content.databaseError.value}</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              {content.unableToLoadBackupData.value}
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

  const messages = parseJsonArray(backup.messages_array || null);
  const warnings = parseJsonArray(backup.warnings_array || null);
  const errors = parseJsonArray(backup.errors_array || null);
  
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
        <h1 className="text-2xl font-bold">{content.backupDetails.value}
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
                  <dt className="font-medium  mb-2">{content.backupInformation.value} - {backup.name}</dt>
                  
                  <dd className="mx-4 flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">{content.date.value}</span>
                      <span>{new Date(safeBackup.date).toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">
                        ({formatRelativeTime(safeBackup.date)})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">{content.id.value}</span>
                      <span>{backupId}</span>
                    </div>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium mb-2">{content.backupStatistics.value}</dt>
                  <dd className="mx-4 grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">{content.fileCount.value}</span>
                      <span>{backup.fileCount?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">{content.fileSize.value}</span>
                      <span>{formatBytes(backup.fileSize || 0, locale)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">{content.uploadedSize.value}</span>
                      <span>{formatBytes(backup.uploadedSize || 0, locale)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">{content.duration.value}</span>
                      <span>{backup.duration || '00:00:00'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">{content.storageSize.value}</span>
                      <span>{formatBytes(backup.knownFileSize || 0, locale)}</span>
                    </div>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium mb-2">{content.logSummary.value}</dt>
                  <dd className="mx-4 flex items-center gap-6">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{content.messages.value} {safeBackup.messages.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{content.warnings.value} {safeBackup.warnings.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{content.errors.value} {safeBackup.errors.toLocaleString()}</span>
                    </div>
                  </dd>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <dt className="font-medium mb-2">
                     {!availableBackups || availableBackups.length === 0 ? '' : content.availableVersionsAtTime.value}
                </dt>
                <dd className="text-sm">
                  <AvailableBackupsTable availableBackups={availableBackups} currentBackupDate={safeBackup.date} content={content} />
                </dd>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Log Sections */}
        <TooltipProvider>
          <LogSection title={content.errorsTitle.value} items={errors} variant="errors" expectedLines={safeBackup.errors} content={content} />
          <LogSection title={content.warningsTitle.value} items={warnings} variant="warning" expectedLines={safeBackup.warnings} content={content} />
          <LogSection title={content.messagesTitle.value} items={messages} variant="messages" expectedLines={safeBackup.messages} content={content} />
        </TooltipProvider>
      </div>
    </div>
  );
}
