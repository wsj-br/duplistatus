# Übersetzungswartungs-Workflow {/* #translation-maintenance-workflow */}

Für allgemeine Dokumentationsbefehle (Build, Deployment, Screenshots, README-Generierung) siehe [Dokumentations-Tools](documentation-tools.md).

## Übersicht {/* #overview */}

Die Dokumentation verwendet Docusaurus i18n mit Englisch als Standard-Locale. Die Quelldokumentation befindet sich in `docs/`; Übersetzungen werden unter `i18n/{locale}/` geschrieben. Unterstützte Locales: en-GB (Standard), fr, de, es, pt-BR, hi, zh-Hans.

**AI-Übersetzung** für die App-Benutzeroberfläche, Docusaurus Markdown/JSON, SVG-Assets und **Standard-Benachrichtigungsvorlagen** wird durch [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) aus dem **Repository-Root** behandelt, konfiguriert in `ai-i18n-tools.config.json` (nicht innerhalb von `documentation/`). Setzen Sie `OPENROUTER_API_KEY` beim Ausführen von Übersetzungsbefehlen.

## Wann sich die englische Dokumentation ändert {/* #when-english-documentation-changes */}

1. **Bearbeiten Sie die Quelle** in `documentation/docs/` (nur Englisch).
2. **Docusaurus UI-Strings** (Design-Labels, Navbar, etc.): Falls nötig, führen Sie `pnpm write-translations` in `documentation/` aus, damit `i18n/en/*.json` neue Schlüssel aufnimmt.
3. **Überschriften-IDs**: `pnpm write-heading-ids` (aus `documentation/`).
4. **Übersetzen** Sie aus dem **Repository-Root** (oder verwenden Sie die unten stehenden Verknüpfungen aus `documentation/`):
   - `pnpm i18n:extract` — Aktualisieren Sie `src/locales/strings.json` aus `t('…')` in der Next.js-App.
   - `pnpm i18n:translate:docs` — Übersetzen Sie Markdown/JSON in `documentation/i18n/` entsprechend der Konfiguration.
   - `pnpm i18n:translate:svg` — Übersetzen Sie SVGs unter `documentation/static/img` entsprechend der Konfiguration.
   - `pnpm i18n:translate:json` — Übersetzen Sie Standard-Benachrichtigungsvorlagen in `src/locales/templates/` aus `en-GB.json`.
   - Oder führen Sie alles aus: `pnpm i18n:translate`.
5. **Build**: `cd documentation && pnpm build` (alle Locales).

Innerhalb von `documentation/` sind die gleichen Flows wie `pnpm translate` → Root `i18n:translate` verbunden, plus `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## UI-Pluralformen {/* #ui-plurals */}

Kardinale Pluralformen in der Next.js-App verwenden **ai-i18n-tools**, nicht handgeschriebene `_one` / `_other`-Schlüssel.

Schreiben Sie einen englischen Quellstring (normalerweise den Plural) und übergeben Sie ein **einfaches Objekt-Literal** mit `plurals: true` und einem numerischen `count`:

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

Regeln:

- Verwenden Sie keine `item(s)`-Hedges oder `count === 1 ? t('…') : t('…')`-Paare.
- Unabhängige **numerische** Zählungen benötigen separate `t()`-Aufrufe — eine Pluralachse kann nicht zwei Zahlen flexibilisieren (z. B. 1 erfolgreich und 2 fehlgeschlagen). Konkatenieren Sie die Fragmente:

```tsx
`${t("Tested {{count}} connections:", { plurals: true, count: total })} ` +
  `${t("{{count}} successful,", { plurals: true, count: successCount })} ` +
  `${t("{{count}} failed", { plurals: true, count: failureCount })}`
```

- Nicht-numerische Interpolationen (Namen, Labels, etc.) sind in demselben Pluralstring wie `{{count}}` in Ordnung.
- `pnpm i18n:extract` markiert die Katalogzeile `"plural": true`. `pnpm i18n:translate:ui` füllt CLDR-Formulare aus und schreibt `src/locales/en-GB.json` (nur Pluralschlüssel).
- `src/i18n.ts` und `src/lib/i18n-server.ts` laden diese Datei als `sourcePluralFlatBundle`, sodass englische Singular- und Pluralformen zur Laufzeit aufgelöst werden.

## Standard-Benachrichtigungsvorlagen {/* #default-notification-templates */}

Einstellungen → Vorlagen → **Zurücksetzen** lädt die Standardeinstellungen aus `src/locales/templates/{locale}.json` (verbunden in `src/lib/default-notification-templates.ts`).

1. Bearbeiten Sie nur **`src/locales/templates/en-GB.json`** (Englische Quelle).
2. Führen Sie **`pnpm i18n:translate:json`** (oder **`pnpm i18n:translate`**) aus dem Repository-Root aus.
3. Überprüfen Sie die Unterschiede — Platzhalter wie `{backup_name}` und `{problem_table}` müssen unverändert bleiben; `priority` und `tags` werden von `keyPolicy` in `ai-i18n-tools.config.json` übersprungen.
4. Führen Sie **`pnpm i18n:status`** aus, um die JSON-Blockabdeckung zu sehen.

Siehe die [ai-i18n-tools JSON-Anleitung](https://wsj-br.github.io/ai-i18n-tools/guide/json.html) für Flags (`--locale`, `--force`, etc.).

## Glossar {/* #glossary */}

- Die **UI-Terminologie** für die Dokumentation wird durch `glossary.uiGlossary` in `ai-i18n-tools.config.json` gesteuert, die auf `src/locales/strings.json` verweist (das Katalog, der von `pnpm i18n:extract` erzeugt wird).
- **Überschreibungen** befinden sich in `documentation/glossary-user.csv` (`glossary.userGlossary` in der Konfiguration). Siehe die [ai-i18n-tools-Glossar-Dokumentation](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) für das Spaltenformat.
- Generieren Sie eine CSV-Vorlage: `pnpm i18n:glossary-generate` (Root).

## Cache {/* #cache */}

Der Übersetzungscache für ai-i18n-tools befindet sich unter `.translation-cache/` im Repo-Root (`cacheDir` in `ai-i18n-tools.config.json`). Er ist gitignored. Verwenden Sie `pnpm i18n:status` und die CLI-Flags `--force` / Cache per [ai-i18n-tools-Dokumentation](https://github.com/wsj-br/ai-i18n-tools), wenn Sie eine vollständige Aktualisierung benötigen.

## Überschriften-IDs und Anker {/* #heading-ids-and-anchors */}

Verwenden Sie explizite IDs, damit Links über Sprachen hinweg stabil bleiben. Bevorzugen Sie die MDX-Kommentarsyntax (`pnpm write-heading-ids` verwendet `--syntax mdx-comment`):

```markdown
## This is a heading {/* #this-is-a-heading */}
```

Setzen Sie IDs auf `h2` und darunter. Docusaurus `write-heading-ids` überspringt `h1` (den Seitentitel/Seitenleisten-Titel). `documentation/docusaurus.config.ts` entfernt auch heading-id-Kommentare aus den abgeleiteten Titeln, weil die Docusaurus-Metadatenextraktion immer noch nur klassische `{#id}` entfernt.

```bash
cd documentation
pnpm write-heading-ids
```

## Ignorierlisten {/* #ignore-lists */}

Verwenden Sie `.translate-ignore` im Repo-Root (gleiche Idee wie `.gitignore`), für Pfade, die der Doc-Übersetzer überspringen sollte, falls Sie einen für Ihren Workflow hinzufügen.

## Docusaurus-Theme-JSON {/* #docusaurus-theme-json */}

`pnpm write-translations` extrahiert Docusaurus-UI-Strings in `documentation/i18n/en/`. Der **ai-i18n-tools** `translate-docs`-Schritt (mit `markdownOutput.style: "docusaurus"`) füllt die übersetzten JSON-Dateien unter jeder Sprache neben den Markdown-Dateien, wie in `ai-i18n-tools.config.json` beschrieben.

## Fehlerbehebung {/* #troubleshooting */}

- `OPENROUTER_API_KEY` **nicht festgelegt** — exportieren Sie es oder fügen Sie es in `.env.local` im Repo-Root hinzu.
- **Modell / Qualität** — passen Sie `openrouter.translationModels` und die zugehörigen Optionen in `ai-i18n-tools.config.json` an.
- **Glossar** — bearbeiten Sie `documentation/glossary-user.csv` oder generieren Sie die UI-Strings neu und führen Sie extrahieren + übersetzen erneut aus.

## Hinzufügen einer neuen Sprache {/* #adding-a-new-language */}

1. Fügen Sie die Sprache zu Docusaurus `i18n.locales` und `localeConfigs` in `documentation/docusaurus.config.ts` hinzu.
2. Fügen Sie die gleiche Sprache zu `targetLocales` in `ai-i18n-tools.config.json` (Repo-Root) hinzu.
3. Führen Sie `pnpm i18n:generate-ui-languages` im Root aus, dann die `pnpm i18n:extract` / translate-Befehle, falls nötig.
