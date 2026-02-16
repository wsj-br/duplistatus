#!/usr/bin/env node
/**
 * Extract terminology from intlayer dictionaries and convert to glossary format.
 * 
 * This script:
 * - Reads all JSON files from .intlayer/dictionary/
 * - Extracts key terminology (common UI terms + technical terms)
 * - Generates CSV glossary file
 */

const fs = require('fs');
const path = require('path');

// Language mapping
const LANG_MAP = {
  'en': 'en-GB',
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

// Common prepositions to omit from glossary (single-word terms only)
const PREPOSITIONS = new Set([
  'a', 'aboard', 'about', 'above', 'across', 'after', 'against', 'along', 'amid',
  'among', 'around', 'as', 'at', 'before', 'behind', 'below', 'beneath', 'beside',
  'besides', 'between', 'beyond', 'but', 'by', 'concerning', 'despite', 'down',
  'during', 'except', 'for', 'from', 'in', 'inside', 'into', 'like', 'near', 'of',
  'off', 'on', 'onto', 'out', 'over', 'past', 'per', 'regarding', 'round', 'since',
  'than', 'through', 'throughout', 'till', 'to', 'toward', 'towards', 'under',
  'underneath', 'until', 'up', 'upon', 'via', 'with', 'within', 'without'
]);

/**
 * Remove {} placeholders from text
 */
function removePlaceholders(str) {
  if (!str || typeof str !== 'string') return str;
  return str.replace(/\{[^}]+\}/g, '').trim();
}

/**
 * Remove parentheses from text
 * Converts "(Collect backups logs)" to "Collect backups logs"
 */
function removeParentheses(str) {
  if (!str || typeof str !== 'string') return str;
  // Remove leading and trailing parentheses if the entire string is wrapped
  let cleaned = str.trim();
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

/**
 * Remove trailing colons from text
 * Converts "Checked:" to "Checked"
 */
function removeTrailingColon(str) {
  if (!str || typeof str !== 'string') return str;
  let cleaned = str.trim();
  // Remove trailing colon if present
  if (cleaned.endsWith(':')) {
    cleaned = cleaned.slice(0, -1).trim();
  }
  return cleaned;
}

/**
 * Clean text: remove placeholders, parentheses, and trailing colons
 */
function cleanText(str) {
  if (!str || typeof str !== 'string') return str;
  let cleaned = removePlaceholders(str);
  cleaned = removeParentheses(cleaned);
  cleaned = removeTrailingColon(cleaned);
  return cleaned.trim();
}

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
  
  // Omit single-word prepositions
  const words = trimmed.split(/\s+/);
  if (words.length === 1 && PREPOSITIONS.has(words[0].toLowerCase())) return false;
  
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
    const enTerms = extractTerms(translations['en-GB'] || {});
    
    for (const [key, enValue] of Object.entries(enTerms)) {
      // Check if we should include this term (now includes ALL UI elements)
      if (!shouldIncludeTerm(enValue, key)) continue;
      
      // Clean up the English term - remove {} placeholders and parentheses
      const cleanEnValue = cleanText(enValue);
      
      // Get translations for all languages by extracting from each language's structure
      const termTranslations = {
        en: cleanEnValue
      };
      
      // Extract translations from nested structure for each language
      for (const lang of ['de', 'fr', 'es', 'pt-BR']) {
        const langTerms = extractTerms(translations[lang] || {});
        const langValue = langTerms[key] || '';
        // Clean translations - remove {} placeholders and parentheses
        termTranslations[lang] = cleanText(langValue);
      }
      
      // Skip entries where all languages are just "#"
      const allValues = Object.values(termTranslations);
      if (allValues.every(v => v.trim() === '#' || v.trim() === '')) {
        continue;
      }
      
      // Use English term as the key (normalized)
      const termKey = cleanEnValue.toLowerCase();
      
      // Only add if we have at least English and one other translation
      const hasTranslations = Object.values(termTranslations).filter(v => v && v.trim() && v.trim() !== '#').length >= 2;
      
      if (hasTranslations) {
        // If term already exists with same key, prefer the one with more translations
        const existing = termMap.get(termKey);
        const newTranslationCount = Object.values(termTranslations).filter(v => v && v.trim() && v.trim() !== '#').length;
        const existingTranslationCount = existing ? Object.values(existing).filter(v => v && v.trim() && v.trim() !== '#').length : 0;
        
        if (!existing || newTranslationCount > existingTranslationCount) {
          termMap.set(termKey, termTranslations);
        }
      }
    }
  }
  
  // Post-process: remove duplicates based on actual content
  return removeDuplicates(termMap);
}

/**
 * Remove duplicate entries based on actual content (not just English key)
 */
function removeDuplicates(termMap) {
  const uniqueMap = new Map();
  const seenContent = new Set();
  
  // Sort by number of translations (descending) to keep entries with more translations
  const sortedEntries = Array.from(termMap.entries()).sort((a, b) => {
    const aCount = Object.values(a[1]).filter(v => v && v.trim() && v.trim() !== '#').length;
    const bCount = Object.values(b[1]).filter(v => v && v.trim() && v.trim() !== '#').length;
    return bCount - aCount;
  });
  
  for (const [termKey, translations] of sortedEntries) {
    // Create a unique signature from all non-empty, non-# translations
    const allValues = Object.values(translations)
      .filter(v => v && v.trim() && v.trim() !== '#')
      .map(v => v.toLowerCase().trim())
      .sort()
      .join('|');
    
    // Skip if we've seen this exact content combination before
    if (allValues && seenContent.has(allValues)) {
      continue;
    }
    
    // Mark this content as seen and add to unique map
    if (allValues) {
      seenContent.add(allValues);
    }
    uniqueMap.set(termKey, translations);
  }
  
  return uniqueMap;
}

/** Locale columns for simplified glossary format (header = locale only) */
const GLOSSARY_LOCALES = ['en', 'fr', 'de', 'pt-BR', 'es'];

/**
 * Generate CSV glossary file with locale columns only
 */
function generateCSV(termMap) {
  const rows = [];
  
  // Header: locale names only
  const escapeCSV = (val) => {
    if (!val || val === '') return '';
    return `"${String(val).replace(/"/g, '""')}"`;
  };
  
  rows.push(GLOSSARY_LOCALES.map(l => escapeCSV(l)).join(','));
  
  // Sort terms alphabetically by English
  const sortedTerms = Array.from(termMap.entries()).sort((a, b) => 
    (a[1].en || a[0]).localeCompare(b[1].en || b[0])
  );
  
  for (const [termKey, translations] of sortedTerms) {
    const terms = GLOSSARY_LOCALES.map(locale => cleanText(translations[locale] || ''));
    
    // Skip entries where all terms are just "#" or empty
    if (terms.every(t => t.trim() === '#' || t.trim() === '')) {
      continue;
    }
    
    rows.push(terms.map(t => escapeCSV(t)).join(','));
  }
  
  return rows.join('\n');
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const outputCSV = args[0] || 'glossary-ui.csv';
  const dictDir = args[1] || path.join(__dirname, '../../.intlayer/dictionary');
  
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
  
  return { termMap, csv };
}

if (require.main === module) {
  main();
}

module.exports = { main, extractAllTerms, generateCSV };
