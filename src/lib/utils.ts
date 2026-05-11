import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { parseISO, isValid } from 'date-fns';
import type { BackupStatus, NotificationEvent, OverdueTolerance, StartOfWeek } from './types';
import { SOURCE_LOCALE } from './locales';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the browser's locale for number formatting.
 * Falls back to {@link SOURCE_LOCALE} if not available (e.g., in SSR).
 */
function getBrowserLocale(): string {
  if (typeof window === 'undefined') {
    return SOURCE_LOCALE;
  }
  return navigator.language || navigator.languages?.[0] || SOURCE_LOCALE;
}

export function formatDurationFromMinutes(totalMinutes: unknown, locale?: string): string {
  // Handle all possible invalid inputs
  if (totalMinutes === null || totalMinutes === undefined) return "00:00:00";

  let numMinutes: number;

  if (typeof totalMinutes === 'number') {
    numMinutes = totalMinutes;
  } else if (typeof totalMinutes === 'string') {
    try {
      numMinutes = Number(totalMinutes);
    } catch {
      numMinutes = 0;
    }
  } else {
    numMinutes = 0;
  }

  if (isNaN(numMinutes) || numMinutes < 0 || !isFinite(numMinutes)) numMinutes = 0;

  const hours = Math.floor(numMinutes / 60);
  const minutes = Math.floor(numMinutes % 60);
  // Calculate seconds from the fractional part of totalMinutes
  const seconds = Math.round((numMinutes * 60) % 60);

  const resolvedLocale = locale || getBrowserLocale();

  try {
    return new (Intl as any).DurationFormat(resolvedLocale, {
      style: 'digital',
      hours: '2-digit',
      minutes: '2-digit',
      seconds: '2-digit'
    }).format({ hours, minutes, seconds });
  } catch {
    // Fallback if Intl.DurationFormat is not supported or fails
    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }
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
 * @param locale - Optional locale string (e.g., "en-GB", "de", "fr"). If not provided, uses English
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
 * @param locale - Optional locale string (e.g., "en-GB", "de", "fr"). If not provided, uses English abbreviations
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

// Function to convert timestamp from Duplicati format to ISO format.
// Supports locale-specific formats emitted by Duplicati, covering the most
// common locales worldwide. Formats supported (single-digit d/M/h tolerated):
//
//   yyyy-MM-dd HH:mm:ss         ISO 8601 / en-CA / sv-SE / lt-LT
//   yyyy.MM.dd HH:mm:ss         zh-CN / ja-JP / hu-HU / zh-TW
//   yyyy.MM.dd tt hh:mm:ss      ko-KR  (AM/PM marker precedes the time)
//   yyyy/MM/dd hh:mm:ss tt      es-MX / es-CO
//   dd/MM/yyyy HH:mm:ss         en-GB / fr-FR / it-IT / es-ES / pt-BR
//   dd/MM/yyyy HH.mm.ss         nn-NO / da-DK  (dots as time separator)
//   dd.MM.yyyy HH:mm:ss         de-DE / de-AT / ru-RU / tr-TR / fi-FI
//   MM/dd/yyyy hh:mm:ss tt  \
//   dd/MM/yyyy hh:mm:ss tt  /   en-US / en-PH / en-AU / en-IN / en-NZ / ms-MY
//                               (disambiguated by value range; defaults to MM/dd)
export function convertTimestampToISO(timestamp: string): string {
  try {
    // Normalise non-breaking spaces (U+00A0, U+202F narrow NBSP) → regular space.
    // Duplicati on some platforms emits a narrow NBSP before AM/PM.
    const s = timestamp.trim().replace(/[\u00A0\u202F]/g, ' ');

    let m: RegExpMatchArray | null;

    // ── Year-first (unambiguous) ──────────────────────────────────────────────

    // yyyy-MM-dd HH:mm:ss  (ISO 8601, en-CA, sv-SE, lt-LT)
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})$/);
    if (m) return buildISO(+m[3], +m[2], +m[1], +m[4], +m[5], +m[6], timestamp);

    // yyyy.MM.dd HH:mm:ss  (zh-CN, ja-JP, hu-HU, zh-TW)
    m = s.match(/^(\d{4})\.(\d{2})\.(\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})$/);
    if (m) return buildISO(+m[3], +m[2], +m[1], +m[4], +m[5], +m[6], timestamp);

    // yyyy.MM.dd tt hh:mm:ss  (ko-KR — AM/PM marker precedes the time)
    m = s.match(/^(\d{4})\.(\d{2})\.(\d{2})\s+(AM|PM)\s+(\d{1,2}):(\d{2}):(\d{2})$/i);
    if (m) return buildISO(+m[3], +m[2], +m[1], to24h(+m[5], m[4]), +m[6], +m[7], timestamp);

    // yyyy/MM/dd hh:mm:ss tt  (es-MX, es-CO)
    m = s.match(/^(\d{4})\/(\d{2})\/(\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)$/i);
    if (m) return buildISO(+m[3], +m[2], +m[1], to24h(+m[4], m[7]), +m[5], +m[6], timestamp);

    // ── Day-first, 24-hour (unambiguous) ─────────────────────────────────────

    // dd/MM/yyyy HH:mm:ss  (en-GB, fr-FR, it-IT, es-ES, pt-BR) — single-digit ok
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/);
    if (m) return buildISO(+m[1], +m[2], +m[3], +m[4], +m[5], +m[6], timestamp);

    // dd/MM/yyyy HH.mm.ss  (nn-NO, da-DK — dots as time separator)
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2})\.(\d{2})\.(\d{2})$/);
    if (m) return buildISO(+m[1], +m[2], +m[3], +m[4], +m[5], +m[6], timestamp);

    // dd.MM.yyyy HH:mm:ss  (de-DE, de-AT, ru-RU, tr-TR, fi-FI) — single-digit ok
    m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/);
    if (m) return buildISO(+m[1], +m[2], +m[3], +m[4], +m[5], +m[6], timestamp);

    // ── Slash + AM/PM: MM/dd (en-US, en-PH) vs dd/MM (en-AU, en-IN, en-NZ, ms-MY) ──
    // Cannot be determined from the timestamp alone; disambiguate by value range:
    //   • first part > 12  → it must be a day  → dd/MM interpretation
    //   • second part > 12 → it must be a day  → MM/dd interpretation
    //   • both ≤ 12        → default to MM/dd  (AM/PM is strongly US-associated)
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)$/i);
    if (m) {
      const a = +m[1], b = +m[2];
      let day: number, month: number;
      if (a > 12) { day = a; month = b; }  // a must be day → dd/MM
      else if (b > 12) { day = b; month = a; }  // b must be day → MM/dd
      else { month = a; day = b; }  // ambiguous     → default MM/dd (US)
      return buildISO(day, month, +m[3], to24h(+m[4], m[7]), +m[5], +m[6], timestamp);
    }

    console.warn(`Timestamp format not recognized: ${timestamp}`);
    return '';
  } catch (error) {
    console.warn(`Error converting timestamp ${timestamp}:`, error);
    return '';
  }
}

/** Convert a 12-hour clock value + meridiem string ("AM"/"PM") to 24-hour. */
function to24h(hour: number, meridiem: string): number {
  const ap = meridiem.toUpperCase();
  if (ap === 'AM' && hour === 12) return 0;
  if (ap === 'PM' && hour !== 12) return hour + 12;
  return hour;
}

/** Validate date/time components and return an ISO string, or '' on failure. */
function buildISO(
  day: number, month: number, year: number,
  hour: number, minute: number, second: number,
  originalTimestamp: string
): string {
  if (
    day < 1 || day > 31 ||
    month < 1 || month > 12 ||
    year < 1900 || year > 2100 ||
    hour < 0 || hour > 23 ||
    minute < 0 || minute > 59 ||
    second < 0 || second > 59
  ) {
    console.warn(`Invalid timestamp values: ${originalTimestamp}`);
    return '';
  }

  const date = new Date(year, month - 1, day, hour, minute, second);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    console.warn(`Invalid date constructed from timestamp: ${originalTimestamp}`);
    return '';
  }

  return date.toISOString();
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
  // Dummy t function for i18n string extraction
  const t = (s: string) => s;

  const toleranceLabels: Record<OverdueTolerance, string> = {
    'no_tolerance': t('No tolerance'),
    '5min': t('5 min'),
    '15min': t('15 min'),
    '30min': t('30 min'),
    '1h': t('1 hour'),
    '2h': t('2 hours'),
    '4h': t('4 hours'),
    '6h': t('6 hours'),
    '12h': t('12 hours'),
    '1d': t('1 day')
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

export function getLocaleWeekDays(locale?: string, startOfWeekOverride?: StartOfWeek): LocaleWeekDay[] {
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

  // Determine the first day of the week
  let firstDayOfWeek: number;

  if (startOfWeekOverride && startOfWeekOverride !== 'locale') {
    // Use user's explicit preference
    firstDayOfWeek = startOfWeekOverride === 'monday' ? 1 : 0;
  } else {
    // Auto-detect from locale
    try {
      const localeLower = browserLocale.toLowerCase();
      const mondayFirstLocales = [
        'en-gb', 'en-au', 'en-nz', 'fr', 'de', 'es', 'it', 'pt-pt',
        'nl', 'pl', 'ru', 'sv', 'no', 'da', 'fi', 'cs', 'sk', 'hu',
        'ro', 'bg', 'hr', 'sl', 'et', 'lv', 'lt', 'el', 'is', 'mt'
      ];
      const isMondayFirst = mondayFirstLocales.some(prefix => localeLower.startsWith(prefix));
      firstDayOfWeek = isMondayFirst ? 1 : 0;
    } catch {
      firstDayOfWeek = 0;
    }
  }

  // Reorder weekdays based on first day of week
  if (firstDayOfWeek === 0) {
    // Sunday first - already in correct order
    return weekDays;
  } else {
    // Monday first - reorder: Monday (1) through Sunday (0)
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




