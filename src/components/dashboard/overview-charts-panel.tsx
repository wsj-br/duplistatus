"use client";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { 
  Line,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDurationFromMinutes } from "@/lib/utils";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart"; 
import { FileBarChart2 } from "lucide-react";
import { useConfig, useEffectiveFormatLocale } from "@/contexts/config-context";
import { subDays } from "date-fns";
import type { ChartDataPoint } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { useGlobalRefresh } from "@/contexts/global-refresh-context";
import { formatDate } from "@/lib/date-format";
import { formatInteger, formatBytes as formatBytesLocale } from "@/lib/number-format";
import { SOURCE_LOCALE } from "@/lib/locales";
import { bucketChartData, getBucketSizeDays, type BucketedChartPoint, getTimeRangeLabel } from "@/lib/chart-utils";
import type { ChartStyle, ChartTimeRange } from "@/contexts/config-context";
import { ChartTimeRangeSelector } from "@/components/chart-time-range-selector";
interface OverviewChartsPanelProps {
  serverId?: string;
  backupName?: string;
}

type OverviewChartsPanelCoreProps = OverviewChartsPanelProps & { t: TFunction };

// Use existing library function for duration formatting
const formatDuration = (minutes: number, locale?: string): string => {
  // Extract just HH:MM from the formatted duration (which may use localized separators like '.' or ':')
  const formatted = formatDurationFromMinutes(minutes, locale);
  return formatted.replace(/[^\d]\d{2}$/, '');
};

// Use existing library function for bytes formatting with Y-axis specific precision
const formatBytesForYAxis = (bytes: number, locale: string = SOURCE_LOCALE): string => {
  if (bytes === 0) return '0 B';
  
  // Determine the appropriate precision based on the size for Y-axis labels
  // For GB, use 1 decimal place; for others, use 0 decimal places
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  if (i >= sizes.length) return formatBytesLocale(bytes, locale, 1);
  
  const size = sizes[i];
  
  // Apply specific precision rules for Y-axis labels using the library function
  if (size === 'GB') {
    return formatBytesLocale(bytes, locale, 1);  // 1 decimal place for GB
  } else if (size === 'MB' || size === 'KB' || size === 'B') {
    return formatBytesLocale(bytes, locale, 0);  // 0 decimal places for MB, KB, B
  } else {
    return formatBytesLocale(bytes, locale, 1);  // 1 decimal place for TB+
  }
};


// Custom tooltip component for Recharts
const CustomTooltip = ({ active, payload, label, metricKey, locale }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload: { isoDate: string } }>;
  label?: string;
  metricKey: keyof ChartDataPoint;
  locale: string;
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0];
  const value = data.value;
  
  // Format the date for display using locale-aware formatting (date only, no time)
  let formattedDate = label;
  try {
    if (data.payload?.isoDate) {
      formattedDate = formatDate(data.payload.isoDate, locale);
    }
  } catch {
    // Fallback to original label if date parsing fails
  }
  
  // Format the value based on metric type
  let formattedValue: string;
  if (metricKey === 'fileSize' || metricKey === 'storageSize') {
    formattedValue = formatBytesForYAxis(value, locale);
  } else if (metricKey === 'duration') {
    formattedValue = formatDuration(value, locale);
  } else {
    formattedValue = formatInteger(value, locale);
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

function OverviewMetricChart({
  data,
  metricKey,
  label,
  color,
  locale,
  chartStyle,
  chartTimeRange,
}: {
  data: ChartDataPoint[];
  metricKey: keyof ChartDataPoint;
  label: string;
  color: string;
  locale: string;
  chartStyle: ChartStyle;
  chartTimeRange: string;
}) {

  // Create chart config
  const chartConfig = {
    [metricKey]: {
      label,
      color,
    },
  } as ChartConfig;

  // Aggregate data into time buckets (replaces linear interpolation)
  const bucketDays = getBucketSizeDays(chartTimeRange);
  const bucketedData: BucketedChartPoint[] = bucketChartData(data, bucketDays);



  // Map bucketed data to chart-ready shape with the specific metricKey
  const resampledData = bucketedData.map(item => ({
    date: item.date,
    isoDate: item.isoDate,
    [metricKey]: item[metricKey as keyof BucketedChartPoint],
  }));

  // Calculate Y-axis domain and ticks
  const yAxisConfig = (() => {
    const values = resampledData
      .map(item => item[metricKey])
      .filter((v): v is number => typeof v === 'number' && v !== null);
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
    <Card className="flex flex-col h-full min-h-[150px] overflow-hidden">
      <CardHeader className="pb-0 pt-1 px-2 flex-shrink-0">
        <CardTitle className="text-xs font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-1 min-h-[100px] flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 w-full relative">
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
                      // Format using locale-aware date formatting
                      return formatDate(value, locale);
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
                    if (metricKey === 'fileSize' || metricKey === 'storageSize') {
                      return formatBytesForYAxis(value, locale);
                    } else if (metricKey === 'duration') {
                      return formatDuration(value, locale);
                    } else {
                      // For counts - no decimal positions
                      return formatInteger(Math.round(value), locale);
                    }
                  }
                  return '';
                }}
              />
              {chartStyle === 'bar' ? (
                <Bar
                  dataKey={metricKey}
                  fill={color}
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={false}
                />
              ) : (
                <Line
                  type="monotone"
                  dataKey={metricKey}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />
              )}
              <Tooltip content={<CustomTooltip metricKey={metricKey} locale={locale} />} />
          </ComposedChart>
        </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewChartsPanelCore({
  t,
  serverId,
  backupName,
}: OverviewChartsPanelCoreProps) {

  const { chartTimeRange, chartStyle, setChartTimeRange } = useConfig();
  const { state: globalRefreshState } = useGlobalRefresh();
  const effectiveLocale = useEffectiveFormatLocale();
  
  // Configuration for overview charts - only 3 metrics
  const overviewChartMetrics = [
    { 
      key: 'duration', 
      label: t("Backup Duration"), 
      formatter: formatDuration,
      color: "#10b981" // Green
    },
    { 
      key: 'fileSize', 
      label: t("File Size"), 
      color: "#ef4444" // Red
    },
    { 
      key: 'storageSize', 
      label: t("Storage Size"), 
      color: "#8b5cf6" // Purple
    }
  ];
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [selectedServerName, setSelectedServerName] = useState<string | null>(null);
  const lastGlobalRefreshTime = useRef<Date | null>(null);
  const lastChartDataRef = useRef<string | null>(null);
  const isLoadingRef = useRef<boolean>(false);

  // Calculate time range dates - useMemo to prevent re-calculation on every render
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (chartTimeRange) {
      case '1 week':
        startDate = subDays(now, 7);   // Last 7 days (rolling)
        break;
      case '2 weeks':
        startDate = subDays(now, 14);  // Last 14 days (rolling)
        break;
      case '1 month':
        startDate = subDays(now, 30);  // Last 30 days (rolling)
        break;
      case '3 months':
        startDate = subDays(now, 90);  // Last 90 days (rolling)
        break;
      default:
        startDate = subDays(now, 30);
    }
    
    return { startDate, endDate: now };
  }, [chartTimeRange]); // Only recalculate when chartTimeRange changes

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
          const response = await authenticatedRequestWithRecovery(`/api/chart-data/aggregated?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
          if (!response.ok) throw new Error('Failed to fetch aggregated chart data with time range');
          data = await response.json();
        } else {
          const response = await authenticatedRequestWithRecovery('/api/chart-data/aggregated');
          if (!response.ok) throw new Error('Failed to fetch aggregated chart data');
          data = await response.json();
        }
      } else if (serverId && !backupName) {
        // Server-specific data (all backups)
        if (startDate && endDate) {
          const response = await authenticatedRequestWithRecovery(`/api/chart-data/server/${serverId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
          if (!response.ok) throw new Error('Failed to fetch server chart data with time range');
          data = await response.json();
        } else {
          const response = await authenticatedRequestWithRecovery(`/api/chart-data/server/${serverId}`);
          if (!response.ok) throw new Error('Failed to fetch server chart data');
          data = await response.json();
        }
        
        // Get server name for display
        const serverResponse = await authenticatedRequestWithRecovery(`/api/servers/${serverId}`);
        if (serverResponse.ok) {
          const serverData = await serverResponse.json();
          setSelectedServerName(serverData.alias || serverData.name);
        }
      } else if (serverId && backupName) {
        // Server and backup specific data
        if (startDate && endDate) {
          const response = await authenticatedRequestWithRecovery(`/api/chart-data/server/${serverId}/backup/${encodeURIComponent(backupName)}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
          if (!response.ok) throw new Error('Failed to fetch server backup chart data with time range');
          data = await response.json();
        } else {
          const response = await authenticatedRequestWithRecovery(`/api/chart-data/server/${serverId}/backup/${encodeURIComponent(backupName)}`);
          if (!response.ok) throw new Error('Failed to fetch server backup chart data');
          data = await response.json();
        }
        
        // Get server name for display
        const serverResponse = await authenticatedRequestWithRecovery(`/api/servers/${serverId}`);
        if (serverResponse.ok) {
          const serverData = await serverResponse.json();
          setSelectedServerName(serverData.alias || serverData.name);
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
        title: t("Error loading chart data"),
        description: errorMessage,
        variant: "destructive",
        duration: 3000
      });
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [serverId, backupName, startDate, endDate, toast, t]);

  // Fetch data when parameters change
  useEffect(() => {
    fetchChartData();
  }, [serverId, backupName, startDate, endDate, fetchChartData]);

  // Clear selected server name when no server is selected
  useEffect(() => {
    if (!serverId) {
      setSelectedServerName(null);
    }
  }, [serverId]);

  // Listen for global refresh events and refetch data when refresh completes
  useEffect(() => {
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

        // Always fetch to apply time range filtering server-side
        fetchChartData(true); // Skip loading state for background refresh
      }
    }
  }, [globalRefreshState.isRefreshing, globalRefreshState.pageSpecificLoading.dashboard, globalRefreshState.lastRefresh, serverId, fetchChartData]);
  
  // Get selection info for display
  const selectionInfo = (() => {
    if(isLoading) return '';

    let baseText = '';
    if (selectedServerName) {
      baseText = `${selectedServerName}`;
      if (backupName) {
        baseText += `:${backupName}`;
      } else {
        baseText += t(" (all backups)");
      }
    } else {
      baseText = t("All Servers & Backups");
    }
    
    // Use centralized getTimeRangeLabel from chart-utils
    return `${baseText} (${t(getTimeRangeLabel(chartTimeRange))})`;
  })();

  return (
    <div className="flex flex-col h-full min-h-[390px] overflow-hidden">
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
            <p className="text-xs">{t("Loading chart data...")}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-destructive">
            <FileBarChart2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">{t("Error loading chart data")}</p>
          </div>
        </div>
      )}

      {/* Charts - Vertical stack layout for overview view */}
      {!isLoading && !error && chartData.length > 0 && (
        <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-hidden">
          {overviewChartMetrics.map((metric) => (
            <div key={metric.key} className="flex-1 min-h-0">
              <OverviewMetricChart
                data={chartData}
                metricKey={metric.key as keyof ChartDataPoint}
                label={metric.label}
                color={metric.color}
                locale={effectiveLocale}
                chartStyle={chartStyle}
                chartTimeRange={chartTimeRange}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && chartData.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <FileBarChart2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">{t("No data available")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Memoized core charts component (without refresh time display)
const MemoizedOverviewChartsCore = memo(OverviewChartsPanelCore, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if there are actual changes in the props we care about
  // Note: chartData is now fetched internally, so we only compare external props

  // Compare basic props
  if (prevProps.t !== nextProps.t ||
      prevProps.serverId !== nextProps.serverId ||
      prevProps.backupName !== nextProps.backupName) {
    return false; // Props changed, re-render
  }

  // Props are the same, prevent re-render
  // The internal component handles data fetching and time range changes
  return true;
});

// Main wrapper component that combines charts with refresh time display
export const OverviewChartsPanel = ({
  serverId,
  backupName,
}: OverviewChartsPanelProps) => {
  const { t } = useTranslation();
  const { chartTimeRange, setChartTimeRange, chartStyle, setChartStyle } = useConfig();

  return (
    <div className="flex flex-col p-3 h-full min-h-0 min-w-0 overflow-hidden">
      {/* Header with compact time range selector inline */}
      <div className="flex items-center justify-between mb-1 flex-shrink-0 gap-2">
        <div className="flex items-center gap-2 flex-shrink-0">
          <FileBarChart2 className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-semibold">{t("Metrics")}</h2>
        </div>
        {/* Compact inline time range selector for narrow panels */}
        <ChartTimeRangeSelector
          value={chartTimeRange}
          onChange={setChartTimeRange}
          chartStyle={chartStyle}
          onChartStyleChange={setChartStyle}
          size="compact"
          className="flex-shrink-0"
        />
      </div>

      {/* Core component fetches its own data */}
      <MemoizedOverviewChartsCore
        t={t}
        serverId={serverId}
        backupName={backupName}
      />
    </div>
  );
};
