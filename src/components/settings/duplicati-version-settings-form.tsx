"use client";

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GitCompare, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { useConfig, useEffectiveFormatLocale, useRelativeTimeLocale } from '@/contexts/config-context';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { cronClient } from '@/lib/cron-client';
import { formatDateTime } from '@/lib/date-format';
import {
  getDuplicatiVersionRunTimesUtc,
} from '@/lib/duplicati-version';
import { isValidLocalTime, localWallTimeToUtcTime, utcTimeToLocalWallTime } from '@/lib/daily-summary-schedule';
import { DUPLICATI_CHANNELS } from '@/lib/types';
import type {
  DuplicatiChannel,
  DuplicatiVersionCache,
  DuplicatiVersionCheckInterval,
  DuplicatiVersionRefreshResult,
} from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';

interface DuplicatiVersionSettingsFormProps {
  isAdmin: boolean;
}

interface VersionSettingsResponse {
  cache: DuplicatiVersionCache | null;
  interval: DuplicatiVersionCheckInterval;
  startTimeUtc: string;
  cronExpression: string;
  enabled: boolean;
}

function getChannelLabel(channel: DuplicatiChannel, t: (key: string) => string): string {
  switch (channel) {
    case 'stable':
      return t('Stable');
    case 'beta':
      return t('Beta');
    case 'experimental':
      return t('Experimental');
    case 'canary':
      return t('Canary');
    default: {
      const exhaustive: never = channel;
      return exhaustive;
    }
  }
}

function getIntervalLabel(interval: DuplicatiVersionCheckInterval, t: (key: string) => string): string {
  switch (interval) {
    case 'daily':
      return t('Once a day');
    case '12h':
      return t('Every 12 hours');
    case '6h':
      return t('Every 6 hours');
    default: {
      const exhaustive: never = interval;
      return exhaustive;
    }
  }
}

export function DuplicatiVersionSettingsForm({ isAdmin }: DuplicatiVersionSettingsFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { showDashboardVersion, setShowDashboardVersion } = useConfig();
  const effectiveLocale = useEffectiveFormatLocale();
  const relativeTimeLocale = useRelativeTimeLocale();
  const [loading, setLoading] = useState(true);
  const [cache, setCache] = useState<DuplicatiVersionCache | null>(null);
  const [interval, setInterval] = useState<DuplicatiVersionCheckInterval>('daily');
  const [startTimeUtc, setStartTimeUtc] = useState('03:00');
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const localStartTime = useMemo(() => utcTimeToLocalWallTime(startTimeUtc), [startTimeUtc]);
  const browserTimeZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'UTC';
    }
  }, []);

  const applySettings = (data: VersionSettingsResponse) => {
    setCache(data.cache);
    setInterval(data.interval);
    setStartTimeUtc(data.startTimeUtc);
  };

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      try {
        const response = await authenticatedRequestWithRecovery('/api/configuration/duplicati-versions');
        if (!response.ok) {
          throw new Error(t('Failed to load Duplicati version settings'));
        }
        const data = await response.json() as VersionSettingsResponse;
        if (!cancelled) {
          applySettings(data);
        }
      } catch (error) {
        console.error('Failed to load Duplicati version settings:', error);
        if (!cancelled) {
          toast({
            title: t('Error'),
            description: t('Failed to load Duplicati version settings'),
            variant: 'destructive',
            duration: 3000,
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadSettings();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const localRunTimes = useMemo(
    () => getDuplicatiVersionRunTimesUtc(interval, startTimeUtc).map((time) => utcTimeToLocalWallTime(time)),
    [interval, startTimeUtc]
  );

  const saveSchedule = async (
    nextInterval: DuplicatiVersionCheckInterval,
    nextStartTimeUtc: string
  ) => {
    setIsSaving(true);
    try {
      const response = await authenticatedRequestWithRecovery('/api/configuration/duplicati-versions', {
        method: 'POST',
        body: JSON.stringify({
          interval: nextInterval,
          startTimeUtc: nextStartTimeUtc,
        }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(t('You do not have permission to modify this setting. Only administrators can change configurations.'));
        }
        const errorData = await response.json().catch(() => ({ error: t('Failed to update version check schedule') }));
        throw new Error(errorData.error || t('Failed to update version check schedule'));
      }

      const data = await response.json() as VersionSettingsResponse;
      applySettings(data);

      try {
        await cronClient.reloadConfig();
        toast({
          title: t('Success'),
          description: t('Version check schedule updated successfully'),
          duration: 2000,
        });
      } catch (cronError) {
        console.warn('Cron service not available, but configuration was saved:', cronError);
        toast({
          title: t('Success'),
          description: t("Configuration saved successfully. Note: Cron service is not running - start it with 'npm run cron:start' to enable scheduled tasks."),
          duration: 2000,
        });
      }
    } catch (error) {
      toast({
        title: t('Error'),
        description: error instanceof Error ? error.message : t('Failed to update version check schedule'),
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleIntervalChange = (value: DuplicatiVersionCheckInterval) => {
    setInterval(value);
    void saveSchedule(value, startTimeUtc);
  };

  const handleLocalStartTimeChange = (value: string) => {
    if (!isValidLocalTime(value)) {
      return;
    }
    const nextStartTimeUtc = localWallTimeToUtcTime(value);
    setStartTimeUtc(nextStartTimeUtc);
    void saveSchedule(interval, nextStartTimeUtc);
  };

  const handleForceUpdate = async () => {
    setIsRefreshing(true);
    try {
      const response = await authenticatedRequestWithRecovery('/api/configuration/duplicati-versions/refresh', {
        method: 'POST',
      });
      const result = await response.json() as DuplicatiVersionRefreshResult & { error?: string };

      if (!response.ok || !result.success) {
        if (response.status === 403) {
          throw new Error(t('You do not have permission to refresh Duplicati versions. Only administrators can perform this action.'));
        }
        setCache(result.cache ?? cache);
        throw new Error(result.error || result.message || t('Failed to refresh Duplicati versions'));
      }

      setCache(result.cache);
      toast({
        title: t('Versions updated'),
        description: result.message,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: t('Error'),
        description: error instanceof Error ? error.message : t('Failed to refresh Duplicati versions'),
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-screenshot-target="settings-content-card">
      <Card variant="modern">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ColoredIcon icon={GitCompare} color="blue" size="lg" />
            <div>
              <CardTitle>{t('Duplicati Versions')}</CardTitle>
              <CardDescription className="mt-1">
                {t('Latest Duplicati release versions cached from GitHub, and the schedule used to refresh them.')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium">{t('Latest channel versions')}</h3>
              <p className="text-sm text-muted-foreground">
                {cache?.updatedAt
                  ? t('Last update: {{time}} ({{relative}})', {
                      time: formatDateTime(cache.updatedAt, effectiveLocale),
                      relative: formatRelativeTime(cache.updatedAt, undefined, relativeTimeLocale),
                    })
                  : t('The version cache has never been updated.')}
              </p>
            </div>

            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Channel')}</TableHead>
                    <TableHead>{t('Latest version')}</TableHead>
                    <TableHead>{t('Release tag')}</TableHead>
                    <TableHead>{t('Published')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DUPLICATI_CHANNELS.map((channel) => {
                    const value = cache?.channels[channel] ?? null;
                    return (
                      <TableRow key={channel}>
                        <TableCell className="font-medium">{getChannelLabel(channel, t)}</TableCell>
                        <TableCell>{value?.versionNumber ?? t('Unavailable')}</TableCell>
                        <TableCell className="text-muted-foreground">{value?.tagName ?? '—'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {value?.publishedAt
                            ? formatDateTime(value.publishedAt, effectiveLocale)
                            : '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  void handleForceUpdate();
                }}
                variant="gradient"
                disabled={!isAdmin || isRefreshing}
              >
                {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                {isRefreshing ? t('Updating...') : t('Update now')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <Label htmlFor="show-dashboard-version-tab" className="mb-2 text-sm">
                {t('Show version on dashboard')}
              </Label>
              <div className="flex items-center space-x-2 min-h-9">
                <Checkbox
                  id="show-dashboard-version-tab"
                  checked={showDashboardVersion}
                  onCheckedChange={(checked) => setShowDashboardVersion(checked === true)}
                />
                <Label htmlFor="show-dashboard-version-tab" className="text-sm font-normal cursor-pointer">
                  {showDashboardVersion ? t('On') : t('Off')}
                </Label>
              </div>
            </div>

            <div className="flex flex-col">
              <Label htmlFor="duplicati-version-interval" className="mb-2 text-sm">
                {t('Version check interval')}
              </Label>
              <Select
                value={interval}
                onValueChange={(value: DuplicatiVersionCheckInterval) => handleIntervalChange(value)}
                disabled={!isAdmin || isSaving}
              >
                <SelectTrigger id="duplicati-version-interval" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['daily', '12h', '6h'] as const).map((value) => (
                    <SelectItem key={value} value={value}>
                      {getIntervalLabel(value, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">
              <Label htmlFor="duplicati-version-start-hour" className="mb-2 text-sm">
                {t('Start time ({{timeZone}})', { timeZone: browserTimeZone })}
              </Label>
              <Input
                id="duplicati-version-start-hour"
                type="time"
                value={localStartTime}
                disabled={!isAdmin || isSaving}
                onChange={(event) => handleLocalStartTimeChange(event.target.value)}
                className="relative w-[9.25rem] max-w-full pl-3 pr-8 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-y-0 [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:my-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {t('Stored as {{time}} UTC. Runs at {{times}}.', {
                  time: startTimeUtc,
                  times: localRunTimes.join(', '),
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
