import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { dbOps, ensureDatabaseInitialized } from '@/lib/db';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin } from '@/lib/auth-middleware';
import { AuditLogger } from '@/lib/audit-logger';
import { getClientIpAddress } from '@/lib/ip-utils';
import {
  apiKeyPrefix,
  apiKeySuffix,
  formatApiKeyFingerprint,
  generateApiKeySecret,
  hashApiKey,
} from '@/lib/api-key';
import { toPublicApiKey, type ApiKeyRecord } from '@/lib/api-key-auth';
import { isApiKeyScope } from '@/lib/types';

export const GET = withCSRF(requireAdmin(async (_request: NextRequest) => {
  try {
    await ensureDatabaseInitialized();
    const rows = dbOps.getAllApiKeys.all() as ApiKeyRecord[];
    return NextResponse.json({ keys: rows.map(toPublicApiKey) });
  } catch (error) {
    console.error('[API Keys] List error:', error);
    return NextResponse.json({ error: 'Internal server error', errorCode: 'INTERNAL_ERROR' }, { status: 500 });
  }
}));

export const POST = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    await ensureDatabaseInitialized();
    const body = await request.json() as {
      name?: string;
      description?: string;
      scope?: string;
      expiresAt?: string | null;
    };

    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ error: 'Name is required', errorCode: 'API_KEY_NAME_REQUIRED' }, { status: 400 });
    }
    if (!body.scope || !isApiKeyScope(body.scope)) {
      return NextResponse.json({ error: 'Scope must be upload or read', errorCode: 'API_KEY_SCOPE_INVALID' }, { status: 400 });
    }

    let expiresAt: string | null = null;
    if (body.expiresAt) {
      const parsed = new Date(body.expiresAt);
      if (!Number.isFinite(parsed.getTime())) {
        return NextResponse.json({ error: 'Invalid expiry date', errorCode: 'API_KEY_EXPIRY_INVALID' }, { status: 400 });
      }
      expiresAt = parsed.toISOString();
    }

    const secret = generateApiKeySecret();
    const id = `key_${randomBytes(16).toString('hex')}`;
    const prefix = apiKeyPrefix(secret);
    const suffix = apiKeySuffix(secret);

    dbOps.insertApiKey.run({
      id,
      name,
      key_hash: hashApiKey(secret),
      key_prefix: prefix,
      key_suffix: suffix,
      scope: body.scope,
      description: body.description?.trim() ?? '',
      enabled: 1,
      created_by: authContext.userId,
      expires_at: expiresAt,
    });

    const fingerprint = formatApiKeyFingerprint(prefix, suffix);
    await AuditLogger.log({
      userId: authContext.userId,
      username: authContext.username,
      action: 'api_key_created',
      category: 'config',
      targetType: 'api_key',
      targetId: id,
      details: { keyName: name, keyFingerprint: fingerprint, keyScope: body.scope },
      ipAddress: getClientIpAddress(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      status: 'success',
    });

    return NextResponse.json({
      id,
      name,
      scope: body.scope,
      fingerprint,
      apiKey: secret,
      message: 'Copy this key now. It will not be shown again.',
    });
  } catch (error) {
    console.error('[API Keys] Create error:', error);
    return NextResponse.json({ error: 'Internal server error', errorCode: 'INTERNAL_ERROR' }, { status: 500 });
  }
}));
