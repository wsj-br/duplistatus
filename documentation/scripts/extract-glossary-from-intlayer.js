#!/usr/bin/env node
/**
 * Extract terminology from intlayer dictionaries and convert to Crowdin glossary format.
 * 
 * This script:
 * - Reads all JSON files from .intlayer/dictionary/
 * - Extracts key terminology (common UI terms + technical terms)
 * - Generates CSV in Crowdin format
 * - Updates markdown glossary table
 */

const fs = require('fs');
const path = require('path');

// Language mapping: intlayer -> Crowdin
const LANG_MAP = {
  'en': 'en',
  'de': 'de',
  'fr': 'fr',
  'es': 'es',
  'pt-BR': 'pt-BR'
};

// Technical keywords to look for in all dictionaries
const TECHNICAL_KEYWORDS = [
  'backup', 'server', 'notification', 'database', 'configuration',
  'storage', 'upload', 'download', 'monitoring', 'settings',
  'dashboard', 'analytics', 'statistics', 'overdue', 'scheduled'
];

// Terms to extract from common.json
const COMMON_SECTIONS = {
  navigation: true,
  status: true,
  ui: true,  // Only key actions
  time: false  // Only key time terms, not all
};

// Key UI actions to include
const KEY_UI_ACTIONS = [
  'save', 'cancel', 'delete', 'edit', 'add', 'search', 'filter',
  'refresh', 'close', 'confirm', 'back', 'next', 'previous',
  'submit', 'reset', 'clear', 'select', 'export', 'import',
  'download', 'upload', 'view', 'hide', 'show', 'enable', 'disable'
];

// Key time terms to include
const KEY_TIME_TERMS = [
  'today', 'yesterday', 'tomorrow', 'now', 'enabled', 'disabled'
];

/**
 * Check if a string should be included as terminology
 * Now includes ALL UI elements - be more permissive
 */
function shouldIncludeTerm(str, key) {
  if (!str || typeof str !== 'string') return false;
  
  // Trim whitespace
  const trimmed = str.trim();
  
  // Skip very short strings (less than 1 character)
  if (trimmed.length < 1) return false;
  
  // Skip strings with placeholders (but allow if it's a short term with one placeholder)
  if (trimmed.includes('{') && trimmed.includes('}')) {
    // Allow short terms with placeholders like "Help for {pageName}"
    const withoutPlaceholders = trimmed.replace(/\{[^}]+\}/g, '').trim();
    if (withoutPlaceholders.length < 2) return false; // Too short after removing placeholder
    // Allow if the term is short enough (less than 30 chars total)
    if (trimmed.length > 30) return false;
  }
  
  // Skip very long strings (more than 8 words) - these are likely full sentences/descriptions
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount > 8) return false;
  
  // Skip strings that are clearly long sentences/descriptions (contain multiple periods or question marks)
  const sentenceIndicators = (trimmed.match(/[.!?]/g) || []).length;
  if (sentenceIndicators > 1) return false; // Multiple sentences = description, not terminology
  
  // Include everything else - table headers, sidebar items, buttons, labels, etc.
  return true;
}

/**
 * Extract terms from a nested object structure
 */
function extractTerms(obj, prefix = '', terms = {}) {
  if (typeof obj !== 'object' || obj === null) return terms;
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      extractTerms(value, fullKey, terms);
    } else if (typeof value === 'string') {
      terms[fullKey] = value;
    }
  }
  
  return terms;
}

/**
 * Check if a term contains technical keywords
 */
function isTechnicalTerm(enTerm) {
  if (!enTerm || typeof enTerm !== 'string') return false;
  const lowerTerm = enTerm.toLowerCase();
  return TECHNICAL_KEYWORDS.some(keyword => lowerTerm.includes(keyword));
}

/**
 * Check if a term is from a common section we want
 */
function isCommonTerm(key) {
  const parts = key.split('.');
  if (parts.length < 2) return false;
  
  const section = parts[0];
  const subKey = parts[1];
  
  if (section === 'navigation' && COMMON_SECTIONS.navigation) {
    return true;
  }
  
  if (section === 'status' && COMMON_SECTIONS.status) {
    return true;
  }
  
  if (section === 'ui' && COMMON_SECTIONS.ui) {
    return KEY_UI_ACTIONS.includes(subKey);
  }
  
  if (section === 'time' && COMMON_SECTIONS.time) {
    return KEY_TIME_TERMS.includes(subKey);
  }
  
  return false;
}

/**
 * Determine part of speech (simple heuristic)
 */
function getPartOfSpeech(term) {
  const lower = term.toLowerCase();
  
  // Common verbs
  if (['save', 'cancel', 'delete', 'edit', 'add', 'search', 'filter', 
       'refresh', 'close', 'confirm', 'submit', 'reset', 'clear',
       'export', 'import', 'download', 'upload', 'view', 'hide', 'show',
       'enable', 'disable', 'start', 'stop', 'pause', 'resume'].includes(lower)) {
    return 'verb';
  }
  
  // Common nouns
  if (['backup', 'server', 'dashboard', 'notification', 'settings',
       'storage', 'database', 'configuration', 'monitoring', 'analytics',
       'statistics'].includes(lower)) {
    return 'noun';
  }
  
  // Default to noun for most technical terms
  return 'noun';
}

/**
 * Read and parse all dictionary files
 */
function loadDictionaries(dictDir) {
  const dictionaries = {};
  const files = fs.readdirSync(dictDir);
  
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    
    const filePath = path.join(dictDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const dict = JSON.parse(content);
      dictionaries[file] = dict;
    } catch (err) {
      console.warn(`Warning: Could not parse ${file}: ${err.message}`);
    }
  }
  
  return dictionaries;
}

/**
 * Extract all terms from dictionaries
 */
function extractAllTerms(dictionaries) {
  const termMap = new Map(); // key -> { en, de, fr, es, 'pt-BR' }
  
  for (const [filename, dict] of Object.entries(dictionaries)) {
    const translations = dict.content?.translation || {};
    
    // Extract terms from English first to get the structure
    const enTerms = extractTerms(translations.en || {});
    
    for (const [key, enValue] of Object.entries(enTerms)) {
      // Check if we should include this term (now includes ALL UI elements)
      if (!shouldIncludeTerm(enValue, key)) continue;
      
      // Clean up the English term
      const cleanEnValue = enValue.trim();
      
      // Get translations for all languages by extracting from each language's structure
      const termTranslations = {
        en: cleanEnValue
      };
      
      // Extract translations from nested structure for each language
      for (const lang of ['de', 'fr', 'es', 'pt-BR']) {
        const langTerms = extractTerms(translations[lang] || {});
        const langValue = langTerms[key] || '';
        termTranslations[lang] = langValue.trim();
      }
      
      // Use English term as the key (normalized)
      const termKey = cleanEnValue.toLowerCase();
      
      // Only add if we have at least English and one other translation
      const hasTranslations = Object.values(termTranslations).filter(v => v && v.trim()).length >= 2;
      
      if (hasTranslations) {
        // If term already exists, prefer the one with more translations
        const existing = termMap.get(termKey);
        const newTranslationCount = Object.values(termTranslations).filter(v => v && v.trim()).length;
        const existingTranslationCount = existing ? Object.values(existing).filter(v => v && v.trim()).length : 0;
        
        if (!existing || newTranslationCount > existingTranslationCount) {
          termMap.set(termKey, termTranslations);
        }
      }
    }
  }
  
  return termMap;
}

/**
 * Generate CSV in Crowdin format with comprehensive columns
 */
function generateCSV(termMap) {
  const rows = [];
  
  // Header with all required columns
  const header = [
    'Term [en]', 'Description [en]', 'Part of Speech [en]', 'Status [en]', 'Type [en]', 'Gender [en]', 'Note [en]',
    'Term [fr]', 'Description [fr]', 'Part of Speech [fr]', 'Status [fr]', 'Type [fr]', 'Gender [fr]', 'Note [fr]',
    'Term [de]', 'Description [de]', 'Part of Speech [de]', 'Status [de]', 'Type [de]', 'Gender [de]', 'Note [de]',
    'Term [pt-BR]', 'Description [pt-BR]', 'Part of Speech [pt-BR]', 'Status [pt-BR]', 'Type [pt-BR]', 'Gender [pt-BR]', 'Note [pt-BR]',
    'Term [es-ES]', 'Description [es-ES]', 'Part of Speech [es-ES]', 'Status [es-ES]', 'Type [es-ES]', 'Gender [es-ES]', 'Note [es-ES]',
    'Translatable'
  ];
  
  rows.push(header.map(h => `"${h}"`).join(','));
  
  // Sort terms alphabetically
  const sortedTerms = Array.from(termMap.entries()).sort((a, b) => 
    a[0].localeCompare(b[0])
  );
  
  // Escape CSV values
  const escapeCSV = (val) => {
    if (!val || val === '') return '';
    // Always quote values that might contain special characters
    return `"${String(val).replace(/"/g, '""')}"`;
  };
  
  for (const [termKey, translations] of sortedTerms) {
    const enTerm = translations.en || '';
    const frTerm = translations.fr || '';
    const deTerm = translations.de || '';
    const ptTerm = translations['pt-BR'] || '';
    const esTerm = translations.es || ''; // Map to es-ES
    
    // Get part of speech for each language (use English as base)
    const posEn = getPartOfSpeech(enTerm);
    const posFr = posEn; // Could be enhanced with language-specific detection
    const posDe = posEn;
    const posPt = posEn;
    const posEs = posEn;
    
    // Status: preferred for all
    const status = 'preferred';
    
    // Type: empty (could be: acronym, full form, abbreviation, phrase, variant)
    const type = '';
    
    // Gender: empty (could be: masculine, feminine, neuter)
    const gender = '';
    
    // Description and Note: empty for now
    const description = '';
    const note = '';
    
    // Translatable: Yes for all terms
    const translatable = 'Yes';
    
    // Build row with all columns
    const row = [
      // English columns
      escapeCSV(enTerm),
      escapeCSV(description),
      escapeCSV(posEn),
      escapeCSV(status),
      escapeCSV(type),
      escapeCSV(gender),
      escapeCSV(note),
      // French columns
      escapeCSV(frTerm),
      escapeCSV(description),
      escapeCSV(posFr),
      escapeCSV(status),
      escapeCSV(type),
      escapeCSV(gender),
      escapeCSV(note),
      // German columns
      escapeCSV(deTerm),
      escapeCSV(description),
      escapeCSV(posDe),
      escapeCSV(status),
      escapeCSV(type),
      escapeCSV(gender),
      escapeCSV(note),
      // Portuguese (pt-BR) columns
      escapeCSV(ptTerm),
      escapeCSV(description),
      escapeCSV(posPt),
      escapeCSV(status),
      escapeCSV(type),
      escapeCSV(gender),
      escapeCSV(note),
      // Spanish (es-ES) columns
      escapeCSV(esTerm),
      escapeCSV(description),
      escapeCSV(posEs),
      escapeCSV(status),
      escapeCSV(type),
      escapeCSV(gender),
      escapeCSV(note),
      // Translatable
      escapeCSV(translatable)
    ];
    
    rows.push(row.join(','));
  }
  
  return rows.join('\n');
}

/**
 * Generate markdown glossary table
 */
function generateMarkdownTable(termMap) {
  const rows = [];
  
  // Header
  rows.push('| English | French | German | Spanish | Portuguese |');
  rows.push('|---------|--------|--------|---------|------------|');
  
  // Sort terms alphabetically
  const sortedTerms = Array.from(termMap.entries()).sort((a, b) => 
    a[0].localeCompare(b[0])
  );
  
  for (const [termKey, translations] of sortedTerms) {
    const enTerm = translations.en || '';
    const frTerm = translations.fr || '';
    const deTerm = translations.de || '';
    const esTerm = translations.es || '';
    const ptTerm = translations['pt-BR'] || '';
    
    rows.push(`| ${enTerm} | ${frTerm} | ${deTerm} | ${esTerm} | ${ptTerm} |`);
  }
  
  return rows.join('\n');
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const outputCSV = args[0] || 'glossary.csv';
  const outputMarkdown = args[1] || null;
  const dictDir = args[2] || path.join(__dirname, '../../.intlayer/dictionary');
  
  // Check if dictionary directory exists
  if (!fs.existsSync(dictDir)) {
    console.error(`Error: Dictionary directory not found: ${dictDir}`);
    process.exit(1);
  }
  
  console.log(`Reading dictionaries from: ${dictDir}`);
  const dictionaries = loadDictionaries(dictDir);
  console.log(`Loaded ${Object.keys(dictionaries).length} dictionary files`);
  
  console.log('Extracting terms...');
  const termMap = extractAllTerms(dictionaries);
  console.log(`Extracted ${termMap.size} terms`);
  
  // Generate CSV
  console.log(`Generating CSV: ${outputCSV}`);
  const csv = generateCSV(termMap);
  fs.writeFileSync(outputCSV, csv, 'utf8');
  console.log(`✓ CSV generated: ${termMap.size} terms`);
  
  // Generate markdown if requested
  if (outputMarkdown) {
    console.log(`Generating markdown table...`);
    const markdown = generateMarkdownTable(termMap);
    fs.writeFileSync(outputMarkdown, markdown, 'utf8');
    console.log(`✓ Markdown table generated`);
  }
  
  return { termMap, csv, markdown: outputMarkdown ? generateMarkdownTable(termMap) : null };
}

if (require.main === module) {
  main();
}

module.exports = { main, extractAllTerms, generateCSV, generateMarkdownTable };
