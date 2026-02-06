/**
 * Status value translations for notifications
 * Mirrors the translations from status-badge.content.ts
 */

export type BackupStatus = 'Success' | 'Unknown' | 'Warning' | 'Error' | 'Fatal' | 'N/A';

export const STATUS_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    Success: 'Success',
    Unknown: 'Unknown',
    Warning: 'Warning',
    Error: 'Error',
    Fatal: 'Fatal',
    'N/A': 'N/A',
  },
  de: {
    Success: 'Erfolg',
    Unknown: 'Unbekannt',
    Warning: 'Warnung',
    Error: 'Fehler',
    Fatal: 'Kritisch',
    'N/A': 'N/V',
  },
  fr: {
    Success: 'Succès',
    Unknown: 'Inconnu',
    Warning: 'Avertissement',
    Error: 'Erreur',
    Fatal: 'Fatal',
    'N/A': 'N/A',
  },
  es: {
    Success: 'Éxito',
    Unknown: 'Desconocido',
    Warning: 'Advertencia',
    Error: 'Error',
    Fatal: 'Fatal',
    'N/A': 'N/A',
  },
  'pt-BR': {
    Success: 'Sucesso',
    Unknown: 'Desconhecido',
    Warning: 'Aviso',
    Error: 'Erro',
    Fatal: 'Fatal',
    'N/A': 'N/A',
  },
};

/**
 * Translate a backup status value to the given locale
 */
export function translateStatus(status: BackupStatus | string, locale: string = 'en'): string {
  const normalizedLocale = locale === 'pt-br' ? 'pt-BR' : locale;
  const translations = STATUS_TRANSLATIONS[normalizedLocale] || STATUS_TRANSLATIONS.en;
  return translations[status as BackupStatus] || String(status);
}
