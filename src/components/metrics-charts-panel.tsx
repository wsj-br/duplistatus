"use client";

import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { 
  Line, 
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes, formatDurationFromMinutes } from "@/lib/utils";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart"; 
import { FileBarChart2 } from "lucide-react";
import { useConfig } from "@/contexts/config-context";
import { subWeeks, subMonths, subQuarters, subYears } from "date-fns";
import type { ChartDataPoint } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { useGlobalRefresh } from "@/contexts/global-refresh-context";

// Interface for interpolated chart data points
interface InterpolatedChartPoint {
  date: string;
  isoDate: string;
  [key: string]: string | number;
}

interface MetricsChartsPanelProps {
  serverId?: string;
  backupName?: string;
  // Add chartData prop to receive data directly from parent
  chartData?: ChartDataPoint[];
}

// Use existing library function for duration formatting
const formatDuration = (minutes: number): string => {
  // Extract just HH:MM from the HH:MM:SS format for chart display
  const formatted = formatDurationFromMinutes(minutes);
  return formatted.split(':').slice(0, 2).join(':');
};

// Use existing library function for bytes formatting with Y-axis specific precision
const formatBytesForYAxis = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  // Determine the appropriate precision based on the size for Y-axis labels
  // For GB, use 1 decimal place; for others, use 0 decimal places
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  if (i >= sizes.length) return formatBytes(bytes, 1);
  
  const size = sizes[i];
  
  // Apply specific precision rules for Y-axis labels using the library function
  if (size === 'GB') {
    return formatBytes(bytes, 1);  // 1 decimal place for GB
  } else if (size === 'MB' || size === 'KB' || size === 'B') {
    return formatBytes(bytes, 0);  // 0 decimal places for MB, KB, B
  } else {
    return formatBytes(bytes, 1);  // 1 decimal place for TB+
  }
};

// Component to display refresh time that updates independently
function RefreshTimeDisplay() {
  const { state: globalRefreshState } = useGlobalRefresh();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only showing time after client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const refreshTime = globalRefreshState.lastRefresh || new Date();

  return (
    <div className="text-xs text-muted-foreground font-medium">
      last update: {mounted ? refreshTime.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) : '--:--:--'}
    </div>
  );
}

// Configuration for each chart type
const chartMetrics = [
  { 
    key: 'uploadedSize', 
    label: 'Uploaded Size', 
    formatter: formatBytes,
    color: "#3b82f6" // Blue
  },
  { 
    key: 'duration', 
    label: 'Duration', 
    formatter: formatDuration,
    color: "#10b981" // Green
  },
  { 
    key: 'fileCount', 
    label: 'File Count', 
    formatter: (v: number) => v.toLocaleString(),
    color: "#f59e0b" // Amber
  },
  { 
    key: 'fileSize', 
    label: 'File Size', 
    formatter: formatBytes,
    color: "#ef4444" // Red
  },
  { 
    key: 'storageSize', 
    label: 'Storage Size', 
    formatter: formatBytes,
    color: "#8b5cf6" // Purple
  },
  { 
    key: 'backupVersions', 
    label: 'Available Versions', 
    formatter: (v: number) => v.toLocaleString(),
    color: "#06b6d4" // Cyan
  }
];

// Custom tooltip component for Recharts
const CustomTooltip = ({ active, payload, label, metricKey }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload: { isoDate: string } }>;
  label?: string;
  metricKey: keyof ChartDataPoint;
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0];
  const value = data.value;
  
  // Format the date for display
  let formattedDate = label;
  try {
    if (data.payload?.isoDate) {
      const date = new Date(data.payload.isoDate);
      formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  } catch {
    // Fallback to original label if date parsing fails
  }
  
  // Format the value based on metric type
  let formattedValue: string;
  if (metricKey === 'uploadedSize' || metricKey === 'fileSize' || metricKey === 'storageSize') {
    formattedValue = formatBytesForYAxis(value);
  } else if (metricKey === 'duration') {
    formattedValue = formatDuration(value);
  } else {
    formattedValue = value.toLocaleString();
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {formattedDate}
      </div>
      <div className="text-sm text-gray-900 dark:text-gray-100">
        {formattedValue}
      </div>
    </div>
  );
};

function SmallMetricChart({ 
  data, 
  metricKey, 
  label, 
  color,
}: { 
  data: ChartDataPoint[]; 
  metricKey: keyof ChartDataPoint; 
  label: string; 
  color: string;
}) {

  // Create chart config
  const chartConfig = {
    [metricKey]: {
      label,
      color,
    },
  } as ChartConfig;
  
  // Prepare data for chart
  const chartReady = data.map(item => ({
    date: item.date,
    isoDate: item.isoDate,
    [metricKey]: item[metricKey]
  }));

  // Resample data for small charts using linear interpolation
  const maxPoints = 50;
  const resampledData = (() => {
    // Only resample if there are more than maxPoints in the data
    if (chartReady.length <= maxPoints) return chartReady;
    
    const resampledPoints: InterpolatedChartPoint[] = [];
    const sourceLength = chartReady.length;
    
    // Calculate the step size for interpolation
    const step = (sourceLength - 1) / (maxPoints - 1);
    
    for (let i = 0; i < maxPoints; i++) {
      const exactIndex = i * step;
      const lowerIndex = Math.floor(exactIndex);
      const upperIndex = Math.min(Math.ceil(exactIndex), sourceLength - 1);
      
      if (lowerIndex === upperIndex || exactIndex === lowerIndex) {
        // Exact match or at the end, use the data point directly
        const point = chartReady[lowerIndex];
        resampledPoints.push({
          date: point.date,
          isoDate: point.isoDate,
          [metricKey]: (point[metricKey] as number) || 0
        } as InterpolatedChartPoint);
      } else {
        // Interpolate between two points
        const lowerPoint = chartReady[lowerIndex];
        const upperPoint = chartReady[upperIndex];
        const fraction = exactIndex - lowerIndex;
        
        // Create interpolated point
        const interpolatedPoint: InterpolatedChartPoint = {
          date: lowerPoint.date, // Use the lower point's date for display
          isoDate: lowerPoint.isoDate
        };
        
        // Interpolate the metric value
        const lowerValue = lowerPoint[metricKey];
        const upperValue = upperPoint[metricKey];
        
        if (typeof lowerValue === 'number' && typeof upperValue === 'number') {
          (interpolatedPoint as Record<string, string | number>)[metricKey] = lowerValue + (upperValue - lowerValue) * fraction;
        } else if (typeof lowerValue === 'number') {
          (interpolatedPoint as Record<string, string | number>)[metricKey] = lowerValue; // Fallback to lower value
        } else {
          (interpolatedPoint as Record<string, string | number>)[metricKey] = 0; // Default fallback
        }
        
        resampledPoints.push(interpolatedPoint);
      }
    }
    
    return resampledPoints;
  })();

  // Calculate Y-axis domain and ticks
  const yAxisConfig = (() => {
    const values = resampledData.map(item => item[metricKey]).filter((v): v is number => typeof v === 'number');
    if (values.length === 0) return { domain: [0, 1], ticks: [] };
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    // Add some padding to the domain for better visualization
    const padding = range * 0.1;
    const domainMin = Math.max(0, min - padding);
    const domainMax = max + padding;
    
    // Create ticks for min, max, and intermediate values
    const ticks = [domainMin];
    if (range > 0) {
      if (range > 1) ticks.push(domainMin + (domainMax - domainMin) * 0.25);
      if (range > 2) ticks.push(domainMin + (domainMax - domainMin) * 0.75);
    }
    ticks.push(domainMax);
    
    return { domain: [domainMin, domainMax], ticks };
  })();

  return (
    <Card className="flex flex-col h-full min-h-[150px] min-w-[200px] sm:min-w-[300px] overflow-hidden">
      <CardHeader className="pb-0 pt-1 px-2 flex-shrink-0">
        <CardTitle className="text-xs font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-1 min-h-0">
        <ChartContainer config={chartConfig} className="!aspect-auto w-full h-full">
          <ComposedChart data={resampledData} margin={{ top: 2, right: 5, bottom: 2, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#666" />
              <XAxis
                dataKey="isoDate"
                hide={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 8, fill: '#9ca3af', dy: 5 }}
                interval="preserveStartEnd"
                tickFormatter={(value) => {
                  // Show only first and last labels to avoid crowding
                  const dataIndex = resampledData.findIndex(item => item.isoDate === value);
                  if (dataIndex === 0 || dataIndex === resampledData.length - 1) {
                    try {
                      // Parse the ISO date and format using browser locale
                      const date = new Date(value);
                      return date.toLocaleDateString();
                    } catch {
                      return value;
                    }
                  }
                  return '';
                }}
              />
              <YAxis
                hide={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickMargin={5}
                width={60}
                domain={yAxisConfig.domain}
                tickFormatter={(value) => {
                  if (typeof value === 'number') {
                    // Format based on metric type with specific precision
                    if (metricKey === 'uploadedSize' || metricKey === 'fileSize' || metricKey === 'storageSize') {
                      return formatBytesForYAxis(value);
                    } else if (metricKey === 'duration') {
                      return formatDuration(value);
                    } else {
                      // For counts (fileCount, backupVersions) - no decimal positions
                      return Math.round(value).toLocaleString();
                    }
                  }
                  return '';
                }}
              />
              <Line
                type="monotone"
                dataKey={metricKey}
                stroke={color}
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
              <Tooltip content={<CustomTooltip metricKey={metricKey} />} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function MetricsChartsPanelCore({ 
  serverId,
  backupName,
  chartData: externalChartData, // Use external chart data if provided
}: MetricsChartsPanelProps) {
  
  const { chartTimeRange } = useConfig();
  const { state: globalRefreshState } = useGlobalRefresh();
  // If externalChartData is provided, use it instead of fetching
  const [chartData, setChartData] = useState<ChartDataPoint[]>(externalChartData || []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [selectedServerName, setSelectedServerName] = useState<string | null>(null);
  const lastGlobalRefreshTime = useRef<Date | null>(null);
  const lastChartDataRef = useRef<string | null>(null);
  const isLoadingRef = useRef<boolean>(false);
  
  // Track screen height for responsive height behavior
  const [screenHeight, setScreenHeight] = useState<number>(0);
  
  useEffect(() => {
    const updateScreenHeight = () => {
      setScreenHeight(window.innerHeight);
    };

    // Set initial height
    updateScreenHeight();

    // Add event listener
    window.addEventListener('resize', updateScreenHeight);

    // Cleanup
    return () => window.removeEventListener('resize', updateScreenHeight);
  }, []);
  
  // Determine if we should use content-based height (when screen height < 865px)
  const useContentBasedHeight = screenHeight < 865;
  
  // Calculate time range dates
  const { startDate, endDate } = (() => {
    if (chartTimeRange === 'All data') {
      return { startDate: null, endDate: null };
    }
    
    const now = new Date();
    let startDate: Date;
    
    switch (chartTimeRange) {
      case '2 weeks':
        startDate = subWeeks(now, 2);
        break;
      case '1 month':
        startDate = subMonths(now, 1);
        break;
      case '3 months':
        startDate = subQuarters(now, 1);
        break;
      case '6 months':
        startDate = subMonths(now, 6);
        break;
      case '1 year':
        startDate = subYears(now, 1);
        break;
      case '2 years':
        startDate = subYears(now, 2);
        break;
      default:
        startDate = subMonths(now, 1);
    }
    
    return { startDate, endDate: now };
  })();

  // Fetch chart data based on parameters
  const fetchChartData = useCallback(async (skipLoadingState = false) => {
    try {
      isLoadingRef.current = true;
      
      // Only show loading state if this is not a background refresh
      if (!skipLoadingState) {
        setIsLoading(true);
      }
      setError(null);
      
      let data: ChartDataPoint[] = [];
      
      // Select the appropriate API endpoint based on parameters
      if (!serverId) {
        // Aggregated data (all servers)
        if (startDate && endDate) {
          const response = await fetch(`/api/chart-data/aggregated?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
          if (!response.ok) throw new Error('Failed to fetch aggregated chart data with time range');
          data = await response.json();
        } else {
          const response = await fetch('/api/chart-data/aggregated');
          if (!response.ok) throw new Error('Failed to fetch aggregated chart data');
          data = await response.json();
        }
      } else if (serverId && !backupName) {
        // Server-specific data (all backups)
        if (startDate && endDate) {
          const response = await fetch(`/api/chart-data/server/${serverId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
          if (!response.ok) throw new Error('Failed to fetch server chart data with time range');
          data = await response.json();
        } else {
          const response = await fetch(`/api/chart-data/server/${serverId}`);
          if (!response.ok) throw new Error('Failed to fetch server chart data');
          data = await response.json();
        }
        
        // Get server name for display
        const serverResponse = await fetch(`/api/servers/${serverId}`);
        if (serverResponse.ok) {
          const serverData = await serverResponse.json();
          setSelectedServerName(serverData.name);
        }
      } else if (serverId && backupName) {
        // Server and backup specific data
        if (startDate && endDate) {
          const response = await fetch(`/api/chart-data/server/${serverId}/backup/${encodeURIComponent(backupName)}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
          if (!response.ok) throw new Error('Failed to fetch server backup chart data with time range');
          data = await response.json();
        } else {
          const response = await fetch(`/api/chart-data/server/${serverId}/backup/${encodeURIComponent(backupName)}`);
          if (!response.ok) throw new Error('Failed to fetch server backup chart data');
          data = await response.json();
        }
        
        // Get server name for display
        const serverResponse = await fetch(`/api/servers/${serverId}`);
        if (serverResponse.ok) {
          const serverData = await serverResponse.json();
          setSelectedServerName(serverData.name);
        }
      }
      
      // Only update state if data actually changed (same logic as dashboard-auto-refresh)
      const newDataString = JSON.stringify(data);
      const currentDataString = lastChartDataRef.current;
      
      if (newDataString !== currentDataString) {
        setChartData(data);
        lastChartDataRef.current = newDataString;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error loading chart data",
        description: errorMessage,
        variant: "destructive",
        duration: 3000
      });
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [serverId, backupName, startDate, endDate, toast]);

  // Fetch data only when API parameters actually change and no external data is provided
  useEffect(() => {
    // Only fetch if no external data is provided
    if (!externalChartData) {
      fetchChartData();
    } else {
      // If external data is provided, compare before updating state
      const newDataString = JSON.stringify(externalChartData);
      const currentDataString = lastChartDataRef.current;
      
      if (newDataString !== currentDataString) {
        setChartData(externalChartData);
        lastChartDataRef.current = newDataString;
      }
      setIsLoading(false);
    }
  }, [serverId, backupName, startDate, endDate, externalChartData, fetchChartData]);

  // Clear selected server name when no server is selected
  useEffect(() => {
    if (!serverId) {
      setSelectedServerName(null);
    }
  }, [serverId]);

  // Listen for global refresh events and refetch data when refresh completes
  useEffect(() => {
    // Skip if external chart data is provided
    if (externalChartData) return;
    
    // Only refetch if we're not currently loading and a refresh just completed
    if (!globalRefreshState.isRefreshing && 
        !globalRefreshState.pageSpecificLoading.dashboard && 
        globalRefreshState.lastRefresh && 
        !isLoadingRef.current) {
      
      // Check if this is actually a new refresh by comparing timestamps
      const currentRefreshTime = globalRefreshState.lastRefresh;
      if (!lastGlobalRefreshTime.current || 
          lastGlobalRefreshTime.current.getTime() !== currentRefreshTime.getTime()) {
        lastGlobalRefreshTime.current = currentRefreshTime;
        
        // For server-specific data, we still need to fetch it since global refresh
        // only provides aggregated data. But we can optimize this by checking if
        // the data has actually changed before triggering a re-render.
        if (serverId) {
          fetchChartData(true); // Skip loading state for background refresh
        }
        // For aggregated data (no serverId), the parent component handles the data
        // and passes it via externalChartData prop, so no need to fetch here.
      }
    }
  }, [globalRefreshState.isRefreshing, globalRefreshState.pageSpecificLoading.dashboard, globalRefreshState.lastRefresh, externalChartData, serverId, fetchChartData]);
  
  // Get selection info for display
  const selectionInfo = (() => {

    if(isLoading) return '';

    let baseText = '';
    if (selectedServerName) {
      baseText = `${selectedServerName}`;
      if (backupName) {
        baseText += `:${backupName}`;
      } else {
        baseText += ' (all backups)';
      }
    } else {
      baseText = 'All Servers & Backups';
    }
    
    // Convert chartTimeRange to display label
    const getTimeRangeLabel = (timeRange: string) => {
      switch (timeRange) {
        case '24 hours':
          return 'Last 24 hours';
        case '7 days':
          return 'Last week';
        case '2 weeks':
          return 'Last 2 weeks';
        case '1 month':
          return 'Last month';
        case '3 months':
          return 'Last quarter';
        case '6 months':
          return 'Last semester';
        case '1 year':
          return 'Last year';
        case '2 years':
          return 'Last 2 years';
        case 'All data':
          return 'All available data';
        default:
          return timeRange;
      }
    };
    
    // Append chartTimeRange in brackets with proper label
    return `${baseText} (${getTimeRangeLabel(chartTimeRange)})`;
  })();

  return (
    <div className="flex flex-col h-full min-h-[390px] min-w-[200px] sm:min-w-[300px] overflow-hidden">
      {/* Selection info header */}
      {selectionInfo && (
        <div className="mb-1 flex-shrink-0">
          <span className="text-xs text-muted-foreground">{selectionInfo}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <FileBarChart2 className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p className="text-xs">Loading chart data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-destructive">
            <FileBarChart2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Error loading chart data</p>
          </div>
        </div>
      )}

      {/* Charts - Responsive grid layout: 1 column mobile/small, 3 columns medium/large */}
      {!isLoading && !error && chartData.length > 0 && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${useContentBasedHeight ? 'auto-rows-auto' : 'auto-rows-fr'} items-stretch gap-2 sm:gap-3 pb-2 flex-1 min-h-0 overflow-hidden`}>
          {chartMetrics.map((metric) => (
            <SmallMetricChart
              key={metric.key}
              data={chartData}
              metricKey={metric.key as keyof ChartDataPoint}
              label={metric.label}
              color={metric.color}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && chartData.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <FileBarChart2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No data available</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Memoized core charts component (without refresh time display)
const MemoizedChartsCore = memo(MetricsChartsPanelCore, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if there are actual changes in the data we care about
  
  // Compare basic props
  if (prevProps.serverId !== nextProps.serverId ||
      prevProps.backupName !== nextProps.backupName) {
    return false; // Props changed, re-render
  }
  
  // Compare chart data using JSON.stringify (same approach as dashboard-auto-refresh)
  const prevChartData = prevProps.chartData || [];
  const nextChartData = nextProps.chartData || [];
  
  // If lengths are different, definitely re-render
  if (prevChartData.length !== nextChartData.length) {
    return false;
  }
  
  // Deep comparison using JSON.stringify
  const chartDataChanged = JSON.stringify(prevChartData) !== JSON.stringify(nextChartData);
  
  // Return true to prevent re-render if data is the same
  return !chartDataChanged;
});

// Main wrapper component that combines charts with refresh time display
export const MetricsChartsPanel = ({ 
  serverId,
  backupName,
  chartData
}: MetricsChartsPanelProps) => {
  
  return (
    <div className="flex flex-col p-3 h-full min-h-0 min-w-0 overflow-hidden">
      {/* Header with independent refresh time display */}
      <div className="flex items-center justify-between mb-1 flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileBarChart2 className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-semibold">Metrics</h2>
        </div>
        <RefreshTimeDisplay />
      </div>

      {/* Memoized charts component */}
      <MemoizedChartsCore 
        serverId={serverId}
        backupName={backupName}
        chartData={chartData}
      />
    </div>
  );
};