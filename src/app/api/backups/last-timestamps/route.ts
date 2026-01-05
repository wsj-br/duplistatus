import { NextResponse } from 'next/server';
import { dbOps } from '@/lib/db';
import { withCSRF } from '@/lib/csrf-middleware';

export const GET = withCSRF(async () => {
  try {
    // Execute the query to get last backup timestamps
    const results = dbOps.getLastBackupTimestamps.all() as Array<{
      server_name: string;
      server_id: string;
      backup_name: string;
      date: string;
    }>;

    // Return the results as a map for easy lookup: server_id:backup_name -> date
    const timestampMap: Record<string, string> = {};
    results.forEach((row) => {
      const key = `${row.server_id}:${row.backup_name}`;
      timestampMap[key] = row.date;
    });

    return NextResponse.json({
      timestamps: timestampMap,
      raw: results
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
