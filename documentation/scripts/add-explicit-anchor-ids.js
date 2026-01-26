#!/usr/bin/env node

/**
 * Script to add explicit anchor IDs to all headings in markdown files
 * This ensures consistent anchor IDs across translations
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate anchor ID from heading text (Docusaurus style)
 */
function generateAnchorId(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Process a markdown file and add explicit anchor IDs to headings
 */
function processMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const modifiedLines = [];
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match headings: ## Heading or ### Heading or #### Heading etc.
    // But skip if already has explicit anchor ID: ## Heading {#anchor-id}
    const headingMatch = line.match(/^(#{1,6})\s+(.+?)(?:\s+\{#([^}]+)\})?$/);
    
    if (headingMatch) {
      const level = headingMatch[1];
      const headingText = headingMatch[2].trim();
      const existingAnchor = headingMatch[3];
      
      // Skip if already has explicit anchor ID
      if (existingAnchor) {
        modifiedLines.push(line);
        continue;
      }
      
      // Generate anchor ID from heading text
      const anchorId = generateAnchorId(headingText);
      
      // Add explicit anchor ID
      const newLine = `${level} ${headingText} {#${anchorId}}`;
      modifiedLines.push(newLine);
      changed = true;
    } else {
      modifiedLines.push(line);
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, modifiedLines.join('\n'), 'utf8');
    return true;
  }
  
  return false;
}

/**
 * Recursively find all markdown files in a directory
 */
function findMarkdownFiles(dir, fileList = []) {
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
 * Main function
 */
function main() {
  const docsDir = path.join(__dirname, '..', 'docs');
  
  if (!fs.existsSync(docsDir)) {
    console.error(`Error: ${docsDir} does not exist`);
    process.exit(1);
  }
  
  console.log(`Scanning ${docsDir} for markdown files...`);
  const markdownFiles = findMarkdownFiles(docsDir);
  console.log(`Found ${markdownFiles.length} markdown files`);
  
  let processedCount = 0;
  let changedCount = 0;
  
  for (const filePath of markdownFiles) {
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    const changed = processMarkdownFile(filePath);
    
    if (changed) {
      console.log(`✓ Added anchor IDs to: ${relativePath}`);
      changedCount++;
    }
    
    processedCount++;
  }
  
  console.log(`\nCompleted!`);
  console.log(`- Processed: ${processedCount} files`);
  console.log(`- Modified: ${changedCount} files`);
}

if (require.main === module) {
  main();
}

module.exports = { generateAnchorId, processMarkdownFile };
