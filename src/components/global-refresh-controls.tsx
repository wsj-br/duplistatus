"use client";

import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { useGlobalRefresh } from '@/contexts/global-refresh-context';
import { useConfig } from '@/contexts/config-context';
import { useToast } from '@/components/ui/use-toast';
import { usePathname } from 'next/navigation';

interface AutoRefreshButtonProps {
  className?: string;
  isEnabled: boolean;
  interval: number;
  onToggle: () => void;
  progress: number;
  isLoading?: boolean;
}

const AutoRefreshButton = ({ className, isEnabled, interval, onToggle, progress, isLoading = false }: AutoRefreshButtonProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Progress background - only show when enabled */}
      <div 
        className="absolute inset-0 bg-blue-600 transition-all duration-1000 ease-linear"
        style={{ 
          width: isEnabled ? `${progress}%` : '0%',
          opacity: 0.3,
          borderRadius: 'inherit'
        }}
      />
      
      {/* Button content */}
      <button 
        className={`relative h-[38px] px-3 rounded-md text-sm transition-colors flex items-center gap-1 w-full ${
          isEnabled 
            ? 'text-blue-400 hover:text-blue-300' 
            : 'text-gray-500 hover:text-gray-400'
        }`}
        onClick={onToggle}
        title={isEnabled ? "Disable auto-refresh" : "Enable auto-refresh"}
      >
        {isLoading ? (
          'Auto-refresh'
        ) : (
          `Auto-refresh (${interval < 1 ? `${interval * 60} sec` : `${interval} min`})`
        )}
      </button>
    </div>
  );
};

export function GlobalRefreshControls() {
  const { state, refreshDashboard, refreshDetail, toggleAutoRefresh, getCurrentPageType } = useGlobalRefresh();
  const { autoRefreshInterval, isLoading: configLoading } = useConfig();
  const { toast } = useToast();
  const pathname = usePathname();
  
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(autoRefreshInterval * 60); // Convert minutes to seconds

  // Calculate progress based on time remaining
  useEffect(() => {
    if (!state.isEnabled) {
      setProgress(0);
      return;
    }

    const totalSeconds = state.interval * 60;
    const progressPercent = ((totalSeconds - timeRemaining) / totalSeconds) * 100;
    setProgress(progressPercent);
  }, [timeRemaining, state.isEnabled, state.interval]);

  // Reset timer when pathname changes (page navigation)
  useEffect(() => {
    if (state.isEnabled) {
      setTimeRemaining(state.interval * 60);
      setProgress(0);
    }
  }, [pathname, state.isEnabled, state.interval]);

  // Progress timer
  useEffect(() => {
    if (!state.isEnabled) return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Reset when reaching 0
          setProgress(0);
          return state.interval * 60;
        }
        
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [state.isEnabled, state.interval]);

  // Reset timer when refresh happens
  useEffect(() => {
    if (state.lastRefresh) {
      setTimeRemaining(state.interval * 60);
    }
  }, [state.lastRefresh, state.interval]);

  const handleManualRefresh = async () => {
    const currentPage = getCurrentPageType();
    
    try {
      if (currentPage === 'dashboard') {
        await refreshDashboard();
      } else if (currentPage === 'detail') {
        // Only match main detail pages, not backup detail pages
        const match = pathname.match(/^\/detail\/([^\/]+)$/);
        if (match) {
          await refreshDetail(match[1]);
        }
      }
    } catch (error) {
      console.error('Refresh failed:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleToggleAutoRefresh = () => {
    toggleAutoRefresh();
  };

  // Only show on dashboard and detail pages
  // Check if pathname is available and determine page type
  if (!pathname) {
    return null;
  }
  
  const currentPage = getCurrentPageType();
  if (currentPage === 'none') {
    return null;
  }

  const isLoading = state.pageSpecificLoading.dashboard || state.pageSpecificLoading.detail;

  return (
    <div className="flex items-center border rounded-md">
      {/* Manual refresh button */}
      <button
        onClick={handleManualRefresh}
        disabled={isLoading}
        title="Refresh now"
        className="h-[38px] px-3 rounded-md text-sm transition-colors flex items-center justify-center bg-background hover:bg-accent hover:text-accent-foreground rounded-r-none border-r-0 disabled:pointer-events-none disabled:opacity-50"
      >
        {isLoading ? (
          <RotateCcw className="h-4 w-4 animate-spin" />
        ) : (
          <RotateCcw className="h-4 w-4" />
        )}
      </button>
      
      {/* Auto-refresh button with progress */}
      <AutoRefreshButton
        className="rounded-l-none overflow-hidden"
        isEnabled={state.isEnabled}
        interval={state.interval}
        onToggle={handleToggleAutoRefresh}
        progress={progress}
        isLoading={configLoading}
      />
    </div>
  );
} 