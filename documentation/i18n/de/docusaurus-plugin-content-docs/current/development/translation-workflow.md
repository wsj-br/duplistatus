---
translation_last_updated: '2026-02-15T20:57:35.391Z'
source_file_mtime: '2026-02-15T19:32:35.362Z'
source_file_hash: f6b2901b63a4b18c
translation_language: de
source_file_path: development/translation-workflow.md
---
# Workflow zur Übersetzungswartung {#translation-maintenance-workflow}

Für allgemeine Dokumentationsbefehle (Build, Deploy, Screenshots, README-Generierung) siehe [Documentation Tools](documentation-tools.md).

## Übersicht {#overview}

Die Dokumentation verwendet Docusaurus i18n mit Englisch als Standard-Gebietsschema. Die Quelldokumentation befindet sich in `docs/`; Übersetzungen werden in `i18n/{locale}/docusaurus-plugin-content-docs/current/` geschrieben. Unterstützte Gebietsschemas: en (Standard), fr, de, es, pt-BR.

## Wann sich die englische Dokumentation ändert {#when-english-documentation-changes}

1. **Quelldateien aktualisieren** in `docs/`
2. **Extraktion durchführen** (wenn Docusaurus-UI-Strings geändert wurden): `pnpm write-translations`
3. **Glossar aktualisieren** (wenn intlayer-Übersetzungen geändert wurden): `pnpm translate:glossary-ui`
4. **Überschrift-IDs hinzufügen**: `pnpm heading-ids`
5. **KI-Übersetzung ausführen**: `pnpm translate` (übersetzt Dokumente, JSON-UI-Strings und SVGs; verwenden Sie `--no-svg` nur für Dokumente, `--no-json` zum Überspringen von UI-Strings)
6. **UI-Strings** (wenn Docusaurus-UI geändert wurde): `pnpm write-translations` extrahiert neue Schlüssel; Dokumente, JSON-UI-Strings und SVGs werden von den obigen KI-Skripten übersetzt
7. **Build-Tests**: `pnpm build` (erstellt alle Gebietsschemas)
8. **Bereitstellen**: Verwenden Sie Ihren Bereitstellungsprozess (z.B. `pnpm deploy` für GitHub Pages)

<br/>

## Neue Sprachen hinzufügen {#adding-new-languages}

1. Gebietsschema in `docusaurus.config.ts` im `i18n.locales`-Array hinzufügen
2. Gebietsschema-Konfiguration im `localeConfigs`-Objekt hinzufügen
3. Suchplugin-`language`-Array aktualisieren (entsprechenden Sprachcode verwenden, z. B. `pt` für pt-BR)
4. Gebietsschema in `translate.config.json` in `locales.targets` hinzufügen (für KI-Übersetzung)
5. KI-Übersetzung ausführen: `pnpm translate` (übersetzt Dokumente, JSON-UI-Zeichenfolgen und SVGs)
6. UI-Übersetzungsdateien erstellen: `pnpm write-translations` (generiert Struktur); Dokumente, JSON-UI-Zeichenfolgen und SVGs mit `pnpm translate` übersetzen

<br/>

## KI-gestützte Übersetzung {#ai-powered-translation}

Das Projekt umfasst ein automatisiertes Übersetzungssystem mit der OpenRouter API, das Dokumentationen ins Französische, Deutsche, Spanische und Brasilianische Portugiesische übersetzen kann, mit intelligenter Zwischenspeicherung und Glossardurchsetzung.

### Voraussetzungen {#prerequisites}

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

Um eine Zusammenfassung aller Übersetzungsbefehle und der Optionen des Übersetzungsskripts anzuzeigen:

   ```bash
   pnpm help
   # or
   pnpm translate:help
   ```

### Grundlegende Nutzung {#basic-usage}

**Alle Dokumentation in alle Sprachen übersetzen:**

      ```bash
      cd documentation
      pnpm translate
      ```

**In ein bestimmtes Gebietsschema übersetzen:**

      ```bash
      pnpm translate --locale fr    # French
      pnpm translate --locale de    # German
      pnpm translate --locale es    # Spanish
      pnpm translate --locale pt-br # Brazilian Portuguese
      ```

**Eine bestimmte Datei oder ein Verzeichnis übersetzen:**

      ```bash
      pnpm translate --path docs/intro.md
      pnpm translate --path docs/development/
      ```

**Vorschau ohne Änderungen vornehmen (Testlauf):**

      ```bash
      pnpm translate --dry-run
      ```

### Modellkonfiguration {#model-configuration}

Das Übersetzungssystem verwendet Modelle, die in `translate.config.json` konfiguriert sind, ein primäres und ein Fallback-Modell.

| Konfiguration | Hinweise                                | Standardmodell                |
|---------------|----------------------------------------|-------------------------------|
| defaultModel  | Hauptmodell für Übersetzungen          | `anthropic/claude-3.5-haiku` |
| fallbackModel | Fallback, wenn primäres Modell ausfällt | `anthropic/claude-haiku-4.5` |

Überprüfen Sie die Liste aller verfügbaren Modelle und deren Kosten auf der [Openrouter.ai-Seite](https://openrouter.ai/models)

### Qualität der Übersetzung testen {#testing-the-quality-of-the-translation}

Um die Qualität eines neuen Modells zu testen, ändern Sie das `defaultModel` in der `translate.config.json` und führen Sie die Übersetzung für eine Datei durch, zum Beispiel:

```bash
pnpm translate --force --path docs/intro.md --no-cache --locale pt-BR
```

und prüfen Sie die übersetzte Datei in `i18n/pt-BR/docusaurus-plugin-content-docs/current/intro.md`

### Dateien ignorieren {#ignore-files}

Fügen Sie die Dateien, die während der KI-Übersetzung übersprungen werden sollen, in die `.translate-ignore`-Datei ein (ähnlich wie `.gitignore`).

Beispiel:

```bash
# Documentation files
# Keep the license in English
LICENSE.md

# Don't translate the API reference
api-reference/*

# Dashboard/table diagram - not referenced in docs
duplistatus_dash-table.svg
```

### Glossarverwaltung {#glossary-management}

Das Terminologie-Glossar wird automatisch aus intlayer-Wörterbüchern generiert, um die Konsistenz zwischen der Anwendungsbenutzeroberfläche und den Dokumentationsübersetzungen zu gewährleisten.

#### Glossar generieren {#generating-the-glossary}

```bash
cd documentation
pnpm translate:glossary-ui
```

Dieses Skript:

- Führt `pnpm intlayer build` im Projekthauptverzeichnis aus, um Wörterbücher zu generieren
- Extrahiert Terminologie aus `.intlayer/dictionary/*.json`-Dateien
- Generiert `glossary-ui.csv`
- Aktualisiert die Glossartabelle in `CONTRIBUTING-TRANSLATIONS.md` (falls diese Datei existiert)

#### Wann neu generieren {#when-to-regenerate}

- Nach der Aktualisierung von intlayer-Übersetzungen in der Anwendung
- Wann neue technische Begriffe zur Anwendung hinzugefügt werden
- Vor umfangreichen Übersetzungsarbeiten, um Konsistenz zu gewährleisten

#### Benutzerdefinierte Glossar-Überschreibungen {#user-glossary-overrides}

`glossary-user.csv` ermöglicht das Überschreiben oder Hinzufügen von Begriffen, ohne die generierte UI-Glossar-Datei zu ändern. Format: `en`, `Gebietsschema`, `Übersetzung` (eine Zeile pro Begriff pro Gebietsschema). Verwenden Sie `*` als Gebietsschema, um einen Begriff auf alle konfigurierten Gebietsschemata anzuwenden. Einträge haben Vorrang vor `glossary-ui.csv`.

### Cacheverwaltung {#cache-management}

Das Übersetzungssystem verwendet einen zweistufigen Cache (Datei-Ebene und Segment-Ebene), der in `.translation-cache/cache.db` gespeichert ist, um die API-Kosten zu minimieren. Diese Datei ist im Git-Repository enthalten, um zukünftige Übersetzungskosten zu reduzieren.

Cache-Verwaltungsbefehle:

| Befehl                                  | Beschreibung                                                          |
|-----------------------------------------|-----------------------------------------------------------------------|
| `pnpm translate --clear-cache <locale>` | Löschen des Caches für bestimmte Sprache                              |
| `pnpm translate --clear-cache`          | Löschen des **gesamten** Caches (Datei- und Segment-Cache)            |
| `pnpm translate --force`                | Erzwungene Neuübersetzung (löscht Datei-Cache, behält Segment-Cache)  |
| `pnpm translate --no-cache`             | Cache vollständig umgehen (erzwingt API-Aufrufe, speichert neue Übersetzungen) |
| `pnpm translate:editor`             | Manuelle Überprüfung, Löschen oder Bearbeitung von Cache-Einträgen    |

### Verwaiste und veraltete Cacheeinträge entfernen {#remove-orphaned-and-stale-cache}

Wenn Änderungen an vorhandenen Dokumenten vorgenommen werden, können Cache-Einträge verwaist oder veraltet werden. Verwenden Sie die Befehle, um Einträge zu löschen, die nicht mehr benötigt werden, und reduzieren Sie so die Größe des Übersetzungs-Caches.

```bash
pnpm translate --force
pnpm translate:cleanup
```

:::warning
Stellen Sie vor dem Ausführen des Bereinigungsskripts sicher, dass Sie `pnpm translate --force` ausgeführt haben. Dieser Schritt ist entscheidend, um zu vermeiden, dass gültige Einträge versehentlich als veraltet gelöscht werden.

Das Skript erstellt automatisch eine Sicherung im `.translation-cache`-Ordner, sodass Sie gelöschte Daten bei Bedarf wiederherstellen können.
:::

<br/>

### Manueller Überblick des Caches {#manual-review-of-the-cache}

Verwenden Sie beim Überprüfen von Übersetzungen das webbasierte Cache-Bearbeitungstool, um Übersetzungen bestimmter Begriffe anzuzeigen, Cache-Einträge zu löschen, Einträge mit den verfügbaren Filtern zu löschen oder bestimmte Dateien zu löschen. Dies ermöglicht es Ihnen, nur die gewünschten Texte oder Dateien neu zu übersetzen.

Wenn ein Modell beispielsweise einen Begriff falsch übersetzt hat, können Sie alle Einträge für diesen Begriff filtern, das Modell in der `translate.config.json`-Datei ändern und nur die Zeilen mit diesen Begriffen mithilfe des neuen Modells neu übersetzen.

```bash
pnpm translate:editor
```

Dies öffnet eine Web-Benutzeroberfläche zum manuellen Durchsuchen und Bearbeiten des Caches (Port 4000 oder 4000+), sodass Sie:
   - Tabellenansicht mit Filtermöglichkeiten
   - Inline-Bearbeitung des übersetzten Texts
   - Einzelnen Eintrag, Übersetzungen für eine bestimmte Datei oder gefilterte Einträge löschen
   - Quell- und übersetzte Dateipfade im Terminal ausgeben für schnellen Editor-Zugriff

![Translate Edit-Cache App](/img/screenshot-translate-edit-cache.png)

<br/>

### Überschrift-IDs und Anker {#heading-ids-and-anchors}

Konsistente Ankerlinks (IDs) sind entscheidend für Querverweise, Inhaltsverzeichnisse und Deep-Links. Wenn Inhalte übersetzt werden, ändert sich der Überschriftentext, was normalerweise dazu führt, dass automatisch generierte Anker-IDs zwischen Sprachen variieren.

```markdown
 ## This is a Heading {#this-is-a-heading}
```

Führen Sie dies nach dem Aktualisieren oder Erstellen einer neuen englischen Quelldatei aus, um explizite IDs sicherzustellen:

```bash
cd documentation
pnpm heading-ids   # Adds {#id} to all headings without explicit IDs
```

:::note
Verwenden Sie immer die generierte ID beim Querverweisen von Dokumentationsabschnitten.
:::

<br/>

### SVG-Übersetzung {#svg-translation}

SVG-Übersetzung ist standardmäßig in `pnpm translate` enthalten (wird nach Dokumenten ausgeführt). SVG-Dateien in `static/img/`, deren Namen mit `duplistatus` beginnen, werden übersetzt.

**SVG überspringen** (nur Dokumentation):

```bash
pnpm translate --no-svg
```

**Nur SVG** (eigenständiges Skript):

```bash
pnpm translate:svg
```

Optionen: `--locale`, `--path`, `--dry-run`, `--no-cache`, `--force`, `--no-export-png`. Verwendet `.translate-ignore` für Ausschlüsse.

<br/>

### Übersetzung von Benutzeroberflächen-Zeichenfolgen (JSON) {#ui-strings-translation-json}

Docusaurus-UI-Zeichenfolgen und benutzerdefinierte Komponentenbeschriftungen werden in JSON-Übersetzungsdateien gespeichert. Diese werden automatisch von `pnpm write-translations` generiert und dann vom KI-System übersetzt.

**Funktionsweise:**

1. **Extraktion**: `pnpm write-translations` scannt Docusaurus-Theme-Dateien und benutzerdefinierte React-Komponenten nach übersetzbaren Zeichenfolgen (wie „Weiter", „Vorherige", „Suchen", Schaltflächenbeschriftungen) und schreibt sie als JSON-Dateien in `i18n/en/`. Jede Datei entspricht einem Docusaurus-Plugin oder -Theme.
2. **Übersetzung**: `pnpm translate` (mit aktivierter JSON-Unterstützung) übersetzt diese JSON-Dateien in alle Zielgebietsschemas mithilfe des KI-Modells unter Berücksichtigung des Glossars.
3. **Verwendung**: Docusaurus lädt automatisch die JSON-Dateien des entsprechenden Gebietsschemas zur Laufzeit, um die Benutzeroberfläche in der ausgewählten Sprache anzuzeigen.

**Wichtige JSON-Dateien** (alle in `i18n/{Gebietsschema}/`):
- `docusaurus-plugin-content-docs/current.json` - Dokumentations-UI-Zeichenfolgen (Suche, Navigation, Inhaltsverzeichnis)
- `docusaurus-theme-classic/navbar.json` - Navigationsleistenelemente
- `docusaurus-theme-classic/footer.json` - Fußzeilenelemente
- `code.json` - Code-Block-Beschriftungen (Kopieren, Reduzieren, Erweitern)
- Andere plugin-spezifische JSON-Dateien

**JSON-Übersetzung überspringen** (nur Dokumente):

```bash
pnpm translate --no-json
```

**Wichtig**: UI-Zeichenfolgen sind normalerweise stabil, aber wenn Sie neue benutzerdefinierte Komponenten mit übersetzbaren Texten hinzufügen, müssen Sie `pnpm write-translations` ausführen, um diese neuen Zeichenfolgen zu extrahieren, bevor Sie `pnpm translate` ausführen. Andernfalls erscheinen die neuen Zeichenfolgen für alle Gebietsschemas nur auf Englisch.

<br/>

Der `translate`-Befehl protokolliert alle Konsolenausgaben und API-Verkehr in Dateien im `.translation-cache/`-Verzeichnis. Die Protokolle umfassen:

- `translate_<timestamp>.log`: Ein umfassendes Protokoll der Ausgabe des `pnpm translate`-Befehls.
- `debug-traffic-<timestamp>.log`: Ein Protokoll des gesamten Verkehrs, der an das KI-Modell gesendet und von ihm empfangen wurde.

Beachten Sie, dass API-Verkehr nur protokolliert wird, wenn Segmente an die API gesendet werden. 
   Wenn alle Segmente aus dem Cache abgerufen werden (zum Beispiel bei Verwendung der `--force`-Option, die den Dateicache überschreibt, aber nicht den Segmentcache), werden keine API-Aufrufe durchgeführt, und 
   das Protokoll enthält nur eine Kopfzeile und eine Notiz.

Um API-Aufrufe zu erzwingen und Anfrage-/Antwortverkehr zu erfassen, 
   verwenden Sie die `--no-cache`-Option.

<br/>

## Arbeitsablauf mit KI-Übersetzung {#workflow-with-ai-translation}

1. **Englische Dokumentation** in `docs/` aktualisieren
2. **Glossar aktualisieren** (falls erforderlich): `pnpm translate:glossary-ui` und `glossary-user.csv`.
3. **Überschrift-IDs aktualisieren**: `pnpm headings-ids`
4. **KI-Übersetzung ausführen**: `pnpm translate` (übersetzt Dokumente, JSON und SVGs)
5. **Übersetzungen überprüfen** in `i18n/{locale}/docusaurus-plugin-content-docs/current/` (optional)
6. **Builds testen**: `pnpm build`
7. **Bereitstellen** über Ihren Bereitstellungsprozess

<br/>

## Fehlerbehebung {#troubleshooting}

**"OPENROUTER_API_KEY nicht gesetzt"**

- Exportieren Sie die Umgebungsvariable oder fügen Sie sie zu `.env.local` hinzu

**Probleme mit der Übersetzungsqualität**

- Anderes Modell in `translate.config.json` ausprobieren
- Einträge im Cache löschen und ein anderes Modell verwenden
- Englisches Dokument überprüfen und umschreiben, um die Übersetzung zu verbessern
- Weitere Begriffe zu `glossary-ui.csv` hinzufügen oder Überschreibungen in `glossary-user.csv` (en, Gebietsschema, Übersetzung) hinzufügen

**Cache-Beschädigung**

- Führen Sie `pnpm translate --clear-cache` aus, um zurückzusetzen
- Führen Sie `pnpm translate:cleanup` aus, um verwaiste Einträge zu entfernen
- Verwenden Sie `pnpm translate:editor`, um einzelne zwischengespeicherte Übersetzungen zu korrigieren/löschen, ohne das gesamte Dokument neu zu übersetzen

**Debugging OpenRouter-Datenverkehr**

- Protokolle werden in `.translation-cache/debug-traffic-<timestamp>.log` geschrieben. 
- Verwenden Sie dieses Protokoll, um zu prüfen, ob das Übersetzungsproblem mit dem Skript, den verwendeten Prompts oder dem Modell zusammenhängt.

## Verfolgung des Übersetzungsstatus {#translation-status-tracking}

Verfolgung des Übersetzungsfortschritts mit:

```bash
pnpm translate:status
```

Dies generiert eine Tabelle, die den Übersetzungsstatus für alle Dokumentationsdateien anzeigt. Zum Beispiel:

![Translate Status](/img/screenshot-translate-status.png)
