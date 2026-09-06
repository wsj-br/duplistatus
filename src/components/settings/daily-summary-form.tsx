"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { CalendarClock, Clock, Eye, FileText, Globe, Mail, RefreshCw, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { EmailHtmlPreviewIframe } from '@/components/settings/email-html-preview-iframe';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useConfiguration } from '@/contexts/configuration-context';
import { useCurrentUser } from '@/hooks/use-current-user';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { formatDateTime } from '@/lib/date-format';
import { useLocale } from '@/contexts/locale-context';
import { localWallTimeToUtcTime, utcTimeToLocalWallTime } from '@/lib/daily-summary-schedule';
import type { DailySummaryChannelPublicStatus, DailySummaryPublicStatus, DailySummaryRenderedPayload, DailySummarySnapshot } from '@/lib/types';

interface DailySummaryFormState {
  enabled: boolean;
  utcTime: string;
  timeZone: string;
  publicUrl: string;
}

function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

const AUTO_SAVE_DEBOUNCE_MS = 800;

export function DailySummaryForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const locale = useLocale();
  const currentUser = useCurrentUser();
  const isAdmin = currentUser?.isAdmin === true;
  const { config, refreshConfigSilently } = useConfiguration();
  const status = config?.dailySummary;
  const [enabled, setEnabled] = useState(status?.enabled ?? false);
  const [sendAtLocal, setSendAtLocal] = useState(() => utcTimeToLocalWallTime(status?.utcTime ?? '08:00'));
  const [publicUrl, setPublicUrl] = useState(status?.publicUrl ?? '');
  const [isSending, setIsSending] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [enableDialogOpen, setEnableDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [preview, setPreview] = useState<{ snapshot: DailySummarySnapshot; payload: DailySummaryRenderedPayload } | null>(null);
  const viewerZone = useMemo(() => browserTimeZone(), []);

  const hasHydratedRef = useRef(false);
  const skipNextAutoSaveRef = useRef(false);
  const isSaveInProgressRef = useRef(false);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formStateRef = useRef<DailySummaryFormState>({
    enabled: status?.enabled ?? false,
    utcTime: status?.utcTime ?? '08:00',
    timeZone: viewerZone,
    publicUrl: status?.publicUrl ?? '',
  });

  formStateRef.current = {
    enabled,
    utcTime: localWallTimeToUtcTime(sendAtLocal),
    timeZone: viewerZone,
    publicUrl,
  };

  useEffect(() => {
    if (!status) {
      return;
    }
    skipNextAutoSaveRef.current = true;
    setEnabled(status.enabled);
    setSendAtLocal(utcTimeToLocalWallTime(status.utcTime));
    setPublicUrl(status.publicUrl ?? '');
    hasHydratedRef.current = true;
  }, [status]);

  const persistSettings = useCallback(async (next: DailySummaryFormState) => {
    if (isSaveInProgressRef.current) {
      return;
    }
    isSaveInProgressRef.current = true;
    try {
      const response = await authenticatedRequestWithRecovery('/api/configuration/daily-summary', {
        method: 'POST',
        body: JSON.stringify(next),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: t('Failed to save daily summary settings') }));
        throw new Error(errorData.error || t('Failed to save daily summary settings'));
      }
      skipNextAutoSaveRef.current = true;
      await refreshConfigSilently();
    } catch (error) {
      toast({
        title: t('Save failed'),
        description: error instanceof Error ? error.message : t('Failed to save daily summary settings'),
        variant: 'destructive',
      });
    } finally {
      isSaveInProgressRef.current = false;
    }
  }, [refreshConfigSilently, t, toast]);

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveTimeoutRef.current = null;
      void persistSettings(formStateRef.current);
    }, AUTO_SAVE_DEBOUNCE_MS);
  }, [persistSettings]);

  useEffect(() => {
    if (!hasHydratedRef.current || !isAdmin || !status) {
      return;
    }
    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      return;
    }
    if (enabled && !status.enabled) {
      return;
    }
    scheduleAutoSave();
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }
    };
  }, [enabled, sendAtLocal, publicUrl, isAdmin, status, scheduleAutoSave, viewerZone]);

  useEffect(() => () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  }, []);

  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked);
    if (checked && !status?.enabled) {
      setEnableDialogOpen(true);
    }
  };

  const loadPreview = async () => {
    setIsPreviewing(true);
    try {
      const response = await authenticatedRequestWithRecovery('/api/configuration/daily-summary/preview', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        throw new Error(t('Failed to generate preview'));
      }
      const data = await response.json() as { snapshot: DailySummarySnapshot; payload: DailySummaryRenderedPayload };
      setPreview(data);
    } catch (error) {
      toast({
        title: t('Preview failed'),
        description: error instanceof Error ? error.message : t('Failed to generate preview'),
        variant: 'destructive',
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  const sendNow = async () => {
    setIsSending(true);
    try {
      const response = await authenticatedRequestWithRecovery('/api/configuration/daily-summary/send', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || t('Failed to send daily summary'));
      }
      await refreshConfigSilently();
      toast({ title: t('Summary sent'), description: t('The current backup summary was sent.') });
    } catch (error) {
      toast({
        title: t('Send failed'),
        description: error instanceof Error ? error.message : t('Failed to send daily summary'),
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
      setSendDialogOpen(false);
    }
  };

  const retry = async () => {
    setIsRetrying(true);
    try {
      const response = await authenticatedRequestWithRecovery('/api/configuration/daily-summary/retry', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const data = await response.json() as { error?: string; skippedReason?: string };
      if (!response.ok) {
        throw new Error(data.error || t('Failed to retry delivery'));
      }
      await refreshConfigSilently();
      toast({ title: t('Retry complete'), description: t('Failed delivery was retried from the stored snapshot.') });
    } catch (error) {
      toast({
        title: t('Retry failed'),
        description: error instanceof Error ? error.message : t('Failed to retry delivery'),
        variant: 'destructive',
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const channelBadge = (channelStatus: DailySummaryChannelPublicStatus) => {
    switch (channelStatus.state) {
      case 'sent':
        return <Badge variant="success">{t('Sent')}</Badge>;
      case 'failed':
        return <Badge variant="error">{t('Failed')}</Badge>;
      case 'sending':
        return <Badge variant="warning">{t('Sending')}</Badge>;
      case 'pending':
        return <Badge variant="warning">{t('Pending')}</Badge>;
      default:
        return <Badge variant="outline">{t('Idle')}</Badge>;
    }
  };

  const storedUtcTime = status?.utcTime ?? localWallTimeToUtcTime(sendAtLocal);
  const nextIso = status?.nextOccurrenceIso;
  const nextInLocalZone = nextIso ? formatDateTime(nextIso, locale, viewerZone) : t('Not scheduled');

  return (
    <div className="space-y-6" data-screenshot-target="settings-content-card">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ColoredIcon icon={CalendarClock} color="blue" size="md" />
            {t('Daily Summary')}
          </CardTitle>
          <CardDescription>
            {t('When enabled, duplistatus sends one daily status snapshot by email and suppresses individual backup and overdue email notifications, including additional email destinations. Per-job NTFY settings are kept and continue to work. All settings become active again as soon as this mode is turned off.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="flex h-full flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ColoredIcon icon={CalendarClock} color="blue" size="sm" />
                  {t('Summary mode')}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Switch
                    id="daily-summary-enabled"
                    checked={enabled}
                    disabled={!isAdmin}
                    onCheckedChange={handleEnabledChange}
                  />
                  <Label htmlFor="daily-summary-enabled">{t('Enable daily summary')}</Label>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Mail className="h-4 w-4 shrink-0" />
                    {status?.emailConfigured && config?.email?.mailto ? (
                      <span>
                        {t('SMTP recipient')}:
                        {' '}
                        <Link
                          href="/settings?tab=email"
                          className="font-semibold text-primary no-underline hover:underline"
                        >
                          {config.email.mailto}
                        </Link>
                      </span>
                    ) : (
                      <span>{status?.emailConfigured ? t('SMTP is configured') : t('SMTP is not configured')}</span>
                    )}
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => void loadPreview()}
                    disabled={isPreviewing}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {isPreviewing ? t('Generating...') : t('Preview')}
                  </Button>
                  <Link
                    href="/settings?tab=templates&templateTab=daily-summary"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary no-underline hover:underline"
                  >
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    {t('Edit Daily Summary templates')}
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ColoredIcon icon={Mail} color="orange" size="sm" />
                  {t('Delivery status')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t('Email')}</span>
                    {status ? channelBadge(status.channel) : <Badge variant="outline">{t('Idle')}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('Last success')}: {status?.channel.lastSuccessAt ? formatDateTime(status.channel.lastSuccessAt, locale, viewerZone) : t('Never')}
                  </p>
                  {status?.channel.lastError && (
                    <p className="text-sm text-destructive">{status.channel.lastError}</p>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setSendDialogOpen(true)} disabled={isSending || !enabled} variant="gradient">
                      <Send className="h-4 w-4 mr-2" />
                      {isSending ? t('Sending...') : t('Send summary now')}
                    </Button>
                    <Button variant="outline" onClick={() => void retry()} disabled={isRetrying}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {isRetrying ? t('Retrying...') : t('Retry failed delivery')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ColoredIcon icon={Globe} color="blue" size="sm" />
                  {t('Public dashboard URL')}
                </CardTitle>
                <CardDescription>
                  {t('Used for {{duplistatus_link}} in the Daily Summary email. Leave empty to omit the dashboard link.')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="daily-summary-public-url">{t('Dashboard URL')}</Label>
                  <Input
                    id="daily-summary-public-url"
                    type="url"
                    inputMode="url"
                    placeholder="https://duplistatus.example.com"
                    value={publicUrl}
                    disabled={!isAdmin || status?.publicUrlEnvOverride === true}
                    onChange={(event) => setPublicUrl(event.target.value)}
                  />
                </div>
                {status?.publicUrlEnvOverride && (
                  <Alert>
                    <Globe className="h-4 w-4" />
                    <AlertDescription>
                      {t('The DUPLISTATUS_PUBLIC_URL environment variable overrides this setting.')}
                    </AlertDescription>
                  </Alert>
                )}
                {status?.publicUrlEffective && (
                  <p className="text-sm text-muted-foreground">
                    {t('Effective URL')}: {status.publicUrlEffective}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ColoredIcon icon={Clock} color="green" size="sm" />
                  {t('Schedule and delivery')}
                </CardTitle>
                <CardDescription>
                  {t('Choose the exact local time in your browser timezone. The schedule is stored in UTC.')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="daily-summary-time">
                    {t('Send at ({{timeZone}})', { timeZone: viewerZone })}
                  </Label>
                  <Input
                    id="daily-summary-time"
                    type="time"
                    value={sendAtLocal}
                    disabled={!isAdmin}
                    onChange={(event) => setSendAtLocal(event.target.value)}
                    className="relative w-[9.25rem] max-w-full pl-3 pr-8 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-y-0 [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:my-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('Stored as {{time}} UTC. Runs at {{localTime}}.', {
                      time: storedUtcTime,
                      localTime: sendAtLocal,
                    })}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('Next delivery')}: {nextInLocalZone}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Dialog open={preview !== null} onOpenChange={(open) => { if (!open) setPreview(null); }}>
        <DialogContent className="flex max-h-[92vh] w-[min(100vw-2rem,72rem)] max-w-none flex-col overflow-hidden sm:max-w-none">
          <DialogHeader>
            <DialogTitle>{t('Preview')}</DialogTitle>
            <DialogDescription>
              {t('Current snapshot rendered without sending a notification.')}
            </DialogDescription>
          </DialogHeader>
          {preview && (
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
              <p className="text-sm">
                {t('Jobs')}: {preview.snapshot.jobCount} · {t('Overdue')}: {preview.snapshot.overdueCount} · {t('No report received')}: {preview.snapshot.noReportCount}
              </p>
              {preview.snapshot.omittedJobCount > 0 && (
                <Alert>
                  <AlertDescription>
                    {t('Some jobs were omitted from the email because the message reached the size limit.')}
                  </AlertDescription>
                </Alert>
              )}
              <EmailHtmlPreviewIframe
                title={t('Email HTML preview')}
                html={preview.payload.emailHtml}
                className="min-h-[62vh]"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={enableDialogOpen} onOpenChange={setEnableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Enable daily summary?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('Individual backup and overdue email notifications will be paused, including additional email destinations. NTFY notifications continue. Detection of overdue backups continues.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEnabled(false)}>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void persistSettings(formStateRef.current)}>
              {t('Enable')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Send the current summary now?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('This sends an extra summary immediately and does not replace the next scheduled delivery.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void sendNow()}>{t('Send now')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
