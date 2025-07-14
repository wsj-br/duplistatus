import { NextResponse } from 'next/server';
import { db, dbOps } from '@/lib/db';

interface HealthData {
  status: string;
  database: string;
  basicConnection: boolean;
  tablesFound: number;
  tables: string[];
  preparedStatements: boolean;
  timestamp: string;
  preparedStatementsError?: string;
}

interface TableResult {
  name: string;
}

export async function GET() {
  try {
    // Test basic database connection
    const basicTest = db.prepare('SELECT 1 as test').get();
    
    // Test table existence
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as TableResult[];
    
    // Test prepared statements
    let preparedStatementsOk = true;
    let preparedStatementsError = null;
    
    try {
      // Test a simple query that uses prepared statements
      dbOps.getAllMachines.all();
      dbOps.getOverallSummary.get();
    } catch (error) {
      preparedStatementsOk = false;
      preparedStatementsError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    const healthData: HealthData = {
      status: 'healthy',
      database: 'connected',
      basicConnection: !!basicTest,
      tablesFound: tables.length,
      tables: tables.map((t: TableResult) => t.name),
      preparedStatements: preparedStatementsOk,
      timestamp: new Date().toISOString()
    };
    
    if (!preparedStatementsOk) {
      healthData.preparedStatementsError = preparedStatementsError ?? undefined;
    }
    
    return NextResponse.json(
      healthData,
      { 
        status: preparedStatementsOk ? 200 : 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: 'Database connection failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { 
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );
  }
} 