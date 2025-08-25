"use client";

import { useMemo, useState, useEffect, memo } from 'react';
import { 
  Line, 
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes } from "@/lib/utils";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart"; 
import { FileBarChart2 } from "lucide-react";
import { useConfig } from "@/contexts/config-context";
import { subWeeks, subMonths, subQuarters, subYears, parseISO } from "date-fns";
import type { ChartDataPoint } from "@/lib/types";

// Interface for interpolated chart data points
interface InterpolatedChartPoint {
  date: string;
  isoDate: string;
  [key: string]: string | number;
}



interface MetricsChartsPanelProps {
  chartData: ChartDataPoint[];
  selectedMachineName?: string | null;
  selectedBackupId?: string | null;
  lastRefreshTime: Date;
}

// Helper function to format duration from minutes to HH:MM
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60); // Remove decimal positions from minutes
  return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
};

// Helper function to format bytes with specific precision for Y-axis labels
const formatBytesForYAxis = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  if (i >= sizes.length) return formatBytes(bytes, 1);
  
  const value = bytes / Math.pow(k, i);
  const size = sizes[i];
  
  // Apply specific precision rules
  if (size === 'GB') {
    return `${value.toFixed(1)} ${size}`;
  } else if (size === 'MB' || size === 'KB' || size === 'B') {
    return `${Math.round(value)} ${size}`;
  } else {
    return `${value.toFixed(1)} ${size}`;
  }
};

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

const SmallMetricChart = memo(function SmallMetricChart({ 
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
  const chartConfig = useMemo(() => ({
    [metricKey]: {
      label,
      color,
    },
  }), [metricKey, label, color]) as ChartConfig;
  
  // Prepare data for chart
  const chartReady = useMemo(() => data.map(item => ({
    date: item.date,
    isoDate: item.isoDate,
    [metricKey]: item[metricKey]
  })), [data, metricKey]);

  // Resample data for small charts using linear interpolation
  const maxPoints = 50;
  const resampledData = useMemo(() => {
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
  }, [chartReady, metricKey]);

  // Calculate Y-axis domain and ticks
  const yAxisConfig = useMemo(() => {
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
  }, [resampledData, metricKey]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-0 pt-1 px-2 flex-shrink-0">
        <CardTitle className="text-xs font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-1 min-h-0">
        <ChartContainer config={chartConfig} className="!aspect-auto w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={resampledData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#666" />
              <XAxis 
                dataKey="date" 
                hide={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 9, fill: '#9ca3af', dy: 7 }}
                interval="preserveStartEnd"
                tickFormatter={(value) => {
                  // Show only first and last labels to avoid crowding
                  const dataIndex = resampledData.findIndex(item => item.date === value);
                  if (dataIndex === 0 || dataIndex === resampledData.length - 1) {
                    try {
                      // Parse the date (YYYY-MM-DD format) and format using browser locale
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
                tickMargin={8}
                width={80}
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
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
});

export const MetricsChartsPanel = memo(function MetricsChartsPanel({ 
  chartData, 
  selectedMachineName,
  selectedBackupId,
  lastRefreshTime,
}: MetricsChartsPanelProps) {
  const { chartTimeRange } = useConfig();
  const [mounted, setMounted] = useState(false);
  


  // Prevent hydration mismatch by only showing time after client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter chart data based on the selected time range
  const filteredChartData = useMemo(() => {
    if (!chartData.length) {
      return [];
    }
    
    // The chart data is already filtered/aggregated in the parent component
    // If a machine is selected, chartData contains only that machine's data
    // If no machine is selected, chartData contains aggregated data for all machines
    const machineFilteredData = chartData;
    
    // If 'All data' is selected, return the machine-filtered data without time filtering
    if (chartTimeRange === 'All data') {
      return machineFilteredData;
    }
    
    const now = new Date();
    let cutoffDate: Date;

    switch (chartTimeRange) {
      case '2 weeks':
        cutoffDate = subWeeks(now, 2);
        break;
      case '1 month':
        cutoffDate = subMonths(now, 1);
        break;
      case '3 months':
        cutoffDate = subQuarters(now, 1);
        break;
      case '6 months':
        cutoffDate = subMonths(now, 6);
        break;
      case '1 year':
        cutoffDate = subYears(now, 1);
        break;
      case '2 years':
        cutoffDate = subYears(now, 2);
        break;
      default:
        cutoffDate = subMonths(now, 1);
    }

    return machineFilteredData.filter(item => {
      try {
        // Use the date field (YYYY-MM-DD format) instead of isoDate for filtering
        const itemDate = parseISO(item.date);
        return itemDate >= cutoffDate;
      } catch {
        return false;
      }
    });
  }, [chartData, chartTimeRange]);

  // Get selection info for display
  const selectionInfo = useMemo(() => {
    if (selectedMachineName) {
      return `${selectedMachineName}`;
    }
    if (selectedBackupId) {
      return `${selectedMachineName}:${selectedBackupId}`;
    }
    return 'All Machines & Backups';
  }, [selectedMachineName, selectedBackupId]);

  return (
    <div className="h-full flex flex-col p-0.5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <FileBarChart2 className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-semibold">Metrics<span className="text-xs text-muted-foreground"> {selectionInfo}</span></h2>
        </div>
        <div className="text-xs text-muted-foreground font-medium"> last update: {mounted ? lastRefreshTime.toLocaleTimeString('en-US', { 
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                    }) : '--:--:--'}</div>
      </div>

      {/* Charts - Responsive grid layout */}
      <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-4 overflow-hidden min-h-0">
        {chartMetrics.map((metric) => (
          <SmallMetricChart
            key={metric.key}
            data={filteredChartData}
            metricKey={metric.key as keyof ChartDataPoint}
            label={metric.label}
            color={metric.color}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredChartData.length === 0 && (
        <div className="text-center text-muted-foreground py-4">
          <FileBarChart2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No data available</p>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if there are actual changes in the data we care about
  
  // Compare chart data (this is the most important for performance)
  const chartDataEqual = JSON.stringify(prevProps.chartData) === JSON.stringify(nextProps.chartData);
  
  // Compare other props
  const otherPropsEqual = prevProps.selectedMachineName === nextProps.selectedMachineName &&
                         prevProps.selectedBackupId === nextProps.selectedBackupId;
  
  // Don't compare lastRefreshTime as it changes on every refresh but doesn't affect the visual content
  
  return chartDataEqual && otherPropsEqual;
});
