// Utility functions to compute the next valid scheduled run given last run, repeat string and allowed weekdays.
//
// Based on Duplicati's Scheduler.GetNextValidTime: https://github.com/duplicati/duplicati/blob/master/Duplicati.Server/Web/Models/Scheduler.cs
// generated in TypeScript by Copilot AI from the C# code and modified to fit the needs of the project and simplify the logic.
//
// - repeat is parsed as concatenated tokens: <int><unit> where unit in s,m,h,D,W,M,Y (case-sensitive)
// - plain integer is treated as seconds
// - if the total repetition interval is >= 1 day (time difference >= 24h),
//   the scheduler advances day-by-day from the candidate date until an allowed weekday is found (up to 8 days)
// - otherwise it repeatedly adds the repetition interval until an allowed weekday is found (with a safety cap)
// 

import { parseIntervalString, ParsedInterval } from './interval-utils';



function addInterval(date: Date, tokens: ParsedInterval[]): Date {
    // Clone
    let res = new Date(date.getTime());

    // Apply tokens in the order they appeared
    for (const t of tokens) {
        const v = t.value;
        const unit = t.unit;
        switch (unit) {
            case 's': case 'S':
                res = new Date(res.getTime() + v * 1000);
                break;
            case 'm': // minutes
                res = new Date(res.getTime() + v * 60 * 1000);
                break;
            case 'h': case 'H':
                res = new Date(res.getTime() + v * 60 * 60 * 1000);
                break;
            case 'D': case 'd':
                res.setDate(res.getDate() + v);
                break;
            case 'W': case 'w':
                res.setDate(res.getDate() + v * 7);
                break;
            case 'M':
                // add months preserving day-of-month where possible
                res.setMonth(res.getMonth() + v);
                break;
            case 'Y': case 'y':
                res.setFullYear(res.getFullYear() + v);
                break;
            default:
                throw new Error(`Unsupported unit: ${unit}`);
        }
    }

    return res;
}

// Get the interval in days
function getInterval(tokens: ParsedInterval[]): number {
    // Clone
    let res = 0;

    // Apply tokens in the order they appeared
    for (const t of tokens) {
        const v = t.value;
        const unit = t.unit;
        switch (unit) {
            case 's': case 'S':
                res = res + v / 86400;
                break;
            case 'm': // minutes
                res = res + v / 1440;
                break;
            case 'h': case 'H':
                res = res + v / 24;
                break;
            case 'D': case 'd':
                res = res + v;
                break;
            case 'W': case 'w':
                res = res + v * 7;
                break;
            case 'M':
                // add months preserving day-of-month where possible
                res= res + v*30;
                break;
            case 'Y': case 'y':
                res= res + v*365;
                break;
            default:
                throw new Error(`Unsupported unit: ${unit}`);
        }
    }

    return res;
}


// Compute next valid run date with number array format for allowed weekdays.
export function GetNextBackupRunDate(lastBackupStr: string, baseTimeStr: string, repeat: string, allowedWeekdays: number[]): string {

    const lastBackup= new Date(lastBackupStr);
    const baseTime= new Date(baseTimeStr);
    
    if (!(lastBackup instanceof Date) || isNaN(lastBackup.getTime()))
        throw new Error('Invalid lastBackup date');

    if (!(baseTime instanceof Date) || isNaN(baseTime.getTime()))
        throw new Error('Invalid baseTime date');

    // First, ensure candidate is after the last backup (last backup + 1 second)
    const afterLastBackup = lastBackup.getTime() + 1000; // last backup + 1 second (in milliseconds)
    
    const MAX_ITERS = 50000;
    let iters = 0;
    let candidate = lastBackup;

    // define allowed weekdays
    const allowed = allowedWeekdays || [];
    const allDaysAllowed = allowed.length === 0;

    function isAllowed(dt: Date): boolean {
        if (allDaysAllowed) return true;
        const dayOfWeek = dt.getDay();
        const isAllowedDay = allowed.indexOf(dayOfWeek) >= 0;
        return isAllowedDay;
    }

    // check if the baseTime is in the afterLastBackup, it it is, is already the next valid time
    if (candidate.getTime() >= afterLastBackup && isAllowed(candidate)) {
        return new Date(candidate).toISOString();
    }

    const tokens = parseIntervalString(repeat);

    // Add intervals until candidate is in the afterLastBackup
    while (candidate.getTime() <= afterLastBackup && iters++ < MAX_ITERS) {
        candidate = addInterval(candidate, tokens);
    }
    
    if (candidate.getTime() <= afterLastBackup) {
        throw new Error('Could not find afterLastBackup time within iteration limit');
    }
    
    // Determine if repetition is >= 1 day 
    const intervalIsAtLeastDay = getInterval(tokens) >= 1;

    if (isAllowed(candidate)) {
        return candidate.toISOString();
    }

    if (intervalIsAtLeastDay) {
        // Advance day-by-day until allowed (up to 8 days)
        for (let i = 0; i < 8; i++) {
            candidate.setDate(candidate.getDate() + 1);
            if (isAllowed(candidate)) {
                return candidate.toISOString();
            }
        }
        throw new Error('No allowed weekday found within 8 days');
    } else {
        // Add the repetition repeatedly until an allowed day is found
        iters = 0; // Reset counter for weekday checking
        while (!isAllowed(candidate) && iters++ < MAX_ITERS) {
            candidate = addInterval(candidate, tokens);
        }
        if (!isAllowed(candidate)) {
            throw new Error('No allowed weekday found within iteration limit');
        }
        return candidate.toISOString();
    }
}

