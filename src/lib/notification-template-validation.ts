import type {
  DailySummaryEmailTemplate,
  DailySummaryTemplateSet,
  NotificationTemplate,
} from '@/lib/types';
import { isNotificationPriority } from '@/lib/types';

export const BACKUP_TEMPLATE_PLACEHOLDERS = [
  'server_name',
  'server_alias',
  'server_note',
  'server_url',
  'backup_name',
  'backup_date',
  'status',
  'messages_count',
  'warnings_count',
  'errors_count',
  'log_text',
  'log_list',
  'duration',
  'file_count',
  'file_size',
  'uploaded_size',
  'storage_size',
  'available_versions',
] as const;

export const OVERDUE_TEMPLATE_PLACEHOLDERS = [
  'server_name',
  'server_alias',
  'server_note',
  'server_url',
  'backup_name',
  'last_backup_date',
  'last_elapsed',
  'expected_date',
  'expected_elapsed',
  'backup_interval',
  'overdue_tolerance',
] as const;

export const DAILY_SUMMARY_PLACEHOLDERS = [
  'summary_date',
  'generated_at',
  'time_zone',
  'server_count',
  'job_count',
  'success_count',
  'warning_count',
  'error_count',
  'fatal_count',
  'unknown_count',
  'no_report_count',
  'overdue_count',
  'latest_uploaded_size',
  'latest_source_size',
  'latest_storage_size',
  'latest_file_count',
  'total_warnings',
  'total_errors',
  'omitted_job_count',
  'problem_table',
  'all_jobs_table',
] as const;

export type TemplateKind = 'success' | 'warning' | 'overdueBackup' | 'dailySummaryEmail' | 'dailySummaryNtfy';

export const TEMPLATE_SOURCE_MAX_CHARS = 50_000;
export const EMAIL_HTML_MAX_BYTES = 90 * 1024;
export const NTFY_MESSAGE_MAX_BYTES = 3900;
export const SUBJECT_MAX_CHARS = 200;

const PLACEHOLDER_RE = /\{([a-zA-Z][a-zA-Z0-9_]*)\}/g;
const LINK_DESTINATION_RE = /\[[^\]]*\]\(([^)]+)\)/g;

export class TemplateValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TemplateValidationError';
  }
}

function allowedPlaceholdersFor(kind: TemplateKind): ReadonlySet<string> {
  switch (kind) {
    case 'success':
    case 'warning':
      return new Set(BACKUP_TEMPLATE_PLACEHOLDERS);
    case 'overdueBackup':
      return new Set(OVERDUE_TEMPLATE_PLACEHOLDERS);
    case 'dailySummaryEmail':
    case 'dailySummaryNtfy':
      return new Set(DAILY_SUMMARY_PLACEHOLDERS);
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

export function collectPlaceholderNames(source: string): string[] {
  const names: string[] = [];
  PLACEHOLDER_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = PLACEHOLDER_RE.exec(source)) !== null) {
    names.push(match[1]);
  }
  return names;
}

function assertNoControlChars(label: string, value: string): void {
  if (/[\r\n\u0000]/.test(value)) {
    throw new TemplateValidationError(`${label} must not contain line breaks or null characters`);
  }
}

function assertPlaceholders(kind: TemplateKind, source: string, label: string): void {
  const allowed = allowedPlaceholdersFor(kind);
  for (const name of collectPlaceholderNames(source)) {
    if (!allowed.has(name)) {
      throw new TemplateValidationError(`${label} contains unknown placeholder {${name}}`);
    }
  }

  LINK_DESTINATION_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = LINK_DESTINATION_RE.exec(source)) !== null) {
    if (PLACEHOLDER_RE.test(match[1])) {
      throw new TemplateValidationError(`${label} must not use placeholders in Markdown link destinations`);
    }
  }
}

export function validateNotificationTemplate(
  template: NotificationTemplate,
  kind: 'success' | 'warning' | 'overdueBackup' | 'dailySummaryNtfy'
): void {
  if (!template || typeof template !== 'object') {
    throw new TemplateValidationError('Template is required');
  }
  if (typeof template.title !== 'string' || template.title.length === 0) {
    throw new TemplateValidationError('Title is required');
  }
  if (typeof template.message !== 'string') {
    throw new TemplateValidationError('Message is required');
  }
  if (template.title.length > SUBJECT_MAX_CHARS) {
    throw new TemplateValidationError('Title is too long');
  }
  if (template.message.length > TEMPLATE_SOURCE_MAX_CHARS) {
    throw new TemplateValidationError('Message is too long');
  }
  assertNoControlChars('Title', template.title);
  if (!isNotificationPriority(template.priority)) {
    throw new TemplateValidationError('Priority is invalid');
  }
  if (typeof template.tags !== 'string') {
    throw new TemplateValidationError('Tags are required');
  }
  assertNoControlChars('Tags', template.tags);
  assertPlaceholders(kind, template.title, 'Title');
  assertPlaceholders(kind, template.message, 'Message');
}

export function validateDailySummaryEmailTemplate(template: DailySummaryEmailTemplate): void {
  if (!template || typeof template !== 'object') {
    throw new TemplateValidationError('Daily summary email template is required');
  }
  if (typeof template.title !== 'string' || template.title.length === 0) {
    throw new TemplateValidationError('Email subject is required');
  }
  if (typeof template.message !== 'string') {
    throw new TemplateValidationError('Email body is required');
  }
  if (template.title.length > SUBJECT_MAX_CHARS) {
    throw new TemplateValidationError('Email subject is too long');
  }
  if (template.message.length > TEMPLATE_SOURCE_MAX_CHARS) {
    throw new TemplateValidationError('Email body is too long');
  }
  assertNoControlChars('Email subject', template.title);
  assertPlaceholders('dailySummaryEmail', template.title, 'Email subject');
  assertPlaceholders('dailySummaryEmail', template.message, 'Email body');
}

export function validateDailySummaryTemplateSet(templates: DailySummaryTemplateSet): void {
  validateDailySummaryEmailTemplate(templates.email);
  validateNotificationTemplate(templates.ntfy, 'dailySummaryNtfy');
}

export function sanitizePlainSubject(subject: string): string {
  return subject.replace(/[\r\n\u0000]+/g, ' ').trim();
}

export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function truncateUtf8Bytes(value: string, maxBytes: number): { text: string; truncated: boolean } {
  const encoded = new TextEncoder().encode(value);
  if (encoded.length <= maxBytes) {
    return { text: value, truncated: false };
  }
  const decoder = new TextDecoder();
  let end = maxBytes;
  while (end > 0 && (encoded[end] & 0b1100_0000) === 0b1000_0000) {
    end -= 1;
  }
  return { text: decoder.decode(encoded.slice(0, end)), truncated: true };
}

export function truncateNtfyAtLineBoundary(
  value: string,
  maxBytes: number,
  omittedSuffix: string
): string {
  const suffixBytes = utf8ByteLength(`\n${omittedSuffix}`);
  const budget = Math.max(0, maxBytes - suffixBytes);
  if (utf8ByteLength(value) <= maxBytes) {
    return value;
  }

  const lines = value.split('\n');
  let kept = '';
  let omitted = 0;
  for (const line of lines) {
    const candidate = kept.length === 0 ? line : `${kept}\n${line}`;
    if (utf8ByteLength(candidate) <= budget) {
      kept = candidate;
    } else {
      omitted += 1;
    }
  }

  if (kept.length === 0) {
    const truncated = truncateUtf8Bytes(value, budget).text;
    return `${truncated}\n${omittedSuffix}`;
  }
  if (omitted === 0) {
    return truncateUtf8Bytes(value, maxBytes).text;
  }
  return `${kept}\n${omittedSuffix}`;
}
