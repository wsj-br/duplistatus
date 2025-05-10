"use client";

import type { Machine } from "@/lib/types";
import React, { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer } from "recharts";
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


interface MachineMetricsChartProps {
  machine: Machine;
}

type MetricKey = "uploadedSize" | "duration" | "fileCount" | "fileSize";

const metricDisplayInfo: Record<MetricKey, { label: string; unit?: string }> = {
  uploadedSize: { label: "Uploaded Size" },
  duration: { label: "Duration", unit: "Minutes" },
  fileCount: { label: "File Count" },
  fileSize: { label: "Total File Size" },
};

export function MachineMetricsChart({ machine }: MachineMetricsChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("uploadedSize");

  const currentMetricInfo = metricDisplayInfo[selectedMetric];
  const yAxisLabel = currentMetricInfo.unit ? `${currentMetricInfo.label} (${currentMetricInfo.unit})` : currentMetricInfo.label;

  const chartConfig = {
    [selectedMetric]: {
      label: yAxisLabel,
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;
  
  const chartData = machine.chartData.map(item => ({
    date: item.date,
    [selectedMetric]: item[selectedMetric]
  }));

  const yAxisTickFormatter = (value: number) => {
    if (selectedMetric === "uploadedSize" || selectedMetric === "fileSize") {
      return formatBytes(value, 0);
    }
    return value.toLocaleString();
  };

  const tooltipFormatter = (value: number, name: string) => {
     // name here will be the datakey from chartConfig which includes unit if present
    // We want the raw value for formatting, and the original label without unit for display
    const metricKey = Object.keys(metricDisplayInfo).find(key => chartConfig[key as MetricKey]?.label === name) as MetricKey | undefined;
    const originalLabel = metricKey ? metricDisplayInfo[metricKey].label : name;

    if (selectedMetric === "uploadedSize" || selectedMetric === "fileSize") {
      return [formatBytes(value), originalLabel];
    }
    return [value.toLocaleString(), originalLabel];
  };


  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle>Backup Metrics Over Time</CardTitle>
          <CardDescription>
            Visualize backup {currentMetricInfo.label.toLowerCase()} for {machine.name}.
          </CardDescription>
        </div>
        <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as MetricKey)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Metric" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(metricDisplayInfo) as MetricKey[]).map(metric => (
              <SelectItem key={metric} value={metric}>
                {metricDisplayInfo[metric].unit ? `${metricDisplayInfo[metric].label} (${metricDisplayInfo[metric].unit})` : metricDisplayInfo[metric].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" hideLabel formatter={tooltipFormatter} />}
                />
                <RechartsLegend content={<ChartLegendContent />} />
                <Bar dataKey={selectedMetric} fill="var(--color-primary)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Not enough data to display chart.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
