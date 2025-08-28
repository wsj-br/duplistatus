"use server";

import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    // If both startDate and endDate are provided, use time range filtering
    if (startDateParam && endDateParam) {
      const startDate = new Date(startDateParam);
      const endDate = new Date(endDateParam);
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date parameters' }, { status: 400 });
      }
      
      const chartData = await dbUtils.getAggregatedChartDataWithTimeRange(startDate, endDate);
      return NextResponse.json(chartData);
    } else {
      // Otherwise, get all aggregated chart data
      const chartData = await dbUtils.getAggregatedChartData();
      return NextResponse.json(chartData);
    }
  } catch (error) {
    console.error('Error fetching aggregated chart data:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
}
