import { ServerAddress } from '@/lib/types';
import { authenticatedRequest } from '@/lib/client-session-csrf';

/**
 * Result of a single server collection
 */
export interface CollectionResult {
  serverId: string;
  serverName: string;
  success: boolean;
  stats?: {
    processed: number;
    skipped: number;
    errors: number;
  };
  error?: string;
  jsonData?: string;
}

/**
 * Aggregated statistics from multiple collection results
 */
export interface CollectionSummary {
  totalServers: number;
  successfulCollections: number;
  failedCollections: number;
  totalProcessed: number;
  totalSkipped: number;
  totalErrors: number;
  results: CollectionResult[];
  failedServerNames: string[];
}

/**
 * Options for bulk collection
 */
export interface BulkCollectionOptions {
  /** Servers to collect from */
  servers: ServerAddress[];
  
  /** Callback for when collection starts */
  onCollectionStart?: () => void;
  
  /** Callback for when collection completes */
  onCollectionEnd?: () => void;
  
  /** Callback for progress updates on individual servers */
  onServerStatusUpdate?: (
    serverId: string, 
    status: 'testing' | 'success' | 'failed' | 'collecting' | 'collected'
  ) => void;
  
  /** Callback for overall progress percentage (0-100) */
  onProgressUpdate?: (progress: number) => void;
  
  /** Dynamic mode: use hostname/port/password instead of stored credentials */
  dynamicMode?: boolean;
  
  /** Port for dynamic mode */
  dynamicPort?: string;
  
  /** Password for dynamic mode */
  dynamicPassword?: string;
  
  /** Whether to download JSON data (usually false for bulk operations) */
  downloadJson?: boolean;
}

/**
 * Validates if a URL is valid HTTP/HTTPS
 */
export function isValidUrl(url: string): boolean {
  if (!url || url.trim() === '') return false;
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Filters servers to find those eligible for collection
 * 
 * In dynamic mode: all servers are eligible (they're created from valid hostnames)
 * In stored mode: servers must have password and valid URL
 */
export function getEligibleServers(
  servers: ServerAddress[], 
  dynamicMode: boolean = false
): ServerAddress[] {
  if (dynamicMode) {
    return servers;
  }
  
  return servers.filter(server => 
    server.hasPassword && 
    server.server_url && 
    server.server_url.trim() !== '' &&
    isValidUrl(server.server_url)
  );
}

/**
 * Collects backups from a single server
 */
async function collectFromServer(
  server: ServerAddress,
  options: BulkCollectionOptions
): Promise<CollectionResult> {
  const { dynamicMode, dynamicPort, dynamicPassword, downloadJson = false } = options;
  
  try {
    // Choose request body based on mode
    const requestBody = dynamicMode ? {
      hostname: server.name,
      port: parseInt(dynamicPort || '8200'),
      password: dynamicPassword,
      downloadJson
    } : {
      serverId: server.id,
      downloadJson
    };

    const response = await authenticatedRequest('/api/backups/collect', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to collect backups');
    }

    return {
      serverId: server.id,
      serverName: server.alias || server.name,
      success: true,
      stats: result.stats,
      jsonData: result.jsonData
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      serverId: server.id,
      serverName: server.alias || server.name,
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Collects backups from multiple servers in parallel
 * 
 * @param options - Collection options including servers and callbacks
 * @returns Summary of collection results
 * 
 * @example
 * ```typescript
 * const summary = await collectFromMultipleServers({
 *   servers: eligibleServers,
 *   onProgressUpdate: (progress) => setProgress(progress),
 *   onServerStatusUpdate: (serverId, status) => updateServerStatus(serverId, status)
 * });
 * 
 * console.log(`Collected from ${summary.successfulCollections}/${summary.totalServers} servers`);
 * ```
 */
export async function collectFromMultipleServers(
  options: BulkCollectionOptions
): Promise<CollectionSummary> {
  const { 
    servers, 
    onCollectionStart, 
    onCollectionEnd, 
    onServerStatusUpdate,
    onProgressUpdate
  } = options;
  
  // Get eligible servers
  const eligibleServers = getEligibleServers(servers, options.dynamicMode);
  
  if (eligibleServers.length === 0) {
    return {
      totalServers: 0,
      successfulCollections: 0,
      failedCollections: 0,
      totalProcessed: 0,
      totalSkipped: 0,
      totalErrors: 0,
      results: [],
      failedServerNames: []
    };
  }
  
  // Notify collection start
  onCollectionStart?.();
  
  // Set all eligible servers to testing status
  eligibleServers.forEach(server => {
    onServerStatusUpdate?.(server.id, 'testing');
  });
  
  const results: CollectionResult[] = [];
  let completedCount = 0;
  
  try {
    // Collect from all eligible servers in parallel with real-time progress tracking
    const collectionPromises = eligibleServers.map(async (server) => {
      const result = await collectFromServer(server, options);
      
      // Update status and progress immediately after each server completes
      const status = result.success ? 'success' : 'failed';
      onServerStatusUpdate?.(server.id, status);
      
      completedCount++;
      const progress = (completedCount / eligibleServers.length) * 100;
      onProgressUpdate?.(progress);
      
      return result;
    });
    
    // Wait for all collections to complete
    const settledResults = await Promise.allSettled(collectionPromises);
    
    // Process settled results
    settledResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        const server = eligibleServers[index];
        results.push({
          serverId: server.id,
          serverName: server.alias || server.name,
          success: false,
          error: result.reason instanceof Error ? result.reason.message : String(result.reason)
        });
      }
    });
    
    // Calculate summary statistics
    const successfulCollections = results.filter(r => r.success);
    const failedCollections = results.filter(r => !r.success);
    const totalProcessed = successfulCollections.reduce((sum, r) => sum + (r.stats?.processed || 0), 0);
    const totalSkipped = successfulCollections.reduce((sum, r) => sum + (r.stats?.skipped || 0), 0);
    const totalErrors = successfulCollections.reduce((sum, r) => sum + (r.stats?.errors || 0), 0);
    const failedServerNames = failedCollections.map(r => r.serverName);
    
    return {
      totalServers: eligibleServers.length,
      successfulCollections: successfulCollections.length,
      failedCollections: failedCollections.length,
      totalProcessed,
      totalSkipped,
      totalErrors,
      results,
      failedServerNames
    };
  } finally {
    // Always notify collection end
    onCollectionEnd?.();
  }
}

/**
 * Helper function to create human-readable summary message
 */
export function formatCollectionSummary(summary: CollectionSummary): {
  title: string;
  description: string;
  variant: 'default' | 'destructive';
} {
  const { 
    totalServers, 
    successfulCollections,
    totalProcessed,
    totalSkipped,
    totalErrors,
    failedServerNames
  } = summary;
  
  if (successfulCollections === totalServers) {
    return {
      title: "All Collections Successful",
      description: `Collected from ${successfulCollections} servers. Processed: ${totalProcessed}, Skipped: ${totalSkipped}, Errors: ${totalErrors}`,
      variant: "default"
    };
  } else if (successfulCollections > 0) {
    return {
      title: "Partial Collection Success",
      description: `Successfully collected from ${successfulCollections}/${totalServers} servers. Processed: ${totalProcessed}, Skipped: ${totalSkipped}, Errors: ${totalErrors}. Failed servers: ${failedServerNames.join(', ')}`,
      variant: "default"
    };
  } else {
    return {
      title: "Collection Failed",
      description: `Failed to collect from all ${totalServers} servers: ${failedServerNames.join(', ')}. Check individual server configurations.`,
      variant: "destructive"
    };
  }
}

