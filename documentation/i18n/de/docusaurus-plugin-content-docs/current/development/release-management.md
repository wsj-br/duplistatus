---
translation_last_updated: '2026-05-06T23:20:18.161Z'
source_file_mtime: '2026-05-06T23:18:51.394Z'
source_file_hash: 1b0cbbe3a12f7a343230d78134d9363a4281a2f7fe7a9366fa6509e427ba450b
translation_language: de
source_file_path: documentation/docs/development/release-management.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Versionsverwaltung {#release-management}

## Versionierung (Semantische Versionierung) {#versioning-semantic-versioning}

Das Projekt folgt Semantic Versioning (SemVer) mit dem Format `MAJOR.MINOR.PATCH`:

- **MAJOR** Version (x.0.0): Wann Sie inkompatible API-Änderungen vornehmen
- **MINOR** Version (0.x.0): Wann Sie Funktionalität auf rückwärtskompatible Weise hinzufügen
- **PATCH** Version (0.0.x): Wann Sie rückwärtskompatible Fehlerbehebungen vornehmen

## Checkliste vor der Veröffentlichung {#pre-release-checklist}

Vor der Veröffentlichung einer neuen Version müssen Sie sicherstellen, dass Sie Folgendes abgeschlossen haben:

- [ ] Alle Änderungen sind im `vMAJOR.MINOR.x`-Branch committet und gepusht.
- [ ] Die Versionsnummer wurde in `package.json` aktualisiert (verwenden Sie `scripts/update-version.sh`, um sie über mehrere Dateien hinweg zu synchronisieren).
- [ ] Alle Tests laufen erfolgreich (im Entwicklungsmodus, lokal, Docker und Podman). 
- [ ] Starten Sie einen Docker-Container mit `pnpm docker:up` und führen Sie `scripts/compare-versions.sh` aus, um die Versionsübereinstimmung zwischen Entwicklungsumgebung und Docker-Container zu überprüfen (erfordert einen laufenden Docker-Container). Dieses Skript vergleicht SQLite-Versionen nur nach Hauptversion (z. B. werden 3.45.1 und 3.51.1 als kompatibel angesehen) und vergleicht Node-, npm- und Duplistatus-Versionen exakt.
- [ ] Dokumentation ist aktuell, aktualisieren Sie die Screenshots (verwenden Sie `pnpm take-screenshots`)
- [ ] Release Notes sind in `documentation/docs/release-notes/VERSION.md` vorbereitet.
- [ ] Führen Sie `scripts/generate-readme-from-intro.sh` aus, um `README.md` mit der neuen Version und allen Änderungen aus `documentation/docs/intro.md` zu aktualisieren. Dieses Skript generiert automatisch `README_dockerhub.md` und `RELEASE_NOTES_github_VERSION.md`.

## Freigabeprozess – Übersicht {#release-process-overview}

Der empfohlene Releaseprozess verwendet **GitHub Pull Requests und Releases** (siehe unten). Dies bietet bessere Sichtbarkeit, Überprüfungsmöglichkeiten und löst automatisch Docker-Image-Builds aus. Die Befehlszeilenmethode ist als Alternative verfügbar.

## Methode 1: GitHub Pull Request und Release (Empfohlen) {#method-1-github-pull-request-and-release-recommended}

Dies ist die bevorzugte Methode, da sie bessere Nachverfolgbarkeit bietet und Docker-Builds automatisch auslöst.

### Schritt 1: Pull Request erstellen {#step-1-create-pull-request}

1. Navigieren Sie zum [duplistatus-Repository](https://github.com/wsj-br/duplistatus) auf GitHub.
2. Klicken Sie auf den Reiter **"Pull requests"**.
3. Klicken Sie auf **"New pull request"**.
4. Wählen Sie den **Basis-Branch** `master` und den **Vergleichs-Branch** `vMAJOR.MINOR.x`.
5. Prüfen Sie die Änderungsvorschau, um sicherzustellen, dass alles korrekt ist.
6. Klicken Sie auf **"Create pull request"**.
7. Geben Sie einen aussagekräftigen Titel ein (z. B. "Release v1.2.0") und fassen Sie die Änderungen in der Beschreibung zusammen.
8. Klicken Sie erneut auf **"Create pull request"**.

### Schritt 2: Pull Request zusammenführen {#step-2-merge-the-pull-request}

Nach Überprüfung des Pull Requests:

1. Falls es keine Konflikte gibt, klicken Sie auf die grüne Schaltfläche **"Pull Request zusammenführen"**.
2. Wählen Sie Ihre Merge-Strategie (normalerweise "Merge Commit erstellen").
3. Bestätigen Sie den Merge.

### Schritt 3: GitHub-Release erstellen {#step-3-create-github-release}

Sobald der Merge abgeschlossen ist, erstellen Sie ein GitHub-Release:

1. Navigieren Sie zum [duplistatus-Repository](https://github.com/wsj-br/duplistatus) auf GitHub.
2. Gehen Sie zum Abschnitt **"Releases"** (oder klicken Sie auf "Releases" in der rechten Seitenleiste).
3. Klicken Sie auf **"Draft a new release"**.
4. Geben Sie im Feld **"Choose a tag"** die neue Versionsnummer im Format `vMAJOR.MINOR.PATCH` ein (z. B. `v1.2.0`). Dadurch wird ein neuer Tag erstellt.
5. Wählen Sie `master` als Ziel-Branch.
6. Fügen Sie einen **Release-Titel** hinzu (z. B. "Release v1.2.0").
7. Fügen Sie eine **Beschreibung** hinzu, in der die Änderungen dieser Version dokumentiert sind. Sie können:
   - Den Inhalt aus `RELEASE_NOTES_github_VERSION.md` übernehmen (erstellt durch `scripts/generate-readme-from-intro.sh`)
   - Oder auf die Release Notes in `documentation/docs/release-notes/` verweisen (beachten Sie jedoch, dass relative Links in GitHub-Releases nicht funktionieren)
8. Klicken Sie auf **"Publish release"**.

**Was automatisch geschieht:**
- Ein neuer Git-Tag wird erstellt
- Der Workflow "Build and Publish Docker Image" wird ausgelöst
- Docker-Images werden für die Architekturen AMD64 und ARM64 gebaut
- Die Images werden gepusht nach:
  - Docker Hub: `wsjbr/duplistatus:VERSION` und `wsjbr/duplistatus:latest` (wenn es sich um das aktuellste Release handelt)
  - GitHub Container Registry: `ghcr.io/wsj-br/duplistatus:VERSION` und `ghcr.io/wsj-br/duplistatus:latest` (wenn es sich um das aktuellste Release handelt)

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

Merge des `vMAJOR.MINOR.x`-Branches in `master`:

```bash
# Merge the vMAJOR.MINOR.x branch into master
git merge vMAJOR.MINOR.x
```

Wenn es **Merge-Konflikte** gibt, lösen Sie diese manuell:
1. Bearbeiten Sie die Dateien mit Konflikten
2. Fügen Sie die aufgelösten Dateien hinzu: `git add <file>`
3. Schließen Sie den Merge ab: `git commit`

### Schritt 3: Das Release taggen {#step-3-tag-the-release}

Erstellen Sie ein kommentiertes Tag für die neue Version:

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

Das Flag `-a` erstellt ein annotiertes Tag (empfohlen für Releases), und das Flag `-m` fügt eine Nachricht hinzu.

### Schritt 4: Zu GitHub hochladen {#step-4-push-to-github}

Pushen Sie sowohl den aktualisierten `master`-Branch als auch das neue Tag:

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

Alternativ können Sie alle Tags auf einmal pushen: `git push --tags`

### Schritt 5: GitHub-Release erstellen {#step-5-create-github-release}

Nach dem Pushen des Tags erstellen Sie ein GitHub Release (siehe Methode 1, Schritt 3), um den Docker-Build-Workflow auszulösen.

## Manueller Docker-Image-Build {#manual-docker-image-build}

Um den Docker-Image-Build-Workflow manuell auszulösen, ohne ein Release zu erstellen:

1. Navigieren Sie zum [duplistatus-Repository](https://github.com/wsj-br/duplistatus) auf GitHub.
2. Klicken Sie auf den **"Aktionen"**-Reiter.
3. Wählen Sie den Workflow **"Build and Publish Docker Image"**.
4. Klicken Sie auf **"Run workflow"**.
5. Wählen Sie den Branch, aus dem gebaut werden soll (typischerweise `master`).
6. Klicken Sie erneut auf **"Run workflow"**.

**Hinweis:** Manuelle Builds taggen Bilder nicht automatisch als `latest`, es sei denn, der Workflow bestimmt, dass es sich um die neueste Version handelt.

## Dokumentation veröffentlichen {#releasing-documentation}

Die Dokumentation wird auf [GitHub Pages](https://wsj-br.github.io/duplistatus/) gehostet und wird separat vom Anwendungsrelease bereitgestellt. Führen Sie diese Schritte aus, um aktualisierte Dokumentation freizugeben:

### Voraussetzungen {#prerequisites}

1. Stellen Sie sicher, dass Sie über ein GitHub Personal Access Token mit dem Bereich `repo` verfügen.
2. Richten Sie Git-Anmeldedaten ein (einmalige Einrichtung):

```bash
cd documentation
./setup-git-credentials.sh
```

Dies fordert Sie auf, Ihr GitHub Personal Access Token einzugeben, und speichert es sicher.

### Dokumentation bereitstellen {#deploy-documentation}

1. Navigieren Sie zum Verzeichnis `documentation`:

```bash
cd documentation
```

2. Stellen Sie sicher, dass alle Dokumentationsänderungen in das Repository übernommen und gepusht werden.

3. Dokumentation erstellen und bereitstellen:

```bash
pnpm run deploy
```

Dieser Befehl wird:
- Die Docusaurus-Dokumentationswebsite erstellen
- Die erstellte Website in den Branch `gh-pages` übertragen
- Die Dokumentation unter [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/) verfügbar machen

### Wann sollte Dokumentation bereitgestellt werden {#when-to-deploy-documentation}

Dokumentationsaktualisierungen bereitstellen:
- Nach dem Zusammenführen von Dokumentationsänderungen in `master`
- Bei der Veröffentlichung einer neuen Version (falls die Dokumentation aktualisiert wurde)
- Nach erheblichen Dokumentationsverbesserungen

**Hinweis:** Die Dokumentationsbereitstellung ist unabhängig von Anwendungsversionen. Sie können die Dokumentation mehrmals zwischen Anwendungsversionen bereitstellen.

### Vorbereitung von Versionshinweisen für GitHub {#preparing-release-notes-for-github}

Das Skript `generate-readme-from-intro.sh` generiert automatisch GitHub-Versionshinweise bei der Ausführung. Es liest die Versionshinweise aus `documentation/docs/release-notes/VERSION.md` (wobei VERSION aus `package.json` extrahiert wird) und erstellt `RELEASE_NOTES_github_VERSION.md` im Projektstammverzeichnis.

**Beispiel:**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

Die generierte Releasehinweis-Datei kann direkt in die GitHub-Release-Beschreibung kopiert werden. Alle Links und Bilder funktionieren im Kontext des GitHub-Releases korrekt.

**Hinweis:** Die generierte Datei ist temporär und kann nach der Erstellung des GitHub-Release gelöscht werden. Es wird empfohlen, `RELEASE_NOTES_github_*.md` zu `.gitignore` hinzuzufügen, wenn Sie diese Dateien nicht committen möchten.

### README.md aktualisieren {#update-readmemd}

Wenn Sie Änderungen an `documentation/docs/intro.md` vorgenommen haben, generieren Sie die Repository-Datei `README.md` neu:

```bash
./scripts/generate-readme-from-intro.sh
```

Dieses Skript:
- Extrahiert die Version aus `package.json`
- Generiert `README.md` aus `documentation/docs/intro.md` (wandelt Docusaurus-Hinweise in GitHub-ähnliche Warnungen um, konvertiert Links und Bilder)
- Erstellt `README_dockerhub.md` für Docker Hub (mit Docker-Hub-kompatibler Formatierung)
- Generiert `RELEASE_NOTES_github_VERSION.md` aus `documentation/docs/release-notes/VERSION.md` (wandelt Links und Bilder in absolute URLs um)
- Aktualisiert das Inhaltsverzeichnis mithilfe von `doctoc`

Committen und pushen Sie die aktualisierte `README.md` zusammen mit Ihrem Release.
