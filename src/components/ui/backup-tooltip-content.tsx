"use client";

import { useRouter } from 'next/navigation';
import type { BackupStatus, NotificationEvent } from "@/lib/types";
import { formatTimeAgo, formatBytes, getStatusColor } from "@/lib/utils";
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
  const router = useRouter();

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
        {serverAlias ? serverName : ''}{serverAlias && serverNote ? <br /> : ''}{serverNote ? serverNote : ''}
      </div>

      <div className="space-y-2 border-t pt-3">
        <div className="text-bold mb-4">Last Backup Details</div>
        
        <div className="grid grid-cols-[65%_35%] gap-x-3 gap-y-2 text-xs">
          <div>
            <div className="text-muted-foreground text-left mb-1">Date:</div>
            <div className="font-semibold text-left">
              {lastBackupDate !== "N/A" 
                ? new Date(lastBackupDate).toLocaleString() + " (" + formatTimeAgo(lastBackupDate) + ")"
                : "N/A"}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground text-left mb-1">Status:</div>
            <div className={`font-semibold text-left ${getStatusColor(lastBackupStatus)}`}>
              {lastBackupStatus !== "N/A" 
                ? lastBackupStatus
                : "N/A"}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-left mb-1">Duration:</div>
            <div className="font-semibold text-left">
              {lastBackupDuration !== null && lastBackupDuration !== undefined
                ? lastBackupDuration
                : "N/A"}
            </div>
          </div>
                                                
          <div>
            <div className="text-muted-foreground text-left mb-1">Files:</div>
            <div className="font-semibold text-left">
              {fileCount !== null && fileCount !== undefined
                ? fileCount.toLocaleString()
                : "N/A"}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground text-left mb-1">Size:</div>
            <div className="font-semibold text-left">
              {fileSize !== null && fileSize !== undefined
                ? formatBytes(fileSize)
                : "N/A"}
            </div>
          </div>
          
          <div>
            <div className="text-muted-foreground text-left mb-1">Storage:</div>
            <div className="font-semibold text-left">
              {storageSize !== null && storageSize !== undefined
                ? formatBytes(storageSize)
                : "N/A"}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-left mb-1">Uploaded:</div>
            <div className="font-semibold text-left">
              {uploadedSize !== null && uploadedSize !== undefined
                ? formatBytes(uploadedSize)
                : "N/A"}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-left mb-1">Versions:</div>
            <div className="font-semibold text-left">
              {lastBackupListCount !== null && lastBackupListCount !== undefined
                ? lastBackupListCount.toLocaleString()
                : "N/A"}
            </div>
          </div>
        </div>
      </div>
        
      {/* Overdue information section */}
      {isOverdue && (
        <div className="border-t pt-3 space-y-3">
          <div className="font-semibold text-sm text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Backup Overdue
          </div>
          
          <div className="grid grid-cols-[80px_1fr] gap-x-3 text-xs">
            <div className="text-muted-foreground text-right">Expected:</div>
            <div className="font-semibold text-left">
              {expectedBackupDate !== "N/A" 
                ? new Date(expectedBackupDate).toLocaleString() + " (" + formatTimeAgo(expectedBackupDate) + ")"
                : "N/A"}
            </div>
          </div>
          
          <div className="border-t pt-2 flex items-center gap-2">
            <button 
              className="text-xs flex items-center gap-1 hover:text-blue-500 transition-colors px-2 py-1 rounded"
              onClick={(e) => {
                e.stopPropagation();
                router.push('/settings?tab=backups');
              }}
            >
              <Settings className="h-3 w-3" />
              <span>Overdue configuration</span>
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
      )}
    </>
  );
}
