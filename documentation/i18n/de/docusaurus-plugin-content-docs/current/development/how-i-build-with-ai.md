---
translation_last_updated: '2026-01-31T00:51:23.263Z'
source_file_mtime: '2026-01-31T00:39:06.593Z'
source_file_hash: 6f3eb23dd0d60ee8
translation_language: de
source_file_path: development/how-i-build-with-ai.md
---
# Wie ich diese Anwendung mit KI-Tools erstelle {#how-i-build-this-application-using-ai-tools}

# Motivation {#motivation}

Ich begann, Duplicati als Sicherungstool für meine Home-Server zu verwenden. Ich probierte das offizielle [Duplicati-Dashboard](https://app.duplicati.com/) und [Duplicati Monitoring](https://www.duplicati-monitoring.com/) aus, hatte aber zwei Hauptanforderungen: (1) selbstgehostet; und (2) eine freiliegende API für die Integration mit [Homepage](https://gethomepage.dev/), da ich diese für die Homepage meines Home Labs verwende.

Ich habe auch versucht, mich direkt mit jedem Duplicati-Server im Netzwerk zu verbinden, aber die Authentifizierungsmethode war nicht mit Homepage kompatibel (oder ich war nicht in der Lage, sie ordnungsgemäß zu konfigurieren).

Da ich auch mit KI-Code-Tools experimentierte, beschloss ich, KI zum Erstellen dieses Tools zu nutzen. Hier ist der Prozess, den ich verwendet habe...

# Verwendete Tools {#tools-used}

1. Für die Benutzeroberfläche: [Google's Firebase Studio](https://firebase.studio/)
2. Für die Implementierung: Cursor (https://www.cursor.com/)

:::note
Ich habe Firebase für die Benutzeroberfläche verwendet, aber Sie können auch [v0.app](https://v0.app/) oder ein anderes Tool verwenden, um den Prototyp zu generieren. Ich habe Cursor zur Generierung der Implementierung verwendet, aber Sie können auch andere Tools wie VS Code/Copilot, Windsurf usw. verwenden.
:::

# Benutzeroberfläche {#ui}

Ich habe ein neues Projekt in [Firebase Studio](https://studio.firebase.google.com/) erstellt und diese Eingabeaufforderung in der Funktion „App mit KI prototypisieren" verwendet:

> Eine Web-Dashboard-Anwendung mit Tailwind/React zur Konsolidierung der von der Duplicati-Sicherungslösung gesendeten Sicherungsergebnisse in einer SQLite3-Datenbank unter Verwendung der Option --send-http-url (JSON-Format) von mehreren Maschinen, um den Status der Sicherung, die Größe und die Hochladegrößen zu verfolgen.

> Die erste Seite des Dashboards sollte eine Tabelle mit der letzten Sicherung jeder Maschine enthalten, einschließlich des Maschinennamens, der Anzahl der in der Datenbank gespeicherten Sicherungen, des Status der letzten Sicherung, der Dauer (hh:mm:ss), der Anzahl der Warnungen und Fehler.

> Beim Anklicken einer Maschinenzeile sollte eine Detailseite der ausgewählten Maschine mit einer Liste der gespeicherten Sicherungen (paginiert) angezeigt werden, einschließlich des Sicherungsnamens, des Datums und der Uhrzeit der Sicherung, wie lange diese zurückliegt, des Status, der Anzahl der Warnungen und Fehler, der Anzahl der Dateien, der Größe der Dateien, der hochgeladenen Größe und der Gesamtgröße des Speicherplatzes. Fügen Sie auf der Detailseite auch ein Diagramm mit Tremor ein, das die Entwicklung der folgenden Felder zeigt: hochgeladene Größe; Dauer in Minuten, Anzahl der überprüften Dateien, Größe der überprüften Dateien. Das Diagramm sollte jeweils ein Feld darstellen, mit einem Dropdown-Menü zur Auswahl des gewünschten Feldes. Das Diagramm muss alle in der Datenbank gespeicherten Sicherungen anzeigen, nicht nur die in der paginierten Tabelle angezeigten.

> Die Anwendung muss einen API-Endpunkt bereitstellen, um die Posts vom Duplicati-Server zu empfangen, und einen weiteren API-Endpunkt, um alle Details der letzten Sicherung einer Maschine als JSON abzurufen.

> Das Design sollte modern, responsiv und mit Symbolen und anderen visuellen Hilfsmitteln ausgestattet sein, um die Lesbarkeit zu verbessern. Der Code sollte sauber, prägnant und leicht zu warten sein. Verwenden Sie moderne Tools wie pnpm zur Verwaltung von Abhängigkeiten.

> Die Anwendung muss ein wählbares dunkles und helles Thema haben.

> Die Datenbank sollte diese von der Duplicati-JSON empfangenen Felder speichern:

```json
"{ "Data": { "DeletedFiles": 0, "DeletedFolders": 0, "ModifiedFiles": 0, "ExaminedFiles": 15399, "OpenedFiles": 1861, "AddedFiles": 1861, "SizeOfModifiedFiles": 0, "SizeOfAddedFiles": 13450481, "SizeOfExaminedFiles": 11086692615, "SizeOfOpenedFiles": 13450481, "NotProcessedFiles": 0, "AddedFolders": 419, "TooLargeFiles": 0, "FilesWithError": 0, "ModifiedFolders": 0, "ModifiedSymlinks": 0, "AddedSymlinks": 0, "DeletedSymlinks": 0, "PartialBackup": false, "Dryrun": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "EndTime": "2025-04-21T23:46:38.3568274Z", "BeginTime": "2025-04-21T23:45:46.9712217Z", "Duration": "00:00:51.3856057", "WarningsActualLength": 0, "ErrorsActualLength": 0, "BackendStatistics": { "BytesUploaded": 8290314, "BytesDownloaded": 53550393, "KnownFileSize": 9920312634, "LastBackupDate": "2025-04-22T00:45:46+01:00", "BackupListCount": 6, "ReportedQuotaError": false, "ReportedQuotaWarning": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "BeginTime": "2025-04-21T23:45:46.9712252Z", "Duration": "00:00:00", "WarningsActualLength": 0, "ErrorsActualLength": 0 } }, "Extra": { "OperationName": "Backup", "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", "machine-name": "WSJ-SER5", "backup-name": "WSJ-SER5 Local files", "backup-id": "DB-2" } } "
```

Dies hat einen App Blueprint generiert, den ich dann leicht modifiziert habe (wie unten dargestellt), bevor ich auf `Prototype this App` geklickt habe:

![appblueprint](/img/app-blueprint.png)

Ich verwendete diese Eingabeaufforderungen später, um das Design und das Verhalten anzupassen und zu verfeinern:

Entfernen Sie die Schaltfläche „Details anzeigen" von der Dashboard-Übersichtsseite und den Link auf dem Maschinennamen. Wenn der Benutzer irgendwo in der Zeile klickt, wird die Detailseite angezeigt.

> Wann Größen in Bytes dargestellt werden, ist eine automatische Skalierung (KB, MB, GB, TB) zu verwenden.

> auf der Detailseite das Diagramm nach der Tabelle verschieben. Die Farbe des Balkendiagramms in eine andere Farbe ändern, die mit Hell- und Dunkelmodus kompatibel ist.

Auf der Detailseite die Anzahl der Zeilen reduzieren, um 5 Sicherungen pro Seite anzuzeigen.

Im Dashboard in der Übersicht oben eine Zusammenfassung mit der Anzahl der Maschinen in der Datenbank, der Gesamtanzahl der Sicherungen aller Maschinen, der gesamten hochgeladenen Größe aller Sicherungen und dem gesamten Speicherplatz verwendet von allen Maschinen anzeigen. Icons einbeziehen, um die Visualisierung zu erleichtern.

Bitte speichern Sie die Themaauswahl des Benutzers. Fügen Sie außerdem seitliche Ränder hinzu und lassen Sie die Benutzeroberfläche 90 % der verfügbaren Breite nutzen.

In der Kopfzeile der Maschinendetails sollte eine Zusammenfassung mit der Gesamtzahl der für diese Maschine gespeicherten Sicherungen, einer Statistik des Sicherungsstatus, der Anzahl der Warnungen und Fehler der letzten Sicherung, der durchschnittlichen Dauer in hh:mm:ss, der gesamten hochgeladenen Größe aller Sicherungen und der verwendeten Speichergröße basierend auf den zuletzt empfangenen Sicherungsinformationen enthalten sein.

> Fassen Sie die Zusammenfassung kleiner und kompakter zusammen, um den Speicherplatz zu reduzieren.

Wann das Datum der letzten Sicherung angezeigt wird, sollte in derselben Zelle in einer kleinen grauen Schrift die Zeit angezeigt werden, die seit der Sicherung vergangen ist (zum Beispiel: vor x Minuten, vor x Stunden, vor x Tagen, vor x Wochen, vor x Monaten, vor x Jahren).

> im Dashboard in der Übersicht das Datum der letzten Sicherung vor dem Status der letzten Sicherung anordnen

Nach der Iteration durch diese Eingabeaufforderungen hat Firebase den Prototyp wie in den folgenden Screenshots dargestellt generiert:

![prototype](/img/screen-prototype.png)

![prototype-detail](/img/screen-prototype-detail.png)

:::note
Ein interessanter Punkt war, dass Firebase Studio seit der ersten Interaktion zufällige Daten generierte, um die Seiten/Diagramme zu füllen, wodurch der Prototyp wie eine Live-Anwendung funktionierte.
:::

Nach Abschluss des ersten Prototyps habe ich auf den Quellcode zugegriffen, indem ich die Schaltfläche `</>` in der Benutzeroberfläche angeklickt habe. Anschließend habe ich die Git-Erweiterung verwendet, um den Code zu exportieren und ihn in ein privates Repository auf [GitHub](https://www.github.com) zu übertragen.

# Backend {#backend}

## Einrichtung {#setup}

Ich habe den Code von GitHub heruntergeladen (mit dem Befehl `git clone`) in einen lokalen Ordner (in meinem Fall ein Raspberry Pi 5 mit Linux) und die Abhängigkeiten Node.js, npm und pnpm installiert. Weitere Details finden Sie in [DEVELOPMENT.md](../development/setup.md).

Ich habe Cursor so konfiguriert, dass es über eine SSH-Verbindung auf den Code-Ordner von meinem Windows-Computer zugreift.

Ich habe ein Beispiel des von Duplicati gesendeten JSON in eine Datei kopiert (siehe das Dokument [Beispiel-Sicherungsbericht](../api-reference/database-values)), wobei ich einige unerwünschte Felder gelöscht habe.

## Implementierung {#implementation}

Ich habe eine anfängliche Eingabeaufforderung verwendet, um die Implementierung zu beginnen, wobei der Fokus auf Persistenz, Fehlerbehebungen und neue Funktionen lag. Es war ein langer, aber sehr interessanter Prozess.

### Verwendung von KI zur Generierung des Prompts {#using-ai-to-generate-the-prompt}

Ich habe eine detaillierte Eingabeaufforderung mit Cursor Chat (`Manual` Modus, `Auto` Modell) erstellt:

> verbessern Sie diesen Text als Eingabeaufforderung für das Cursor-AI-Tool zur Generierung der Implementierung eines Anwendungsprototyps:
> 
> Bitte erstellen Sie einen Plan zur Generierung der vollständigen Implementierung einer Next.js-Anwendung aus dieser Codebasis. Ihre Implementierung sollte die bereitgestellte Codebasis gründlich analysieren, um die exakte visuelle Ästhetik, Benutzererfahrung und Navigationsfluss beizubehalten. Nutzen Sie für die Datenspeicherung SQLite3. Generieren Sie die Datenbank und füllen Sie sie mit der Struktur und dem Inhalt aus dem Dokument [Beispiel-Sicherungsbericht](../api-reference/database-values), wobei jedes Feld aus dem JSON vollständig integriert und persistent gespeichert wird.

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
>   - Dashboard-Übersicht mit Machine-Status-Tabelle
>   - Detaillierte Machine-Anzeige mit Sicherungsverlauf
>   - Datenvisualisierung mit Diagrammen
>   - Echtzeit-Sicherungsstatus-Updates
>   - Ordnungsgemäße Fehlerbehandlung und Ladezustände
>
>5. Datenverwaltung:
>   - Erstellen Sie API-Routen für Datenvorgänge
>   - Implementieren Sie effiziente Datenabruf-Strategien
>   - Fügen Sie ordnungsgemäße Datenvalidierung hinzu
>   - Fügen Sie Fehlerbehandlung für Datenbankoperationen ein
>
>Bitte stellen Sie einen detaillierten Implementierungsplan bereit, der alle diese Aspekte abdeckt und gleichzeitig das vorhandene visuelles Design und die Benutzererfahrung beibehält.

Ich habe die generierte Eingabeaufforderung in die Zwischenablage kopiert.

### Starten Sie die Implementierungsreise {#start-the-implementation-journey}

Ich habe einen neuen Chat erstellt, indem ich auf die Schaltfläche `+` geklickt habe, zum `Agent`-Modus gewechselt und die Eingabeaufforderung mit Strg+Umschalt+V (als Text) eingefügt habe.

Nachdem der Plan generiert wurde, gab ich `please, implement this plan` im Chat ein, um die Implementierung zu starten.

:::note
Ich habe nur den Ausgangspunkt eingefügt, da ich nicht alle verwendeten Eingabeaufforderungen aufgezeichnet habe. Es gab viele davon.
:::

# Notizen {#notes}

- Einige Modelle können beim Beheben von Fehlern steckenbleiben. "claude-3.5" und "claude-4" sind normalerweise besser, aber manchmal müssen Sie ein anderes Modell versuchen (GPT, Gemini, usw.).
Bei komplexen Fehlern oder Problemen verwenden Sie einen Prompt, um mögliche Ursachen des Fehlers zu analysieren, anstatt einfach um eine Behebung zu bitten.
- Wann Sie komplexe Änderungen vornehmen, verwenden Sie einen Prompt, um einen Plan zu erstellen, und bitten Sie dann den KI-Agenten, ihn umzusetzen. Dies funktioniert immer besser.
- Seien Sie spezifisch, wenn Sie den Quellcode ändern. Wählen Sie wenn möglich den relevanten Teil des Codes im Editor aus und drücken Sie Strg+L, um ihn als Kontext in den Chat einzubeziehen.
- Fügen Sie auch einen Verweis auf die Datei ein, die Sie im Chat erwähnen, um dem KI-Agenten zu helfen, sich auf den relevanten Teil des Codes zu konzentrieren und Änderungen in anderen Teilen des Codes zu vermeiden.
- Ich habe die Neigung, den KI-Agenten zu vermenschlichen, da dieser beständig "wir", "unser Code" und "möchten Sie, dass ich..." verwendet. Dies dient auch dazu, meine Überlebenschancen zu verbessern, falls (oder [wann](https://ai-2027.com/)) Skynet bewusst wird und der Terminator erfunden wird.
- Verwenden Sie manchmal [Gemini](https://gemini.google.com/app), [Deepseek](https://chat.deepseek.com/), [ChatGPT](https://chat.openai.com/), [Manus](https://manus.im/app),... um Prompts mit besseren Anweisungen für den KI-Agenten zu generieren.
