import { NextRequest, NextResponse } from 'next/server';
import { dbOps, ensureDatabaseInitialized } from '@/lib/db';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin } from '@/lib/auth-middleware';
import { AuditLogger } from '@/lib/audit-logger';
import { getClientIpAddress } from '@/lib/ip-utils';
import { formatApiKeyFingerprint } from '@/lib/api-key';
import type { ApiKeyRecord } from '@/lib/api-key-auth';

function apiKeyIdFromRequest(request: NextRequest): string {
  const match = request.nextUrl.pathname.match(/\/api\/api-keys\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : '';
}

export const PATCH = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    await ensureDatabaseInitialized();
    const id = apiKeyIdFromRequest(request);
    const existing = dbOps.getApiKeyById.get(id) as ApiKeyRecord | undefined;
    if (!existing) {
      return NextResponse.json({ error: 'API key not found', errorCode: 'API_KEY_NOT_FOUND' }, { status: 404 });
    }

    const body = await request.json() as {
      name?: string;
      description?: string;
      enabled?: boolean;
    };

    dbOps.updateApiKey.run({
      id,
      name: body.name?.trim() ?? null,
      description: body.description !== undefined ? body.description.trim() : null,
      enabled: typeof body.enabled === 'boolean' ? (body.enabled ? 1 : 0) : null,
    });

    const fingerprint = formatApiKeyFingerprint(existing.key_prefix, existing.key_suffix);
    await AuditLogger.log({
      userId: authContext.userId,
      username: authContext.username,
      action: typeof body.enabled === 'boolean'
        ? (body.enabled ? 'api_key_enabled' : 'api_key_disabled')
        : 'api_key_updated',
      category: 'config',
      targetType: 'api_key',
      targetId: id,
      details: {
        keyName: body.name?.trim() ?? existing.name,
        keyFingerprint: fingerprint,
        keyScope: existing.scope,
        enabled: body.enabled ?? existing.enabled === 1,
      },
      ipAddress: getClientIpAddress(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      status: 'success',
    });

    const updated = dbOps.getApiKeyById.get(id) as ApiKeyRecord;
    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      scope: updated.scope,
      fingerprint,
      enabled: updated.enabled === 1,
    });
  } catch (error) {
    console.error('[API Keys] Update error:', error);
    return NextResponse.json({ error: 'Internal server error', errorCode: 'INTERNAL_ERROR' }, { status: 500 });
  }
}));

export const DELETE = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    await ensureDatabaseInitialized();
    const id = apiKeyIdFromRequest(request);
    const existing = dbOps.getApiKeyById.get(id) as ApiKeyRecord | undefined;
    if (!existing) {
      return NextResponse.json({ error: 'API key not found', errorCode: 'API_KEY_NOT_FOUND' }, { status: 404 });
    }

    dbOps.deleteApiKey.run(id);
    const fingerprint = formatApiKeyFingerprint(existing.key_prefix, existing.key_suffix);
    await AuditLogger.log({
      userId: authContext.userId,
      username: authContext.username,
      action: 'api_key_deleted',
      category: 'config',
      targetType: 'api_key',
      targetId: id,
      details: {
        keyName: existing.name,
        keyFingerprint: fingerprint,
        keyScope: existing.scope,
      },
      ipAddress: getClientIpAddress(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      status: 'success',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Keys] Delete error:', error);
    return NextResponse.json({ error: 'Internal server error', errorCode: 'INTERNAL_ERROR' }, { status: 500 });
  }
}));
