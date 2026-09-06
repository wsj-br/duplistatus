"use client";

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { CalendarClock, Clock, Eye, Mail, MessageSquare, RefreshCw, Send } from 'lucide-react';
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
import type { DailySummaryPublicStatus, DailySummaryRenderedPayload, DailySummarySnapshot } from '@/lib/types';

function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function DailySummaryForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const locale = useLocale();
  const currentUser = useCurrentUser();
  const isAdmin = currentUser?.isAdmin === true;
  const { config, refreshConfigSilently } = useConfiguration();
  const status = config?.dailySummary;
  const [enabled, setEnabled] = useState(status?.enabled ?? false);
  const [localTime, setLocalTime] = useState(status?.localTime ?? '08:00');
  const [timeZone, setTimeZone] = useState(status?.timeZone ?? 'UTC');
  const [sendNtfy, setSendNtfy] = useState(status?.sendNtfy ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [enableDialogOpen, setEnableDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [preview, setPreview] = useState<{ snapshot: DailySummarySnapshot; payload: DailySummaryRenderedPayload } | null>(null);
  const viewerZone = useMemo(() => browserTimeZone(), []);

  useEffect(() => {
    if (!status) {
      return;
    }
    setEnabled(status.enabled);
    setLocalTime(status.localTime);
    setTimeZone(status.timeZone);
    setSendNtfy(status.sendNtfy);
  }, [status]);

  const save = async (next: { enabled: boolean; localTime: string; timeZone: string; sendNtfy: boolean }) => {
    setIsSaving(true);
    try {
      const response = await authenticatedRequestWithRecovery('/api/configuration/daily-summary', {
        method: 'POST',
        body: JSON.stringify(next),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: t('Failed to save daily summary settings') }));
        throw new Error(errorData.error || t('Failed to save daily summary settings'));
      }
      await refreshConfigSilently();
      toast({ title: t('Settings saved'), description: t('Daily summary settings were updated.') });
    } catch (error) {
      toast({
        title: t('Save failed'),
        description: error instanceof Error ? error.message : t('Failed to save daily summary settings'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    if (enabled && !status?.enabled) {
      setEnableDialogOpen(true);
      return;
    }
    void save({ enabled, localTime, timeZone, sendNtfy });
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
      toast({ title: t('Retry complete'), description: t('Failed channels were retried from the stored snapshot.') });
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

  const channelBadge = (channelStatus: DailySummaryPublicStatus['channels']['email']) => {
    if (!channelStatus.enabled) {
      return <Badge variant="outline">{t('Off')}</Badge>;
    }
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

  const nextIso = status?.nextOccurrenceIso;
  const nextInSavedZone = nextIso ? formatDateTime(nextIso, locale, timeZone) : t('Not scheduled');
  const nextInViewerZone = nextIso && viewerZone !== timeZone ? formatDateTime(nextIso, locale, viewerZone) : null;

  return (
    <div className="space-y-6" data-screenshot-target="settings-content-card">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ColoredIcon icon={CalendarClock} color="blue" />
            {t('Summary mode')}
          </CardTitle>
          <CardDescription>
            {t('When enabled, duplistatus sends one daily status snapshot and suppresses all individual backup and overdue email and NTFY notifications, including additional destinations. Per-job settings are kept and become active again as soon as this mode is turned off.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="daily-summary-enabled"
              checked={enabled}
              disabled={!isAdmin}
              onCheckedChange={setEnabled}
            />
            <Label htmlFor="daily-summary-enabled">{t('Enable daily summary')}</Label>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{status?.emailConfigured ? t('SMTP is configured') : t('SMTP is not configured')}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>{status?.ntfyConfigured ? t('NTFY is configured') : t('NTFY is not configured')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              <span>{status?.dispatcherHealthy ? t('Scheduler is running') : t('Scheduler is not running')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ColoredIcon icon={Clock} color="green" />
            {t('Schedule and delivery')}
          </CardTitle>
          <CardDescription>
            {t('Choose the exact local time. The saved timezone stays visible and is not replaced automatically when another browser opens Settings.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="daily-summary-time">{t('Send at')}</Label>
              <Input
                id="daily-summary-time"
                type="time"
                value={localTime}
                disabled={!isAdmin}
                onChange={(event) => setLocalTime(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Timezone')}</Label>
              <div className="flex flex-col gap-2">
                <Input value={timeZone} readOnly />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!isAdmin}
                  onClick={() => setTimeZone(browserTimeZone())}
                >
                  {t("Use this browser's timezone")}
                </Button>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('Email is always sent to the configured SMTP recipient.')}
            {config?.email?.mailto ? ` ${config.email.mailto}` : ''}
          </p>
          <div className="flex items-center gap-3">
            <Switch
              id="daily-summary-ntfy"
              checked={sendNtfy}
              disabled={!isAdmin}
              onCheckedChange={setSendNtfy}
            />
            <Label htmlFor="daily-summary-ntfy">{t('Send summary to NTFY')}</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('Next delivery')}: {nextInSavedZone}
            {nextInViewerZone ? ` (${t('your local time')}: ${nextInViewerZone})` : ''}
          </p>
          {isAdmin && (
            <Button onClick={handleSave} disabled={isSaving} variant="gradient">
              {isSaving ? t('Saving...') : t('Save')}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ColoredIcon icon={Mail} color="orange" />
            {t('Delivery status')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('Email')}</span>
                {status ? channelBadge(status.channels.email) : <Badge variant="outline">{t('Idle')}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('Last success')}: {status?.channels.email.lastSuccessAt ? formatDateTime(status.channels.email.lastSuccessAt, locale, timeZone) : t('Never')}
              </p>
              {status?.channels.email.lastError && (
                <p className="text-sm text-destructive">{status.channels.email.lastError}</p>
              )}
            </div>
            <div className="rounded-md border p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('NTFY')}</span>
                {status ? channelBadge(status.channels.ntfy) : <Badge variant="outline">{t('Off')}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('Last success')}: {status?.channels.ntfy.lastSuccessAt ? formatDateTime(status.channels.ntfy.lastSuccessAt, locale, timeZone) : t('Never')}
              </p>
              {status?.channels.ntfy.lastError && (
                <p className="text-sm text-destructive">{status.channels.ntfy.lastError}</p>
              )}
            </div>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ColoredIcon icon={Eye} color="purple" />
            {t('Preview')}
          </CardTitle>
          <CardDescription>{t('Generate the current snapshot without sending a notification.')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={() => void loadPreview()} disabled={isPreviewing}>
            {isPreviewing ? t('Generating...') : t('Generate preview')}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={preview !== null} onOpenChange={(open) => { if (!open) setPreview(null); }}>
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden sm:max-w-4xl">
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
                className="min-h-[50vh]"
              />
              <pre className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">{preview.payload.ntfyMessage}</pre>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={enableDialogOpen} onOpenChange={setEnableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Enable daily summary?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('Individual backup and overdue email and NTFY notifications will be paused, including additional destinations. Detection of overdue backups continues.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEnabled(false)}>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void save({ enabled: true, localTime, timeZone, sendNtfy })}>
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

      <p className="text-sm text-muted-foreground">
        <Link href="/settings?tab=templates" className="underline">{t('Edit Daily Summary templates')}</Link>
      </p>
    </div>
  );
}
