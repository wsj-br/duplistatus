# Workflow zur Übersetzungswartung {#translation-maintenance-workflow}

Für allgemeine Dokumentationsbefehle (Build, Deploy, Screenshots, README-Generierung) siehe [Documentation Tools](documentation-tools.md).

## Übersicht {#overview}

Die Dokumentation verwendet Docusaurus i18n mit Englisch als Standard-Locale. Die Quelldokumentation befindet sich in `docs/`; Übersetzungen werden unter `i18n/{locale}/` erstellt. Unterstützte Locales: en-GB (Standard), fr, de, es, pt-BR, hi, zh-Hans.

**AI-Übersetzung** für die App-Benutzeroberfläche, Docusaurus-Markdown/JSON, SVG-Assets und **Standardbenachrichtigungsvorlagen** wird durch [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) aus dem **Repository-Root** behandelt, konfiguriert in `ai-i18n-tools.config.json` (nicht innerhalb von `documentation/`). Setzen Sie `OPENROUTER_API_KEY` beim Ausführen von Übersetzungsbefehlen.

## Wann sich die englische Dokumentation ändert {#when-english-documentation-changes}

1. **Quelle bearbeiten** in `documentation/docs/` (nur Englisch).
2. **Docusaurus-UI-Strings** (Themenbeschriftungen, Navigationsleiste usw.): falls erforderlich, führen Sie `pnpm write-translations` in `documentation/` aus, damit `i18n/en/*.json` neue Schlüssel übernimmt.
3. **Überschriften-IDs**: `pnpm write-heading-ids` (aus `documentation/`).
4. **Übersetzen** ab dem **Repository-Stammverzeichnis** (oder verwenden Sie die unten aufgeführten Verknüpfungen ab `documentation/`):
   - `pnpm i18n:extract` — Aktualisieren Sie `src/locales/strings.json` aus `t('…')` in der Next.js-App.
   - `pnpm i18n:translate:docs` — Übersetzen Sie Markdown/JSON in `documentation/i18n/` gemäß Konfiguration.
   - `pnpm i18n:translate:svg` — Übersetzen Sie SVGs unter `documentation/static/img` gemäß Konfiguration.
   - `pnpm i18n:translate:json` — Übersetzen Sie Standardbenachrichtigungsvorlagen in `src/locales/templates/` aus `en-GB.json`.
   - Oder führen Sie alles aus: `pnpm i18n:translate`.
5. **Build**: `cd documentation && pnpm build` (alle Sprachversionen).

Von innerhalb `documentation/` aus sind dieselben Abläufe verknüpft wie `pnpm translate` → Wurzel `i18n:translate`, zusätzlich `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## UI Mehrzahl {#ui-plurals}

Kardinale Mehrzahl in der Next.js-App verwenden **ai-i18n-tools**, nicht handgeschriebene `_one` / `_other`-Schlüssel.

Schreiben Sie einen englischen Quellstring (meistens die Mehrzahl) und übergeben Sie ein **einfaches Objektliteral** mit `plurals: true` und einem numerischen `count`:

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

Regeln:

- Verwenden Sie keine `item(s)` Hedges oder `count === 1 ? t('…') : t('…')` Paare.
- Unabhängige **numerische** Zählungen benötigen separate `t()` Aufrufe — eine pluralisierte Achse kann nicht zwei Zahlen flexibel handhaben (zum Beispiel 1 erfolgreich und 2 Fehlgeschlagen). Fügen Sie die Fragmente zusammen:

```tsx
`${t("Tested {{count}} connections:", { plurals: true, count: total })} ` +
  `${t("{{count}} successful,", { plurals: true, count: successCount })} ` +
  `${t("{{count}} failed", { plurals: true, count: failureCount })}`
```

- Nicht-numerische Interpolationen (Namen, Bezeichnungen usw.) sind in demselben pluralen String wie `{{count}}` in Ordnung.
- `pnpm i18n:extract` markiert die Katalogzeile `"plural": true`. `pnpm i18n:translate:ui` füllt CLDR-Formulare aus und schreibt `src/locales/en-GB.json` (nur plurale Schlüssel).
- `src/i18n.ts` und `src/lib/i18n-server.ts` laden diese Datei als `sourcePluralFlatBundle`, sodass Englisch Singular/Plural zur Laufzeit aufgelöst wird.

## Standardbenachrichtigungsvorlagen {#default-notification-templates}

Einstellungen → Vorlagen → **Zurücksetzen** lädt die Standardeinstellungen aus `src/locales/templates/{locale}.json` (eingebunden in `src/lib/default-notification-templates.ts`).

1. Bearbeiten Sie nur **`src/locales/templates/en-GB.json`** (Englische Quelle).
2. Führen Sie **`pnpm i18n:translate:json`** (oder **`pnpm i18n:translate`**) aus dem Repository-Root aus.
3. Überprüfen Sie die Unterschiede — Platzhalter wie `{backup_name}` und `{problem_table}` müssen unverändert bleiben; `priority` und `tags` werden von `keyPolicy` in `ai-i18n-tools.config.json` übersprungen.
4. Führen Sie **`pnpm i18n:status`** aus, um die JSON-Blockabdeckung zu sehen.

Siehe die [ai-i18n-tools JSON-Anleitung](https://wsj-br.github.io/ai-i18n-tools/guide/json.html) für Flags (`--locale`, `--force`, etc.).

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
