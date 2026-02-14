# Translation Workflow – Command Summary

## Commands (run from documentation/)

| Command                          | Description                                               |
|----------------------------------|-----------------------------------------------------------|
| `pnpm run translate`             | Translate docs, JSON UI strings, and SVGs to all locales  |
| `pnpm run translate:svg`         | SVG-only translation (standalone)                         |
| `pnpm run translate:status`      | Check translation status (✓ up-to-date, ● outdated, etc.) |
| `pnpm run translate:help`        | Show this summary                                         |
| `pnpm run translate:glossary-ui` | Generate glossary-ui.csv from intlayer dictionaries       |
| `pnpm run translate:edit-cache`  | Web UI to browse/edit translation cache (port 4000)       |
| `pnpm run translate:cleanup`     | Remove orphaned and stale cache entries                   |

## Glossary

- **glossary-ui.csv** – Auto-generated from intlayer dictionaries (run `translate:glossary-ui` after UI translation changes)
- **glossary-user.csv** – Optional overrides; columns: `en`, `locale`, `translation`; use `*` for locale to apply to all locales; entries take precedence over glossary-ui.csv

## Translate script options

```bash
Usage: translate [options]

Translate Docusaurus documentation using OpenRouter LLM API

Options:
  -l, --locale <locale>   Translate to specific locale only
  -p, --path <path>       Translate specific file or directory (recursively
                          processes all .md/.mdx files in directory)
  --dry-run               Show what would be translated without making changes
  --no-cache              Ignore cache (force API calls) but still persist new
                          translations
  --force                 Force re-translation by clearing file cache
  -v, --verbose           Show detailed output
  --stats                 Show cache statistics and exit
  --clear-cache [locale]  Clear translation cache
  --debug-traffic [path]  Log OpenRouter request/response to a file (on by
                          default; pass path to use custom filename) (default:
                          true)
  --no-debug-traffic      Disable debug traffic logging
  --no-svg                Skip SVG translation (docs only)
  --no-export-png         Skip Inkscape PNG export after SVG translation
  --no-batch              Use single-segment translation instead of batch (one
                          API call per segment)
  --no-json               Skip JSON translation (i18n UI strings) [default: false]
  -c, --config <path>     Path to config file
  -h, --help              Display help for command
```
