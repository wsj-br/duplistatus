/**
 * Locale-aware date and time formatting utilities
 * Integrates with Intlayer's locale system to provide consistent date/time formatting
 * across the application.
 */

import { parseISO, isValid } from 'date-fns';

/**
 * Known locale-specific format configurations
 * Used for backward-compatible formatting of our 5 supported UI locales.
 * For arbitrary locales, we use Intl.DateTimeFormat with sensible defaults.
 */
interface LocaleDateFormatConfig {
  dateFormat: Intl.DateTimeFormatOptions;
  timeFormat: Intl.DateTimeFormatOptions;
  uses24Hour: boolean;
}

const KNOWN_LOCALE_FORMATS: Record<string, LocaleDateFormatConfig> = {
  'en-GB': {
    dateFormat: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
    timeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    },
    uses24Hour: false,
  },
  'de': {
    dateFormat: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
    timeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    uses24Hour: true,
  },
  'fr': {
    dateFormat: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
    timeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    uses24Hour: true,
  },
  'es': {
    dateFormat: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
    timeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    uses24Hour: true,
  },
  'pt-BR': {
    dateFormat: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
    timeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    uses24Hour: true,
  },
};

const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
};

const DEFAULT_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
};

/**
 * Get the locale format configuration for a given locale.
 * Uses known configs for our 5 UI locales; sensible defaults for all others.
 */
function getLocaleConfig(locale: string): LocaleDateFormatConfig {
  const normalized = locale === 'pt-br' ? 'pt-BR' : locale;
  if (normalized in KNOWN_LOCALE_FORMATS) {
    return KNOWN_LOCALE_FORMATS[normalized];
  }
  return {
    dateFormat: DEFAULT_DATE_FORMAT,
    timeFormat: DEFAULT_TIME_FORMAT,
    uses24Hour: true,
  };
}

/**
 * Normalize locale string. For known UI locales, preserves exact casing.
 * For arbitrary locales, passes through as-is.
 */
function normalizeLocale(locale: string): string {
  const normalized = locale === 'pt-br' ? 'pt-BR' : locale;
  if (normalized in KNOWN_LOCALE_FORMATS) {
    return normalized;
  }
  return locale;
}

/**
 * Format a date string using locale-specific date format
 * 
 * Formats:
 * - English (en-GB): MM/DD/YYYY
 * - German (de): DD.MM.YYYY
 * - French (fr): DD/MM/YYYY
 * - Spanish (es): DD/MM/YYYY
 * - Portuguese (pt-BR): DD/MM/YYYY
 * 
 * @param dateString - ISO date string or SQLite timestamp (YYYY-MM-DD HH:MM:SS)
 * @param locale - Locale string (e.g., "en-GB", "de", "fr", "es", "pt-BR")
 * @returns Formatted date string
 */
export function formatDate(dateString: string, locale: string = 'en-GB'): string {
  if (!dateString || dateString === 'N/A') return '';
  
  try {
    // Handle SQLite timestamps (YYYY-MM-DD HH:MM:SS format, UTC)
    let isoString = dateString;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString.trim())) {
      isoString = dateString.replace(' ', 'T') + 'Z';
    }
    
    const date = parseISO(isoString);
    if (!isValid(date)) {
      return '';
    }
    
    const config = getLocaleConfig(locale);
    const normalizedLocale = normalizeLocale(locale);
    
    // Use Intl.DateTimeFormat with locale-specific options
    const formatter = new Intl.DateTimeFormat(normalizedLocale === 'pt-BR' ? 'pt-BR' : normalizedLocale, {
      ...config.dateFormat,
    });
    
    return formatter.format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Format a time string using locale-specific time format
 * 
 * Time formats:
 * - English (en-GB): 12-hour format (AM/PM)
 * - German (de): 24-hour format
 * - French (fr): 24-hour format
 * - Spanish (es): 24-hour format
 * - Portuguese (pt-BR): 24-hour format
 * 
 * @param dateString - ISO date string or SQLite timestamp
 * @param locale - Locale string (e.g., "en-GB", "de", "fr", "es", "pt-BR")
 * @returns Formatted time string
 */
export function formatTime(dateString: string, locale: string = 'en-GB'): string {
  if (!dateString || dateString === 'N/A') return '';
  
  try {
    // Handle SQLite timestamps (YYYY-MM-DD HH:MM:SS format, UTC)
    let isoString = dateString;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString.trim())) {
      isoString = dateString.replace(' ', 'T') + 'Z';
    }
    
    const date = parseISO(isoString);
    if (!isValid(date)) {
      return '';
    }
    
    const config = getLocaleConfig(locale);
    const normalizedLocale = normalizeLocale(locale);
    
    // Use Intl.DateTimeFormat with locale-specific time options
    const formatter = new Intl.DateTimeFormat(normalizedLocale === 'pt-BR' ? 'pt-BR' : normalizedLocale, {
      ...config.timeFormat,
    });
    
    return formatter.format(date);
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
}

/**
 * Format a date and time string using locale-specific format
 * Combines date and time formatting with locale-appropriate separators
 * 
 * @param dateString - ISO date string or SQLite timestamp
 * @param locale - Locale string (e.g., "en-GB", "de", "fr", "es", "pt-BR")
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string, locale: string = 'en-GB'): string {
  if (!dateString || dateString === 'N/A') return '';
  
  try {
    // Handle SQLite timestamps (YYYY-MM-DD HH:MM:SS format, UTC)
    let isoString = dateString;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString.trim())) {
      isoString = dateString.replace(' ', 'T') + 'Z';
    }
    
    const date = parseISO(isoString);
    if (!isValid(date)) {
      return '';
    }
    
    const config = getLocaleConfig(locale);
    const normalizedLocale = normalizeLocale(locale);
    
    // Combine date and time formats
    const formatter = new Intl.DateTimeFormat(normalizedLocale === 'pt-BR' ? 'pt-BR' : normalizedLocale, {
      ...config.dateFormat,
      ...config.timeFormat,
    });
    
    return formatter.format(date);
  } catch (error) {
    console.error('Error formatting date/time:', error);
    return '';
  }
}

/**
 * Format a date for chart display (short format, date only)
 * Used in charts and graphs where space is limited
 * 
 * @param dateString - ISO date string or SQLite timestamp
 * @param locale - Locale string (e.g., "en-GB", "de", "fr", "es", "pt-BR")
 * @returns Formatted date string for charts
 */
export function formatDateForChart(dateString: string, locale: string = 'en-GB'): string {
  return formatDate(dateString, locale);
}

/**
 * Enhanced version of formatSQLiteTimestamp with locale support
 * Parse a SQLite DATETIME timestamp string (UTC) and format it for display in browser timezone
 * 
 * @param timestamp - SQLite timestamp string in "YYYY-MM-DD HH:MM:SS" format
 * @param locale - Locale string (e.g., "en-GB", "de", "fr", "es", "pt-BR")
 * @returns Formatted date string in browser's local timezone with locale formatting
 */
export function formatSQLiteTimestamp(timestamp: string, locale: string = 'en-GB'): string {
  if (!timestamp) return '';
  
  try {
    // SQLite timestamps are in "YYYY-MM-DD HH:MM:SS" format (UTC)
    // Convert to ISO format by replacing space with 'T' and appending 'Z' for UTC
    const isoString = timestamp.replace(' ', 'T') + 'Z';
    const date = new Date(isoString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // Fallback: try parsing as-is (might already be in a different format)
      const fallbackDate = new Date(timestamp);
      if (isNaN(fallbackDate.getTime())) {
        return timestamp; // Return original if can't parse
      }
      return formatDateTime(timestamp, locale);
    }
    
    // Format with locale-aware formatting
    return formatDateTime(isoString, locale);
  } catch (error) {
    console.error('Error formatting SQLite timestamp:', error);
    return timestamp; // Return original on error
  }
}
