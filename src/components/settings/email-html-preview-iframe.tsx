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
    <div className="px-5 pr-10">
      <iframe
        title={title}
        sandbox="allow-popups allow-popups-to-escape-sandbox"
        className={cn('w-full min-h-[320px] rounded-md border bg-background', className)}
        srcDoc={themedEmailPreviewHtml(html, resolvedTheme)}
      />
    </div>
  );
}
