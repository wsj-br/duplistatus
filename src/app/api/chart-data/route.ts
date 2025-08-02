import { NextResponse } from 'next/server';
import { getAggregatedChartData } from '@/lib/db-utils';

export async function GET() {
  try {
    const aggregatedChartData = await getAggregatedChartData();
    return NextResponse.json(aggregatedChartData);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
} 