import { NextResponse } from 'next/server';
import { ensureDatabaseInitialized, checkDatabaseHealth } from '@/lib/db';

const NO_STORE_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
} as const;

interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: string;
  basicConnection: boolean;
  initializationStatus: string;
  initializationComplete: boolean;
  connectionHealth: boolean;
  timestamp: string;
  initializationError?: string;
  connectionHealthError?: string;
}

export async function GET() {
  try {
    let initializationComplete = false;
    let initializationStatus = 'unknown';
    let initializationError: string | undefined;

    try {
      await ensureDatabaseInitialized();
      initializationComplete = true;
      initializationStatus = 'complete';
    } catch (error) {
      initializationStatus = 'failed';
      initializationError = error instanceof Error ? error.message : 'Unknown error';
    }

    let connectionHealth = false;
    let connectionHealthError: string | undefined;
    let basicConnection = false;

    try {
      const healthResult = checkDatabaseHealth();
      connectionHealth = healthResult.healthy;
      basicConnection = healthResult.healthy;
      if (!healthResult.healthy) {
        connectionHealthError = healthResult.error;
      }
    } catch (error) {
      connectionHealthError = error instanceof Error ? error.message : 'Unknown error';
    }

    const isHealthy = initializationComplete && connectionHealth;
    const healthData: HealthData = {
      status: isHealthy ? 'healthy' : 'degraded',
      database: connectionHealth ? 'connected' : 'unavailable',
      basicConnection,
      initializationStatus,
      initializationComplete,
      connectionHealth,
      timestamp: new Date().toISOString(),
    };

    if (initializationError) {
      healthData.initializationError = initializationError;
    }
    if (connectionHealthError) {
      healthData.connectionHealthError = connectionHealthError;
    }

    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503,
      headers: NO_STORE_HEADERS,
    });
  } catch (error) {
    console.error('Health check failed:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Database connection failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: NO_STORE_HEADERS,
      }
    );
  }
}
