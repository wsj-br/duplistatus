# Crowdin CLI Usage Guide

## Prerequisites

1. **Crowdin CLI is installed**: ✅ (version 4.12.0)
2. **Crowdin project created**: Create at https://crowdin.com
3. **Credentials configured**: Set up `.env.local` file

## Setup Steps

### 1. Create Crowdin Project

1. Go to https://crowdin.com and sign in
2. Click "Create Project"
3. Project name: `duplistatus-docs`
4. Source language: English
5. Target languages: French, German, Spanish, Portuguese (Brazil)
6. Project type: Documentation

### 2. Get Credentials

1. **Project ID**: 
   - Go to your project → Settings → API
   - Copy the "Project ID"

2. **Personal Access Token**:
   - Go to https://crowdin.com/settings#api-key
   - Click "Create Token"
   - Copy the token (you'll only see it once!)

### 3. Configure Environment

```bash
cd documentation

# Copy the template
cp .env.local.template .env.local

# Edit .env.local and add your credentials
nano .env.local  # or use your preferred editor
```

Fill in:
```bash
CROWDIN_PROJECT_ID=your_actual_project_id
CROWDIN_PERSONAL_TOKEN=your_actual_token
```

## Common Commands

### Upload Source Files

Upload all English source files (markdown and JSON) to Crowdin:

```bash
cd documentation
export $(cat .env.local | grep -v '^#' | grep -v '^$' | xargs)
crowdin upload sources
```

This will:
- Upload all files from `docs/en/**/*.md`
- Upload translation files from `i18n/en/**/*.json`
- Create translation tasks in Crowdin

### Download Translations

After translations are completed in Crowdin, download them:

```bash
cd documentation
export $(cat .env.local | grep -v '^#' | grep -v '^$' | xargs)
crowdin download translations
```

This will:
- Download translated markdown files to `docs/[locale]/`
- Download translated JSON files to `i18n/[locale]/`
- Overwrite placeholder files

### Check Status

Check what files are in Crowdin and their translation status:

```bash
crowdin status
```

### List Files

See all files in your Crowdin project:

```bash
crowdin list files
```

### Upload Translations (Manual)

If you've translated files locally and want to upload them:

```bash
crowdin upload translations
```

### Sync (Upload + Download)

Do both upload and download in one command:

```bash
crowdin sync
```

## Workflow

### Initial Setup (First Time)

```bash
# 1. Set up credentials in .env.local
cp .env.local.template .env.local
# Edit .env.local with your credentials

# 2. Upload source files
crowdin upload sources

# 3. In Crowdin UI: Translate or use AI pre-translate

# 4. Download translations
crowdin download translations

# 5. Test build
pnpm build:all
```

### Regular Updates

When English documentation changes:

```bash
# 1. Update English files in docs/en/

# 2. Extract new translation keys (if config changed)
pnpm write-translations

# 3. Upload updated sources
crowdin upload sources

# 4. Wait for translations (or translate yourself)

# 5. Download translations
crowdin download translations

# 6. Build and deploy
pnpm build:all
./deploy-i18n.sh
```

## Troubleshooting

### "command not found"

If `crowdin` command is not found:
```bash
npm install -g @crowdin/cli
```

### "Required option 'api_token' is missing" or "Required option 'project_id' is missing"

Crowdin CLI doesn't automatically load `.env.local` files. You have two options:

**Option 1: Use the helper scripts (easiest)**
```bash
./crowdin-upload.sh upload sources
./crowdin-download.sh
```

**Option 2: Export variables manually before each command**
```bash
export $(cat .env.local | grep -v '^#' | grep -v '^$' | xargs)
crowdin upload sources
```

### "Project not found" or Authentication errors

- Check `.env.local` exists and has correct credentials
- Verify Project ID matches your Crowdin project
- Verify Personal Token is valid (regenerate if needed)

### Files not uploading

- Check `crowdin.yml` configuration
- Verify file paths in `crowdin.yml` match your directory structure
- Run `crowdin upload sources --dry-run` to see what would be uploaded

### Translations not downloading

- Check translation status in Crowdin UI
- Ensure translations are approved (if approval workflow is enabled)
- Try `crowdin download translations --skip-untranslated-strings=false`

## Configuration File

The `crowdin.yml` file defines:
- Which files to upload (source files)
- Where to place translations (translation paths)
- Locale mappings (Crowdin codes → Docusaurus paths)

**Important**: The `languages_mapping` section maps Crowdin's locale codes to Docusaurus paths:
- `fr-FR` → `fr`
- `de-DE` → `de`
- `es-ES` → `es`
- `pt-BR` → `pt-BR`

This is necessary because Crowdin uses full locale codes (fr-FR, de-DE) but Docusaurus expects short codes (fr, de). Note that `pt-BR` is kept as-is to match the Docusaurus locale configuration.

You typically don't need to edit this unless adding new languages.

## Next Steps

1. Create Crowdin project
2. Set up `.env.local` with credentials
3. Run `crowdin upload sources`
4. Translate in Crowdin UI (or use AI pre-translate)
5. Run `crowdin download translations`
6. Test: `pnpm build:all`
