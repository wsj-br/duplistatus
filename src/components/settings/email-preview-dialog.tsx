"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  EmailHtmlPreviewIframe,
  EmailPreviewSubject,
} from '@/components/settings/email-html-preview-iframe';

type EmailPreviewView = 'html' | 'text' | 'ntfy';

interface EmailPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
  subject: string;
  html: string;
  text: string;
  ntfy?: string;
  extra?: ReactNode;
}

export function EmailPreviewDialog({
  open,
  onOpenChange,
  description,
  subject,
  html,
  text,
  ntfy,
  extra,
}: EmailPreviewDialogProps) {
  const { t } = useTranslation();
  const [view, setView] = useState<EmailPreviewView>('html');
  const showNtfy = Boolean(ntfy && ntfy.trim() !== '');

  useEffect(() => {
    if (open) {
      setView('html');
    }
  }, [open]);

  useEffect(() => {
    if (view === 'ntfy' && !showNtfy) {
      setView('html');
    }
  }, [view, showNtfy]);

  let body: ReactNode;
  switch (view) {
    case 'html':
      body = (
        <EmailHtmlPreviewIframe
          title={t('Email HTML preview')}
          html={html}
          className="min-h-[62vh]"
        />
      );
      break;
    case 'text':
      body = (
        <pre className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">{text}</pre>
      );
      break;
    case 'ntfy':
      body = (
        <pre className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">{ntfy}</pre>
      );
      break;
    default: {
      const _exhaustive: never = view;
      throw new Error(`Unhandled preview view: ${String(_exhaustive)}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[min(100vw-2rem,72rem)] max-w-none flex-col overflow-hidden sm:max-w-none">
        <DialogHeader>
          <DialogTitle>{t('Preview')}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
          {extra}
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant={view === 'html' ? 'default' : 'outline'} onClick={() => setView('html')}>
              {t('Email HTML')}
            </Button>
            <Button type="button" size="sm" variant={view === 'text' ? 'default' : 'outline'} onClick={() => setView('text')}>
              {t('Plain text')}
            </Button>
            {showNtfy && (
              <Button type="button" size="sm" variant={view === 'ntfy' ? 'default' : 'outline'} onClick={() => setView('ntfy')}>
                {t('NTFY')}
              </Button>
            )}
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto scrollbar-gutter-stable">
            <EmailPreviewSubject subject={subject} />
            {body}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
