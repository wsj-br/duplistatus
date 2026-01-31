---
translation_last_updated: '2026-01-31T00:51:26.184Z'
source_file_mtime: '2026-01-27T14:22:06.834Z'
source_file_hash: 01c00018de62e450
translation_language: de
source_file_path: user-guide/overview.md
---
# Übersicht {#overview}

Willkommen zum Benutzerhandbuch für duplistatus. Dieses umfassende Dokument bietet detaillierte Anweisungen zur Verwendung von duplistatus zur Überwachung und Verwaltung Ihrer Duplicati-Sicherungsvorgänge auf mehreren Servern.

## Was ist duplistatus? {#what-is-duplistatus}

duplistatus ist ein leistungsstarkes Überwachungs-Dashboard, das speziell für Duplicati-Sicherungssysteme entwickelt wurde. Es bietet:

- Zentralisierte Überwachung mehrerer Duplicati-Server von einer einzigen Benutzeroberfläche
- Echtzeit-Statusverfolgung aller Sicherungsvorgänge
- Automatische Erkennung überfälliger Sicherungen mit konfigurierbaren Warnungen
- Umfassende Metriken und Visualisierung der Sicherungsleistung
- Flexibles Benachrichtigungssystem über NTFY und E-Mail

## Installation {#installation}

Für Voraussetzungen und detaillierte Installationsanweisungen verweisen wir Sie auf den [Installationsleitfaden](../installation/installation.md).

## Zugriff auf das Dashboard {#accessing-the-dashboard}

Nach erfolgreicher Installation greifen Sie auf die duplistatus-Weboberfläche folgendermaßen zu:

1. Öffnen Sie Ihren bevorzugten Webbrowser
2. Navigieren Sie zu `http://your-server-ip:9666`
   - Ersetzen Sie `your-server-ip` durch die tatsächliche IP-Adresse oder den Hostname Ihres duplistatus-Servers
   - Der Standard-Port ist `9666`
3. Ihnen wird eine Anmeldungsseite angezeigt. Verwenden Sie diese Anmeldedaten für die erste Verwendung (oder nach einem Upgrade von Versionen vor 0.9.x):
    - Benutzername: `admin`
    - Passwort: `Duplistatus09` 
4. Nach der Anmeldung wird das Haupt-Dashboard automatisch angezeigt (beim ersten Gebrauch ohne Daten)

## Benutzeroberflächen-Übersicht {#user-interface-overview}

duplistatus bietet ein intuitives Dashboard zur Überwachung von Duplicati-Sicherungsvorgängen in Ihrer gesamten Infrastruktur.

![Dashboard Overview](/assets/screen-main-dashboard-card-mode.png)

Die Benutzeroberfläche ist in mehrere Schlüsselbereiche unterteilt, um ein klares und umfassendes Überwachungserlebnis zu bieten:

1. [Application Toolbar](#application-toolbar): Schnellzugriff auf wesentliche Funktionen und Konfigurationen
2. [Dashboard Summary](dashboard.md#dashboard-summary): Übersichtsstatistiken für alle überwachten Server
3. Servers Overview: [Cards layout](dashboard.md#cards-layout) oder [table layout](dashboard.md#table-layout) zeigt den neuesten Status aller Sicherungen
4. [Überfälligkeitsdetails](dashboard.md#overdue-details): Visuelle Warnungen für überfällige Sicherungen mit detaillierten Informationen beim Hover
5. [Verfügbare Sicherungsversionen](dashboard.md#available-backup-versions): Klicken Sie auf das blaue Symbol, um die am Ziel verfügbaren Sicherungsversionen anzuzeigen
6. [Backup Metrics](backup-metrics.md): Interaktive Diagramme, die die Sicherungsleistung im Zeitverlauf anzeigen
7. [Server Details](server-details.md): Umfassende Liste der aufgezeichneten Sicherungen für bestimmte Server, einschließlich detaillierter Statistiken
8. [Sicherungsdetails](server-details.md#backup-details): Ausführliche Informationen für einzelne Sicherungen, einschließlich Ausführungsprotokolle, Warnungen und Fehler

## Anwendungssymbolleiste {#application-toolbar}

Die Anwendungssymbolleiste bietet bequemen Zugriff auf wichtige Funktionen und Einstellungen, die für einen effizienten Arbeitsablauf organisiert sind.

![application toolbar](/img/duplistatus_toolbar.png)

| Schaltfläche                                                                                                                                     | Beschreibung                                                                                                                                                                  |
|--------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:rotate-ccw" /> &nbsp; Aktualisieren                                                                                    | Führen Sie eine sofortige manuelle Aktualisierung aller Daten durch                                                                                                                       |
| <IconButton label="Auto-refresh" />                                                                                                              | Aktivieren oder Deaktivieren der automatischen Aktualisierungsfunktion. Konfigurieren Sie in [Anzeigeeinstellungen](settings/display-settings.md) <br/> _Rechtsklick_ zum Öffnen der Seite „Anzeigeeinstellungen"           |
| <SvgButton svgFilename="ntfy.svg" /> &nbsp; NTFY öffnen                                                                                            | Greifen Sie auf die ntfy.sh-Website für Ihr konfiguriertes Benachrichtigungsthema zu. <br/> _Rechtsklick_ zum Anzeigen eines QR-Codes zum Konfigurieren Ihres Geräts zum Empfangen von Benachrichtigungen von duplistatus. |
| <SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> &nbsp; [Duplicati-Konfiguration](duplicati-configuration.md)       | Öffnen Sie die Weboberfläche des ausgewählten Duplicati-Servers <br/> _Rechtsklick_ zum Öffnen der Duplicati-Benutzeroberfläche (`/ngax`) in einem neuen Tab                                                                                                                           |
| <IconButton icon="lucide:download" href="collect-backup-logs" /> &nbsp; [Protokolle sammeln](collect-backup-logs.md)                                   | Verbinden Sie sich mit Duplicati-Servern und rufen Sie Sicherungsprotokolle ab <br/> _Rechtsklick_ zum Sammeln von Protokollen für alle konfigurierten Server                                                         |
| <IconButton icon="lucide:settings" href="settings/backup-notifications-settings" /> &nbsp; [Einstellungen](settings/backup-notifications-settings.md) | Konfigurieren Sie Benachrichtigungen, Überwachung, SMTP-Server und Benachrichtigungsvorlagen                                                                                                 |
| <IconButton icon="lucide:user" label="username" />                                                                                               | Zeigen Sie den verbundenen Benutzer, Benutzertyp (`Admin`, `User`) an, klicken Sie auf das Benutzermenü. Weitere Informationen finden Sie unter [Benutzerverwaltung](settings/user-management-settings.md)                               |
| <IconButton icon="lucide:book-open-text" href="overview" /> &nbsp; Benutzerhandbuch                                                                    | Öffnet das [Benutzerhandbuch](overview.md) im Abschnitt, der für die Seite relevant ist, die Sie gerade anzeigen. Der Tooltip zeigt „Hilfe für [Seitenname]" an, um anzugeben, welche Dokumentation geöffnet wird.                                                                           |

### Benutzermenü {#user-menu}

Durch Klicken auf die Benutzerschaltfläche wird ein Dropdown-Menü mit benutzerspezifischen Optionen geöffnet. Die Menüoptionen unterscheiden sich je nachdem, ob Sie als Administrator oder als normaler Benutzer angemeldet sind.

<table>
  <tr>
    <th>Administrator</th>
    <th>Normaler Benutzer</th>
  </tr>
  <tr>
    <td style={{verticalAlign: 'top'}}><img src="/assets/screen-user-menu-admin.png" alt="Benutzermenü - Admin" /></td>
    <td style={{verticalAlign: 'top'}}><img src="/assets/screen-user-menu-user.png" alt="Benutzermenü - Benutzer" /></td>
  </tr>
</table>

## Wesentliche Konfiguration {#essential-configuration}

1. Konfigurieren Sie Ihre [Duplicati-Server](../installation/duplicati-server-configuration.md) so, dass sie Backup-Protokollnachrichten an duplistatus senden (erforderlich).
2. Sammeln Sie erste Backup-Protokolle – verwenden Sie die Funktion [Backup-Protokolle sammeln](collect-backup-logs.md), um die Datenbank mit historischen Sicherungsdaten von allen Ihren Duplicati-Servern zu füllen. Dies aktualisiert auch automatisch die Überwachungsintervalle für überfällige Sicherungen basierend auf der Konfiguration jedes Servers.
3. Konfigurieren Sie Server-Einstellungen – richten Sie Server-Aliase und Notizen unter [Einstellungen → Server](settings/server-settings.md) ein, um Ihr Dashboard informativer zu gestalten.
4. Konfigurieren Sie NTFY-Einstellungen – richten Sie Benachrichtigungen über NTFY unter [Einstellungen → NTFY](settings/ntfy-settings.md) ein.
5. Konfigurieren Sie E-Mail-Einstellungen – richten Sie E-Mail-Benachrichtigungen unter [Einstellungen → E-Mail](settings/email-settings.md) ein.
6. Konfigurieren Sie Backup-Benachrichtigungen – richten Sie Benachrichtigungen pro Sicherung oder pro Server unter [Einstellungen → Backup-Benachrichtigungen](settings/backup-notifications-settings.md) ein.

<br/>

:::info[Wichtig]
Denken Sie daran, die Duplicati-Server so zu konfigurieren, dass sie Sicherungsprotokolle an duplistatus senden, wie im Abschnitt [Duplicati-Konfiguration](../installation/duplicati-server-configuration.md) beschrieben.
:::

<br/>

:::note
Alle Produktnamen, Marken und eingetragenen Marken sind Eigentum ihrer jeweiligen Inhaber. Symbole und Namen werden nur zu Identifikationszwecken verwendet und implizieren keine Billigung.
:::
