"use client";

import { useState, useRef, useCallback, useEffect, useMemo, memo } from 'react';
import type { BackupStatus, MachineCardData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { formatTimeAgo, formatBytes } from "@/lib/utils";
import { HardDrive, AlertTriangle, Settings, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";




interface MachineCardProps {
  machine: MachineCardData;
  isSelected: boolean;
  onSelect: (machineId: string) => void;
}

// Helper function to get overall machine status
function getMachineStatus(machine: MachineCardData): BackupStatus {
  if (machine.lastBackupStatus === 'Error' || machine.lastBackupStatus === 'Fatal') {
    return 'Error';
  }
  // Check if any backup type is overdue
  const hasOverdueBackup = machine.backupTypes.some(backupType => backupType.isBackupOverdue);
  if (machine.lastBackupStatus === 'Warning' || hasOverdueBackup) {
    return 'Warning';
  }
  if (machine.lastBackupStatus === 'Success') {
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

// Custom status badge without text, just icon and color
function CompactStatusBadge({ status }: { status: BackupStatus }) {
  const getStatusIcon = (status: BackupStatus) => {
    switch (status) {
      case 'Success':
        return <div className="w-3 h-3 bg-green-500 rounded-full" />;
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
      {recentStatuses.map((status, index) => {
        const statusColor = getStatusColor(status);
        return (
          <div 
            key={index} 
            className={`w-1 h-3 ${statusColor} rounded-sm`}
            title={`Backup ${index + 1}: ${status}`}
          />
        );
      })}
      {/* Fill remaining slots if less than 10 statuses */}
      {Array.from({ length: Math.max(0, 10 - recentStatuses.length) }, (_, index) => (
        <div 
          key={`empty-${index}`} 
          className="w-1 h-3 bg-gray-300 rounded-sm"
          title="No backup data"
        />
      ))}
    </div>
  );
}

const MachineCard = ({ machine, isSelected, onSelect }: MachineCardProps) => {
  const machineStatus = getMachineStatus(machine);
  const router = useRouter();

  const handleCardClick = () => {
    onSelect(machine.id);
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
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/detail/${machine.id}`);
              }}
              className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
            >
              <HardDrive className="h-4 w-4 text-blue-600" />
              {machine.name}
            </button>
          </CardTitle>
          <div className="flex items-center gap-2">
            <CompactStatusBadge status={machineStatus} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 flex-1 flex flex-col">
        {/* Summary Information - Compact */}
        <div className="grid grid-cols-4 gap-2 text-xs flex-shrink-0">
          <div className="text-center">
            <div className="text-muted-foreground text-xs">Backups</div>
            <div className="font-semibold text-sm">{machine.totalBackupCount}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-xs">Files</div>
            <div className="font-semibold text-sm">
              {machine.backupTypes.length > 0 ? machine.backupTypes[0].fileCount : 'N/A'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-xs">Size</div>
            <div className="font-semibold text-xs">
              {machine.backupTypes.length > 0 ? formatBytes(machine.backupTypes[0].fileSize) : 'N/A'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground text-xs">Last</div>
            <div className="font-semibold text-xs">
              {machine.lastBackupDate !== "N/A" 
                ? formatTimeAgo(machine.lastBackupDate)
                : "N/A"}
            </div>
          </div>
        </div>

        {/* Backup List - Each backup type on its own row */}
        <div className="space-y-1 flex-1 flex flex-col">
          <div className="text-xs text-muted-foreground font-medium flex-shrink-0">Backup Types:</div>
          <div className="flex-1 space-y-1">
            {machine.backupTypes.length > 0 ? (
              machine.backupTypes.map((backupType, index) => (
                <div 
                  key={index} 
                  className="space-y-1 py-1 border-b border-border/30 last:border-b-0 cursor-pointer hover:bg-muted/30 transition-colors duration-200 rounded px-2 -mx-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/detail/${machine.id}?backup=${encodeURIComponent(backupType.name)}`);
                  }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{backupType.name}</span>
                    <div className="flex items-center gap-2">
                      {/* Status bar using actual backup history */}
                      <BackupStatusBar statusHistory={backupType.statusHistory} />
                      {/* Overdue icon - positioned between status bars and timeago */}
                      {backupType.isBackupOverdue && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <div><span>Checked:</span> <span className="text-muted-foreground">{backupType.lastOverdueCheck !== "N/A" ? new Date(backupType.lastOverdueCheck).toLocaleString() + " (" + formatTimeAgo(backupType.lastOverdueCheck) + ")" : "N/A"}</span></div>
                                <div><span>Last backup:</span> <span className="text-muted-foreground">{backupType.lastBackupDate !== "N/A" ? new Date(backupType.lastBackupDate).toLocaleString() + " (" + formatTimeAgo(backupType.lastBackupDate) + ")" : "N/A"}</span></div>
                                <div><span>Expected backup:</span> <span className="text-muted-foreground">{backupType.expectedBackupDate !== "N/A" ? new Date(backupType.expectedBackupDate).toLocaleString() + " (" + formatTimeAgo(backupType.expectedBackupDate) + ")" : "N/A"}</span></div>
                                <div><span>Last notification:</span> <span className="text-muted-foreground">{backupType.lastNotificationSent !== "N/A" ? new Date(backupType.lastNotificationSent).toLocaleString() + " (" + formatTimeAgo(backupType.lastNotificationSent) + ")" : "N/A"}</span></div>
                                <div className="pt-2 border-t">
                                  <button 
                                    className="text-xs cursor-pointer flex items-center"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push('/settings?tab=backups');
                                    }}
                                  >
                                  <Settings className="h-3 w-3 mr-1" /> Configure 
                                  </button>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {/* Time ago - use backup type's last backup date */}
                      <span className="text-muted-foreground text-xs min-w-[60px] text-right">
                        {backupType.lastBackupDate !== "N/A" 
                          ? formatTimeAgo(backupType.lastBackupDate)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground italic">No backup types available</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface MachineCardsProps {
  machines: MachineCardData[];
  selectedMachineId?: string | null;
  onSelect: (machineId: string | null) => void;
  visibleCardIndex?: number;
  onVisibleCardIndexChange?: (index: number) => void;
}

export const MachineCards = memo(function MachineCards({ machines, selectedMachineId, onSelect, visibleCardIndex = 0, onVisibleCardIndexChange }: MachineCardsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isInitialMount = useRef(true);
  const previousMachinesRef = useRef<string>('');

  // Remove duplicates by machine ID and memoize to prevent unnecessary re-renders
  const uniqueMachines = useMemo(() => 
    machines.filter((machine, index, self) => 
      index === self.findIndex(m => m.id === machine.id)
    ), [machines]
  );

  // Calculate card width to show exactly 6 cards (or fewer if less machines available)
  // Total available width: 100% - 16px (px-2) - 32px (p-4) = 100% - 48px
  // Gap between cards: 12px (gap-3 = 0.75rem = 12px)
  // Cards to show: min(uniqueMachines.length, 6)
  // Total gaps needed: cardsToShow - 1
  // Formula: (available width - total gaps) / cards to show
  const cardsToShow = Math.min(uniqueMachines.length, 6);
  const cardWidth = `calc((100% - 48px - 12px * ${cardsToShow - 1}) / ${cardsToShow})`; 
  
  // Calculate visible card index from scroll position
  const getVisibleCardIndex = useCallback(() => {
    if (!scrollContainerRef.current) return 0;
    
    const container = scrollContainerRef.current;
    const cardElement = container.querySelector('[data-card]') as HTMLElement;
    if (!cardElement) return 0;
    
    const cardWidth = cardElement.offsetWidth;
    const gap = 12; // gap-3 = 12px
    const cardWidthWithGap = cardWidth + gap;
    
    return Math.round(container.scrollLeft / cardWidthWithGap);
  }, []);

  // Scroll to specific card index
  const scrollToCardIndex = useCallback((index: number, smooth = true) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const cardElement = container.querySelector('[data-card]') as HTMLElement;
    if (!cardElement) return;
    
    const cardWidth = cardElement.offsetWidth;
    const gap = 12; // gap-3 = 12px
    const cardWidthWithGap = cardWidth + gap;
    
    const targetScroll = index * cardWidthWithGap;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const clampedScroll = Math.max(0, Math.min(targetScroll, maxScroll));
    
    container.scrollTo({
      left: clampedScroll,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, []);

  // Scroll left or right by one card
  const scroll = useCallback((direction: 'left' | 'right') => {
    const currentIndex = getVisibleCardIndex();
    const maxIndex = Math.max(0, uniqueMachines.length - 6); // -6 because we show 6 cards at once
    
    let newIndex;
    if (direction === 'left') {
      newIndex = Math.max(0, currentIndex - 1);
    } else {
      newIndex = Math.min(maxIndex, currentIndex + 1);
    }
    
    scrollToCardIndex(newIndex);
  }, [getVisibleCardIndex, scrollToCardIndex, uniqueMachines.length]);

  // Update scroll buttons and track visible card index
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const updateScrollButtons = () => {
        const currentIndex = getVisibleCardIndex();
        const maxIndex = Math.max(0, uniqueMachines.length - 6);
        setCanScrollLeft(currentIndex > 0);
        setCanScrollRight(currentIndex < maxIndex);
      };

      const handleScroll = () => {
        // Update scroll buttons based on card index
        updateScrollButtons();
        
        // Save visible card index if it's from actual user scrolling (not initial mount)
        if (!isInitialMount.current && onVisibleCardIndexChange) {
          const currentIndex = getVisibleCardIndex();
          onVisibleCardIndexChange(currentIndex);
        }
      };
      
      container.addEventListener('scroll', handleScroll);
      // Initial check for buttons only (don't save index)
      updateScrollButtons();
      
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [getVisibleCardIndex, onVisibleCardIndexChange, uniqueMachines.length]);

  // Update scroll buttons when machines change and restore card position
  useEffect(() => {
    // Create a hash of the current machines data to detect real changes
    const currentMachinesHash = uniqueMachines.map(m => m.id).join(',');
    
    // Use a small delay to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      // Update scroll buttons based on card index
      const currentIndex = getVisibleCardIndex();
      const maxIndex = Math.max(0, uniqueMachines.length - 6);
      setCanScrollLeft(currentIndex > 0);
      setCanScrollRight(currentIndex < maxIndex);
      
      // Restore card position if we have a saved index and this is not the initial mount
      if (!isInitialMount.current && visibleCardIndex > 0) {
        scrollToCardIndex(visibleCardIndex, false); // No smooth scroll for restoration
      }
    }, 100);
    
    // Update the previous machines hash
    previousMachinesRef.current = currentMachinesHash;
    
    return () => clearTimeout(timeoutId);
  }, [uniqueMachines, visibleCardIndex, scrollToCardIndex, getVisibleCardIndex]);

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

  // Show message if no machines
  if (uniqueMachines.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <HardDrive className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-muted-foreground">No machines found</h3>
            <p className="text-sm text-muted-foreground">
              Collect data for your first machine by clicking on{" "}
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
          className="flex gap-3 overflow-x-auto scroll-smooth items-stretch"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none'
          }}
        >
          {uniqueMachines.map((machine) => (
            <div key={machine.id} className="flex-shrink-0" style={{ width: cardWidth }} data-card>
              <MachineCard
                machine={machine}
                isSelected={selectedMachineId === machine.id}
                onSelect={onSelect}
              />
            </div>
          ))}
        </div>

        {/* Custom scrollbar styles */}
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if there are actual changes in the data we care about
  
  // Check if machines data changed (deep comparison of essential fields)
  if (prevProps.machines.length !== nextProps.machines.length) return false;
  
  const machinesEqual = prevProps.machines.every((machine, index) => {
    const nextMachine = nextProps.machines[index];
    return machine.id === nextMachine.id &&
           machine.name === nextMachine.name &&
           machine.lastBackupStatus === nextMachine.lastBackupStatus &&
           machine.lastBackupDate === nextMachine.lastBackupDate &&
           machine.totalBackupCount === nextMachine.totalBackupCount &&
           machine.backupTypes.length === nextMachine.backupTypes.length &&
           JSON.stringify(machine.backupTypes) === JSON.stringify(nextMachine.backupTypes);
  });
  
  // Check other props
  const otherPropsEqual = prevProps.selectedMachineId === nextProps.selectedMachineId &&
                         prevProps.visibleCardIndex === nextProps.visibleCardIndex;
  
  return machinesEqual && otherPropsEqual;
});
