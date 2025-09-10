import { NextResponse } from 'next/server';
import { getAllServersChartData } from '@/lib/db-utils';

export async function GET() {
  try {
    const allServersChartData = await getAllServersChartData();
    
    // Ensure we always return a valid JSON array
    if (!Array.isArray(allServersChartData)) {
      console.error('getAllServersChartData returned non-array:', allServersChartData);
      return NextResponse.json([]);
    }

    return NextResponse.json(allServersChartData);
  } catch (error) {
    console.error('Error fetching chart data:', error instanceof Error ? error.message : String(error));
    // Return empty array instead of error to prevent JSON parsing issues
    return NextResponse.json([]);
  }
} 