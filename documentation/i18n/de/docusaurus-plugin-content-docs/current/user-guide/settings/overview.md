# Übersicht {/* #overview */}

Die Einstellungsseite bietet eine einheitliche Oberfläche zur Konfiguration aller Aspekte von **duplistatus**. Sie können darauf zugreifen, indem Sie auf die <IconButton icon="lucide:settings" /> **Einstellungen**-Schaltfläche in der [Anwendungssymbolleiste](../overview.md#application-toolbar) klicken. Notiz: Reguläre Benutzer sehen ein vereinfachtes Menü mit weniger Optionen als Administratoren.

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
            <li><a href="backup-notifications-settings.md">Backup-Benachrichtigungen</a>: Konfigurieren Sie benachrichtigungseinstellungen pro Backup</li>
            <li><a href="backup-monitoring-settings.md">Backup-Überwachung</a>: Konfigurieren Sie die Erkennung und Warnungen für überfällige Backups</li>
            <li><a href="daily-summary-settings.md">Tägliche Zusammenfassung</a>: Täglicher optionaler Snapshot, der E-Mails an den Standardempfänger ersetzt (zusätzliche Ziele bleiben erhalten)</li>
            <li><a href="notification-templates.md">Vorlagen</a>: Passen Sie die Vorlagen für Benachrichtigungsnachrichten an</li>
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
            <li><a href="server-settings.md">Server</a>: Verwalten Sie Duplicati-Serverkonfigurationen</li>
            <li><a href="display-settings.md">Anzeigeeinstellungen</a>: Konfigurieren Sie Design, Diagramm-Zeitbereich, Diagrammstil, Gebietsschema-Format, automatisches Aktualisierungsintervall, Karten-Sortierreihenfolge und Wochenstart</li>
            <li><a href="duplicati-versions.md">Duplicati-Versionen</a>: Zeigen Sie zwischengespeicherte Duplicati-Veröffentlichungsversionen an und konfigurieren Sie den Zeitplan für Versionsprüfungen</li>
            <li><a href="database-maintenance.md">Datenbankverwaltung</a>: Führen Sie Datenbankbereinigung durch (nur Admin)</li>
            <li><a href="api-keys-settings.md">API-Schlüssel</a>: Verwalten Sie bereichsspezifische Schlüssel und externen API-Schutz (nur Admin)</li>
            <li><a href="ip-allowlist-settings.md">IP-Zulassungsliste</a>: Beschränken Sie das Administrationsinterface und externe APIs (nur Admin)</li>
            <li><a href="user-management-settings.md">Benutzer</a>: Verwalten Sie Benutzerkonten (nur Admin)</li>
            <li><a href="audit-logs-viewer.md">Audit-Protokoll</a>: Zeigen Sie System-Audit-Protokolle an</li>
            <li><a href="audit-logs-retention.md">Prüfprotokoll-Aufbewahrung</a>: Konfigurieren Sie die Aufbewahrung des Audit-Protokolls (nur Admin)</li>
            <li><a href="application-logs-settings.md">Anwendungsprotokolle</a>: Anzeigen und Exportieren von Anwendungsprotokollen (nur Admin)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Nicht-Administratoransicht {/* #non-administrator-view */}

Reguläre Benutzer sehen einen eingeschränkten Satz an Einstellungen.

<table>
  <tr>
    <td>
      ![Einstellungen Seitenleiste - Nicht-Admin-Ansicht](../../assets/screen-settings-left-panel-non-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Benachrichtigungen</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Backup-Benachrichtigungen</a>: Anzeige der benutzerspezifischen Benachrichtigungseinstellungen (schreibgeschützt)</li>
            <li><a href="backup-monitoring-settings.md">Backup-Überwachung</a>: Anzeige der Einstellungen für überfällige Backups (schreibgeschützt)</li>
            <li><a href="daily-summary-settings.md">Tägliche Zusammenfassung</a>: Anzeige der täglichen Zusammenfassungseinstellungen (schreibgeschützt)</li>
            <li><a href="notification-templates.md">Vorlagen</a>: Anzeige der Benachrichtigungsvorlagen (schreibgeschützt)</li>
          </ul>
        </li><br/>
        <li>
          <strong>Integrationen</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: Anzeige der NTFY-Einstellungen (schreibgeschützt)</li>
            <li><a href="email-settings.md">E-Mail</a>: Anzeige der E-Mail-Einstellungen (schreibgeschützt)</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">System</strong>
          <ul>
            <li><a href="server-settings.md">Server</a>: Anzeige der Serverkonfigurationen (schreibgeschützt)</li>
            <li><a href="display-settings.md">Anzeige</a>: Konfigurieren Sie Design, Diagramm-Zeitbereich, Diagrammstil, Gebietsschema-Format, automatisches Aktualisierungsintervall, Karten-Sortierreihenfolge und Wochenstart</li>
            <li><a href="duplicati-versions.md">Duplicati-Versionen</a>: Anzeige zwischengespeicherter Duplicati-Versionen (Planungsänderungen nur für Administratoren)</li>
            <li><a href="audit-logs-viewer.md">Audit-Protokoll</a>: Anzeige der System-Audit-Protokolle (schreibgeschützt)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Statussymbole {/* #status-icons */}

Die Seitenleiste zeigt Statussymbole neben den **NTFY**- und **E-Mail**-Integrationseinstellungen an:
- <IIcon2 icon="lucide:message-square" color="green"/> <IIcon2 icon="lucide:mail" color="green"/> **Grünes Symbol**: Ihre Einstellungen sind gültig und korrekt konfiguriert
- <IIcon2 icon="lucide:message-square" color="yellow"/> <IIcon2 icon="lucide:mail" color="yellow"/> **Gelbes Symbol**: Ihre Einstellungen sind ungültig oder nicht konfiguriert

Wenn die Konfiguration ungültig ist, werden die entsprechenden Kontrollkästchen im Tab [Backup-Benachrichtigungen](backup-notifications-settings.md) ausgegraut und deaktiviert. Weitere Informationen finden Sie auf den Seiten [NTFY-Einstellungen](ntfy-settings.md) und [E-Mail-Einstellungen](email-settings.md).

<br/>

:::important
Ein grünes Symbol bedeutet nicht unbedingt, dass die Benachrichtigungen ordnungsgemäß funktionieren. Verwenden Sie immer die verfügbaren Testfunktionen, um sicherzustellen, dass Ihre Benachrichtigungen funktionieren, bevor Sie sich darauf verlassen.
:::

<br/>
