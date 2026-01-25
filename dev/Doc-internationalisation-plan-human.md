# Docusaurus Translation Implementation Plan
*Human-Friendly Guide for duplistatus Documentation*

## 📋 Overview

This guide will help you add French, German, Spanish, and Brazilian Portuguese translations to your duplistatus Docusaurus documentation. We'll use Docusaurus's built-in i18n system combined with Crowdin for efficient translation management.

**Total Time Estimate:** 8-10 days (can be parallelized)  
**Difficulty:** Intermediate  
**Result:** Professional multi-language documentation with automated sync

---

## Phase 0: Before You Begin

### ✅ Prerequisites Checklist

Make sure you have:
- **Clean working directory**: `git status` shows no uncommitted changes
- **Working build**: `pnpm build` succeeds without errors
- **Node.js ≥18.0**: Run `node --version` to verify
- **Crowdin account**: Sign up at [crowdin.com](https://crowdin.com) (free for open source)
- **GitHub access**: Repository admin rights

### 💡 Key Decisions

1. **Default language**: English (stays at root or `/en/`)
2. **URL structure**: `/duplistatus/[locale]/` (e.g., `/duplistatus/fr/`)
3. **Translation method**: Crowdin for collaboration + AI pre-translation for speed

---

## Phase 1: Configure i18n in Docusaurus (Day 1)

### Step 1.1: Backup Your Current Setup

**Why:** Safety net in case something goes wrong

```bash
cd documentation
cp docusaurus.config.ts docusaurus.config.ts.backup
cp sidebars.ts sidebars.ts.backup
cp package.json package.json.backup
```

**Verify:** You should see three `.backup` files created

---

### Step 1.2: Add i18n Configuration

**What we're doing:** Telling Docusaurus which languages to support

Open `docusaurus.config.ts` and add this **immediately after line 13** (after `tagline`):

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

**🎯 Verification:** Run `pnpm start` and you shouldn't see any errors yet

---

### Step 1.3: Add Language Switcher to Navbar

**What we're doing:** Adding a dropdown menu so users can switch languages

In `docusaurus.config.ts`, find the `navbar` section and add this to the `items` array:

```typescript
{
  type: 'localeDropdown',
  position: 'right',
  dropdownItemsBefore: [],
  dropdownItemsAfter: [],
},
```

**Where to place it:** After the existing navbar items, but before the search/Github icons

---

### Step 1.4: Update Build Scripts

**What we're doing:** Adding convenience scripts for building all languages

Open `package.json` and add these to the `scripts` section:

```json
{
  "scripts": {
    "start": "docusaurus start",
    "start:fr": "docusaurus start --locale fr",
    "start:de": "docusaurus start --locale de",
    "start:es": "docusaurus start --locale es",
    "start:pt-br": "docusaurus start --locale pt-BR",
    "build:all": "docusaurus build --locale en && docusaurus build --locale fr && docusaurus build --locale de && docusaurus build --locale es && docusaurus build --locale pt-BR",
    "serve:all": "docusaurus serve --dir build",
    "write-translations": "docusaurus write-translations"
  }
}
```

**Tip:** Keep your original scripts - just add these new ones

---

## Phase 2: Restructure Documentation Directories (Day 1-2)

### Step 2.1: Create Locale Folders

**What we're doing:** Organizing files by language

```bash
cd documentation/docs

# Create language directories
mkdir -p en fr de es pt-br

# Move existing docs into 'en' folder
# First, move loose markdown files
mv *.md en/ 2>/dev/null || true

# Then move subdirectories
for dir in installation user-guide migration api-reference development release-notes settings; do
  if [ -d "$dir" ]; then
    mv "$dir" en/
  fi
done
```

**🎯 Checkpoint:** Run `find . -type d | sort` - you should see all directories now under `en/`

---

### Step 2.2: Test English Build

**Why:** Ensure the restructure didn't break anything

```bash
cd /documentation
pnpm start --locale en
```

**Success signs:**
- Server starts on http://localhost:3000
- All pages load correctly
- Sidebar navigation works
- No 404 errors

**If it fails:** Check that all files moved correctly and paths in `sidebars.ts` are still valid

---

## Phase 3: Set Up Translation Infrastructure (Day 2-3)

### Step 3.1: Extract UI Strings

**What we're doing:** Getting all navbar, footer, and UI labels ready for translation

```bash
cd /documentation
pnpm write-translations
```

This creates an `i18n/` directory with JSON files containing all UI text

---

### Step 3.2: Configure Crowdin

**What we're doing:** Setting up the translation management platform

1. **Create `crowdin.yml`** in `/documentation`:

```yaml
project_id_env: CROWDIN_PROJECT_ID
api_token_env: CROWDIN_PERSONAL_TOKEN
preserve_hierarchy: true

files:
  - source: /docs/en/**/*.md
    translation: /docs/%locale%/**/%original_file_name%
    update_option: update_as_unapproved
    
  - source: /i18n/en/code.json
    translation: /i18n/%locale%/code.json
    
  - source: /i18n/en/docusaurus-plugin-content-docs/current.json
    translation: /i18n/%locale%/docusaurus-plugin-content-docs/current.json
    
  languages_mapping:
    locale:
      en: en
      fr: fr
      de: de
      es: es
      pt-BR: pt-br
```

2. **Create `.env.local.template`**:

```bash
# Crowdin Configuration
# Copy this to .env.local and add your credentials

CROWDIN_PROJECT_ID=your_project_id_here
CROWDIN_PERSONAL_TOKEN=your_token_here
```

3. **Get your Crowdin credentials:**
   - Project ID: Find in Project Settings > API
   - Token: Account Settings > API > New Token

4. **Create `.env.local`** with actual values

---

### Step 3.3: Install Crowdin CLI

```bash
npm install -g @crowdin/cli
crowdin --version
```

---

## Phase 4: Initial Translation Setup (Day 3-4)

### Step 4.1: Copy Files for Translation

**What we're doing:** Creating starter files for each language

```bash
cd /documentation/docs

# Copy all English content to each language
for locale in fr de es pt-br; do
  cp -r en/* $locale/
done

# Verify file counts match
echo "English: $(find en -name '*.md' | wc -l) files"
echo "French: $(find fr -name '*.md' | wc -l) files"
```

### Step 4.2: Pre-Translate with Crowdin AI

**In Crowdin web interface:**
1. Go to your project
2. Select all files
3. Click "Pre-translate" → "via AI"
4. Choose all target languages
5. Approve suggestions automatically

This gives you a solid first draft to review

---

### Step 4.3: Manual Review Priority 1 Files

**Focus on these first** (highest user impact):
- `docs/[locale]/intro.md`
- `docs/[locale]/installation/*.md`
- `docs/[locale]/user-guide/*.md`

**Review checklist:**
- [ ] Frontmatter titles translated
- [ ] Technical terms consistent (see glossary)
- [ ] Code blocks untouched
- [ ] Links still functional
- [ ] Images render correctly

---

## Phase 5: Test Your Multi-Language Site (Day 5)

### Step 5.1: Build All Languages

```bash
cd /documentation
pnpm clear
pnpm build:all
```

**Expected result:** Build completes in ~5 minutes, creating `build/` with 5 subdirectories

**Verification:**
```bash
ls build/
# Should show: en, fr, de, es, pt-br
```

---

### Step 5.2: Test Locally

```bash
pnpm serve:all
```

**Manual testing checklist:**
- [ ] Language dropdown appears in navbar
- [ ] Switching languages updates URL (/en/, /fr/, etc.)
- [ ] All pages load in each language
- [ ] Sidebar navigation works
- [ ] Search function works (indexes each language separately)
- [ ] Images display correctly
- [ ] Code blocks preserved exactly

---

### Step 5.3: Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| "Module not found" errors | Check file paths in `sidebars.ts` |
| Build fails for one locale | Run `pnpm build --locale [lang]` to isolate |
| Links go to 404 | Verify `baseUrl` in config |
| Missing translations | Run `pnpm write-translations` again |

---

## Phase 6: Deploy to Production (Day 6)

### Step 6.1: Update Deployment Process

**Create `deploy-i18n.sh`** in `/documentation`:

```bash
#!/bin/bash
set -e

echo "Building all locales..."
pnpm build:all

echo "Deploying to GitHub Pages..."
GIT_USER=wsj-br pnpm deploy

echo "Done! Check https://wsj-br.github.io/duplistatus/"
```

Make it executable: `chmod +x deploy-i18n.sh`

---

### Step 6.2: Deploy

```bash
cd /documentation
./deploy-i18n.sh
```

**Important:** This replaces your current English-only site. The main URL will now show a language chooser or redirect to `/en/`

---

### Step 6.3: Verify Live Deployment

Wait 2-3 minutes for GitHub Pages to update, then check:

```bash
# Test each language
curl -s https://wsj-br.github.io/duplistatus/fr/ | grep -q "duplistatus"
curl -s https://wsj-br.github.io/duplistatus/de/ | grep -q "duplistatus"
# etc...
```

**Manual check in browser:**
- [ ] Main URL loads without errors
- [ ] Language switcher works
- [ ] All 5 languages accessible
- [ ] SEO meta tags show correct language

---

## Phase 7: Ongoing Maintenance (Day 7+)

### Step 7.1: Set Up Automated Sync

**Create GitHub Actions workflow** at `.github/workflows/crowdin-sync.yml`:

```yaml
name: Crowdin Translation Sync

on:
  schedule:
    - cron: '0 2 * * 1'  # Weekly Monday 2 AM
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install -g @crowdin/cli
      - run: crowdin download translations
        env:
          CROWDIN_PROJECT_ID: ${{ secrets.CROWDIN_PROJECT_ID }}
          CROWDIN_PERSONAL_TOKEN: ${{ secrets.CROWDIN_PERSONAL_TOKEN }}
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'chore: sync translations from Crowdin'
```

**Add GitHub Secrets:**
- `CROWDIN_PROJECT_ID`
- `CROWDIN_PERSONAL_TOKEN`

---

### Step 7.2: Update Workflow for New Content

**When you edit English docs:**
1. Make changes in `docs/en/`
2. Run `crowdin upload sources`
3. Translators get notified in Crowdin
4. After translation: `crowdin download translations`
5. Commit changes and deploy

---

### Step 7.3: Monitor Translation Progress

**In Crowdin:**
- Set up **proofreading** for each language
- Enable **translation memory** for consistency
- Use **glossary** for technical terms (backup, dashboard, Duplicati, etc.)

---

## 📊 Progress Tracker

Create this file to track your progress:

```markdown
# Translation Progress

## ✅ Completed
- [x] i18n configuration
- [x] Directory structure
- [x] Crowdin setup
- [ ] UI strings translated
- [ ] Priority 1 docs (intro, installation, user-guide)
- [ ] Priority 2 docs (settings)
- [ ] Priority 3 docs (migration, API)
- [ ] Priority 4 docs (development, release notes)
- [ ] Local testing
- [ ] Production deployment

## 🎯 Current Focus
[Update daily]

## 🚧 Blockers
[Note any issues]
```

---

## 🎓 Best Practices & Tips

### Translation Quality
- **Consistency**: Create a glossary in Crowdin for technical terms
- **Context**: Use Crowdin screenshots feature to show where strings appear
- **Review**: Have native speakers review at least the top 10 most-viewed pages

### Technical Content
- **Don't translate**: Code, URLs, API endpoints, log output, file paths
- **Do translate**: Headings, descriptions, explanations, UI labels, error messages
- **Be careful**: YAML frontmatter values (some are used by code, some are display)

### Performance
- **Build time**: Will increase ~5x (1 min → 5 min)
- **Bundle size**: Will increase ~4-5x (one bundle per language)
- **Search**: Each language gets its own search index

---

## 🚨 Troubleshooting Guide

### Build fails with "Cannot find module"
- Check that all files copied correctly: `find docs/fr -name "*.md" | wc -l` should match English

### Language dropdown doesn't appear
- Verify `navbar.items` includes `localeDropdown` type
- Check browser console for JS errors

### Translations not showing
- Confirm files exist: `ls i18n/fr/code.json`
- Run `pnpm write-translations` again
- Clear cache: `pnpm clear`

### Crowdin upload fails
- Verify `.env.local` credentials
- Check project ID in Crowdin URL
- Ensure token has "Upload" permission

---

## 🎉 Completion Checklist

When you're done, verify:

- [ ] All 5 languages build successfully: `pnpm build:all`
- [ ] Language switcher visible on all pages
- [ ] URLs correctly formatted: `/duplistatus/[locale]/path`
- [ ] Search works in each language
- [ ] GitHub Pages deployed and accessible
- [ ] Crowdin auto-sync configured
- [ ] `TRANSLATION-STATUS.md` shows ≥80% completion
- [ ] Team members can contribute via Crowdin

---

**Questions or issues?** Check the Docusaurus i18n docs at https://docusaurus.io/docs/i18n/introduction

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-20  
**Compatible With:** Docusaurus 3.9.2, Crowdin CLI 3.x