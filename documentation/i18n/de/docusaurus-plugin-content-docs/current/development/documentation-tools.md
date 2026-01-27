# Dokumentationswerkzeuge {#documentation-tools}

Die Dokumentation wird mit [Docusaurus](https://docusaurus.io/) erstellt und befindet sich im Ordner `documentation`. Die Dokumentation wird auf [GitHub Pages](https://wsj-br.github.io/duplistatus/) gehostet und ist nicht mehr im Docker-Container-Image enthalten.

## Ordnerstruktur {#folder-structure}

```
documentation/
├── docs/              # Dokumentations-Markdown-Dateien
│   ├── api-reference/
│   ├── development/
│   ├── installation/
│   ├── migration/
│   ├── release-notes/
│   └── user-guide/
├── src/               # React-Komponenten und Seiten
│   ├── components/    # Benutzerdefinierte React-Komponenten
│   ├── css/           # Benutzerdefinierte Stile
│   └── pages/         # Zusätzliche Seiten (z. B. 404)
├── static/            # Statische Assets (Bilder, Dateien)
├── docusaurus.config.ts  # Docusaurus-Konfiguration
├── sidebars.ts        # Konfiguration der Seitenleistennavigation
└── package.json       # Abhängigkeiten und Skripte
```

## Häufige Befehle {#common-commands}

Alle Befehle sollten aus dem Verzeichnis `documentation` ausgeführt werden:

### Entwicklung {#development}

Starten Sie den Entwicklungsserver mit Hot-Reload:

```bash
cd documentation
pnpm start
```

Die Website ist unter `http://localhost:3000` (oder dem nächsten verfügbaren Port) verfügbar.

### Erstellen {#build}

Erstellen Sie die Dokumentationswebsite für die Produktion:

```bash
cd documentation
pnpm build
```

Dies generiert statische HTML-Dateien im Verzeichnis `documentation/build`.

### Produktions-Build bereitstellen {#serve-production-build}

Zeigen Sie den Produktions-Build lokal an:

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

Die Datei `README.md` des Projekts wird automatisch aus `documentation/docs/intro.md` generiert, um die GitHub-Repository-README mit der Docusaurus-Dokumentation synchron zu halten.

So generieren oder aktualisieren Sie die Datei README.md:

```bash
./scripts/generate-readme-from-intro.sh
```

Dieses Skript:

- Extrahiert die aktuelle Version aus `package.json` und fügt ein Versions-Badge hinzu
- Kopiert Inhalte aus `documentation/docs/intro.md`
- Konvertiert Docusaurus-Admonitions (Hinweis, Tipp, Warnung usw.) zu GitHub-Stil-Warnungen
- Konvertiert alle relativen Docusaurus-Links zu absoluten GitHub-Dokumentations-URLs (`https://wsj-br.github.io/duplistatus/...`)
- Konvertiert Bildpfade von `/img/` zu `documentation/static/img/` für GitHub-Kompatibilität
- Entfernt den Migrations-IMPORTANT-Block und fügt einen Abschnitt mit Migrationsinformationen mit einem Link zur Docusaurus-Dokumentation hinzu
- Generiert ein Inhaltsverzeichnis mit `doctoc`
- Generiert `README_dockerhub.md` mit Docker-Hub-kompatibler Formatierung (konvertiert Bilder und Links zu absoluten URLs, konvertiert GitHub-Warnungen in Emoji-basiertes Format)
- Generiert GitHub-Versionshinweise (`RELEASE_NOTES_github_VERSION.md`) aus `documentation/docs/release-notes/VERSION.md` (konvertiert Links und Bilder zu absoluten URLs)

**Hinweis:** Sie müssen `doctoc` global installiert haben, um die TOC-Generierung zu ermöglichen:

```bash
npm install -g doctoc
```

## README für Docker Hub aktualisieren {#update-readme-for-docker-hub}

Das Skript `generate-readme-from-intro.sh` generiert automatisch `README_dockerhub.md` mit Docker-Hub-kompatibler Formatierung. Es:

- Kopiert `README.md` zu `README_dockerhub.md`
- Konvertiert relative Bildpfade zu absoluten GitHub-Raw-URLs
- Konvertiert relative Dokumentlinks zu absoluten GitHub-Blob-URLs
- Konvertiert GitHub-Stil-Warnungen (`[!NOTE]`, `[!WARNING]` usw.) zu Emoji-basiertem Format für bessere Docker-Hub-Kompatibilität
- Stellt sicher, dass alle Bilder und Links auf Docker Hub korrekt funktionieren

## GitHub-Versionshinweise generieren {#generate-github-release-notes}

Das Skript `generate-readme-from-intro.sh` generiert automatisch GitHub-Versionshinweise bei der Ausführung. Es:

- Liest die Versionshinweise aus `documentation/docs/release-notes/VERSION.md` (wobei VERSION aus `package.json` extrahiert wird)
- Ändert den Titel von "# Version xxxx" zu "# Versionshinweise - Version xxxxx"
- Konvertiert relative Markdown-Links zu absoluten GitHub-Dokumentations-URLs (`https://wsj-br.github.io/duplistatus/...`)
- Konvertiert Bildpfade zu GitHub-Raw-URLs (`https://raw.githubusercontent.com/wsj-br/duplistatus/main/documentation/static/img/...`) für die ordnungsgemäße Anzeige in Versionsbeschreibungen
- Verarbeitet relative Pfade mit `../`-Präfix
- Behält absolute URLs (http:// und https://) unverändert bei
- Erstellt `RELEASE_NOTES_github_VERSION.md` im Projektstammverzeichnis

**Beispiel:**

```bash
# Dies generiert sowohl README.md als auch RELEASE_NOTES_github_VERSION.md {#this-will-generate-both-readmemd-and-release_notes_github_versionmd}
./scripts/generate-readme-from-intro.sh
```

Die generierte Versionshilfedatei kann direkt in die GitHub-Versionsbeschreibung kopiert und eingefügt werden. Alle Links und Bilder funktionieren korrekt im GitHub-Versionskontext.

**Hinweis:** Die generierte Datei ist temporär und kann nach der Erstellung der GitHub-Version gelöscht werden. Es wird empfohlen, `RELEASE_NOTES_github_*.md` zu `.gitignore` hinzuzufügen, wenn Sie diese Dateien nicht committen möchten.

## Screenshots für die Dokumentation aufnehmen {#take-screenshots-for-documentation}

```bash
tsx scripts/take-screenshots.ts
```

Dieses Skript erstellt automatisch Screenshots der Anwendung für Dokumentationszwecke. Es:

- Startet einen Headless-Browser (Puppeteer)
- Meldet sich als Admin und normaler Benutzer an
- Navigiert durch verschiedene Seiten (Dashboard, Serverdetails, Einstellungen usw.)
- Erstellt Screenshots bei verschiedenen Viewport-Größen
- Speichert Screenshots in `documentation/static/img/`

**Anforderungen:**

- Der Entwicklungsserver muss auf `http://localhost:8666` ausgeführt werden
- Umgebungsvariablen müssen gesetzt werden:
  - `ADMIN_PASSWORD`: Passwort für Admin-Konto
  - `USER_PASSWORD`: Passwort für normales Benutzerkonto

**Beispiel:**

```bash
export ADMIN_PASSWORD="your-admin-password"
export USER_PASSWORD="your-user-password"
tsx scripts/take-screenshots.ts
```

**Generierte Screenshots:**

Das Skript generiert die folgenden Screenshots (gespeichert in `documentation/static/img/`):

**Dashboard-Screenshots:**

- `screen-main-dashboard-card-mode.png` - Dashboard im Karten-/Übersichtsmodus
- `screen-main-dashboard-table-mode.png` - Dashboard im Tabellenmodus
- `screen-overdue-backup-hover-card.png` - Überfällige Sicherung Hover-Karte/Tooltip
- `screen-backup-tooltip.png` - Regulärer Sicherungs-Tooltip (Hover über Sicherung in Kartenansicht)

**Server-Details-Screenshots:**

- `screen-server-backup-list.png` - Seite mit Sicherungsliste des Servers
- `screen-backup-history.png` - Abschnitt der Sicherungsverlaufstabelle
- `screen-backup-detail.png` - Seite mit einzelnen Sicherungsdetails
- `screen-metrics.png` - Metriken-Diagramm mit Sicherungsmetriken im Zeitverlauf

**Erfassen/Konfiguration-Screenshots:**

- `screen-collect-button-popup.png` - Popup zum Sammeln von Sicherungsprotokollen
- `screen-collect-button-right-click-popup.png` - Menü zum Sammeln aller mit Rechtsklick
- `screen-collect-backup-logs.png` - Schnittstelle zum Sammeln von Sicherungsprotokollen
- `screen-duplicati-configuration.png` - Duplicati-Konfigurationsmenü

**Einstellungen-Screenshots:**

- `screen-settings-left-panel-admin.png` - Einstellungsseitenleiste (Admin-Ansicht)
- `screen-settings-left-panel-non-admin.png` - Einstellungsseitenleiste (Nicht-Admin-Ansicht)
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
- `screen-settings-ntfy-configure-device-popup.png` - NTFY-Popup zum Konfigurieren des Geräts
- `screen-settings-backup-notifications-detail.png` - Seite mit Details zu Backup-Benachrichtigungen

## Dokumentation bereitstellen {#deploying-the-documentation}

Um die Dokumentation auf GitHub Pages bereitzustellen, müssen Sie ein persönliches GitHub-Zugriffstoken generieren. Gehen Sie zu [GitHub Personal Access Tokens](https://github.com/settings/tokens) und erstellen Sie ein neues Token mit dem Bereich `repo`.

Wenn Sie das Token haben, führen Sie den folgenden Befehl aus, um das Token im Git-Anmeldeinformationsspeicher zu speichern:

```bash
./setup-git-credentials.sh
```

Führen Sie dann den folgenden Befehl aus, um die Dokumentation auf GitHub Pages bereitzustellen:

```bash
pnpm run deploy
```

Dies erstellt die Dokumentation und pusht sie in den Branch `gh-pages` des Repositorys. Die Dokumentation ist dann unter [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/) verfügbar.

## Arbeiten mit Dokumentation {#working-with-documentation}

- Dokumentationsdateien werden in Markdown (`.md`) geschrieben und befinden sich in `documentation/docs/`
- Die Seitenleistennavigation wird in `documentation/sidebars.ts` konfiguriert
- Die Docusaurus-Konfiguration befindet sich in `documentation/docusaurus.config.ts`
- Benutzerdefinierte React-Komponenten können zu `documentation/src/components/` hinzugefügt werden
- Statische Assets (Bilder, PDFs usw.) befinden sich in `documentation/static/`
- Die Hauptdokumentationsstartseite ist `documentation/docs/intro.md`, die als Quelle für die Generierung von `README.md` verwendet wird
