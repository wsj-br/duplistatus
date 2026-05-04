---
translation_last_updated: '2026-04-18T00:02:50.698Z'
source_file_mtime: '2026-04-16T19:04:53.276Z'
source_file_hash: 5ab3aefe73273ae2660374b90a091f43326249c300a85e0a531363030a9ca392
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
2. **Docusaurus-UI-Texte** (Themenbeschriftungen, Navigationsleiste usw.): falls erforderlich, führen Sie `pnpm write-translations` in `documentation/` aus, damit `i18n/en/*.json` neue Schlüssel erfasst.
3. **Überschrifts-IDs**: `pnpm write-heading-ids` (aus `documentation/`).
4. **Übersetzen** von der **Repository-Wurzel** aus (oder verwenden Sie die folgenden Verknüpfungen aus `documentation/`):
   - `pnpm i18n:extract` — aktualisiert `src/locales/strings.json` aus `t('…')` in der Next.js-App.
   - `pnpm i18n:translate:docs` — übersetzt Markdown/JSON in `documentation/i18n/` gemäß Konfiguration.
   - `pnpm i18n:translate:svg` — übersetzt SVGs unter `documentation/static/img` wie konfiguriert.
   - Oder alles auf einmal ausführen: `pnpm i18n:translate`.
5. **Erstellen**: `cd documentation && pnpm build` (alle Sprachen).

Von innerhalb `documentation/` aus sind dieselben Abläufe verknüpft wie `pnpm translate` → Wurzel `i18n:translate`, zusätzlich `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## Glossar {#glossary-management}

- **UI-Fachbegriffe** für die Dokumentation werden über `glossary.uiGlossary` in `ai-i18n-tools.config.json` festgelegt, verweisen auf `src/locales/strings.json` (der Katalog, erzeugt von `pnpm i18n:extract`).
- **Überschreibungen** befinden sich in `documentation/glossary-user.csv` (`glossary.userGlossary` in der Konfiguration). Siehe [ai-i18n-tools Glossardokumentation](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) für das Spaltenformat.
- CSV-Vorlage generieren: `pnpm i18n:glossary-generate` (Wurzel).

## Cache {#cache-management}

Der Übersetzungscache für ai-i18n-tools befindet sich unter **`.translation-cache/`** in der Repository-Wurzel (`cacheDir` in `ai-i18n-tools.config.json`). Er ist gitignored. Verwenden Sie `pnpm i18n:status` und die CLI-Optionen `--force` / Cache-Flags gemäß [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools)-Dokumentation, wenn ein vollständiges Aktualisieren erforderlich ist.

## Überschrifts-IDs und Anker {#heading-ids-and-anchors}

Verwenden Sie explizite IDs, damit Links über alle Sprachen hinweg stabil bleiben:

```markdown
## This is a heading {#this-is-a-heading}
```

```bash
cd documentation
pnpm write-heading-ids
```

## Ignorierlisten {#ignore-files}

Verwenden Sie **`.translate-ignore`** in der Repository-Wurzel (gleiche Idee wie `.gitignore`), um Pfade auszuschließen, die der Dokumentenübersetzer überspringen soll, falls Sie eine für Ihren Workflow hinzufügen.

## Docusaurus-Thema-JSON {#ui-strings-translation-json}

`pnpm write-translations` extrahiert Docusaurus-UI-Texte nach `documentation/i18n/en/`. Der **ai-i18n-tools** `translate-docs`-Schritt (mit `markdownOutput.style: "docusaurus"`) füllt übersetzte JSON-Dateien in jedem Sprachordner neben dem Markdown gemäß `ai-i18n-tools.config.json`.

## Fehlerbehebung {#troubleshooting}

- **`OPENROUTER_API_KEY` nicht gesetzt** — exportieren Sie es oder fügen Sie es `.env.local` in der Repository-Wurzel hinzu.
- **Modell / Qualität** — passen Sie `openrouter.translationModels` und verwandte Optionen in `ai-i18n-tools.config.json` an.
- **Glossar** — bearbeiten Sie `documentation/glossary-user.csv` oder generieren Sie die UI-Texte neu und führen Sie erneut extract + translate aus.

## Eine neue Sprache hinzufügen {#adding-new-languages}

1. Fügen Sie das Gebietsschema zu Docusaurus `i18n.locales` und `localeConfigs` in `documentation/docusaurus.config.ts` hinzu.
2. Fügen Sie dasselbe Gebietsschema zu `targetLocales` in **`ai-i18n-tools.config.json`** (Repository-Wurzel) hinzu.
3. Führen Sie `pnpm i18n:generate-ui-languages` in der Wurzel aus, dann `pnpm i18n:extract` / Übersetzungsbefehle nach Bedarf.
