---
translation_last_updated: '2026-02-16T00:13:31.600Z'
source_file_mtime: '2026-02-01T03:16:19.468Z'
source_file_hash: 429afe0fb4559ab7
translation_language: de
source_file_path: development/how-i-build-with-ai.md
---
# Wie ich diese Anwendung mit KI-Tools erstellt habe {#how-i-build-this-application-using-ai-tools}

# Motivation {#motivation}

Ich begann, Duplicati als Sicherungstool für meine Home-Server zu verwenden. Ich habe das offizielle [Duplicati Dashboard](https://app.duplicati.com/) und [Duplicati Monitoring](https://www.duplicati-monitoring.com/) ausprobiert, hatte aber zwei Hauptanforderungen: (1) selbstgehostet; und (2) eine freiliegende API für die Integration mit [Homepage](https://gethomepage.dev/), da ich diese für die Homepage meines Home Labs verwende.

Ich habe auch versucht, mich direkt mit jedem Duplicati-Server im Netzwerk zu verbinden, aber die Authentifizierungsmethode war nicht mit Homepage kompatibel (oder ich war nicht in der Lage, sie ordnungsgemäß zu konfigurieren).

Da ich auch mit KI-Code-Tools experimentierte, beschloss ich, KI zum Erstellen dieses Tools zu nutzen. Hier ist der Prozess, den ich verwendet habe...

# Verwendete Tools {#tools-used}

1. Für die UI: [Google's Firebase Studio](https://firebase.studio/)
2. Für die Implementierung: Cursor (https://www.cursor.com/)

:::note
Ich habe Firebase für die Benutzeroberfläche verwendet, aber Sie können auch [v0.app](https://v0.app/) oder ein anderes Tool verwenden, um den Prototyp zu generieren. Ich habe Cursor zur Generierung der Implementierung verwendet, aber Sie können auch andere Tools wie VS Code/Copilot, Windsurf usw. verwenden.
:::

# Benutzeroberfläche {#ui}

Ich habe ein neues Projekt in [Firebase Studio](https://studio.firebase.google.com/) erstellt und diese Eingabeaufforderung in der Funktion „App mit KI prototypisieren" verwendet:

> Eine Web-Dashboard-Anwendung mit Tailwind/React zur Konsolidierung der von der Duplicati-Sicherungslösung gesendeten Sicherungsergebnisse in einer SQLite3-Datenbank unter Verwendung der Option --send-http-url (JSON-Format) mehrerer Maschinen, mit Verfolgung des Status der Sicherung, der Größe und der Hochladegrößen.
> 
> Die erste Seite des Dashboards sollte eine Tabelle mit der letzten Sicherung jeder Maschine enthalten, einschließlich des Maschinennamens, der Anzahl der in der Datenbank gespeicherten Sicherungen, des Status der letzten Sicherung, der Dauer (hh:mm:ss), der Anzahl der Warnungen und Fehler.
> 
> Beim Anklicken einer Maschinenzeile sollte eine Detailseite der ausgewählten Maschine mit einer Liste der gespeicherten Sicherungen (paginiert) angezeigt werden, einschließlich des Sicherungsnamens, des Datums und der Uhrzeit der Sicherung, wie lange dies her ist, des Status, der Anzahl der Warnungen und Fehler, der Anzahl der Dateien, der Größe der Dateien, der hochgeladenen Größe und der Gesamtgröße des Speicherplatzes. Fügen Sie auf der Detailseite auch ein Diagramm mit Tremor ein, das die Entwicklung der folgenden Felder zeigt: hochgeladene Größe; Dauer in Minuten, Anzahl der untersuchten Dateien, Größe der untersuchten Dateien. Das Diagramm sollte jeweils ein Feld darstellen, mit einer Dropdown-Liste zur Auswahl des gewünschten Feldes. Das Diagramm muss alle in der Datenbank gespeicherten Sicherungen anzeigen, nicht nur die in der paginierten Tabelle angezeigten.
> 
> Die Anwendung muss einen API-Endpunkt bereitstellen, um die Beiträge vom Duplicati-Server zu empfangen, und einen weiteren API-Endpunkt, um alle Details der letzten Sicherung einer Maschine als JSON abzurufen.
> 
> Das Design sollte modern, responsiv und mit Symbolen und anderen visuellen Hilfsmitteln versehen sein, um die Lesbarkeit zu verbessern. Der Code sollte sauber, prägnant und leicht zu warten sein. Verwenden Sie moderne Tools wie pnpm zur Verwaltung von Abhängigkeiten.
> 
> Die Anwendung muss ein wählbares dunkles und helles Thema haben.
> 
> Die Datenbank sollte diese Felder speichern, die vom Duplicati-JSON empfangen werden:

```json
"{ "Data": { "DeletedFiles": 0, "DeletedFolders": 0, "ModifiedFiles": 0, "ExaminedFiles": 15399, "OpenedFiles": 1861, "AddedFiles": 1861, "SizeOfModifiedFiles": 0, "SizeOfAddedFiles": 13450481, "SizeOfExaminedFiles": 11086692615, "SizeOfOpenedFiles": 13450481, "NotProcessedFiles": 0, "AddedFolders": 419, "TooLargeFiles": 0, "FilesWithError": 0, "ModifiedFolders": 0, "ModifiedSymlinks": 0, "AddedSymlinks": 0, "DeletedSymlinks": 0, "PartialBackup": false, "Dryrun": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "EndTime": "2025-04-21T23:46:38.3568274Z", "BeginTime": "2025-04-21T23:45:46.9712217Z", "Duration": "00:00:51.3856057", "WarningsActualLength": 0, "ErrorsActualLength": 0, "BackendStatistics": { "BytesUploaded": 8290314, "BytesDownloaded": 53550393, "KnownFileSize": 9920312634, "LastBackupDate": "2025-04-22T00:45:46+01:00", "BackupListCount": 6, "ReportedQuotaError": false, "ReportedQuotaWarning": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "BeginTime": "2025-04-21T23:45:46.9712252Z", "Duration": "00:00:00", "WarningsActualLength": 0, "ErrorsActualLength": 0 } }, "Extra": { "OperationName": "Backup", "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", "machine-name": "WSJ-SER5", "backup-name": "WSJ-SER5 Local files", "backup-id": "DB-2" } } "
```

Dies hat einen App Blueprint generiert, den ich dann leicht modifiziert habe (wie unten gezeigt), bevor ich auf `Prototype this App` geklickt habe:

![appblueprint](/img/app-blueprint.png)

Ich verwendete diese Prompts später, um das Design und Verhalten anzupassen und zu verfeinern:

> Entfernen Sie die Schaltfläche „Details anzeigen" von der Dashboard-Übersichtseite und den Link auf dem Maschinennamen. Wenn der Benutzer irgendwo in der Zeile klickt, wird die Detailseite eingeblendet.

> Verwenden Sie beim Darstellen von Größen in Bytes eine automatische Skalierung (KB, MB, GB, TB).

> Verschieben Sie auf der Detailseite das Diagramm nach der Tabelle. Ändern Sie die Farbe des Balkendiagramms in eine andere Farbe, die mit hellen und dunklen Designs kompatibel ist.

> Reduzieren Sie auf der Detailseite die Anzahl der Zeilen, um 5 Sicherungen pro Seite anzuzeigen.

> Fügen Sie in der Dashboard-Übersicht oben eine Zusammenfassung mit der Anzahl der Maschinen in der Datenbank, der Gesamtzahl der Sicherungen aller Maschinen, der gesamten hochgeladenen Größe aller Sicherungen und dem gesamten Speicherplatz verwendet von allen Maschinen ein. Fügen Sie Symbole hinzu, um die Visualisierung zu erleichtern.

> Bitte speichern Sie das vom Benutzer ausgewählte Thema. Fügen Sie auch seitliche Ränder hinzu und lassen Sie die Benutzeroberfläche 90 % der verfügbaren Breite nutzen.

> In der Kopfzeile der Maschinendetails sollte eine Zusammenfassung mit der Gesamtzahl der für diese Maschine gespeicherten Sicherungen, einer Statistik des Sicherungsstatus, der Anzahl der Warnungen und Fehler der letzten Sicherung, der durchschnittlichen Dauer in hh:mm:ss, der gesamten hochgeladenen Größe aller Sicherungen und der verwendeten Speichergröße basierend auf den zuletzt empfangenen Sicherungsinformationen enthalten sein.

> die Zusammenfassung kleiner und kompakter gestalten, um den Speicherplatz zu reduzieren.

> Wann das Datum der letzten Sicherung eingeblendet wird, zeige in derselben Zelle in einer kleinen grauen Schrift an, wie lange die Sicherung her ist (z. B. vor x Minuten, vor x Stunden, vor x Tagen, vor x Wochen, vor x Monaten, vor x Jahren).

> im Dashboard-Übersicht das Datum der letzten Sicherung vor den Status der letzten Sicherung platzieren

Nach dem Durchlaufen dieser Eingabeaufforderungen generierte Firebase den Prototyp wie in den folgenden Screenshots dargestellt:

![prototype](/img/screen-prototype.png)

![prototype-detail](/img/screen-prototype-detail.png)

:::note
Ein interessanter Punkt war, dass Firebase Studio seit der ersten Interaktion zufällige Daten generierte, um die Seiten/Diagramme zu füllen, wodurch der Prototyp wie eine Live-Anwendung funktionierte.
:::

Nach Abschluss des ersten Prototyps habe ich auf den Quellcode zugegriffen, indem ich die Schaltfläche `</>` in der Benutzeroberfläche angeklickt habe. Anschließend habe ich die Git-Erweiterung verwendet, um den Code zu exportieren und ihn in ein privates Repository auf [GitHub](https://www.github.com) zu übertragen.

# Backend {#backend}

## Einrichtung {#setup}

Ich habe den Code von GitHub (mit dem Befehl `git clone`) in einen lokalen Ordner heruntergeladen (in meinem Fall ein Raspberry Pi 5 mit Linux) und die Abhängigkeiten Node.js, npm und pnpm installiert. Weitere Details finden Sie in [DEVELOPMENT.md](../development/setup.md).

Ich habe Cursor so konfiguriert, dass es über eine SSH-Verbindung auf den Code-Ordner von meinem Windows-Computer zugreift.

Ich habe ein Beispiel des von Duplicati gesendeten JSON in eine Datei kopiert (siehe das Dokument [Beispiel-Sicherungsbericht](../api-reference/database-values)), wobei ich einige unerwünschte Felder gelöscht habe.

## Implementierung {#implementation}

Ich habe einen anfänglichen Prompt verwendet, um die Implementierung zu starten, wobei ich mich auf Persistenz, Fehlerbehebungen und neue Funktionen konzentrierte. Es war ein langer, aber sehr interessanter Prozess.

### KI zur Generierung der Eingabeaufforderung verwenden {#using-ai-to-generate-the-prompt}

Ich habe eine detaillierte Eingabeaufforderung mit Cursor Chat (Modus `Manual`, Modell `Auto`) erstellt:

> verbessern Sie diesen Text als Eingabeaufforderung für das Cursor-AI-Tool zur Generierung der Implementierung eines Anwendungsprototyps:
> 
> Bitte erstellen Sie einen Plan zur Generierung der vollständigen Implementierung einer Next.js-Anwendung aus dieser Codebasis. Ihre Implementierung sollte die bereitgestellte Codebasis gründlich analysieren, um die exakte visuelle Ästhetik, das Benutzererlebnis und den Navigationsfluss beizubehalten. Verwenden Sie für die Datenspeicherung SQLite3. Generieren Sie die Datenbank und füllen Sie sie mit der Struktur und dem Inhalt aus dem Dokument [Beispiel-Sicherungsbericht](../api-reference/database-values) auf, wobei jedes Feld aus dem JSON vollständig integriert und persistent gespeichert wird.

Die KI hat die folgende Eingabeaufforderung generiert:

>Erstellen Sie einen umfassenden Implementierungsplan für einen Next.js-Anwendungsprototyp mit den folgenden Anforderungen:
>
>1. Technischer Stack:
>   - Next.js 14+ mit App Router
>   - TypeScript für Typsicherheit
>   - SQLite3 für Datenpersistenz
>   - TailwindCSS für Styling
>   - React Server Components wo angemessen
>   - Client-Komponenten für interaktive Elemente
>
>2. Datenbankdesign:
>   - Analysieren Sie das Beispiel-Sicherungsbericht-Dokument, um ein optimales SQLite-Schema zu erstellen
>   - Entwerfen Sie Tabellen zur effizienten Speicherung aller Sicherungsdaten
>   - Fügen Sie Indizes für häufige Abfragen ein
>   - Implementieren Sie Datenvalidierung und Typsicherheit
>
>3. Anwendungsstruktur:
>   - Implementieren Sie die exakte Benutzeroberfläche/Benutzererfahrung aus der bereitgestellten Codebasis
>   - Erstellen Sie wiederverwendbare Komponenten für häufige Elemente
>   - Richten Sie ordnungsgemäßes Routing mit App Router ein
>   - Implementieren Sie responsive Layouts
>   - Fügen Sie Unterstützung für dunkles/helles Thema hinzu
>
>4. Kernfunktionen:
>   - Dashboard-Übersicht mit Maschinenstatus-Tabelle
>   - Detaillierte Maschinenansicht mit Sicherungsverlauf
>   - Datenvisualisierung mit Diagrammen
>   - Echtzeit-Sicherungsstatusaktualisierungen
>   - Ordnungsgemäße Fehlerbehandlung und Ladezustände
>
>5. Datenverwaltung:
>   - Erstellen Sie API-Routen für Datenvorgänge
>   - Implementieren Sie effiziente Datenabrufstrategien
>   - Fügen Sie ordnungsgemäße Datenvalidierung hinzu
>   - Fügen Sie Fehlerbehandlung für Datenbankoperationen ein
>
>Bitte stellen Sie einen detaillierten Implementierungsplan bereit, der alle diese Aspekte abdeckt und gleichzeitig das vorhandene visuelles Design und die Benutzererfahrung beibehält.

Ich habe die generierte Eingabeaufforderung in die Zwischenablage kopiert.

### Starten Sie die Implementierungsreise {#start-the-implementation-journey}

Ich habe einen neuen Chat erstellt, indem ich die Schaltfläche `+` angeklickt habe, zum `Agent`-Modus gewechselt bin und die Eingabeaufforderung mit Strg+Umschalt+V eingefügt habe (als Text).

Nachdem der Plan generiert wurde, gab ich `please, implement this plan` in den Chat ein, um die Implementierung zu starten.

:::note
Ich habe nur den Ausgangspunkt eingefügt, da ich nicht alle verwendeten Eingabeaufforderungen aufgezeichnet habe. Es gab viele davon.
:::

# Notizen {#notes}

- Einige Modelle können beim Beheben von Fehlern steckenbleiben. „claude-3.5" und „claude-4" sind normalerweise besser, aber manchmal müssen Sie ein anderes Modell versuchen (GPT, Gemini usw.).
Verwenden Sie bei komplexen Fehlern oder Problemen einen Prompt zur Analyse möglicher Ursachen des Fehlers, anstatt einfach um eine Behebung zu bitten.
- Verwenden Sie bei komplexen Änderungen einen Prompt zur Erstellung eines Plans und bitten Sie dann den KI-Agent, diesen umzusetzen. Dies funktioniert immer besser.
- Seien Sie spezifisch bei Änderungen des Quellcodes. Wählen Sie wenn möglich den relevanten Teil des Codes im Editor aus und drücken Sie Strg+L, um ihn als Kontext in den Chat einzubeziehen.
- Beziehen Sie sich auch auf die Datei, die Sie im Chat erwähnen, um dem KI-Agent zu helfen, sich auf den relevanten Teil des Codes zu konzentrieren und Änderungen in anderen Teilen des Codes zu vermeiden.
- Ich habe die Tendenz, den KI-Agent zu vermenschlichen, da dieser beständig „wir", „unser Code" und „möchten Sie, dass ich..." verwendet. Dies dient auch dazu, meine Überlebenschancen zu verbessern, falls (oder [wenn](https://ai-2027.com/)) Skynet bewusst wird und der Terminator erfunden wird.
- Verwenden Sie manchmal [Gemini](https://gemini.google.com/app), [Deepseek](https://chat.deepseek.com/), [ChatGPT](https://chat.openai.com/), [Manus](https://manus.im/app),... um Prompts mit besseren Anweisungen für den KI-Agent zu generieren.
