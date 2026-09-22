# Datenbankverwaltung {/* #database-maintenance */}

Verwalten Sie Ihre Sicherungsdaten und optimieren Sie die Leistung durch Datenbankwartungsoperationen.

![Datenbankwartung](../../assets/screen-settings-database-maintenance.png)

<br/>

## Datenbank-Backup {/* #database-backup */}

Erstellen Sie eine Sicherung Ihrer gesamten Datenbank zu Aufbewahrungs- oder Migrationszwecken.

1.  Navigieren Sie zu [Einstellungen → Datenbankverwaltung](database-maintenance.md).
2.  Wählen Sie im Abschnitt **Datenbank-Backup** ein Sicherungsformat aus:
    - **Datenbankdatei (.db)**: Binäres Format - schnellste Sicherung, bewahrt exakt alle Datenbankstruktur erhalten
    - **SQL-Dump (.sql)**: Textformat - menschenlesbare SQL-Anweisungen, können vor der Wiederherstellung bearbeitet werden
3.  Klicken Sie auf <IconButton icon="lucide:download" label="Sicherung herunterladen" />.
4.  Die Sicherungsdatei wird mit einem Zeitstempel versehen auf Ihren Computer heruntergeladen.

**Sicherungsformate:**

- **.db-Format**: Empfohlen für regelmäßige Sicherungen. Erstellt eine exakte Kopie der Datenbankdatei unter Verwendung der SQLite-Sicherungs-API und gewährleistet so Konsistenz, auch während die Datenbank verwendet wird.
- **.sql-Format**: Nützlich für Migration, Prüfung oder wenn Sie die Daten vor der Wiederherstellung bearbeiten möchten. Enthält alle SQL-Anweisungen, die zum Neuerstellen der Datenbank benötigt werden.

**Bewährte Methoden:**

- Erstellen Sie vor wichtigen Operationen (Aufräumen, Zusammenführen usw.) regelmäßige Sicherungen
- Speichern Sie Sicherungen an einem sicheren Ort getrennt von der Anwendung
- Testen Sie Wiederherstellungsverfahren regelmäßig, um sicherzustellen, dass Sicherungen gültig sind

<br/>

## Datenbankwiederherstellung {/* #database-restore */}

Stellen Sie Ihre Datenbank aus einer zuvor erstellten Sicherungsdatei wieder her.

1.  Navigieren Sie zu [Einstellungen → Datenbankverwaltung](database-maintenance.md).
2.  Klicken Sie im Abschnitt **Datenbankwiederherstellung** auf das Dateiauswahlfeld und wählen Sie eine Sicherung aus:
    - Unterstützte Formate: `.db`, `.sql`, `.sqlite`, `.sqlite3`
    - Maximale Dateigröße: 200 MB
3.  Klicken Sie auf <IconButton icon="lucide:upload" label="Datenbankwiederherstellung" />.
4.  Bestätigen Sie die Aktion im Dialogfeld.

**Wiederherstellungsprozess:**

- Vor der Wiederherstellung wird automatisch eine Sicherheitskopie der aktuellen Datenbank erstellt
- Die aktuelle Datenbank wird durch die Sicherungsdatei ersetzt
- Alle Sitzungen werden aus Sicherheitsgründen gelöscht (Benutzer müssen sich erneut anmelden)
- Die Datenbankintegrität wird nach der Wiederherstellung überprüft
- Alle Caches werden gelöscht, um aktuelle Daten sicherzustellen

**Wiederherstellungsformate:**

- **.db-Dateien**: Die Datenbankdatei wird direkt ersetzt. Schnellste Wiederherstellungsmethode.
- **.sql-Dateien**: SQL-Anweisungen werden ausgeführt, um die Datenbank neu zu erstellen. Ermöglicht gegebenenfalls selektive Wiederherstellung.

:::warning
Durch die Wiederherstellung einer Datenbank werden **alle aktuellen Daten ersetzt**. Diese Aktion kann nicht rückgängig gemacht werden.  
Automatisch wird eine Sicherungskopie erstellt, aber es wird empfohlen, vor der Wiederherstellung Ihre eigene Sicherung zu erstellen.
 
**Wichtig:** Nach der Wiederherstellung werden aus Sicherheitsgründen alle Benutzersitzungen gelöscht. Sie müssen sich erneut anmelden.
:::

**Fehlerbehebung:**

- Falls die Wiederherstellung fehlschlägt, wird die ursprüngliche Datenbank automatisch aus der Sicherungssicherung wiederhergestellt
- Stellen Sie sicher, dass die Sicherungsdatei nicht beschädigt ist und dem erwarteten Format entspricht
- Bei großen Datenbanken kann der Wiederherstellungsprozess mehrere Minuten dauern

<br/>

---

<br/>

:::note
Dies gilt für alle unten aufgeführten Wartungsfunktionen: Alle Statistiken im Dashboard, Detailseiten und Diagramme werden anhand von Daten aus der **duplistatus**-Datenbank berechnet. Das Löschen alter Informationen wirkt sich auf diese Berechnungen aus.
 
Falls Sie versehentlich Daten gelöscht haben, können Sie diese mithilfe der Funktion [Backup-Protokolle sammeln](../collect-backup-logs.md) wiederherstellen.
:::

Der Cron-Service **komprimiert** außerdem jede Woche am Sonntag um 04:00 UTC die Datenbank. Dieser Vorgang löscht Sicherungszeilen, deren Server nicht mehr existieren, Serverzeilen ohne verbleibende Sicherungsberichte, verbliebene Einstellungen für die Backup-Überwachung und überfällige Benachrichtigungen, alte Zeilen zur täglichen Zusammenfassung und führt SQLite `VACUUM` aus, um Dateispeicherplatz freizugeben. Das Löschen eines Servers oder Sicherungsauftrags bereinigt weiterhin sofort die zugehörigen Einstellungen.

<br/>

## Daten-Bereinigungszeitraum {/* #data-cleanup-period */}

Entfernen Sie veraltete Sicherungsdatensätze, um Speicherplatz freizugeben und die Systemleistung zu verbessern.

1.  Navigieren Sie zu [Einstellungen → Datenbankverwaltung](database-maintenance.md).
2.  Wählen Sie einen Aufbewahrungszeitraum:
    - **6 Monate**: Datensätze der letzten 6 Monate behalten.
    - **1 Jahr**: Datensätze des letzten Jahres behalten.
    - **2 Jahre**: Datensätze der letzten 2 Jahre behalten (Standard).
    - **Alle Daten löschen**: Alle Sicherungsdatensätze und Server entfernen.
3.  Klicken Sie auf <IconButton icon="lucide:trash-2" label="Alte Datensätze löschen" />.
4.  Bestätigen Sie die Aktion im Dialogfeld.

**Bereinigungseffekte:**

- Löscht Sicherungsdatensätze, die älter als der gewählte Zeitraum sind
- Aktualisiert alle zugehörigen Statistiken und Metriken

:::warning

Wenn Sie die Option „Alle Daten löschen“ auswählen, werden **alle Sicherungsdatensätze und Konfigurationseinstellungen dauerhaft aus dem System entfernt**.

Es wird dringend empfohlen, vor Ausführung dieser Aktion eine Datenbanksicherung zu erstellen.

:::

<br/>

## Sicherungsauftragsdaten löschen {/* #delete-backup-job-data */}

Entfernen Sie Daten eines bestimmten Sicherungsauftrags (Typ).

1.  Navigieren Sie zu [Einstellungen → Datenbankverwaltung](database-maintenance.md).
2.  Wählen Sie einen Sicherungsauftrag aus der Dropdown-Liste aus.
    - Die Backups werden nach Server-Alias oder Name und dann nach Sicherungsname sortiert.
3.  Klicken Sie auf <IconButton icon="lucide:folder-open" label="Sicherungsauftrag löschen" />.
4.  Bestätigen Sie die Aktion im Dialogfeld.

**Löschungseffekte:**

- Löscht dauerhaft alle mit diesem Sicherungsauftrag/Server verbundenen Daten.
- Bereinigt zugehörige Konfigurationseinstellungen.
- Aktualisiert die Dashboard-Statistiken entsprechend.

<br/>

## Serverdaten löschen {/* #delete-server-data */}

Entfernen Sie einen bestimmten Server und alle damit verbundenen Sicherungsdaten.

1.  Navigieren Sie zu [Einstellungen → Datenbankverwaltung](database-maintenance.md).
2.  Wählen Sie einen Server aus der Dropdown-Liste aus.
3.  Klicken Sie auf <IconButton icon="lucide:server" label="Serverdaten löschen" />.
4.  Bestätigen Sie die Aktion im Dialogfeld.

**Löschungseffekte:**

- Löscht den ausgewählten Server und alle seine Sicherungsdatensätze dauerhaft
- Bereinigt zugehörige Konfigurationseinstellungen
- Aktualisiert die Dashboard-Statistiken entsprechend

<br/>

## Doppelte Server zusammenführen {/* #merge-duplicate-servers */}

Erkennen und Zusammenführen doppelter Server, die denselben Namen, aber unterschiedliche IDs haben. Verwenden Sie diese Funktion, um sie zu einem einzigen Servereintrag zusammenzufassen.

Dies kann auftreten, wenn sich die `machine-id` von Duplicati nach einem Upgrade oder einer Neuinstallation ändert. Doppelte Server werden nur angezeigt, wenn sie vorhanden sind. Wenn keine Duplikate erkannt werden, zeigt der Abschnitt eine Meldung an, dass alle Server eindeutige Namen haben.

1.  Navigieren Sie zu [Einstellungen → Datenbankverwaltung](database-maintenance.md).
2.  Wenn doppelte Server erkannt werden, erscheint ein Abschnitt **Doppelte Server zusammenführen**.
3.  Überprüfen Sie die Liste der Gruppen doppelter Server:
    - Jede Gruppe zeigt Server mit demselben Namen, aber verschiedenen IDs
    - Der **Zielserver** (neuester nach Erstellungsdatum) ist hervorgehoben
    - **Alte Server-IDs**, die zusammengeführt werden, sind separat aufgelistet
4.  Wählen Sie die Servergruppen aus, die Sie zusammenführen möchten, indem Sie das Kontrollkästchen neben jeder Gruppe aktivieren.
5.  Klicken Sie auf <IconButton icon="lucide:git-merge" label="Ausgewählte Server zusammenführen" />.
6.  Bestätigen Sie die Aktion im Dialogfeld.

**Zusammenführungsprozess:**

- Alle alten Server-IDs werden in den Zielservers (neuester nach Erstellungsdatum) zusammengeführt
- Alle Sicherungsdatensätze und Konfigurationen werden auf den Zielservers übertragen
- Doppelte `backup_id`-Werte für denselben Sicherungsnamen werden zu einer einzigen ID zusammengefasst (die neueste Sicherungszeile gewinnt)
- Die alten Servereinträge werden gelöscht
- Dashboard-Statistiken werden automatisch aktualisiert

:::info[WICHTIG]
Diese Aktion kann nicht rückgängig gemacht werden. Vor der Bestätigung wird empfohlen, ein Datenbank-Backup durchzuführen.
:::

<br/>
