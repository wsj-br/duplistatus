'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Bell, Mail, Settings, Siren } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, GradientCardHeader } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/hooks/use-current-user';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { formatSQLiteTimestamp } from '@/lib/date-format';
import { formatRelativeTime } from '@/lib/utils';
import { useEffectiveFormatLocale, useRelativeTimeLocale } from '@/contexts/config-context';

const POLL_MS = 60_000;

type NotificationChannelId = 'email' | 'ntfy';

interface NotificationChannelAlert {
  channel: NotificationChannelId;
  error: string;
  latestTimestamp: string;
  failureCount: number;
  settingsTab: NotificationChannelId;
  host?: string;
  topic?: string;
}

const ORIGINAL_ERROR_MARKER = '\n\nOriginal error: ';

function splitDeliveryError(error: string): { summary: string; original?: string } {
  const index = error.indexOf(ORIGINAL_ERROR_MARKER);
  if (index === -1) {
    return { summary: error };
  }
  const summary = error.slice(0, index).trim();
  const original = error.slice(index + ORIGINAL_ERROR_MARKER.length).trim();
  return {
    summary,
    original: original.length > 0 ? original : undefined,
  };
}

function isChannel(value: unknown): value is NotificationChannelId {
  return value === 'email' || value === 'ntfy';
}

function parseAlerts(payload: unknown): NotificationChannelAlert[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }
  const alerts = (payload as { alerts?: unknown }).alerts;
  if (!Array.isArray(alerts)) {
    return [];
  }
  const result: NotificationChannelAlert[] = [];
  for (const item of alerts) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const record = item as Record<string, unknown>;
    if (!isChannel(record.channel) || !isChannel(record.settingsTab)) {
      continue;
    }
    if (typeof record.error !== 'string' || typeof record.latestTimestamp !== 'string') {
      continue;
    }
    if (typeof record.failureCount !== 'number' || !Number.isFinite(record.failureCount)) {
      continue;
    }
    result.push({
      channel: record.channel,
      error: record.error,
      latestTimestamp: record.latestTimestamp,
      failureCount: record.failureCount,
      settingsTab: record.settingsTab,
      host: typeof record.host === 'string' && record.host.trim() !== '' ? record.host : undefined,
      topic: typeof record.topic === 'string' && record.topic.trim() !== '' ? record.topic : undefined,
    });
  }
  return result;
}

export function NotificationChannelAlertButton() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const user = useCurrentUser();
  const formatLocale = useEffectiveFormatLocale();
  const relativeTimeLocale = useRelativeTimeLocale();
  const isAdmin = user?.isAdmin === true;
  const [alerts, setAlerts] = useState<NotificationChannelAlert[]>([]);
  const [open, setOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const loadSeq = useRef(0);
  const clearingRef = useRef(false);

  const loadAlerts = useCallback(async () => {
    if (clearingRef.current) {
      return;
    }
    const seq = ++loadSeq.current;
    try {
      const response = await authenticatedRequestWithRecovery('/api/notification-channel-alerts');
      if (!response.ok || clearingRef.current || seq !== loadSeq.current) {
        return;
      }
      const payload: unknown = await response.json();
      if (clearingRef.current || seq !== loadSeq.current) {
        return;
      }
      setAlerts(parseAlerts(payload));
    } catch {
      // Keep the last known alerts when a poll fails.
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    let timer: number | undefined;
    let cancelled = false;

    const load = async () => {
      if (cancelled || document.visibilityState !== 'visible') {
        return;
      }
      await loadAlerts();
    };

    void load();
    timer = window.setInterval(() => {
      void load();
    }, POLL_MS);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void load();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      if (timer !== undefined) {
        window.clearInterval(timer);
      }
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isAdmin, loadAlerts]);

  const clearAlerts = async () => {
    if (alerts.length === 0 || clearingRef.current) {
      return;
    }
    clearingRef.current = true;
    loadSeq.current += 1;
    setClearing(true);
    try {
      const response = await authenticatedRequestWithRecovery('/api/notification-channel-alerts', {
        method: 'POST',
        body: JSON.stringify({ channels: alerts.map((alert) => alert.channel) }),
      });
      if (!response.ok) {
        toast({
          title: t("Could not clear notification alerts"),
          description: t("Try again in a moment."),
          variant: 'destructive',
        });
        return;
      }
      const payload: unknown = await response.json();
      const next = parseAlerts(payload);
      setAlerts(next);
      if (next.length === 0) {
        setOpen(false);
      }
    } catch {
      toast({
        title: t("Could not clear notification alerts"),
        description: t("Try again in a moment."),
        variant: 'destructive',
      });
    } finally {
      clearingRef.current = false;
      setClearing(false);
    }
  };

  if (!isAdmin || alerts.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-red-300 bg-red-50 text-red-700 hover:border-red-400 hover:bg-red-100 hover:text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400 dark:hover:border-red-700 dark:hover:bg-red-950/70 dark:hover:text-red-300"
          title={t("Delivery failures")}
          aria-label={t("Delivery failures")}
        >
          <Siren className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[28rem] max-w-[calc(100vw-2rem)] overflow-hidden p-0 shadow-lg backdrop-blur-sm bg-popover/95 border-border/50"
      >
        <GradientCardHeader className="m-0 rounded-t-md">
          <h4 className="text-lg font-semibold leading-none text-white">{t("Delivery failures")}</h4>
        </GradientCardHeader>
        <div className="grid max-h-[calc(100vh-8rem)] gap-4 overflow-y-auto p-4">
        <div className="space-y-3">
          {alerts.map((alert) => {
            const { summary, original } = splitDeliveryError(alert.error);
            const settingsHref = alert.settingsTab === 'email' ? '/settings?tab=email' : '/settings?tab=ntfy';
            const settingsLabel = alert.channel === 'email' ? t("Open Email settings") : t("Open NTFY settings");
            return (
              <Card key={alert.channel} className="shadow-sm">
                <div className="space-y-3 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {alert.channel === 'email' ? (
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Bell className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{alert.channel === 'email' ? t("Email") : t("NTFY")}</span>
                  </div>
                  <Link
                    href={settingsHref}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 underline decoration-blue-600/80 underline-offset-4 hover:text-blue-700 dark:text-blue-400 dark:decoration-blue-400/80 dark:hover:text-blue-300"
                    onClick={() => setOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    {settingsLabel}
                  </Link>
                  <p className="text-sm leading-relaxed break-words">
                    {summary || t("Delivery failed")}
                  </p>
                  {original ? (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">{t("Original error")}</p>
                      <pre className="rounded-md border bg-muted/60 p-2.5 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap break-words">
                        {original}
                      </pre>
                    </div>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
        <div className="space-y-2">
          {alerts.map((alert) => {
            const absoluteTime = formatSQLiteTimestamp(alert.latestTimestamp, formatLocale);
            const relativeTime = formatRelativeTime(alert.latestTimestamp, undefined, relativeTimeLocale);
            const lastFailureTime = relativeTime ? `${absoluteTime} (${relativeTime})` : absoluteTime;
            return (
              <div key={alert.channel} className="space-y-2 rounded-md border bg-muted/40 px-3 py-2.5">
                {alert.channel === 'email' && alert.host ? (
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="shrink-0 text-muted-foreground">{t("SMTP host")}</span>
                    <span className="text-right font-medium break-all">{alert.host}</span>
                  </div>
                ) : null}
                {alert.channel === 'ntfy' && alert.topic ? (
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="shrink-0 text-muted-foreground">{t("NTFY topic")}</span>
                    <span className="text-right font-medium break-all">{alert.topic}</span>
                  </div>
                ) : null}
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="shrink-0 text-muted-foreground">{t("Last failure")}</span>
                  <span className="text-right font-medium">{lastFailureTime}</span>
                </div>
                <div className="border-t pt-2 text-sm font-semibold">
                  {t("{{count}} failed deliveries", { plurals: true, count: alert.failureCount })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setOpen(false)}
          >
            {t("Close")}
          </Button>
          <Button
            variant="gradient"
            className="flex-1"
            disabled={clearing}
            onClick={() => {
              void clearAlerts();
            }}
          >
            {t("Clear")}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("Clear hides these messages until a newer failure is logged.")}
        </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
