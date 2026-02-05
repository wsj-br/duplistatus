---
translation_last_updated: '2026-02-05T00:20:56.088Z'
source_file_mtime: '2026-02-04T21:12:31.724Z'
source_file_hash: f568b098bf1d9861
translation_language: de
source_file_path: development/translation-workflow.md
---
# Workflow zur Verwaltung von Übersetzungen

Für allgemeine Dokumentationsbefehle (Build, Deploy, Screenshots, README-Generierung) siehe [Documentation Tools](documentation-tools.md).

## Übersicht

Die Dokumentation verwendet Docusaurus i18n mit Englisch als Standard-Gebietsschema. Die Quelldokumentation befindet sich in `docs/`; Übersetzungen werden in `i18n/{locale}/docusaurus-plugin-content-docs/current/` geschrieben. Unterstützte Gebietsschemas: en (Standard), fr, de, es, pt-BR.

## Wann sich die englische Dokumentation ändert

1. **Quelldateien aktualisieren** in `docs/`
2. **Extraktion ausführen** (falls sich Docusaurus-UI-Strings geändert haben): `pnpm write-translations`
3. **Glossar aktualisieren** (falls sich Intlayer-Übersetzungen geändert haben): `./scripts/generate-glossary.sh` (von `documentation/` aus ausführen)
4. **KI-Übersetzung ausführen**: `pnpm run translate` (übersetzt Dokumente und SVGs; verwenden Sie `--no-svg` nur für Dokumente)
5. **UI-Strings** (falls sich Docusaurus-UI geändert hat): `pnpm write-translations` extrahiert neue Schlüssel; Dokumente und SVGs werden durch die obigen KI-Skripte übersetzt
6. **Test-Builds**: `pnpm build` (erstellt alle Locales)
7. **Bereitstellung**: Verwenden Sie Ihren Bereitstellungsprozess (z. B. `pnpm deploy` für GitHub Pages)

## Neue Sprachen hinzufügen

1. Fügen Sie die Sprache zu `docusaurus.config.ts` im Array `i18n.locales` hinzu
2. Fügen Sie die Sprachkonfiguration im Objekt `localeConfigs` hinzu
3. Aktualisieren Sie das Suchen-Plugin-Array `language` (verwenden Sie den entsprechenden Sprachcode, z. B. `pt` für pt-BR)
4. Fügen Sie die Sprache zu `translate.config.json` in `locales.targets` hinzu (für KI-Übersetzung)
5. Führen Sie die KI-Übersetzung aus: `pnpm run translate` (übersetzt Dokumente und SVGs)
6. Erstellen Sie UI-Übersetzungsdateien: `pnpm write-translations` (generiert Struktur); übersetzen Sie Dokumente und SVGs mit `pnpm run translate`

## Dateien ignorieren

- **`.translate.ignore`**: Gitignore-ähnliche Muster für Dokumentationsdateien, die während der KI-Übersetzung übersprungen werden sollen. Pfade sind relativ zu `docs/`. Beispiel: `api-reference/*`, `LICENSE.md`
- **`.translate-svg.ignore`**: Muster für SVG-Dateien in `static/img/`, die während `translate:svg` übersprungen werden sollen. Beispiel: `duplistatus_logo.svg`

## Glossarverwaltung

Das Terminologie-Glossar wird automatisch aus intlayer-Wörterbüchern generiert, um die Konsistenz zwischen der Anwendungsbenutzeroberfläche und den Dokumentationsübersetzungen zu gewährleisten.

### Glossar erstellen

```bash
cd documentation
./scripts/generate-glossary.sh
```

Dieses Skript:

- Führt `pnpm intlayer build` im Projektstammverzeichnis aus, um Wörterbücher zu generieren
- Extrahiert Terminologie aus `.intlayer/dictionary/*.json` Dateien
- Generiert `glossary.csv` und `scripts/glossary-table.md`
- Aktualisiert die Glossartabelle in `CONTRIBUTING-TRANSLATIONS.md` (falls diese Datei vorhanden ist)

### Wann neu generieren

- Nach der Aktualisierung von intlayer-Übersetzungen in der Anwendung
- Wann neue technische Begriffe zur Anwendung hinzugefügt werden
- Vor umfangreichen Übersetzungsarbeiten, um Konsistenz zu gewährleisten

## KI-gestützte Übersetzung

Das Projekt umfasst ein automatisiertes Übersetzungssystem mit der OpenRouter API, das Dokumentationen ins Französische, Deutsche, Spanische und Brasilianische Portugiesische übersetzen kann, mit intelligenter Zwischenspeicherung und Glossardurchsetzung.

### Voraussetzungen

1. **OpenRouter API-Schlüssel**: Setzen Sie die Umgebungsvariable `OPENROUTER_API_KEY`:

   ```bash
   export OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

2. **Abhängigkeiten installieren**: Abhängigkeiten befinden sich in `package.json`. Installieren Sie diese mit:

   ```bash
   cd documentation
   pnpm install
   ```

3. **Konfiguration**: Die Datei `translate.config.json` enthält Standardeinstellungen. Sie können Modelle, Gebietsschemas und Pfade nach Bedarf anpassen.

### Schnellhilfe

Um eine Zusammenfassung aller Übersetzungsbefehle und der Optionen des Übersetzungsskripts anzuzeigen:

```bash
pnpm run help
# or
pnpm run translate:help
```

Dies zeigt `TRANSLATION-HELP.md` an.

### Grundlegende Verwendung

**Alle Dokumentation in alle Sprachen übersetzen:**

```bash
cd documentation
pnpm run translate
```

**In ein bestimmtes Gebietsschema übersetzen:**

```bash
pnpm run translate --locale fr    # French
pnpm run translate --locale de    # German
pnpm run translate --locale es    # Spanish
pnpm run translate --locale pt-br # Brazilian Portuguese
```

**Eine bestimmte Datei oder ein Verzeichnis übersetzen:**

```bash
pnpm translate --path docs/intro.md
pnpm translate --path docs/development/
```

**Vorschau ohne Änderungen vornehmen (Testlauf):**

```bash
pnpm run translate:dry-run
```

### Ausgabeprotokolle

Sowohl `translate` als auch `translate:svg` schreiben alle Konsolenausgaben in Protokolldateien in `.translation-cache/`:

- `translate_<timestamp>.log` – vollständige Ausgabe von `pnpm run translate`
- `translate-svg_<timestamp>.log` – vollständige Ausgabe von `pnpm run translate:svg` (eigenständig)

Der Protokollpfad wird zu Beginn jedes Durchlaufs ausgegeben. Protokolle werden in Echtzeit angefügt.

### Cache-Verwaltung

Das Übersetzungssystem verwendet einen zweistufigen Cache (Datei-Ebene und Segment-Ebene), der in `.translation-cache/cache.db` gespeichert ist, um API-Kosten zu minimieren:

**Prüfen Sie den Übersetzungsstatus:**

```bash
pnpm run translate:status
```

Dies generiert eine Tabelle, die den Übersetzungsstatus für alle Dokumentationsdateien anzeigt:

- `✓` = Übersetzt und aktuell (Quellhash stimmt überein)
- `-` = Noch nicht übersetzt
- `●` = Übersetzt aber veraltet (Quelldatei geändert)
- `□` = Verwaist (existiert im Übersetzungsordner, aber nicht in der Quelle)
- `i` = Ignoriert (übersprungen durch `.translate.ignore`)

Das Skript vergleicht `source_file_hash` in den Metadaten der übersetzten Datei mit dem berechneten Hash der Quelldatei, um veraltete Übersetzungen zu erkennen.

**Alle Cache löschen:**

```bash
pnpm translate --clear-cache
```

**Cache für bestimmtes Gebietsschema löschen:**

```bash
pnpm translate --clear-cache fr
```

**Neuübersetzung erzwingen (Datei-Cache löschen, nicht den Übersetzungs-Cache):**

```bash
pnpm translate --force
```

**Cache ignorieren (API-Aufrufe erzwingen, aber neue Übersetzungen trotzdem speichern):**

```bash
pnpm translate --no-cache
```

**Cache bereinigen (verwaiste und veraltete Einträge entfernen):**

```bash
pnpm run translate:cleanup
```

oder

```bash
pnpm run translate:clean
```

**Cache in einer Web-UI bearbeiten:**

```bash
pnpm run translate:edit-cache
```

Dies stellt eine Web-App auf Port 4000 (oder dem nächsten verfügbaren Port) zum Durchsuchen und Bearbeiten des Übersetzungs-Caches bereit. Funktionen: Tabellenansicht mit Filtern (Dateiname, Gebietsschema, source_hash, Quelltext, übersetzter Text), Inline-Bearbeitung von übersetztem Text, Löschen eines einzelnen Eintrags, Löschen aller Übersetzungen für einen Dateipfad, Pagination, dunkles Thema. Ein Symbol zum Einblenden von Links gibt die Quell- und übersetzten Dateipfade im Terminal aus, damit Sie diese in Ihrem Editor öffnen können. Führen Sie den Befehl aus `documentation/` aus.

### SVG-Übersetzung

Die SVG-Übersetzung ist in `pnpm run translate` standardmäßig enthalten (wird nach docs ausgeführt). SVG-Dateien in `static/img/`, deren Namen mit `duplistatus` beginnen, werden übersetzt.

**SVG überspringen** (nur Dokumentation):

```bash
pnpm run translate --no-svg
```

**Nur SVG** (eigenständiges Skript):

```bash
pnpm run translate:svg
```

Optionen: `--locale`, `--path`, `--dry-run`, `--no-cache`, `--force`, `--no-export-png`. Verwendet `.translate-svg.ignore` für Ausschlüsse. Exportiert optional PNG über Inkscape CLI.

### Arbeitsablauf mit KI-Übersetzung

1. **Englische Dokumentation aktualisieren** in `docs/`
2. **Glossar aktualisieren** (falls erforderlich): `./scripts/generate-glossary.sh`
3. **KI-Übersetzung ausführen**: `pnpm run translate` (übersetzt Dokumente und SVGs)
4. **Übersetzungen bestätigen** in `i18n/{locale}/docusaurus-plugin-content-docs/current/` (optional)
5. **Builds testen**: `pnpm build`
6. **Bereitstellen** mit Ihrem Bereitstellungsprozess

### Modellauswahl und Kostenoptimierung

Die Standardkonfiguration verwendet `anthropic/claude-haiku-4.5`. Sie können `translate.config.json` ändern, um verschiedene Modelle zu verwenden:

- **Standard**: `anthropic/claude-haiku-4.5`
- **Fallback**: `google/gemma-3-27b-it`
- **Hoch quality**: `anthropic/claude-sonnet-4`
- **Cost-effective**: `openai/gpt-4o-mini`

**Kostensparmaßnahmen-Strategie:**

1. Erster Durchgang: Verwenden Sie das günstigere Modell (`gpt-4o-mini`) für die erste Übersetzung
2. Qualitätsprüfung: Übersetzen Sie problematische Dateien bei Bedarf erneut mit `claude-sonnet-4`

### Fehlerbehebung

**"OPENROUTER_API_KEY nicht gesetzt"**

- Exportieren Sie die Umgebungsvariable oder fügen Sie sie zu `.env.local` hinzu

**Ratenbegrenzungsfehler**

- Das System enthält automatische Verzögerungen, aber möglicherweise müssen Sie parallele Anfragen reduzieren

**Probleme mit der Übersetzungsqualität**

- Probieren Sie verschiedene Modelle in `translate.config.json` aus
- Hinzufügen Sie weitere Begriffe zu `glossary.csv`

**Cache-Beschädigung**

- Führen Sie `pnpm translate --clear-cache` aus, um zurückzusetzen
- Führen Sie `pnpm run translate:cleanup` aus, um verwaiste Einträge zu entfernen
- Verwenden Sie `pnpm run translate:edit-cache`, um einzelne zwischengespeicherte Übersetzungen zu bearbeiten, ohne neu zu übersetzen

**Debugging OpenRouter-Datenverkehr**

- Debug-Verkehrsprotokollierung ist **standardmäßig aktiviert**. Protokolle werden in `.translation-cache/debug-traffic-<timestamp>.log` geschrieben. Verwenden Sie `--debug-traffic <path>`, um einen benutzerdefinierten Dateinamen anzugeben, oder `--no-debug-traffic` zum Deaktivieren. API-Schlüssel werden nie geschrieben.
- Der Verkehr wird **nur protokolliert, wenn Segmente an die API gesendet werden**. Wenn alle Segmente aus dem Cache bereitgestellt werden (z. B. bei Verwendung von `--force`, das den Datei-Cache löscht, aber nicht den Segment-Cache), werden keine API-Aufrufe durchgeführt und das Protokoll enthält nur einen Header und einen Hinweis. Verwenden Sie `--no-cache`, um API-Aufrufe zu erzwingen und Request/Response-Verkehr zu erfassen. Neue Übersetzungen aus einem `--no-cache`-Lauf werden weiterhin im Cache für zukünftige Läufe geschrieben.
- Beispiel: `pnpm run translate -- --locale pt-BR --debug-traffic my-debug.log --no-cache`

## Verfolgung des Übersetzungsstatus

Verfolgung des Übersetzungsfortschritts mit:

```bash
pnpm run translate:status
```

Dies gibt eine Tabelle und eine Zusammenfassung für alle Dokumentationsdateien aus.
