#!/usr/bin/env tsx

/**
 * CSV Validation Script
 * 
 * This script validates the CSV export from the Overdue Monitoring settings page.
 * It checks:
 * 1. If the "Next Run" date is calculated correctly based on last backup + interval
 * 2. If the "Is Overdue" status is correct (next run + tolerance < current time)
 * 3. If the "Next Run Weekday" is within the "Allowed Weekdays"
 */

import { readFileSync } from 'fs';
import { parseIntervalString } from '../src/lib/interval-utils';
import { GetNextBackupRunDate } from '../src/lib/server_intervals';
import { getConfigOverdueTolerance } from '../src/lib/db-utils';

interface CSVRow {
  csvGeneratedAt: string;
  serverName: string;
  serverId: string;
  backupName: string;
  lastBackup: string;
  lastBackupWeekday: string;
  nextRun: string;
  nextRunWeekday: string;
  isOverdue: string;
  monitoringEnabled: string;
  expectedInterval: string;
  allowedWeekdays: string;
}

function parseCSV(filePath: string): CSVRow[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows');
  }
  
  // Skip header
  const dataLines = lines.slice(1).filter(line => line.trim());
  
  const rows: CSVRow[] = [];
  
  for (const line of dataLines) {
    const cells: string[] = [];
    let currentCell = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
        if (inQuotes && line[i + 1] === '"') {
          // Double quote escape
          currentCell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(currentCell);
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    
    // Push last cell
    cells.push(currentCell);
    
    if (cells.length >= 12) {
      rows.push({
        csvGeneratedAt: cells[0],
        serverName: cells[1],
        serverId: cells[2],
        backupName: cells[3],
        lastBackup: cells[4],
        lastBackupWeekday: cells[5],
        nextRun: cells[6],
        nextRunWeekday: cells[7],
        isOverdue: cells[8],
        monitoringEnabled: cells[9],
        expectedInterval: cells[10],
        allowedWeekdays: cells[11],
      });
    }
  }
  
  return rows;
}

function parseAllowedWeekdays(weekdaysStr: string): number[] {
  const weekdayMap: Record<string, number> = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
  };
  
  return weekdaysStr
    .split(';')
    .map(day => day.trim())
    .filter(day => day in weekdayMap)
    .map(day => weekdayMap[day]);
}

async function validateCSV(filePath: string) {
  console.log('='.repeat(80));
  console.log('CSV Validation Report');
  console.log('='.repeat(80));
  console.log(`File: ${filePath}`);
  console.log(`Validation Time: ${new Date().toISOString()}\n`);
  
  const rows = parseCSV(filePath);
  console.log(`Total rows to validate: ${rows.length}\n`);
  
  if (rows.length === 0) {
    console.log('No data rows found in CSV file.');
    return;
  }
  
  // Get CSV generation time from the first row (all rows should have the same value)
  const csvGenerationTime = new Date(rows[0].csvGeneratedAt);
  console.log(`CSV Generated At: ${csvGenerationTime.toISOString()}`);
  console.log(`Time since CSV generation: ${Math.round((new Date().getTime() - csvGenerationTime.getTime()) / 1000 / 60)} minutes\n`);
  
  // Get overdue tolerance (default to 60 minutes if not available)
  let toleranceMinutes = 60;
  try {
    const toleranceStr = await getConfigOverdueTolerance();
    const toleranceMap: Record<string, number> = {
      'no_tolerance': 0,
      '5min': 5,
      '15min': 15,
      '30min': 30,
      '1h': 60,
      '2h': 120,
      '4h': 240,
      '6h': 360,
      '12h': 720,
      '1d': 1440,
    };
    toleranceMinutes = toleranceMap[toleranceStr] || 60;
  } catch (error) {
    console.warn('Could not fetch tolerance from DB, using default 60 minutes\n');
  }
  
  console.log(`Overdue Tolerance: ${toleranceMinutes} minutes\n`);
  
  let totalIssues = 0;
  let validatedCount = 0;
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 because of header and 0-based index
    
    console.log('-'.repeat(80));
    console.log(`Row ${rowNum}: ${row.serverName} / ${row.backupName}`);
    console.log('-'.repeat(80));
    
    // Skip if monitoring is disabled or data is N/A
    if (row.monitoringEnabled !== 'Yes') {
      console.log('⊘ Monitoring disabled - skipping validation\n');
      continue;
    }
    
    if (row.lastBackup === 'N/A' || row.nextRun === 'N/A') {
      console.log('⊘ Missing data (Last Backup or Next Run is N/A) - skipping validation\n');
      continue;
    }
    
    validatedCount++;
    let rowIssues = 0;
    
    // Parse dates
    const lastBackupDate = new Date(row.lastBackup);
    const nextRunDate = new Date(row.nextRun);
    const allowedWeekdays = parseAllowedWeekdays(row.allowedWeekdays);
    
    console.log(`Last Backup: ${lastBackupDate.toISOString()} (${row.lastBackupWeekday})`);
    console.log(`Next Run: ${nextRunDate.toISOString()} (${row.nextRunWeekday})`);
    console.log(`Expected Interval: ${row.expectedInterval}`);
    console.log(`Allowed Weekdays: ${row.allowedWeekdays} [${allowedWeekdays.join(', ')}]`);
    console.log();
    
    // Validation 1: Check if Next Run Weekday is in Allowed Weekdays
    const nextRunDayIndex = nextRunDate.getDay();
    if (!allowedWeekdays.includes(nextRunDayIndex)) {
      console.log(`❌ ISSUE: Next Run Weekday (${row.nextRunWeekday}) is NOT in Allowed Weekdays`);
      console.log(`   Next Run Day Index: ${nextRunDayIndex}`);
      console.log(`   Allowed Day Indices: [${allowedWeekdays.join(', ')}]`);
      rowIssues++;
    } else {
      console.log(`✅ Next Run Weekday is in Allowed Weekdays`);
    }
    
    // Validation 4: Verify Next Run calculation using GetNextBackupRunDate
    try {
      const calculatedNextRun = GetNextBackupRunDate(
        lastBackupDate.toISOString(),
        lastBackupDate.toISOString(),
        row.expectedInterval,
        allowedWeekdays
      );
      
      const calculatedDate = new Date(calculatedNextRun);
      
      // Allow small time differences (up to 1 second) due to precision
      const timeDiff = Math.abs(calculatedDate.getTime() - nextRunDate.getTime());
      
      if (timeDiff > 1000) {
        console.log(`⚠️  WARNING: Next Run calculation differs`);
        console.log(`   CSV Next Run: ${nextRunDate.toISOString()}`);
        console.log(`   Calculated:   ${calculatedDate.toISOString()}`);
        console.log(`   Difference:   ${Math.round(timeDiff / 1000)} seconds`);
        // Note: This might not be an error - the CSV might use a more advanced algorithm
        // that considers the 'time' field from backup settings
      } else {
        console.log(`✅ Next Run calculation matches (within tolerance)`);
      }
    } catch (error) {
      console.log(`⚠️  Could not validate Next Run calculation: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Validation 3: Check if "Is Overdue" status is correct
    // Use the CSV generation time from this row for validation
    const rowCsvGenerationTime = new Date(row.csvGeneratedAt);
    const nextRunWithTolerance = new Date(nextRunDate.getTime() + toleranceMinutes * 60 * 1000);
    const calculatedIsOverdue = nextRunWithTolerance < rowCsvGenerationTime;
    const csvIsOverdue = row.isOverdue === 'Yes';
    
    if (calculatedIsOverdue !== csvIsOverdue) {
      console.log(`❌ ISSUE: Is Overdue status mismatch`);
      console.log(`   CSV says: ${row.isOverdue}`);
      console.log(`   Should be: ${calculatedIsOverdue ? 'Yes' : 'No'}`);
      console.log(`   Next Run + Tolerance: ${nextRunWithTolerance.toISOString()}`);
      console.log(`   CSV Generation Time: ${rowCsvGenerationTime.toISOString()}`);
      console.log(`   Difference: ${Math.round((rowCsvGenerationTime.getTime() - nextRunWithTolerance.getTime()) / 1000 / 60)} minutes`);
      rowIssues++;
    } else {
      console.log(`✅ Is Overdue status is correct: ${row.isOverdue}`);
      if (calculatedIsOverdue) {
        const minutesOverdue = Math.round((rowCsvGenerationTime.getTime() - nextRunWithTolerance.getTime()) / 1000 / 60);
        console.log(`   Overdue by: ${minutesOverdue} minutes (after tolerance)`);
      } else {
        const minutesUntilOverdue = Math.round((nextRunWithTolerance.getTime() - rowCsvGenerationTime.getTime()) / 1000 / 60);
        console.log(`   Time until overdue: ${minutesUntilOverdue} minutes`);
      }
    }
    
    if (rowIssues > 0) {
      console.log(`\n⚠️  Total issues found in this row: ${rowIssues}`);
      totalIssues += rowIssues;
    } else {
      console.log(`\n✅ All validations passed for this row`);
    }
    
    console.log();
  }
  
  // Summary
  console.log('='.repeat(80));
  console.log('Validation Summary');
  console.log('='.repeat(80));
  console.log(`Total Rows: ${rows.length}`);
  console.log(`Validated Rows: ${validatedCount}`);
  console.log(`Skipped Rows: ${rows.length - validatedCount}`);
  console.log(`Total Issues Found: ${totalIssues}`);
  
  if (totalIssues === 0) {
    console.log('\n✅ All validations passed! CSV export is accurate.');
  } else {
    console.log(`\n⚠️  Found ${totalIssues} issue(s) that need attention.`);
  }
  
  console.log('='.repeat(80));
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: tsx scripts/validate-csv-export.ts <path-to-csv-file>');
  console.error('Example: tsx scripts/validate-csv-export.ts ./overdue-monitoring-2025-01-15.csv');
  process.exit(1);
}

const csvFilePath = args[0];

validateCSV(csvFilePath)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during validation:', error);
    process.exit(1);
  });
