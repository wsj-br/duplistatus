import { NextResponse } from 'next/server';
import { getAllMachinesChartData } from '@/lib/db-utils';

export async function GET() {
  try {
    const allMachinesChartData = await getAllMachinesChartData();
    
    // Ensure we always return a valid JSON array
    if (!Array.isArray(allMachinesChartData)) {
      console.error('getAllMachinesChartData returned non-array:', allMachinesChartData);
      return NextResponse.json([]);
    }
    
    return NextResponse.json(allMachinesChartData);
  } catch (error) {
    console.error('Error fetching chart data:', error instanceof Error ? error.message : String(error));
    // Return empty array instead of error to prevent JSON parsing issues
    return NextResponse.json([]);
  }
} 