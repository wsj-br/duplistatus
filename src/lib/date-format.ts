/**
 * Locale-aware date and time formatting via ECMAScript Intl.
 * Pass the same locale codes as the UI / i18next (`useLocale`, format override, notification templates).
 */

import { parseISO, isValid } from 'date-fns';
import { SOURCE_LOCALE } from '@/lib/locales';

const SQLITE_TS = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

function parseDisplayDate(input: string): Date | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed === 'N/A') {
    return null;
  }

  let isoString = trimmed;
  if (SQLITE_TS.test(trimmed)) {
    isoString = trimmed.replace(' ', 'T') + 'Z';
  }

  const date = parseISO(isoString);
  if (!isValid(date)) {
    return null;
  }
  return date;
}

function formatWithIntl(
  dateString: string,
  locale: string,
  options: Intl.DateTimeFormatOptions
): string {
  const date = parseDisplayDate(dateString);
  if (!date) {
    return '';
  }

  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Format a date string (date portion only) using the locale's short date style.
 *
 * @param dateString - ISO date string or SQLite timestamp (YYYY-MM-DD HH:MM:SS, UTC)
 * @param locale - Locale string (default: {@link SOURCE_LOCALE})
 */
export function formatDate(dateString: string, locale: string = SOURCE_LOCALE): string {
  return formatWithIntl(dateString, locale, { dateStyle: 'short' });
}

/**
 * Format a time using the locale's short time style (12h vs 24h follows CLDR for that locale).
 *
 * @param dateString - ISO date string or SQLite timestamp
 * @param locale - Locale string (default: {@link SOURCE_LOCALE})
 */
export function formatTime(dateString: string, locale: string = SOURCE_LOCALE): string {
  return formatWithIntl(dateString, locale, { timeStyle: 'short' });
}

/**
 * Format date and time using short date and short time styles for the locale.
 *
 * @param dateString - ISO date string or SQLite timestamp
 * @param locale - Locale string (default: {@link SOURCE_LOCALE})
 */
export function formatDateTime(dateString: string, locale: string = SOURCE_LOCALE): string {
  return formatWithIntl(dateString, locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

/**
 * Format a date for chart display (date only). Same as {@link formatDate}.
 */
export function formatDateForChart(dateString: string, locale: string = SOURCE_LOCALE): string {
  return formatDate(dateString, locale);
}

/**
 * Parse a SQLite DATETIME (UTC) and format for display in the browser timezone.
 *
 * @param timestamp - SQLite timestamp "YYYY-MM-DD HH:MM:SS"
 * @param locale - Locale string (default: {@link SOURCE_LOCALE})
 */
export function formatSQLiteTimestamp(timestamp: string, locale: string = SOURCE_LOCALE): string {
  if (!timestamp) return '';

  try {
    const isoString = timestamp.replace(' ', 'T') + 'Z';
    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
      const fallbackDate = new Date(timestamp);
      if (isNaN(fallbackDate.getTime())) {
        return timestamp;
      }
      return formatDateTime(timestamp, locale);
    }

    return formatDateTime(isoString, locale);
  } catch (error) {
    console.error('Error formatting SQLite timestamp:', error);
    return timestamp;
  }
}
