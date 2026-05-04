"use client";
import { useTranslation } from "react-i18next";
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
import type { StartOfWeek } from '@/lib/types';
import { MonitorCog, Table, BarChart3, RefreshCw, SortDesc, Moon, Sun, Calendar1 } from 'lucide-react';
import { ColoredIcon } from '@/components/ui/colored-icon';

export function DisplaySettingsForm() {
  const { t } = useTranslation();
  const {
    tablePageSize,
    setTablePageSize,
    chartTimeRange,
    setChartTimeRange,
    autoRefreshInterval,
    setAutoRefreshInterval,
    dashboardCardsSortOrder,
    setDashboardCardsSortOrder,
    startOfWeek,
    setStartOfWeek,
  } = useConfig();
  
  const { theme, toggleTheme } = useTheme();
  // Track if component has mounted on client (prevents hydration mismatch)
  // Use useState initializer to avoid set-state-in-effect warning
  const [mounted, setMounted] = useState(false);

  // Use useEffect with a flag to track mounting without directly calling setState
  useEffect(() => {
     
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6" data-screenshot-target="settings-content-card">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ColoredIcon icon={MonitorCog} color="blue" size="md" />
            {t("Display Settings")}
          </CardTitle>
          <CardDescription>
            {t("Customize how duplistatus displays your data and controls the visual appearance")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Table Page Size */}
          <div className="grid gap-2">
            <Label htmlFor="table-page-size" className="flex items-center gap-2">
              <ColoredIcon icon={Table} color="blue" size="sm" />
              {t("Table Page Size")}
            </Label>
            <Select
              value={tablePageSize.toString()}
              onValueChange={(value) => setTablePageSize(parseInt(value) as TablePageSize)}
            >
              <SelectTrigger id="table-page-size">
                <SelectValue placeholder={t("Select page size")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">{t("{{count}} rows", { count: 5 })}</SelectItem>
                <SelectItem value="10">{t("{{count}} rows", { count: 10 })}</SelectItem>
                <SelectItem value="15">{t("{{count}} rows", { count: 15 })}</SelectItem>
                <SelectItem value="20">{t("{{count}} rows", { count: 20 })}</SelectItem>
                <SelectItem value="25">{t("{{count}} rows", { count: 25 })}</SelectItem>
                <SelectItem value="30">{t("{{count}} rows", { count: 30 })}</SelectItem>
                <SelectItem value="40">{t("{{count}} rows", { count: 40 })}</SelectItem>
                <SelectItem value="50">{t("{{count}} rows", { count: 50 })}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chart Time Range */}
          <div className="grid gap-2">
            <Label htmlFor="chart-time-range" className="flex items-center gap-2">
              <ColoredIcon icon={BarChart3} color="green" size="sm" />
              {t("Chart Time Range")}
            </Label>
            <Select
              value={chartTimeRange}
              onValueChange={(value) => setChartTimeRange(value as '2 weeks' | '1 month' | '3 months' | '6 months' | '1 year' | '2 years' | 'All data')}
            >
              <SelectTrigger id="chart-time-range">
                <SelectValue placeholder={t("Select time range")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2 weeks">{t("Last 2 weeks")}</SelectItem>
                <SelectItem value="1 month">{t("Last month")}</SelectItem>
                <SelectItem value="3 months">{t("Last quarter")}</SelectItem>
                <SelectItem value="6 months">{t("Last semester")}</SelectItem>
                <SelectItem value="1 year">{t("Last Year")}</SelectItem>
                <SelectItem value="2 years">{t("Last 2 years")}</SelectItem>
                <SelectItem value="All data">{t("All available data")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Auto-refresh Interval */}
          <div className="grid gap-2">
            <Label htmlFor="auto-refresh-interval" className="flex items-center gap-2">
              <ColoredIcon icon={RefreshCw} color="purple" size="sm" />
              {t("Auto-refresh Interval")}
            </Label>
            <Select
              value={autoRefreshInterval.toString()}
              onValueChange={(value) => setAutoRefreshInterval(parseFloat(value) as 0.25 | 0.5 | 1 | 2 | 3 | 4 | 5 | 10)}
            >
              <SelectTrigger id="auto-refresh-interval">
                <SelectValue placeholder={t("Select refresh interval")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.25">{t("15 seconds")}</SelectItem>
                <SelectItem value="0.5">{t("30 seconds")}</SelectItem>
                <SelectItem value="1">{t("1 minute")}</SelectItem>
                <SelectItem value="2">{t("2 minutes")}</SelectItem>
                <SelectItem value="3">{t("3 minutes")}</SelectItem>
                <SelectItem value="4">{t("4 minutes")}</SelectItem>
                <SelectItem value="5">{t("5 minutes")}</SelectItem>
                <SelectItem value="10">{t("10 minutes")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cards Sort Order */}
          <div className="grid gap-2">
            <Label htmlFor="dashboard-cards-sort-order" className="flex items-center gap-2">
              <ColoredIcon icon={SortDesc} color="yellow" size="sm" />
              {t("Cards Sort Order")}
            </Label>
            <Select
              value={dashboardCardsSortOrder}
              onValueChange={(value) => setDashboardCardsSortOrder(value as 'Server name (a-z)' | 'Status (error>warnings>success)' | 'Last backup received (new>old)')}
            >
              <SelectTrigger id="dashboard-cards-sort-order">
                <SelectValue placeholder={t("Select sort order")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Server name (a-z)">{t("Server name (a-z)")}</SelectItem>
                <SelectItem value="Status (error>warnings>success)">{t("Status (error > warning > success)")}</SelectItem>
                <SelectItem value="Last backup received (new>old)">{t("Last backup received (new > old)")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start of Week */}
          <div className="grid gap-2">
            <Label htmlFor="start-of-week" className="flex items-center gap-2">
              <ColoredIcon icon={Calendar1} color="blue" size="sm" />
              {t("Start of Week")}
            </Label>
            <Select
              value={startOfWeek}
              onValueChange={(value) => setStartOfWeek(value as StartOfWeek)}
            >
              <SelectTrigger id="start-of-week">
                <SelectValue placeholder={t("Select start of week")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="locale">{t("Based on locale")}</SelectItem>
                <SelectItem value="sunday">{t("Sunday")}</SelectItem>
                <SelectItem value="monday">{t("Monday")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Theme Toggle */}
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <ColoredIcon icon={theme === "light" ? Sun : Moon} color="orange" size="sm" />
              {t("Theme")}
            </Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={toggleTheme}
                className="w-full sm:w-auto"
                aria-label={t("Toggle Theme")}
              >
                {!mounted ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    {t("Toggle Theme")}
                  </>
                ) : theme === "light" ? (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    {t("Switch to Dark Mode")}
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    {t("Switch to Light Mode")}
                  </>
                )}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t("Current theme:")} <span className="font-medium">{theme === "light" ? t("Light") : t("Dark")}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

