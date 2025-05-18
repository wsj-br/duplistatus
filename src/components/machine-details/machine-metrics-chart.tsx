// src/components/machine-details/machine-metrics-chart.tsx
"use client";

import type { Machine } from "@/lib/types";
import React, { useState, useMemo } from "react";
import { 
  Line, 
  LineChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Legend as RechartsLegend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  TooltipProps
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart"; 
import type { ChartConfig } from "@/components/ui/chart";
import { formatBytes } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useConfig } from "@/contexts/config-context";
import type { ChartMetricSelection } from "@/contexts/config-context";
import { subWeeks, subMonths, subQuarters, subYears, parseISO } from "date-fns";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

interface MachineMetricsChartProps {
  machine: Machine;
}

// Use the imported ChartMetricSelection type
const metricDisplayInfo: Record<ChartMetricSelection, { label: string; unit?: string }> = {
  uploadedSize: { label: "Uploaded Size" },
  duration: { label: "Duration", unit: "Minutes" },
  fileCount: { label: "File Count" },
  fileSize: { label: "Total File Size" },
};

export function MachineMetricsChart({ machine }: MachineMetricsChartProps) {
  const { chartTimeRange, chartMetricSelection, setChartMetricSelection } = useConfig();
  const currentMetricInfo = metricDisplayInfo[chartMetricSelection] || { label: chartMetricSelection };
  const yAxisLabel = currentMetricInfo.unit 
    ? `${currentMetricInfo.label} (${currentMetricInfo.unit})` 
    : currentMetricInfo.label;

  // Ensure machine and chartData are defined
  const safeChartData = machine?.chartData || [];
  
  // Filter chart data based on the selected time range
  const filteredChartData = useMemo(() => {
    if (!safeChartData.length) return [];
    
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
      case 'All data':
        // Skip date filtering for 'All data' option
        return safeChartData.map(item => ({
          date: item.date,
          [chartMetricSelection]: item[chartMetricSelection]
        }));
      default:
        cutoffDate = subMonths(now, 1); // Default to 1 month
    }

    return safeChartData
      .filter(item => {
        // Use the ISO date string for accurate date comparison
        if (item.isoDate) {
          const itemDate = parseISO(item.isoDate);
          return itemDate >= cutoffDate;
        }
        // Fallback to parsing the formatted date if isoDate is not available
        const dateParts = item.date.split('/');
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
          const year = parseInt(dateParts[2], 10);
          const itemDate = new Date(year, month, day);
          return itemDate >= cutoffDate;
        }
        return false; // Skip invalid dates
      })
      .map(item => ({
        date: item.date,
        [chartMetricSelection]: item[chartMetricSelection]
      }));
  }, [safeChartData, chartMetricSelection, chartTimeRange]);

  // useMemo for chartConfig to prevent re-creation on every render if selectedMetric doesn't change
  const chartConfig = useMemo(() => ({
    [chartMetricSelection]: {
      label: yAxisLabel,
      color: "hsl(var(--chart-1))",
    },
  }), [chartMetricSelection, yAxisLabel]) satisfies ChartConfig;

  const yAxisTickFormatter = (value: number | undefined) => {
    if (value === undefined) return '';
    if (chartMetricSelection === "uploadedSize" || chartMetricSelection === "fileSize") {
      return formatBytes(value, 0);
    }
    return value.toLocaleString();
  };

  const tooltipFormatter = (value: ValueType, name: NameType | undefined, props: any) => {
    if (typeof value !== 'number') return '';
    if (chartMetricSelection === "uploadedSize" || chartMetricSelection === "fileSize") {
      return formatBytes(value);
    }
    return value.toLocaleString();
  };

  // Early return if no data
  if (!safeChartData.length) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Backup Metrics Over Time</CardTitle>
          <CardDescription>No backup data available for {machine?.name || 'this machine'}.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No data available for the selected time range.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle>Backup Metrics Over Time</CardTitle>
          <CardDescription>
            Visualize backup {currentMetricInfo.label.toLowerCase()} for {machine?.name || 'this machine'} 
            {chartTimeRange === 'All data' 
              ? ' for all available data.'
              : ` over the last ${chartTimeRange}.`
            }
          </CardDescription>
        </div>
        <Select 
          value={chartMetricSelection} 
          onValueChange={(value) => setChartMetricSelection?.(value as ChartMetricSelection)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Metric" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(metricDisplayInfo) as ChartMetricSelection[]).map(metric => (
              <SelectItem key={metric} value={metric}>
                {metricDisplayInfo[metric].unit ? `${metricDisplayInfo[metric].label} (${metricDisplayInfo[metric].unit})` : metricDisplayInfo[metric].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {filteredChartData.length > 0 ? (
          <ChartContainer 
            key={`chart-${chartTimeRange}-${chartMetricSelection}`} 
            config={chartConfig} 
            className="h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id={`color-${chartMetricSelection}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={`hsl(var(--chart-1))`} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={`hsl(var(--chart-1))`} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                  tickFormatter={yAxisTickFormatter}
                  label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', offset: -15, style: { textAnchor: 'middle', fill: 'hsl(var(--foreground))' } }}
                />
                <RechartsTooltip
                  cursor={{ stroke: 'hsl(var(--chart-1))', strokeWidth: 1 }}
                  formatter={tooltipFormatter}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const value = payload[0].value;
                    const name = payload[0].name;
                    if (typeof value !== 'number') return null;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="text-sm font-medium">{label}</div>
                        <div className="text-sm text-muted-foreground">
                          {tooltipFormatter(value, name, payload[0])}
                        </div>
                      </div>
                    );
                  }}
                />
                
                <Area
                  type="monotone"
                  dataKey={chartMetricSelection}
                  stroke="none"
                  fill={`url(#color-${chartMetricSelection})`}
                  fillOpacity={1}
                  isAnimationActive={false}
                  legendType="none"
                />
                <Line
                  type="monotone"
                  dataKey={chartMetricSelection}
                  name={currentMetricInfo.label}
                  stroke={`hsl(var(--chart-1))`}
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'hsl(var(--background))', stroke: 'hsl(var(--chart-1))', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: 'hsl(var(--chart-1))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                  isAnimationActive={false}
                  legendType="none"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No data available for the selected time range.
          </div>
        )}
        
        {/* Custom legend below the chart */}
        {filteredChartData.length > 0 && (
          <div className="flex justify-center mt-4 items-center gap-2">
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--chart-1))' }}></div>
            <span className="text-sm">{yAxisLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

