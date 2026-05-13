import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { ok: true },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    },
  );
}
