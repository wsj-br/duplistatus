'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  appendUniqueCidrs,
  cidrsEqual,
  isLoopbackAllowlistCidr,
  isPlausibleCidr,
  splitCidrInput,
} from '@/lib/cidr-format';

interface CidrListEditorProps {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  id?: string;
  label?: string;
  placeholder?: string;
  currentIp?: string;
  lockedCidrs?: readonly string[];
}

export function CidrListEditor({
  value,
  onChange,
  disabled = false,
  id,
  label,
  placeholder,
  currentIp,
  lockedCidrs = [],
}: CidrListEditorProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  const inputId = id ? `${id}-input` : undefined;

  const addDraft = () => {
    const candidates = splitCidrInput(draft);
    if (candidates.length === 0) {
      setError('');
      return;
    }

    const invalid = candidates.find((candidate) => !isPlausibleCidr(candidate));
    if (invalid) {
      setError(t('Enter a valid IP address or CIDR (for example 192.168.1.0/24).'));
      return;
    }

    onChange(appendUniqueCidrs(value, candidates));
    setDraft('');
    setError('');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    addDraft();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addDraft();
    }
  };

  const removeAt = (index: number) => {
    const cidr = value[index];
    if (lockedCidrs.some((locked) => cidrsEqual(locked, cidr)) || isLoopbackAllowlistCidr(cidr)) {
      return;
    }
    onChange(value.filter((_, currentIndex) => currentIndex !== index));
  };

  const draftCandidates = splitCidrInput(draft);
  const hasInvalidDraft = draftCandidates.some((candidate) => !isPlausibleCidr(candidate));
  const canAdd = draftCandidates.length > 0 && !hasInvalidDraft && !disabled;

  return (
    <div className="space-y-3">
      {label ? <Label htmlFor={inputId}>{label}</Label> : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1 space-y-1">
          <Input
            id={inputId}
            value={draft}
            disabled={disabled}
            placeholder={placeholder ?? t('192.168.1.0/24 or 10.0.0.5')}
            className="font-mono text-sm"
            onChange={(event) => {
              setDraft(event.target.value);
              if (error) {
                setError('');
              }
            }}
            onKeyDown={handleKeyDown}
          />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
        <Button type="submit" variant="outline" disabled={!canAdd}>
          {t('Add')}
        </Button>
      </form>

      <div className="min-h-10 rounded-md border border-input bg-muted/20 p-3">
        {value.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('No entries yet. Add one above.')}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {value.map((cidr, index) => {
              const isCurrent = currentIp ? cidrsEqual(cidr, currentIp) : false;
              const isLocked = lockedCidrs.some((locked) => cidrsEqual(locked, cidr)) || isLoopbackAllowlistCidr(cidr);
              return (
                <Badge
                  key={`${cidr}-${index}`}
                  variant="outline"
                  className="gap-1.5 py-1 pl-2.5 pr-1 font-mono text-xs font-normal"
                >
                  <span>{cidr}</span>
                  {isCurrent ? (
                    <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      {t('current IP')}
                    </span>
                  ) : null}
                  {!isLocked ? (
                    <button
                      type="button"
                      className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                      disabled={disabled}
                      aria-label={t('Remove {{cidr}}', { cidr })}
                      onClick={() => removeAt(index)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
