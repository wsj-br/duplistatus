import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { requireAdmin } from '@/lib/auth-middleware';
import { withCSRF } from '@/lib/csrf-middleware';
import { getApplicationLogPath, getApplicationLogFilename } from '@/lib/paths';
const ALLOWED_LOG_LEVELS = ['INFO', 'WARN', 'ERROR'] as const;

// Helper to detect log level in a line
function getLogLevel(line: string): string | null {
  const upperLine = line.toUpperCase();
  if (upperLine.includes('[ERROR]') || upperLine.includes('ERROR:')) return 'ERROR';
  if (upperLine.includes('[WARN]') || upperLine.includes('WARNING:')) return 'WARN';
  if (upperLine.includes('[INFO]') || upperLine.includes('INFO:')) return 'INFO';
  return null;
}

export const GET = withCSRF(requireAdmin(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const logLevelsParam = searchParams.get('logLevels') || 'INFO,WARN,ERROR';
  const searchString = searchParams.get('search') || '';
  const fileName = searchParams.get('file'); // Expected: 'application.log', 'application.log.1', etc.
  
  // Parse log levels
  const logLevels = logLevelsParam.split(',').map(l => l.trim().toUpperCase()).filter(l => 
    ALLOWED_LOG_LEVELS.includes(l as typeof ALLOWED_LOG_LEVELS[number])
  );
  
  // Validate file parameter
  if (!fileName) {
    return NextResponse.json({ error: 'File parameter is required' }, { status: 400 });
  }
  
  // Get the base filename from environment variable
  const baseFileName = getApplicationLogFilename();
  
  // Validate filename format: must match base filename or base filename.N where N is 1-10
  // Escape special regex characters in the base filename
  const escapedBaseFileName = baseFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const fileNamePattern = new RegExp(`^${escapedBaseFileName}(\\.\\d+)?$`);
  if (fileName !== baseFileName && !fileNamePattern.test(fileName)) {
    return NextResponse.json({ error: 'Invalid file parameter format' }, { status: 400 });
  }
  
  try {
    // Get the log file path dynamically (handles different execution contexts)
    const baseLogFile = getApplicationLogPath();
    
    // Determine the full path to the requested file
    let logFile: string;
    if (fileName === baseFileName) {
      // Reading the base file
      logFile = baseLogFile;
    } else {
      // Reading a rotated file: baseFileName.1, baseFileName.2, etc.
      const fileNum = fileName.substring(baseFileName.length + 1);
      logFile = `${baseLogFile}.${fileNum}`;
    }
    
    // Read log file
    const content = await readFile(logFile, 'utf-8');
    const lines = content.split('\n');
    
    // Filter lines
    const filteredLines: string[] = [];
    for (const line of lines) {
      if (!line.trim()) continue; // Skip empty lines
      
      // Apply filters
      const logLevel = getLogLevel(line);
      if (logLevels.length > 0 && logLevel && !logLevels.includes(logLevel)) {
        continue; // Filter by log level
      }
      
      if (searchString && !line.toLowerCase().includes(searchString.toLowerCase())) {
        continue; // Filter by search string
      }
      
      filteredLines.push(line);
    }
    
    // Combine into text
    const combinedLogs = filteredLines.join('\n');
    
    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `duplistatus-logs-${timestamp}.txt`;
    
    return new NextResponse(combinedLogs, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to export logs', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}));
