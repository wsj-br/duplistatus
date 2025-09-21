import { NextResponse } from 'next/server';
import { setConfiguration, getOverdueToleranceConfig } from '@/lib/db-utils';

export async function GET() {
  try {
    const tolerance = getOverdueToleranceConfig();
    return NextResponse.json({ overdue_tolerance: tolerance });
  } catch (error) {
    console.error('Failed to get overdue tolerance:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to get overdue tolerance' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { overdue_tolerance } = body;
    
    if (overdue_tolerance === undefined) {
      return NextResponse.json({ error: 'overdue_tolerance is required' }, { status: 400 });
    }
    
    // Only update the overdue tolerance setting
    setConfiguration('overdue_tolerance', overdue_tolerance);
    
    return NextResponse.json({ message: 'Overdue tolerance updated successfully' });
  } catch (error) {
    console.error('Failed to update overdue tolerance:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to update overdue tolerance' }, { status: 500 });
  }
} 