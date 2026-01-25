# Docusaurus Translation Implementation Plan
*For AI Agent Execution - duplistatus Documentation*

## Executive Summary
This plan implements English → French, German, Spanish, and Brazilian Portuguese translations for the duplistatus Docusaurus documentation using Docusaurus 3.9.2's native i18n system with Crowdin integration.

**Total Estimated Duration**: 8-10 days  
**Critical Path**: Configuration → Structure → UI Strings → Core Docs → Crowdin → Testing → Deployment

---

## Phase 0: Pre-Implementation Checklist

**State Required Before Starting:**
- Clean git working directory (no uncommitted changes)
- Node.js ≥18.0 installed and verified
- Current Docusaurus build succeeds: `pnpm build`
- All documentation files are in `/docs` directory
- GitHub repository access tokens available

**AI Agent Verification Command:**
```bash
cd documentation && pnpm --version && node --version && pnpm build
```

**Expected Output:** Node v18+, pnpm 8+, successful build with no errors

---

## Phase 1: Core i18n Configuration (Day 1)

### Step 1.1: Backup Current Configuration

**Prompt for AI Agent:**
```
Create a backup of the current Docusaurus configuration before making changes.
```

**Actions:**
```bash
cd documentation
cp docusaurus.config.ts docusaurus.config.ts.backup
cp sidebars.ts sidebars.ts.backup
cp package.json package.json.backup
```

**Verification:**
```bash
ls -la *.backup
```

---

### Step 1.2: Update `docusaurus.config.ts`

**Prompt for AI Agent:**
```
Edit the file /documentation/docusaurus.config.ts to add i18n configuration. Locate the existing config object and add the i18n property at the root level, after the 'title' and 'tagline' properties but before 'url'.

Insert the following i18n configuration exactly as written:
```

```typescript
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'fr', 'de', 'es', 'pt-BR'],
  localeConfigs: {
    en: {
      label: 'English',
      direction: 'ltr',
      htmlLang: 'en-US',
      calendar: 'gregory',
      path: 'en',
    },
    fr: {
      label: 'Français',
      direction: 'ltr',
      htmlLang: 'fr-FR',
      calendar: 'gregory',
      path: 'fr',
    },
    de: {
      label: 'Deutsch',
      direction: 'ltr',
      htmlLang: 'de-DE',
      calendar: 'gregory',
      path: 'de',
    },
    es: {
      label: 'Español',
      direction: 'ltr',
      htmlLang: 'es-ES',
      calendar: 'gregory',
      path: 'es',
    },
    'pt-BR': {
      label: 'Português (Brasil)',
      direction: 'ltr',
      htmlLang: 'pt-BR',
      calendar: 'gregory',
      path: 'pt-br',
    },
  },
},
```

**Expected Modification Location:**
```typescript
// Around line 10-15 in docusaurus.config.ts
export default {
  title: 'duplistatus',
  tagline: 'A dashboard to monitor your Duplicati backups',
  // INSERT i18n CONFIG HERE
  url: 'https://wsj-br.github.io/',
```

---

### Step 1.3: Add Locale Dropdown to Navbar

**Prompt for AI Agent:**
```
In the same docusaurus.config.ts file, locate the navbar configuration. Add a locale dropdown menu item to the right side of the navbar. Find the 'items' array within the navbar object and append the following configuration:

Preserve all existing navbar items - only add the new locale dropdown.
```

```typescript
{
  type: 'localeDropdown',
  position: 'right',
  dropdownItemsBefore: [],
  dropdownItemsAfter: [],
},
```

**Expected Location:**
```typescript
navbar: {
  title: 'duplistatus',
  logo: { ... },
  items: [
    // Existing items here
    // ADD LOCALE DROPDOWN HERE
  ],
},
```

---

### Step 1.4: Update Build Scripts in `package.json`

**Prompt for AI Agent:**
```
Edit the file /documentation/package.json. In the 'scripts' section, add the following new scripts. Keep all existing scripts - only add these new ones:

- build:all (builds all locales)
- serve:all (serves all locales)
- write-translations (extracts translation strings)
```

```json
{
  "scripts": {
    "start": "docusaurus start",
    "start:fr": "docusaurus start --locale fr",
    "start:de": "docusaurus start --locale de",
    "start:es": "docusaurus start --locale es",
    "start:pt-br": "docusaurus start --locale pt-BR",
    "build": "docusaurus build",
    "build:all": "docusaurus build --locale en && docusaurus build --locale fr && docusaurus build --locale de && docusaurus build --locale es && docusaurus build --locale pt-BR",
    "serve": "docusaurus serve",
    "serve:all": "docusaurus serve --dir build",
    "deploy": "docusaurus deploy",
    "clear": "docusaurus clear",
    "swizzle": "docusaurus swizzle",
    "write-translations": "docusaurus write-translations",
    "write-heading-ids": "docusaurus write-heading-ids",
    "typecheck": "tsc"
  }
}
```

---

## Phase 2: Directory Restructuring (Day 1-2)

### Step 2.1: Create Locale-Specific Directory Structure

**Prompt for AI Agent:**
```
Create the new directory structure for locale-specific documentation. Execute these commands in sequence:

1. Create the main locale directories
2. Move all current documentation into the 'en' directory
3. Verify the structure is correct
```

**Commands:**
```bash
cd documentation/docs

# Create locale directories
mkdir -p en fr de es pt-br

# Move all existing content to en/ (preserve subdirectories)
# First, move files in root docs/
mv *.md en/ 2>/dev/null || true

# Then move directories
for dir in installation user-guide migration api-reference development release-notes settings; do
  if [ -d "$dir" ]; then
    mv "$dir" en/
  fi
done

# Verify structure
find . -maxdepth 3 -type d | sort
```

**Expected Result:**
```
./en
./en/api-reference
./en/development
./en/installation
./en/migration
./en/release-notes
./en/settings
./en/user-guide
./es
./fr
./de
./pt-br
```

---

### Step 2.2: Verify Sidebar Configuration Still Works

**Prompt for AI Agent:**
```
Test that the current sidebar configuration works with the new directory structure. Run the development server for the English locale only.

If it fails, report the error and stop execution.
```

**Commands:**
```bash
cd /documentation
pnpm start --locale en
```

**Success Criteria:**
- Server starts on http://localhost:3000
- Sidebar navigation displays correctly
- All links are functional
- **Time limit**: Wait 30 seconds, then check if server is running

**Verification Command:**
```bash
# In separate terminal
sleep 30 && curl -s http://localhost:3000 | grep -q "duplistatus" && echo "SUCCESS" || echo "FAIL"
```

---

## Phase 3: Extract Translation Strings (Day 2)

### Step 3.1: Extract Code Strings for UI Translation

**Prompt for AI Agent:**
```
Run Docusaurus's built-in translation extraction tool. This will create the i18n directory structure and extract all translatable strings from the configuration and components.

Execute the command and wait for completion.
```

**Commands:**
```bash
cd /documentation
pnpm write-translations
```

**Expected Output:**
```
[INFO] Extracting translations for locale: en
[INFO] Extracting translations for locale: fr
...
[SUCCESS] Translation files created
```

**Verification - Check created files:**
```bash
ls -la i18n/
```

**Expected Structure:**
```
i18n/
├── en/
│   ├── code.json
│   └── docusaurus-plugin-content-docs/
│       └── current.json
├── fr/
│   ├── code.json
│   └── docusaurus-plugin-content-docs/
│       └── current.json
├── de/
├── es/
└── pt-br/
```

---

### Step 3.2: Create Master Translation Keys File

**Prompt for AI Agent:**
```
Create a master translation file that lists all custom UI strings that need translation. This file will be used for manual translation or AI-assisted batch translation.

Create the file /documentation/i18n/translation-keys.md with the following content:
```

```markdown
# Translation Keys for duplistatus Documentation

## Navbar Items
- `navbar.docs.label`: "Documentation"

## Footer Links
- `footer.docs.title`: "Documentation"
- `footer.docs.installation`: "Installation"
- `footer.docs.userGuide`: "User Guide"
- `footer.docs.migration`: "Migration"
- `footer.development.title`: "Development"
- `footer.development.setup`: "Development Setup"
- `footer.development.api`: "API Reference"
- `footer.more.title`: "More"
- `footer.more.github`: "GitHub"
- `footer.more.docker`: "Docker Hub"
- `footer.copyright`: "Copyright © Waldemar Scudeller Jr."

## Sidebar Categories (from sidebars.ts)
- `sidebar.intro`: "Intro"
- `sidebar.installation`: "Installation"
- `sidebar.userGuide`: "User Guide"
- `sidebar.migration`: "Migration"
- `sidebar.apiReference`: "API Reference"
- `sidebar.development`: "Development"
- `sidebar.releaseNotes`: "Release Notes"
- `sidebar.settings`: "Settings"

## Custom Components
- `components.iconButton.title`: "Icon Button"

## Alert Messages
- `alerts.note`: "NOTE"
- `alerts.tip`: "TIP"
- `alerts.warning`: "WARNING"
- `alerts.danger`: "DANGER"
```

---

## Phase 4: Configure Crowdin Integration (Day 3)

### Step 4.1: Create Crowdin Configuration File

**Prompt for AI Agent:**
```
Create the Crowdin configuration file at /documentation/crowdin.yml. This file tells Crowdin which files to translate and where to put the translations.

Create the file with exactly this content:
```

```yaml
#
# Crowdin configuration for duplistatus documentation
#

project_id_env: CROWDIN_PROJECT_ID
api_token_env: CROWDIN_PERSONAL_TOKEN
preserve_hierarchy: true

files:
  # Markdown documentation files
  - source: /docs/en/**/*.md
    translation: /docs/%locale%/**/%original_file_name%
    update_option: update_as_unapproved
    
  # JSON translation files for UI strings
  - source: /i18n/en/code.json
    translation: /i18n/%locale%/code.json
    
  - source: /i18n/en/docusaurus-plugin-content-docs/current.json
    translation: /i18n/%locale%/docusaurus-plugin-content-docs/current.json
    
  # Special handling for pt-BR locale path
    languages_mapping:
      locale:
        en: en
        fr: fr
        de: de
        es: es
        pt-BR: pt-br
```

---

### Step 4.2: Create Environment Template

**Prompt for AI Agent:**
```
Create a template for the environment variables needed for Crowdin integration. This file should NOT be committed to git.

Create /documentation/.env.local.template with:
```

```bash
# Crowdin Configuration
# Copy this file to .env.local and fill in your actual values

# Get from: https://crowdin.com/project/duplistatus/settings#api
CROWDIN_PROJECT_ID=your_project_id_here

# Generate at: https://crowdin.com/settings#api-key
CROWDIN_PERSONAL_TOKEN=your_token_here

# GitHub Integration (optional)
GITHUB_TOKEN=your_github_token_here
```

---

### Step 4.3: Update .gitignore

**Prompt for AI Agent:**
```
Edit /documentation/.gitignore to ensure environment files and Crowdin temporary files are not committed to version control.

Add these lines to the end of the file:
```

```
# Environment variables
.env.local
.env
.env.*.local

# Crowdin
crowdin-cli.jar
```

---

### Step 4.4: Install Crowdin CLI

**Prompt for AI Agent:**
```
Install the Crowdin CLI tool globally using npm. This tool will be used to upload sources and download translations.

Execute the installation command and verify it was successful.
```

**Commands:**
```bash
npm install -g @crowdin/cli
crowdin --version
```

**Expected Output:**
```
@crowdin/cli: 3.x.x
```

---

## Phase 5: Initial Translation Setup (Day 3-4)

### Step 5.1: Create Initial Translation for UI Strings

**Prompt for AI Agent:**
```
For each target language (fr, de, es, pt-br), copy the English code.json file to create initial translation files. These will be the base for translating UI elements.

Execute these commands:
```

```bash
cd /documentation/i18n

# French
cp en/code.json fr/code.json
cp en/docusaurus-plugin-content-docs/current.json fr/docusaurus-plugin-content-docs/current.json

# German
cp en/code.json de/code.json
cp en/docusaurus-plugin-content-docs/current.json de/docusaurus-plugin-content-docs/current.json

# Spanish
cp en/code.json es/code.json
cp en/docusaurus-plugin-content-docs/current.json es/docusaurus-plugin-content-docs/current.json

# Brazilian Portuguese
cp en/code.json pt-br/code.json
cp en/docusaurus-plugin-content-docs/current.json pt-br/docusaurus-plugin-content-docs/current.json

# Verify all files created
find . -name "code.json" -o -name "current.json" | sort
```

---

### Step 5.2: Batch Translate UI Strings Using AI

**Prompt for AI Agent:**
```
Translate the UI strings in the code.json files to each target language. For each language file, replace the English values with translated versions, keeping the keys unchanged.

Use a professional, technical translation style appropriate for documentation.

Process each file:
```

**For each language (fr, de, es, pt-br), perform these actions:**

1. **Read the file:**
   ```bash
   cat /documentation/i18n/fr/code.json
   ```

2. **Translate all values while preserving:**
   - JSON structure
   - Keys (do not translate)
   - Placeholders like `{name}`
   - HTML tags if present

3. **Example transformation for French:**
   ```json
   // BEFORE
   {
     "navbar.docs.label": "Documentation",
     "footer.copyright": "Copyright © Waldemar Scudeller Jr."
   }
   
   // AFTER
   {
     "navbar.docs.label": "Documentation",
     "footer.copyright": "Copyright © Waldemar Scudeller Jr."
   }
   ```

4. **Write the translated file back**

**Priority UI strings to translate first:**
- All navbar labels
- All footer titles and links
- Sidebar category names
- Common action buttons

---

### Step 5.3: Copy Documentation Files for Translation

**Prompt for AI Agent:**
```
Copy all English markdown documentation files to each target language directory. This creates the base files that will be translated.

Execute these recursive copy operations:
```

```bash
cd /documentation/docs

# French
cp -r en/* fr/

# German
cp -r en/* de/

# Spanish
cp -r en/* es/

# Brazilian Portuguese
cp -r en/* pt-br/

# Verify file counts match
echo "English files: $(find en -name "*.md" | wc -l)"
echo "French files: $(find fr -name "*.md" | wc -l)"
echo "German files: $(find de -name "*.md" | wc -l)"
echo "Spanish files: $(find es -name "*.md" | wc -l)"
echo "Portuguese files: $(find pt-br -name "*.md" | wc -l)"
```

**Expected Result:** All counts should be equal (~64 files each)

---

## Phase 6: Test Multi-Language Build (Day 4)

### Step 6.1: Test Individual Locale Builds

**Prompt for AI Agent:**
```
Build each locale individually to verify the configuration works. Stop if any build fails and report the error.

Execute these builds in sequence and check for success:
```

```bash
cd /documentation

# Build English (default)
echo "Building English..."
pnpm build --locale en
[ $? -eq 0 ] && echo "✓ English build successful" || echo "✗ English build failed"

# Build French
echo "Building French..."
pnpm build --locale fr
[ $? -eq 0 ] && echo "✓ French build successful" || echo "✗ French build failed"

# Build German
echo "Building German..."
pnpm build --locale de
[ $? -eq 0 ] && echo "✓ German build successful" || echo "✗ German build failed"

# Build Spanish
echo "Building Spanish..."
pnpm build --locale es
[ $? -eq 0 ] && echo "✓ Spanish build successful" || echo "✗ Spanish build failed"

# Build Brazilian Portuguese
echo "Building Portuguese..."
pnpm build --locale pt-BR
[ $? -eq 0 ] && echo "✓ Portuguese build successful" || echo "✗ Portuguese build failed"
```

---

### Step 6.2: Test All Locales Together

**Prompt for AI Agent:**
```
Clean the build directory and then build all locales simultaneously using the custom build script. Monitor for errors and memory issues.

Execute:
```

```bash
cd /documentation
pnpm clear
pnpm build:all
```

**Success Criteria:**
- No build errors
- Build directory contains all locale subdirectories
- Total build time < 5 minutes

**Verification:**
```bash
ls -la build/
# Should show: en, fr, de, es, pt-br directories
```

---

### Step 6.3: Validate Language Switching

**Prompt for AI Agent:**
```
Start the development server and test that language switching works correctly. Verify that the locale dropdown appears and functions.

In one terminal, start the server:
```

```bash
cd /documentation
pnpm start
```

**Then, in a new terminal, test URLs after 30 seconds:**
```bash
sleep 30

# Test English
curl -s http://localhost:3000/en/ | grep -q "duplistatus" && echo "✓ English page loads" || echo "✗ English page fails"

# Test French (should redirect or load)
curl -s http://localhost:3000/fr/ | grep -q "duplistatus" && echo "✓ French page loads" || echo "✗ French page fails"

# Check for locale dropdown in HTML
curl -s http://localhost:3000/en/ | grep -q "localeDropdown" && echo "✓ Locale dropdown present" || echo "✗ No locale dropdown"
```

---

## Phase 7: Crowdin Project Setup (Day 5)

### Step 7.1: Create Crowdin Project

**Prompt for AI Agent:**
```
The human must complete this step manually. Create a prompt for the human to:

1. Go to https://crowdin.com and create an account
2. Create a new project named "duplistatus-docs"
3. Select target languages: French, German, Spanish, Brazilian Portuguese
4. Set source language: English
5. Enable GitHub integration (if desired)
6. Note down the Project ID from Settings > API
7. Generate Personal Access Token from Account Settings > API

Wait for human confirmation before proceeding.
```

**AI Agent Action:**
```bash
echo ">>> HUMAN ACTION REQUIRED <<<"
echo "Please create a Crowdin project and provide:"
echo "1. Project ID"
echo "2. Personal Access Token"
echo ""
echo "Press Enter when ready to continue..."
read
```

---

### Step 7.2: Configure Environment Variables

**Prompt for AI Agent:**
```
Ask the human for the Crowdin credentials and create the .env.local file. Do not proceed without these values.

The AI should prompt interactively:
```

```bash
cd /documentation

echo "Enter Crowdin Project ID:"
read PROJECT_ID

echo "Enter Crowdin Personal Token:"
read PERSONAL_TOKEN

# Create .env.local file
cat > .env.local << EOF
CROWDIN_PROJECT_ID=$PROJECT_ID
CROWDIN_PERSONAL_TOKEN=$PERSONAL_TOKEN
EOF

echo "Environment file created. Verifying..."
[ -f .env.local ] && echo "✓ .env.local exists" || echo "✗ Failed to create"
```

---

### Step 7.3: Upload Source Files to Crowdin

**Prompt for AI Agent:**
```
Upload all source files (English markdown and JSON) to Crowdin. This is the first sync that populates the Crowdin project.

Execute the upload command and capture output:
```

```bash
cd /documentation
crowdin upload sources
```

**Success Criteria:**
- All files uploaded without errors
- Output shows file count matching your documentation (~64 markdown + 2 JSON)
- No authentication errors

**Verification:**
```bash
# Check Crowdin web UI should show source files
echo "Check https://crowdin.com/project/duplistatus-docs to verify files appear"
```

---

### Step 7.4: Download Translations from Crowdin

**Prompt for AI Agent:**
```
After human translators complete translations in Crowdin (or use AI pre-translate feature), download the translations to your local repository.

Execute the download command:
```

```bash
cd /documentation
crowdin download translations
```

**Expected Result:**
- Files downloaded to /docs/[locale]/ directories
- Files downloaded to /i18n/[locale]/ directories
- Overwrites the placeholder copies made earlier

---

## Phase 8: Documentation Content Translation (Day 6-8)

### Step 8.1: Prioritize Translation Order

**Prompt for AI Agent:**
```
Translate documentation files in priority order based on user impact. Create a translation queue:

Priority 1: Core User Facing
- docs/en/intro.md
- docs/en/installation/*.md
- docs/en/user-guide/*.md

Priority 2: Advanced User
- docs/en/user-guide/settings/*.md

Priority 3: Migration & API
- docs/en/migration/*.md
- docs/en/api-reference/*.md

Priority 4: Development
- docs/en/development/*.md
- docs/en/release-notes/*.md

Create a translation status tracker file:
```

```bash
cd /documentation
cat > TRANSLATION-STATUS.md << 'EOF'
# Translation Status Tracker

| File | Word Count | FR | DE | ES | PT-BR |
|------|------------|----|----|----|-------|
| intro.md | XXX | ☐ | ☐ | ☐ | ☐ |
| installation/installation.md | XXX | ☐ | ☐ | ☐ | ☐ |

Legend: ☐ Not Started, 🔄 In Progress, ✅ Complete
EOF
```

---

### Step 8.2: Batch Translate Core Documentation

**Prompt for AI Agent:**
```
For each markdown file in the priority 1 queue, translate the content from English to all target languages. Use an AI translation service or Crowdin's pre-translate feature.

For each file:
1. Read the English source file
2. Translate preserving:
   - Frontmatter (but translate 'title' and 'description')
   - Markdown structure (headings, lists, code blocks)
   - Links (keep URLs, translate link text)
   - Image references
   - Code block content (do NOT translate code)
   - Mermaid diagram content (do NOT translate)
3. Write to corresponding locale file

Example for French translation of intro.md:
```

**Original File:** `/documentation/docs/en/intro.md`

**Translation Target:** `/documentation/docs/fr/intro.md`

**Frontmatter Translation:**
```markdown
---
title: "Bienvenue dans duplistatus"  # Translated
description: "Un tableau de bord pour surveiller vos sauvegardes Duplicati"  # Translated
# Other fields remain unchanged
---
```

**Body Content Translation:**
- Translate all paragraphs
- **DO NOT translate**: URLs, code blocks, command examples, API endpoints, class names, technical terms that should remain English
- **DO translate**: Headings, descriptions, explanations, UI labels within text

---

### Step 8.3: Verify Translated Files

**Prompt for AI Agent:**
```
After translation, validate that all translated markdown files are syntactically correct and contain required frontmatter.

Check each translated file:
```

```bash
cd /documentation/docs

for locale in fr de es pt-br; do
  echo "=== Checking $locale ==="
  
  # Check for frontmatter in key files
  for file in $locale/intro.md $locale/installation/installation.md; do
    if [ -f "$file" ]; then
      if grep -q "^---" "$file"; then
        echo "✓ $file has frontmatter"
      else
        echo "✗ $file missing frontmatter"
      fi
    else
      echo "✗ $file does not exist"
    fi
  done
done
```

---

## Phase 9: Testing & Quality Assurance (Day 9)

### Step 9.1: Full Build Test

**Prompt for AI Agent:**
```
Perform a complete production build of all locales and check for errors. This is the final build test before deployment.

Execute the full build pipeline:
```

```bash
cd /documentation
pnpm clear
pnpm build:all 2>&1 | tee build.log
```

**Error Check:**
```bash
# Count errors
grep -i "error" build.log | wc -l

# Check for common issues
grep -i "missing" build.log
grep -i "not found" build.log
```

**Success Criteria:**
- Zero errors
- Build completes for all 5 locales
- Total build size reasonable (< 200MB)

---

### Step 9.2: Visual Regression Testing

**Prompt for AI Agent:**
```
For each locale, generate a sitemap and verify key pages render correctly. Use a headless browser or curl to check page content.

Create a test script:
```

```bash
cd /documentation

cat > test-locales.sh << 'EOF'
#!/bin/bash

LOCALES=("en" "fr" "de" "es" "pt-br")
BASE_URL="http://localhost:3000"

# Start server in background
pnpm serve:all &
SERVER_PID=$!

sleep 5

for locale in "${LOCALES[@]}"; do
  echo "=== Testing $locale ==="
  
  # Test main page
  curl -s "$BASE_URL/$locale/" | grep -q "duplistatus" && echo "✓ $locale main page loads" || echo "✗ $locale main page failed"
  
  # Test intro page
  curl -s "$BASE_URL/$locale/intro" | grep -q "duplistatus" && echo "✓ $locale intro loads" || echo "✗ $locale intro failed"
  
  # Test locale dropdown exists
  curl -s "$BASE_URL/$locale/" | grep -q "localeDropdown" && echo "✓ $locale dropdown present" || echo "✗ $locale dropdown missing"
done

# Cleanup
kill $SERVER_PID
EOF

chmod +x test-locales.sh
./test-locales.sh
```

---

### Step 9.3: Link Validation

**Prompt for AI Agent:**
```
Check that internal links between documentation pages work across all locales. Broken links are a common i18n issue.

Run Docusaurus built-in link checker:
```

```bash
cd /documentation
pnpm build:all -- --out-dir test-build

# Check for broken links in build output
grep -r "broken link" test-build/*/ 2>/dev/null || echo "No broken links found"
```

---

## Phase 10: Deployment Configuration (Day 10)

### Step 10.1: Update GitHub Pages Workflow

**Prompt for AI Agent:**
```
The current deployment script pushes only English. Modify the deployment process to handle multiple locales. Create a new deployment script.

Create /documentation/deploy-i18n.sh:
```

```bash
#!/bin/bash
set -e

echo "=== Building all locales ==="
pnpm build:all

echo "=== Preparing GitHub Pages ==="
# The build:all command creates build/ with all locales
# GitHub Pages will serve from build/

echo "=== Deploying to GitHub Pages ==="
# Use Docusaurus deploy which handles gh-pages branch
GIT_USER=wsj-br pnpm deploy

echo "=== Deployment complete ==="
echo "Access your docs at: https://wsj-br.github.io/duplistatus/"
echo "Available locales: /en, /fr, /de, /es, /pt-br"
```

**Make executable:**
```bash
chmod +x /documentation/deploy-i18n.sh
```

---

### Step 10.2: Update Base URL Handling

**Prompt for AI Agent:**
```
Verify the base URL configuration works for all locales. The base URL '/duplistatus/' must be consistent across languages.

Check docusaurus.config.ts for:
```

```typescript
baseUrl: process.env.BASE_URL || '/duplistatus/',
```

**Test with different BASE_URL values:**
```bash
# Test local
cd /documentation
BASE_URL=/ pnpm build --locale fr

# Test production
BASE_URL=/duplistatus/ pnpm build --locale fr
```

---

### Step 10.3: Final Production Build

**Prompt for AI Agent:**
```
Execute the final production build and deployment. This is the last step before going live.

Run the deployment script:
```

```bash
cd /documentation
./deploy-i18n.sh
```

**Post-Deployment Verification:**
```bash
# Wait 2 minutes for GitHub Pages to update
sleep 120

# Test production URLs
curl -s https://wsj-br.github.io/duplistatus/fr/ | grep -q "duplistatus" && echo "✓ French live" || echo "✗ French not accessible"
curl -s https://wsj-br.github.io/duplistatus/de/ | grep -q "duplistatus" && echo "✓ German live" || echo "✗ German not accessible"
curl -s https://wsj-br.github.io/duplistatus/es/ | grep -q "duplistatus" && echo "✓ Spanish live" || echo "✗ Spanish not accessible"
curl -s https://wsj-br.github.io/duplistatus/pt-br/ | grep -q "duplistatus" && echo "✓ Portuguese live" || echo "✗ Portuguese not accessible"
```

---

## Phase 11: Post-Deployment Tasks

### Step 11.1: Create Language Switcher UI Enhancement

**Prompt for AI Agent:**
```
Add visual feedback for language switching. Edit the custom CSS to style the locale dropdown.

Add to /documentation/src/css/custom.css:
```

```css
/* Locale Dropdown Styling */
.navbar__item.dropdown .navbar__link {
  font-weight: 600;
}

.dropdown__menu .dropdown__link {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown__menu .dropdown__link[href="/duplistatus/en/"]::before {
  content: "🇬🇧";
}
.dropdown__menu .dropdown__link[href="/duplistatus/fr/"]::before {
  content: "🇫🇷";
}
.dropdown__menu .dropdown__link[href="/duplistatus/de/"]::before {
  content: "🇩🇪";
}
.dropdown__menu .dropdown__link[href="/duplistatus/es/"]::before {
  content: "🇪🇸";
}
.dropdown__menu .dropdown__link[href="/duplistatus/pt-br/"]::before {
  content: "🇧🇷";
}
```

---

### Step 11.2: Set Up Automated Translation Sync

**Prompt for AI Agent:**
```
Create a GitHub Actions workflow to automatically sync translations with Crowdin on a schedule.

Create /.github/workflows/crowdin-sync.yml:
```

```yaml
name: Crowdin Translation Sync

on:
  schedule:
    - cron: '0 2 * * 1'  # Weekly on Monday at 2 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  synchronize-with-crowdin:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
      
      - name: Install dependencies
        run: cd documentation && pnpm install
      
      - name: Install Crowdin CLI
        run: npm install -g @crowdin/cli
      
      - name: Download translations
        env:
          CROWDIN_PROJECT_ID: ${{ secrets.CROWDIN_PROJECT_ID }}
          CROWDIN_PERSONAL_TOKEN: ${{ secrets.CROWDIN_PERSONAL_TOKEN }}
        run: |
          cd documentation
          crowdin download translations
      
      - name: Commit translations
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'chore: update translations from Crowdin'
          file_pattern: 'docs/* i18n/*'
```

---

### Step 11.3: Create Translation Contribution Guide

**Prompt for AI Agent:**
```
Create documentation for contributors who want to help with translations.

Create /documentation/CONTRIBUTING-TRANSLATIONS.md:
```

```markdown
# Contributing Translations

Thank you for helping translate duplistatus documentation!

## Process

1. **Join Crowdin project**: [Link to be added]
2. **Select language**: Choose from French, German, Spanish, or Portuguese
3. **Translate**: Use Crowdin's web interface
4. **Review**: Wait for proofreader approval
5. **Sync**: Translations are automatically merged weekly

## Guidelines

- Keep technical terms consistent (see glossary below)
- Don't translate code, URLs, or API endpoints
- Preserve markdown formatting
- Use formal tone (Sie/vous/usted)

## Glossary

| English | French | German | Spanish | Portuguese |
|---------|--------|--------|---------|------------|
| backup | sauvegarde | Sicherung | copia de seguridad | backup |
| dashboard | tableau de bord | Dashboard | panel | dashboard |

## Questions?
Open an issue on GitHub or contact @wsj-br
```

---

## Phase 12: Ongoing Maintenance Plan

### Step 12.1: Update Translation Workflow

**Prompt for AI Agent:**
```
Create a workflow document for maintaining translations when English content changes.

Create /documentation/TRANSLATION-WORKFLOW.md:
```

```markdown
# Translation Maintenance Workflow

## When English Documentation Changes

1. **Update source files** in `docs/en/`
2. **Run extraction**: `pnpm write-translations`
3. **Upload to Crowdin**: `crowdin upload sources`
4. **Notify translators**: Mark changed strings for translation
5. **Download translations**: `crowdin download translations`
6. **Test builds**: `pnpm build:all`
7. **Deploy**: `./deploy-i18n.sh`

## Adding New Languages

1. Add locale to `docusaurus.config.ts`
2. Create locale directory: `mkdir docs/new-lang`
3. Copy English files: `cp -r docs/en/* docs/new-lang/`
4. Create i18n files: `pnpm write-translations`
5. Configure Crowdin: Update `crowdin.yml`
6. Upload sources: `crowdin upload sources`
```

---

## Phase 13: Rollback Plan

### Step 13.1: Create Rollback Procedure

**Prompt for AI Agent:**
```
If serious issues are discovered after deployment, execute this rollback plan to revert to English-only version.

Create /documentation/ROLLBACK-PLAN.md:
```

```bash
# ROLLBACK PROCEDURE

# 1. Restore backup configs
cp docusaurus.config.ts.backup docusaurus.config.ts
cp sidebars.ts.backup sidebars.ts
cp package.json.backup package.json

# 2. Restore original directory structure
cd docs
mkdir temp_en
mv en/* temp_en/
rm -rf fr de es pt-br en
mv temp_en/* .
rmdir temp_en

# 3. Clean and rebuild
cd ..
pnpm clear
pnpm build
pnpm deploy

# 4. Notify users of temporary rollback
```

---

## Execution Summary Checklist

**Prompt for AI Agent:**
```
Print a final checklist of all completed tasks and remaining manual actions.
```

```bash
cd /documentation

echo "=== TRANSLATION IMPLEMENTATION CHECKLIST ==="
echo ""
echo "✅ CONFIGURATION"
grep -q "i18n:" docusaurus.config.ts && echo "[x] i18n config added" || echo "[ ] i18n config missing"
grep -q "localeDropdown" docusaurus.config.ts && echo "[x] Locale dropdown added" || echo "[ ] Locale dropdown missing"
echo ""

echo "✅ DIRECTORY STRUCTURE"
[ -d "docs/fr" ] && echo "[x] French directory created" || echo "[ ] French directory missing"
[ -d "docs/de" ] && echo "[x] German directory created" || echo "[ ] German directory missing"
[ -d "docs/es" ] && echo "[x] Spanish directory created" || echo "[ ] Spanish directory missing"
[ -d "docs/pt-br" ] && echo "[x] Portuguese directory created" || echo "[ ] Portuguese directory missing"
echo ""

echo "✅ TRANSLATION FILES"
[ -d "i18n/fr" ] && echo "[x] i18n French files created" || echo "[ ] i18n French missing"
[ -f "crowdin.yml" ] && echo "[x] Crowdin config created" || echo "[ ] Crowdin config missing"
echo ""

echo "✅ BUILD SYSTEM"
grep -q "build:all" package.json && echo "[x] build:all script added" || echo "[ ] build:all script missing"
echo ""

echo "⚠️ MANUAL ACTIONS REQUIRED:"
echo "  1. Create Crowdin project"
echo "  2. Set up GitHub secrets"
echo "  3. Translate Priority 1 docs"
echo "  4. Configure custom domain (optional)"
echo ""
echo "=== END CHECKLIST ==="
```

---

## AI Agent Command Summary

**For quick reference, here are the key commands in execution order:**

```bash
# Phase 1
cp docusaurus.config.ts docusaurus.config.ts.backup
# [Edit docusaurus.config.ts to add i18n config]

# Phase 2
cd docs && mkdir -p en fr de es pt-br && cp -r {*.md,*} en/ 2>/dev/null

# Phase 3
pnpm write-translations

# Phase 4
# [Create crowdin.yml]
# [Create .env.local]

# Phase 5
crowdin upload sources

# Phase 6
pnpm build:all

# Phase 7
./deploy-i18n.sh
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-20  
**AI Agent Version Compatibility:** Docusaurus 3.9.2  
**Human Review Required At:** Phase 4.1, 5.2, 7.1