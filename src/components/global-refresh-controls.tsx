"use client";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { useGlobalRefresh } from "@/contexts/global-refresh-context";
import { useConfig } from "@/contexts/config-context";
import { useToast } from "@/components/ui/use-toast";
import { usePathname } from "next/navigation";
// Helper function to remove locale prefix from pathname (e.g., /en/detail/123 -> /detail/123)
function removeLocalePrefix(pathname: string | null): string {
  if (!pathname) return '/';
  // Match locale prefix pattern: /en, /de, /fr, /es, /pt-BR
  const localePattern = /^\/(en|de|fr|es|pt-BR)(\/|$)/;
  return pathname.replace(localePattern, '/') || '/';
}

interface AutoRefreshButtonProps {
  className?: string;
  isEnabled: boolean;
  interval: number;
  onToggle: () => void;
  progress: number;
  isLoading?: boolean;
}

const AutoRefreshButton = ({ className, isEnabled, interval, onToggle, progress, isLoading = false }: AutoRefreshButtonProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  // Handle right-click to open settings page on display tab
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/settings?tab=display`);
  };

  // Format interval text
  const getIntervalText = () => {
    if (interval < 1) {
      const seconds = interval * 60;
      return `${seconds} ${t("sec")}`;
    }
    return `${interval} ${t("min")}`;
  };

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
        onContextMenu={handleContextMenu}
        title={isEnabled ? t("Disable auto-refresh (Right-click for Display Settings)") : t("Enable auto-refresh (Right-click for Display Settings)")}
      >
        {!isEnabled ? (
          t("Auto-refresh (disabled)")
        ) : isLoading ? (
          t("Auto-refresh (loading)")
        ) : (
          t("Auto-refresh ({{interval}})", { interval: getIntervalText() })
        )}
      </button>
    </div>
  );
};

export function GlobalRefreshControls() {
  const { t } = useTranslation();
  const { state, refreshDashboard, refreshDetail, toggleAutoRefresh, getCurrentPageType } = useGlobalRefresh();
  const { autoRefreshInterval } = useConfig();
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
        const pathWithoutLocale = removeLocalePrefix(pathname);
        const match = pathWithoutLocale.match(/^\/detail\/([^\/]+)$/);
        if (match) {
          await refreshDetail(match[1]);
        }
      }
    } catch (error) {
      console.error('Refresh failed:', error);
      toast({
        title: t("Refresh Failed"),
        description: t("Failed to refresh data. Please try again."),
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
    <div className="flex items-center border rounded-md" data-screenshot-target="auto-refresh-controls">
      {/* Manual refresh button */}
      <button
        onClick={handleManualRefresh}
        disabled={isLoading}
        title={t("Refresh now")}
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
        isLoading={isLoading}
      />
    </div>
  );
} 