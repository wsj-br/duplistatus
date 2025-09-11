"use client";

import { useState, useRef, useCallback, useEffect, useMemo, memo } from 'react';
import type { BackupStatus, ServerSummary, NotificationEvent } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { formatTimeAgo, formatBytes, formatShortTimeAgo } from "@/lib/utils";
import { HardDrive, AlertTriangle, Settings, Download, ChevronLeft, ChevronRight, MessageSquareMore, MessageSquareOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useConfig } from "@/contexts/config-context";
import { getStatusSortValue } from "@/lib/sort-utils";
import { ServerConfigurationButton } from "@/components/ui/server-configuration-button";


const MIN_CARD_WIDTH = 230;         // the minimum width of a card
const MAX_CARD_WIDTH = 350;         // the maximum width of a card
const CARD_GAP = 12;                // the gap between cards
const CARD_WIDTH_SHOW_PARTIAL = 50; // the width of the partial card

// Helper function to get overall server status
function getServerStatus(server: ServerSummary): BackupStatus {
  // Check if any backup has an error or fatal status
  const hasErrorOrFatal = server.backupInfo.some(backupType => 
    backupType.lastBackupStatus === 'Error' || backupType.lastBackupStatus === 'Fatal'
  );
  if (hasErrorOrFatal) {
    return 'Error';
  }
  
  // Check if any backup has a warning status
  const hasWarning = server.backupInfo.some(backupType => 
    backupType.lastBackupStatus === 'Warning'
  );
  
  // Check if any backup type is overdue
  const hasOverdueBackup = server.backupInfo.some(backupType => backupType.isBackupOverdue);
  
  if (hasWarning || hasOverdueBackup) {
    return 'Warning';
  }
  
  // Check if all backup statuses are success
  const allBackupsHaveStatus = server.backupInfo.length > 0;
  const allBackupsSuccess = allBackupsHaveStatus && server.backupInfo.every(backupType => 
    backupType.lastBackupStatus === 'Success'
  );
  
  if (allBackupsSuccess && !hasOverdueBackup) {
    return 'Success';
  }
  
  return 'Unknown';
}

// Helper function to get status color for backup status bars
function getStatusColor(status: BackupStatus): string {
  switch (status) {
    case 'Success':
      return 'bg-green-500';
    case 'Warning':
      return 'bg-yellow-500';
    case 'Error':
    case 'Fatal':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
}

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

// Custom status badge without text, just icon and color
function CompactStatusBadge({ status, haveOverdueBackups }: { status: BackupStatus; haveOverdueBackups: boolean }) {
  const getStatusIcon = (status: BackupStatus) => {
      switch (status) {
      case 'Success':
        if (!haveOverdueBackups) {
          return <div className="w-3 h-3 bg-green-500 rounded-full" />;
        } else { // return yelllow if have overdue backups
          return <div className="w-3 h-3 bg-yellow-500 rounded-full" />;
        }
      case 'Warning':
          return <div className="w-3 h-3 bg-yellow-500 rounded-full" />;
      case 'Error':
      case 'Fatal':
        return <div className="w-3 h-3 bg-red-500 rounded-full" />;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="flex items-center gap-1">
      {getStatusIcon(status)}
    </div>
  );
}

// Component for backup status bar using narrow rectangular blocks
function BackupStatusBar({ statusHistory }: { statusHistory: BackupStatus[] }) {
  // Use the last 10 statuses for the status bar
  const recentStatuses = statusHistory.length <= 10 ? statusHistory : statusHistory.slice(-10);
  
  return (
    <div className="flex gap-0.5">
      {/* Fill remaining slots if less than 10 statuses */}
      {Array.from({ length: Math.max(0, 10 - recentStatuses.length) }, (_, index) => (
        <div
          key={`empty-${index}`}
          className="w-1 h-3 border border-gray-700 rounded-sm bg-transparent"
        />
      ))}
      {recentStatuses.map((status, index) => {
        const statusColor = getStatusColor(status);  
        return (
          <div 
            key={index} 
            className={`w-1 h-3 ${statusColor} rounded-sm`}
          />
        );
      })}
    </div>
  );
}

interface ServerCardProps {
  server: ServerSummary;
  isSelected: boolean;
  onSelect: (serverId: string) => void;
}

const ServerCard = ({ server, isSelected, onSelect }: ServerCardProps) => {
  const serverStatus = getServerStatus(server);
  const router = useRouter();

  const handleCardClick = () => {
    onSelect(server.id);
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg h-full flex flex-col ${
        isSelected 
          ? 'border-2 border-primary bg-primary/5 shadow-lg' 
          : 'hover:bg-muted/50'
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-1 pt-1 px-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold flex items-center flex-1">
            <ServerConfigurationButton className="h-8 w-8 flex-shrink-0" variant="ghost" serverUrl={server.server_url} serverName={server.name} serverAlias={server.alias} showText={false}  />
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/detail/${server.id}`);
              }}
              className="flex items-center hover:text-blue-600 transition-colors duration-200 cursor-pointer"
              title={server.alias ? server.name : undefined}
            >
              {server.alias || server.name}
            </button>
          </CardTitle>
          <div className="flex items-center flex-shrink-0">
            <CompactStatusBadge 
              status={serverStatus} 
              haveOverdueBackups={server.haveOverdueBackups}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 px-3 pb-3 flex-1 flex flex-col">
        {/* Summary Information - Compact */}
        <div className="grid grid-cols-4 gap-2 text-xs flex-shrink-0 text-center">
          <section>
            <p className="text-muted-foreground text-xs">Files</p>
            <p className="font-semibold text-sm">
              {server.totalFileCount > 0 ? server.totalFileCount.toLocaleString() : 'N/A'}
            </p>
          </section>
          <section>
            <p className="text-muted-foreground text-xs">Size</p>
            <p className="font-semibold text-xs">
              {server.totalFileSize > 0 ? formatBytes(server.totalFileSize) : 'N/A'}
            </p>
          </section>
          <section>
            <p className="text-muted-foreground text-xs">Storage</p>
            <p className="font-semibold text-sm">
              {server.totalStorageSize > 0 ? formatBytes(server.totalStorageSize) : 'N/A'}
            </p>
          </section>
          <section>
            <p className="text-muted-foreground text-xs">Last</p>
            <div className="font-semibold text-xs">
              {server.lastBackupDate !== "N/A" ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">{formatTimeAgo(server.lastBackupDate)}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {new Date(server.lastBackupDate).toLocaleString()}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                "N/A"
              )}
            </div>
          </section>
        </div>

        {/* Backup List - Each backup type on its own row */}
        <section className="space-y-0.5 flex-1 flex flex-col mt-auto">
          <h3 className="text-xs text-muted-foreground font-medium">Backups:</h3>
          {server.backupInfo.length > 0 ? (
            <div className="flex-1 flex flex-col divide-y divide-border/30">
              {server.backupInfo.map((backupType, index) => (
                <Tooltip key={index} delayDuration={1000}>
                  <TooltipTrigger asChild>
                      <div 
                        className="grid grid-cols-[45%_25%_30%] cursor-pointer hover:bg-muted/30 transition-colors duration-200 rounded px-1 -mx-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/detail/${server.id}?backup=${encodeURIComponent(backupType.name)}`);
                        }}
                      >
                        {/* Backup type name */}
                        <div className="text-left text-xs truncate">
                          {backupType.name}
                        </div>
                        {/* Status bar using actual backup history */}
                        <div className="flex justify-center items-center">
                          <BackupStatusBar statusHistory={backupType.statusHistory} />
                        </div>

                        {/* Overdue icon and time ago */}
                        <div className="flex items-center gap-1 justify-end">
                          
                          {/* Overdue icon */}
                          {backupType.isBackupOverdue && (
                            <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                          )}

                          {/* Time ago - use backup type's last backup date */}
                          <span className="text-muted-foreground text-xs truncate">
                            {backupType.lastBackupDate !== "N/A" 
                              ? formatShortTimeAgo(backupType.lastBackupDate)
                              : "N/A"}
                          </span>

                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="bottom" 
                      align="start"
                      sideOffset={8}
                      avoidCollisions={true}
                      collisionPadding={24}
                      className="cursor-default space-y-3 min-w-[300px] max-w-[400px] z-[9999]"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Close the tooltip by clicking outside
                        const tooltip = e.currentTarget.closest('[data-radix-tooltip-content]');
                        if (tooltip) {
                          tooltip.remove();
                        }
                      }}
                      onPointerDownOutside={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <div className="font-bold text-sm text-left flex items-center justify-between">
                        <span>{server.alias || server.name} : {backupType.name}</span>
                        {backupType.notificationEvent && (
                          <div className="inline-block mr-2">
                            {getNotificationIcon(backupType.notificationEvent as NotificationEvent)}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground text-left -mt-3">
                        {server.note || `(${server.id})`}
                      </div>

                      <div className="space-y-2 border-t pt-3">
                        <div className="text-bold mb-4">Last Backup Details</div>
                        
                        <div className="grid grid-cols-[65%_35%] gap-x-3 gap-y-2 text-xs">
                          <div>
                            <div className="text-muted-foreground text-left mb-1">Date:</div>
                            <div className="font-semibold text-left">
                              {backupType.lastBackupDate !== "N/A" 
                                ? new Date(backupType.lastBackupDate).toLocaleString() + " (" + formatTimeAgo(backupType.lastBackupDate) + ")"
                                : "N/A"}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-muted-foreground text-left mb-1">Status:</div>
                            <div className="font-semibold text-left">
                              {backupType.lastBackupStatus !== "N/A" 
                                ? backupType.lastBackupStatus
                                : "N/A"}
                            </div>
                          </div>

                          <div>
                            <div className="text-muted-foreground text-left mb-1">Duration:</div>
                            <div className="font-semibold text-left">
                              {backupType.lastBackupDuration !== null && backupType.lastBackupDuration !== undefined
                                ? backupType.lastBackupDuration
                                : "N/A"}
                            </div>
                          </div>
                                                    
                          <div>
                            <div className="text-muted-foreground text-left mb-1">Files:</div>
                            <div className="font-semibold text-left">
                              {backupType.fileCount !== null && backupType.fileCount !== undefined
                                ? backupType.fileCount.toLocaleString()
                                : "N/A"}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-muted-foreground text-left mb-1">Size:</div>
                            <div className="font-semibold text-left">
                              {backupType.fileSize !== null && backupType.fileSize !== undefined
                                ? formatBytes(backupType.fileSize)
                                : "N/A"}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-muted-foreground text-left mb-1">Storage:</div>
                            <div className="font-semibold text-left">
                              {backupType.storageSize !== null && backupType.storageSize !== undefined
                                ? formatBytes(backupType.storageSize)
                                : "N/A"}
                            </div>
                          </div>

                          <div>
                            <div className="text-muted-foreground text-left mb-1">Uploaded:</div>
                            <div className="font-semibold text-left">
                              {backupType.uploadedSize !== null && backupType.uploadedSize !== undefined
                                ? formatBytes(backupType.uploadedSize)
                                : "N/A"}
                            </div>
                          </div>

                          <div>
                            <div className="text-muted-foreground text-left mb-1">Versions:</div>
                            <div className="font-semibold text-left">
                              {backupType.lastBackupListCount !== null && backupType.lastBackupListCount !== undefined
                                ? backupType.lastBackupListCount.toLocaleString()
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                        
                      {/* Overdue information section */}
                      {backupType.isBackupOverdue && (
                        <div className="border-t pt-3 space-y-3">
                          <div className="font-semibold text-sm text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Backup Overdue
                          </div>
                          
                          <div className="grid grid-cols-[80px_1fr] gap-x-3 text-xs">
                            <div className="text-muted-foreground text-right">Expected:</div>
                            <div className="font-semibold text-left">
                              {backupType.expectedBackupDate !== "N/A" 
                                ? new Date(backupType.expectedBackupDate).toLocaleString() + " (" + formatTimeAgo(backupType.expectedBackupDate) + ")"
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
                              serverUrl={server.server_url}
                              serverName={server.name}
                              serverAlias={server.alias}
                              showText={true} 
                            />
                          </div>
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic">No backup types available</div>
          )}
        </section>
      </CardContent>
    </Card>
  );
};

interface ServerCardsProps {
  servers: ServerSummary[];
  selectedServerId?: string | null;
  onSelect: (serverId: string | null) => void;
  visibleCardIndex?: number;
  onVisibleCardIndexChange?: (index: number) => void;
}

export const ServerCards = memo(function ServerCards({ servers, selectedServerId, onSelect, visibleCardIndex = 0, onVisibleCardIndexChange }: ServerCardsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isInitialMount = useRef(true);
  const previousServersRef = useRef<string>('');
  const previousSortOrderRef = useRef<string>('');
  const isSortOrderChanging = useRef(false); // New ref to track sort order change
  const isScrollingRef = useRef(false); // Track if user is actively scrolling
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Timeout for scroll end detection
  const isButtonScrollingRef = useRef(false); // Track if button scroll is in progress

  const { dashboardCardsSortOrder } = useConfig();

  // Move getContainerPadding function here - inside the component
  const getContainerPadding = useCallback((container: HTMLElement) => {
    const computedStyle = window.getComputedStyle(container);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
    return paddingLeft + paddingRight;
  }, []);

  // Remove duplicates by server ID, sort based on configuration, and memoize to prevent unnecessary re-renders
  const uniqueServers = useMemo(() => {
    const filtered = servers.filter((server, index, self) => 
      index === self.findIndex(s => s.id === server.id)
    );
    
    // Sort based on dashboardCardsSortOrder configuration
    return [...filtered].sort((a, b) => {
      switch (dashboardCardsSortOrder) {
        case 'Server name (a-z)':
          // Use alias with fallback to name for sorting
          const aDisplayName = a.alias || a.name;
          const bDisplayName = b.alias || b.name;
          return aDisplayName.localeCompare(bDisplayName);
        
        case 'Status (error>warnings>success)':
          const aStatus = getServerStatus(a);
          const bStatus = getServerStatus(b);
          // First sort by status, then by server alias/name within the same status
          const statusComparison = getStatusSortValue(aStatus) - getStatusSortValue(bStatus);
          if (statusComparison !== 0) {
            return statusComparison;
          }
          // If status is the same, sort alphabetically by server alias/name
          const aDisplayNameStatus = a.alias || a.name;
          const bDisplayNameStatus = b.alias || b.name;
          return aDisplayNameStatus.localeCompare(bDisplayNameStatus);
        
        case 'Last backup received (new>old)':
          // Handle "N/A" dates by putting them at the end
          if (a.lastBackupDate === "N/A" && b.lastBackupDate === "N/A") return 0;
          if (a.lastBackupDate === "N/A") return 1;
          if (b.lastBackupDate === "N/A") return -1;
          // Sort by newest first (descending)
          return new Date(b.lastBackupDate).getTime() - new Date(a.lastBackupDate).getTime();
        
        default:
          return 0;
      }
    });
  }, [servers, dashboardCardsSortOrder]);

  // State for calculated cards to show - initialized with fallback
  const [calculatedCardsToShow, setCalculatedCardsToShow] = useState(() => Math.min(uniqueServers.length, 5));
  
  // State for card width - initialized with fallback
  const [cardWidth, setCardWidth] = useState(MIN_CARD_WIDTH);

  // Calculate how many cards can fit with min/max width constraints
  const calculateCardsToShow = useCallback(() => {
    if (!scrollContainerRef.current) {
      return Math.min(uniqueServers.length, 5); // fallback
    }
    
    const containerWidth = scrollContainerRef.current.clientWidth;
    const containerPadding = getContainerPadding(scrollContainerRef.current);
    const availableWidth = containerWidth - containerPadding;
    
    // Calculate max cards that can fit with minimum width
    const maxCardsWithMinWidth = Math.floor((availableWidth + CARD_GAP - CARD_WIDTH_SHOW_PARTIAL) / (MIN_CARD_WIDTH + CARD_GAP));
        
    // Use the smaller of the two, but ensure we don't exceed available servers
    const calculatedCardsToShow = Math.min(uniqueServers.length,maxCardsWithMinWidth);

    return calculatedCardsToShow;
  }, [uniqueServers.length, getContainerPadding]);

  // Calculate cards to show after component mounts and when dependencies change
  useEffect(() => {
    const newCardsToShow = calculateCardsToShow();
    setCalculatedCardsToShow(newCardsToShow);
  }, [calculateCardsToShow]);
  
  // Calculate the optimal card width respecting MIN_CARD_WIDTH and MAX_CARD_WIDTH limits
  const calculateCardWidth = useCallback(() => {
    if (!scrollContainerRef.current || calculatedCardsToShow === 0) {
      return MIN_CARD_WIDTH;
    }
    
    const containerWidth = scrollContainerRef.current.clientWidth;
    const containerPadding = getContainerPadding(scrollContainerRef.current);
    const availableWidth = containerWidth - containerPadding - CARD_WIDTH_SHOW_PARTIAL;
    const totalGaps = CARD_GAP * (calculatedCardsToShow - 1);
    const idealCardWidth = (availableWidth - totalGaps) / calculatedCardsToShow;
    
    // Clamp the width between MIN_CARD_WIDTH and MAX_CARD_WIDTH
    const clampedCardWidth = Math.max(MIN_CARD_WIDTH, Math.min(MAX_CARD_WIDTH, idealCardWidth));
    
    return Math.floor(clampedCardWidth);
  }, [calculatedCardsToShow, getContainerPadding]);

  // Calculate card width after component mounts and when dependencies change
  useEffect(() => {
    const newCardWidth = calculateCardWidth();
    setCardWidth(newCardWidth);
  }, [calculateCardWidth]);

  // Calculate visible card index from scroll position
  const getVisibleCardIndex = useCallback(() => {
    if (!scrollContainerRef.current) {
      return 0;
    }
    
    const container = scrollContainerRef.current;
    const cardWidthWithGap = cardWidth + CARD_GAP;
    
    // Use Math.floor instead of Math.round to prevent oscillation
    // This ensures we always snap to the card that's most visible
    const rawIndex = container.scrollLeft / cardWidthWithGap;
    
    // Add a threshold to prevent oscillation when scroll position is very close to card boundaries
    const threshold = 0.3; // 30% of card width
    const fractionalPart = rawIndex - Math.floor(rawIndex);
    
    let result;
    if (fractionalPart < threshold) {
      result = Math.floor(rawIndex);
    } else if (fractionalPart > (1 - threshold)) {
      result = Math.ceil(rawIndex);
    } else {
      result = Math.floor(rawIndex);
    }
    
    return result;
  }, [cardWidth]);

  // Scroll to specific card index
  const scrollToCardIndex = useCallback((index: number, smooth = true) => {
    if (!scrollContainerRef.current) {
      return;
    }
    
    const container = scrollContainerRef.current;
    const cardWidthWithGap = cardWidth + CARD_GAP;
    
    const targetScroll = index * cardWidthWithGap;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const clampedScroll = Math.max(0, Math.min(targetScroll, maxScroll));
    
    // Use requestAnimationFrame for smoother animation on button clicks
    if (smooth) {
      requestAnimationFrame(() => {
        container.scrollTo({
          left: clampedScroll,
          behavior: 'smooth'
        });
      });
    } else {
      container.scrollTo({
        left: clampedScroll,
        behavior: 'auto'
      });
    }
  }, [cardWidth]);

  // Scroll left or right by one card
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollContainerRef.current || isButtonScrollingRef.current) {
      return;
    }
    
    // Use getVisibleCardIndex for consistent index calculation
    // This ensures the scroll logic matches the visual state
    const currentIndex = getVisibleCardIndex();
    
    const maxIndex = Math.max(0, uniqueServers.length - calculatedCardsToShow);
    
    let newIndex;
    if (direction === 'left') {
      newIndex = Math.max(0, currentIndex - 1);
    } else {
      newIndex = Math.min(maxIndex, currentIndex + 1);
    }
    
    // Only scroll if we're actually moving to a different index
    if (newIndex !== currentIndex) {
      isButtonScrollingRef.current = true;
      scrollToCardIndex(newIndex);
      
      // Reset button scrolling flag after animation completes
      setTimeout(() => {
        isButtonScrollingRef.current = false;
      }, 500); // Match the smooth scroll duration
    }
  }, [getVisibleCardIndex, scrollToCardIndex, uniqueServers.length, calculatedCardsToShow]);

  // Update scroll buttons and track visible card index
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const updateScrollButtons = () => {
        const currentIndex = getVisibleCardIndex();
        const maxIndex = Math.max(0, uniqueServers.length - calculatedCardsToShow);
        setCanScrollLeft(currentIndex > 0);
        setCanScrollRight(currentIndex < maxIndex);
      };

      const handleScroll = () => {
        // Mark that user is actively scrolling
        isScrollingRef.current = true;
        
        // Clear any existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        // Update scroll buttons based on card index
        updateScrollButtons();
        
        // Set timeout to detect when scrolling ends
        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
          
          // Only update visible card index when scrolling has stopped
          // This prevents oscillation during touch scrolling
          if (!isInitialMount.current && onVisibleCardIndexChange) {
            const currentIndex = getVisibleCardIndex();
            onVisibleCardIndexChange(currentIndex);
          }
        }, 150); // 150ms delay to detect scroll end
      };
      
      // Add touch-specific event listeners for better touch handling
      const handleTouchStart = () => {
        isScrollingRef.current = true;
      };
      
      const handleTouchEnd = () => {
        // Clear timeout and set a shorter one for touch end
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
          
          // Update visible card index after touch scrolling ends
          if (!isInitialMount.current && onVisibleCardIndexChange) {
            const currentIndex = getVisibleCardIndex();
            onVisibleCardIndexChange(currentIndex);
          }
        }, 100); // Shorter delay for touch end
      };
      
      container.addEventListener('scroll', handleScroll);
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchend', handleTouchEnd);
      
      // Initial check for buttons only (don't save index)
      updateScrollButtons();
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [getVisibleCardIndex, onVisibleCardIndexChange, uniqueServers.length, calculatedCardsToShow]);

  // Update scroll buttons when servers change and restore card position
  useEffect(() => {
    // Create a hash of the current servers data to detect real changes
    const currentServersHash = uniqueServers.map(s => s.id).join(',');
    
    // Use a small delay to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      // Update scroll buttons based on card index
      const currentIndex = getVisibleCardIndex();
      const maxIndex = Math.max(0, uniqueServers.length - calculatedCardsToShow);
      setCanScrollLeft(currentIndex > 0);
      setCanScrollRight(currentIndex < maxIndex);
      
      // Only restore card position if servers actually changed (not just reordered)
      // and this is not the initial mount, and we're not in the middle of a sort order change
      if (!isInitialMount.current && 
          visibleCardIndex > 0 && 
          currentServersHash !== previousServersRef.current &&
          !isSortOrderChanging.current) {
        scrollToCardIndex(visibleCardIndex, false); // No smooth scroll for restoration
      }
    }, 100);
    
    // Update the previous servers hash
    previousServersRef.current = currentServersHash;
    
    return () => clearTimeout(timeoutId);
  }, [uniqueServers, visibleCardIndex, scrollToCardIndex, getVisibleCardIndex, calculatedCardsToShow]);

  // Restore card position on mount and mark initial mount as complete
  useEffect(() => {
    // Use a small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
      // Restore card position on mount if we have a saved index
      if (visibleCardIndex > 0) {
        scrollToCardIndex(visibleCardIndex, false); // No smooth scroll for restoration
      }
      // Mark initial mount as complete AFTER restoration
      isInitialMount.current = false;
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [visibleCardIndex, scrollToCardIndex]);

  // Reset scroll position to first position when sort order changes
  useEffect(() => {
    // Only reset scroll if sort order actually changed (not on every render)
    if (!isInitialMount.current && 
        previousSortOrderRef.current !== '' && 
        previousSortOrderRef.current !== dashboardCardsSortOrder &&
        scrollContainerRef.current) {
   
      // Set flag to prevent position restoration from interfering
      isSortOrderChanging.current = true;
      
      // Use a delay to ensure DOM is updated with new sort order
      const timeoutId = setTimeout(() => {
        if (scrollContainerRef.current) {
          // Reset scroll to the beginning when sort order changes
          scrollContainerRef.current.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
          
          // Update scroll button states
          setCanScrollLeft(false);
          setCanScrollRight(uniqueServers.length > calculatedCardsToShow);
          
          // Reset visible card index if callback is provided
          if (onVisibleCardIndexChange) {
            onVisibleCardIndexChange(0);
          }
          
          // Clear the flag after a delay to allow scroll to complete
          setTimeout(() => {
            isSortOrderChanging.current = false;
          }, 500);
        }
      }, 150); // Delay to ensure DOM is updated
      
      return () => clearTimeout(timeoutId);
    }
    
    // Update the previous sort order ref
    previousSortOrderRef.current = dashboardCardsSortOrder;
  }, [dashboardCardsSortOrder, uniqueServers.length, onVisibleCardIndexChange, calculatedCardsToShow]);

  // Handle window resize to recalculate cards
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      // Debounce resize events to prevent excessive recalculations
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Recalculate cards to show and card width on resize
        const newCardsToShow = calculateCardsToShow();
        const newCardWidth = calculateCardWidth();
        setCalculatedCardsToShow(newCardsToShow);
        setCardWidth(newCardWidth);
      }, 150); // 150ms debounce delay
    };

    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [calculateCardsToShow, calculateCardWidth]);

  // Show message if no servers
  if (uniqueServers.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <HardDrive className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-muted-foreground">No servers found</h3>
            <p className="text-sm text-muted-foreground">
              Collect data for your first server by clicking on{" "}
              <span className="inline-flex items-center">
                <Download className="inline w-4 h-4 mx-1" aria-label="Download" />
              </span>{" "}
              (Collect backups logs) in the toolbar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative group">
        {/* Left Arrow */}
        {canScrollLeft && (
          <Button
            variant="outline"
            size="icon"
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-black-100 backdrop-blur-sm border-white-500 text-blue-600 shadow-lg hover:bg-blue-900 hover:border-blue-600 transition-all duration-200"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <Button
            variant="outline"
            size="icon"
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-black-100 backdrop-blur-sm border-white-500 text-blue-600 shadow-lg hover:bg-blue-900 hover:border-blue-600 transition-all duration-200"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Scrollable Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scroll-smooth items-stretch server-cards-scrollbar"
        >
          {uniqueServers.map((server) => {
            return (
              <div key={server.id} className="flex-shrink-0" style={{ width: `${cardWidth}px`, minHeight: '170px' }} data-card>
                <ServerCard
                  server={server}
                  isSelected={selectedServerId === server.id}
                  onSelect={onSelect}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if there are actual changes in the data we care about
  
  // Check if servers data changed (deep comparison of essential fields)
  if (prevProps.servers.length !== nextProps.servers.length) return false;
  
  const serversEqual = prevProps.servers.every((server, index) => {
    const nextServer = nextProps.servers[index];
    return server.id === nextServer.id &&
           server.name === nextServer.name &&
           server.lastBackupStatus === nextServer.lastBackupStatus &&
           server.lastBackupDate === nextServer.lastBackupDate &&
           server.totalBackupCount === nextServer.totalBackupCount &&
           server.backupInfo.length === nextServer.backupInfo.length &&
           JSON.stringify(server.backupInfo) === JSON.stringify(nextServer.backupInfo);
  });
  
  // Check other props
  const otherPropsEqual = prevProps.selectedServerId === nextProps.selectedServerId &&
                         prevProps.visibleCardIndex === nextProps.visibleCardIndex;
  
  return serversEqual && otherPropsEqual;
});
