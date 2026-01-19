import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO, isValid } from 'date-fns';
import type { BackupStatus, NotificationEvent, OverdueTolerance } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the browser's locale for number formatting
 * Falls back to 'en-US' if not available (e.g., in SSR)
 */
function getBrowserLocale(): string {
  if (typeof window === 'undefined') {
    return 'en-US'; // Default for SSR
  }
  // Use navigator.language or navigator.languages[0] if available
  return navigator.language || navigator.languages?.[0] || 'en-US';
}

/**
 * Format a number using the browser's locale or provided locale
 * This ensures consistent locale-aware number formatting across the application
 * 
 * @param value - Number to format
 * @param options - Optional Intl.NumberFormatOptions for custom formatting
 * @param locale - Optional locale string (e.g., "en", "de", "fr", "es", "pt-BR"). If not provided, uses browser locale.
 * @returns Formatted number string
 * 
 * @deprecated For new code, use formatNumber from '@/lib/number-format' with explicit locale parameter
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions, locale?: string): string {
  const effectiveLocale = locale || getBrowserLocale();
  return new Intl.NumberFormat(effectiveLocale, options).format(value);
}

/**
 * Format bytes with locale-aware number formatting
 * 
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @param locale - Optional locale string (e.g., "en", "de", "fr", "es", "pt-BR"). If not provided, uses browser locale.
 * @returns Formatted bytes string
 * 
 * @deprecated For new code, use formatBytes from '@/lib/number-format' with explicit locale parameter
 */
export function formatBytes(bytes: unknown, decimals = 2, locale?: string): string {
  // Handle all possible invalid inputs
  if (bytes === null || bytes === undefined) return '0 Bytes';
  
  let numBytes: number;
  
  if (typeof bytes === 'number') {
    numBytes = bytes;
  } else if (typeof bytes === 'string') {
    try {
      numBytes = Number(bytes);
    } catch {
      return '0 Bytes';
    }
  } else {
    return '0 Bytes';
  }
  
  if (isNaN(numBytes) || !isFinite(numBytes) || numBytes <= 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  const value = numBytes / Math.pow(k, i);

  // Use locale-aware number formatting
  const effectiveLocale = locale || getBrowserLocale();
  const formatter = new Intl.NumberFormat(effectiveLocale, {
    minimumFractionDigits: dm,
    maximumFractionDigits: dm,
  });

  return formatter.format(value) + ' ' + sizes[i];
}

export function formatDurationFromMinutes(totalMinutes: unknown): string {
  // Handle all possible invalid inputs
  if (totalMinutes === null || totalMinutes === undefined) return "00:00:00";
  
  let numMinutes: number;
  
  if (typeof totalMinutes === 'number') {
    numMinutes = totalMinutes;
  } else if (typeof totalMinutes === 'string') {
    try {
      numMinutes = Number(totalMinutes);
    } catch {
      return "00:00:00";
    }
  } else {
    return "00:00:00";
  }
  
  if (isNaN(numMinutes) || numMinutes < 0 || !isFinite(numMinutes)) return "00:00:00";
  if (numMinutes === 0) return "00:00:00";

  const hours = Math.floor(numMinutes / 60);
  const minutes = Math.floor(numMinutes % 60);
  // Calculate seconds from the fractional part of totalMinutes
  const seconds = Math.round((numMinutes * 60) % 60);

  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}

/**
 * Remove articles from the beginning of relative time strings for certain locales
 * This fixes cases where Intl.RelativeTimeFormat produces articles like:
 * - Spanish: "la semana pasada" -> "semana pasada"
 * - French: "la semaine dernière" -> "semaine dernière"
 */
function removeLocaleArticles(text: string, locale?: string): string {
  if (!locale) {
    return text;
  }
  const localeLower = locale.toLowerCase();
  
  // Spanish articles: el, la, los, las
  if (localeLower.startsWith('es')) {
    return text.replace(/^(el|la|los|las)\s+/i, '');
  }
  
  // French articles: le, la, les, l'
  if (localeLower.startsWith('fr')) {
    return text.replace(/^(le|la|les|l')\s+/i, '');
  }
  
  return text;
}

/**
 * Format a relative time string (e.g., "2 hours ago", "in 3 days")
 * Uses Intl.RelativeTimeFormat for locale-aware formatting when locale is provided
 * @param dateString - ISO date string or SQLite timestamp
 * @param currentTime - Optional reference time (defaults to now)
 * @param locale - Optional locale string (e.g., "en", "de", "fr"). If not provided, uses English
 */
export function formatRelativeTime(dateString: string, currentTime?: Date, locale?: string): string {
  if (!dateString || dateString === "N/A") return "";
  try {
    // Handle SQLite timestamps (YYYY-MM-DD HH:MM:SS format, UTC)
    // Convert to ISO format by replacing space with 'T' and appending 'Z' for UTC
    let isoString = dateString;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString.trim())) {
      isoString = dateString.replace(' ', 'T') + 'Z';
    }
    
    const date = parseISO(isoString);
    if (!isValid(date)) {
      return ""; 
    }

    // Use a fixed reference time (server-side) to avoid hydration mismatches
    const now = currentTime || new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Use absolute value for "just now" case as requested
    if (Math.abs(diffInSeconds) < 15) {
      if (locale) {
        try {
          const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
          return removeLocaleArticles(rtf.format(0, 'second'), locale);
        } catch {
          return "just now";
        }
      }
      return "just now";
    }

    const isFuture = diffInSeconds < 0;
    const absDiffInSeconds = Math.abs(diffInSeconds);

    // Use Intl.RelativeTimeFormat if locale is provided
    if (locale) {
      try {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        
        if (absDiffInSeconds < 60) {
          const seconds = Math.floor(absDiffInSeconds);
          return removeLocaleArticles(rtf.format(isFuture ? seconds : -seconds, 'second'), locale);
        }
        
        if (absDiffInSeconds < 3600) {
          const minutes = Math.floor(absDiffInSeconds / 60);
          return removeLocaleArticles(rtf.format(isFuture ? minutes : -minutes, 'minute'), locale);
        }
        
        if (absDiffInSeconds < 86400) {
          const hours = Math.floor(absDiffInSeconds / 3600);
          return removeLocaleArticles(rtf.format(isFuture ? hours : -hours, 'hour'), locale);
        }
        
        if (absDiffInSeconds < 604800) {
          const days = Math.floor(absDiffInSeconds / 86400);
          return removeLocaleArticles(rtf.format(isFuture ? days : -days, 'day'), locale);
        }
        
        if (absDiffInSeconds < 2592000) {
          const weeks = Math.floor(absDiffInSeconds / 604800);
          return removeLocaleArticles(rtf.format(isFuture ? weeks : -weeks, 'week'), locale);
        }
        
        if (absDiffInSeconds < 31536000) {
          const months = Math.floor(absDiffInSeconds / 2592000);
          return removeLocaleArticles(rtf.format(isFuture ? months : -months, 'month'), locale);
        }
        
        // For periods longer than 1 year, show years and months
        const years = Math.floor(absDiffInSeconds / 31536000);
        const remainingSeconds = absDiffInSeconds % 31536000;
        const months = Math.floor(remainingSeconds / 2592000);
        
        if (months === 0) {
          return removeLocaleArticles(rtf.format(isFuture ? years : -years, 'year'), locale);
        } else {
          // Intl.RelativeTimeFormat doesn't support compound formats, so we format separately
          const yearPart = removeLocaleArticles(rtf.format(isFuture ? years : -years, 'year'), locale);
          const monthPart = removeLocaleArticles(rtf.format(isFuture ? months : -months, 'month'), locale);
          // Try to combine them in a locale-appropriate way
          // For most locales, we can use a simple conjunction
          return `${yearPart} ${monthPart}`;
        }
      } catch {
        // Fall through to English fallback
      }
    }

    // Fallback to English formatting if locale not provided or Intl.RelativeTimeFormat fails
    if (absDiffInSeconds < 60) {  
      const seconds = Math.floor(absDiffInSeconds);
      return isFuture ? `in ${seconds} second${seconds === 1 ? '' : 's'}` : `${seconds} second${seconds === 1 ? '' : 's'} ago`;
    }

    if (absDiffInSeconds < 3600) {
      const minutes = Math.floor(absDiffInSeconds / 60);
      return isFuture ? `in ${minutes} minute${minutes === 1 ? '' : 's'}` : `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }

    if (absDiffInSeconds < 86400) {
      const hours = Math.floor(absDiffInSeconds / 3600);
      return isFuture ? `in ${hours} hour${hours === 1 ? '' : 's'}` : `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    if (absDiffInSeconds < 604800) {
      const days = Math.floor(absDiffInSeconds / 86400);
      return isFuture ? `in ${days} day${days === 1 ? '' : 's'}` : `${days} day${days === 1 ? '' : 's'} ago`;
    }

    if (absDiffInSeconds < 2592000) {
      const weeks = Math.floor(absDiffInSeconds / 604800);
      return isFuture ? `in ${weeks} week${weeks === 1 ? '' : 's'}` : `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    }

    if (absDiffInSeconds < 31536000) {
      const months = Math.floor(absDiffInSeconds / 2592000);
      return isFuture ? `in ${months} month${months === 1 ? '' : 's'}` : `${months} month${months === 1 ? '' : 's'} ago`;
    }

    // Calculate years and remaining months for periods longer than 1 year
    const years = Math.floor(absDiffInSeconds / 31536000);
    const remainingSeconds = absDiffInSeconds % 31536000;
    const months = Math.floor(remainingSeconds / 2592000);
    
    if (months === 0) {
      return isFuture ? `in ${years} year${years === 1 ? '' : 's'}` : `${years} year${years === 1 ? '' : 's'} ago`;
    } else {
      return isFuture ? `in ${years} year${years === 1 ? '' : 's'} and ${months} month${months === 1 ? '' : 's'}` : `${years} year${years === 1 ? '' : 's'} and ${months} month${months === 1 ? '' : 's'} ago`;
    }
  } catch {
    return "";
  }
}


/**
 * Format a short relative time string (e.g., "6 mo", "2 y")
 * Uses abbreviated format for compact display
 * @param dateString - ISO date string
 * @param currentTime - Optional reference time (defaults to now)
 * @param addPlural - Optional flag for plural suffix (legacy parameter, not used with locale)
 * @param locale - Optional locale string (e.g., "en", "de", "fr"). If not provided, uses English abbreviations
 */
export function formatShortTimeAgo(dateString: string, currentTime?: Date, addPlural?: boolean, locale?: string): string {
  if (!dateString || dateString === "N/A") return "";
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return ""; 
    }

    // Use a fixed reference time (server-side) to avoid hydration mismatches
    const now = currentTime || new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 0) {
      // Use Intl.RelativeTimeFormat for locale-aware "future" text
      if (locale) {
        try {
          const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always', style: 'short' });
          const absSeconds = Math.abs(diffInSeconds);
          if (absSeconds < 60) {
            return rtf.format(1, 'second').replace(/^in\s+/i, '') || 'future';
          } else if (absSeconds < 3600) {
            return rtf.format(Math.ceil(absSeconds / 60), 'minute').replace(/^in\s+/i, '') || 'future';
          } else {
            return rtf.format(Math.ceil(absSeconds / 3600), 'hour').replace(/^in\s+/i, '') || 'future';
          }
        } catch {
          return "future";
        }
      }
      return "future";
    }

    if (diffInSeconds < 60) {
      // Use Intl.RelativeTimeFormat for locale-aware "now" text
      if (locale) {
        try {
          const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
          return rtf.format(0, 'second');
        } catch {
          return "now";
        }
      }
      return "now";
    }

    // For short format, we'll use abbreviated units that are more universal
    // But we can still make them locale-aware for the unit abbreviations
    const plural = addPlural === undefined ? '' : addPlural ? 's' : '';

    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      // Abbreviated minutes - keep short for compact display
      return `${minutes} m${minutes === 1 ? '' : plural}`;
    }

    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} h${hours === 1 ? '' : plural}`;
    }

    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} d${days === 1 ? '' : plural}`;
    }

    if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} w${weeks === 1 ? '' : plural}`;
    }

    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      // Use Intl.RelativeTimeFormat with narrow style for compact month abbreviation
      if (locale) {
        try {
          const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always', style: 'narrow' });
          const formatted = rtf.format(-months, 'month');
          // Extract just the number and abbreviation (e.g., "3mo" from "3mo ago")
          return formatted.replace(/\s*ago\s*$/i, '').trim();
        } catch {
          return `${months} mo${months === 1 ? '' : plural}`;
        }
      }
      return `${months} mo${months === 1 ? '' : plural}`;
    }

    // Calculate years and remaining months for periods longer than 1 year
    const years = Math.floor(diffInSeconds / 31536000);
    const remainingSeconds = diffInSeconds % 31536000;
    const months = Math.floor(remainingSeconds / 2592000);
    
    if (locale) {
      try {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always', style: 'narrow' });
        if (months === 0) {
          const formatted = rtf.format(-years, 'year');
          return formatted.replace(/\s*ago\s*$/i, '').trim();
        } else {
          const yearFormatted = rtf.format(-years, 'year').replace(/\s*ago\s*$/i, '').trim();
          const monthFormatted = rtf.format(-months, 'month').replace(/\s*ago\s*$/i, '').trim();
          return `${yearFormatted} ${monthFormatted}`;
        }
      } catch {
        // Fallback to English abbreviations
        if (months === 0) {
          return `${years} y`;
        } else {
          return `${years} y ${months} mo${months === 1 ? '' : plural}`;
        }
      }
    }
    
    if (months === 0) {
      return `${years} y`;
    } else {
      return `${years} y ${months} mo${months === 1 ? '' : plural}`;
    }
  } catch {
    return "";
  }
}


export function formatTimeElapsed(dateString: string, currentTime?: Date, locale?: string): string {
  if (!dateString || dateString === "N/A") return "";
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return ""; 
    }

    // Use a fixed reference time (server-side) to avoid hydration mismatches
    const now = currentTime || new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 0) {
      if (locale) {
        // Try to get locale-specific translation
        try {
          const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
          // For future dates, we'll just return a generic message
          return locale === 'fr' ? 'dans le futur' : locale === 'es' ? 'en el futuro' : locale === 'de' ? 'in der Zukunft' : locale === 'pt-BR' ? 'no futuro' : 'in the future';
        } catch {
          return "in the future";
        }
      }
      return "in the future";
    }

    // Use Intl.RelativeTimeFormat if locale is provided
    if (locale) {
      try {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'long' });
        
        if (Math.abs(diffInSeconds) < 15) {
          return removeLocaleArticles(rtf.format(0, 'second'), locale);
        }
        
        if (diffInSeconds < 3600) {
          const minutes = Math.floor(diffInSeconds / 60);
          return removeLocaleArticles(rtf.format(-minutes, 'minute'), locale);
        }
        
        if (diffInSeconds < 86400) {
          const hours = Math.floor(diffInSeconds / 3600);
          return removeLocaleArticles(rtf.format(-hours, 'hour'), locale);
        }
        
        if (diffInSeconds < 604800) {
          const days = Math.floor(diffInSeconds / 86400);
          return removeLocaleArticles(rtf.format(-days, 'day'), locale);
        }
        
        if (diffInSeconds < 2592000) {
          const weeks = Math.floor(diffInSeconds / 604800);
          return removeLocaleArticles(rtf.format(-weeks, 'week'), locale);
        }
        
        if (diffInSeconds < 31536000) {
          const months = Math.floor(diffInSeconds / 2592000);
          return removeLocaleArticles(rtf.format(-months, 'month'), locale);
        }
        
        // Calculate years and remaining months for periods longer than 1 year
        const years = Math.floor(diffInSeconds / 31536000);
        const remainingSeconds = diffInSeconds % 31536000;
        const months = Math.floor(remainingSeconds / 2592000);
        
        if (months === 0) {
          return removeLocaleArticles(rtf.format(-years, 'year'), locale);
        } else {
          const yearPart = removeLocaleArticles(rtf.format(-years, 'year'), locale);
          const monthPart = removeLocaleArticles(rtf.format(-months, 'month'), locale);
          // For most locales, we can use a simple conjunction
          return `${yearPart} ${monthPart}`;
        }
      } catch {
        // Fall through to English fallback
      }
    }

    // Fallback to English formatting if locale not provided or Intl.RelativeTimeFormat fails
    if (Math.abs(diffInSeconds) < 15) {
      return "just now";
    }

    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }

    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }

    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days === 1 ? '' : 's'}`;
    }

    if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} week${weeks === 1 ? '' : 's'}`;
    }

    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months === 1 ? '' : 's'}`;
    }

    // Calculate years and remaining months for periods longer than 1 year
    const years = Math.floor(diffInSeconds / 31536000);
    const remainingSeconds = diffInSeconds % 31536000;
    const months = Math.floor(remainingSeconds / 2592000);
    
    if (months === 0) {
      return `${years} year${years === 1 ? '' : 's'}`;
    } else {
      return `${years} year${years === 1 ? '' : 's'} and ${months} month${months === 1 ? '' : 's'}`;
    }
  } catch {
    return "";
  }
}

// Function to convert timestamp from Duplicati format to ISO format
export function convertTimestampToISO(timestamp: string): string {
  try {
    // Handle various timestamp formats that might come from Duplicati
    // Expected format: "14/07/2025 00:05:06" or similar
    const cleanTimestamp = timestamp.trim();
    
    // Try to parse DD/MM/YYYY HH:mm:ss format - be strict about this format
    const match = cleanTimestamp.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
    if (match) {
      const [, day, month, year, hour, minute, second] = match;
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      const hourNum = parseInt(hour);
      const minuteNum = parseInt(minute);
      const secondNum = parseInt(second);
      
      // Validate ranges
      if (dayNum < 1 || dayNum > 31 || 
          monthNum < 1 || monthNum > 12 || 
          yearNum < 1900 || yearNum > 2100 ||
          hourNum < 0 || hourNum > 23 ||
          minuteNum < 0 || minuteNum > 59 ||
          secondNum < 0 || secondNum > 59) {
        console.warn(`Invalid timestamp values: ${timestamp}`);
        return '';
      }
      
      const date = new Date(yearNum, monthNum - 1, dayNum, hourNum, minuteNum, secondNum);
      
      // Additional validation - check if the date is valid
      if (date.getFullYear() !== yearNum || 
          date.getMonth() !== monthNum - 1 || 
          date.getDate() !== dayNum) {
        console.warn(`Invalid date constructed from timestamp: ${timestamp}`);
        return '';
      }
      
      return date.toISOString();
    }
    
    console.warn(`Timestamp format not recognized: ${timestamp}`);
    return '';
  } catch (error) {
    console.warn(`Error converting timestamp ${timestamp}:`, error);
    return '';
  }
}

// Helper function to extract from plain text (non-JSON strings)
function extractFromPlainText(text: string): string[] {
  let backupsToConsider: string[] = [];
  let backupsToDelete: string[] = [];
  
  // Split by lines and process each line
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (typeof line !== 'string') continue;
    
    if (line.includes("Backups to consider:")) {
      const timestampsStr = line.split("Backups to consider:")[1]?.trim();
      if (timestampsStr) {
        backupsToConsider = timestampsStr.split(",")
          .map(ts => ts.trim())
          .filter(ts => ts.length > 0)
          .map(convertTimestampToISO)
          .filter(ts => ts.length > 0);
      }
    }
    
    if (line.includes("All backups to delete:")) {
      const timestampsStr = line.split("All backups to delete:")[1]?.trim();
      if (timestampsStr) {
        backupsToDelete = timestampsStr.split(",")
          .map(ts => ts.trim())
          .filter(ts => ts.length > 0)
          .map(convertTimestampToISO)
          .filter(ts => ts.length > 0);
      }
    }
  }
  
  if (backupsToConsider.length === 0) return [];
  
  // Filter out backups to delete
  return backupsToConsider.filter(backup => !backupsToDelete.includes(backup));
}

// Function to extract available versions from message array
export function extractAvailableBackups(messagesArray: string | null): string[] {
  if (!messagesArray) return [];
  
  // Trim whitespace and check for empty strings
  const cleanedMessages = messagesArray.trim();
  if (cleanedMessages.length === 0) return [];
  
  let messages: unknown;
  
  try {
    messages = JSON.parse(cleanedMessages);
  } catch (jsonError) {
    // If JSON parsing fails, try to handle as plain text
    console.warn('Messages array is not valid JSON, attempting to parse as plain text:', jsonError instanceof Error ? jsonError.message : 'Unknown error');
    
    // Try to extract directly from the string if it contains the target lines
    if (typeof cleanedMessages === 'string') {
      return extractFromPlainText(cleanedMessages);
    }
    
    return [];
  }
  
  // Handle case where JSON was parsed but result is not an array
  if (!Array.isArray(messages)) {
    console.warn('Parsed messages is not an array, got:', typeof messages);
    
    // If it's a string, try to extract from it
    if (typeof messages === 'string') {
      return extractFromPlainText(messages);
    }
    
    return [];
  }
  
  let backupsToConsider: string[] = [];
  let backupsToDelete: string[] = [];
  
  for (const message of messages) {
    // Skip non-string elements
    if (typeof message !== 'string') {
      console.warn('Skipping non-string message element:', typeof message);
      continue;
    }
    
    if (message.includes("Backups to consider:")) {
      const timestampsStr = message.split("Backups to consider:")[1]?.trim();
      if (timestampsStr) {
        backupsToConsider = timestampsStr.split(",")
          .map(ts => ts.trim())
          .filter(ts => ts.length > 0)
          .map(convertTimestampToISO)
          .filter(ts => ts.length > 0);
      }
    }
    
    if (message.includes("All backups to delete:")) {
      const timestampsStr = message.split("All backups to delete:")[1]?.trim();
      if (timestampsStr) {
        backupsToDelete = timestampsStr.split(",")
          .map(ts => ts.trim())
          .filter(ts => ts.length > 0)
          .map(convertTimestampToISO)
          .filter(ts => ts.length > 0);
      }
    }
  }
  
  if (backupsToConsider.length === 0) return [];
  
  // Filter out backups to delete
  const availableBackups = backupsToConsider.filter(backup => !backupsToDelete.includes(backup));
  
  // Sort timestamps from most recent to oldest (ISO format can be sorted as strings)
  return availableBackups.sort((a, b) => b.localeCompare(a));
}

// Utility function to format duration from seconds in human-readable format
export function formatDurationHuman(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Get status color class for backup status
 */
export function getStatusColor(status: BackupStatus | 'N/A'): string {
  switch (status) {
    case 'Success':
      return 'text-green-500';
    case 'Unknown':
      return 'text-gray-500';
    case 'Warning':
      return 'text-yellow-500';
    case 'Error':
    case 'Fatal':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}

/**
 * Get notification icon type for notification events
 */
export function getNotificationIconType(notificationEvent: NotificationEvent | undefined): 'errors' | 'warnings' | 'all' | 'off' | null {
  if (!notificationEvent) return null;
  
  switch (notificationEvent) {
    case 'errors':
      return 'errors';
    case 'warnings':
      return 'warnings';
    case 'all':
      return 'all';
    case 'off':
      return 'off';
    default:
      return null;
  }
}
export function isDevelopmentMode(): boolean {
  // In Next.js, NODE_ENV is available at build time and runtime
  return process.env.NODE_ENV !== 'production';
}

/**
 * Convert overdue tolerance value to human-readable label
 */
export function getOverdueToleranceLabel(tolerance: OverdueTolerance): string {
  const toleranceLabels: Record<OverdueTolerance, string> = {
    'no_tolerance': 'No tolerance',
    '5min': '5 min',
    '15min': '15 min',
    '30min': '30 min',
    '1h': '1 hour',
    '2h': '2 hours',
    '4h': '4 hours',
    '6h': '6 hours',
    '12h': '12 hours',
    '1d': '1 day'
  };
  
  return toleranceLabels[tolerance] || tolerance;
}

/**
 * Get locale-aware weekday information
 * Returns an array of weekday objects ordered by the locale's first day of the week
 * @param locale - Optional locale string. If not provided, uses browser locale
 * @returns Array of objects with dayNumber (0-6, where 0=Sunday), shortName, and fullName
 */
export interface LocaleWeekDay {
  dayNumber: number; // JavaScript day number (0=Sunday, 1=Monday, etc.)
  shortName: string; // Abbreviated name (e.g., "Mon", "Tue")
  fullName: string; // Full name (e.g., "Monday", "Tuesday")
}

export function getLocaleWeekDays(locale?: string): LocaleWeekDay[] {
  const browserLocale = locale || getBrowserLocale();
  
  // Create a date for a known Sunday (January 7, 2024 was a Sunday)
  const baseDate = new Date(2024, 0, 7); // January 7, 2024 (Sunday)
  
  // Get all 7 weekdays starting from Sunday
  const weekDays: LocaleWeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    const dayNumber = date.getDay(); // 0=Sunday, 1=Monday, etc.
    
    const shortFormatter = new Intl.DateTimeFormat(browserLocale, { weekday: 'short' });
    const fullFormatter = new Intl.DateTimeFormat(browserLocale, { weekday: 'long' });
    
    weekDays.push({
      dayNumber,
      shortName: shortFormatter.format(date),
      fullName: fullFormatter.format(date),
    });
  }
  
  // Determine the first day of the week for this locale
  // We'll check which day the locale considers as the start of the week
  // by looking at the calendar week numbering
  let firstDayOfWeek = 0; // Default to Sunday
  
  try {
    // Try to get the first day of the week from Intl
    // Create a date in the middle of a week and check formatting
    const testDate = new Date(2024, 0, 10); // Wednesday, January 10, 2024
    const formatter = new Intl.DateTimeFormat(browserLocale, { 
      weekday: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
    
    // For most European locales, Monday is day 1
    // For US/Brazil locales, Sunday is day 0
    // We can determine this by checking locale patterns
    const localeLower = browserLocale.toLowerCase();
    
    // Common Monday-first locales
    const mondayFirstLocales = [
      'en-gb', 'en-au', 'en-nz', 'fr', 'de', 'es', 'it', 'pt-pt', 
      'nl', 'pl', 'ru', 'sv', 'no', 'da', 'fi', 'cs', 'sk', 'hu',
      'ro', 'bg', 'hr', 'sl', 'et', 'lv', 'lt', 'el', 'is', 'mt'
    ];
    
    // Check if locale starts with any Monday-first locale prefix
    const isMondayFirst = mondayFirstLocales.some(prefix => 
      localeLower.startsWith(prefix)
    );
    
    if (isMondayFirst) {
      firstDayOfWeek = 1; // Monday
    } else {
      firstDayOfWeek = 0; // Sunday (default for US, Brazil, etc.)
    }
  } catch {
    // Fallback to Sunday if detection fails
    firstDayOfWeek = 0;
  }
  
  // Reorder weekdays based on first day of week
  if (firstDayOfWeek === 0) {
    // Sunday first (US, Brazil) - already in correct order
    return weekDays;
  } else {
    // Monday first (UK, France, most of Europe)
    // Reorder: Monday (1) through Sunday (0)
    const mondayFirst = weekDays.slice(1).concat(weekDays.slice(0, 1));
    return mondayFirst;
  }
}

/**
 * Convert server interval string to hours or days
 * Parses strings like "1D2h30m" (1 day, 2 hours, 30 minutes) and converts to total hours or days
 * Returns hours if total < 24 hours, otherwise returns days
 */
// export function ConvertServerInterval(intervalString: string): IntervalConversion {
//   if (!intervalString || typeof intervalString !== 'string') {
//     return { number: 0, intervalUnit: 'hour' };
//   }

//   // Clean the input string
//   const cleanString = intervalString.trim();
//   if (cleanString.length === 0) {
//     return { number: 0, intervalUnit: 'hour' };
//   }

//   // Regular expression to match valueUNIT patterns
//   const pattern = /(\d+(?:\.\d+)?)([smhDWMY])/g;
//   let totalHours = 0;
//   let match;

//   // Parse all tokens in the string
//   while ((match = pattern.exec(cleanString)) !== null) {
//     const value = parseFloat(match[1]);
//     const unit = match[2];

//     if (isNaN(value) || value < 0) {
//       continue; // Skip invalid values
//     }

//     // Convert each unit to hours
//     switch (unit) {
//       case 's': // seconds
//         totalHours += value / 3600;
//         break;
//       case 'm': // minutes
//         totalHours += value / 60;
//         break;
//       case 'h': // hours
//         totalHours += value;
//         break;
//       case 'D': // days
//         totalHours += value * 24;
//         break;
//       case 'W': // weeks
//         totalHours += value * 24 * 7;
//         break;
//       case 'M': // months (approximate as 30 days)
//         totalHours += value * 24 * 30;
//         break;
//       case 'Y': // years (approximate as 365 days)
//         totalHours += value * 24 * 365;
//         break;
//       default:
//         // Unknown unit, skip
//         break;
//     }
//   }

//   // If no valid tokens were found, return default
//   if (totalHours === 0) {
//     return { intervalValue: 0, intervalUnit: 'hour' };
//   }

//   // Return hours if less than 24 hours, otherwise return days
//   if (totalHours < 24) {
//     return { 
//       intervalValue: totalHours,
//       intervalUnit: 'hour' 
//     };
//   } else {
//     return { 
//       intervalValue: totalHours / 24,
//       intervalUnit: 'day' 
//     };
//   }
// }

/**
 * Parse a SQLite DATETIME timestamp string (UTC) and format it for display in browser timezone
 * SQLite timestamps are in "YYYY-MM-DD HH:MM:SS" format and are stored in UTC
 * 
 * @deprecated Use formatSQLiteTimestamp from '@/lib/date-format' with locale parameter instead
 * @param timestamp - SQLite timestamp string in "YYYY-MM-DD HH:MM:SS" format
 * @returns Formatted date string in browser's local timezone
 */
export function formatSQLiteTimestamp(timestamp: string): string {
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
      return fallbackDate.toLocaleString();
    }
    
    // Format in browser's local timezone
    return date.toLocaleString();
  } catch (error) {
    console.error('Error formatting SQLite timestamp:', error);
    return timestamp; // Return original on error
  }
}



