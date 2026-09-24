import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db-utils';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireServerAccess } from '@/lib/server-access-http';
import type { ChartDataPoint } from '@/lib/types';

function sumChartPoints(points: ChartDataPoint[]): ChartDataPoint[] {
  const byDate = new Map<string, ChartDataPoint>();
  for (const point of points) {
    const existing = byDate.get(point.date);
    if (!existing) {
      byDate.set(point.date, { ...point });
      continue;
    }
    existing.uploadedSize += Number(point.uploadedSize) || 0;
    existing.duration += Number(point.duration) || 0;
    existing.fileCount += Number(point.fileCount) || 0;
    existing.fileSize += Number(point.fileSize) || 0;
    existing.storageSize += Number(point.storageSize) || 0;
    existing.backupVersions += Number(point.backupVersions) || 0;
  }
  return [...byDate.values()];
}

export const GET = withCSRF(async (request: NextRequest) => {
  try {
    const accessResult = await requireServerAccess(request);
    if (accessResult instanceof NextResponse) {
      return accessResult;
    }
    const { access } = accessResult;
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
      
      if (!access.unrestricted) {
        const points: ChartDataPoint[] = [];
        for (const serverId of access.serverIds) {
          points.push(...await dbUtils.getServerChartDataWithTimeRange(serverId, startDate, endDate));
        }
        return NextResponse.json(sumChartPoints(points));
      }
      const chartData = await dbUtils.getAggregatedChartDataWithTimeRange(startDate, endDate);
      return NextResponse.json(chartData);
    } else {
      const chartData = await dbUtils.getAggregatedChartData(access);
      return NextResponse.json(chartData);
    }
  } catch (error) {
    console.error('Error fetching aggregated chart data:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
});
