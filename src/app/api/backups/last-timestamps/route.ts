import { NextRequest, NextResponse } from 'next/server';
import { dbOps } from '@/lib/db';
import { withCSRF } from '@/lib/csrf-middleware';
import { requireServerAccess } from '@/lib/server-access-http';

export const GET = withCSRF(async (request: NextRequest) => {
  try {
    const accessResult = await requireServerAccess(request);
    if (accessResult instanceof NextResponse) {
      return accessResult;
    }
    const { access } = accessResult;
    // Execute the query to get last backup timestamps
    const results = dbOps.getLastBackupTimestamps.all() as Array<{
      server_name: string;
      server_id: string;
      backup_name: string;
      date: string;
    }>;

    // Return the results as a map for easy lookup: server_id:backup_name -> date
    const visibleResults = access.unrestricted
      ? results
      : results.filter((row) => access.serverIds.has(row.server_id));
    const timestampMap: Record<string, string> = {};
    visibleResults.forEach((row) => {
      const key = `${row.server_id}:${row.backup_name}`;
      timestampMap[key] = row.date;
    });

    return NextResponse.json({
      timestamps: timestampMap,
      raw: visibleResults
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching last backup timestamps:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to fetch last backup timestamps' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
});
