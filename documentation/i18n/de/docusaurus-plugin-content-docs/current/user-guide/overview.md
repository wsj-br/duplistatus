# Übersicht {/* #overview */}

Willkommen im duplistatus-Benutzerhandbuch. Dieses umfassende Dokument bietet detaillierte Anweisungen zur Verwendung von duplistatus zur Überwachung und Verwaltung Ihrer Duplicati-Sicherungsvorgänge auf mehreren Servern.

## Was ist duplistatus? {/* #what-is-duplistatus */}

duplistatus ist ein leistungsstarkes Überwachungsdashboard, das speziell für Duplicati-Sicherungssysteme entwickelt wurde. Es bietet:

- Zentralisierte Überwachung mehrerer Duplicati-Server über eine einzige Schnittstelle
- Echtzeit-Statustracking aller Sicherungsvorgänge
- Automatische Erkennung überfälliger Sicherungen mit konfigurierbaren Benachrichtigungen
- Umfassende Metriken und Visualisierung der Sicherungsleistung
- Flexibles Benachrichtigungssystem über NTFY und E-Mail
- Optionale [Sicherheitsvorsorgefunktionen](../installation/security-hardening.md)
- Mehrsprachige Unterstützung (Englisch, Französisch, Deutsch, Spanisch, Brasilianisches Portugiesisch, Hindi und Chinesisch).

## Installation {/* #installation */}

Für Voraussetzungen und detaillierte Installationsanweisungen verweisen Sie bitte auf das [Installationshandbuch](../installation/installation.md).

## Zugriff auf das Dashboard {/* #accessing-the-dashboard */}

Nach erfolgreicher Installation greifen Sie auf die duplistatus-Webschnittstelle zu, indem Sie folgende Schritte ausführen:

1. Öffnen Sie Ihren bevorzugten Webbrowser
2. Navigieren Sie zu `http://your-server-ip:9666`
   - Ersetzen Sie `your-server-ip` durch die tatsächliche IP-Adresse oder den Hostnamen Ihres duplistatus-Servers
   - Der Standardport ist `9666`
3. Sie werden mit einer Anmeldeseite konfrontiert.

Verwenden Sie diese Anmeldedaten für den ersten Einsatz (oder nach einem Upgrade von vor-0.9.x-Versionen):
    - Benutzername: `admin`
    - Passwort: `Duplistatus09`

Wählen Sie die Benutzeroberflächensprache in der oberen rechten Ecke <IconButton icon="lucide:languages" label="Sprache" /> oder in <IconButton icon="lucide:user" label="Benutzername" /> nach dem Anmelden (siehe unten).

4. Nach dem Anmelden wird das Hauptdashboard automatisch angezeigt (mit keinen Daten bei erster Nutzung)

## Benutzeroberflächenübersicht {/* #user-interface-overview */}

duplistatus bietet ein intuitives Dashboard zur Überwachung von Duplicati-Sicherungsvorgängen in Ihrer gesamten Infrastruktur.

![Dashboard-Übersicht](../assets/screen-main-dashboard-card-mode.png)

Die Benutzeroberfläche ist in mehrere wichtige Abschnitte organisiert, um ein klares und umfassendes Überwachungserlebnis zu bieten:

1. [Anwendungstoolbar](#application-toolbar): Schneller Zugriff auf wesentliche Funktionen und Konfigurationen
2. [Dashboard-Zusammenfassung](dashboard.md#dashboard-summary): Übersichtsstatistiken für alle überwachten Server
3. Server-Übersicht: [Kartenlayout](dashboard.md#cards-layout) oder [Tabellenlayout](dashboard.md#table-layout) mit dem aktuellen Status aller Sicherungen, einschließlich der [Duplicati-Server-Version](dashboard.md#duplicati-server-version) aus dem letzten empfangenen Sicherungsprotokoll
4. [Details zu überfälligen Sicherungen](dashboard.md#overdue-details): Visuelle Warnungen für überfällige Sicherungen mit detaillierten Informationen bei Mouseover
5. [Verfügbare Sicherungsversionen](dashboard.md#available-backup-versions): Klicken Sie auf das blaue Symbol, um die Sicherungsversionen am Ziel anzuzeigen
6. [Sicherungsmetriken](backup-metrics.md): Interaktive Diagramme, die die Sicherungsleistung im Laufe der Zeit darstellen
7. [Server-Details](server-details.md): Umfassende Liste der aufgezeichneten Sicherungen für bestimmte Server, einschließlich detaillierter Statistiken
8. [Sicherungsdetails](server-details.md#backup-details): Detaillierte Informationen zu einzelnen Sicherungen, einschließlich Ausführungsprotokollen, Warnungen und Fehlern

## Anwendungsleiste {/* #application-toolbar */}

Die Anwendungsleiste bietet einen bequemen Zugriff auf wichtige Funktionen und Einstellungen, die für einen effizienten Arbeitsablauf organisiert sind.

![Anwendungsleiste](../assets/duplistatus_toolbar.svg)

| Schaltfläche                                                                                                                                           | Beschreibung                                                                                                                                                                                |
|--------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <IconButton icon="lucide:search" /> &nbsp; Filter                                                                                            | Server nach ID, URL oder Sicherungsauftragsname suchen und filtern.                                                      |
| <IconButton icon="lucide:rotate-ccw" /> &nbsp; Bildschirm aktualisieren                                                                                    | Führen Sie eine sofortige manuelle Aktualisierung aller Daten durch                                                                                                                                     |
| <IconButton label="Auto-Aktualisierung" />                                                                                                              | Aktivieren oder deaktivieren Sie die automatische Aktualisierungsfunktion. Konfigurieren Sie dies in den [Anzeigeeinstellungen](settings/display-settings.md) <br/> _Rechtsklick_, um die Anzeigeeinstellungsseite zu öffnen                         |
| <SvgButton svgFilename="ntfy.svg" /> &nbsp; NTFY öffnen                                                                                            | Greifen Sie auf die ntfy.sh-Website für Ihr konfiguriertes Benachrichtigungsthema zu. <br/> _Rechtsklick_, um einen QR-Code anzuzeigen, um Ihr Gerät zur Empfang von Benachrichtigungen von duplistatus zu konfigurieren.               |
| <SvgButton svgFilename="duplicati_logo.svg" href="duplicati-configuration" /> &nbsp; [Duplicati-Konfiguration](duplicati-configuration.md)       | Öffnen Sie die Weboberfläche des ausgewählten Duplicati-Servers <br/> _Rechtsklick_, um die Duplicati-Legacy-Benutzeroberfläche (`/ngax`) in einem neuen Tab zu öffnen                                                              |
| <IconButton icon="lucide:download" href="collect-backup-logs" /> &nbsp; [Protokolle sammeln](collect-backup-logs.md)                                   | Verbinden Sie sich mit Duplicati-Servern und rufen Sie Sicherungsprotokolle ab <br/> _Rechtsklick_, um Protokolle für alle konfigurierten Server zu sammeln                                                                       |
| <IconButton icon="lucide:settings" href="settings/backup-notifications-settings" /> &nbsp; [Einstellungen](settings/backup-notifications-settings.md) | Konfigurieren Sie Benachrichtigungen, Überwachung, SMTP-Server und Benachrichtigungstemplates                                                                                                               |
| <IconButton icon="lucide:user" label="Benutzername" />                                                                                               | Zeigen Sie den verbundenen Benutzer, den Benutzertyp (`Admin`, `User`) an, klicken Sie für das Benutzermenü (enthält Sprachauswahl). Weitere Informationen finden Sie in der [Benutzerverwaltung](settings/user-management-settings.md)               |
| <IconButton icon="lucide:book-open-text" href="overview" /> &nbsp; Benutzerhandbuch                                                                    | Öffnen Sie das [Benutzerhandbuch](overview.md) zum Abschnitt, der zur aktuellen Seite gehört. Der Tooltip zeigt "Hilfe für [Seitenname]" an, um anzuzeigen, welche Dokumentation geöffnet wird. |

### Benutzermenü {/* #user-menu */}

Durch Klicken auf die Benutzerschaltfläche wird ein Dropdown-Menü mit benutzerspezifischen Optionen geöffnet. Die Menüoptionen unterscheiden sich je nachdem, ob Sie sich als Administrator oder als normaler Benutzer anmelden. Beide Rollen können die Schnittstellensprache über das **Sprache**-Untermenü ändern. Die ausgewählte Sprache wird pro Benutzer auf diesem Browser gespeichert (nicht als systemweite Einstellung), sodass verschiedene Konten unterschiedliche Sprachen verwenden können. Unterstützte Sprachen: Englisch, Französisch, Deutsch, Spanisch, Brasilianisches Portugiesisch, Hindi und Chinesisch (vereinfacht).

<table>
  <tr>
    <th>Administrator</th>
    <th>Benutzer</th>
  </tr>
  <tr>
    <td style={{verticalAlign: 'top'}}>![Benutzermenü - Admin](../assets/screen-user-menu-admin.png)</td>
    <td style={{verticalAlign: 'top'}}>![Benutzermenü - Benutzer](../assets/screen-user-menu-user.png)</td>
  </tr>
</table>

## Wichtige Konfiguration {/* #essential-configuration */}

1. Konfigurieren Sie Ihre [Duplicati-Server](../installation/duplicati-server-configuration.md), um Backup-Protokollnachrichten an duplistatus zu senden (erforderlich).
2. Sammeln Sie die ersten Backup-Protokolle – verwenden Sie die Funktion [Backup-Protokolle sammeln](collect-backup-logs.md), um die Datenbank mit historischen Backup-Daten aus allen Ihren Duplicati-Servern zu füllen. Dies aktualisiert auch automatisch die Backup-Überwachungsintervalle basierend auf der Konfiguration jedes Servers.
3. Konfigurieren Sie die Servereinstellungen – richten Sie Server-Aliase und Notizen in [Einstellungen → Server](settings/server-settings.md) ein, um Ihr Dashboard informativer zu gestalten.
4. Konfigurieren Sie die NTFY-Einstellungen – richten Sie Benachrichtigungen über NTFY in [Einstellungen → NTFY](settings/ntfy-settings.md) ein.
5. Konfigurieren Sie die E-Mail-Einstellungen – richten Sie E-Mail-Benachrichtigungen in [Einstellungen → E-Mail](settings/email-settings.md) ein.
6. Konfigurieren Sie die Backup-Benachrichtigungen – richten Sie pro-Backup- oder pro-Server-Benachrichtigungen in [Einstellungen → Backup-Benachrichtigungen](settings/backup-notifications-settings.md) ein.
7. Optional Zugriff einschränken – erstellen Sie [API-Schlüssel](settings/api-keys-settings.md) und/oder [IP-Zulassungslisten](settings/ip-allowlist-settings.md), wenn Sie `/api/upload` und die Administrationsinterface schützen möchten. Beide sind standardmäßig deaktiviert.

<br/>

:::info[WICHTIG]
Denken Sie daran, die Duplicati-Server so zu konfigurieren, dass sie Backup-Protokolle an duplistatus senden, wie in der [Duplicati-Konfiguration](../installation/duplicati-server-configuration.md) beschrieben.
:::

<br/>

:::note
 Alle Produktnamen, Logos und Markenzeichen sind Eigentum ihrer jeweiligen Inhaber. Symbole und Namen werden ausschließlich zur Identifikation verwendet und implizieren keine Unterstützung.
:::

<small>

> **Hinweis zu UI- und Dokumentationsübersetzungen:** Alle Benutzeroberflächen- und Dokumentationssprachen außer Englisch (UK) wurden mit KI übersetzt [ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/); die Formulierungen können ungenau oder fehlerhaft sein.

</small>
