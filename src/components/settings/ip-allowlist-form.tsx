'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Globe, Network, Shield, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ColoredIcon } from '@/components/ui/colored-icon';
import { useToast } from '@/components/ui/use-toast';
import { CidrListEditor } from '@/components/settings/cidr-list-editor';
import { authenticatedRequestWithRecovery } from '@/lib/client-session-csrf';
import { appendUniqueCidrs, ensureLoopbackAllowlistCidrs, LOOPBACK_ALLOWLIST_CIDRS } from '@/lib/cidr-format';
import type { CidrAllowlistConfig, TrustedProxiesConfig } from '@/lib/types';

interface RecentIpEntry {
  ip: string;
  count: number;
  lastSeen: string;
}

interface AllowlistResponse {
  trusted: TrustedProxiesConfig;
  admin: CidrAllowlistConfig;
  external: CidrAllowlistConfig;
  peerIp: string;
  detectedIp: string;
  recentUploadIps: RecentIpEntry[];
  recentAdminLoginIps: RecentIpEntry[];
}

function RecentIpSuggestions({
  label,
  items,
  onAdd,
  disabled,
}: {
  label: string;
  items: RecentIpEntry[];
  onAdd: (ip: string) => void;
  disabled?: boolean;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Button
            key={item.ip}
            type="button"
            size="sm"
            variant="outline"
            className="font-mono"
            disabled={disabled}
            onClick={() => onAdd(item.ip)}
          >
            {item.ip}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function IpAllowlistForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trusted, setTrusted] = useState<TrustedProxiesConfig>({ trustProxy: false, trustedProxies: [] });
  const [admin, setAdmin] = useState<CidrAllowlistConfig>({ enabled: false, cidrs: [] });
  const [external, setExternal] = useState<CidrAllowlistConfig>({ enabled: false, cidrs: [] });
  const [peerIp, setPeerIp] = useState('');
  const [detectedIp, setDetectedIp] = useState('');
  const [recentUploadIps, setRecentUploadIps] = useState<RecentIpEntry[]>([]);
  const [recentAdminLoginIps, setRecentAdminLoginIps] = useState<RecentIpEntry[]>([]);

  const load = useCallback(async () => {
    const response = await authenticatedRequestWithRecovery('/api/configuration/ip-allowlist');
    if (!response.ok) {
      throw new Error(t('Failed to load IP allowlist settings'));
    }
    const data = await response.json() as AllowlistResponse;
    setTrusted(data.trusted);
    setAdmin({
      ...data.admin,
      cidrs: ensureLoopbackAllowlistCidrs(data.admin.cidrs),
    });
    setExternal({
      ...data.external,
      cidrs: ensureLoopbackAllowlistCidrs(data.external.cidrs),
    });
    setPeerIp(data.peerIp);
    setDetectedIp(data.detectedIp);
    setRecentUploadIps(data.recentUploadIps ?? []);
    setRecentAdminLoginIps(data.recentAdminLoginIps ?? []);
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await load();
      } catch (error) {
        if (!cancelled) {
          toast({
            title: t('Error'),
            description: error instanceof Error ? error.message : t('Failed to load IP allowlist settings'),
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
  }, [load, t, toast]);

  const addToAdmin = (ip: string) => {
    if (!ip) {
      return;
    }
    setAdmin((current) => ({
      ...current,
      cidrs: appendUniqueCidrs(current.cidrs, [ip]),
    }));
  };

  const addToExternal = (ip: string) => {
    if (!ip) {
      return;
    }
    setExternal((current) => ({
      ...current,
      cidrs: appendUniqueCidrs(current.cidrs, [ip]),
    }));
  };

  const save = async () => {
    try {
      setSaving(true);
      const response = await authenticatedRequestWithRecovery('/api/configuration/ip-allowlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trusted: { trustProxy: trusted.trustProxy, trustedProxies: trusted.trustedProxies },
          admin: { enabled: admin.enabled, cidrs: admin.cidrs },
          external: { enabled: external.enabled, cidrs: external.cidrs },
        }),
      });
      if (!response.ok) {
        const error = await response.json() as { error?: string };
        throw new Error(error.error || t('Failed to save IP allowlist settings'));
      }
      await load();
      toast({ title: t('Saved'), description: t('IP allowlist settings were updated.') });
    } catch (error) {
      toast({
        title: t('Error'),
        description: error instanceof Error ? error.message : t('Failed to save IP allowlist settings'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" data-screenshot-target="settings-content-card">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ColoredIcon icon={Shield} color="blue" />
            {t('Detected IP')}
          </CardTitle>
          <CardDescription>
            {t('The peer address comes from the TCP connection. Enable trusted proxies only behind a reverse proxy that overwrites X-Forwarded-For.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 rounded-md border border-input bg-muted/20 px-3 py-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('Peer IP')}</dt>
              <dd><code className="text-sm">{peerIp || t('unknown')}</code></dd>
            </div>
            <div className="space-y-1 rounded-md border border-input bg-muted/20 px-3 py-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('Allowlist IP')}</dt>
              <dd><code className="text-sm">{detectedIp || t('unknown')}</code></dd>
            </div>
          </dl>
          {!peerIp && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('Peer IP header is missing. The allowlist will deny all access if enabled. Check that scripts/peer-ip.cjs is loaded.')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ColoredIcon icon={Network} color="purple" />
            {t('Trusted proxies')}
          </CardTitle>
          <CardDescription>{t('Shared by the admin and external allowlists. Only trust X-Forwarded-For when the TCP peer is in this list.')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Switch
              id="trust-proxy-headers"
              className="mt-0.5"
              checked={trusted.trustProxy}
              disabled={loading}
              onCheckedChange={(checked) => setTrusted((current) => ({ ...current, trustProxy: checked }))}
            />
            <div className="space-y-1">
              <Label htmlFor="trust-proxy-headers">{t('Trust reverse proxy headers')}</Label>
            </div>
          </div>
          <CidrListEditor
            id="trusted-cidrs"
            label={t('Trusted proxy CIDRs')}
            value={trusted.trustedProxies}
            disabled={loading}
            onChange={(trustedProxies) => setTrusted((current) => ({ ...current, trustedProxies }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ColoredIcon icon={ShieldAlert} color="orange" />
            {t('Admin interface')}
          </CardTitle>
          <CardDescription>{t('Restricts pages, login, and session APIs. You cannot enable this list unless your current IP is included.')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Switch
              id="enable-admin-allowlist"
              className="mt-0.5"
              checked={admin.enabled}
              disabled={loading}
              onCheckedChange={(checked) => setAdmin((current) => ({ ...current, enabled: checked }))}
            />
            <div className="space-y-1">
              <Label htmlFor="enable-admin-allowlist">{t('Enable admin IP allowlist')}</Label>
            </div>
          </div>
          <CidrListEditor
            id="admin-cidrs"
            label={t('Allowed CIDRs')}
            value={admin.cidrs}
            disabled={loading}
            currentIp={detectedIp}
            lockedCidrs={LOOPBACK_ALLOWLIST_CIDRS}
            onChange={(cidrs) => setAdmin((current) => ({ ...current, cidrs: ensureLoopbackAllowlistCidrs(cidrs) }))}
          />
          <Button type="button" variant="outline" onClick={() => addToAdmin(detectedIp)} disabled={!detectedIp || loading}>
            {t('Add current IP')}
          </Button>
          <RecentIpSuggestions
            label={t('Recent admin login IPs')}
            items={recentAdminLoginIps}
            disabled={loading}
            onAdd={addToAdmin}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ColoredIcon icon={Globe} color="green" />
            {t('External APIs')}
          </CardTitle>
          <CardDescription>
            {t('Restricts /api/upload, /api/summary and /api/lastbackup*. Use this when API keys are off. Unlisted Duplicati servers will stop uploading.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Switch
              id="enable-external-allowlist"
              className="mt-0.5"
              checked={external.enabled}
              disabled={loading}
              onCheckedChange={(checked) => setExternal((current) => ({ ...current, enabled: checked }))}
            />
            <div className="space-y-1">
              <Label htmlFor="enable-external-allowlist">{t('Enable external API IP allowlist')}</Label>
            </div>
          </div>
          <CidrListEditor
            id="external-cidrs"
            label={t('Allowed CIDRs')}
            value={external.cidrs}
            disabled={loading}
            lockedCidrs={LOOPBACK_ALLOWLIST_CIDRS}
            onChange={(cidrs) => setExternal((current) => ({ ...current, cidrs: ensureLoopbackAllowlistCidrs(cidrs) }))}
          />
          <RecentIpSuggestions
            label={t('Recent upload source IPs')}
            items={recentUploadIps}
            disabled={loading}
            onAdd={addToExternal}
          />
        </CardContent>
      </Card>

      <Button variant="gradient" onClick={save} disabled={saving || loading}>
        {saving ? t('Saving...') : t('Save IP allowlist')}
      </Button>
    </div>
  );
}
