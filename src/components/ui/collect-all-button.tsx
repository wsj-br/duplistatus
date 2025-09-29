"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useGlobalRefresh } from '@/contexts/global-refresh-context';
import { useConfiguration } from '@/contexts/configuration-context';
import { ServerAddress } from '@/lib/types';
import { authenticatedRequest } from '@/lib/client-session-csrf';
import { Loader2, Import } from 'lucide-react';

interface CollectAllButtonProps {
  servers: ServerAddress[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  showText?: boolean;
  disabled?: boolean;
  onCollectionStart?: () => void;
  onCollectionEnd?: () => void;
  onServerStatusUpdate?: (serverId: string, status: 'testing' | 'success' | 'failed' | 'collecting' | 'collected') => void;
}

interface CollectionResult {
  serverId: string;
  serverName: string;
  success: boolean;
  stats?: {
    processed: number;
    skipped: number;
    errors: number;
  };
  error?: string;
}

export function CollectAllButton({
  servers,
  size = 'md',
  variant = 'outline',
  className = '',
  showText = false,
  disabled = false,
  onCollectionStart,
  onCollectionEnd,
  onServerStatusUpdate
}: CollectAllButtonProps) {
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectionProgress, setCollectionProgress] = useState(0);
  const [, setCollectionResults] = useState<CollectionResult[]>([]);
  const { toast } = useToast();
  const { refreshDashboard } = useGlobalRefresh();
  const { refreshConfigSilently } = useConfiguration();

  // Check for URL validity
  const isValidUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return false;
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  // Filter servers that have passwords and valid URLs
  const eligibleServers = servers.filter(server => 
    server.hasPassword && 
    server.server_url && 
    server.server_url.trim() !== '' &&
    isValidUrl(server.server_url)
  );

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

  const handleCollectAll = async () => {
    if (eligibleServers.length === 0) {
      toast({
        title: "No Eligible Servers",
        description: "No servers with passwords and valid URLs found to collect from",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    onCollectionStart?.();
    setIsCollecting(true);
    setCollectionProgress(0);
    setCollectionResults([]);

    // Set all eligible servers to testing status
    eligibleServers.forEach(server => {
      onServerStatusUpdate?.(server.id, 'testing');
    });

    const results: CollectionResult[] = [];
    let completedCount = 0;

    try {
      // Collect from all eligible servers in parallel
      const collectionPromises = eligibleServers.map(async (server) => {
        try {
          const response = await authenticatedRequest('/api/backups/collect', {
            method: 'POST',
            body: JSON.stringify({
              serverId: server.id,
              downloadJson: false
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to collect backups');
          }

          // Update status to success
          onServerStatusUpdate?.(server.id, 'success');

          return {
            serverId: server.id,
            serverName: server.alias || server.name,
            success: true,
            stats: result.stats
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          // Update status to failed
          onServerStatusUpdate?.(server.id, 'failed');
          
          return {
            serverId: server.id,
            serverName: server.alias || server.name,
            success: false,
            error: errorMessage
          };
        }
      });

      // Process results as they complete
      const settledResults = await Promise.allSettled(collectionPromises);
      
      settledResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          const server = eligibleServers[index];
          // Update status to failed for rejected promises
          onServerStatusUpdate?.(server.id, 'failed');
          results.push({
            serverId: server.id,
            serverName: server.alias || server.name,
            success: false,
            error: result.reason instanceof Error ? result.reason.message : String(result.reason)
          });
        }
        
        completedCount++;
        setCollectionProgress((completedCount / eligibleServers.length) * 100);
      });

      setCollectionResults(results);

      // Calculate summary statistics
      const successfulCollections = results.filter(r => r.success);
      const failedCollections = results.filter(r => !r.success);
      const totalProcessed = successfulCollections.reduce((sum, r) => sum + (r.stats?.processed || 0), 0);
      const totalSkipped = successfulCollections.reduce((sum, r) => sum + (r.stats?.skipped || 0), 0);
      const totalErrors = successfulCollections.reduce((sum, r) => sum + (r.stats?.errors || 0), 0);

      // Show summary toast
      if (successfulCollections.length === eligibleServers.length) {
        toast({
          title: "All Collections Successful",
          description: `Collected from ${successfulCollections.length} servers. Processed: ${totalProcessed}, Skipped: ${totalSkipped}, Errors: ${totalErrors}`,
          variant: "default",
          duration: 4000,
        });
      } else if (successfulCollections.length > 0) {
        toast({
          title: "Partial Collection Success",
          description: `Successfully collected from ${successfulCollections.length}/${eligibleServers.length} servers. Processed: ${totalProcessed}, Skipped: ${totalSkipped}, Errors: ${totalErrors}. ${failedCollections.length} servers failed.`,
          variant: "default",
          duration: 4000,
        });
      } else {
        toast({
          title: "Collection Failed",
          description: `Failed to collect from all ${eligibleServers.length} servers. Check individual server configurations.`,
          variant: "destructive",
          duration: 4000,
        });
      }

      // Refresh dashboard and configuration data
      await refreshDashboard();
      await refreshConfigSilently();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error during bulk collection:', errorMessage);
      
      toast({
        title: "Collection Error",
        description: `An unexpected error occurred during collection: ${errorMessage}`,
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsCollecting(false);
      onCollectionEnd?.();
      
      // Clear results after a delay to show completion
      setTimeout(() => {
        setCollectionResults([]);
        setCollectionProgress(0);
      }, 3000);
    }
  };

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
          {showText && `Collecting... (${Math.round(collectionProgress)}%)`}
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
