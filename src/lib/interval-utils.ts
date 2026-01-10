// Utility functions for parsing and converting interval strings
// Format: valueUNIT where value is a number and UNIT is a letter representing a unit
// Units: s=seconds, m=minutes, h=hours, D=days, W=weeks, M=months, Y=years
// Tokens can be concatenated like "1D2h30m" (1 day, 2 hours, 30 minutes)

import { getLocaleWeekDays } from './utils';

export type IntervalUnit = 'custom' | 'Minutes' | 'Hours' | 'Days' | 'Weeks' | 'Months' | 'Years';

export interface ParsedInterval {
  value: number;
  unit: string;
}

export interface IntervalDisplay {
  value: number;
  unit: IntervalUnit;
  isCustom: boolean;
}

// Valid unit letters
const VALID_UNITS = ['s', 'm', 'h', 'D', 'W', 'M', 'Y'];

// Unit mapping for display
const UNIT_MAPPING: Record<string, IntervalUnit> = {
  'm': 'Minutes',
  'h': 'Hours', 
  'D': 'Days',
  'W': 'Weeks',
  'M': 'Months',
  'Y': 'Years'
};

/**
 * Parse an interval string into tokens
 * @param interval - interval string like "1D2h30m"
 * @returns array of parsed tokens
 */
export function parseIntervalString(interval: string): ParsedInterval[] {
  if (!interval || typeof interval !== 'string') {
    throw new Error('Interval must be a non-empty string');
  }

  const trimmed = interval.trim();
  if (trimmed.length === 0) {
    throw new Error('Interval cannot be empty');
  }

  // If the whole string is an integer, treat as seconds
  if (/^[0-9]+$/.test(trimmed)) {
    return [{ value: parseInt(trimmed, 10), unit: 's' }];
  }

  // Parse tokens like 1D2h30m
  const tokenRegex = /(\d+)([smhDWMY])/g;
  const tokens: ParsedInterval[] = [];
  let match: RegExpExecArray | null;
  let matched = false;

  while ((match = tokenRegex.exec(trimmed)) !== null) {
    matched = true;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    
    if (isNaN(value) || value <= 0) {
      throw new Error(`Invalid value in interval: ${match[1]}`);
    }
    
    if (!VALID_UNITS.includes(unit)) {
      throw new Error(`Invalid unit in interval: ${unit}. Valid units are: ${VALID_UNITS.join(', ')}`);
    }
    
    tokens.push({ value, unit });
  }

  if (!matched) {
    throw new Error(`Invalid interval format: ${interval}. Expected format like "1D2h30m"`);
  }

  return tokens;
}

/**
 * Validate an interval string
 * @param interval - interval string to validate
 * @returns validation result with error message if invalid
 */
export function validateIntervalString(interval: string): { isValid: boolean; error?: string } {
  if (!interval || typeof interval !== 'string') {
    return { isValid: false, error: 'Interval must be a non-empty string' };
  }

  const trimmed = interval.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Interval cannot be empty' };
  }

  // If the whole string is an integer, it's valid (treated as seconds)
  if (/^[0-9]+$/.test(trimmed)) {
    return { isValid: true };
  }

  // Check for invalid characters - only allow digits and valid units
  const invalidCharRegex = /[^0-9smhDWMY]/;
  const invalidMatch = trimmed.match(invalidCharRegex);
  if (invalidMatch) {
    return { 
      isValid: false, 
      error: `Invalid character '${invalidMatch[0]}'. Only digits and units (s, m, h, D, W, M, Y) are allowed.` 
    };
  }

  // Check that the string can be fully parsed
  try {
    parseIntervalString(interval);
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Invalid interval format' 
    };
  }
}

/**
 * Validate an interval string (legacy function for backward compatibility)
 * @param interval - interval string to validate
 * @returns true if valid, false otherwise
 */
export function isValidIntervalString(interval: string): boolean {
  return validateIntervalString(interval).isValid;
}

/**
 * Create an interval string from value and unit
 * @param value - numeric value
 * @param unit - unit string (s, m, h, D, W, M, Y)
 * @returns interval string
 */
export function createIntervalString(value: number, unit: string): string {
  if (isNaN(value) || value <= 0) {
    throw new Error('Value must be a positive number');
  }
  
  if (!VALID_UNITS.includes(unit)) {
    throw new Error(`Invalid unit: ${unit}. Valid units are: ${VALID_UNITS.join(', ')}`);
  }
  
  return `${value}${unit}`;
}

/**
 * Convert legacy format (number + intervalUnit) to new interval string format
 * @param interval - numeric interval value
 * @param unit - 'hour' or 'day'
 * @returns interval string
 */
export function convertLegacyToNew(interval: number, unit: 'hour' | 'day'): string {
  if (unit === 'hour') {
    return createIntervalString(interval, 'h');
  } else if (unit === 'day') {
    return createIntervalString(interval, 'D');
  } else {
    throw new Error(`Invalid legacy unit: ${unit}`);
  }
}

/**
 * Get display value and unit for UI components
 * @param interval - interval string
 * @returns display information
 */
export function getIntervalDisplay(interval: string): IntervalDisplay {
  const tokens = parseIntervalString(interval);
  
  // If only one token, extract value and unit for display
  if (tokens.length === 1) {
    const token = tokens[0];
    const displayUnit = UNIT_MAPPING[token.unit] || 'custom';
    return {
      value: token.value,
      unit: displayUnit,
      isCustom: false
    };
  }
  
  // Multiple tokens = custom format
  return {
    value: 0, // Not applicable for custom
    unit: 'custom',
    isCustom: true
  };
}

/**
 * Check if interval string represents a single unit (not custom)
 * @param interval - interval string
 * @returns true if single unit, false if custom
 */
export function isSingleUnitInterval(interval: string): boolean {
  try {
    const tokens = parseIntervalString(interval);
    return tokens.length === 1;
  } catch {
    return false;
  }
}

/**
 * Get the unit type from a single-unit interval string
 * @param interval - interval string
 * @returns unit type or null if not single unit
 */
export function getSingleUnitType(interval: string): IntervalUnit | null {
  try {
    const tokens = parseIntervalString(interval);
    if (tokens.length === 1) {
      return UNIT_MAPPING[tokens[0].unit] || 'custom';
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get the numeric value from a single-unit interval string
 * @param interval - interval string
 * @returns numeric value or null if not single unit
 */
export function getSingleUnitValue(interval: string): number | null {
  try {
    const tokens = parseIntervalString(interval);
    if (tokens.length === 1) {
      return tokens[0].value;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get default allowed weekdays (all days enabled)
 * @returns array of all weekday numbers (0-6)
 */
export function getDefaultAllowedWeekDays(): number[] {
  return [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
}

/**
 * Convert weekday numbers to display names
 * @param weekDays - array of weekday numbers
 * @param locale - Optional locale string. If not provided, uses browser locale (client-side) or 'en-US' (server-side)
 * @returns array of weekday names
 */
export function getWeekDayNames(weekDays: number[], locale?: string): string[] {
  try {
    // Use locale-aware names if available (client-side)
    if (typeof window !== 'undefined') {
      const localeWeekDays = getLocaleWeekDays(locale);
      const dayNameMap = new Map(localeWeekDays.map(wd => [wd.dayNumber, wd.shortName]));
      return weekDays.map(day => dayNameMap.get(day) || `Day ${day}`).filter(Boolean);
    }
  } catch {
    // Fallback if getLocaleWeekDays fails
  }
  
  // Fallback to English names (for server-side or if locale-aware function fails)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return weekDays.map(day => dayNames[day]).filter(Boolean);
}

/**
 * Check if a weekday is allowed
 * @param weekDays - array of allowed weekday numbers
 * @param day - weekday number (0-6)
 * @returns true if day is allowed
 */
export function isWeekDayAllowed(weekDays: number[], day: number): boolean {
  return weekDays.includes(day);
}

/**
 * Toggle a weekday in the allowed weekdays array
 * @param weekDays - current array of allowed weekday numbers
 * @param day - weekday number to toggle (0-6)
 * @returns new array with day toggled
 */
export function toggleWeekDay(weekDays: number[], day: number): number[] {
  if (weekDays.includes(day)) {
    return weekDays.filter(d => d !== day);
  } else {
    return [...weekDays, day].sort();
  }
}
