"use client";
import { useTranslation } from "react-i18next";

import { useRouter } from "next/navigation";
import { useEffectiveFormatLocale } from "@/contexts/config-context";
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
  const { t } = useTranslation();
  const router = useRouter();
  const effectiveLocale = useEffectiveFormatLocale();

  // Helper function to get translated status label
  const getStatusLabel = (status: BackupStatus | 'N/A'): string => {
    switch (status) {
      case 'Success':
        return t("Success");
      case 'Unknown':
        return t("Unknown");
      case 'Warning':
        return t("Warning");
      case 'Error':
        return t("Error");
      case 'Fatal':
        return t("Fatal");
      case 'N/A':
        return t("N/A");
      default:
        return t("N/A");
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
        <div className="text-bold mb-4">{t("Last Backup Details")}</div>
        
        <div className="grid grid-cols-[65%_35%] gap-x-3 gap-y-2 text-xs">
          <div>
            <div className="text-muted-foreground text-left mb-1">{t("Date:")}</div>
            <div className="font-semibold text-left">
              {lastBackupDate !== "N/A" 
                ? formatDateTime(lastBackupDate, effectiveLocale) + " (" + formatRelativeTime(lastBackupDate, undefined, effectiveLocale) + ")"
                : t("N/A")}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground text-left mb-1">{t("Status:")}</div>
            <div className={`font-semibold text-left ${getStatusColor(lastBackupStatus)}`}>
              {getStatusLabel(lastBackupStatus)}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-left mb-1">{t("Duration:")}</div>
            <div className="font-semibold text-left">
              {lastBackupDuration !== null && lastBackupDuration !== undefined
                ? lastBackupDuration
                : t("N/A")}
            </div>
          </div>
                                                
          <div>
            <div className="text-muted-foreground text-left mb-1">{t("Files:")}</div>
            <div className="font-semibold text-left">
              {fileCount !== null && fileCount !== undefined
                ? formatInteger(fileCount, effectiveLocale)
                : t("N/A")}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground text-left mb-1">{t("Size:")}</div>
            <div className="font-semibold text-left">
              {fileSize !== null && fileSize !== undefined
                ? formatBytes(fileSize, effectiveLocale)
                : t("N/A")}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground text-left mb-1">{t("Storage:")}</div>
            <div className="font-semibold text-left">
              {storageSize !== null && storageSize !== undefined
                ? formatBytes(storageSize, effectiveLocale)
                : t("N/A")}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-left mb-1">{t("Uploaded:")}</div>
            <div className="font-semibold text-left">
              {uploadedSize !== null && uploadedSize !== undefined
                ? formatBytes(uploadedSize, effectiveLocale)
                : t("N/A")}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-left mb-1">{t("Versions:")}</div>
            <div className="font-semibold text-left">
              {lastBackupListCount !== null && lastBackupListCount !== undefined
                ? formatInteger(lastBackupListCount, effectiveLocale)
                : t("N/A")}
            </div>
          </div>
          
          {/* Expected backup date for non-overdue backups */}
          {!isOverdue && expectedBackupDate !== "N/A" && (
            <div className="col-span-2">
              <div className="text-muted-foreground text-left mb-1">{t("Expected:")}</div>
              <div className="font-semibold text-left">
                {formatDateTime(expectedBackupDate, effectiveLocale) + " (" + formatRelativeTime(expectedBackupDate, undefined, effectiveLocale) + ")"}
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
            {t("Backup Overdue")}
          </div>
          
          <div className="grid grid-cols-[80px_1fr] gap-x-3 text-xs">
            <div className="text-muted-foreground text-right">{t("Expected:")}</div>
            <div className="font-semibold text-left">
              {expectedBackupDate !== "N/A" 
                ? formatDateTime(expectedBackupDate, effectiveLocale) + " (" + formatRelativeTime(expectedBackupDate, undefined, effectiveLocale) + ")"
                : t("N/A")}
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
              router.push(`/settings?tab=monitoring`);
            }}
          >
            <Settings className="h-3 w-3" />
            <span>{t("Overdue configuration")}</span>
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
