# Übersetzungs-Wartungsworkflow {/* #translation-maintenance-workflow */}

Für allgemeine Dokumentationsbefehle (Erstellen, Bereitstellen, Screenshots, README-Generierung) siehe [Dokumentationstools](documentation-tools.md).

## Übersicht {/* #overview */}

Die Dokumentation verwendet Docusaurus i18n mit Englisch als Standard-Gebietsschema. Die Quelldokumentation befindet sich in `docs/`; Übersetzungen werden unter `i18n/{locale}/` erstellt. Unterstützte Gebietsschemas: en-GB (Standard), fr, de, es, pt-BR, hi, zh-Hans.

**KI-Übersetzung** für die App-Benutzeroberfläche, Docusaurus Markdown/JSON, SVG-Assets und **Standard-Benachrichtigungsvorlagen** wird von [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) aus der **Repository-Wurzel** behandelt, konfiguriert in `ai-i18n-tools.config.json` (nicht innerhalb von `documentation/`). Legen Sie `OPENROUTER_API_KEY` fest, wenn Sie Übersetzungsbefehle ausführen.

Um einen unveröffentlichten Checkout auf derselben Maschine zu testen (Standard `../ai-i18n-tools`), wechseln Sie die Abhängigkeit mit `pnpm i18n:tools --local` oder `./scripts/link-ai-i18n-tools.sh --local`. Dadurch werden sowohl die CLI (`pnpm i18n:*`) als auch der `ai-i18n-tools/runtime`-Import verknüpft. Erstellen Sie das Tools-Paket nach Quelländerungen neu (`pnpm build` in diesem Checkout). Stellen Sie das neueste npm-Paket mit `--remote` wieder her. Committen Sie nicht den `link:`-Spezifikator.

## Wann sich die englische Dokumentation ändert {/* #when-english-documentation-changes */}

1. **Quelle bearbeiten** in `documentation/docs/` (nur Englisch).
2. **Docusaurus UI-Zeichenfolgen** (Design-Bezeichnungen, Navigationsleiste usw.): falls erforderlich, führen Sie `pnpm write-translations` in `documentation/` aus, damit `i18n/en/*.json` neue Schlüssel übernimmt.
3. **Überschriften-IDs**: `pnpm write-heading-ids` (aus `documentation/`).
4. **Übersetzen** aus der **Repository-Wurzel** (oder verwenden Sie die unten stehenden Verknüpfungen aus `documentation/`):
   - `pnpm i18n:extract` — aktualisiert `src/locales/strings.json` aus `t('…')` in der Next.js-App.
   - `pnpm i18n:translate:docs` — übersetzt Markdown/JSON in `documentation/i18n/` gemäß Konfiguration.
   - `pnpm i18n:translate:svg` — übersetzt SVGs unter `documentation/static/img` wie konfiguriert.
   - `pnpm i18n:translate:json` — übersetzt Standard-Benachrichtigungsvorlagen in `src/locales/templates/` aus `en-GB.json`.
   - Oder alles ausführen: `pnpm i18n:translate`.
5. **Erstellen**: `cd documentation && pnpm build` (alle Gebietsschemas).

Innerhalb von `documentation/` sind dieselben Abläufe wie `pnpm translate` → Wurzel `i18n:translate` verdrahtet, zusätzlich `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## UI-Pluralformen {/* #ui-plurals */}

Kardinal-Pluralformen in der Next.js-App verwenden **ai-i18n-tools**, keine manuell geschriebenen `_one` / `_other`-Schlüssel.

Schreiben Sie eine englische Quellzeichenfolge (normalerweise die Pluralform) und übergeben Sie ein **einfaches Objekt-Literal** mit `plurals: true` und einer numerischen `count`:

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

Regeln:

- Verwenden Sie keine `item(s)`-Unsicherheiten oder `count === 1 ? t('…') : t('…')`-Paare.
- Unabhängige **numerische** Zählungen benötigen separate `t()`-Aufrufe — eine Pluralachse kann nicht zwei Zahlen flexibel anpassen (zum Beispiel 1 erfolgreich und 2 fehlgeschlagen). Verketten Sie die Fragmente:

```tsx
`${t("Tested {{count}} connections:", { plurals: true, count: total })} ` +
  `${t("{{count}} successful,", { plurals: true, count: successCount })} ` +
  `${t("{{count}} failed", { plurals: true, count: failureCount })}`
```

- Nicht-numerische Interpolationen (Namen, Bezeichnungen usw.) sind in derselben Pluralzeichenfolge wie `{{count}}` zulässig.
- `pnpm i18n:extract` markiert die Katalogzeile `"plural": true`. `pnpm i18n:translate:ui` füllt CLDR-Formen aus und schreibt `src/locales/en-GB.json` (nur Pluralschlüssel).
- `src/i18n.ts` und `src/lib/i18n-server.ts` laden diese Datei als `sourcePluralFlatBundle`, sodass englische Singular-/Pluralformen zur Laufzeit aufgelöst werden.

## Standard-Benachrichtigungsvorlagen {/* #default-notification-templates */}

Einstellungen → Vorlagen → **Zurücksetzen** lädt Standards aus `src/locales/templates/{locale}.json` (verdrahtet in `src/lib/default-notification-templates.ts`).

1. Bearbeiten Sie nur **`src/locales/templates/en-GB.json`** (englische Quelle).
2. Führen Sie **`pnpm i18n:translate:json`** (oder **`pnpm i18n:translate`**) aus der Repository-Wurzel aus.
3. Überprüfen Sie Diffs — Platzhalter wie `{backup_name}` und `{problem_table}` müssen unverändert bleiben; `priority` und `tags` werden von `keyPolicy` in `ai-i18n-tools.config.json` übersprungen.
4. Führen Sie **`pnpm i18n:status`** aus, um JSON-Blockabdeckung zu sehen.

Siehe [ai-i18n-tools JSON-Leitfaden](https://wsj-br.github.io/ai-i18n-tools/guide/json.html) für Flags (`--locale`, `--force` usw.).

## Glossar {/* #glossary */}

- **UI-Terminologie** für die Dokumentation wird durch `glossary.uiGlossary` in `ai-i18n-tools.config.json` bestimmt, mit Verweis auf `src/locales/strings.json` (der Katalog, erstellt von `pnpm i18n:extract`).
- **Überschreibungen** befinden sich in `documentation/glossary-user.csv` (`glossary.userGlossary` in der Konfiguration). Siehe [ai-i18n-tools Glossardokumentation](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) für das Spaltenformat.
- Generiere eine CSV-Vorlage: `pnpm i18n:glossary-generate` (Root).

## Cache {/* #cache */}

Der Übersetzungscache für ai-i18n-tools befindet sich unter `.translation-cache/` im Repository-Root (`cacheDir` in `ai-i18n-tools.config.json`). Er ist gitignored. Verwenden Sie `pnpm i18n:status` und die CLI-Optionen `--force` / Cache-Flags gemäß der [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools)-Dokumentation, wenn Sie eine vollständige Aktualisierung benötigen.

## Überschriften-IDs und Anker {/* #heading-ids-and-anchors */}

Verwenden Sie explizite IDs, damit Links über Sprachen hinweg stabil bleiben. Bevorzugen Sie die MDX-Kommentarsyntax (`pnpm write-heading-ids` verwendet `--syntax mdx-comment`):

```markdown
## This is a heading {/* #this-is-a-heading */}
```

Platzieren Sie IDs auf `h2` und darunter. Docusaurus `write-heading-ids` überspringt `h1` (den Seitentitel / Seitenleistentitel). `documentation/docusaurus.config.ts` entfernt auch Überschriften-ID-Kommentare aus abgeleiteten Titeln, da die Docusaurus-Metadatenerfassung immer noch nur klassische `{#id}` entfernt.

```bash
cd documentation
pnpm write-heading-ids
```

## Ignorierlisten {/* #ignore-lists */}

Verwenden Sie `.translate-ignore` im Repository-Root (gleiche Idee wie `.gitignore`) für Pfade, die der Dokumentationsübersetzer überspringen soll, falls Sie eine solche Liste für Ihren Workflow hinzufügen.

## Docusaurus Theme JSON {/* #docusaurus-theme-json */}

`pnpm write-translations` extrahiert Docusaurus-Benutzeroberflächenzeichenketten nach `documentation/i18n/en/`. Der **ai-i18n-tools** `translate-docs`-Schritt (mit `markdownOutput.style: "docusaurus"`) füllt übersetzte JSON-Dateien unterhalb jedes Gebietsschemas neben Markdown ein, gemäß `ai-i18n-tools.config.json`.

## Problembehandlung {/* #troubleshooting */}

- `OPENROUTER_API_KEY` **nicht festgelegt** — exportieren Sie es oder fügen Sie es zu `.env.local` im Repository-Root hinzu.
- **Modell / Qualität** — passen Sie `openrouter.translationModels` und verwandte Optionen in `ai-i18n-tools.config.json` an.
- **Glossar** — bearbeiten Sie `documentation/glossary-user.csv` oder generieren Sie Benutzeroberflächenelemente neu und führen Sie Extraktion + Übersetzung erneut aus.

## Hinzufügen einer neuen Sprache {/* #adding-a-new-language */}

1. Fügen Sie das Gebietsschema zu Docusaurus `i18n.locales` und `localeConfigs` in `documentation/docusaurus.config.ts` hinzu.
2. Fügen Sie dasselbe Gebietsschema zu `targetLocales` in `ai-i18n-tools.config.json` hinzu (Repository-Root).
3. Führen Sie `pnpm i18n:generate-ui-languages` im Root aus, danach `pnpm i18n:extract` / Übersetzungsbefehle nach Bedarf.
