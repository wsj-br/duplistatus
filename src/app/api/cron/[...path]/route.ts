import { NextRequest, NextResponse } from 'next/server';
import { getCronConfig } from '@/lib/db-utils';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireAdmin, requireAuth } from '@/lib/auth-middleware';

function getCronServiceUrl(): string {
  if (process.env.CRON_SERVICE_URL) {
    return process.env.CRON_SERVICE_URL.replace(/\/$/, '');
  }
  const cronConfig = getCronConfig();
  return `http://127.0.0.1:${cronConfig.port}`;
}

function cronForwardHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const secret = process.env.CRON_SERVICE_SECRET;
  if (secret) {
    headers['X-Cron-Service-Secret'] = secret;
  }
  return headers;
}

function cronPathFromRequest(request: NextRequest): string {
  const prefix = '/api/cron/';
  const pathname = request.nextUrl.pathname;
  const index = pathname.indexOf(prefix);
  return index === -1 ? '' : pathname.slice(index + prefix.length);
}

export const GET = withCSRF(requireAuth(async (request: NextRequest) => {
  try {
    const path = cronPathFromRequest(request);
    const response = await fetch(`${getCronServiceUrl()}/${path}`, {
      headers: cronForwardHeaders(),
    });
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Cron service not available:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({
      error: 'Cron service is not running',
      message: 'The cron service is not available. Please start it with: npm run cron:start'
    }, { status: 503 });
  }
}));

export const POST = withCSRF(requireAdmin(async (request: NextRequest) => {
  try {
    const path = cronPathFromRequest(request);
    const body = await request.text();
    const response = await fetch(`${getCronServiceUrl()}/${path}`, {
      method: 'POST',
      headers: cronForwardHeaders(),
      body,
    });
    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Cron service not available:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({
      error: 'Cron service is not running',
      message: 'The cron service is not available. Please start it with: npm run cron:start'
    }, { status: 503 });
  }
}));
