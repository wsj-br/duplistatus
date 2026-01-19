/**
 * RTL (Right-to-Left) utility functions
 * Provides utilities for detecting and handling RTL languages
 */

/**
 * List of RTL language codes
 * Common RTL languages: Arabic, Hebrew, Persian, Urdu, etc.
 */
const RTL_LANGUAGES = [
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Persian (Farsi)
  'ur', // Urdu
  'yi', // Yiddish
  'arc', // Aramaic
  'bcc', // Southern Balochi
  'bqi', // Bakhtiari
  'ckb', // Sorani Kurdish
  'glk', // Gilaki
  'ku', // Kurdish
  'mzn', // Mazanderani
  'pnb', // Western Punjabi
  'ps', // Pashto
  'sd', // Sindhi
  'ug', // Uyghur
] as const;

/**
 * Check if a locale is RTL (Right-to-Left)
 * 
 * @param locale - Locale string (e.g., "en", "ar", "he")
 * @returns true if the locale is RTL, false otherwise
 */
export function isRTL(locale: string): boolean {
  if (!locale) return false;
  
  // Normalize locale to language code (e.g., "ar-SA" -> "ar")
  const languageCode = locale.toLowerCase().split('-')[0];
  
  return RTL_LANGUAGES.includes(languageCode as typeof RTL_LANGUAGES[number]);
}

/**
 * Get the text direction for a locale
 * 
 * @param locale - Locale string (e.g., "en", "ar", "he")
 * @returns "rtl" for RTL languages, "ltr" otherwise
 */
export function getTextDirection(locale: string): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * Get the opposite text direction
 * Useful for flipping layouts
 * 
 * @param direction - Current text direction
 * @returns Opposite direction
 */
export function getOppositeDirection(direction: 'ltr' | 'rtl'): 'ltr' | 'rtl' {
  return direction === 'ltr' ? 'rtl' : 'ltr';
}

/**
 * Get logical CSS properties for a given direction
 * Maps physical properties (left/right) to logical properties (start/end)
 * 
 * @param direction - Text direction ('ltr' or 'rtl')
 * @returns Object with logical property mappings
 */
export function getLogicalProperties(direction: 'ltr' | 'rtl') {
  if (direction === 'rtl') {
    return {
      start: 'right',
      end: 'left',
      marginStart: 'marginRight',
      marginEnd: 'marginLeft',
      paddingStart: 'paddingRight',
      paddingEnd: 'paddingLeft',
      borderStart: 'borderRight',
      borderEnd: 'borderLeft',
      borderRadiusStart: 'borderTopRightRadius',
      borderRadiusEnd: 'borderTopLeftRadius',
    };
  }
  
  return {
    start: 'left',
    end: 'right',
    marginStart: 'marginLeft',
    marginEnd: 'marginRight',
    paddingStart: 'paddingLeft',
    paddingEnd: 'paddingRight',
    borderStart: 'borderLeft',
    borderEnd: 'borderRight',
    borderRadiusStart: 'borderTopLeftRadius',
    borderRadiusEnd: 'borderTopRightRadius',
  };
}
