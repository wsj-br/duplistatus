import { NextRequest, NextResponse } from 'next/server';
import { dbUtils } from '@/lib/db-utils';
import { withCSRF } from '@/lib/csrf-middleware';
import { denyHiddenServer, requireServerAccess } from '@/lib/server-access-http';

export const GET = withCSRF(async (
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) => {
  try {
    const accessResult = await requireServerAccess(request);
    if (accessResult instanceof NextResponse) {
      return accessResult;
    }
    const { serverId } = await params;
    const hidden = denyHiddenServer(accessResult.access, serverId);
    if (hidden) {
      return hidden;
    }
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
      
      const chartData = await dbUtils.getServerChartDataWithTimeRange(serverId, startDate, endDate);
      return NextResponse.json(chartData);
    } else {
      // Otherwise, get all server chart data
      const chartData = await dbUtils.getServerChartData(serverId);
      return NextResponse.json(chartData);
    }
  } catch (error) {
    console.error('Error fetching server chart data:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
});
