---
translation_last_updated: '2026-01-31T00:51:23.246Z'
source_file_mtime: '2026-01-29T17:58:29.891Z'
source_file_hash: 48575e653bc418bc
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

## Häufig verwendete Befehle {#common-commands}

Alle Befehle sollten aus dem Verzeichnis `documentation` ausgeführt werden:

### Entwicklung {#development}

Starten Sie den Entwicklungsserver mit Hot-Reload:

```bash
cd documentation
pnpm start
```

Die Website ist unter `http://localhost:3000` (oder dem nächsten verfügbaren Port) verfügbar.

### Build {#build}

Erstellen Sie die Dokumentationswebsite für die Produktion:

```bash
cd documentation
pnpm build
```

Dies generiert statische HTML-Dateien im Verzeichnis `documentation/build`.

### Produktions-Build bereitstellen {#serve-production-build}

Zeigen Sie den Produktions-Build lokal in der Vorschau an:

```bash
cd documentation
pnpm serve
```

Dies stellt die erstellte Website aus dem Verzeichnis `documentation/build` bereit.

### Weitere nützliche Befehle {#other-useful-commands}

- `pnpm clear` - Löschen des Docusaurus-Cache
- `pnpm typecheck` - TypeScript-Typprüfung ausführen
- `pnpm write-heading-ids` - Hinzufügen von Überschriften-IDs zu Markdown-Dateien für Ankerlinks

## README.md generieren {#generating-readmemd}

Die `README.md`-Datei des Projekts wird automatisch aus `documentation/docs/intro.md` generiert, um die GitHub-Repository-README mit der Docusaurus-Dokumentation synchron zu halten.

Um die README.md-Datei zu generieren oder zu aktualisieren:

```bash
./scripts/generate-readme-from-intro.sh
```

Dieses Skript:
- Extrahiert die aktuelle Version aus `package.json` und fügt ein Versions-Badge hinzu
- Kopiert Inhalte aus `documentation/docs/intro.md`
- Konvertiert Docusaurus-Admonitions (note, tip, warning, etc.) in GitHub-Style-Warnungen
- Konvertiert alle relativen Docusaurus-Links in absolute GitHub-Dokumentations-URLs (`https://wsj-br.github.io/duplistatus/...`)
- Konvertiert Bildpfade von `/img/` zu `documentation/static/img/` für GitHub-Kompatibilität
- Entfernt den Migrations-WICHTIG-Block und fügt einen Abschnitt „Migrationsinformationen" mit einem Link zur Docusaurus-Dokumentation hinzu
- Generiert ein Inhaltsverzeichnis mit `doctoc`
- Generiert `README_dockerhub.md` mit Docker-Hub-kompatibler Formatierung (konvertiert Bilder und Links in absolute URLs, konvertiert GitHub-Warnungen in Emoji-basiertes Format)
- Generiert GitHub-Versionshinweise (`RELEASE_NOTES_github_VERSION.md`) aus `documentation/docs/release-notes/VERSION.md` (konvertiert Links und Bilder in absolute URLs)

**Hinweis:** Sie müssen `doctoc` global installiert haben, um die TOC-Generierung zu ermöglichen:

```bash
npm install -g doctoc
```

## README für Docker Hub aktualisieren {#update-readme-for-docker-hub}

Das Skript `generate-readme-from-intro.sh` generiert automatisch `README_dockerhub.md` mit Docker Hub-kompatibler Formatierung. Es:
- Kopiert `README.md` zu `README_dockerhub.md`
- Konvertiert relative Bildpfade in absolute GitHub Raw-URLs
- Konvertiert relative Dokumentlinks in absolute GitHub Blob-URLs
- Konvertiert GitHub-style Warnungen (`[!NOTE]`, `[!WARNING]` usw.) in Emoji-basiertes Format für bessere Docker Hub-Kompatibilität
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

Die generierte Releasenotes-Datei kann direkt in die GitHub-Release-Beschreibung kopiert und eingefügt werden. Alle Links und Bilder funktionieren korrekt im GitHub-Release-Kontext.

**Hinweis:** Die generierte Datei ist temporär und kann nach der Erstellung des GitHub-Release gelöscht werden. Es wird empfohlen, `RELEASE_NOTES_github_*.md` zu `.gitignore` hinzuzufügen, wenn Sie diese Dateien nicht committen möchten.

## Screenshots für die Dokumentation erstellen {#take-screenshots-for-documentation}

```bash
tsx scripts/take-screenshots.ts
```

Dieses Skript erstellt automatisch Screenshots der Anwendung für Dokumentationszwecke. Es:
- Startet einen Headless-Browser (Puppeteer)
- Meldet sich als Admin und normaler Benutzer an
- Navigiert durch verschiedene Seiten (Dashboard, Server-Details, Einstellungen usw.)
- Erstellt Screenshots bei verschiedenen Viewport-Größen
- Speichert Screenshots in `documentation/static/img/`

**Anforderungen:**
- Der Entwicklungsserver muss auf `http://localhost:8666` ausgeführt werden
- Umgebungsvariablen müssen gesetzt werden:
  - `ADMIN_PASSWORD`: Passwort für das Admin-Konto
  - `USER_PASSWORD`: Passwort für das reguläre Benutzerkonto

**Beispiel:**

```bash
export ADMIN_PASSWORD="your-admin-password"
export USER_PASSWORD="your-user-password"
tsx scripts/take-screenshots.ts
```

**Generierte Screenshots:**

Das Skript generiert die folgenden Screenshots (gespeichert in `documentation/static/img/`):

**Dashboard-Screenshots:**
- `screen-main-dashboard-card-mode.png` - Dashboard in Karten-/Übersichtsmodus
- `screen-main-dashboard-table-mode.png` - Dashboard im Tabellenmodus
- `screen-overdue-backup-hover-card.png` - Überfällige Sicherung Hover-Karte/Tooltip
- `screen-backup-tooltip.png` - Regulärer Sicherungs-Tooltip (Hover über Sicherung in Kartenansicht)

**Server Details Screenshots:**
- `screen-server-backup-list.png` - Server Sicherungsliste Seite
- `screen-backup-history.png` - Sicherungsverlauf Tabellenbereich
- `screen-backup-detail.png` - Einzelne Sicherung Details Seite
- `screen-metrics.png` - Metriken Diagramm mit Sicherungsmetriken im Zeitverlauf

**Sammeln/Konfiguration Screenshots:**
- `screen-collect-button-popup.png` - Popup zum Sammeln von Backup-Protokollen
- `screen-collect-button-right-click-popup.png` - Kontextmenü „Alle sammeln"
- `screen-collect-backup-logs.png` - Oberfläche zum Sammeln von Backup-Protokollen
- `screen-duplicati-configuration.png` - Duplicati-Konfiguration Dropdown

**Einstellungen Screenshots:**
- `screen-settings-left-panel-admin.png` - Einstellungen Seitenleiste (Admin-Ansicht)
- `screen-settings-left-panel-non-admin.png` - Einstellungen Seitenleiste (Nicht-Admin-Ansicht)
- `screen-settings-{tab}.png` - Einzelne Einstellungsseiten für jeden Tab:
  - `screen-settings-notifications.png`
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
- `screen-settings-ntfy-configure-device-popup.png` - NTFY Gerät konfigurieren Popup
- `screen-settings-backup-notifications-detail.png` - Backup-Benachrichtigungen Detailseite

## Bereitstellung der Dokumentation {#deploying-the-documentation}

Um die Dokumentation auf GitHub Pages bereitzustellen, müssen Sie ein GitHub Personal Access Token generieren. Gehen Sie zu [GitHub Personal Access Tokens](https://github.com/settings/tokens) und erstellen Sie ein neues Token mit dem `repo`-Umfang.

Wenn Sie das Token haben, führen Sie den folgenden Befehl aus, um das Token im Git-Anmeldeinformationsspeicher zu speichern:

```bash
./setup-git-credentials.sh
```

Führen Sie dann den folgenden Befehl aus, um die Dokumentation auf GitHub Pages bereitzustellen:

```bash
pnpm run deploy
```

Dies erstellt die Dokumentation und überträgt sie in den `gh-pages`-Branch des Repositorys. Die Dokumentation wird dann unter [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/) verfügbar sein.

## Arbeiten mit Dokumentation {#working-with-documentation}

- Dokumentationsdateien werden in Markdown (`.md`) geschrieben und befinden sich in `documentation/docs/`
- Die Seitenleisten-Navigation wird in `documentation/sidebars.ts` konfiguriert
- Die Docusaurus-Konfiguration befindet sich in `documentation/docusaurus.config.ts`
- Benutzerdefinierte React-Komponenten können zu `documentation/src/components/` hinzugefügt werden
- Statische Ressourcen (Bilder, PDFs usw.) befinden sich in `documentation/static/`
- Die Hauptseite der Dokumentation ist `documentation/docs/intro.md`, die als Quelle für die Generierung von `README.md` verwendet wird
