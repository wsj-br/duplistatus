# Übersicht {/* #overview */}

Die Seite Einstellungen bietet eine einheitliche Benutzeroberfläche zur Konfiguration aller Aspekte von **duplistatus**. Sie können darauf zugreifen, indem Sie auf die <IconButton icon="lucide:settings" /> **Einstellungen**-Schaltfläche in der [Anwendungstoolleiste](../overview.md#application-toolbar) klicken. Beachten Sie, dass reguläre Benutzer ein vereinfachtes Menü mit weniger Optionen im Vergleich zu Administratoren sehen.

## Administratoransicht {/* #administrator-view */}

Administratoren sehen alle verfügbaren Einstellungen.

<table>
  <tr>
    <td>
      ![Einstellungen Seitenleiste - Admin-Ansicht](../../assets/screen-settings-left-panel-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Benachrichtigungen</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Backup-Benachrichtigungen</a>: Konfigurieren Sie die Benachrichtigungseinstellungen pro Sicherung</li>
            <li><a href="backup-monitoring-settings.md">Backup-Überwachung</a>: Konfigurieren Sie die Erkennung überfälliger Sicherungen und Warnungen</li>
            <li><a href="daily-summary-settings.md">Tägliche Zusammenfassung</a>: Optionale tägliche Momentaufnahme, die E-Mails an den Standardempfänger ersetzt (zusätzliche Ziele bleiben erhalten)</li>
            <li><a href="notification-templates.md">Vorlagen</a>: Benutzerdefinierte Benachrichtigungsnachrichtenvorlagen anpassen</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integrationen</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: Konfigurieren Sie den NTFY Push-Benachrichtigungsdienst</li>
            <li><a href="email-settings.md">E-Mail</a>: Konfigurieren Sie SMTP-E-Mail-Benachrichtigungen</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">System</strong>
          <ul>
            <li><a href="server-settings.md">Server</a>: Verwalten Sie die Duplicati-Serverkonfigurationen</li>
            <li><a href="display-settings.md">Anzeigeeinstellungen</a>: Konfigurieren Sie Design, Diagramm-Zeitbereich, Diagrammstil, Gebietsschema-Format, automatisches Aktualisierungsintervall, Karten-Sortierreihenfolge und Wochenstart</li>
            <li><a href="duplicati-versions.md">Duplicati-Versionen</a>: Anzeigen der zwischengespeicherten Duplicati-Release-Versionen und Konfigurieren des Versionsprüfungszeitplans</li>
            <li><a href="database-maintenance.md">Datenbankverwaltung</a>: Datenbankbereinigung durchführen (nur Admin)</li>
            <li><a href="api-keys-settings.md">API-Schlüssel</a>: Verwalten Sie bereichsspezifische Schlüssel und externen API-Schutz (nur Admin)</li>
            <li><a href="ip-allowlist-settings.md">IP-Zulassungsliste</a>: Beschränken Sie den Administrationsinterface und externe APIs (nur Admin)</li>
            <li><a href="user-management-settings.md">Benutzer</a>: Benutzerkonten verwalten (nur Admin)</li>
            <li><a href="audit-logs-viewer.md">Audit-Protokoll</a>: System-Audit-Protokolle anzeigen</li>
            <li><a href="audit-logs-retention.md">Prüfprotokoll-Aufbewahrung</a>: Konfigurieren Sie die Aufbewahrung des Prüfprotokolls (nur Admin)</li>
            <li><a href="application-logs-settings.md">Anwendungsprotokolle</a>: Anwendungsprotokolle anzeigen und exportieren (nur Admin)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Nicht-Administratoransicht {/* #non-administrator-view */}

Reguläre Benutzer sehen eine eingeschränkte Auswahl an Einstellungen.

<table>
  <tr>
    <td>
      ![Einstellungen Sidebar - Nicht-Admin Ansicht](../../assets/screen-settings-left-panel-non-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Benachrichtigungen</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Backup-Benachrichtigungen</a>: Ansicht der Benachrichtigungseinstellungen pro Sicherung (nur lesen)</li>
            <li><a href="backup-monitoring-settings.md">Backup-Überwachung</a>: Ansicht der überfälligen Sicherungseinstellungen (nur lesen)</li>
            <li><a href="daily-summary-settings.md">Tägliche Zusammenfassung</a>: Ansicht der täglichen Zusammenfassungseinstellungen (nur lesen)</li>
            <li><a href="notification-templates.md">Vorlagen</a>: Ansicht der Benachrichtigungsvorlagen (nur lesen)</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integrationen</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: Ansicht der NTFY-Einstellungen (nur lesen)</li>
            <li><a href="email-settings.md">E-Mail</a>: Ansicht der E-Mail-Einstellungen (nur lesen)</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">System</strong>
          <ul>
            <li><a href="server-settings.md">Server</a>: Ansicht der Serverkonfigurationen (nur lesen)</li>
            <li><a href="display-settings.md">Anzeige</a>: Konfigurieren von Design, Diagramm-Zeitbereich, Diagrammstil, Gebietsschema-Format, automatisches Aktualisierungsintervall, Kartenreihenfolge und Wochenbeginn</li>
            <li><a href="duplicati-versions.md">Duplicati-Versionen</a>: Ansicht der zwischengespeicherten Duplicati-Versionen (Änderungen im Zeitplan sind nur für Administratoren)</li>
            <li><a href="audit-logs-viewer.md">Audit-Protokoll</a>: Ansicht der System-Audit-Protokolle (nur lesen)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Statussymbole {/* #status-icons */}

Die Sidebar zeigt Statussymbole neben den **NTFY**- und **E-Mail**-Integrationseinstellungen an:
- <IIcon2 icon="lucide:message-square" color="green"/> <IIcon2 icon="lucide:mail" color="green"/> **Grünes Symbol**: Ihre Einstellungen sind gültig und korrekt konfiguriert
- <IIcon2 icon="lucide:message-square" color="yellow"/> <IIcon2 icon="lucide:mail" color="yellow"/> **Gelbes Symbol**: Ihre Einstellungen sind ungültig oder nicht konfiguriert

Wenn die Konfiguration ungültig ist, werden die entsprechenden Kontrollkästchen im [Backup-Benachrichtigungen](backup-notifications-settings.md) Tab ausgegraut und deaktiviert. Für weitere Details siehe die Seiten [NTFY-Einstellungen](ntfy-settings.md) und [E-Mail-Einstellungen](email-settings.md).

<br/>

:::important
Ein grünes Symbol bedeutet nicht unbedingt, dass die Benachrichtigungen korrekt funktionieren. Verwenden Sie immer die verfügbaren Testfunktionen, um zu bestätigen, dass Ihre Benachrichtigungen funktionieren, bevor Sie sich auf sie verlassen. 
:::

<br/>
