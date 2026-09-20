# Wie ich diese Anwendung mit KI-Tools baue {/* #how-i-build-this-application-using-ai-tools */}

# Motivation {/* #motivation */}

Ich begann, Duplicati als Sicherungstool für meine Heimserver zu verwenden. Ich habe das offizielle [Duplicati-Dashboard](https://app.duplicati.com/) und [Duplicati Monitoring](https://www.duplicati-monitoring.com/) ausprobiert, aber ich hatte zwei Hauptanforderungen: (1) selbst gehostet; und (2) eine API, die für die Integration mit [Homepage](https://gethomepage.dev/) verfügbar ist, da ich sie für die Homepage meines Heimlabors benutze.

Ich habe auch versucht, direkt mit jedem Duplicati-Server im Netzwerk zu verbinden, aber die Authentifizierungsmethode war nicht mit der Homepage kompatibel (oder ich konnte sie nicht richtig konfigurieren).

Da ich auch mit KI-Code-Tools experimentierte, beschloss ich, KI zu verwenden, um dieses Tool zu erstellen. Hier ist der Prozess, den ich verwendet habe...

# Verwendete Tools {/* #tools-used */}

1. Für die UI: [Google's Firebase Studio](https://firebase.studio/)
2. Für die Implementierung: Cursor (https://www.cursor.com/)

:::note
Ich habe Firebase für die UI verwendet, aber Sie können auch [v0.app](https://v0.app/) oder ein anderes Tool verwenden, um den Prototyp zu erstellen. Ich habe Cursor verwendet, um die Implementierung zu generieren, aber Sie können auch andere Tools wie VS Code/Copilot, Windsurf usw. verwenden.
:::

# UI {/* #ui */}

Ich habe ein neues Projekt in [Firebase Studio](https://studio.firebase.google.com/) erstellt und diesen Prompt in der Funktion "Prototype an app with AI" verwendet:

> Eine Web-Dashboard-Anwendung, die tailwind/react verwendet, um die Sicherungsergebnisse, die von der Duplicati-Sicherungslösung mit der Option --send-http-url (JSON-Format) von mehreren Maschinen gesendet werden, in einer sqllite3-Datenbank zu konsolidieren, den Status der Sicherung, die Größe und die Upload-Größen zu verfolgen.
> 
> Die erste Seite des Dashboards sollte eine Tabelle mit der letzten Sicherung jeder Maschine auf der ersten Seite enthalten, einschließlich des Maschinen-Namens, der Anzahl der in der Datenbank gespeicherten Sicherungen, dem Status der letzten Sicherung, der Dauer (hh:mm:ss), der Anzahl der Warnungen und Fehler.
> 
> Wenn man auf eine Maschinenzeile klickt, sollte eine Detailseite der ausgewählten Maschine mit einer Liste der gespeicherten Sicherungen (paginiert) angezeigt werden, einschließlich des Sicherungsnamens, des Datums und der Uhrzeit der Sicherung, einschließlich wie lange es her ist, dem Status, der Anzahl der Warnungen und Fehler, der Anzahl der Dateien, der Größe der Dateien, der hochgeladenen Größe und der gesamten Größe des Speichers. Außerdem sollte die Detailseite ein Diagramm mit Tremor enthalten, das die Entwicklung der Felder zeigt: hochgeladene Größe; Dauer in Minuten, Anzahl der geprüften Dateien, Größe der geprüften Dateien. Das Diagramm sollte jeweils ein Feld darstellen, mit einem Dropdown-Menü zur Auswahl des gewünschten Feldes. Außerdem muss das Diagramm alle in der Datenbank gespeicherten Sicherungen anzeigen, nicht nur die, die in der paginierten Tabelle angezeigt werden.
> 
> Die Anwendung muss einen API-Endpunkt bereitstellen, um die POST-Anfrage vom Duplicati-Server zu empfangen, und einen weiteren API-Endpunkt, um alle Details der letzten Sicherung einer Maschine als JSON abzurufen.
> 
> Das Design sollte modern, responsiv sein und Icons sowie andere visuelle Hilfen enthalten, um die Lesbarkeit zu erleichtern. Der Code muss sauber, prägnant und leicht wartbar sein. Verwenden Sie moderne Tools wie pnpm, um mit Abhängigkeiten umzugehen.
> 
> Die Anwendung muss ein wählbares dunkles und helles Design haben.
> 
> Die Datenbank sollte diese von Duplicati empfangenen Felder speichern:

```json
"{ "Data": { "DeletedFiles": 0, "DeletedFolders": 0, "ModifiedFiles": 0, "ExaminedFiles": 15399, "OpenedFiles": 1861, "AddedFiles": 1861, "SizeOfModifiedFiles": 0, "SizeOfAddedFiles": 13450481, "SizeOfExaminedFiles": 11086692615, "SizeOfOpenedFiles": 13450481, "NotProcessedFiles": 0, "AddedFolders": 419, "TooLargeFiles": 0, "FilesWithError": 0, "ModifiedFolders": 0, "ModifiedSymlinks": 0, "AddedSymlinks": 0, "DeletedSymlinks": 0, "PartialBackup": false, "Dryrun": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "EndTime": "2025-04-21T23:46:38.3568274Z", "BeginTime": "2025-04-21T23:45:46.9712217Z", "Duration": "00:00:51.3856057", "WarningsActualLength": 0, "ErrorsActualLength": 0, "BackendStatistics": { "BytesUploaded": 8290314, "BytesDownloaded": 53550393, "KnownFileSize": 9920312634, "LastBackupDate": "2025-04-22T00:45:46+01:00", "BackupListCount": 6, "ReportedQuotaError": false, "ReportedQuotaWarning": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "BeginTime": "2025-04-21T23:45:46.9712252Z", "Duration": "00:00:00", "WarningsActualLength": 0, "ErrorsActualLength": 0 } }, "Extra": { "OperationName": "Backup", "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", "machine-name": "WSJ-SER5", "backup-name": "WSJ-SER5 Local files", "backup-id": "DB-2" } } "
```

dies erzeugte einen App-Blueprint, den ich dann leicht modifizierte (wie unten), bevor ich auf `Prototype this App` klickte:

![appblueprint](/img/app-blueprint.png)

Ich verwendete später diese Prompts, um das Design und das Verhalten anzupassen und zu verfeinern:

> Entfernen Sie die Schaltfläche "Details anzeigen" von der Dashboard-Übersichtsseite und den Link auf dem Maschinen-Namen. Wenn der Benutzer irgendwo in der Zeile klickt, wird die Detailseite angezeigt.

> Verwenden Sie beim Anzeigen von Größen in Bytes eine automatische Skalierung (KB, MB, GB, TB).

> Verschieben Sie auf der Detailseite das Diagramm nach der Tabelle. Ändern Sie die Farbe des Balkendiagramms in eine andere Farbe, die mit hellen und dunklen Designs kompatibel ist.

> Reduzieren Sie auf der Detailseite die Anzahl der Zeilen, um 5 Sicherungen pro Seite anzuzeigen.

> Fügen Sie in der Dashboard-Übersicht oben eine Zusammenfassung mit der Anzahl der Maschinen in der Datenbank, der Gesamtanzahl der Sicherungen aller Maschinen, der gesamten hochgeladenen Größe aller Sicherungen und dem gesamten genutzten Speicher aller Maschinen hinzu. Fügen Sie Icons hinzu, um die Visualisierung zu erleichtern.

> Bitte speichern Sie das vom Benutzer ausgewählte Design. Fügen Sie außerdem einige seitliche Abstände hinzu und lassen Sie die UI 90% der verfügbaren Breite nutzen.

> Im Maschinen-Detailkopfkarte, fügen Sie eine Zusammenfassung mit der Gesamtzahl der für diese Maschine gespeicherten Sicherungen, einer Statistik zum Sicherungsstatus, der Anzahl der Warnungen und Fehler der letzten Sicherung, der durchschnittlichen Dauer in hh:mm:ss, der gesamten hochgeladenen Größe aller Sicherungen und der verwendeten Speichergröße basierend auf den zuletzt erhaltenen Sicherungsinformationen hinzu.

> Machen Sie die Zusammenfassung kleiner und kompakter, um den verwendeten Platz zu reduzieren.

> Wenn das Datum der letzten Sicherung angezeigt wird, zeigen Sie in derselben Zelle, in einer kleinen grauen Schrift, die Zeit an, die seit der Sicherung vergangen ist (zum Beispiel, vor x Minuten, vor x Stunden, vor x Tagen, vor x Wochen, vor x Monaten, vor x Jahren).

> In der Dashboard-Übersicht setzen Sie das Datum der letzten Sicherung vor den Status der letzten Sicherung.

Nachdem ich diese Aufforderungen durchlaufen hatte, generierte Firebase den Prototyp, wie in den Screenshots unten gezeigt:

![Prototyp](/img/screen-prototype.png)

![Prototyp-Detail](/img/screen-prototype-detail.png)

:::note
Ein interessanter Punkt war, dass Firebase Studio seit der ersten Interaktion zufällige Daten generierte, um die Seiten/Diagramme zu füllen, wodurch der Prototyp wie eine Live-Anwendung funktionierte.
:::

Nachdem ich den ersten Prototyp abgeschlossen hatte, griff ich auf den Quellcode zu, indem ich auf die `</>`-Schaltfläche in der Benutzeroberfläche klickte. Ich verwendete dann die Git-Erweiterung, um den Code zu exportieren und in ein privates Repository auf [GitHub](https://www.github.com) zu pushen.

# Backend {/* #backend */}

## Einrichtung {/* #setup */}

Ich lud den Code von GitHub (unter Verwendung des `git clone`-Befehls) in einen lokalen Ordner herunter (in meinem Fall ein Raspberry Pi 5 mit Linux) und installierte die Abhängigkeiten Node.js, npm und pnpm. Weitere Details finden Sie in [DEVELOPMENT.md](../development/setup.md).

Ich richtete Cursor ein, um von meinem Windows-Rechner über eine SSH-Verbindung auf den Code-Ordner zuzugreifen.

Ich kopierte ein Beispiel des von Duplicati gesendeten JSON in eine Datei (siehe das [Beispiel-Sicherungsbericht](../api-reference/database-values)-Dokument) und entfernte einige unerwünschte Felder.

## Implementierung {/* #implementation */}

Ich verwendete eine anfängliche Aufforderung, um mit der Implementierung zu beginnen, wobei ich mich auf Persistenz, Fehlerbehebungen und neue Funktionen konzentrierte. Es war ein langer, aber sehr interessanter Prozess.

### Verwendung von KI zur Generierung der Aufforderung {/* #using-ai-to-generate-the-prompt */}

Ich erstellte eine detaillierte Aufforderung mit Cursor Chat (`Manual`-Modus, `Auto`-Modell):

> Verbessern Sie diesen Text als Aufforderung an das Cursor-KI-Tool, um die Implementierung eines Anwendungsprototyps zu generieren:
> 
> Bitte erstellen Sie einen Plan zur vollständigen Implementierung eines Next.js-Anwendungsprototyps aus diesem Codebase. Ihre Implementierung sollte den bereitgestellten Code gründlich analysieren, um die genauen visuellen Ästhetiken, die Benutzererfahrung und den Navigationsfluss beizubehalten. Für die Datenspeicherung verwenden Sie SQLite3. Erstellen Sie die Datenbank und füllen Sie sie mit der Struktur und dem Inhalt aus dem [Beispiel-Sicherungsbericht](../api-reference/database-values)-Dokument, wobei sichergestellt wird, dass jedes Feld aus dem JSON vollständig integriert und persistent ist.

Die KI generierte die folgende Aufforderung:

>Erstellen Sie einen umfassenden Implementierungsplan für einen Next.js-Anwendungsprototyp mit den folgenden Anforderungen:
>
>1. Technologiestack:
>   - Next.js 14+ mit App Router
>   - TypeScript für Typsicherheit
>   - SQLite3 für Datenpersistenz
>   - TailwindCSS für das Styling
>   - React Server Components, wo es angebracht ist
>   - Client-Komponenten für interaktive Elemente
>
>2. Datenbankdesign:
>   - Analysieren Sie das Beispiel-Sicherungsberichts-Dokument, um ein optimales SQLite-Schema zu erstellen
>   - Entwerfen Sie Tabellen, um alle Sicherungsdaten effizient zu speichern
>   - Fügen Sie Indizes für häufige Abfragen hinzu
>   - Implementieren Sie Datenvalidierung und Typsicherheit
>
>3. Anwendungsstruktur:
>   - Implementieren Sie das genaue UI/UX aus dem bereitgestellten Code
>   - Erstellen Sie wiederverwendbare Komponenten für gemeinsame Elemente
>   - Richten Sie eine ordnungsgemäße Routenführung mit dem App Router ein
>   - Implementieren Sie responsive Layouts
>   - Fügen Sie Unterstützung für dunkle/helle Designs hinzu
>
>4. Kernfunktionen:
>   - Dashboard-Übersicht mit Maschinenstatus-Tabelle
>   - Detaillierte Maschinenansicht mit Sicherungsverlauf
>   - Datenvisualisierung mit Diagrammen
>   - Echtzeit-Updates zum Sicherungsstatus
>   - Ordentliche Fehlerbehandlung und Ladezustände
>
>5. Datenmanagement:
>   - Erstellen Sie API-Routen für Datenoperationen
>   - Implementieren Sie effiziente Datenabrufstrategien
>   - Fügen Sie ordentliche Datenvalidierung hinzu
>   - Behandeln Sie Fehler bei Datenbankoperationen
>
>Bitte stellen Sie einen detaillierten Implementierungsplan zur Verfügung, der all diese Aspekte abdeckt und dabei das bestehende visuelle Design und die Benutzererfahrung beibehält.

Ich habe die generierte Eingabeaufforderung in die Zwischenablage kopiert.

### Beginnen Sie die Implementierungsreise {/* #start-the-implementation-journey */}

Ich habe einen neuen Chat erstellt, indem ich auf die `+`-Schaltfläche geklickt habe, bin in den `Agent`-Modus gewechselt und habe die Eingabeaufforderung mit Ctrl+Shift+V (als Text) eingefügt.

Nachdem der Plan erstellt wurde, habe ich `please, implement this plan` im Chat eingegeben, um mit der Implementierung zu beginnen.

:::note
Ich habe nur den Ausgangspunkt aufgenommen, da ich nicht alle verwendeten Eingabeaufforderungen aufgezeichnet habe. Es gab viele davon.
:::

# Notizen {/* #notes */}

- Einige Modelle können beim Beheben von Fehlern stecken bleiben. "claude-3.5" und "claude-4" sind normalerweise besser, aber manchmal muss man ein anderes Modell (GPT, Gemini usw.) ausprobieren.
Für komplexe Fehler oder Bugs verwenden Sie eine Eingabeaufforderung, um mögliche Ursachen des Fehlers zu analysieren, anstatt einfach zu fragen, ob er behoben werden kann.
- Bei komplexen Änderungen verwenden Sie eine Eingabeaufforderung, um einen Plan zu erstellen, und bitten Sie dann den KI-Agenten, ihn umzusetzen. Das funktioniert immer besser.
- Seien Sie spezifisch, wenn Sie den Quellcode ändern. Wenn möglich, wählen Sie den relevanten Teil des Codes im Editor aus und drücken Sie Ctrl+L, um ihn als Kontext in den Chat einzufügen.
- Fügen Sie auch einen Verweis auf die Datei hinzu, die Sie im Chat erwähnen, um dem KI-Agenten zu helfen, sich auf den relevanten Teil des Codes zu konzentrieren und zu vermeiden, Änderungen in anderen Teilen des Codes vorzunehmen.
- Ich habe die Tendenz, den KI-Agenten zu vermenschlichen, da er beständig "wir", "unser Code" und "möchten Sie, dass ich..." verwendet. Dies dient auch dazu, meine Überlebenschancen zu verbessern, falls (oder [wenn](https://ai-2027.com/)) Skynet empfindungsfähig wird und der Terminator erfunden wird.
- Manchmal verwenden Sie [Gemini](https://gemini.google.com/app), [Deepseek](https://chat.deepseek.com/), [ChatGPT](https://chat.openai.com/), [Manus](https://manus.im/app),... um Eingabeaufforderungen mit besseren Anweisungen für den KI-Agenten zu generieren.
