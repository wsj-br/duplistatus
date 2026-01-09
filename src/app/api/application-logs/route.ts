import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { requireAdmin } from '@/lib/auth-middleware';
import { withCSRF } from '@/lib/csrf-middleware';
import { getApplicationLogPath, getApplicationLogFilename } from '@/lib/paths';
// Maximum number of rotated files to keep - must match rotation policy in docker-entrypoint.sh
// The shell script rotates logs on each container startup, keeping the last 5 executions
const MAX_ROTATED_FILES = 10;

// Helper function to get available log files
// Returns actual filenames: ['application.log', 'application.log.1', 'application.log.2', ...]
async function getAvailableFiles(): Promise<string[]> {
  const files: string[] = [];
  const baseLogFile = getApplicationLogPath();
  const baseFileName = getApplicationLogFilename(); // Get filename from environment variable
  
  // Check if the base log file exists
  try {
    await stat(baseLogFile);
    files.push(baseFileName);
  } catch {
    // Base log file doesn't exist, skip
  }
  
  // Check for rotated files dynamically - the shell script keeps up to 5, but we check what actually exists
  for (let i = 1; i <= MAX_ROTATED_FILES; i++) {
    try {
      await stat(`${baseLogFile}.${i}`);
      files.push(`${baseFileName}.${i}`);
    } catch {
      // File doesn't exist, skip
    }
  }
  return files;
}

export const GET = withCSRF(requireAdmin(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get('file'); // Optional: 'application.log', 'application.log.1', 'application.log.2', etc.
  const tail = parseInt(searchParams.get('tail') || '1000', 10);
  
  // Validate tail parameter
  if (tail < 1 || tail > 10000) {
    return NextResponse.json({ error: 'Invalid tail parameter' }, { status: 400 });
  }
  
  // If no file parameter, just return available files list
  if (!fileName) {
    const availableFiles = await getAvailableFiles();
    return NextResponse.json({
      logs: '',
      fileSize: 0,
      lastModified: new Date().toISOString(),
      lineCount: 0,
      currentFile: '',
      availableFiles
    });
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
  
  // Validate rotated file number if it's a rotated file
  if (fileName.startsWith(`${baseFileName}.`)) {
    const fileNum = parseInt(fileName.substring(baseFileName.length + 1), 10);
    if (isNaN(fileNum) || fileNum < 1 || fileNum > MAX_ROTATED_FILES) {
      return NextResponse.json({ error: 'Invalid rotated file number' }, { status: 400 });
    }
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
    
    // Check if file exists
    try {
      await stat(logFile);
    } catch {
      return NextResponse.json({ 
        error: 'Log file not found',
        logs: '',
        fileSize: 0,
        availableFiles: await getAvailableFiles()
      });
    }
    
    // Read file and get last N lines
    const content = await readFile(logFile, 'utf-8');
    const lines = content.split('\n');
    const lastLines = lines.slice(-tail).join('\n');
    const fileStats = await stat(logFile);
    
    // Get list of available files
    const availableFiles = await getAvailableFiles();
    
    return NextResponse.json({
      logs: lastLines,
      fileSize: fileStats.size,
      lastModified: fileStats.mtime.toISOString(),
      lineCount: lines.length,
      currentFile: fileName, // Return the actual filename that was read
      availableFiles
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read log file', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}));
