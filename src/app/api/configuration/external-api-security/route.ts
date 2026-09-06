import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/lib/db';
import { getConfiguration, setConfiguration } from '@/lib/db-utils';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin, getAuthContext } from '@/lib/auth-middleware';
import { AuditLogger } from '@/lib/audit-logger';
import { getClientIpAddress } from '@/lib/ip-utils';
import { getUploadLimitsConfig, isExternalApiKeyRequired } from '@/lib/api-key-auth';
import { defaultUploadLimits } from '@/lib/default-config';
import type { UploadLimitsConfig } from '@/lib/types';

export const GET = withCSRF(async (request: NextRequest) => {
  const auth = await getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  if (!auth.isAdmin) {
    return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });
  }

  await ensureDatabaseInitialized();
  return NextResponse.json({
    requireApiKey: isExternalApiKeyRequired(),
    uploadLimits: getUploadLimitsConfig(),
  });
});

export const PATCH = withCSRF(requireAdmin(async (request: NextRequest, authContext) => {
  try {
    await ensureDatabaseInitialized();
    const body = await request.json() as {
      requireApiKey?: boolean;
      uploadLimits?: Partial<UploadLimitsConfig>;
    };

    if (typeof body.requireApiKey === 'boolean') {
      setConfiguration('external_api_require_api_key', body.requireApiKey ? 'true' : 'false');
    }

    if (body.uploadLimits) {
      const current = getUploadLimitsConfig();
      const next: UploadLimitsConfig = {
        enabled: typeof body.uploadLimits.enabled === 'boolean' ? body.uploadLimits.enabled : current.enabled,
        maxBytes: typeof body.uploadLimits.maxBytes === 'number' && body.uploadLimits.maxBytes > 0
          ? Math.floor(body.uploadLimits.maxBytes)
          : current.maxBytes,
        perMinute: typeof body.uploadLimits.perMinute === 'number' && body.uploadLimits.perMinute > 0
          ? Math.floor(body.uploadLimits.perMinute)
          : current.perMinute,
        perHour: typeof body.uploadLimits.perHour === 'number' && body.uploadLimits.perHour > 0
          ? Math.floor(body.uploadLimits.perHour)
          : current.perHour,
      };
      if (next.maxBytes < 1024) {
        return NextResponse.json({ error: 'Maximum upload size is too small', errorCode: 'UPLOAD_LIMIT_INVALID' }, { status: 400 });
      }
      setConfiguration('upload_limits', JSON.stringify(next));
    }

    await AuditLogger.logConfigChange(
      'external_api_security_updated',
      authContext.userId,
      authContext.username,
      'external_api_security',
      {
        requireApiKey: typeof body.requireApiKey === 'boolean' ? body.requireApiKey : isExternalApiKeyRequired(),
        uploadLimits: getUploadLimitsConfig(),
      },
      getClientIpAddress(request),
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      requireApiKey: isExternalApiKeyRequired(),
      uploadLimits: getUploadLimitsConfig() ?? defaultUploadLimits,
    });
  } catch (error) {
    console.error('[External API security] Update error:', error);
    return NextResponse.json({ error: 'Internal server error', errorCode: 'INTERNAL_ERROR' }, { status: 500 });
  }
}));
