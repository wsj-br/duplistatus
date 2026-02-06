---
translation_last_updated: '2026-02-06T22:33:30.409Z'
source_file_mtime: '2026-02-06T21:19:26.573Z'
source_file_hash: bb3c3536a92b19fc
translation_language: de
source_file_path: development/documentation-tools.md
---
# Dokumentationswerkzeuge {#documentation-tools}

Die Dokumentation wird mit [Docusaurus](https://docusaurus.io/) erstellt und befindet sich im Ordner `documentation`. Die Dokumentation wird auf [GitHub Pages](https://wsj-br.github.io/duplistatus/) gehostet und ist nicht mehr im Docker-Container-Image enthalten.

## Ordnerstruktur {#folder-structure}

```
documentation/
├── docs/              # Documentation markdown files
│   ├── api-reference/
│   ├── development/
│   ├── installation/
│   ├── migration/
│   ├── release-notes/
│   └── user-guide/
├── src/               # React components and pages
│   ├── components/    # Custom React components
│   ├── css/           # Custom styles
│   └── pages/         # Additional pages (e.g., 404)
├── static/            # Static assets (images, files)
├── docusaurus.config.ts  # Docusaurus configuration
├── sidebars.ts        # Sidebar navigation configuration
└── package.json       # Dependencies and scripts
```

## Häufige Befehle {#common-commands}

Alle Befehle sollten aus dem Verzeichnis `documentation` ausgeführt werden:

### Entwicklung {#development}

Starten Sie den Entwicklungsserver mit Hot-Reload:

```bash
cd documentation
pnpm start
```

Die Website ist unter `http://localhost:3000` (oder dem nächsten verfügbaren Port) erreichbar.

### Erstellen {#build}

Erstellen Sie die Dokumentationswebsite für die Produktion:

```bash
cd documentation
pnpm build
```

Dies generiert statische HTML-Dateien im Verzeichnis `documentation/build`.

### Produktions-Build bereitstellen {#serve-production-build}

Zeigen Sie den Production-Build lokal in der Vorschau an:

```bash
cd documentation
pnpm serve
```

Dies stellt die erstellte Website aus dem Verzeichnis `documentation/build` bereit.

### Weitere nützliche Befehle {#other-useful-commands}

- `pnpm clear` - Docusaurus-Cache löschen
- `pnpm typecheck` - TypeScript-Typprüfung ausführen
- `pnpm write-heading-ids` - Überschriften-IDs zu Markdown-Dateien für Ankerlinks hinzufügen

## README.md generieren {#generating-readmemd}

Die `README.md`-Datei des Projekts wird automatisch aus `documentation/docs/intro.md` generiert, um das GitHub-Repository-README mit der Docusaurus-Dokumentation synchron zu halten.

Um die README.md-Datei zu generieren oder zu aktualisieren:

```bash
./scripts/generate-readme-from-intro.sh
```

Dieses Skript:
- Extrahiert die aktuelle Version aus `package.json` und fügt ein Versions-Badge hinzu
- Kopiert Inhalte aus `documentation/docs/intro.md`
- Konvertiert Docusaurus-Admonitions (note, tip, warning, etc.) in GitHub-style Warnungen
- Konvertiert alle relativen Docusaurus-Links in absolute GitHub-Dokumentations-URLs (`https://wsj-br.github.io/duplistatus/...`)
- Konvertiert Bildpfade von `/img/` zu `documentation/static/img/` für GitHub-Kompatibilität
- Entfernt den Migration IMPORTANT-Block und fügt einen Abschnitt „Migration Information" mit einem Link zur Docusaurus-Dokumentation hinzu
- Generiert ein Inhaltsverzeichnis mit `doctoc`
- Generiert `README_dockerhub.md` mit Docker-Hub-kompatibler Formatierung (konvertiert Bilder und Links in absolute URLs, konvertiert GitHub-Warnungen in Emoji-basiertes Format)
- Generiert GitHub-Versionshinweise (`RELEASE_NOTES_github_VERSION.md`) aus `documentation/docs/release-notes/VERSION.md` (konvertiert Links und Bilder in absolute URLs)

**Hinweis:** Sie müssen `doctoc` global installiert haben, um die TOC-Generierung zu ermöglichen:

```bash
npm install -g doctoc
```

## README für Docker Hub aktualisieren {#update-readme-for-docker-hub}

Das Skript `generate-readme-from-intro.sh` generiert automatisch `README_dockerhub.md` mit Docker-Hub-kompatibler Formatierung. Es:
- Kopiert `README.md` zu `README_dockerhub.md`
- Konvertiert relative Bildpfade zu absoluten GitHub-Raw-URLs
- Konvertiert relative Dokumentlinks zu absoluten GitHub-Blob-URLs
- Konvertiert GitHub-Style-Warnungen (`[!NOTE]`, `[!WARNING]` usw.) in Emoji-basiertes Format für bessere Docker-Hub-Kompatibilität
- Stellt sicher, dass alle Bilder und Links auf Docker Hub korrekt funktionieren

## GitHub-Versionshinweise generieren {#generate-github-release-notes}

Das Skript `generate-readme-from-intro.sh` generiert automatisch GitHub-Versionshinweise bei der Ausführung. Es:
- Liest die Versionshinweise aus `documentation/docs/release-notes/VERSION.md` (wobei VERSION aus `package.json` extrahiert wird)
- Ändert den Titel von „# Version xxxx" zu „# Release Notes - Version xxxxx"
- Konvertiert relative Markdown-Links zu absoluten GitHub-Dokumentations-URLs (`https://wsj-br.github.io/duplistatus/...`)
- Konvertiert Bildpfade zu GitHub-Raw-URLs (`https://raw.githubusercontent.com/wsj-br/duplistatus/main/documentation/static/img/...`) für die ordnungsgemäße Anzeige in Versionsbeschreibungen
- Verarbeitet relative Pfade mit `../`-Präfix
- Behält absolute URLs (http:// und https://) unverändert
- Erstellt `RELEASE_NOTES_github_VERSION.md` im Projektstammverzeichnis

**Beispiel:**

```bash
# This will generate both README.md and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

Die generierte Release-Notes-Datei kann direkt in die GitHub-Release-Beschreibung kopiert und eingefügt werden. Alle Links und Bilder funktionieren korrekt im GitHub-Release-Kontext.

**Hinweis:** Die generierte Datei ist temporär und kann nach der Erstellung des GitHub-Release gelöscht werden. Es wird empfohlen, `RELEASE_NOTES_github_*.md` zu `.gitignore` hinzuzufügen, wenn Sie diese Dateien nicht committen möchten.

## Screenshots für die Dokumentation aufnehmen {#take-screenshots-for-documentation}

```bash
pnpm take-screenshots
```

Oder direkt ausführen: `tsx scripts/take-screenshots.ts` (verwenden Sie `--env-file=.env`, falls Umgebungsvariablen benötigt werden).

Dieses Skript erstellt automatisch Screenshots der Anwendung für Dokumentationszwecke. Es:
- Startet einen Headless-Browser (Puppeteer)
- Meldet sich als Admin und regulärer Benutzer an
- Navigiert durch verschiedene Seiten (Dashboard, Serverdetails, Einstellungen usw.)
- Macht Screenshots in verschiedenen Viewport-Größen
- Speichert Screenshots in `documentation/static/assets/` (Englisch) oder `documentation/i18n/{locale}/docusaurus-plugin-content-docs/current/assets` (andere Sprachen)

**Anforderungen:**
- Der Entwicklungsserver muss auf `http://localhost:8666` ausgeführt werden
- Umgebungsvariablen müssen gesetzt werden:
  - `ADMIN_PASSWORD`: Passwort für das Admin-Konto
  - `USER_PASSWORD`: Passwort für das reguläre Benutzerkonto

**Optionen:** `--locale` beschränkt Screenshots auf eine oder mehrere Sprachen (kommagetrennt). Wenn weggelassen, werden alle Sprachen erfasst. Gültige Sprachen: `en`, `de`, `fr`, `es`, `pt-BR`. Verwenden Sie `-h` oder `--help`, um die Verwendung anzuzeigen.

**Beispiel:**

```bash
export ADMIN_PASSWORD="your-admin-password"
export USER_PASSWORD="your-user-password"
tsx scripts/take-screenshots.ts
# All locales (default):
tsx scripts/take-screenshots.ts
# Single locale:
tsx scripts/take-screenshots.ts --locale en
# Multiple locales:
tsx scripts/take-screenshots.ts --locale en,de,pt-BR
```

**Generierte Screenshots:**

Das Skript generiert die folgenden Screenshots (gespeichert in `documentation/static/assets/` für Englisch oder `documentation/i18n/{locale}/docusaurus-plugin-content-docs/current/assets` für andere Sprachen):

**Dashboard-Screenshots:**
- `screen-main-dashboard-card-mode.png` - Dashboard im Karten-/Übersichtsmodus
- `screen-main-dashboard-table-mode.png` - Dashboard im Tabellenmodus
- `screen-overdue-backup-hover-card.png` - Hover-Karte/Tooltip für überfällige Sicherung
- `screen-backup-tooltip.png` - Regulärer Backup-Tooltip (Hover über Sicherung in Kartenansicht)
- `screen-dashboard-summary.png` - Dashboard-Zusammenfassungsabschnitt
- `screen-dashboard-summary-table.png` - Dashboard-Zusammenfassungstabelle
- `screen-overview-side-status.png` - Seitliche Statusleiste der Übersicht
- `screen-overview-side-charts.png` - Seitliche Diagramme der Übersicht

**Server-Details-Screenshots:**
- `screen-server-backup-list.png` - Server-Sicherungsliste
- `screen-backup-history.png` - Sicherungsverlauf-Tabellenabschnitt
- `screen-backup-detail.png` - Einzelne Sicherungsdetailseite
- `screen-metrics.png` - Metrik-Diagramm mit Sicherungsmetriken im Zeitverlauf
- `screen-available-backups-modal.png` - Modal für verfügbare Sicherungen
- `screen-server-overdue-message.png` - Überfällige Servernachricht

**Sammeln/Konfiguration-Screenshots:**
- `screen-collect-button-popup.png` - Popup zum Sammeln von Backup-Protokollen
- `screen-collect-button-right-click-popup.png` - Kontextmenü "Alle sammeln"
- `screen-duplicati-configuration.png` - Duplicati-Konfigurationsmenü

**Einstellungen-Screenshots:**
- `screen-settings-left-panel-admin.png` - Einstellungsseitenleiste (Admin-Ansicht)
- `screen-settings-left-panel-non-admin.png` - Einstellungsseitenleiste (Nicht-Admin-Ansicht)
- `screen-settings-{tab}.png` - Einzelne Einstellungsseiten für jeden Tab:
  - `screen-settings-notifications.png`
  - `screen-settings-notifications-bulk.png`
  - `screen-settings-notifications-server.png`
  - `screen-settings-overdue.png`
  - `screen-settings-server.png`
  - `screen-settings-ntfy.png`
  - `screen-settings-email.png`
  - `screen-settings-templates.png`
  - `screen-settings-users.png`
  - `screen-settings-audit.png`
  - `screen-settings-audit-retention.png`
  - `screen-settings-display.png`
  - `screen-settings-database-maintenance.png`
  - `screen-settings-application-logs.png`

**Benutzermenü-Screenshots:**
- `screen-user-menu-admin.png` - Benutzermenü (Admin-Ansicht)
- `screen-user-menu-user.png` - Benutzermenü (Reguläre Benutzeransicht)

## SVG-Dateien übersetzen {#translate-svg-files}

SVG-Übersetzung ist in `pnpm run translate` standardmäßig enthalten (wird nach docs ausgeführt). Das Skript `translate:svg` ist für SVG-only-Läufe vorgesehen (z. B. wenn sich nur SVGs geändert haben). Beide übersetzen Text in SVG-Dateien (z. B. Symbolleisten- und Dashboard-Diagramme) in jedes Gebietsschema und exportieren sie dann mit Inkscape als PNG.

**Voraussetzungen:** Inkscape CLI (siehe [Development Setup](setup#prerequisites)); `OPENROUTER_API_KEY` für API-basierte Übersetzung (nicht erforderlich für `--dry-run` oder `--stats`).

**Schnelle Verwendung:**

```bash
cd documentation
pnpm translate:svg          # SVG-only
pnpm run translate          # Docs + SVGs (use --no-svg for docs only)
```

Für den vollständigen Übersetzungs-Workflow (Glossar, KI-Übersetzung, Cache, Optionen, Fehlerbehebung) siehe [Translation Workflow](translation-workflow.md).

## Bereitstellung der Dokumentation {#deploying-the-documentation}

Um die Dokumentation auf GitHub Pages bereitzustellen, müssen Sie ein GitHub Personal Access Token generieren. Gehen Sie zu [GitHub Personal Access Tokens](https://github.com/settings/tokens) und erstellen Sie ein neues Token mit dem `repo`-Bereich.

Wenn Sie das Token haben, speichern Sie es im Git-Anmeldeinformationsspeicher (z.B. mit `git config credential.helper store` oder dem Anmeldeinformationsmanager Ihres Systems).

Um die Dokumentation dann auf GitHub Pages zu veröffentlichen, führen Sie den folgenden Befehl aus dem Verzeichnis `documentation` aus:

```bash
pnpm run deploy
```

Dies erstellt die Dokumentation und pusht sie in den `gh-pages`-Branch des Repositorys. Die Dokumentation ist dann unter [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/) verfügbar.

## Arbeiten mit Dokumentation {#working-with-documentation}

Für den Übersetzungs-Workflow (Glossar, KI-Übersetzung, Cache-Verwaltung) siehe [Translation Workflow](translation-workflow.md).

- Dokumentationsdateien werden in Markdown (`.md`) geschrieben und befinden sich in `documentation/docs/`
- Die Seitenleisten-Navigation wird in `documentation/sidebars.ts` konfiguriert
- Die Docusaurus-Konfiguration befindet sich in `documentation/docusaurus.config.ts`
- Benutzerdefinierte React-Komponenten können zu `documentation/src/components/` hinzugefügt werden
- Statische Ressourcen (Bilder, PDFs usw.) werden in `documentation/static/` abgelegt
- Die Hauptdokumentation-Startseite ist `documentation/docs/intro.md`, die als Quelle für die Generierung von `README.md` verwendet wird
