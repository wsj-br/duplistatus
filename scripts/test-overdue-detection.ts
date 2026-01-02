#!/usr/bin/env tsx
/**
 * Test Script for Overdue Backup Detection
 * 
 * This script validates the overdue backup detection algorithm and next run date calculation.
 * It tests GetNextBackupRunDate and isBackupOverdueByInterval functions with various scenarios.
 * 
 * Output: Generates a markdown file for preview mode viewing.
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { GetNextBackupRunDate } from '../src/lib/server_intervals';
import { getConfigOverdueTolerance } from '../src/lib/db-utils';
import { getDefaultAllowedWeekDays } from '../src/lib/interval-utils';

// Markdown output buffer
let markdownOutput: string[] = [];

/**
 * Get tolerance minutes with fallback for test environment
 */
function getToleranceMinutes(): number {
  try {
    return getConfigOverdueTolerance();
  } catch (error) {
    // Fallback to default 60 minutes if database is not available
    console.warn('Warning: Could not get tolerance from config, using default 60 minutes');
    return 60;
  }
}

/**
 * Append markdown content to output buffer
 */
function md(...lines: string[]): void {
  markdownOutput.push(...lines);
  // Also output to console for immediate feedback
  console.log(...lines);
}

/**
 * Clear markdown output buffer
 */
function clearMarkdown(): void {
  markdownOutput = [];
}

// Fixed reference time for reproducibility: 2026-01-01 00:00:00 (Thursday)
const REFERENCE_TIME = new Date('2026-01-01T00:00:00.000Z');

// Intervals to test
const INTERVALS = ['6h', '12h', '1D', '7D', '3D', '30D', '1M', '2M'];

// Day names for formatting
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Simplified version of isBackupOverdueByInterval for testing
 * Doesn't require database access
 */
function isBackupOverdueByIntervalTest(
  lastBackupDate: string,
  expectedBackupDate: string,
  toleranceMinutes: number,
  currentTime: Date
): boolean {
  if (!lastBackupDate || lastBackupDate === 'N/A' || !expectedBackupDate || expectedBackupDate === 'N/A') {
    return false;
  }

  const expectedTime = new Date(expectedBackupDate);
  
  if (toleranceMinutes > 0) {
    expectedTime.setMinutes(expectedTime.getMinutes() + toleranceMinutes);
  }

  return currentTime > expectedTime;
}

/**
 * Format date with day of week
 */
function formatDateWithDay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dayName = DAY_NAMES[d.getDay()];
  const iso = d.toISOString();
  const datePart = iso.substring(0, 10);
  const timePart = iso.substring(11, 16);
  return `${datePart} ${timePart} (${dayName})`;
}

/**
 * Format date for table display
 */
function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const iso = d.toISOString();
  return iso.substring(0, 16).replace('T', ' ');
}

/**
 * Create a markdown table for overdue status
 */
function createOverdueTable(
  checkTimes: Date[],
  intervals: string[],
  lastBackupDate: string,
  baseTime: string,
  allowedWeekDays: number[],
  toleranceMinutes: number
): string {
  const header = `| Check Time | ${intervals.join(' | ')} |`;
  const separator = `|${'---|'.repeat(intervals.length + 1)}`;
  const rows: string[] = [header, separator];

  for (const checkTime of checkTimes) {
    const cells: string[] = [formatDateShort(checkTime)];
    
    for (const interval of intervals) {
      try {
        const nextRun = GetNextBackupRunDate(lastBackupDate, baseTime, interval, allowedWeekDays);
        const isOverdue = isBackupOverdueByIntervalTest(
          lastBackupDate,
          nextRun,
          toleranceMinutes,
          checkTime
        );
        cells.push(isOverdue ? 'O' : '.');
      } catch (error) {
        cells.push('E');
      }
    }
    
    rows.push(`| ${cells.join(' | ')} |`);
  }

  return rows.join('\n');
}

/**
 * Test 1: Overdue Identification (Simple Schedule)
 */
function test1_OverdueIdentification() {
  md('');
  md('# TEST 1: Overdue Identification (Simple Schedule)');
  md('');

  const toleranceMinutes = getToleranceMinutes();
  md(`**Tolerance:** ${toleranceMinutes} minutes`);
  md(`**Reference Time:** ${formatDateWithDay(REFERENCE_TIME)}`);
  md('');

  // Last backup at reference time start
  const lastBackupDate = REFERENCE_TIME.toISOString();
  
  // Base times for schedule (staggered from 9PM to 5AM) - these represent different schedule start times
  // For this test, we'll use the reference time as both lastBackup and baseTime
  // The staggered times are shown for reference but we test with reference time as base
  const startTimes = [
    new Date('2026-01-01T21:00:00.000Z'), // 9PM
    new Date('2026-01-01T22:00:00.000Z'), // 10PM
    new Date('2026-01-01T23:00:00.000Z'), // 11PM
    new Date('2026-01-01T00:00:00.000Z'), // 12AM
    new Date('2026-01-01T01:00:00.000Z'), // 1AM
    new Date('2026-01-01T02:00:00.000Z'), // 2AM
    new Date('2026-01-01T03:00:00.000Z'), // 3AM
    new Date('2026-01-01T04:00:00.000Z'), // 4AM
    new Date('2026-01-01T05:00:00.000Z'), // 5AM
  ];

  md('## Initial Next Run Dates (Last Backup at Reference Time)');
  md('');
  md('| Interval | Next Run Date |');
  md('|----------|---------------|');
  
  for (const interval of INTERVALS) {
    try {
      // Calculate next run: lastBackup + interval
      const nextRun = GetNextBackupRunDate(
        lastBackupDate,
        lastBackupDate,
        interval,
        getDefaultAllowedWeekDays()
      );
      md(`| ${interval} | ${formatDateWithDay(nextRun)} |`);
    } catch (error) {
      md(`| ${interval} | ERROR: ${error instanceof Error ? error.message : String(error)} |`);
    }
  }
  md('');

  // Generate check times: every 1 hour for first 24 hours
  const hourlyChecks: Date[] = [];
  for (let i = 0; i < 24; i++) {
    const checkTime = new Date(REFERENCE_TIME);
    checkTime.setHours(checkTime.getHours() + i);
    hourlyChecks.push(checkTime);
  }

  md('## Overdue Status: Hourly Checks (First 24 Hours)');
  md('');
  md('**Legend:** O = Overdue, . = OK, E = Error');
  md('');
  md(createOverdueTable(
    hourlyChecks,
    INTERVALS,
    lastBackupDate,
    lastBackupDate,
    getDefaultAllowedWeekDays(),
    toleranceMinutes
  ));
  md('');

  // Generate check times: daily at 12:00 for 65 days
  const dailyChecks: Date[] = [];
  for (let i = 0; i < 65; i++) {
    const checkTime = new Date(REFERENCE_TIME);
    checkTime.setDate(checkTime.getDate() + i);
    checkTime.setHours(12, 0, 0, 0);
    dailyChecks.push(checkTime);
  }

  md('## Overdue Status: Daily Checks at 12:00 (65 Days)');
  md('');
  md('**Legend:** O = Overdue, . = OK, E = Error');
  md('');
  md(createOverdueTable(
    dailyChecks,
    INTERVALS,
    lastBackupDate,
    lastBackupDate,
    getDefaultAllowedWeekDays(),
    toleranceMinutes
  ));
  md('');
}

/**
 * Test 2: Allowed Weekdays per Interval
 */
function test2_AllowedWeekdays() {
  md('');
  md('# TEST 2: Allowed Weekdays per Interval (Next Run Dates)');
  md('');

  md(`**Reference Time:** ${formatDateWithDay(REFERENCE_TIME)}`);
  md('');

  const weekdaySets = [
    { name: 'All days', days: [0, 1, 2, 3, 4, 5, 6] },
    { name: 'Mon-Fri', days: [1, 2, 3, 4, 5] },
    { name: 'Sun, Tue, Thu, Sat', days: [0, 2, 4, 6] },
    { name: 'Mon, Wed, Fri', days: [1, 3, 5] },
    { name: 'Sun, Thu, Sat', days: [0, 4, 6] },
    { name: 'Sun, Sat', days: [0, 6] },
    { name: 'Sat only', days: [6] },
  ];

  // Test with last backup dates from 2025-12-25 through 2025-12-31
  const startDates: Date[] = [];
  for (let i = 25; i <= 31; i++) {
    const date = new Date(`2025-12-${i.toString().padStart(2, '0')}T00:00:00.000Z`);
    startDates.push(date);
  }

  // For each start date, show next run dates
  for (const startDate of startDates) {
    const lastBackupStr = startDate.toISOString();
    const dayName = DAY_NAMES[startDate.getDay()];
    
    md(`## Last Backup: ${formatDateWithDay(startDate)}`);
    md('');
    md('| Interval | ' + weekdaySets.map(ws => ws.name).join(' | ') + ' |');
    md('|----------|' + weekdaySets.map(() => '---').join('|') + '|');

    for (const interval of INTERVALS) {
      const cells: string[] = [interval];
      
      for (const weekdaySet of weekdaySets) {
        try {
          const nextRun = GetNextBackupRunDate(
            lastBackupStr,
            lastBackupStr,
            interval,
            weekdaySet.days
          );
          const nextRunDayName = DAY_NAMES[new Date(nextRun).getDay()];
          cells.push(`${formatDateShort(nextRun)} (${nextRunDayName})`);
        } catch (error) {
          cells.push('ERROR');
        }
      }
      
      md('| ' + cells.join(' | ') + ' |');
    }
    md('');
  }
}

/**
 * Test 3: Algorithm Behavior & Schedule Preservation
 */
function test3_SchedulePreservation() {
  md('');
  md('# TEST 3: Algorithm Behavior & Schedule Preservation');
  md('');

  const toleranceMinutes = getToleranceMinutes();
  const interval = '1D';
  const allowedWeekDays = getDefaultAllowedWeekDays();

  // Test 3a: Early Backup (13:59 for 14:00 schedule)
  md('## Test 3a: Early Backup (13:59 for 14:00 schedule)');
  md('');
  const earlyBackupDate = new Date('2026-01-01T13:59:00.000Z');
  const scheduledTime = new Date('2026-01-01T14:00:00.000Z');
  
  md(`**Last Backup:** ${formatDateWithDay(earlyBackupDate)}`);
  md(`**Scheduled Time:** ${formatDateWithDay(scheduledTime)}`);
  md('');
  
  try {
    const nextRun = GetNextBackupRunDate(
      earlyBackupDate.toISOString(),
      scheduledTime.toISOString(),
      interval,
      allowedWeekDays
    );
    md(`**Next Run:** ${formatDateWithDay(nextRun)}`);
    md('');
    
    const nextRunDate = new Date(nextRun);
    const shouldBeSame = nextRunDate.getTime() === scheduledTime.getTime();
    md(`- **Time field preserved:** ${shouldBeSame ? '✅ YES' : '❌ NO'} (Expected: ${formatDateWithDay(scheduledTime)}, Got: ${formatDateWithDay(nextRun)})`);
  } catch (error) {
    md(`- **ERROR:** ${error instanceof Error ? error.message : String(error)}`);
  }
  md('');

  // Test 3b: Manual Backup (22:00 for 14:00 schedule)
  md('## Test 3b: Manual Backup (22:00 for 14:00 schedule)');
  md('');
  const manualBackupDate = new Date('2026-01-01T22:00:00.000Z');
  const originalScheduledTime = new Date('2026-01-01T14:00:00.000Z');
  
  md(`**Last Backup:** ${formatDateWithDay(manualBackupDate)}`);
  md(`**Original Scheduled Time:** ${formatDateWithDay(originalScheduledTime)}`);
  md('');
  
  try {
    // Simulate the algorithm: keep adding intervals until time > lastBackupDate
    let nextTime = originalScheduledTime.toISOString();
    let iterations = 0;
    const maxIterations = 10;
    
    while (new Date(nextTime) <= manualBackupDate && iterations < maxIterations) {
      nextTime = GetNextBackupRunDate(
        manualBackupDate.toISOString(),
        nextTime,
        interval,
        allowedWeekDays
      );
      iterations++;
    }
    
    md(`**Next Run:** ${formatDateWithDay(nextTime)}`);
    md('');
    const nextRunDate = new Date(nextTime);
    const expectedTime = new Date('2026-01-02T14:00:00.000Z');
    const timePreserved = nextRunDate.getHours() === 14 && nextRunDate.getMinutes() === 0;
    md(`- **Time-of-day preserved:** ${timePreserved ? '✅ YES' : '❌ NO'} (Expected 14:00, Got ${nextRunDate.getHours()}:${nextRunDate.getMinutes().toString().padStart(2, '0')})`);
    md(`- **Next day:** ${nextRunDate.getDate() === 2 ? '✅ YES' : '❌ NO'}`);
  } catch (error) {
    md(`- **ERROR:** ${error instanceof Error ? error.message : String(error)}`);
  }
  md('');

  // Test 3c: Missed Multiple (1D interval, last backup 5 days ago)
  md('## Test 3c: Missed Multiple (1D interval, last backup 5 days ago)');
  md('');
  const missedBackupDate = new Date('2026-01-01T14:00:00.000Z');
  missedBackupDate.setDate(missedBackupDate.getDate() - 5);
  const scheduledTimeMissed = new Date('2025-12-27T14:00:00.000Z'); // 5 days before reference
  
  md(`**Last Backup:** ${formatDateWithDay(missedBackupDate)}`);
  md(`**Original Scheduled Time:** ${formatDateWithDay(scheduledTimeMissed)}`);
  md(`**Reference Time (Current):** ${formatDateWithDay(REFERENCE_TIME)}`);
  md('');
  md('*Note: The algorithm advances the scheduled time by adding intervals until it is after the last backup. If the resulting next run is in the past (before current time), the backup is overdue.*');
  md('');
  
  try {
    let nextTime = scheduledTimeMissed.toISOString();
    let iterations = 0;
    const maxIterations = 10;
    
    while (new Date(nextTime) <= missedBackupDate && iterations < maxIterations) {
      nextTime = GetNextBackupRunDate(
        missedBackupDate.toISOString(),
        nextTime,
        interval,
        allowedWeekDays
      );
      iterations++;
    }
    
    md(`**Next Run:** ${formatDateWithDay(nextTime)}`);
    md('');
    const nextRunDate = new Date(nextTime);
    const expectedNextRun = new Date('2025-12-28T14:00:00.000Z');
    const correctNextRun = nextRunDate.getTime() === expectedNextRun.getTime();
    const timePreserved = nextRunDate.getHours() === 14 && nextRunDate.getMinutes() === 0;
    const nextRunInPast = nextRunDate.getTime() < REFERENCE_TIME.getTime();
    
    md(`- **Correctly advanced:** ${correctNextRun ? '✅ YES' : '❌ NO'} (Expected: ${formatDateWithDay(expectedNextRun)}, Got: ${formatDateWithDay(nextTime)})`);
    md(`- **Iterations:** ${iterations} ${iterations === 1 ? '✅' : '❌'}`);
    md(`- **Time-of-day preserved:** ${timePreserved ? '✅ YES' : '❌ NO'} (14:00)`);
    md(`- **Next run is in the past:** ${nextRunInPast ? '✅ YES' : '❌ NO'} (Backup is overdue by ~4 days)`);
  } catch (error) {
    md(`- **ERROR:** ${error instanceof Error ? error.message : String(error)}`);
  }
  md('');
}

/**
 * Test 4: Month-End & Calendar Drift
 */
function test4_MonthEnd() {
  md('');
  md('# TEST 4: Month-End & Calendar Drift');
  md('');

  const allowedWeekDays = getDefaultAllowedWeekDays();

  // Test 4a: Month-end 1M (January 31st -> February)
  md('## Test 4a: Month-end 1M (January 31st -> February)');
  md('');
  const jan31 = new Date('2026-01-31T14:00:00.000Z');
  const lastBackupJan31 = jan31.toISOString();
  
  md(`**Start Date:** ${formatDateWithDay(jan31)}`);
  md('');
  
  try {
    const nextRun = GetNextBackupRunDate(
      lastBackupJan31,
      lastBackupJan31,
      '1M',
      allowedWeekDays
    );
    md(`**Next Run:** ${formatDateWithDay(nextRun)}`);
    md('');
    
    const nextRunDate = new Date(nextRun);
    const isFebruary = nextRunDate.getMonth() === 1; // February is month 1 (0-indexed)
    const isMarch = nextRunDate.getMonth() === 2; // March is month 2
    const dayOfMonth = nextRunDate.getDate();
    
    md(`- **Month handling:** ${isFebruary ? 'February' : isMarch ? 'March' : 'Other'} (Day: ${dayOfMonth})`);
    md(`- **No crash:** ✅ YES`);
  } catch (error) {
    md(`- **ERROR:** ${error instanceof Error ? error.message : String(error)}`);
  }
  md('');

  // Test 4b: Month-end 2M (July 31st -> September)
  md('## Test 4b: Month-end 2M (July 31st -> September)');
  md('');
  const jul31 = new Date('2026-07-31T14:00:00.000Z');
  const lastBackupJul31 = jul31.toISOString();
  
  md(`**Start Date:** ${formatDateWithDay(jul31)}`);
  md('');
  
  try {
    const nextRun = GetNextBackupRunDate(
      lastBackupJul31,
      lastBackupJul31,
      '2M',
      allowedWeekDays
    );
    md(`**Next Run:** ${formatDateWithDay(nextRun)}`);
    md('');
    
    const nextRunDate = new Date(nextRun);
    const isSeptember = nextRunDate.getMonth() === 8; // September is month 8 (0-indexed)
    const dayOfMonth = nextRunDate.getDate();
    
    md(`- **Month handling:** ${isSeptember ? 'September' : 'Other'} (Day: ${dayOfMonth})`);
    md(`- **No crash:** ✅ YES`);
  } catch (error) {
    md(`- **ERROR:** ${error instanceof Error ? error.message : String(error)}`);
  }
  md('');
}

/**
 * Test 5: Daylight Savings (DST) Transitions
 */
function test5_DSTTransitions() {
  md('');
  md('# TEST 5: Daylight Savings (DST) Transitions');
  md('');

  const allowedWeekDays = getDefaultAllowedWeekDays();
  const interval = '1D';

  // Test 5a: Spring Forward (March 9, 2026 - US DST starts)
  md('## Test 5a: Spring Forward (March 9, 2026 - US DST starts)');
  md('');
  // Note: DST in US starts on March 9, 2026 at 2:00 AM (clocks jump to 3:00 AM)
  // We'll test with a schedule at 2:00 AM on March 9
  const springForwardDate = new Date('2026-03-09T02:00:00.000Z'); // 2:00 AM UTC (before DST)
  const lastBackupSpring = springForwardDate.toISOString();
  
  md(`**Last Backup:** ${formatDateWithDay(springForwardDate)}`);
  md(`**Note:** DST transition occurs at 2:00 AM (clocks jump to 3:00 AM)`);
  md('');
  
  try {
    const nextRun = GetNextBackupRunDate(
      lastBackupSpring,
      lastBackupSpring,
      interval,
      allowedWeekDays
    );
    md(`**Next Run:** ${formatDateWithDay(nextRun)}`);
    md('');
    
    const nextRunDate = new Date(nextRun);
    const hour = nextRunDate.getHours();
    const minute = nextRunDate.getMinutes();
    
    // The next run should be at 2:00 AM (wall clock time) the next day
    // Note: JavaScript Date handles DST automatically, so we check the wall clock time
    md(`- **Wall clock time preserved:** ${hour === 2 && minute === 0 ? '✅ YES' : '❌ NO'} (Got ${hour}:${minute.toString().padStart(2, '0')})`);
  } catch (error) {
    md(`- **ERROR:** ${error instanceof Error ? error.message : String(error)}`);
  }
  md('');

  // Test 5b: Fall Back (November 1, 2026 - US DST ends)
  md('## Test 5b: Fall Back (November 1, 2026 - US DST ends)');
  md('');
  // Note: DST in US ends on November 1, 2026 at 2:00 AM (clocks fall back to 1:00 AM)
  const fallBackDate = new Date('2026-11-01T02:00:00.000Z'); // 2:00 AM UTC (before DST ends)
  const lastBackupFall = fallBackDate.toISOString();
  
  md(`**Last Backup:** ${formatDateWithDay(fallBackDate)}`);
  md(`**Note:** DST transition occurs at 2:00 AM (clocks fall back to 1:00 AM)`);
  md('');
  
  try {
    const nextRun = GetNextBackupRunDate(
      lastBackupFall,
      lastBackupFall,
      interval,
      allowedWeekDays
    );
    md(`**Next Run:** ${formatDateWithDay(nextRun)}`);
    md('');
    
    const nextRunDate = new Date(nextRun);
    const hour = nextRunDate.getHours();
    const minute = nextRunDate.getMinutes();
    
    // The next run should be at 2:00 AM (wall clock time) the next day
    md(`- **Wall clock time preserved:** ${hour === 2 && minute === 0 ? '✅ YES' : '❌ NO'} (Got ${hour}:${minute.toString().padStart(2, '0')})`);
  } catch (error) {
    md(`- **ERROR:** ${error instanceof Error ? error.message : String(error)}`);
  }
  md('');
}

/**
 * Main execution
 */
function main() {
  clearMarkdown();
  
  // Markdown header
  md('# Overdue Backup Detection Test Suite');
  md('');
  md(`**Reference Time:** ${formatDateWithDay(REFERENCE_TIME)}`);
  md(`**Tolerance:** ${getToleranceMinutes()} minutes`);
  md('');
  md('---');
  md('');

  try {
    test1_OverdueIdentification();
    test2_AllowedWeekdays();
    test3_SchedulePreservation();
    test4_MonthEnd();
    test5_DSTTransitions();

    md('# All Tests Completed');
    md('');
    md('---');
    md('');
    md(`*Generated on ${new Date().toISOString()}*`);

    // Write markdown to file
    const outputPath = join(process.cwd(), 'dev/test-overdue-detection-output.md');
    writeFileSync(outputPath, markdownOutput.join('\n'), 'utf-8');
    
    console.log(`\n✅ Markdown output written to: ${outputPath}`);
    console.log('   You can now view it in preview mode!');
  } catch (error) {
    console.error('\n✗ FATAL ERROR:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the tests
main();
