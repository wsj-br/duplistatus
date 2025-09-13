import { NextResponse } from 'next/server';
import { subMonths } from 'date-fns';
import { db } from '@/lib/db';
import { setConfiguration } from '@/lib/db-utils';

export async function POST(request: Request) {
  try {
    const { retentionPeriod } = await request.json();
    // For "Delete all data" option, delete all backups
    if (retentionPeriod === 'Delete all data') {
      // Start a transaction
      const transaction = db.transaction(() => {
    
        // Delete all backups
        const backupResult = db.prepare(`DELETE FROM backups`).run();
        
        // Delete all servers
        const serverResult = db.prepare(`DELETE FROM servers`).run();
  
        return { 
          backupChanges: backupResult.changes,
          serverChanges: serverResult.changes
        };
      });

      // Execute the transaction
      const { backupChanges, serverChanges } = transaction();

      // Clear configuration settings
      try {
        // Clear backup_settings
        setConfiguration('backup_settings', JSON.stringify({}));
        console.log('[cleanup] Cleared backup_settings configuration');
        
        // Clear overdue_notifications
        setConfiguration('overdue_notifications', JSON.stringify({}));
        console.log('[cleanup] Cleared overdue_notifications configuration');
      } catch (configError) {
        console.error('Failed to clear configuration settings:', configError instanceof Error ? configError.message : String(configError));
        // Don't fail the entire operation if config cleanup fails
      }

      return NextResponse.json({
        message: `Successfully deleted all ${backupChanges} backups and ${serverChanges} servers, and cleared configuration settings`,
        status: 200,
      });
    }

    // Calculate the cutoff date based on the retention period
    let cutoffDate: Date;
    const now = new Date();

    switch (retentionPeriod) {
      case '6 months':
        cutoffDate = subMonths(now, 6);
        break;
      case '1 year':
        cutoffDate = subMonths(now, 12);
        break;
      case '2 years':
        cutoffDate = subMonths(now, 24);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid retention period' },
          { status: 400 }
        );
    }

    // Start a transaction
    const transaction = db.transaction(() => {
      
      // Delete the backups
      const result = db.prepare(`
        DELETE FROM backups 
        WHERE end_time < ?
      `).run(cutoffDate.toISOString());

      return { changes: result.changes };
    });

    // Execute the transaction
    const { changes } = transaction();

    return NextResponse.json({
      message: `Successfully deleted ${changes} old backups`,
      status: 200,
    });
  } catch (error) {
    console.error('Error deleting old backups:', error instanceof Error ? error.message : String(error));
    
    // Enhanced error reporting
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    return NextResponse.json(
      { 
        error: 'Failed to delete old backups',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        time: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 