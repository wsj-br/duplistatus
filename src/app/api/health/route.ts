import { NextResponse } from 'next/server';
import { db, dbOps, ensureDatabaseInitialized, checkDatabaseHealth } from '@/lib/db';

interface HealthData {
  status: string;
  database: string;
  basicConnection: boolean;
  tablesFound: number;
  tables: string[];
  preparedStatements: boolean;
  initializationStatus: string;
  initializationComplete: boolean;
  connectionHealth: boolean;
  timestamp: string;
  preparedStatementsError?: string;
  initializationError?: string;
  connectionHealthError?: string;
  connectionDetails?: Record<string, unknown>;
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
    
    // Test database initialization status
    let initializationComplete = false;
    let initializationStatus = 'unknown';
    let initializationError = null;
    
    try {
      await ensureDatabaseInitialized();
      initializationComplete = true;
      initializationStatus = 'complete';
    } catch (error) {
      initializationStatus = 'failed';
      initializationError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    // Test database connection health
    let connectionHealth = false;
    let connectionHealthError = null;
    let connectionDetails = null;
    
    try {
      const healthResult = checkDatabaseHealth();
      connectionHealth = healthResult.healthy;
      connectionDetails = healthResult.details;
      if (!healthResult.healthy) {
        connectionHealthError = healthResult.error;
      }
    } catch (error) {
      connectionHealthError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    // Test prepared statements
    let preparedStatementsOk = true;
    let preparedStatementsError = null;
    
    try {
      // Test a simple query that uses prepared statements
      dbOps.getAllServers.all();
      dbOps.getOverallSummary.get();
    } catch (error) {
      preparedStatementsOk = false;
      preparedStatementsError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    // Determine overall health status
    const isHealthy = !!basicTest && preparedStatementsOk && initializationComplete && connectionHealth;
    const overallStatus = isHealthy ? 'healthy' : 'degraded';
    
    const healthData: HealthData = {
      status: overallStatus,
      database: 'connected',
      basicConnection: !!basicTest,
      tablesFound: tables.length,
      tables: tables.map((t: TableResult) => t.name),
      preparedStatements: preparedStatementsOk,
      initializationStatus,
      initializationComplete,
      connectionHealth,
      timestamp: new Date().toISOString()
    };
    
    if (!preparedStatementsOk) {
      healthData.preparedStatementsError = preparedStatementsError ?? undefined;
    }
    
    if (!initializationComplete) {
      healthData.initializationError = initializationError ?? undefined;
    }
    
    if (!connectionHealth) {
      healthData.connectionHealthError = connectionHealthError ?? undefined;
    }
    
    if (connectionDetails) {
      healthData.connectionDetails = connectionDetails;
    }
    
    return NextResponse.json(
      healthData,
      { 
        status: isHealthy ? 200 : 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );
  } catch (error) {
    console.error('Health check failed:', error instanceof Error ? error.message : String(error));
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