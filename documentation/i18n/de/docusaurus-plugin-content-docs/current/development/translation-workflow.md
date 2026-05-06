---
translation_last_updated: '2026-05-06T23:20:28.086Z'
source_file_mtime: '2026-05-06T23:18:51.394Z'
source_file_hash: e7d139a531d71a9356831027194544c2e1d3243ed71eb529ff1aafbad09db413
translation_language: de
source_file_path: documentation/docs/development/translation-workflow.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Workflow zur Übersetzungswartung {#translation-maintenance-workflow}

Für allgemeine Dokumentationsbefehle (Build, Deploy, Screenshots, README-Generierung) siehe [Documentation Tools](documentation-tools.md).

## Übersicht {#overview}

Die Dokumentation verwendet Docusaurus i18n mit Englisch als Standardsprache. Die Quelldokumentation befindet sich in `docs/`; Übersetzungen werden unter `i18n/{locale}/` erstellt. Unterstützte Sprachen: en (Standard), fr, de, es, pt-BR.

**KI-Übersetzung** für die App-Benutzeroberfläche, Docusaurus Markdown/JSON und SVG-Ressourcen wird über [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) aus der **Repository-Wurzel** heraus verwaltet und in `ai-i18n-tools.config.json` konfiguriert (nicht innerhalb von `documentation/`). Setzen Sie `OPENROUTER_API_KEY`, wenn Sie Übersetzungsbefehle ausführen.

## Wann sich die englische Dokumentation ändert {#when-english-documentation-changes}

1. **Quelle bearbeiten** in `documentation/docs/` (nur Englisch).
2. **Docusaurus-UI-Strings** (Themenbeschriftungen, Navigationsleiste usw.): falls erforderlich, führen Sie `pnpm write-translations` in `documentation/` aus, damit `i18n/en/*.json` neue Schlüssel übernimmt.
3. **Überschriften-IDs**: `pnpm write-heading-ids` (aus `documentation/`).
4. **Übersetzen** ab dem **Repository-Stammverzeichnis** (oder verwenden Sie die unten aufgeführten Verknüpfungen ab `documentation/`):
   - `pnpm i18n:extract` — aktualisiert `src/locales/strings.json` aus `t('…')` in der Next.js-Anwendung.
   - `pnpm i18n:translate:docs` — übersetzt Markdown/JSON gemäß Konfiguration in `documentation/i18n/`.
   - `pnpm i18n:translate:svg` — übersetzt SVGs unter `documentation/static/img` wie konfiguriert.
   - Oder alles ausführen: `pnpm i18n:translate`.
5. **Erstellen**: `cd documentation && pnpm build` (alle Sprachen).

Von innerhalb `documentation/` aus sind dieselben Abläufe verknüpft wie `pnpm translate` → Wurzel `i18n:translate`, zusätzlich `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## Glossar {#glossary}

- **UI-Fachbegriffe** für die Dokumentation werden über `glossary.uiGlossary` in `ai-i18n-tools.config.json` festgelegt, verweisen auf `src/locales/strings.json` (der Katalog, erzeugt von `pnpm i18n:extract`).
- **Überschreibungen** befinden sich in `documentation/glossary-user.csv` (`glossary.userGlossary` in der Konfiguration). Siehe [ai-i18n-tools Glossardokumentation](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) für das Spaltenformat.
- CSV-Vorlage generieren: `pnpm i18n:glossary-generate` (Wurzel).

## Cache {#cache}

Der Übersetzungscache für ai-i18n-tools befindet sich unter `.translation-cache/` im Stammverzeichnis des Repositorys (`cacheDir` in `ai-i18n-tools.config.json`). Er ist gitignored. Verwenden Sie `pnpm i18n:status` und die `--force`-/Cache-Flags der CLI gemäß der [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools)-Dokumentation, wenn Sie eine vollständige Aktualisierung benötigen.

## Überschrifts-IDs und Anker {#heading-ids-and-anchors}

Verwenden Sie explizite IDs, damit Links über alle Sprachen hinweg stabil bleiben:

```markdown
## This is a heading {#this-is-a-heading}
```

```bash
cd documentation
pnpm write-heading-ids
```

## Ignorierlisten {#ignore-lists}

Verwenden Sie `.translate-ignore` im Stammverzeichnis des Repositorys (ähnlich wie `.gitignore`), um Pfade auszuschließen, die der Dokumentenübersetzer überspringen soll, falls Sie eine für Ihren Workflow hinzufügen.

## Docusaurus-Theme-JSON {#docusaurus-theme-json}

`pnpm write-translations` extrahiert Docusaurus-UI-Texte nach `documentation/i18n/en/`. Der **ai-i18n-tools** `translate-docs`-Schritt (mit `markdownOutput.style: "docusaurus"`) füllt übersetzte JSON-Dateien in jedem Sprachordner neben dem Markdown gemäß `ai-i18n-tools.config.json`.

## Fehlerbehebung {#troubleshooting}

- `OPENROUTER_API_KEY` **nicht gesetzt** — exportieren Sie ihn oder fügen Sie ihn zu `.env.local` im Stammverzeichnis des Repositorys hinzu.
- **Modell / Qualität** — passen Sie `openrouter.translationModels` und verwandte Optionen in `ai-i18n-tools.config.json` an.
- **Glossar** — bearbeiten Sie `documentation/glossary-user.csv` oder generieren Sie die UI-Strings neu und führen Sie anschließend extract + translate erneut aus.

## Hinzufügen einer neuen Sprache {#adding-a-new-language}

1. Fügen Sie das Gebietsschema zu Docusaurus `i18n.locales` und `localeConfigs` in `documentation/docusaurus.config.ts` hinzu.
2. Fügen Sie dasselbe Gebietsschema zu `targetLocales` in `ai-i18n-tools.config.json` (Stammverzeichnis des Repositorys) hinzu.
3. Führen Sie `pnpm i18n:generate-ui-languages` im Stammverzeichnis aus, dann je nach Bedarf `pnpm i18n:extract` / Übersetzungsbefehle.
