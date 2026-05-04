"use client";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useGlobalRefresh } from '@/contexts/global-refresh-context';
import { useConfiguration } from '@/contexts/configuration-context';
import { ServerAddress } from '@/lib/types';
import { Loader2, Import } from 'lucide-react';
import { 
  collectFromMultipleServers, 
  getEligibleServers, 
  isValidUrl
} from '@/lib/bulk-collection';
import type { CollectionSummary } from '@/lib/bulk-collection';

function formatCollectionSummaryFromContent(
  summary: CollectionSummary,
  t: TFunction,
): { title: string; description: string; variant: 'default' | 'destructive' } {
  const {
    totalServers,
    successfulCollections,
    totalProcessed,
    totalSkipped,
    totalErrors,
    failedServerNames,
  } = summary;

  if (successfulCollections === totalServers) {
    return {
      title: t("All Collections Successful"),
      description: t(
        "Collected from {{successfulCollections}} servers. Processed: {{totalProcessed}}, Skipped: {{totalSkipped}}, Errors: {{totalErrors}}",
        {
          successfulCollections,
          totalProcessed,
          totalSkipped,
          totalErrors,
        },
      ),
      variant: 'default',
    };
  }
  if (successfulCollections > 0) {
    return {
      title: t("Partial Collection Success"),
      description: t(
        "Successfully collected from {{successfulCollections}}/{{totalServers}} servers. Processed: {{totalProcessed}}, Skipped: {{totalSkipped}}, Errors: {{totalErrors}}. Failed servers: {{failedServerNames}}",
        {
          successfulCollections,
          totalServers,
          totalProcessed,
          totalSkipped,
          totalErrors,
          failedServerNames: failedServerNames.join(', '),
        },
      ),
      variant: 'default',
    };
  }
  return {
    title: t("Collection Failed"),
    description: t(
      'Failed to collect from all {{totalServers}} servers: {{failedServerNames}}. Check individual server configurations.',
      {
        totalServers,
        failedServerNames: failedServerNames.join(', '),
      },
    ),
    variant: 'destructive',
  };
}

interface CollectAllButtonProps {
  servers: ServerAddress[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  showText?: boolean;
  disabled?: boolean;
  showInstructionToast?: boolean;
  onCollectionStart?: (showInstructionToast: boolean) => void;
  onCollectionEnd?: () => void;
  onServerStatusUpdate?: (serverId: string, status: 'testing' | 'success' | 'failed' | 'collecting' | 'collected' | 'need_url' | 'need_password' | 'need_url_and_password') => void;
  // Dynamic mode props for hostname/password based servers
  dynamicMode?: boolean;
  dynamicPort?: string;
  dynamicPassword?: string;
  // Auto-trigger collection without button click
  autoTrigger?: boolean;
}

export function CollectAllButton({
  servers,
  size = 'md',
  variant = 'outline',
  className = '',
  showText = false,
  disabled = false,
  showInstructionToast = true,
  onCollectionStart,
  onCollectionEnd,
  onServerStatusUpdate,
  dynamicMode = false,
  dynamicPort,
  dynamicPassword,
  autoTrigger = false
}: CollectAllButtonProps) {
  const { t } = useTranslation();
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectionProgress, setCollectionProgress] = useState(0);
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
  const { toast, removeToast } = useToast();
  const { refreshDashboard } = useGlobalRefresh();
  const { refreshConfigSilently } = useConfiguration();

  // Get eligible servers using library function
  const eligibleServers = getEligibleServers(servers, dynamicMode);

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'sm';
      case 'lg':
        return 'lg';
      default: // md
        return 'default';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'lg':
        return 'h-5 w-5';
      default: // md
        return 'h-4 w-4';
    }
  };

  const handleCollectAll = useCallback(async () => {
    // Identify and update status for ineligible servers
    if (!dynamicMode) {
      servers.forEach(server => {
        const hasUrl = server.server_url && server.server_url.trim() !== '' && isValidUrl(server.server_url);
        const hasPassword = server.hasPassword;
        
        if (!hasUrl && !hasPassword) {
          onServerStatusUpdate?.(server.id, 'need_url_and_password');
        } else if (!hasUrl) {
          onServerStatusUpdate?.(server.id, 'need_url');
        } else if (!hasPassword) {
          onServerStatusUpdate?.(server.id, 'need_password');
        }
      });
    }

    if (eligibleServers.length === 0) {
      if (showInstructionToast) {
        toast({
          title: t("No Eligible Servers"),
          description: t("No servers with passwords and valid URLs found to collect from"),
          variant: "destructive",
          duration: 3000,
        });
      }
      return;
    }

    setIsCollecting(true);
    setCollectionProgress(0);

    try {
      // Use the library function for bulk collection
      const summary = await collectFromMultipleServers({
        servers,
        dynamicMode,
        dynamicPort,
        dynamicPassword,
        onCollectionStart: () => onCollectionStart?.(showInstructionToast),
        onCollectionEnd: () => onCollectionEnd?.(),
        onServerStatusUpdate,
        onProgressUpdate: (progress) => setCollectionProgress(progress)
      });

      // Show summary toast (using translated content)
      const { title, description, variant } = formatCollectionSummaryFromContent(summary, t);
      if (showInstructionToast) {
        toast({
          title,
          description,
          variant,
          duration: 4000,
        });
      }

      // Show additional toast with instructions for partial or complete failures
      if (summary.failedCollections > 0 && showInstructionToast) {
        const errorDescription = summary.successfulCollections > 0
          ? t(
              'Check server(s) settings and password and if the server is up and running, then try again. Click "Collect All" to show which server is with error (column Status)',
            )
          : t(
              'Check server(s) settings and password and if the server is up and running, then try again. Click "Collect All" to show which server is with error',
            );

        const instructionToast = toast({
          title: t("Server Errors Detected"),
          description: errorDescription,
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                removeToast(instructionToast.id);
                window.location.href = '/settings?tab=server';
              }}
              className="underline hover:no-underline"
            >
              {t("Servers settings")}
            </Button>
          ),
          variant: "destructive",
          duration: 9000,
        });
      }

      // Refresh dashboard and configuration data
      await refreshDashboard();
      await refreshConfigSilently();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error during bulk collection:', errorMessage);
      
      if (showInstructionToast) {
        toast({
          title: t("Collection Error"),
          description: `${t("An unexpected error occurred during collection")}: ${errorMessage}`,
          variant: "destructive",
          duration: 4000,
        });
      }
    } finally {
      setIsCollecting(false);
      
      // Clear progress after a delay to show completion
      setTimeout(() => {
        setCollectionProgress(0);
      }, 3000);
    }
  }, [
    eligibleServers.length, 
    servers, 
    showInstructionToast, 
    onCollectionStart, 
    onServerStatusUpdate, 
    onCollectionEnd, 
    toast, 
    removeToast, 
    refreshDashboard, 
    refreshConfigSilently, 
    dynamicMode, 
    dynamicPort, 
    dynamicPassword,
    t,
  ]);

  // Auto-trigger collection when autoTrigger is true and servers are available
  useEffect(() => {
    if (autoTrigger && !hasAutoTriggered && eligibleServers.length > 0 && !isCollecting) {
      setHasAutoTriggered(true);
      handleCollectAll();
    }
    
    // Reset hasAutoTriggered when autoTrigger becomes false
    if (!autoTrigger && hasAutoTriggered) {
      setHasAutoTriggered(false);
    }
  }, [autoTrigger, hasAutoTriggered, eligibleServers.length, isCollecting, handleCollectAll]);

  const isDisabled = disabled || isCollecting || eligibleServers.length === 0;

  const tooltip = eligibleServers.length === 0
    ? t("No servers with passwords configured")
    : t("Collect backups from all configured servers");

  const collectingText = showText && isCollecting
    ? `${t("Collecting...")} ${Math.round(collectionProgress)}%`
    : null;

  const collectAllText = showText && !isCollecting
    ? `${t("Collect All")} (${eligibleServers.length})`
    : null;

  return (
    <Button
      onClick={handleCollectAll}
      disabled={isDisabled}
      variant={variant}
      size={getButtonSize()}
      className={className}
      title={tooltip}
    >
      {isCollecting ? (
        <>
          <Loader2 className={`${getIconSize()} animate-spin`} />
          {collectingText}
        </>
      ) : (
        <>
          <Import className={`${getIconSize()}`} />
          {collectAllText}
        </>
      )}
    </Button>
  );
}
