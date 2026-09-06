import { NextRequest, NextResponse } from 'next/server';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAuth } from '@/lib/auth-middleware';
import { getNotificationTemplates } from '@/lib/db-utils';
import { collectDailySummarySnapshot, renderDailySummaryPayload } from '@/lib/daily-summary';
import { renderMarkdownEmail } from '@/lib/notification-template-renderer';
import {
  validateDailySummaryEmailTemplate,
  validateNotificationTemplate,
} from '@/lib/notification-template-validation';
import type { DailySummaryEmailTemplate, DailySummaryTemplateSet, NotificationTemplate } from '@/lib/types';

const SAMPLE_BACKUP_VALUES: Record<string, string> = {
  server_name: 'fileserver',
  server_alias: 'File server (fileserver)',
  server_note: 'Office NAS',
  server_url: 'https://duplicati.example.invalid',
  backup_name: 'Documents',
  backup_date: '2026-04-01 08:00',
  status: 'Warning',
  messages_count: '3',
  warnings_count: '2',
  errors_count: '0',
  log_text: 'Warning: skipped locked file',
  log_list: '<ul><li>Warning: skipped locked file</li></ul>',
  duration: '00:12:04',
  file_count: '1280',
  file_size: '4.2 GB',
  uploaded_size: '120 MB',
  storage_size: '18 GB',
  available_versions: '14',
  last_backup_date: '2026-03-31 08:00',
  last_elapsed: '1 day ago',
  expected_date: '2026-04-01 08:00',
  expected_elapsed: '2 hours ago',
  backup_interval: '1D',
  overdue_tolerance: '2 hours',
};

export const POST = withCSRF(requireAuth(async (request: NextRequest) => {
  try {
    const body = await request.json() as {
      kind?: 'success' | 'warning' | 'overdueBackup' | 'dailySummaryEmail' | 'dailySummaryNtfy';
      template?: NotificationTemplate | DailySummaryEmailTemplate;
      dailySummary?: DailySummaryTemplateSet;
    };
    const kind = body.kind;
    const stored = getNotificationTemplates();

    if (kind === 'dailySummaryEmail' || kind === 'dailySummaryNtfy') {
      const snapshot = await collectDailySummarySnapshot();
      const override: DailySummaryTemplateSet = body.dailySummary ?? {
        email: (body.template as DailySummaryEmailTemplate | undefined) ?? stored.dailySummary.email,
        ntfy: stored.dailySummary.ntfy,
      };
      validateDailySummaryEmailTemplate(override.email);
      validateNotificationTemplate(override.ntfy, 'dailySummaryNtfy');
      const payload = await renderDailySummaryPayload(snapshot, stored.language, override);
      return NextResponse.json({
        subject: payload.subject,
        emailHtml: payload.emailHtml,
        emailText: payload.emailText,
        ntfyTitle: payload.ntfyTitle,
        ntfyMessage: payload.ntfyMessage,
        ntfyPriority: payload.ntfyPriority,
        ntfyTags: payload.ntfyTags,
      });
    }

    const template = (body.template as NotificationTemplate | undefined)
      ?? (kind === 'overdueBackup' ? stored.overdueBackup : kind === 'warning' ? stored.warning : stored.success);
    if (kind === 'success' || kind === 'warning' || kind === 'overdueBackup') {
      validateNotificationTemplate(template, kind);
    }
    const rendered = renderMarkdownEmail(template.title, template.message, SAMPLE_BACKUP_VALUES);
    return NextResponse.json({
      subject: rendered.subject,
      emailHtml: rendered.html,
      emailText: rendered.text,
      ntfyTitle: rendered.subject,
      ntfyMessage: rendered.text,
      ntfyPriority: template.priority,
      ntfyTags: template.tags,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}));
