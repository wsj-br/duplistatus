/**
 * Locale-aware number formatting utilities
 * Integrates with Intlayer's locale system to provide consistent number formatting
 * across the application.
 */

/**
 * Supported locales in the application
 */
export type SupportedLocale = 'en' | 'de' | 'fr' | 'es' | 'pt-BR';

/**
 * Normalize locale string to supported format
 */
function normalizeLocale(locale: string): SupportedLocale {
  const normalized = locale === 'pt-br' ? 'pt-BR' : locale;
  if (['en', 'de', 'fr', 'es', 'pt-BR'].includes(normalized)) {
    return normalized as SupportedLocale;
  }
  return 'en';
}

/**
 * Get the Intl locale string for a given locale
 * Maps our locale codes to Intl-compatible locale strings
 */
function getIntlLocale(locale: string): string {
  const normalized = normalizeLocale(locale);
  
  // Map to Intl-compatible locale strings
  const localeMap: Record<SupportedLocale, string> = {
    'en': 'en-US',
    'de': 'de-DE',
    'fr': 'fr-FR',
    'es': 'es-ES',
    'pt-BR': 'pt-BR',
  };
  
  return localeMap[normalized];
}

/**
 * Format a number using locale-specific formatting
 * 
 * Number formats:
 * - English (en): 1,234.56 (comma thousand separator, period decimal)
 * - German (de): 1.234,56 (period thousand separator, comma decimal)
 * - French (fr): 1 234,56 (space thousand separator, comma decimal)
 * - Spanish (es): 1.234,56 (period thousand separator, comma decimal)
 * - Portuguese (pt-BR): 1.234,56 (period thousand separator, comma decimal)
 * 
 * @param value - Number to format
 * @param locale - Locale string (e.g., "en", "de", "fr", "es", "pt-BR")
 * @param options - Optional Intl.NumberFormatOptions for custom formatting
 * @returns Formatted number string
 */
export function formatNumber(value: number, locale: string = 'en', options?: Intl.NumberFormatOptions): string {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return '0';
  }
  
  try {
    const intlLocale = getIntlLocale(locale);
    const formatter = new Intl.NumberFormat(intlLocale, options);
    return formatter.format(value);
  } catch (error) {
    console.error('Error formatting number:', error);
    // Fallback to default formatting
    return new Intl.NumberFormat('en-US', options).format(value);
  }
}

/**
 * Format a number as an integer (no decimal places)
 * 
 * @param value - Number to format
 * @param locale - Locale string (e.g., "en", "de", "fr", "es", "pt-BR")
 * @returns Formatted integer string
 */
export function formatInteger(value: number, locale: string = 'en'): string {
  return formatNumber(value, locale, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}

/**
 * Format a number with a specific number of decimal places
 * 
 * @param value - Number to format
 * @param locale - Locale string (e.g., "en", "de", "fr", "es", "pt-BR")
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string with specified decimal places
 */
export function formatDecimal(value: number, locale: string = 'en', decimals: number = 2): string {
  return formatNumber(value, locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format bytes with locale-aware number formatting
 * 
 * @param bytes - Number of bytes
 * @param locale - Locale string (e.g., "en", "de", "fr", "es", "pt-BR")
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted bytes string (e.g., "1.234,56 MB" for German)
 */
export function formatBytes(bytes: unknown, locale: string = 'en', decimals: number = 2): string {
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
  const intlLocale = getIntlLocale(locale);
  const formatter = new Intl.NumberFormat(intlLocale, {
    minimumFractionDigits: dm,
    maximumFractionDigits: dm,
  });

  return formatter.format(value) + ' ' + sizes[i];
}

/**
 * Format currency with locale-specific formatting
 * 
 * @param value - Amount to format
 * @param locale - Locale string (e.g., "en", "de", "fr", "es", "pt-BR")
 * @param currency - Currency code (default: 'USD')
 * @param options - Optional Intl.NumberFormatOptions for custom formatting
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  locale: string = 'en',
  currency: string = 'USD',
  options?: Intl.NumberFormatOptions
): string {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return formatCurrency(0, locale, currency, options);
  }
  
  try {
    const intlLocale = getIntlLocale(locale);
    const formatter = new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency,
      ...options,
    });
    return formatter.format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    // Fallback to default formatting
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      ...options,
    }).format(value);
  }
}

/**
 * Format a percentage with locale-specific formatting
 * 
 * @param value - Percentage value (0-100)
 * @param locale - Locale string (e.g., "en", "de", "fr", "es", "pt-BR")
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, locale: string = 'en', decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return '0%';
  }
  
  try {
    const intlLocale = getIntlLocale(locale);
    const formatter = new Intl.NumberFormat(intlLocale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return formatter.format(value / 100);
  } catch (error) {
    console.error('Error formatting percentage:', error);
    // Fallback to default formatting
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  }
}
