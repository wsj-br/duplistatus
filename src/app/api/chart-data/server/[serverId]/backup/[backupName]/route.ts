"use server";

import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string; backupName: string }> }
) {
  try {
    const { serverId, backupName: encodedBackupName } = await params;
    const backupName = decodeURIComponent(encodedBackupName);
    
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    let chartData;
    if (startDateParam && endDateParam) {
      const startDate = new Date(startDateParam);
      const endDate = new Date(endDateParam);
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date parameters' }, { status: 400 });
      }
      
      chartData = await dbUtils.getServerBackupChartDataWithTimeRange(serverId, backupName, startDate, endDate);
    } else {
      // Otherwise, get all server/backup chart data
      chartData = await dbUtils.getServerBackupChartData(serverId, backupName);
    }
    
    if (!Array.isArray(chartData)) {
      console.error(`Server backup chart data for ${serverId}:${backupName} returned non-array:`, chartData);
      return NextResponse.json([]);
    }
    
    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Error fetching server backup chart data:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
}
