---
translation_last_updated: '2026-01-31T00:51:23.323Z'
source_file_mtime: '2026-01-29T17:58:29.895Z'
source_file_hash: fae6b911d504b61b
translation_language: de
source_file_path: development/release-management.md
---
# Versionsverwaltung {#release-management}

## Versionierung (Semantische Versionierung) {#versioning-semantic-versioning}

Das Projekt folgt der semantischen Versionierung (SemVer) mit dem Format `MAJOR.MINOR.PATCH`:

- **MAJOR** Version (x.0.0): Wann Sie inkompatible API-Änderungen vornehmen
- **MINOR** Version (0.x.0): Wann Sie Funktionalität auf abwärtskompatible Weise Hinzufügen
- **PATCH** Version (0.0.x): Wann Sie abwärtskompatible Fehlerbehebungen vornehmen

## Checkliste vor der Veröffentlichung {#pre-release-checklist}

Vor der Veröffentlichung einer neuen Version müssen Sie sicherstellen, dass Sie Folgendes abgeschlossen haben:

- [ ] Alle Änderungen sind committed und in den `vMAJOR.MINOR.x`-Branch gepusht.
- [ ] Die Versionsnummer ist in `package.json` aktualisiert (verwenden Sie `scripts/update-version.sh`, um sie über alle Dateien hinweg zu synchronisieren).
- [ ] Alle Tests bestehen (im Entwicklungsmodus, lokal, Docker und Podman).
- [ ] Starten Sie einen Docker-Container mit `pnpm docker-up` und führen Sie `scripts/compare-versions.sh` aus, um die Versionskonsistenz zwischen Entwicklungsumgebung und Docker-Container zu bestätigen (erfordert, dass der Docker-Container läuft). Dieses Skript vergleicht SQLite-Versionen nur nach Hauptversion (z. B. werden 3.45.1 und 3.51.1 als kompatibel betrachtet) und vergleicht Node-, npm- und Duplistatus-Versionen exakt.
- [ ] Dokumentation ist aktuell, aktualisieren Sie die Screenshots (verwenden Sie `pnpm take-screenshots`).
- [ ] Versionshinweise sind in `documentation/docs/release-notes/VERSION.md` vorbereitet.
- [ ] Führen Sie `scripts/generate-readme-from-intro.sh` aus, um `README.md` mit der neuen Version und allen Änderungen aus `documentation/docs/intro.md` zu aktualisieren. Dieses Skript generiert auch automatisch `README_dockerhub.md` und `RELEASE_NOTES_github_VERSION.md`.

## Übersicht des Release-Prozesses {#release-process-overview}

Der empfohlene Veröffentlichungsprozess nutzt **GitHub Pull Requests und Releases** (siehe unten). Dies bietet bessere Sichtbarkeit, Überprüfungsfunktionen und löst automatisch Docker-Image-Builds aus. Die Befehlszeilenmethode steht als Alternative zur Verfügung.

## Methode 1: GitHub Pull Request und Release (Empfohlen) {#method-1-github-pull-request-and-release-recommended}

Dies ist die bevorzugte Methode, da sie eine bessere Nachverfolgbarkeit bietet und Docker-Builds automatisch auslöst.

### Schritt 1: Pull Request erstellen {#step-1-create-pull-request}

1. Navigieren Sie zum [duplistatus-Repository](https://github.com/wsj-br/duplistatus) auf GitHub.
2. Klicken Sie auf die Registerkarte **„Pull requests"**.
3. Klicken Sie auf **„New pull request"** (Neuer Pull Request).
4. Legen Sie den **Base Branch** auf `master` und den **Compare Branch** auf `vMAJOR.MINOR.x` fest.
5. Überprüfen Sie die Änderungsvorschau, um sicherzustellen, dass alles korrekt aussieht.
6. Klicken Sie auf **„Create pull request"** (Pull Request erstellen).
7. Fügen Sie einen aussagekräftigen Titel hinzu (z. B. „Release v1.2.0") und eine Beschreibung, die die Änderungen zusammenfasst.
8. Klicken Sie erneut auf **„Create pull request"** (Pull Request erstellen).

### Schritt 2: Pull Request zusammenführen {#step-2-merge-the-pull-request}

Nach Überprüfung des Pull Requests:

1. Wenn es keine Konflikte gibt, klicken Sie auf die grüne Schaltfläche **"Merge pull request"**.
2. Wählen Sie Ihre Merge-Strategie (normalerweise "Create a merge commit").
3. Bestätigen Sie den Merge.

### Schritt 3: GitHub-Release erstellen {#step-3-create-github-release}

Sobald die Zusammenführung abgeschlossen ist, erstellen Sie ein GitHub-Release:

1. Navigieren Sie zum [duplistatus-Repository](https://github.com/wsj-br/duplistatus) auf GitHub.
2. Gehen Sie zum Bereich **"Releases"** (oder klicken Sie in der rechten Seitenleiste auf „Releases").
3. Klicken Sie auf **"Neue Version entwerfen."**
4. Geben Sie im Feld **"Tag auswählen"** Ihre neue Versionsnummer im Format `vMAJOR.MINOR.PATCH` ein (z. B. `v1.2.0`). Dies erstellt einen neuen Tag.
5. Wählen Sie `master` als Zielzweig aus.
6. Fügen Sie einen **Release-Titel** hinzu (z. B. „Release v1.2.0").
7. Fügen Sie eine **Beschreibung** hinzu, die die Änderungen in dieser Version dokumentiert. Sie können:
   - Den Inhalt aus `RELEASE_NOTES_github_VERSION.md` kopieren (generiert durch `scripts/generate-readme-from-intro.sh`)
   - Oder auf Versionshinweise aus `documentation/docs/release-notes/` verweisen (beachten Sie jedoch, dass relative Links in GitHub-Releases nicht funktionieren)
8. Klicken Sie auf **"Version veröffentlichen."**

**Was automatisch geschieht:**
- Ein neues Git-Tag wird erstellt
- Der Workflow „Build and Publish Docker Image" wird ausgelöst
- Docker-Images werden für AMD64- und ARM64-Architekturen erstellt
- Images werden in folgende Registries gepusht:
  - Docker Hub: `wsjbr/duplistatus:VERSION` und `wsjbr/duplistatus:latest` (falls dies die neueste Version ist)
  - GitHub Container Registry: `ghcr.io/wsj-br/duplistatus:VERSION` und `ghcr.io/wsj-br/duplistatus:latest` (falls dies die neueste Version ist)

## Methode 2: Befehlszeile (Alternative) {#method-2-command-line-alternative}

Wenn Sie die Befehlszeile bevorzugen, führen Sie diese Schritte aus:

### Schritt 1: Lokalen Master-Branch aktualisieren {#step-1-update-local-master-branch}

Stellen Sie sicher, dass Ihr lokaler `master`-Branch auf dem neuesten Stand ist:

```bash
# Checkout the master branch
git checkout master

# Pull the latest changes from the remote repository
git pull origin master
```

### Schritt 2: Entwicklungszweig zusammenführen {#step-2-merge-development-branch}

Führen Sie den `vMAJOR.MINOR.x`-Branch in `master` zusammen:

```bash
# Merge the vMAJOR.MINOR.x branch into master
git merge vMAJOR.MINOR.x
```

Wenn es **Merge-Konflikte** gibt, lösen Sie diese manuell:
1. Bearbeiten Sie die Dateien mit Konflikten
2. Staging der aufgelösten Dateien: `git add <file>`
3. Schließen Sie den Merge ab: `git commit`

### Schritt 3: Das Release taggen {#step-3-tag-the-release}

Erstellen Sie ein annotiertes Tag für die neue Version:

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

Das Flag `-a` erstellt ein annotiertes Tag (empfohlen für Releases), und das Flag `-m` fügt eine Nachricht hinzu.

### Schritt 4: Zu GitHub übertragen {#step-4-push-to-github}

Übertragen Sie sowohl den aktualisierten `master`-Branch als auch das neue Tag:

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

Alternativ können Sie alle Tags auf einmal pushen: `git push --tags`

### Schritt 5: GitHub-Release erstellen {#step-5-create-github-release}

Nach dem Pushen des Tags erstellen Sie ein GitHub-Release (siehe Methode 1, Schritt 3), um den Docker-Build-Workflow auszulösen.

## Manueller Docker-Image-Build {#manual-docker-image-build}

Um den Docker-Image-Build-Workflow manuell auszulösen, ohne eine Veröffentlichung zu erstellen:

1. Navigieren Sie zum [duplistatus-Repository](https://github.com/wsj-br/duplistatus) auf GitHub.
2. Klicken Sie auf die Registerkarte **"Actions"**.
3. Wählen Sie den Workflow **"Build and Publish Docker Image"** aus.
4. Klicken Sie auf **"Run workflow"**.
5. Wählen Sie den Branch aus, von dem aus erstellt werden soll (normalerweise `master`).
6. Klicken Sie erneut auf **"Run workflow"**.

**Hinweis:** Manuelle Builds taggen Images nicht automatisch als `latest`, es sei denn, der Workflow bestimmt, dass es sich um die neueste Version handelt.

## Dokumentation veröffentlichen {#releasing-documentation}

Die Dokumentation wird auf [GitHub Pages](https://wsj-br.github.io/duplistatus/) gehostet und wird separat vom Anwendungsrelease bereitgestellt. Führen Sie diese Schritte aus, um aktualisierte Dokumentation freizugeben:

### Voraussetzungen {#prerequisites}

1. Stellen Sie sicher, dass Sie über ein GitHub Personal Access Token mit dem `repo`-Bereich verfügen.
2. Richten Sie Git-Anmeldedaten ein (einmalige Einrichtung):

```bash
cd documentation
./setup-git-credentials.sh
```

Dies fordert Sie zur Eingabe Ihres GitHub Personal Access Token auf und speichert ihn sicher.

### Dokumentation bereitstellen {#deploy-documentation}

1. Navigieren Sie zum Verzeichnis `documentation`:

```bash
cd documentation
```

2. Stellen Sie sicher, dass alle Dokumentationsänderungen in das Repository eingecheckt und gepusht werden.

3. Dokumentation erstellen und bereitstellen:

```bash
pnpm run deploy
```

Dieser Befehl wird:
- Die Docusaurus-Dokumentationswebsite erstellen
- Die erstellte Website in den Branch `gh-pages` übertragen
- Die Dokumentation unter [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/) verfügbar machen

### Wann die Dokumentation bereitgestellt werden sollte {#when-to-deploy-documentation}

Bereitstellung von Dokumentationsaktualisierungen:
- Nach dem Zusammenführen von Dokumentationsänderungen in `master`
- Wann eine neue Version veröffentlicht wird (falls die Dokumentation aktualisiert wurde)
- Nach erheblichen Dokumentationsverbesserungen

**Hinweis:** Die Bereitstellung der Dokumentation ist unabhängig von Anwendungsversionen. Sie können die Dokumentation mehrmals zwischen Anwendungsversionen bereitstellen.

### Vorbereitung von Versionshinweisen für GitHub {#preparing-release-notes-for-github}

Das Skript `generate-readme-from-intro.sh` generiert automatisch GitHub-Versionshinweise bei der Ausführung. Es liest die Versionshinweise aus `documentation/docs/release-notes/VERSION.md` (wobei VERSION aus `package.json` extrahiert wird) und erstellt `RELEASE_NOTES_github_VERSION.md` im Projektstammverzeichnis.

**Beispiel:**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

Die generierte Releasenotes-Datei kann direkt in die GitHub-Release-Beschreibung kopiert und eingefügt werden. Alle Links und Bilder funktionieren korrekt im GitHub-Release-Kontext.

**Hinweis:** Die generierte Datei ist temporär und kann nach der Erstellung des GitHub-Release gelöscht werden. Es wird empfohlen, `RELEASE_NOTES_github_*.md` zu `.gitignore` hinzuzufügen, wenn Sie diese Dateien nicht committen möchten.

### README.md aktualisieren {#update-readmemd}

Wenn Sie Änderungen an `documentation/docs/intro.md` vorgenommen haben, generieren Sie die Repository-Datei `README.md` neu:

```bash
./scripts/generate-readme-from-intro.sh
```

Dieses Skript:
- Extrahiert die Version aus `package.json`
- Generiert `README.md` aus `documentation/docs/intro.md` (konvertiert Docusaurus-Warnungen in GitHub-Style-Warnungen, konvertiert Links und Bilder)
- Erstellt `README_dockerhub.md` für Docker Hub (mit Docker-Hub-kompatibler Formatierung)
- Generiert `RELEASE_NOTES_github_VERSION.md` aus `documentation/docs/release-notes/VERSION.md` (konvertiert Links und Bilder in absolute URLs)
- Aktualisiert das Inhaltsverzeichnis mit `doctoc`

Übertragen Sie die aktualisierte `README.md` zusammen mit Ihrer Veröffentlichung und führen Sie einen Commit durch.
