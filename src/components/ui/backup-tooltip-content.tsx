"use client";

import { useIntlayer } from 'react-intlayer';
import { useRouter } from "next/navigation";
import { useLocale } from "@/contexts/locale-context";
import type { BackupStatus, NotificationEvent } from "@/lib/types";
import { formatRelativeTime, getStatusColor } from "@/lib/utils";
import { formatDateTime } from "@/lib/date-format";
import { formatInteger, formatBytes } from "@/lib/number-format";
import { AlertTriangle, Settings, MessageSquareMore, MessageSquareOff } from "lucide-react";
import { ServerConfigurationButton } from "@/components/ui/server-configuration-button";

// Helper function to get notification icon
function getNotificationIcon(notificationEvent: NotificationEvent | undefined) {
  if (!notificationEvent) return null;
  
  switch (notificationEvent) {
    case 'errors':
      return <MessageSquareMore className="h-4 w-4 text-red-400" />;
    case 'warnings':
      return <MessageSquareMore className="h-4 w-4 text-yellow-400" />;
    case 'all':
      return <MessageSquareMore className="h-4 w-4 text-blue-400" />;
    case 'off':
      return <MessageSquareOff className="h-4 w-4 text-gray-400" />;
    default:
      return null;
  }
}

interface BackupTooltipContentProps {
  serverAlias?: string;
  serverName: string;
  serverNote?: string;
  serverUrl: string;
  backupName: string;
  lastBackupDate: string;
  lastBackupStatus: BackupStatus | 'N/A';
  lastBackupDuration: string;
  lastBackupListCount: number | null;
  fileCount: number;
  fileSize: number;
  storageSize: number;
  uploadedSize: number;
  isOverdue: boolean;
  expectedBackupDate: string;
  notificationEvent?: NotificationEvent;
}

export function BackupTooltipContent({
  serverAlias,
  serverName,
  serverNote,
  serverUrl,
  backupName,
  lastBackupDate,
  lastBackupStatus,
  lastBackupDuration,
  lastBackupListCount,
  fileCount,
  fileSize,
  storageSize,
  uploadedSize,
  isOverdue,
  expectedBackupDate,
  notificationEvent,
}: BackupTooltipContentProps) {
  const content = useIntlayer('backup-tooltip-content');
  const common = useIntlayer('common');
  const statusContent = useIntlayer('status-badge');
  const router = useRouter();
  const locale = useLocale();

  // Helper function to get translated status label
  const getStatusLabel = (status: BackupStatus | 'N/A'): string => {
    switch (status) {
      case 'Success':
        return statusContent.success.value;
      case 'Unknown':
        return statusContent.unknown.value;
      case 'Warning':
        return statusContent.warning.value;
      case 'Error':
        return statusContent.error.value;
      case 'Fatal':
        return statusContent.fatal.value;
      case 'N/A':
        return statusContent.na.value;
      default:
        return statusContent.na.value;
    }
  };

  return (
    <>
      <div className="font-bold text-sm text-left flex items-center justify-between">
        <span>{serverAlias || serverName} : {backupName}</span>
        {notificationEvent && (
          <div className="inline-block mr-2">
            {getNotificationIcon(notificationEvent)}
          </div>
        )}
      </div>
      <div className="text-xs text-muted-foreground text-left -mt-3 truncate">
        {serverAlias ? serverName : ''}{serverAlias && serverNote ? <br/> : ''}{serverNote ? serverNote : ''}
      </div>

      <div className="space-y-2 border-t pt-3">
        <div className="text-bold mb-4">{content.lastBackupDetails}</div>
        
        <div className="grid grid-cols-[65%_35%] gap-x-3 gap-y-2 text-xs">
          <div>
            <div className="text-muted-foreground text-left mb-1">{content.date}</div>
            <div className="font-semibold text-left">
              {lastBackupDate !== "N/A" 
                ? formatDateTime(lastBackupDate, locale) + " (" + formatRelativeTime(lastBackupDate, undefined, locale) + ")"
                : common.status.notAvailable}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground text-left mb-1">{content.status}</div>
            <div className={`font-semibold text-left ${getStatusColor(lastBackupStatus)}`}>
              {getStatusLabel(lastBackupStatus)}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-left mb-1">{content.duration}</div>
            <div className="font-semibold text-left">
              {lastBackupDuration !== null && lastBackupDuration !== undefined
                ? lastBackupDuration
                : common.status.notAvailable}
            </div>
          </div>
                                                
          <div>
            <div className="text-muted-foreground text-left mb-1">{content.files}</div>
            <div className="font-semibold text-left">
              {fileCount !== null && fileCount !== undefined
                ? formatInteger(fileCount, locale)
                : common.status.notAvailable}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground text-left mb-1">{content.size}</div>
            <div className="font-semibold text-left">
              {fileSize !== null && fileSize !== undefined
                ? formatBytes(fileSize, locale)
                : common.status.notAvailable}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground text-left mb-1">{content.storage}</div>
            <div className="font-semibold text-left">
              {storageSize !== null && storageSize !== undefined
                ? formatBytes(storageSize, locale)
                : common.status.notAvailable}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-left mb-1">{content.uploaded}</div>
            <div className="font-semibold text-left">
              {uploadedSize !== null && uploadedSize !== undefined
                ? formatBytes(uploadedSize, locale)
                : common.status.notAvailable}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-left mb-1">{content.versions}</div>
            <div className="font-semibold text-left">
              {lastBackupListCount !== null && lastBackupListCount !== undefined
                ? formatInteger(lastBackupListCount, locale)
                : common.status.notAvailable}
            </div>
          </div>
          
          {/* Expected backup date for non-overdue backups */}
          {!isOverdue && expectedBackupDate !== "N/A" && (
            <div className="col-span-2">
              <div className="text-muted-foreground text-left mb-1">{content.expected}</div>
              <div className="font-semibold text-left">
                {formatDateTime(expectedBackupDate, locale) + " (" + formatRelativeTime(expectedBackupDate, undefined, locale) + ")"}
              </div>
            </div>
          )}
        </div>
      </div>
        
      {/* Overdue information section */}
      {isOverdue && (
        <div className="border-t pt-3 space-y-3">
          <div className="font-semibold text-sm text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {content.backupOverdue}
          </div>
          
          <div className="grid grid-cols-[80px_1fr] gap-x-3 text-xs">
            <div className="text-muted-foreground text-right">{content.expected}</div>
            <div className="font-semibold text-left">
              {expectedBackupDate !== "N/A" 
                ? formatDateTime(expectedBackupDate, locale) + " (" + formatRelativeTime(expectedBackupDate, undefined, locale) + ")"
                : common.status.notAvailable}
            </div>
          </div>
        </div>
      )}
      
      {/* Configuration buttons - always shown */}
      <div className="border-t pt-3">
        <div className="flex items-center gap-2">
          <button 
            className="text-xs flex items-center gap-1 hover:text-blue-500 transition-colors px-2 py-1 rounded"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/${locale}/settings?tab=monitoring`);
            }}
          >
            <Settings className="h-3 w-3" />
            <span>{content.backupConfiguration}</span>
          </button>
          <ServerConfigurationButton 
            className="text-xs !p-1" 
            variant="ghost"
            size="sm"
            serverUrl={serverUrl}
            serverName={serverName}
            serverAlias={serverAlias}
            showText={true} 
          />
        </div>
      </div>
    </>
  );
}
