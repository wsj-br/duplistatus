"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useGlobalRefresh } from '@/contexts/global-refresh-context';
import { useConfiguration } from '@/contexts/configuration-context';
import { ServerAddress } from '@/lib/types';
import { Loader2, Import } from 'lucide-react';
import { useIntlayer } from 'react-intlayer';
import { 
  collectFromMultipleServers, 
  getEligibleServers, 
  isValidUrl
} from '@/lib/bulk-collection';
import type { CollectionSummary } from '@/lib/bulk-collection';

function formatCollectionSummaryFromContent(
  summary: CollectionSummary,
  content: ReturnType<typeof useIntlayer<'collect-all-button'>>
): { title: string; description: string; variant: 'default' | 'destructive' } {
  const {
    totalServers,
    successfulCollections,
    totalProcessed,
    totalSkipped,
    totalErrors,
    failedServerNames,
  } = summary;
  const replace = (s: string) =>
    s
      .replace('{successfulCollections}', String(successfulCollections))
      .replace('{totalProcessed}', String(totalProcessed))
      .replace('{totalSkipped}', String(totalSkipped))
      .replace('{totalErrors}', String(totalErrors))
      .replace('{totalServers}', String(totalServers))
      .replace('{failedServerNames}', failedServerNames.join(', '));

  if (successfulCollections === totalServers) {
    return {
      title: content.summaryAllSuccessTitle.value,
      description: replace(content.summaryAllSuccessDescription.value),
      variant: 'default',
    };
  }
  if (successfulCollections > 0) {
    return {
      title: content.summaryPartialTitle.value,
      description: replace(content.summaryPartialDescription.value),
      variant: 'default',
    };
  }
  return {
    title: content.summaryFailedTitle.value,
    description: replace(content.summaryFailedDescription.value),
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
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectionProgress, setCollectionProgress] = useState(0);
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
  const { toast, removeToast } = useToast();
  const { refreshDashboard } = useGlobalRefresh();
  const { refreshConfigSilently } = useConfiguration();
  const content = useIntlayer('collect-all-button');

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
          title: content.noEligibleServers.value,
          description: content.noEligibleServersDescription.value,
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
      const { title, description, variant } = formatCollectionSummaryFromContent(summary, content);
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
          ? content.serverErrorsDetectedDescriptionWithStatus.value
          : content.serverErrorsDetectedDescription.value;
        
        const instructionToast = toast({
          title: content.serverErrorsDetected.value,
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
              {content.serversSettings.value}
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
          title: content.collectionError.value,
          description: `${content.collectionErrorDescription.value}: ${errorMessage}`,
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
    content
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
    ? content.noServersTooltip.value
    : content.tooltip.value;

  const collectingText = showText && isCollecting
    ? `${content.collecting.value} ${Math.round(collectionProgress)}%`
    : null;

  const collectAllText = showText && !isCollecting
    ? `${content.collectAll.value} (${eligibleServers.length})`
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
