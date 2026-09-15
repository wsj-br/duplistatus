# Übersicht {/* #overview */}

Die Einstellungen-Seite bietet eine einheitliche Benutzeroberfläche zur Konfiguration aller Aspekte von **duplistatus**. Sie können darauf zugreifen, indem Sie auf die <IconButton icon="lucide:settings" /> **Einstellungen**-Schaltfläche in der [Anwendungsbalken](../overview.md#application-toolbar) klicken. Beachten Sie, dass normale Benutzer ein vereinfachtes Menü mit weniger Optionen im Vergleich zu Administratoren sehen.

## Administrator-Ansicht {/* #administrator-view */}

Administratoren sehen alle verfügbaren Einstellungen.

<table>
  <tr>
    <td>
      ![Einstellungen-Sidebar - Admin-Ansicht](../../assets/screen-settings-left-panel-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Benachrichtigungen</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Backup-Benachrichtigungen</a>: Konfigurieren Sie die Benachrichtigungseinstellungen pro Sicherung</li>
            <li><a href="backup-monitoring-settings.md">Backup-Überwachung</a>: Konfigurieren Sie die Erkennung überfälliger Sicherungen und Warnungen</li>
            <li><a href="daily-summary-settings.md">Tägliche Zusammenfassung</a>: Optionale tägliche Momentaufnahme, die E-Mails an den Standardempfänger ersetzt (zusätzliche Ziele fortgesetzt)</li>
            <li><a href="notification-templates.md">Vorlagen</a>: Benutzerdefinierte Benachrichtigungsvorlagen anpassen</li>
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
            <li><a href="server-settings.md">Server</a>: Verwalten Sie Duplicati-Server-Konfigurationen</li>
            <li><a href="display-settings.md">Anzeigeeinstellungen</a>: Konfigurieren Sie Design, Diagramm-Zeitbereich, Diagrammstil, Gebietsschema-Format, automatisches Aktualisierungsintervall, Karten-Sortierreihenfolge und Wochenstart</li>
            <li><a href="duplicati-versions.md">Duplicati-Versionen</a>: Zeigen Sie zwischengespeicherte Duplicati-Release-Versionen an und konfigurieren Sie den Versionsprüfungszeitplan</li>
            <li><a href="database-maintenance.md">Datenbankverwaltung</a>: Führen Sie die Datenbankbereinigung durch (nur Administratoren)</li>
            <li><a href="api-keys-settings.md">API-Schlüssel</a>: Verwalten Sie bereichsspezifische Schlüssel und externen API-Schutz (nur Administratoren)</li>
            <li><a href="ip-allowlist-settings.md">IP-Zulassungsliste</a>: Beschränken Sie den Administrationsinterface und externe APIs (nur Administratoren)</li>
            <li><a href="user-management-settings.md">Benutzer</a>: Verwalten Sie Benutzerkonten (nur Administratoren)</li>
            <li><a href="audit-logs-viewer.md">Audit-Protokoll</a>: Zeigen Sie System-Audit-Protokolle an</li>
            <li><a href="audit-logs-retention.md">Prüfprotokoll-Aufbewahrung</a>: Konfigurieren Sie die Prüfprotokoll-Aufbewahrung (nur Administratoren)</li>
            <li><a href="application-logs-settings.md">Anwendungsprotokolle</a>: Zeigen Sie Anwendungsprotokolle an und exportieren Sie sie (nur Administratoren)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Nicht-Administrator-Ansicht {/* #non-administrator-view */}

Reguläre Benutzer sehen eine begrenzte Anzahl von Einstellungen.

<table>
  <tr>
    <td>
      ![Einstellungen-Seitenleiste - Nicht-Admin-Ansicht](../../assets/screen-settings-left-panel-non-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Benachrichtigungen</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Backup-Benachrichtigungen</a>: Backup-spezifische Benachrichtigungseinstellungen anzeigen (nur Lesezugriff)</li>
            <li><a href="backup-monitoring-settings.md">Backup-Überwachung</a>: Überfällige Backup-Einstellungen anzeigen (nur Lesezugriff)</li>
            <li><a href="daily-summary-settings.md">Tägliche Zusammenfassung</a>: Tägliche Zusammenfassungseinstellungen anzeigen (nur Lesezugriff)</li>
            <li><a href="notification-templates.md">Vorlagen</a>: Benachrichtigungsvorlagen anzeigen (nur Lesezugriff)</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integrationen</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: NTFY-Einstellungen anzeigen (nur Lesezugriff)</li>
            <li><a href="email-settings.md">E-Mail</a>: E-Mail-Einstellungen anzeigen (nur Lesezugriff)</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">System</strong>
          <ul>
            <li><a href="server-settings.md">Server</a>: Server-Konfigurationen anzeigen (nur Lesezugriff)</li>
            <li><a href="display-settings.md">Anzeige</a>: Design, Diagramm-Zeitbereich, Diagrammstil, Gebietsschema-Format, automatisches Aktualisierungsintervall, Karten-Sortierreihenfolge und Wochenstart konfigurieren</li>
            <li><a href="duplicati-versions.md">Duplicati-Versionen</a>: Zwischengespeicherte Duplicati-Release-Versionen anzeigen (Änderungen am Zeitplan sind nur für Administratoren möglich)</li>
            <li><a href="audit-logs-viewer.md">Audit-Protokoll</a>: System-Audit-Protokolle anzeigen (nur Lesezugriff)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Status-Symbole {/* #status-icons */}

Die Seitenleiste zeigt Status-Symbole neben den **NTFY** und **E-Mail**-Integrations-Einstellungen an:
- <IIcon2 icon="lucide:message-square" color="green"/> <IIcon2 icon="lucide:mail" color="green"/> **Grünes Symbol**: Ihre Einstellungen sind gültig und korrekt konfiguriert
- <IIcon2 icon="lucide:message-square" color="yellow"/> <IIcon2 icon="lucide:mail" color="yellow"/> **Gelbes Symbol**: Ihre Einstellungen sind nicht gültig oder nicht konfiguriert

Wenn die Konfiguration ungültig ist, sind die entsprechenden Kontrollkästchen im [Backup-Benachrichtigungen](backup-notifications-settings.md) Reiter grau geschaltet und deaktiviert. Für weitere Details siehe die [NTFY-Einstellungen](ntfy-settings.md) und [E-Mail-Einstellungen](email-settings.md) Seiten.

<br/>

:::important
Ein grünes Symbol bedeutet nicht unbedingt, dass die Benachrichtigungen korrekt funktionieren. Verwenden Sie immer die verfügbaren Testfunktionen, um zu bestätigen, dass Ihre Benachrichtigungen funktionieren, bevor Sie sich darauf verlassen. 
:::

<br/>
