import { randomUUID } from 'crypto';
import type {
  DailySummaryChannel,
  DailySummaryChannelPublicStatus,
  DailySummaryConfig,
  DailySummaryJobRow,
  DailySummaryPublicStatus,
  DailySummaryRenderedPayload,
  DailySummarySnapshot,
  DailySummaryTemplateSet,
  DailySummaryTrigger,
  NtfyConfig,
  SMTPConfig,
} from '@/lib/types';
import { DAILY_SUMMARY_DISPATCH_TASK } from '@/lib/types';
import { db, dbOps, formatDurationFromSeconds } from '@/lib/db';
import {
  getConfigOverdueTolerance,
  getCronConfig,
  getDailySummaryConfig,
  getNotificationTemplates,
  getNtfyConfig,
  getRawBackupSettingsMap,
  getSMTPConfig,
} from '@/lib/db-utils';
import {
  buildDailySummarySnapshot,
  isProblemJob,
  type SummaryLatestResultRow,
  type SummaryServerRow,
} from '@/lib/daily-summary-aggregate';
import {
  evaluateScheduledOccurrence,
  findNextOccurrence,
  formatLocalCalendarDate,
  manualOccurrenceKey,
} from '@/lib/daily-summary-schedule';
import {
  claimDelivery,
  ensureDeliveryRows,
  finalizeDeliveryFailure,
  finalizeDeliverySuccess,
  getFailedRetryableDeliveries,
  getLatestDeliveriesByChannel,
  parseStoredPayload,
  pruneOldDeliveries,
  type DailySummaryDeliveryRecord,
} from '@/lib/daily-summary-ledger';
import {
  htmlTable,
  renderMarkdownEmail,
  substitutePlainTemplate,
  textTable,
} from '@/lib/notification-template-renderer';
import {
  EMAIL_HTML_MAX_BYTES,
  NTFY_MESSAGE_MAX_BYTES,
  truncateNtfyAtLineBoundary,
  utf8ByteLength,
  validateDailySummaryTemplateSet,
} from '@/lib/notification-template-validation';
import { formatDateTime } from '@/lib/date-format';
import { formatBytes, formatInteger } from '@/lib/number-format';
import { getServerI18nForLanguage } from '@/lib/i18n-server';
import { sendEmailNotification, sendNtfyNotification } from '@/lib/notifications';
import { SOURCE_LOCALE } from '@/lib/locales';

export const DAILY_SUMMARY_TRANSPORT_TIMEOUT_MS = 45 * 1000;

let dispatchInProgress = false;

export function isSmtpConfiguredForSummary(config: SMTPConfig | null): boolean {
  return Boolean(
    config
    && config.host?.trim()
    && Number(config.port) > 0
    && typeof config.mailto === 'string'
    && config.mailto.includes('@')
  );
}

export function isNtfyConfiguredForSummary(config: NtfyConfig | null | undefined): boolean {
  if (!config?.url?.trim() || !config.topic?.trim()) {
    return false;
  }
  try {
    const parsed = new URL(config.url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getCronServiceBaseUrl(): string {
  if (process.env.CRON_SERVICE_URL) {
    return process.env.CRON_SERVICE_URL.replace(/\/$/, '');
  }
  const cronConfig = getCronConfig();
  return `http://127.0.0.1:${cronConfig.port}`;
}

export function cronServiceHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const secret = process.env.CRON_SERVICE_SECRET;
  if (secret) {
    headers['X-Cron-Service-Secret'] = secret;
  }
  return headers;
}

export async function isDailySummaryDispatcherHealthy(): Promise<boolean> {
  try {
    const response = await fetch(`${getCronServiceBaseUrl()}/health`, {
      headers: cronServiceHeaders(),
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) {
      return false;
    }
    const status = await response.json() as { isRunning?: boolean; activeTasks?: string[] };
    return status.isRunning === true && Array.isArray(status.activeTasks) && status.activeTasks.includes(DAILY_SUMMARY_DISPATCH_TASK);
  } catch {
    return false;
  }
}

function jobDisplayName(job: DailySummaryJobRow): string {
  const alias = job.serverAlias.trim();
  return alias.length > 0 ? alias : job.serverName;
}

function statusLabel(job: DailySummaryJobRow, t: (key: string) => string): string {
  if (!job.hasReport || job.lastBackupStatus === null) {
    return t('No report received');
  }
  return t(job.lastBackupStatus);
}

async function snapshotPlaceholderValues(
  snapshot: DailySummarySnapshot,
  locale: string,
  options: { omitHealthyAllJobs?: boolean } = {}
): Promise<Record<string, string>> {
  const i18n = await getServerI18nForLanguage(locale);
  const t = (key: string) => i18n.t(key);
  const headers = [
    t('Server'),
    t('Backup'),
    t('Overdue'),
    t('Last status'),
    t('Last result'),
    t('Duration'),
    t('Warnings'),
    t('Errors'),
    t('Uploaded'),
  ];

  const toRow = (job: DailySummaryJobRow): string[] => [
    jobDisplayName(job),
    job.backupName,
    job.isOverdue ? t('Yes') : t('No'),
    statusLabel(job, t),
    job.lastBackupDate ? formatDateTime(job.lastBackupDate, locale, snapshot.timeZone) : t('No report received'),
    job.durationSeconds === null ? '—' : formatDurationFromSeconds(job.durationSeconds),
    formatInteger(job.warnings, locale),
    formatInteger(job.errors, locale),
    formatBytes(job.uploadedSize, locale),
  ];

  const problemJobs = snapshot.jobs.filter(isProblemJob);
  let allJobs = snapshot.jobs;
  if (options.omitHealthyAllJobs) {
    allJobs = problemJobs;
  }

  const problemRows = problemJobs.map(toRow);
  const allRows = allJobs.map(toRow);

  let problemTableHtml = htmlTable(headers, problemRows);
  let problemTableText = textTable(headers, problemRows);
  if (snapshot.jobCount === 0) {
    problemTableHtml = `<p>${i18n.t('No backup jobs are known')}</p>`;
    problemTableText = i18n.t('No backup jobs are known');
  } else if (problemJobs.length === 0) {
    problemTableHtml = `<p>${i18n.t('No jobs currently require attention')}</p>`;
    problemTableText = i18n.t('No jobs currently require attention');
  }

  return {
    summary_date: snapshot.summaryDate,
    generated_at: formatDateTime(snapshot.generatedAt, locale, snapshot.timeZone),
    time_zone: snapshot.timeZone,
    server_count: formatInteger(snapshot.serverCount, locale),
    job_count: formatInteger(snapshot.jobCount, locale),
    success_count: formatInteger(snapshot.successCount, locale),
    warning_count: formatInteger(snapshot.warningCount, locale),
    error_count: formatInteger(snapshot.errorCount, locale),
    fatal_count: formatInteger(snapshot.fatalCount, locale),
    unknown_count: formatInteger(snapshot.unknownCount, locale),
    no_report_count: formatInteger(snapshot.noReportCount, locale),
    overdue_count: formatInteger(snapshot.overdueCount, locale),
    latest_uploaded_size: formatBytes(snapshot.latestUploadedSize, locale),
    latest_source_size: formatBytes(snapshot.latestSourceSize, locale),
    latest_storage_size: formatBytes(snapshot.latestStorageSize, locale),
    latest_file_count: formatInteger(snapshot.latestFileCount, locale),
    total_warnings: formatInteger(snapshot.totalWarnings, locale),
    total_errors: formatInteger(snapshot.totalErrors, locale),
    omitted_job_count: formatInteger(snapshot.omittedJobCount, locale),
    problem_table: problemTableHtml,
    all_jobs_table: snapshot.jobCount === 0
      ? `<p>${i18n.t('No backup jobs are known')}</p>`
      : htmlTable(headers, allRows),
    problem_table_text: problemTableText,
    all_jobs_table_text: snapshot.jobCount === 0
      ? i18n.t('No backup jobs are known')
      : textTable(headers, allRows),
  };
}

export async function collectDailySummarySnapshot(generatedAt: Date = new Date()): Promise<DailySummarySnapshot> {
  const config = getDailySummaryConfig();
  const servers = dbOps.getAllServers.all() as SummaryServerRow[];
  const latestResults = dbOps.getLatestBackupResultsForSummary.all() as SummaryLatestResultRow[];
  const backupSettings = getRawBackupSettingsMap();
  const overdueToleranceMinutes = getConfigOverdueTolerance();
  return buildDailySummarySnapshot({
    generatedAt,
    timeZone: config.timeZone,
    servers,
    latestResults,
    backupSettings,
    overdueToleranceMinutes,
  });
}

export async function renderDailySummaryPayload(
  snapshot: DailySummarySnapshot,
  locale: string = SOURCE_LOCALE,
  templatesOverride?: DailySummaryTemplateSet
): Promise<DailySummaryRenderedPayload> {
  const templates = getNotificationTemplates();
  const dailySummary = templatesOverride ?? templates.dailySummary;
  validateDailySummaryTemplateSet(dailySummary);

  let working: DailySummarySnapshot = { ...snapshot };
  let omitHealthy = false;
  let values = await snapshotPlaceholderValues(working, locale);
  let email = renderMarkdownEmail(dailySummary.email.title, dailySummary.email.message, {
    ...values,
    problem_table: values.problem_table,
    all_jobs_table: values.all_jobs_table,
  });

  if (utf8ByteLength(email.html) > EMAIL_HTML_MAX_BYTES) {
    omitHealthy = true;
    const omitted = snapshot.jobs.length - snapshot.jobs.filter(isProblemJob).length;
    working = { ...snapshot, omittedJobCount: omitted };
    values = await snapshotPlaceholderValues(working, locale, { omitHealthyAllJobs: true });
    email = renderMarkdownEmail(dailySummary.email.title, dailySummary.email.message, values);
  }

  const ntfyValues = {
    ...values,
    problem_table: values.problem_table_text,
    all_jobs_table: values.all_jobs_table_text,
  };
  const ntfyTitle = substitutePlainTemplate(dailySummary.ntfy.title, ntfyValues).replace(/[\r\n\u0000]+/g, ' ').trim();
  const ntfyRaw = substitutePlainTemplate(dailySummary.ntfy.message, ntfyValues);
  const i18n = await getServerI18nForLanguage(locale);
  const omittedSuffix = i18n.t('Open duplistatus for full details. Some jobs were omitted.');
  const ntfyMessage = truncateNtfyAtLineBoundary(ntfyRaw, NTFY_MESSAGE_MAX_BYTES, omittedSuffix);

  return {
    subject: email.subject,
    emailHtml: email.html,
    emailText: email.text,
    ntfyTitle,
    ntfyMessage,
    ntfyPriority: dailySummary.ntfy.priority,
    ntfyTags: dailySummary.ntfy.tags,
  };
}

async function sendChannel(
  channel: DailySummaryChannel,
  payload: DailySummaryRenderedPayload
): Promise<void> {
  switch (channel) {
    case 'email':
      await sendEmailNotification(payload.subject, payload.emailHtml, payload.emailText);
      return;
    case 'ntfy': {
      const ntfy = getNtfyConfig();
      await sendNtfyNotification(
        ntfy.url,
        ntfy.topic,
        payload.ntfyTitle,
        payload.ntfyMessage,
        payload.ntfyPriority,
        payload.ntfyTags,
        ntfy.accessToken,
        { timeoutMs: DAILY_SUMMARY_TRANSPORT_TIMEOUT_MS, maxRetries: 1 }
      );
      return;
    }
    default: {
      const exhaustive: never = channel;
      throw new Error(`Unhandled channel: ${String(exhaustive)}`);
    }
  }
}

function channelsForConfig(config: DailySummaryConfig): DailySummaryChannel[] {
  const channels: DailySummaryChannel[] = ['email'];
  if (config.sendNtfy) {
    channels.push('ntfy');
  }
  return channels;
}

async function deliverClaimed(
  record: DailySummaryDeliveryRecord,
  payload: DailySummaryRenderedPayload
): Promise<void> {
  try {
    await sendChannel(record.channel, payload);
    finalizeDeliverySuccess(db, record.id);
  } catch (error) {
    finalizeDeliveryFailure(db, record.id, error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export interface DispatchResult {
  occurrenceKey: string | null;
  attempted: DailySummaryChannel[];
  succeeded: DailySummaryChannel[];
  failed: Array<{ channel: DailySummaryChannel; error: string }>;
  skippedReason?: string;
}

async function dispatchOccurrence(input: {
  config: DailySummaryConfig;
  occurrenceKey: string;
  summaryDate: string;
  trigger: DailySummaryTrigger;
  snapshot?: DailySummarySnapshot;
  payload?: DailySummaryRenderedPayload;
}): Promise<DispatchResult> {
  const smtp = getSMTPConfig();
  if (!isSmtpConfiguredForSummary(smtp)) {
    return { occurrenceKey: input.occurrenceKey, attempted: [], succeeded: [], failed: [], skippedReason: 'smtp_not_configured' };
  }
  if (input.config.sendNtfy && !isNtfyConfiguredForSummary(getNtfyConfig())) {
    return { occurrenceKey: input.occurrenceKey, attempted: [], succeeded: [], failed: [], skippedReason: 'ntfy_not_configured' };
  }

  const locale = getNotificationTemplates().language || SOURCE_LOCALE;
  const snapshot = input.snapshot ?? await collectDailySummarySnapshot();
  const payload = input.payload ?? await renderDailySummaryPayload(snapshot, locale);
  const channels = channelsForConfig(input.config);
  ensureDeliveryRows(db, {
    occurrenceKey: input.occurrenceKey,
    channels,
    trigger: input.trigger,
    summaryDate: input.summaryDate,
    timeZone: input.config.timeZone,
    payload,
  });

  const attempted: DailySummaryChannel[] = [];
  const succeeded: DailySummaryChannel[] = [];
  const failed: Array<{ channel: DailySummaryChannel; error: string }> = [];

  for (const channel of channels) {
    const claimed = claimDelivery(db, input.occurrenceKey, channel);
    if (!claimed) {
      continue;
    }
    attempted.push(channel);
    const stored = parseStoredPayload(claimed.payloadJson) ?? payload;
    try {
      await deliverClaimed(claimed, stored);
      succeeded.push(channel);
    } catch (error) {
      failed.push({ channel, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return { occurrenceKey: input.occurrenceKey, attempted, succeeded, failed };
}

export async function dispatchScheduledDailySummary(now: Date = new Date()): Promise<DispatchResult> {
  if (dispatchInProgress) {
    return { occurrenceKey: null, attempted: [], succeeded: [], failed: [], skippedReason: 'in_progress' };
  }
  dispatchInProgress = true;
  try {
    pruneOldDeliveries(db);
    const config = getDailySummaryConfig();
    const evaluation = evaluateScheduledOccurrence(config, now);
    if (!evaluation.due) {
      const retries = getFailedRetryableDeliveries(db, evaluation.occurrenceKey);
      if (retries.length === 0) {
        return { occurrenceKey: evaluation.occurrenceKey, attempted: [], succeeded: [], failed: [], skippedReason: evaluation.reason };
      }
      return dispatchOccurrence({
        config,
        occurrenceKey: evaluation.occurrenceKey,
        summaryDate: evaluation.summaryDate,
        trigger: 'retry',
      });
    }
    return dispatchOccurrence({
      config,
      occurrenceKey: evaluation.occurrenceKey,
      summaryDate: evaluation.summaryDate,
      trigger: 'scheduled',
    });
  } finally {
    dispatchInProgress = false;
  }
}

export async function sendDailySummaryNow(): Promise<DispatchResult> {
  const config = getDailySummaryConfig();
  if (!config.enabled) {
    throw new Error('Daily summary mode is not enabled');
  }
  const now = new Date();
  return dispatchOccurrence({
    config,
    occurrenceKey: manualOccurrenceKey(randomUUID()),
    summaryDate: formatLocalCalendarDate(now, config.timeZone),
    trigger: 'manual',
  });
}

export async function retryFailedDailySummary(occurrenceKey?: string): Promise<DispatchResult> {
  const config = getDailySummaryConfig();
  const failed = getFailedRetryableDeliveries(db, occurrenceKey);
  if (failed.length === 0) {
    return { occurrenceKey: occurrenceKey ?? null, attempted: [], succeeded: [], failed: [], skippedReason: 'nothing_to_retry' };
  }
  const target = failed[0];
  return dispatchOccurrence({
    config,
    occurrenceKey: target.occurrenceKey,
    summaryDate: target.summaryDate,
    trigger: 'retry',
    payload: parseStoredPayload(target.payloadJson) ?? undefined,
  });
}

export async function previewDailySummary(): Promise<{
  snapshot: DailySummarySnapshot;
  payload: DailySummaryRenderedPayload;
}> {
  const snapshot = await collectDailySummarySnapshot();
  const locale = getNotificationTemplates().language || SOURCE_LOCALE;
  const payload = await renderDailySummaryPayload(snapshot, locale);
  return { snapshot, payload };
}

function publicChannelStatus(
  enabled: boolean,
  record: DailySummaryDeliveryRecord | null
): DailySummaryChannelPublicStatus {
  if (!enabled) {
    return {
      enabled: false,
      state: 'idle',
      lastAttemptAt: null,
      lastSuccessAt: null,
      lastError: null,
      nextRetryAt: null,
      occurrenceKey: null,
    };
  }
  if (!record) {
    return {
      enabled: true,
      state: 'idle',
      lastAttemptAt: null,
      lastSuccessAt: null,
      lastError: null,
      nextRetryAt: null,
      occurrenceKey: null,
    };
  }
  return {
    enabled: true,
    state: record.state,
    lastAttemptAt: record.updatedAt,
    lastSuccessAt: record.sentAt,
    lastError: record.error,
    nextRetryAt: record.nextRetryAt,
    occurrenceKey: record.occurrenceKey,
  };
}

export async function getDailySummaryPublicStatus(): Promise<DailySummaryPublicStatus> {
  const config = getDailySummaryConfig();
  const next = findNextOccurrence(config);
  const latest = getLatestDeliveriesByChannel(db);
  return {
    enabled: config.enabled,
    localTime: config.localTime,
    timeZone: config.timeZone,
    sendNtfy: config.sendNtfy,
    nextOccurrenceIso: next ? next.toISOString() : null,
    dispatcherHealthy: await isDailySummaryDispatcherHealthy(),
    emailConfigured: isSmtpConfiguredForSummary(getSMTPConfig()),
    ntfyConfigured: isNtfyConfiguredForSummary(getNtfyConfig()),
    channels: {
      email: publicChannelStatus(true, latest.email),
      ntfy: publicChannelStatus(config.sendNtfy, latest.ntfy),
    },
  };
}

export function publicSnapshotForPreview(snapshot: DailySummarySnapshot): DailySummarySnapshot {
  return snapshot;
}
