"use client";

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
  formatCollectionSummary,
  isValidUrl
} from '@/lib/bulk-collection';

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
          title: "No Eligible Servers",
          description: "No servers with passwords and valid URLs found to collect from",
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

      // Show summary toast
      const { title, description, variant } = formatCollectionSummary(summary);
      
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
        const instructionToast = toast({
          title: "Server Errors Detected",
          description: "Check server(s) settings and password and if the server is up and running, then try again. Click \"Collect All\" to show which server is with error" + 
            (summary.successfulCollections > 0 ? " (column Status)" : ""),
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
              Servers settings
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
          title: "Collection Error",
          description: `An unexpected error occurred during collection: ${errorMessage}`,
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
    dynamicPassword
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

  return (
    <Button
      onClick={handleCollectAll}
      disabled={isDisabled}
      variant={variant}
      size={getButtonSize()}
      className={className}
      title={eligibleServers.length === 0 ? "No servers with passwords configured" : "Collect backups from all configured servers"}
    >
      {isCollecting ? (
        <>
          <Loader2 className={`${getIconSize()} animate-spin`} />
          {showText && `Collecting... ${Math.round(collectionProgress)}%`}
        </>
      ) : (
        <>
          <Import className={`${getIconSize()}`} />
          {showText && `Collect All (${eligibleServers.length})`}
        </>
      )}
    </Button>
  );
}
