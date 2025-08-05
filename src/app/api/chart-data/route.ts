import { NextResponse } from 'next/server';
import { getAggregatedChartData } from '@/lib/db-utils';

export async function GET() {
  try {
    const aggregatedChartData = await getAggregatedChartData();
    
    // Ensure we always return a valid JSON array
    if (!Array.isArray(aggregatedChartData)) {
      console.error('getAggregatedChartData returned non-array:', aggregatedChartData);
      return NextResponse.json([]);
    }
    
    return NextResponse.json(aggregatedChartData);
  } catch (error) {
    console.error('Error fetching chart data:', error instanceof Error ? error.message : String(error));
    // Return empty array instead of error to prevent JSON parsing issues
    return NextResponse.json([]);
  }
} 