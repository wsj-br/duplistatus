import { NextRequest } from 'next/server';
import { getCronConfig } from '@/lib/db-utils';
import { withCSRF } from '@/lib/csrf-middleware';

const cronConfig = getCronConfig();
const CRON_SERVICE_URL = process.env.CRON_SERVICE_URL || `http://localhost:${cronConfig.port}`;

export const GET = withCSRF(async (
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) => {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const response = await fetch(`${CRON_SERVICE_URL}/${path}`);
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Cron service not available:', error instanceof Error ? error.message : String(error));
    return new Response(JSON.stringify({ 
      error: 'Cron service is not running',
      message: 'The cron service is not available. Please start it with: npm run cron:start'
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});

export const POST = withCSRF(async (
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) => {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    
    // First read the request body as a stream
    const body = await request.text();
    
    const response = await fetch(`${CRON_SERVICE_URL}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });
    
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Cron service not available:', error instanceof Error ? error.message : String(error));
    return new Response(JSON.stringify({ 
      error: 'Cron service is not running',
      message: 'The cron service is not available. Please start it with: npm run cron:start'
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
});