/**
 * Status labels for notifications — uses the same flat locale JSON as the UI (English keys).
 */

import de from "@/locales/de.json";
import fr from "@/locales/fr.json";
import es from "@/locales/es.json";
import ptBR from "@/locales/pt-BR.json";

export type BackupStatus = 'Success' | 'Unknown' | 'Warning' | 'Error' | 'Fatal' | 'N/A';

const bundles: Record<string, Record<string, string>> = {
  de: de as Record<string, string>,
  fr: fr as Record<string, string>,
  es: es as Record<string, string>,
  'pt-BR': ptBR as Record<string, string>,
};

/**
 * Translate a backup status value for the given locale.
 */
export function translateStatus(status: BackupStatus | string, locale: string = 'en-GB'): string {
  const normalizedLocale = locale.toLowerCase() === 'pt-br' ? 'pt-BR' : locale;
  if (normalizedLocale === 'en-GB') {
    return String(status);
  }
  const bundle = bundles[normalizedLocale];
  if (bundle && typeof bundle[String(status)] === 'string') {
    return bundle[String(status)];
  }
  return String(status);
}
