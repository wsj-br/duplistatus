"use client";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from 'react';
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
import { cn } from '@/lib/utils';
import { useConfig } from '@/contexts/config-context';
import { useTheme } from '@/contexts/theme-context';
import type { TablePageSize } from '@/contexts/config-context';
import type { FormatLocaleOverride, StartOfWeek } from '@/lib/types';
import { MonitorCog, Table, BarChart3, RefreshCw, SortDesc, Moon, Sun, Calendar1, Languages, Check, ChevronsUpDown, SunMoon } from 'lucide-react';
import { ColoredIcon } from '@/components/ui/colored-icon';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import supportedLocales from '@/locales/supported-locales.json';
import { useLocale } from '@/contexts/locale-context';

interface SupportedLocale {
  code: string;
  label: string;
  englishName: string;
  direction: string;
}

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
    formatLocale,
    setFormatLocale,
  } = useConfig();
  
  const { themePreference, resolvedTheme, setThemePreference } = useTheme();
  const uiLocale = useLocale();
  // Track if component has mounted on client (prevents hydration mismatch)
  // Use useState initializer to avoid set-state-in-effect warning
  const [mounted, setMounted] = useState(false);
  const [localePopoverOpen, setLocalePopoverOpen] = useState(false);
  const [localeSearch, setLocaleSearch] = useState('');

  // Use useEffect with a flag to track mounting without directly calling setState
  useEffect(() => {
     
    setMounted(true);
  }, []);

  const formatLocalePreview = useCallback(() => {
    const locale = formatLocale === 'locale-default' ? uiLocale : formatLocale;
    const sampleDate = new Date('2024-12-31T14:30:00');
    const sampleNumber = 1234.56;
    try {
      const dateStr = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(sampleDate);
      const timeStr = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(sampleDate);
      const numStr = new Intl.NumberFormat(locale).format(sampleNumber);
      return { date: dateStr, time: timeStr, number: numStr };
    } catch {
      return { date: '31/12/2024', time: '14:30', number: '1,234.56' };
    }
  }, [formatLocale, uiLocale]);

  const selectedLocaleLabel = formatLocale === 'locale-default'
    ? t("UI locale") + ` (${uiLocale})`
    : (() => {
        const selected = (supportedLocales as SupportedLocale[]).find(l => l.code === formatLocale);
        if (selected) {
          return (
            <>
              {selected.englishName}
              <span className="text-muted-foreground ml-3">{selected.label}</span>
            </>
          );
     
        }
        return formatLocale;
      })()

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
         <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-0">
          {/* Left Column  ----------------------------------------------------------------------------------------------------- */}
          <div className="flex flex-col gap-y-8">

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

          </div> {/* end of Left Column ---------------------------------------------------------------------------------------- */}

          {/* Right Column ----------------------------------------------------------------------------------------------------- */}
          <div className="flex flex-col gap-y-8 mt-8 md:mt-0">

            {/* Theme */}
            <div className="grid gap-2">
              <Label id="display-theme-label" className="flex items-center gap-2">
                <ColoredIcon
                  icon={
                    themePreference === 'system'
                      ? SunMoon
                      : resolvedTheme === 'light'
                        ? Sun
                        : Moon
                  }
                  color="orange"
                  size="sm"
                />
                {t("Theme")}
              </Label>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <div
                  id="theme-preference"
                  className="inline-flex rounded-md border border-input bg-muted/40 p-1 shadow-sm"
                  role="group"
                  aria-labelledby="display-theme-label"
                >
                  <Button
                    type="button"
                    variant={themePreference === 'light' ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      'rounded-sm px-3 shadow-none',
                      themePreference === 'light' && 'bg-background shadow-sm',
                    )}
                    onClick={() => setThemePreference('light')}
                    aria-pressed={themePreference === 'light'}
                  >
                    <Sun className="mr-1.5 h-4 w-4 shrink-0" aria-hidden />
                    {t('Light')}
                  </Button>
                  <Button
                    type="button"
                    variant={themePreference === 'dark' ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      'rounded-sm px-3 shadow-none',
                      themePreference === 'dark' && 'bg-background shadow-sm',
                    )}
                    onClick={() => setThemePreference('dark')}
                    aria-pressed={themePreference === 'dark'}
                  >
                    <Moon className="mr-1.5 h-4 w-4 shrink-0" aria-hidden />
                    {t('Dark')}
                  </Button>
                  <Button
                    type="button"
                    variant={themePreference === 'system' ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      'rounded-sm px-3 shadow-none',
                      themePreference === 'system' && 'bg-background shadow-sm',
                    )}
                    onClick={() => setThemePreference('system')}
                    aria-pressed={themePreference === 'system'}
                  >
                    <SunMoon className="mr-1.5 h-4 w-4 shrink-0" aria-hidden />
                    {t('System (follow OS)')}
                  </Button>
                </div>
              </div>
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


            {/* Format Locale Override */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <ColoredIcon icon={Languages} color="green" size="sm" />
                {t("Format Locale")}
              </Label>
              <Popover open={localePopoverOpen} onOpenChange={setLocalePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={localePopoverOpen}
                    className="w-full justify-between"
                  >
                    <span className="truncate">{selectedLocaleLabel}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder={t("Search locales...")}
                      value={localeSearch}
                      onValueChange={setLocaleSearch}
                    />
                    <CommandList>
                      <CommandEmpty>{t("No locale found")}</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="locale-default"
                          onSelect={() => {
                            setFormatLocale('locale-default' as FormatLocaleOverride);
                            setLocalePopoverOpen(false);
                            setLocaleSearch('');
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${formatLocale === 'locale-default' ? 'opacity-100' : 'opacity-0'}`}
                          />
                          <span className="text-blue-500 font-bold">{t("UI locale")} ({uiLocale})</span>
                        </CommandItem>
                        {(supportedLocales as SupportedLocale[])
                          .filter(l => {
                            if (!localeSearch) return true;
                            const q = localeSearch.toLowerCase();
                            return l.code.toLowerCase().includes(q) || l.label.toLowerCase().includes(q) || l.englishName.toLowerCase().includes(q);
                          })
                          .map((locale) => (
                            <CommandItem
                              key={locale.code}
                              value={locale.code}
                              onSelect={() => {
                                setFormatLocale(locale.code as FormatLocaleOverride);
                                setLocalePopoverOpen(false);
                                setLocaleSearch('');
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 flex-shrink-0 ${formatLocale === locale.code ? 'opacity-100' : 'opacity-0'}`}
                              />
                              <span className="font-mono text-xs min-w-[60px]">{locale.code}</span>
                              <span className="text-xs min-w-[120px]">{locale.englishName}</span>
                              <span className="text-xs text-muted-foreground min-w-[120px]">{locale.label}</span>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {mounted && (
                <div className="mt-1 rounded-md border bg-muted/50 p-3 text-xs space-y-1">
                  {/* {formatLocale === 'locale-default' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("Locale")}:</span>
                      <span className="font-mono">{selectedLocaleLabel}</span>
                    </div>
                  )} */}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("Date")}:</span>
                    <span className="font-mono">{formatLocalePreview().date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("Time")}:</span>
                    <span className="font-mono">{formatLocalePreview().time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("Number")}:</span>
                    <span className="font-mono">{formatLocalePreview().number}</span>
                  </div>
                </div>
              )}
            </div>

 
        </div>
        </CardContent>
      </Card>
    </div>
  );
}

