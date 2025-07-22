import { NextRequest } from 'next/server';
import { getCronConfig } from '@/lib/db-utils';

const cronConfig = getCronConfig();
const CRON_SERVICE_URL = process.env.CRON_SERVICE_URL || `http://localhost:${cronConfig.port}`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const response = await fetch(`${CRON_SERVICE_URL}/${path}`);
  return new Response(response.body, {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
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
} 