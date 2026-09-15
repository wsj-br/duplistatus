# So habe ich diese Anwendung mit AI-Tools erstellt {/* #how-i-build-this-application-using-ai-tools */}

# Motivation {/* #motivation */}

Ich begann, Duplicati als Backup-Tool für meine Heimserver zu verwenden. Ich probierte die offizielle [Duplicati-Dashboard](https://app.duplicati.com/) und [Duplicati-Monitoring](https://www.duplicati-monitoring.com/) aus, hatte aber zwei Hauptanforderungen: (1) selbst gehostet; und (2) eine API für die Integration mit [Homepage](https://gethomepage.dev/), da ich sie für die Homepage meines Home Labs verwende.

Ich versuchte auch, direkt mit jedem Duplicati-Server im Netzwerk zu verbinden, aber die Authentifizierungsmethode war nicht kompatibel mit Homepage (oder ich konnte sie nicht richtig konfigurieren).

Da ich auch mit AI-Code-Tools experimentierte, beschloss ich, AI zu verwenden, um dieses Tool zu erstellen. Hier ist der Prozess, den ich verwendet habe...

# Verwendete Tools {/* #tools-used */}

1. Für die Benutzeroberfläche: [Google's Firebase Studio](https://firebase.studio/)
2. Für die Implementierung: Cursor (https://www.cursor.com/)

:::note
Ich verwendete Firebase für die Benutzeroberfläche, aber Sie können auch [v0.app](https://v0.app/) oder ein anderes Tool verwenden, um das Prototyp zu erstellen. Ich verwendete Cursor für die Implementierung, aber Sie können andere Tools wie VS Code/Copilot, Windsurf, ... verwenden.
:::

# Benutzeroberfläche {/* #ui */}

Ich erstellte ein neues Projekt in [Firebase Studio](https://studio.firebase.google.com/) und verwendete diesen Prompt im Feature "Prototyp einer App mit KI":

> Eine Web-Dashboard-Anwendung mit Tailwind/React zur Konsolidierung der Backup-Ergebnisse in einer SQLite3-Datenbank, die von der Duplicati-Backup-Lösung gesendet werden, die die Option --send-http-url (JSON-Format) für mehrere Maschinen verwendet. Verfolgen Sie den Status des Backups, die Größe, die hochgeladenen Größen.
> 
> Die erste Seite des Dashboards sollte eine Tabelle mit dem letzten Backup jeder Maschine enthalten, einschließlich des Maschinennamens, der Anzahl der in der Datenbank gespeicherten Backups, des Status des letzten Backups, der Dauer (hh:mm:ss), der Anzahl der Warnungen und Fehler.
> 
> Wenn Sie auf eine Maschinenzeile klicken, zeigen Sie eine Detailseite der ausgewählten Maschine mit einer Liste der gespeicherten Backups (seitenweise), einschließlich des Backup-Namens, des Datums und der Uhrzeit des Backups, einschließlich der Zeit, die seit dem Backup vergangen ist, des Status, der Anzahl der Warnungen und Fehler, der Anzahl der Dateien, der Größe der Dateien, der hochgeladenen Größe und der Gesamtgröße des Speichers. Fügen Sie auch auf der Detailseite ein Diagramm mit der Entwicklung der Felder: hochgeladene Größe; Dauer in Minuten, Anzahl der untersuchten Dateien, Größe der untersuchten Dateien ein. Das Diagramm sollte ein Feld auf einmal darstellen, mit einem Dropdown-Menü zur Auswahl des gewünschten Feldes zur Darstellung. Das Diagramm sollte auch alle in der Datenbank gespeicherten Backups darstellen, nicht nur die in der seitenweisen Tabelle angezeigten.
> 
> Die Anwendung muss einen API-Endpunkt zur Verfügung stellen, um die POST-Anfragen des Duplicati-Servers zu empfangen und einen anderen API-Endpunkt zur Abfrage aller Details des letzten Backups einer Maschine als JSON.
> 
> Das Design sollte modern, responsiv und mit Symbolen und anderen visuellen Hilfen ausgestattet sein, um es leicht lesbar zu machen. Der Code sollte sauber, prägnant und einfach zu warten sein. Verwenden Sie moderne Tools wie pnpm zur Verwaltung der Abhängigkeiten.
> 
> Die Anwendung sollte ein wählbares dunkles und helles Design haben.
> 
> Die Datenbank sollte diese Felder speichern, die von der Duplicati-JSON empfangen werden:

```json
"{ "Data": { "DeletedFiles": 0, "DeletedFolders": 0, "ModifiedFiles": 0, "ExaminedFiles": 15399, "OpenedFiles": 1861, "AddedFiles": 1861, "SizeOfModifiedFiles": 0, "SizeOfAddedFiles": 13450481, "SizeOfExaminedFiles": 11086692615, "SizeOfOpenedFiles": 13450481, "NotProcessedFiles": 0, "AddedFolders": 419, "TooLargeFiles": 0, "FilesWithError": 0, "ModifiedFolders": 0, "ModifiedSymlinks": 0, "AddedSymlinks": 0, "DeletedSymlinks": 0, "PartialBackup": false, "Dryrun": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "EndTime": "2025-04-21T23:46:38.3568274Z", "BeginTime": "2025-04-21T23:45:46.9712217Z", "Duration": "00:00:51.3856057", "WarningsActualLength": 0, "ErrorsActualLength": 0, "BackendStatistics": { "BytesUploaded": 8290314, "BytesDownloaded": 53550393, "KnownFileSize": 9920312634, "LastBackupDate": "2025-04-22T00:45:46+01:00", "BackupListCount": 6, "ReportedQuotaError": false, "ReportedQuotaWarning": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "BeginTime": "2025-04-21T23:45:46.9712252Z", "Duration": "00:00:00", "WarningsActualLength": 0, "ErrorsActualLength": 0 } }, "Extra": { "OperationName": "Backup", "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", "machine-name": "WSJ-SER5", "backup-name": "WSJ-SER5 Local files", "backup-id": "DB-2" } } "
```

dies generierte ein App-Blueprint, den ich dann leicht angepasst habe (wie unten) bevor ich auf `Prototype this App` klickte:

![appblueprint](/img/app-blueprint.png)

Ich verwendete später diese Prompts, um das Design und das Verhalten anzupassen und zu verfeinern:

> Entfernen Sie die Schaltfläche "Details anzeigen" von der Übersichtsseite des Dashboards und den Link beim Maschinenname. Wenn der Benutzer irgendwo auf der Zeile klickt, wird die Detailseite angezeigt.

> Wenn Größen in Bytes angezeigt werden, verwenden Sie eine automatische Skalierung (KB, MB, GB, TB).

> Auf der Detailseite, verschieben Sie das Diagramm nach der Tabelle. Ändern Sie die Farbe des Balkendiagramms in eine andere Farbe, die mit hellen und dunklen Designs kompatibel ist.

> Auf der Detailseite, reduzieren Sie die Anzahl der Zeilen auf 5 Backups pro Seite.

> Auf der Übersichtsseite des Dashboards, fügen Sie eine Zusammenfassung oben ein mit der Anzahl der Maschinen in der Datenbank, der Gesamtzahl der Backups aller Maschinen, der gesamten hochgeladenen Größe aller Backups und der gesamten Speichernutzung durch alle Maschinen. Fügen Sie Symbole hinzu, um die Visualisierung zu erleichtern.

> Bitte speichern Sie das vom Benutzer ausgewählte Design. Fügen Sie auch einige seitliche Ränder hinzu und lassen Sie die Benutzeroberfläche 90% der verfügbaren Breite verwenden.

> in the machine detail header card, include a summary with the total number of backups stored for this machine, a statistic of the backup status, the number of warnings and errors of the last backup, the average duration in hh:mm:ss, the total uploaded size of all backups and the storage size used based on the last backup information received.

> make the summary smaller and more compact to reduce the footprint used.

> when presenting the last backup date, show in the same cell, in a small gray font, the time ago the backup happened (for instance, x minute ago, x hours ago, x days ago, x weeks ago, x months ago, x years ago).

> in the dashboard overview put last backup date before last backup status

After iterating through these prompts, Firebase generated the prototype as shown in the screenshots below:

![prototype](/img/screen-prototype.png)

![prototype-detail](/img/screen-prototype-detail.png)

:::note
One interesting point was that, since the first interaction, Firebase Studio generated random data to populate the pages/charts, making the prototype function like a live application.
:::

After completing the initial prototype, I accessed the source code by clicking the `</>` button in the interface. I then used the Git extension to export the code and push it to a private repository on [GitHub](https://www.github.com).

# Backend {/* #backend */}

## Setup {/* #setup */}

I downloaded the code from GitHub (using the `git clone` command) to a local folder (in my case, a Raspberry Pi 5 running Linux) and installed the dependencies Node.js, npm, and pnpm. See more details in [DEVELOPMENT.md](../development/setup.md).

I set up Cursor to access the code folder from my Windows machine using an SSH connection.

I copied a sample of the JSON sent by Duplicati into a file (see the [sample backup report](../api-reference/database-values) document), clearing some unwanted fields.

## Implementation {/* #implementation */}

I used an initial prompt to begin the implementation, focusing on persistence, fixes, and new features. It was a long but very interesting process.

### Using AI to generate the prompt {/* #using-ai-to-generate-the-prompt */}

I created a detailed prompt using Cursor Chat (`Manual` mode, `Auto` model):

> improve this text as a prompt to cursor ai tool to generate the implementation of an applicaiton prototype:
> 
> please create a plan generate the full implementation of a Next.js application prototype from this codebase. Your implementation should thoroughly analyse the provided codebase to maintain the exact visual aesthetics, user experience, and navigation flow. For data storage, utilise SQLite3. Generate the database and populate it using the structure and content found in the [sample backup report](../api-reference/database-values) document, ensuring every field from the JSON is fully integrated and persisted.

The AI generated the following prompt:

>Erstellen Sie einen umfassenden Implementierungsplan für ein Next.js Anwendungsprototyp mit den folgenden Anforderungen:
>
>1. Technologie-Stack:
>   - Next.js 14+ mit App Router
>   - TypeScript für Typsicherheit
>   - SQLite3 für die Datenpersistenz
>   - TailwindCSS für das Styling
>   - React Server Components, wo sinnvoll
>   - Client-Komponenten für interaktive Elemente
>
>2. Datenbank-Design:
>   - Analysieren Sie das Beispiel-Sicherungsberichts-Dokument, um ein optimales SQLite-Schema zu erstellen
>   - Entwerfen Sie Tabellen zur effizienten Speicherung aller Sicherungsdaten
>   - Fügen Sie Indizes für häufige Abfragen hinzu
>   - Implementieren Sie Datenvalidierung und Typsicherheit
>
>3. Anwendungsstruktur:
>   - Implementieren Sie das exakte UI/UX aus dem bereitgestellten Codebase
>   - Erstellen Sie wiederverwendbare Komponenten für häufige Elemente
>   - Richten Sie die Routing mit dem App Router ein
>   - Implementieren Sie responsives Layout
>   - Fügen Sie Dark/Light Theme-Unterstützung hinzu
>
>4. Kernfunktionen:
>   - Dashboard-Übersicht mit Maschinenstatus-Tabelle
>   - Detaillierte Maschinenansicht mit Sicherungsverlauf
>   - Datenvisualisierung mit Diagrammen
>   - Echtzeit-Sicherungsstatus-Updates
>   - Fehlerbehandlung und Ladezustände
>
>5. Datenverwaltung:
>   - Erstellen Sie API-Routen für Datenoperationen
>   - Implementieren Sie effiziente Datenabrufstrategien
>   - Fügen Sie korrekte Datenvalidierung hinzu
>   - Schließen Sie Fehlerbehandlung für Datenbankoperationen ein
>
>Bitte geben Sie einen detaillierten Implementierungsplan, der alle diese Aspekte abdeckt und gleichzeitig das bestehende visuelle Design und die Benutzererfahrung beibehält.

Ich habe die generierte Eingabeaufforderung in die Zwischenablage kopiert.

### Starten Sie die Implementierungsreise {/* #start-the-implementation-journey */}

Ich habe einen neuen Chat erstellt, indem ich auf die `+`-Schaltfläche geklickt habe, auf `Agent`-Modus umgestellt und die Eingabeaufforderung mit Strg+Umschalt+V (als Text) eingefügt habe.

Nachdem der Plan generiert wurde, habe ich `please, implement this plan` in den Chat eingegeben, um mit der Implementierung zu beginnen.

:::note
Ich habe nur den Startpunkt aufgenommen, da ich nicht alle verwendeten Eingabeaufforderungen aufgezeichnet habe. Es gab viele davon.
:::

# Hinweise {/* #notes */}

- Einige Modelle können bei der Fehlerbehebung stecken bleiben. "claude-3.5" und "claude-4" sind normalerweise besser, aber manchmal muss man ein anderes Modell ausprobieren (GPT, Gemini, etc.).
Für komplexe Fehler oder Fehler verwenden Sie eine Eingabeaufforderung, um mögliche Ursachen des Fehlers zu analysieren, anstatt einfach zu fragen, ob der Fehler behoben werden soll.
- Bei komplexen Änderungen verwenden Sie eine Eingabeaufforderung, um einen Plan zu erstellen, und bitten Sie den KI-Agenten, ihn umzusetzen. Dies funktioniert immer besser.
- Seien Sie spezifisch, wenn Sie den Quellcode ändern. Wenn möglich, wählen Sie den relevanten Teil des Codes im Editor aus und drücken Sie Strg+L, um ihn als Kontext in den Chat einzufügen.
- Fügen Sie auch einen Verweis auf die Datei ein, die Sie im Chat erwähnen, um dem KI-Agenten zu helfen, sich auf den relevanten Teil des Codes zu konzentrieren und Änderungen an anderen Teilen des Codes zu vermeiden.
- Ich habe die Tendenz, den KI-Agenten anthropomorph zu sehen, da er beständig 'wir', 'unser Code' und 'würden Sie gerne...' verwendet. Dies dient auch dazu, meine Überlebenschancen zu verbessern, falls (oder [wenn](https://ai-2027.com/)) Skynet Bewusstsein entwickelt und der Terminator erfunden wird.
- Gelegentlich verwenden Sie [Gemini](https://gemini.google.com/app), [Deepseek](https://chat.deepseek.com/), [ChatGPT](https://chat.openai.com/), [Manus](https://manus.im/app),... um Eingabeaufforderungen mit besseren Anweisungen für den KI-Agenten zu generieren.
