#!/usr/bin/env node
/**
 * Update the glossary table in CONTRIBUTING-TRANSLATIONS.md
 */

const fs = require('fs');
const path = require('path');

function updateGlossaryMarkdown(contribFile, glossaryTable) {
  if (!fs.existsSync(contribFile)) {
    console.warn(`Warning: ${contribFile} not found`);
    return false;
  }
  
  const content = fs.readFileSync(contribFile, 'utf8');
  
  // Find the glossary section and replace the table
  const glossarySectionRegex = /(## Glossary\n\n> \*\*Note\*:.*?\n\n)(\|.*?\n\|.*?\n(?:\|.*?\n)*)/s;
  
  const newGlossarySection = `## Glossary

> **Note**: This glossary is automatically generated from intlayer dictionaries to ensure consistency between the application and documentation translations. The glossary is also available in Crowdin for translators.

> **To regenerate**: Run \`./scripts/generate-glossary.sh\` from the \`documentation/\` directory. This will update both the CSV file for Crowdin import and this markdown table.

${glossaryTable}

### Importing to Crowdin

The glossary is available as \`glossary.csv\` in the documentation directory. To import it into Crowdin:

1. **Via Web UI**:
   - Go to your Crowdin project
   - Navigate to **Glossary** → **Import**
   - Upload \`glossary.csv\`
   - Map columns if needed (Crowdin should auto-detect)

2. **Via CLI** (if supported):
   \`\`\`bash
   cd documentation
   crowdin glossary upload --file glossary.csv
   \`\`\`

Once imported, Crowdin will use this glossary to suggest consistent translations for terminology across all documentation.

`;
  
  if (glossarySectionRegex.test(content)) {
    // Replace existing glossary section
    const updated = content.replace(glossarySectionRegex, newGlossarySection);
    fs.writeFileSync(contribFile, updated, 'utf8');
    return true;
  } else {
    // Try to find just the table and replace it
    const tableRegex = /(\| English.*?\n\|.*?\n(?:\|.*?\n)*)/s;
    if (tableRegex.test(content)) {
      const updated = content.replace(tableRegex, glossaryTable);
      fs.writeFileSync(contribFile, updated, 'utf8');
      return true;
    } else {
      console.warn(`Warning: Could not find glossary table in ${contribFile}`);
      return false;
    }
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const contribFile = args[0];
  const glossaryTableFile = args[1];
  
  if (!contribFile || !glossaryTableFile) {
    console.error('Usage: update-glossary-markdown.js <contrib-file> <glossary-table-file>');
    process.exit(1);
  }
  
  if (!fs.existsSync(glossaryTableFile)) {
    console.error(`Error: Glossary table file not found: ${glossaryTableFile}`);
    process.exit(1);
  }
  
  const glossaryTable = fs.readFileSync(glossaryTableFile, 'utf8');
  const success = updateGlossaryMarkdown(contribFile, glossaryTable);
  
  if (success) {
    console.log(`✓ Updated glossary in ${contribFile}`);
  } else {
    console.error(`✗ Failed to update glossary in ${contribFile}`);
    process.exit(1);
  }
}

module.exports = { updateGlossaryMarkdown };
