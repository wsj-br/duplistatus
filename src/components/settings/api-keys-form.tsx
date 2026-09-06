'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, KeyRound, Plus, Shield, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { useToast } from '@/components/ui/use-toast';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { formatDate, formatDateTime } from '@/lib/date-format';
import { useEffectiveFormatLocale } from '@/contexts/config-context';
import type { ApiKeyPublic, ApiKeyScope, UploadLimitsConfig } from '@/lib/types';

interface CreatedKey {
  apiKey: string;
  fingerprint: string;
  scope: ApiKeyScope;
}

type ApiKeyStatus = 'enabled' | 'disabled' | 'expired';

function isApiKeyExpired(expiresAt: string | null): boolean {
  if (!expiresAt) {
    return false;
  }
  const expires = new Date(expiresAt);
  return Number.isFinite(expires.getTime()) && expires.getTime() <= Date.now();
}

function getApiKeyStatus(key: ApiKeyPublic): ApiKeyStatus {
  if (isApiKeyExpired(key.expiresAt)) {
    return 'expired';
  }
  return key.enabled ? 'enabled' : 'disabled';
}

const BYTES_PER_MB = 1024 * 1024;
const AUTO_SAVE_DEBOUNCE_MS = 500;

function isValidUploadLimits(limits: UploadLimitsConfig): boolean {
  return (
    Number.isFinite(limits.maxBytes) &&
    limits.maxBytes >= 1024 &&
    Number.isFinite(limits.perMinute) &&
    limits.perMinute > 0 &&
    Number.isFinite(limits.perHour) &&
    limits.perHour > 0
  );
}

export function ApiKeysForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const locale = useEffectiveFormatLocale();
  const [keys, setKeys] = useState<ApiKeyPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<ApiKeyScope>('upload');
  const [expiresAt, setExpiresAt] = useState('');
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<CreatedKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [requireApiKey, setRequireApiKey] = useState(false);
  const [uploadLimits, setUploadLimits] = useState<UploadLimitsConfig>({
    enabled: true,
    maxBytes: 5 * 1024 * 1024,
    perMinute: 20,
    perHour: 200,
  });
  const keysRef = useRef(keys);
  const requireApiKeyRef = useRef(requireApiKey);
  const uploadLimitsRef = useRef(uploadLimits);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSaveInProgressRef = useRef(false);
  const pendingSaveRef = useRef<{
    requireApiKey: boolean;
    uploadLimits: UploadLimitsConfig;
  } | null>(null);

  useEffect(() => {
    keysRef.current = keys;
  }, [keys]);

  useEffect(() => {
    requireApiKeyRef.current = requireApiKey;
  }, [requireApiKey]);

  useEffect(() => {
    uploadLimitsRef.current = uploadLimits;
  }, [uploadLimits]);

  useEffect(() => () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  }, []);

  const resetCreateForm = useCallback(() => {
    setName('');
    setDescription('');
    setScope('upload');
    setExpiresAt('');
    setCreated(null);
    setCopied(false);
  }, []);

  const openCreateDialog = () => {
    resetCreateForm();
    setCreateOpen(true);
  };

  const closeCreateDialog = () => {
    if (creating) {
      return;
    }
    setCreateOpen(false);
    resetCreateForm();
  };

  const loadKeys = useCallback(async () => {
    const response = await authenticatedRequestWithRecovery('/api/api-keys');
    if (!response.ok) {
      throw new Error(t('Failed to load API keys'));
    }
    const data = await response.json() as { keys: ApiKeyPublic[] };
    setKeys(data.keys);
  }, [t]);

  const loadSecurity = useCallback(async () => {
    const response = await authenticatedRequestWithRecovery('/api/configuration/external-api-security');
    if (!response.ok) {
      throw new Error(t('Failed to load external API protection settings'));
    }
    const data = await response.json() as { requireApiKey: boolean; uploadLimits: UploadLimitsConfig };
    setRequireApiKey(data.requireApiKey);
    setUploadLimits(data.uploadLimits);
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await Promise.all([loadKeys(), loadSecurity()]);
      } catch (error) {
        if (!cancelled) {
          toast({
            title: t('Error'),
            description: error instanceof Error ? error.message : t('Failed to load API keys'),
            variant: 'destructive',
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadKeys, loadSecurity, t, toast]);

  const createKey = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast({ title: t('Error'), description: t('Name is required'), variant: 'destructive' });
      return;
    }
    try {
      setCreating(true);
      const response = await authenticatedRequestWithRecovery('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          scope,
          expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
        }),
      });
      if (!response.ok) {
        const error = await response.json() as { error?: string };
        throw new Error(error.error || t('Failed to create API key'));
      }
      const data = await response.json() as CreatedKey;
      setCreated(data);
      setName('');
      setDescription('');
      setExpiresAt('');
      await loadKeys();
    } catch (error) {
      toast({
        title: t('Error'),
        description: error instanceof Error ? error.message : t('Failed to create API key'),
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const copyKey = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setKeyEnabled = async (key: ApiKeyPublic, enabled: boolean) => {
    if (key.enabled === enabled || isApiKeyExpired(key.expiresAt)) {
      return;
    }
    try {
      setTogglingId(key.id);
      const response = await authenticatedRequestWithRecovery(`/api/api-keys/${key.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (!response.ok) {
        toast({ title: t('Error'), description: t('Failed to update API key'), variant: 'destructive' });
        return;
      }
      await loadKeys();
      if (!enabled && requireApiKey) {
        const remainingSameScope = keys.some(
          (candidate) =>
            candidate.id !== key.id &&
            candidate.enabled &&
            !isApiKeyExpired(candidate.expiresAt) &&
            candidate.scope === key.scope,
        );
        if (!remainingSameScope) {
          toast({
            title: t('Warning'),
            description: t('Requiring API keys without an enabled key for each scope will lock Duplicati uploads or Homepage widgets.'),
          });
        }
      }
    } finally {
      setTogglingId(null);
    }
  };

  const deleteKey = async () => {
    if (!deleteId) {
      return;
    }
    const response = await authenticatedRequestWithRecovery(`/api/api-keys/${deleteId}`, {
      method: 'DELETE',
    });
    setDeleteId(null);
    if (!response.ok) {
      toast({ title: t('Error'), description: t('Failed to delete API key'), variant: 'destructive' });
      return;
    }
    await loadKeys();
  };

  const renderStatusBadge = (key: ApiKeyPublic) => {
    const status = getApiKeyStatus(key);
    switch (status) {
      case 'expired':
        return (
          <Badge className="bg-gray-500/20 text-gray-600 dark:text-gray-400">
            {t('Expired')}
          </Badge>
        );
      case 'enabled':
        return (
          <Badge className="bg-green-500/20 text-green-600 dark:text-green-400">
            {t('Enabled')}
          </Badge>
        );
      case 'disabled':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
            {t('Disabled')}
          </Badge>
        );
      default: {
        const exhaustive: never = status;
        throw new Error(`Unhandled API key status: ${String(exhaustive)}`);
      }
    }
  };

  const warnIfRequireWithoutKeys = useCallback((nextRequireApiKey: boolean) => {
    if (!nextRequireApiKey) {
      return;
    }
    const enabledUpload = keysRef.current.some(
      (key) => key.enabled && !isApiKeyExpired(key.expiresAt) && key.scope === 'upload',
    );
    const enabledRead = keysRef.current.some(
      (key) => key.enabled && !isApiKeyExpired(key.expiresAt) && key.scope === 'read',
    );
    if (!enabledUpload || !enabledRead) {
      toast({
        title: t('Warning'),
        description: t('Requiring API keys without an enabled key for each scope will lock Duplicati uploads or Homepage widgets.'),
      });
    }
  }, [t, toast]);

  const persistSecurity = useCallback(async (
    nextRequireApiKey: boolean,
    nextUploadLimits: UploadLimitsConfig,
  ) => {
    if (!isValidUploadLimits(nextUploadLimits)) {
      return;
    }

    if (isSaveInProgressRef.current) {
      pendingSaveRef.current = {
        requireApiKey: nextRequireApiKey,
        uploadLimits: nextUploadLimits,
      };
      return;
    }

    isSaveInProgressRef.current = true;
    try {
      const response = await authenticatedRequestWithRecovery('/api/configuration/external-api-security', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requireApiKey: nextRequireApiKey,
          uploadLimits: nextUploadLimits,
        }),
      });
      if (!response.ok) {
        const error = await response.json() as { error?: string };
        throw new Error(error.error || t('Failed to save external API protection settings'));
      }
      toast({
        title: t('Saved'),
        description: t('External API protection settings were updated.'),
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: t('Error'),
        description: error instanceof Error ? error.message : t('Failed to save external API protection settings'),
        variant: 'destructive',
      });
    } finally {
      isSaveInProgressRef.current = false;
      const pending = pendingSaveRef.current;
      if (pending) {
        pendingSaveRef.current = null;
        void persistSecurity(pending.requireApiKey, pending.uploadLimits);
      }
    }
  }, [t, toast]);

  const flushAutoSave = useCallback(() => {
    if (!autoSaveTimeoutRef.current) {
      return;
    }
    clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = null;
    void persistSecurity(requireApiKeyRef.current, uploadLimitsRef.current);
  }, [persistSecurity]);

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveTimeoutRef.current = null;
      void persistSecurity(requireApiKeyRef.current, uploadLimitsRef.current);
    }, AUTO_SAVE_DEBOUNCE_MS);
  }, [persistSecurity]);

  const handleRequireApiKeyChange = (checked: boolean) => {
    setRequireApiKey(checked);
    requireApiKeyRef.current = checked;
    warnIfRequireWithoutKeys(checked);
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
    void persistSecurity(checked, uploadLimitsRef.current);
  };

  const handleUploadLimitsEnabledChange = (checked: boolean) => {
    const next = { ...uploadLimitsRef.current, enabled: checked };
    setUploadLimits(next);
    uploadLimitsRef.current = next;
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
    void persistSecurity(requireApiKeyRef.current, next);
  };

  const handleMaxUploadMbChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const megabytes = Number(event.target.value);
    if (!Number.isFinite(megabytes) || megabytes < 0) {
      return;
    }
    const next = {
      ...uploadLimitsRef.current,
      maxBytes: Math.round(megabytes * BYTES_PER_MB),
    };
    setUploadLimits(next);
    uploadLimitsRef.current = next;
    scheduleAutoSave();
  };

  const handlePerMinuteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const perMinute = Number(event.target.value);
    if (!Number.isFinite(perMinute) || perMinute < 0) {
      return;
    }
    const next = { ...uploadLimitsRef.current, perMinute };
    setUploadLimits(next);
    uploadLimitsRef.current = next;
    scheduleAutoSave();
  };

  const handlePerHourChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const perHour = Number(event.target.value);
    if (!Number.isFinite(perHour) || perHour < 0) {
      return;
    }
    const next = { ...uploadLimitsRef.current, perHour };
    setUploadLimits(next);
    uploadLimitsRef.current = next;
    scheduleAutoSave();
  };

  const usageSnippet = created
    ? created.scope === 'upload'
      ? `--send-http-json-urls=https://your-host/api/upload?api_key=${created.apiKey}`
      : `https://your-host/api/summary?api_key=${created.apiKey}`
    : '';

  return (
    <div className="space-y-6" data-screenshot-target="settings-content-card">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ColoredIcon icon={KeyRound} color="green" />
            {t('API Keys')}
          </CardTitle>
          <CardDescription>{t('Enabled keys can authenticate /api/upload (upload scope) or /api/summary and /api/lastbackup* (read scope).')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {keys.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('No API keys found')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Name')}</TableHead>
                  <TableHead>{t('Fingerprint')}</TableHead>
                  <TableHead>{t('Scope')}</TableHead>
                  <TableHead>{t('Created')}</TableHead>
                  <TableHead>{t('Expires')}</TableHead>
                  <TableHead>{t('Last used')}</TableHead>
                  <TableHead>{t('Uses')}</TableHead>
                  <TableHead>{t('Status')}</TableHead>
                  <TableHead>{t('Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <div className="font-medium">{key.name}</div>
                      {key.description && <div className="text-xs text-muted-foreground">{key.description}</div>}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{key.fingerprint}</TableCell>
                    <TableCell>{key.scope === 'upload' ? t('Upload') : t('Read')}</TableCell>
                    <TableCell>{formatDateTime(key.createdAt, locale)}</TableCell>
                    <TableCell>{key.expiresAt ? formatDate(key.expiresAt, locale) : t('Never')}</TableCell>
                    <TableCell>{key.lastUsedAt ? formatDateTime(key.lastUsedAt, locale) : t('Never')}</TableCell>
                    <TableCell>{key.usageCount}</TableCell>
                    <TableCell>{renderStatusBadge(key)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`api-key-enabled-${key.id}`}
                          checked={key.enabled}
                          disabled={togglingId === key.id || isApiKeyExpired(key.expiresAt)}
                          onCheckedChange={(checked) => {
                            void setKeyEnabled(key, checked === true);
                          }}
                          aria-label={
                            key.enabled
                              ? t('Disable API key {{name}}', { name: key.name })
                              : t('Enable API key {{name}}', { name: key.name })
                          }
                          title={
                            isApiKeyExpired(key.expiresAt)
                              ? t('Expired keys cannot be enabled')
                              : key.enabled
                                ? t('Disable this API key')
                                : t('Enable this API key')
                          }
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(key.id)}
                          title={t('Delete API key')}
                          aria-label={t('Delete API key {{name}}', { name: key.name })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Button variant="gradient" onClick={openCreateDialog} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            {t('Create API Key')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ColoredIcon icon={Shield} color="orange" />
            {t('External API protection')}
          </CardTitle>
          <CardDescription>
            {t('These controls protect the public upload and read APIs. Size and rate limits apply to /api/upload even when keys are optional.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-3">
            <Switch
              id="require-api-key"
              className="mt-0.5"
              checked={requireApiKey}
              onCheckedChange={handleRequireApiKeyChange}
            />
            <div className="space-y-1">
              <Label htmlFor="require-api-key">{t('Require API keys for external APIs')}</Label>
              <p className="text-xs text-muted-foreground">{t('When enabled, /api/upload, /api/summary and /api/lastbackup* reject requests without a valid key.')}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch
                id="enable-upload-limits"
                checked={uploadLimits.enabled}
                onCheckedChange={handleUploadLimitsEnabledChange}
              />
              <Label htmlFor="enable-upload-limits">{t('Enable upload rate limits')}</Label>
            </div>
            <div className="grid gap-4 md:grid-cols-3 pl-14">
              <div className="space-y-2">
                <Label htmlFor="upload-max-mb">{t('Max upload size (MB)')}</Label>
                <Input
                  id="upload-max-mb"
                  type="number"
                  min={1}
                  step={1}
                  value={uploadLimits.maxBytes / BYTES_PER_MB}
                  disabled={!uploadLimits.enabled}
                  onChange={handleMaxUploadMbChange}
                  onBlur={flushAutoSave}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload-per-minute">{t('Requests per minute')}</Label>
                <Input
                  id="upload-per-minute"
                  type="number"
                  min={1}
                  value={uploadLimits.perMinute}
                  disabled={!uploadLimits.enabled}
                  onChange={handlePerMinuteChange}
                  onBlur={flushAutoSave}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload-per-hour">{t('Requests per hour')}</Label>
                <Input
                  id="upload-per-hour"
                  type="number"
                  min={1}
                  value={uploadLimits.perHour}
                  disabled={!uploadLimits.enabled}
                  onChange={handlePerHourChange}
                  onBlur={flushAutoSave}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (open) {
            setCreateOpen(true);
            return;
          }
          closeCreateDialog();
        }}
      >
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(event) => {
            const target = event.target;
            if (
              target instanceof Element &&
              target.closest('.react-datepicker-popper, .react-datepicker, [data-radix-select-content]')
            ) {
              event.preventDefault();
            }
          }}
          onFocusOutside={(event) => {
            const target = event.target;
            if (
              target instanceof Element &&
              target.closest('.react-datepicker-popper, .react-datepicker, [data-radix-select-content]')
            ) {
              event.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ColoredIcon icon={Plus} color="blue" />
              {t('Create API Key')}
            </DialogTitle>
            <DialogDescription>
              {created
                ? t('Copy this API key now. It will not be shown again.')
                : t('Generate a scoped key for Duplicati uploads or Homepage read APIs. The secret is shown only once.')}
            </DialogDescription>
          </DialogHeader>
          {created ? (
            <Alert>
              <AlertDescription className="space-y-2">
                <div className="flex items-center gap-2 rounded-md border bg-background p-2 font-mono text-sm break-all">
                  <code className="flex-1">{created.apiKey}</code>
                  <Button size="sm" variant="ghost" onClick={() => copyKey(created.apiKey)}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{t('Fingerprint')}: {created.fingerprint}</p>
                <p className="text-xs font-mono break-all">{usageSnippet}</p>
              </AlertDescription>
            </Alert>
          ) : (
            <form id="create-api-key-form" onSubmit={createKey} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-[minmax(9rem,11rem)_minmax(12rem,1fr)]">
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="api-key-scope">{t('Scope')}</Label>
                  <Select value={scope} onValueChange={(value) => setScope(value as ApiKeyScope)}>
                    <SelectTrigger id="api-key-scope">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[70]">
                      <SelectItem value="upload">{t('Upload')}</SelectItem>
                      <SelectItem value="read">{t('Read')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="api-key-name">{t('Name')}</Label>
                  <Input id="api-key-name" value={name} onChange={(event) => setName(event.target.value)} disabled={creating} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key-description">{t('Description')}</Label>
                <Input id="api-key-description" value={description} onChange={(event) => setDescription(event.target.value)} disabled={creating} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key-expiry">{t('Expires (optional, YYYY-MM-DD)')}</Label>
                <div className="w-58">
                  <DatePicker id="api-key-expiry" value={expiresAt} onChange={setExpiresAt} disabled={creating} />
                </div>
              </div>
            </form>
          )}
          <DialogFooter>
            {created ? (
              <Button type="button" variant="gradient" onClick={closeCreateDialog}>{t('Close')}</Button>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={closeCreateDialog} disabled={creating}>
                  {t('Cancel')}
                </Button>
                <Button type="submit" form="create-api-key-form" variant="gradient" disabled={creating || loading}>
                  {creating ? t('Creating...') : t('Generate API Key')}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Delete API key?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('This cannot be undone. Duplicati jobs or Homepage widgets still using this key will stop authenticating.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={deleteKey}>{t('Delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
