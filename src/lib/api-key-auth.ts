import { NextRequest, NextResponse } from 'next/server';
import { dbOps, ensureDatabaseInitialized } from './db';
import { getConfiguration } from './db-utils';
import { AuditLogger } from './audit-logger';
import {
  formatApiKeyFingerprint,
  hashApiKey,
  maskApiKeyValue,
} from './api-key';
import { getPeerIp, getClientIpAddress } from './ip-utils';
import type { ApiKeyScope } from './types';
import { assertApiKeyScope } from './types';
import { AUTH_FAILURE_PER_HOUR, AUTH_FAILURE_PER_MINUTE, defaultUploadLimits, READ_API_PER_HOUR, READ_API_PER_MINUTE } from './default-config';
import type { UploadLimitsConfig } from './types';
import { checkRateLimit } from './rate-limit';

export interface ApiKeyRecord {
  id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  key_suffix: string;
  scope: ApiKeyScope;
  description: string;
  enabled: number;
  created_at: string;
  created_by: string | null;
  expires_at: string | null;
  last_used_at: string | null;
  usage_count: number;
}

export interface ApiKeyAuthSuccess {
  ok: true;
  key: ApiKeyRecord | null;
  fingerprint: string | null;
}

export interface ApiKeyAuthFailure {
  ok: false;
  response: NextResponse;
}

export type ApiKeyAuthResult = ApiKeyAuthSuccess | ApiKeyAuthFailure;

export function isExternalApiKeyRequired(): boolean {
  return getConfiguration('external_api_require_api_key') === 'true';
}

export function getUploadLimitsConfig(): UploadLimitsConfig {
  const raw = getConfiguration('upload_limits');
  if (!raw) {
    return { ...defaultUploadLimits };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<UploadLimitsConfig>;
    return {
      enabled: parsed.enabled !== false,
      maxBytes: typeof parsed.maxBytes === 'number' && parsed.maxBytes > 0
        ? parsed.maxBytes
        : defaultUploadLimits.maxBytes,
      perMinute: typeof parsed.perMinute === 'number' && parsed.perMinute > 0
        ? parsed.perMinute
        : defaultUploadLimits.perMinute,
      perHour: typeof parsed.perHour === 'number' && parsed.perHour > 0
        ? parsed.perHour
        : defaultUploadLimits.perHour,
    };
  } catch {
    return { ...defaultUploadLimits };
  }
}

export function extractApiKeySecret(
  request: NextRequest,
  extra?: Record<string, unknown> | null
): string | null {
  const fromQuery = request.nextUrl.searchParams.get('api_key');
  if (fromQuery) {
    return fromQuery;
  }

  const headerKey = request.headers.get('x-api-key');
  if (headerKey) {
    return headerKey;
  }

  const authorization = request.headers.get('authorization');
  if (authorization?.toLowerCase().startsWith('bearer ')) {
    const token = authorization.slice('bearer '.length).trim();
    if (token) {
      return token;
    }
  }

  if (extra && typeof extra.api_key === 'string' && extra.api_key.length > 0) {
    return extra.api_key;
  }

  return null;
}

function jsonError(
  status: number,
  error: string,
  errorCode: string,
  extra?: Record<string, unknown>,
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json({ error, errorCode, ...extra }, { status, headers });
}

async function auditKeyAttempt(
  request: NextRequest,
  status: 'success' | 'failure',
  details: Record<string, unknown>,
  errorMessage?: string
): Promise<void> {
  const ipAddress = getPeerIp(request) || getClientIpAddress(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  await AuditLogger.log({
    action: 'external_api_key',
    category: 'auth',
    targetType: 'api_key',
    targetId: typeof details.keyId === 'string' ? details.keyId : null,
    details,
    ipAddress,
    userAgent,
    status,
    errorMessage,
  });
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) {
    return false;
  }
  const expires = new Date(expiresAt);
  return Number.isFinite(expires.getTime()) && expires.getTime() <= Date.now();
}

export async function authenticateExternalApiKey(
  request: NextRequest,
  requiredScope: ApiKeyScope,
  extra?: Record<string, unknown> | null
): Promise<ApiKeyAuthResult> {
  assertApiKeyScope(requiredScope);
  await ensureDatabaseInitialized();

  const required = isExternalApiKeyRequired();
  const secret = extractApiKeySecret(request, extra);

  if (!secret) {
    if (!required) {
      return { ok: true, key: null, fingerprint: null };
    }
    await auditKeyAttempt(request, 'failure', {
      reason: 'missing',
      requiredScope,
    }, 'API key required');
    return {
      ok: false,
      response: jsonError(401, 'API key required', 'API_KEY_REQUIRED'),
    };
  }

  const hash = hashApiKey(secret);
  const row = dbOps.getApiKeyByHash.get(hash) as ApiKeyRecord | undefined;
  const fingerprint = row
    ? formatApiKeyFingerprint(row.key_prefix, row.key_suffix)
    : maskApiKeyValue(secret);

  if (!row) {
    const ip = getPeerIp(request) || getClientIpAddress(request) || 'unknown';
    const throttle = checkRateLimit(
      `authfail:${ip}`,
      AUTH_FAILURE_PER_MINUTE,
      AUTH_FAILURE_PER_HOUR
    );
    await auditKeyAttempt(request, 'failure', {
      reason: 'invalid',
      requiredScope,
      keyFingerprint: fingerprint,
      unmatched: true,
    }, 'Invalid API key');
    if (!throttle.allowed) {
      return {
        ok: false,
        response: jsonError(
          429,
          'Too many authentication failures',
          'API_KEY_AUTH_RATE_LIMITED',
          { retryAfter: throttle.retryAfterSeconds },
          { 'Retry-After': String(throttle.retryAfterSeconds) }
        ),
      };
    }
    return {
      ok: false,
      response: jsonError(401, 'Invalid API key', 'API_KEY_INVALID'),
    };
  }

  if (row.enabled !== 1) {
    await auditKeyAttempt(request, 'failure', {
      reason: 'disabled',
      requiredScope,
      keyId: row.id,
      keyName: row.name,
      keyFingerprint: fingerprint,
      keyScope: row.scope,
    }, 'API key disabled');
    return {
      ok: false,
      response: jsonError(401, 'API key disabled', 'API_KEY_DISABLED'),
    };
  }

  if (isExpired(row.expires_at)) {
    await auditKeyAttempt(request, 'failure', {
      reason: 'expired',
      requiredScope,
      keyId: row.id,
      keyName: row.name,
      keyFingerprint: fingerprint,
      keyScope: row.scope,
    }, 'API key expired');
    return {
      ok: false,
      response: jsonError(401, 'API key expired', 'API_KEY_EXPIRED'),
    };
  }

  if (row.scope !== requiredScope) {
    await auditKeyAttempt(request, 'failure', {
      reason: 'wrong_scope',
      requiredScope,
      keyId: row.id,
      keyName: row.name,
      keyFingerprint: fingerprint,
      keyScope: row.scope,
    }, 'API key scope mismatch');
    return {
      ok: false,
      response: jsonError(403, 'API key does not have the required scope', 'API_KEY_WRONG_SCOPE'),
    };
  }

  dbOps.touchApiKey.run(row.id);
  await auditKeyAttempt(request, 'success', {
    requiredScope,
    keyId: row.id,
    keyName: row.name,
    keyFingerprint: fingerprint,
    keyScope: row.scope,
  });

  return { ok: true, key: row, fingerprint };
}

export async function requireReadApiAccess(request: NextRequest): Promise<NextResponse | null> {
  const auth = await authenticateExternalApiKey(request, 'read');
  if (!auth.ok) {
    return auth.response;
  }

  const limits = getUploadLimitsConfig();
  if (limits.enabled) {
    const ip = getPeerIp(request) || getClientIpAddress(request) || 'unknown';
    const bucket = auth.key ? `read:key:${auth.key.id}` : `read:ip:${ip}`;
    const decision = checkRateLimit(bucket, READ_API_PER_MINUTE, READ_API_PER_HOUR);
    if (!decision.allowed) {
      return jsonError(
        429,
        'Too many requests',
        'READ_API_RATE_LIMITED',
        { retryAfter: decision.retryAfterSeconds },
        { 'Retry-After': String(decision.retryAfterSeconds) }
      );
    }
  }

  return null;
}

export function toPublicApiKey(row: ApiKeyRecord) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    scope: row.scope,
    fingerprint: formatApiKeyFingerprint(row.key_prefix, row.key_suffix),
    enabled: row.enabled === 1,
    createdAt: row.created_at,
    createdBy: row.created_by,
    expiresAt: row.expires_at,
    lastUsedAt: row.last_used_at,
    usageCount: row.usage_count,
  };
}
