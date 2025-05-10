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
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart"; // Assuming ChartTooltip and ChartLegend exist or are part of ChartContainer export
import type { ChartConfig } from "@/components/ui/chart";


interface MachineMetricsChartProps {
  machine: Machine;
}

type MetricKey = "uploadedSize" | "duration" | "fileCount" | "fileSize";

const metricLabels: Record<MetricKey, string> = {
  uploadedSize: "Uploaded Size (MB)",
  duration: "Duration (Minutes)",
  fileCount: "File Count",
  fileSize: "Total File Size (MB)",
};

export function MachineMetricsChart({ machine }: MachineMetricsChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("uploadedSize");

  const chartConfig = {
    [selectedMetric]: {
      label: metricLabels[selectedMetric],
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;
  
  const chartData = machine.chartData.map(item => ({
    date: item.date,
    [selectedMetric]: item[selectedMetric]
  }));

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle>Backup Metrics Over Time</CardTitle>
          <CardDescription>
            Visualize backup {metricLabels[selectedMetric].toLowerCase()} for {machine.name}.
          </CardDescription>
        </div>
        <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as MetricKey)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Metric" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(metricLabels) as MetricKey[]).map(metric => (
              <SelectItem key={metric} value={metric}>
                {metricLabels[metric]}
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
                  label={{ value: metricLabels[selectedMetric], angle: -90, position: 'insideLeft', offset: -5, style: { textAnchor: 'middle', fill: 'hsl(var(--foreground))' } }}
                />
                 <RechartsTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" hideLabel />}
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
