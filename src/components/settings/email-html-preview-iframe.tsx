"use client";

import { useTheme } from '@/contexts/theme-context';
import { themedEmailPreviewHtml } from '@/lib/email-preview-html';
import { cn } from '@/lib/utils';

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
      sandbox=""
      className={cn('w-full min-h-[280px] rounded-md border bg-background', className)}
      srcDoc={themedEmailPreviewHtml(html, resolvedTheme)}
    />
  );
}
