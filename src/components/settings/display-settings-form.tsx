"use client";

import { useState, useEffect } from 'react';
import { useIntlayer } from 'react-intlayer';
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
  const content = useIntlayer('display-settings-form');
  const common = useIntlayer('common');
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
  // Track if component has mounted on client (prevents hydration mismatch)
  // Use useState initializer to avoid set-state-in-effect warning
  const [mounted, setMounted] = useState(false);

  // Use useEffect with a flag to track mounting without directly calling setState
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6" data-screenshot-target="settings-content-card">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ColoredIcon icon={MonitorCog} color="blue" size="md" />
            {content.title.value}
          </CardTitle>
          <CardDescription>
            {content.description.value}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Table Page Size */}
          <div className="grid gap-2">
            <Label htmlFor="table-page-size" className="flex items-center gap-2">
              <ColoredIcon icon={Table} color="blue" size="sm" />
              {content.tablePageSizeLabel.value}
            </Label>
            <Select
              value={tablePageSize.toString()}
              onValueChange={(value) => setTablePageSize(parseInt(value) as TablePageSize)}
            >
              <SelectTrigger id="table-page-size">
                <SelectValue placeholder={content.tablePageSizePlaceholder.value} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">{content.rows.value.replace('{count}', '5')}</SelectItem>
                <SelectItem value="10">{content.rows.value.replace('{count}', '10')}</SelectItem>
                <SelectItem value="15">{content.rows.value.replace('{count}', '15')}</SelectItem>
                <SelectItem value="20">{content.rows.value.replace('{count}', '20')}</SelectItem>
                <SelectItem value="25">{content.rows.value.replace('{count}', '25')}</SelectItem>
                <SelectItem value="30">{content.rows.value.replace('{count}', '30')}</SelectItem>
                <SelectItem value="40">{content.rows.value.replace('{count}', '40')}</SelectItem>
                <SelectItem value="50">{content.rows.value.replace('{count}', '50')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chart Time Range */}
          <div className="grid gap-2">
            <Label htmlFor="chart-time-range" className="flex items-center gap-2">
              <ColoredIcon icon={BarChart3} color="green" size="sm" />
              {content.chartTimeRangeLabel.value}
            </Label>
            <Select
              value={chartTimeRange}
              onValueChange={(value) => setChartTimeRange(value as '2 weeks' | '1 month' | '3 months' | '6 months' | '1 year' | '2 years' | 'All data')}
            >
              <SelectTrigger id="chart-time-range">
                <SelectValue placeholder={content.chartTimeRangePlaceholder.value} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2 weeks">{common.time.last2Weeks.value}</SelectItem>
                <SelectItem value="1 month">{common.time.lastMonth.value}</SelectItem>
                <SelectItem value="3 months">{common.time.lastQuarter.value}</SelectItem>
                <SelectItem value="6 months">{common.time.lastSemester.value}</SelectItem>
                <SelectItem value="1 year">{common.time.lastYear.value}</SelectItem>
                <SelectItem value="2 years">{common.time.last2Years.value}</SelectItem>
                <SelectItem value="All data">{common.time.allAvailableData.value}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Auto-refresh Interval */}
          <div className="grid gap-2">
            <Label htmlFor="auto-refresh-interval" className="flex items-center gap-2">
              <ColoredIcon icon={RefreshCw} color="purple" size="sm" />
              {content.autoRefreshLabel.value}
            </Label>
            <Select
              value={autoRefreshInterval.toString()}
              onValueChange={(value) => setAutoRefreshInterval(parseFloat(value) as 0.25 | 0.5 | 1 | 2 | 3 | 4 | 5 | 10)}
            >
              <SelectTrigger id="auto-refresh-interval">
                <SelectValue placeholder={content.autoRefreshPlaceholder.value} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.25">{content.seconds15.value}</SelectItem>
                <SelectItem value="0.5">{content.seconds30.value}</SelectItem>
                <SelectItem value="1">{common.time.intervals['1min'].value}</SelectItem>
                <SelectItem value="2">{common.time.intervals['2min'].value}</SelectItem>
                <SelectItem value="3">{common.time.intervals['3min'].value}</SelectItem>
                <SelectItem value="4">{common.time.intervals['4min'].value}</SelectItem>
                <SelectItem value="5">{common.time.intervals['5min'].value}</SelectItem>
                <SelectItem value="10">{common.time.intervals['10min'].value}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cards Sort Order */}
          <div className="grid gap-2">
            <Label htmlFor="dashboard-cards-sort-order" className="flex items-center gap-2">
              <ColoredIcon icon={SortDesc} color="yellow" size="sm" />
              {content.cardsSortOrderLabel.value}
            </Label>
            <Select
              value={dashboardCardsSortOrder}
              onValueChange={(value) => setDashboardCardsSortOrder(value as 'Server name (a-z)' | 'Status (error>warnings>success)' | 'Last backup received (new>old)')}
            >
              <SelectTrigger id="dashboard-cards-sort-order">
                <SelectValue placeholder={content.cardsSortOrderPlaceholder.value} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Server name (a-z)">{content.sortByServerName.value}</SelectItem>
                <SelectItem value="Status (error>warnings>success)">{content.sortByStatus.value}</SelectItem>
                <SelectItem value="Last backup received (new>old)">{content.sortByLastBackup.value}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Theme Toggle */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <ColoredIcon icon={theme === "light" ? Sun : Moon} color="orange" size="sm" />
              {content.themeLabel.value}
            </Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={toggleTheme}
                className="w-full sm:w-auto"
                aria-label={content.toggleTheme.value}
              >
                {!mounted ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    {content.toggleTheme.value}
                  </>
                ) : theme === "light" ? (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    {content.switchToDark.value}
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    {content.switchToLight.value}
                  </>
                )}
              </Button>
              <span className="text-sm text-muted-foreground">
                {content.currentTheme.value} <span className="font-medium">{theme === "light" ? content.themeLight.value : content.themeDark.value}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

