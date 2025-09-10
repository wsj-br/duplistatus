import { NextResponse } from 'next/server';
import { getAllServerAddresses } from '@/lib/db-utils';

export async function GET() {
  try {
    const serverAddresses = getAllServerAddresses();

  return NextResponse.json({
    serverAddresses
    });
  } catch (error) {
    console.error('Failed to get server connections:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to get server connections' }, { status: 500 });
  }
}
