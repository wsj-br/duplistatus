import { withCSRF } from '@/lib/csrf-middleware';
import { NextResponse, NextRequest } from 'next/server';
import { getNotificationTemplates, setNotificationTemplates } from '@/lib/db-utils';
import { requireAdmin } from '@/lib/auth-middleware';
import { getClientIpAddress } from '@/lib/ip-utils';
import { AuditLogger } from '@/lib/audit-logger';
import type { SupportedTemplateLanguage } from '@/lib/types';

export const POST = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {

    const body = await request.json();
    const { templates } = body;
    if (!templates) {
      return NextResponse.json({ error: 'templates are required' }, { status: 400 });
    }

    const current = getNotificationTemplates();

    // Support both old shape (without language) and new shape (with language)
    const updated = {
      language: templates.language || current.language,
      success: templates.success || current.success,
      warning: templates.warning || current.warning,
      overdueBackup: templates.overdueBackup || current.overdueBackup
    };

    // Build a summary of changed template fields with old and new values
    const changesSummary: Record<string, Record<string, { old: any; new: any }> | { old: any; new: any }> = {};
    const templateTypes = ['success', 'warning', 'overdueBackup'] as const;

    for (const templateType of templateTypes) {
      const oldTemplate = current[templateType];
      const newTemplate = updated[templateType];

      if (!oldTemplate || !newTemplate) continue;

      const changedFields: Record<string, { old: any; new: any }> = {};

      // Check each field for changes
      if (oldTemplate.title !== newTemplate.title) {
        changedFields.title = {
          old: oldTemplate.title,
          new: newTemplate.title,
        };
      }
      if (oldTemplate.message !== newTemplate.message) {
        changedFields.message = {
          old: oldTemplate.message,
          new: newTemplate.message,
        };
      }
      if (oldTemplate.priority !== newTemplate.priority) {
        changedFields.priority = {
          old: oldTemplate.priority,
          new: newTemplate.priority,
        };
      }
      if (oldTemplate.tags !== newTemplate.tags) {
        changedFields.tags = {
          old: oldTemplate.tags,
          new: newTemplate.tags,
        };
      }

      // Only include this template if there are actual changes
      if (Object.keys(changedFields).length > 0) {
        changesSummary[templateType] = changedFields;
      }
    }

    // Check if language changed
    const languageChanged = templates.language !== undefined && templates.language !== current.language;
    if (languageChanged) {
      changesSummary.language = {
        old: current.language,
        new: updated.language
      };
    }

    setNotificationTemplates(updated);

    // Log audit event
    if (authContext) {
      const ipAddress = getClientIpAddress(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';
      await AuditLogger.logConfigChange(
        'notification_template_updated',
        authContext.userId,
        authContext.username,
        'notification_templates',
        {
          templatesUpdated: Object.keys(changesSummary).filter(k => k !== 'language'),
          languageChanged,
          changes: changesSummary,
        },
        ipAddress,
        userAgent
      );
    }

    return NextResponse.json({ message: 'Notification templates updated successfully' });
  } catch (error) {
    console.error('Failed to update notification templates:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to update notification templates' }, { status: 500 });
  }
}));