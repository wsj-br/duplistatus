"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useConfig } from '@/contexts/config-context';
import { useTheme } from '@/contexts/theme-context';
import type { TablePageSize } from '@/contexts/config-context';
import { MonitorCog, Table, BarChart3, RefreshCw, SortDesc, Moon, Sun } from 'lucide-react';
import { ColoredIcon } from '@/components/ui/colored-icon';

export function DisplaySettingsForm() {
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
  
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Track if component has mounted on client (prevents hydration mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6" data-screenshot-target="settings-content-card">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ColoredIcon icon={MonitorCog} color="blue" size="md" />
            Display Settings
          </CardTitle>
          <CardDescription>
            Customize how duplistatus displays your data and controls the visual appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Table Page Size */}
          <div className="grid gap-2">
            <Label htmlFor="table-page-size" className="flex items-center gap-2">
              <ColoredIcon icon={Table} color="blue" size="sm" />
              Table Page Size
            </Label>
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

          {/* Chart Time Range */}
          <div className="grid gap-2">
            <Label htmlFor="chart-time-range" className="flex items-center gap-2">
              <ColoredIcon icon={BarChart3} color="green" size="sm" />
              Chart Time Range
            </Label>
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

          {/* Auto-refresh Interval */}
          <div className="grid gap-2">
            <Label htmlFor="auto-refresh-interval" className="flex items-center gap-2">
              <ColoredIcon icon={RefreshCw} color="purple" size="sm" />
              Auto-refresh Interval
            </Label>
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

          {/* Cards Sort Order */}
          <div className="grid gap-2">
            <Label htmlFor="dashboard-cards-sort-order" className="flex items-center gap-2">
              <ColoredIcon icon={SortDesc} color="yellow" size="sm" />
              Cards Sort Order
            </Label>
            <Select
              value={dashboardCardsSortOrder}
              onValueChange={(value) => setDashboardCardsSortOrder(value as 'Server name (a-z)' | 'Status (error>warnings>success)' | 'Last backup received (new>old)')}
            >
              <SelectTrigger id="dashboard-cards-sort-order">
                <SelectValue placeholder="Select sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Server name (a-z)">Server name (a-z)</SelectItem>
                <SelectItem value="Status (error>warnings>success)">Status (error &gt; warning &gt; success)</SelectItem>
                <SelectItem value="Last backup received (new>old)">Last backup received (new &gt; old)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Theme Toggle */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <ColoredIcon icon={theme === "light" ? Sun : Moon} color="orange" size="sm" />
              Theme
            </Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={toggleTheme}
                className="w-full sm:w-auto"
                aria-label="Toggle theme"
              >
                {!mounted ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Toggle Theme
                  </>
                ) : theme === "light" ? (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Switch to Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Switch to Light Mode
                  </>
                )}
              </Button>
              <span className="text-sm text-muted-foreground">
                Current theme: <span className="font-medium">{theme === "light" ? "Light" : "Dark"}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

