import { NextRequest, NextResponse } from 'next/server';
import { dbOps, ensureDatabaseInitialized } from '@/lib/db';
import { setConfiguration } from '@/lib/db-utils';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin, getAuthContext } from '@/lib/auth-middleware';
import { AuditLogger } from '@/lib/audit-logger';
import { getClientIpAddress, getPeerIp } from '@/lib/ip-utils';
import {
  getIpAllowlistSnapshot,
  invalidateIpAllowlistCache,
  ipMatchesCidrs,
  parseCidrInput,
  resolveAllowlistIp,
} from '@/lib/ip-allowlist';
import { ensureLoopbackAllowlistCidrs } from '@/lib/cidr-format';

export const GET = withCSRF(async (request: NextRequest) => {
  const auth = await getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  if (!auth.isAdmin) {
    return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });
  }

  await ensureDatabaseInitialized();
  const snapshot = getIpAllowlistSnapshot();
  const recentUploads = dbOps.getRecentUploadIps.all() as Array<{ ip: string; count: number; lastSeen: string }>;
  const recentAdminLogins = dbOps.getRecentAdminLoginIps.all() as Array<{ ip: string; count: number; lastSeen: string }>;

  return NextResponse.json({
    ...snapshot,
    peerIp: getPeerIp(request),
    detectedIp: resolveAllowlistIp(request),
    recentUploadIps: recentUploads,
    recentAdminLoginIps: recentAdminLogins,
  });
});

export const PATCH = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    await ensureDatabaseInitialized();
    const body = await request.json() as {
      trusted?: { trustProxy?: boolean; trustedProxies?: unknown };
      admin?: { enabled?: boolean; cidrs?: unknown };
      external?: { enabled?: boolean; cidrs?: unknown };
    };

    const snapshot = getIpAllowlistSnapshot();
    const peerIp = getPeerIp(request);
    const detectedIp = resolveAllowlistIp(request);

    if (body.trusted) {
      const cidrs = body.trusted.trustedProxies !== undefined
        ? parseCidrInput(body.trusted.trustedProxies)
        : snapshot.trusted.trustedProxies;
      if (cidrs === null) {
        return NextResponse.json({ error: 'Invalid trusted proxy CIDR', errorCode: 'CIDR_INVALID' }, { status: 400 });
      }
      setConfiguration('ip_trusted_proxies', JSON.stringify({
        trustProxy: body.trusted.trustProxy ?? snapshot.trusted.trustProxy,
        trustedProxies: cidrs,
      }));
    }

    if (body.admin) {
      const cidrs = body.admin.cidrs !== undefined
        ? parseCidrInput(body.admin.cidrs)
        : snapshot.admin.cidrs;
      if (cidrs === null) {
        return NextResponse.json({ error: 'Invalid admin allowlist CIDR', errorCode: 'CIDR_INVALID' }, { status: 400 });
      }
      const normalizedCidrs = ensureLoopbackAllowlistCidrs(cidrs);
      const enabled = body.admin.enabled ?? snapshot.admin.enabled;
      if (enabled && detectedIp && !ipMatchesCidrs(detectedIp, normalizedCidrs) && peerIp !== '127.0.0.1' && peerIp !== '::1') {
        return NextResponse.json(
          { error: 'Add your current IP before enabling the admin allowlist', errorCode: 'ADMIN_ALLOWLIST_CURRENT_IP_REQUIRED', detectedIp },
          { status: 400 }
        );
      }
      setConfiguration('admin_ip_allowlist', JSON.stringify({ enabled, cidrs: normalizedCidrs }));
    }

    if (body.external) {
      const cidrs = body.external.cidrs !== undefined
        ? parseCidrInput(body.external.cidrs)
        : snapshot.external.cidrs;
      if (cidrs === null) {
        return NextResponse.json({ error: 'Invalid external allowlist CIDR', errorCode: 'CIDR_INVALID' }, { status: 400 });
      }
      setConfiguration('external_api_ip_allowlist', JSON.stringify({
        enabled: body.external.enabled ?? snapshot.external.enabled,
        cidrs: ensureLoopbackAllowlistCidrs(cidrs),
      }));
    }

    invalidateIpAllowlistCache();

    await AuditLogger.logConfigChange(
      'ip_allowlist_updated',
      authContext.userId,
      authContext.username,
      'ip_allowlist',
      getIpAllowlistSnapshot(),
      getClientIpAddress(request),
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      ...getIpAllowlistSnapshot(),
      peerIp,
      detectedIp,
    });
  } catch (error) {
    console.error('[IP allowlist] Update error:', error);
    return NextResponse.json({ error: 'Internal server error', errorCode: 'INTERNAL_ERROR' }, { status: 500 });
  }
}));

