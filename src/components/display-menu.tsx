"use client";

import { MonitorCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfig } from "@/contexts/config-context";
import type { TablePageSize } from "@/contexts/config-context";
import { Label } from "@/components/ui/label";

export function DisplayMenu() {
  const {
    tablePageSize,
    setTablePageSize,
    chartTimeRange,
    setChartTimeRange,
    autoRefreshInterval,
    setAutoRefreshInterval,
    dashboardCardsSortOrder,
    setDashboardCardsSortOrder,
  } = useConfig();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" title="Display settings">
          <MonitorCog className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="text-xl font-medium leading-none">Display Settings</h4>
            <p className="text-sm text-muted-foreground">
              How duplistatus should display the data.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="table-page-size">Table Page Size</Label>
              <Select
                value={tablePageSize.toString()}
                onValueChange={(value) => setTablePageSize(parseInt(value) as TablePageSize)}
              >
                <SelectTrigger id="table-page-size">
                  <SelectValue placeholder="Select page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 rows</SelectItem>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="15">15 rows</SelectItem>
                  <SelectItem value="20">20 rows</SelectItem>
                  <SelectItem value="25">25 rows</SelectItem>
                  <SelectItem value="30">30 rows</SelectItem>
                  <SelectItem value="40">40 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="chart-time-range">Chart Time Range</Label>
              <Select
                value={chartTimeRange}
                onValueChange={(value) => setChartTimeRange(value as '2 weeks' | '1 month' | '3 months' | '6 months' | '1 year' | '2 years' | 'All data')}
              >
                <SelectTrigger id="chart-time-range">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2 weeks">Last 2 weeks</SelectItem>
                  <SelectItem value="1 month">Last month</SelectItem>
                  <SelectItem value="3 months">Last quarter</SelectItem>
                  <SelectItem value="6 months">Last semester</SelectItem>
                  <SelectItem value="1 year">Last year</SelectItem>
                  <SelectItem value="2 years">Last 2 years</SelectItem>
                  <SelectItem value="All data">All available data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="auto-refresh-interval">Auto-refresh Interval</Label>
              <Select
                value={autoRefreshInterval.toString()}
                onValueChange={(value) => setAutoRefreshInterval(parseFloat(value) as 0.25 | 0.5 | 1 | 2 | 3 | 4 | 5 | 10)}
              >
                <SelectTrigger id="auto-refresh-interval">
                  <SelectValue placeholder="Select refresh interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.25">15 seconds</SelectItem>
                  <SelectItem value="0.5">30 seconds</SelectItem>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="2">2 minutes</SelectItem>
                  <SelectItem value="3">3 minutes</SelectItem>
                  <SelectItem value="4">4 minutes</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dashboard-cards-sort-order">Cards Sort Order</Label>
              <Select
                value={dashboardCardsSortOrder}
                onValueChange={(value) => setDashboardCardsSortOrder(value as 'Machine name (a-z)' | 'Status (error>warnings>success)' | 'Last backup received (new>old)')}
              >
                <SelectTrigger id="dashboard-cards-sort-order">
                  <SelectValue placeholder="Select sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Machine name (a-z)">Machine name (a-z)</SelectItem>
                  <SelectItem value="Status (error>warnings>success)">Status (error&gt;warnings&gt;success)</SelectItem>
                  <SelectItem value="Last backup received (new>old)">Last backup received (new&gt;old)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 