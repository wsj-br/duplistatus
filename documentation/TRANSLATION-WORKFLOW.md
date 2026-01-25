# Translation Maintenance Workflow

## When English Documentation Changes

1. **Update source files** in `docs/en/`
2. **Run extraction**: `pnpm write-translations` (updates translation keys)
3. **Update glossary** (if intlayer translations changed): `./scripts/generate-glossary.sh`
4. **Upload to Crowdin**: `crowdin upload sources`
5. **Import glossary** (if updated): Upload `glossary.csv` to Crowdin Glossary
6. **Notify translators**: Mark changed strings for translation in Crowdin
7. **Download translations**: `crowdin download translations` (or wait for automated weekly sync)
8. **Test builds**: `pnpm build:all`
9. **Deploy**: `./deploy-i18n.sh`

## Adding New Languages

1. Add locale to `docusaurus.config.ts` in the `i18n.locales` array
2. Add locale config in `localeConfigs` object
3. Update search plugin `language` array (use appropriate language code)
4. Create locale directory: `mkdir docs/new-lang`
5. Copy English files: `cp -r docs/en/* docs/new-lang/`
6. Create i18n files: `pnpm write-translations`
7. Copy translation files: `cp -r i18n/en/* i18n/new-lang/`
8. Configure Crowdin: Update `crowdin.yml` with new locale mapping
9. Upload sources: `crowdin upload sources`

## Manual Translation (Without Crowdin)

If you prefer to translate manually:

1. Edit files in `docs/[locale]/` directories
2. Edit UI strings in `i18n/[locale]/code.json`
3. Edit sidebar labels in `i18n/[locale]/docusaurus-plugin-content-docs/current.json`
4. Test: `pnpm build --locale [locale]`
5. Deploy: `./deploy-i18n.sh`

## Glossary Management

The terminology glossary is automatically generated from intlayer dictionaries to maintain consistency between the application UI and documentation translations.

### Generating the Glossary

```bash
cd documentation
./scripts/generate-glossary.sh
```

This script:
- Extracts terminology from `.intlayer/dictionary/*.json` files
- Generates `glossary.csv` in Crowdin format
- Updates the glossary table in `CONTRIBUTING-TRANSLATIONS.md`

### When to Regenerate

- After updating intlayer translations in the application
- When adding new technical terms to the application
- Before major translation work to ensure consistency

### Importing to Crowdin

After generating the glossary:

1. **Review** `glossary.csv` to ensure all terms are correct
2. **Import to Crowdin**:
   - Via Web UI: Project → Glossary → Import → Upload `glossary.csv`
   - Or via CLI: `crowdin glossary upload --file glossary.csv` (if supported)
3. **Verify** that Crowdin recognizes the glossary terms

Crowdin will use the glossary to suggest consistent translations automatically.

## Translation Status Tracking

Track translation progress in `TRANSLATION-STATUS.md` (create if needed):

```markdown
| File     | Word Count | FR  | DE   | ES  | PT-BR  |
|----------|------------|---- |------|-----|--------|
| intro.md | XXX        | ✅  |  🔄 | ☐   | ☐     |

Legend: ☐ Not Started, 🔄 In Progress, ✅ Complete
```
