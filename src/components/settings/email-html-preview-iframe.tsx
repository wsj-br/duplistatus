"use client";

import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/theme-context';
import { themedEmailPreviewHtml } from '@/lib/email-preview-html';
import { cn } from '@/lib/utils';

interface EmailPreviewSubjectProps {
  subject: string;
}

export function EmailPreviewSubject({ subject }: EmailPreviewSubjectProps) {
  const { t } = useTranslation();
  if (subject.trim() === '') {
    return null;
  }
  return (
    <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm break-words">
      <span className="font-medium text-muted-foreground">{t('Subject')}: </span>
      {subject}
    </p>
  );
}

interface EmailHtmlPreviewIframeProps {
  html: string;
  title: string;
  className?: string;
}

export function EmailHtmlPreviewIframe({ html, title, className }: EmailHtmlPreviewIframeProps) {
  const { resolvedTheme } = useTheme();
  return (
    <iframe
      title={title}
      sandbox="allow-popups allow-popups-to-escape-sandbox"
      className={cn('w-full min-h-[320px] rounded-md border bg-background', className)}
      srcDoc={themedEmailPreviewHtml(html, resolvedTheme)}
    />
  );
}
