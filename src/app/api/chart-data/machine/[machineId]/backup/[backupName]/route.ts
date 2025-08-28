"use server";

import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ machineId: string; backupName: string }> }
) {
  try {
    const { machineId, backupName: encodedBackupName } = await params;
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
      
      chartData = await dbUtils.getMachineBackupChartDataWithTimeRange(machineId, backupName, startDate, endDate);
    } else {
      // Otherwise, get all machine/backup chart data
      chartData = await dbUtils.getMachineBackupChartData(machineId, backupName);
    }
    
    if (!Array.isArray(chartData)) {
      console.error(`Machine backup chart data for ${machineId}:${backupName} returned non-array:`, chartData);
      return NextResponse.json([]);
    }
    
    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Error fetching machine backup chart data:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
}
