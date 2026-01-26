#!/usr/bin/env node

/**
 * Script to detect which translation files are actually translated vs untranslated
 * Compares translated files with English source to identify files that need English copies
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Normalize content for comparison (remove anchor IDs, normalize whitespace)
 */
function normalizeContent(content) {
  return content
    // Remove explicit anchor IDs {#anchor-id}
    .replace(/\s+\{#[^}]+\}/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate similarity percentage between two strings
 */
function calculateSimilarity(str1, str2) {
  const normalized1 = normalizeContent(str1);
  const normalized2 = normalizeContent(str2);
  
  if (normalized1 === normalized2) {
    return 100;
  }
  
  // Simple word-based similarity
  const words1 = normalized1.split(/\s+/);
  const words2 = normalized2.split(/\s+/);
  const allWords = new Set([...words1, ...words2]);
  
  let matches = 0;
  for (const word of allWords) {
    if (words1.includes(word) && words2.includes(word)) {
      matches++;
    }
  }
  
  return allWords.size > 0 ? (matches / allWords.size) * 100 : 0;
}

/**
 * Check if file is likely untranslated
 */
function isLikelyUntranslated(englishContent, translatedContent, threshold = 95) {
  const similarity = calculateSimilarity(englishContent, translatedContent);
  return similarity >= threshold;
}

/**
 * Get file hash for exact match detection
 */
function getFileHash(content) {
  return crypto.createHash('md5').update(normalizeContent(content)).digest('hex');
}

/**
 * Recursively find all markdown files in a directory
 */
function findMarkdownFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

/**
 * Get relative path from docs root
 */
function getRelativePath(fullPath, baseDir) {
  return path.relative(baseDir, fullPath);
}

/**
 * Main function
 */
function main() {
  const docsDir = path.join(__dirname, '..', 'docs');
  const i18nDir = path.join(__dirname, '..', 'i18n');
  
  if (!fs.existsSync(docsDir)) {
    console.error(`Error: ${docsDir} does not exist`);
    process.exit(1);
  }
  
  // Supported locales (excluding English)
  const locales = ['fr', 'de', 'es', 'pt-BR'];
  
  // Find all English source files
  console.log('Scanning English source files...');
  const englishFiles = findMarkdownFiles(docsDir);
  console.log(`Found ${englishFiles.length} English source files\n`);
  
  const results = {
    translated: {},
    untranslated: {},
    missing: {},
    identical: {}
  };
  
  // Initialize results objects
  for (const locale of locales) {
    results.translated[locale] = [];
    results.untranslated[locale] = [];
    results.missing[locale] = [];
    results.identical[locale] = [];
  }
  
  // Check each locale
  for (const locale of locales) {
    const localeDir = path.join(i18nDir, locale, 'docusaurus-plugin-content-docs', 'current');
    
    console.log(`\n=== Checking ${locale.toUpperCase()} ===`);
    
    for (const englishFile of englishFiles) {
      const relativePath = getRelativePath(englishFile, docsDir);
      const translatedFile = path.join(localeDir, relativePath);
      
      // Check if translated file exists
      if (!fs.existsSync(translatedFile)) {
        results.missing[locale].push(relativePath);
        continue;
      }
      
      // Read both files
      const englishContent = fs.readFileSync(englishFile, 'utf8');
      const translatedContent = fs.readFileSync(translatedFile, 'utf8');
      
      // Check if identical (exact match)
      const englishHash = getFileHash(englishContent);
      const translatedHash = getFileHash(translatedContent);
      
      if (englishHash === translatedHash) {
        results.identical[locale].push(relativePath);
        continue;
      }
      
      // Check similarity
      if (isLikelyUntranslated(englishContent, translatedContent)) {
        const similarity = calculateSimilarity(englishContent, translatedContent);
        results.untranslated[locale].push({
          file: relativePath,
          similarity: similarity.toFixed(1)
        });
      } else {
        results.translated[locale].push(relativePath);
      }
    }
    
    // Print summary for this locale
    console.log(`  ✓ Translated: ${results.translated[locale].length}`);
    console.log(`  - Untranslated (similarity >95%): ${results.untranslated[locale].length}`);
    console.log(`  = Identical to English: ${results.identical[locale].length}`);
    console.log(`  ✗ Missing: ${results.missing[locale].length}`);
  }
  
  // Create a mapping of each file to its status in each language
  const fileStatusMap = {};
  
  // First, initialize all files with missing status for all languages
  englishFiles.forEach(englishFile => {
    const relativePath = getRelativePath(englishFile, docsDir);
    fileStatusMap[relativePath] = {};
    locales.forEach(locale => {
      fileStatusMap[relativePath][locale] = '✗'; // Missing
    });
  });
  
  // Now update the status based on our findings
  for (const locale of locales) {
    // Mark translated files
    results.translated[locale].forEach(file => {
      fileStatusMap[file][locale] = '✓'; // Translated
    });
    
    // Mark untranslated files
    results.untranslated[locale].forEach(({ file }) => {
      fileStatusMap[file][locale] = '-'; // Untranslated
    });
    
    // Mark identical files
    results.identical[locale].forEach(file => {
      fileStatusMap[file][locale] = '='; // Identical
    });
    
    // Missing files are already marked as 'M' by default
    results.missing[locale].forEach(file => {
      fileStatusMap[file][locale] = '✗'; // Missing
    });
  }
  
  // Helper function to get visual width of a string (accounting for emojis)
  function getStringVisualWidth(str) {
    const s = String(str);
    let width = 0;
    for (let i = 0; i < s.length; i++) {
      const charCode = s.charCodeAt(i);
      // Handle surrogate pairs (emojis are typically represented as surrogate pairs)
      if (charCode >= 0xD800 && charCode <= 0xDBFF) { // High surrogate
        i++; // Skip the next character (low surrogate)
        width += 2; // Emojis typically take 2 character spaces visually
      } else {
        width += 1; // Regular character takes 1 space
      }
    }
    return width;
  }
  
  // Helper function to pad string to fixed width considering visual width
  function padString(str, width) {
    const s = String(str);
    const visualWidth = getStringVisualWidth(s);
    
    if (visualWidth > width) {
      // Truncate considering emoji boundaries
      let result = '';
      let currentWidth = 0;
      for (let i = 0; i < s.length; i++) {
        const charCode = s.charCodeAt(i);
        if (charCode >= 0xD800 && charCode <= 0xDBFF) { // High surrogate
          if (currentWidth + 2 > width) break;
          result += s.charAt(i) + s.charAt(i + 1);
          i++; // Skip the next character (low surrogate)
          currentWidth += 2;
        } else {
          if (currentWidth + 1 > width) break;
          result += s.charAt(i);
          currentWidth++;
        }
      }
      return result;
    }
    
    // Pad to desired width
    const paddingNeeded = width - visualWidth;
    return s + ' '.repeat(paddingNeeded);
  }
  
  // Generate and print the table
  console.log('\n\n=== TRANSLATION STATUS TABLE ===\n');
  
  // Define fixed widths for each column
  const fileColumnWidth = 60; // Width for file name column
  const langColumnWidth = 8;  // Width for each language column
  
  // Create header row with fixed-width columns
  let headerRow = '| ' + padString('File', fileColumnWidth) + ' |';
  locales.forEach(locale => {
    headerRow += ' ' + padString(locale.toUpperCase(), langColumnWidth) + ' |';
  });
  console.log(headerRow);
  
  // Create separator row with fixed-width columns
  let separatorRow = '|-' + ''.padEnd(fileColumnWidth, '-') + '-|';
  locales.forEach(() => {
    separatorRow += '-' + ''.padEnd(langColumnWidth, '-') + '-|';
  });
  console.log(separatorRow);
  
  // Sort files alphabetically
  const sortedFiles = Object.keys(fileStatusMap).sort();
  
  // Create data rows with fixed-width columns
  sortedFiles.forEach(file => {
    let dataRow = '| ' + padString(file, fileColumnWidth) + ' |';
    locales.forEach(locale => {
      dataRow += ' ' + padString(fileStatusMap[file][locale], langColumnWidth) + ' |';
    });
    console.log(dataRow);
  });
  
  // Also save the table to a markdown file
  const tableRows = [];
  tableRows.push(headerRow);
  tableRows.push(separatorRow);
  sortedFiles.forEach(file => {
    let dataRow = '| ' + padString(file, fileColumnWidth) + ' |';
    locales.forEach(locale => {
      dataRow += ' ' + padString(fileStatusMap[file][locale], langColumnWidth) + ' |';
    });
    tableRows.push(dataRow);
  });
  
  const tableReportPath = path.join(__dirname, '..', 'translation-status-table.md');
  fs.writeFileSync(tableReportPath, tableRows.join('\n'), 'utf8');
  console.log(`\n\nTable report saved to: ${tableReportPath}`);
  
  // Save original detailed report to file
  const reportPath = path.join(__dirname, '..', 'translation-status-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Detailed report saved to: ${reportPath}`);
}

if (require.main === module) {
  main();
}

module.exports = { isLikelyUntranslated, calculateSimilarity, normalizeContent };
