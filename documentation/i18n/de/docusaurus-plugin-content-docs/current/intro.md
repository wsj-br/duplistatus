# Willkommen bei duplistatus

**duplistatus** - Ein weiteres [Duplicati](https://github.com/duplicati/duplicati) Dashboard

## Funktionen

- **Schnelle Einrichtung**: Einfache containerisierte Bereitstellung mit Images auf Docker Hub und GitHub verfügbar.
- **Einheitliches Dashboard**: Zeigen Sie Backup-Status, Verlauf und Details für alle Server an einem Ort an.
- **Überfälligkeitsüberwachung**: Automatische Überprüfung und Benachrichtigung bei überfälligen geplanten Backups.
- **Datenvisualisierung & Protokolle**: Interaktive Diagramme und automatische Protokollerfassung von Duplicati-Servern.
- **Benachrichtigungen & Warnungen**: Integrierte NTFY- und SMTP-E-Mail-Unterstützung für Backup-Warnungen, einschließlich Benachrichtigungen über überfällige Backups.
- **Benutzerzugriffskontrolle & Sicherheit**: Sicheres Authentifizierungssystem mit rollenbasierter Zugriffskontrolle (Admin-/Benutzerrollen), konfigurierbaren Passwortrichtlinien, Kontosperrschutz und umfassender Benutzerverwaltung.
- **Audit-Protokollierung**: Vollständiger Prüfpfad aller Systemänderungen und Benutzeraktionen mit erweiterter Filterung, Exportfunktionen und konfigurierbaren Aufbewahrungsfristen.
- **Anwendungsprotokolle-Viewer**: Nur-Admin-Schnittstelle zum Anzeigen, Durchsuchen und Exportieren von Anwendungsprotokollen direkt über die Weboberfläche mit Echtzeit-Überwachungsfunktionen.

## Installation

Die Anwendung kann mit Docker, Portainer Stacks oder Podman bereitgestellt werden.
Siehe Details im [Installationshandbuch](installation/installation.md).

- Wenn Sie von einer früheren Version aktualisieren, wird Ihre Datenbank während des Upgrade-Prozesses automatisch
  [migriert](migration/version_upgrade.md) zum neuen Schema.

- Bei Verwendung von Podman (entweder als eigenständiger Container oder innerhalb eines Pods) und wenn Sie benutzerdefinierte DNS-Einstellungen
  benötigen (z. B. für Tailscale MagicDNS, Unternehmensnetzwerke oder andere benutzerdefinierte DNS-Konfigurationen), können Sie DNS-Server
  und Suchdomänen manuell angeben. Weitere Details finden Sie im Installationshandbuch.

## Duplicati-Server-Konfiguration (Erforderlich)

Sobald Ihr **duplistatus**-Server läuft, müssen Sie Ihre **Duplicati**-Server so konfigurieren, dass sie
Backup-Protokolle an **duplistatus** senden, wie im Abschnitt [Duplicati-Konfiguration](installation/duplicati-server-configuration.md)
des Installationshandbuchs beschrieben. Ohne diese Konfiguration erhält das Dashboard keine Backup-Daten von Ihren Duplicati-Servern.

## Benutzerhandbuch

Siehe das [Benutzerhandbuch](user-guide/overview.md) für detaillierte Anweisungen zur Konfiguration und Verwendung von **duplistatus**, einschließlich Ersteinrichtung, Funktionskonfiguration und Fehlerbehebung.

## Screenshots

### Dashboard

![dashboard](/img/screen-main-dashboard-card-mode.png)

### Backup-Verlauf

![server-detail](/img/screen-server-backup-list.png)

### Backup-Details

![backup-detail](/img/screen-backup-detail.png)

### Überfällige Backups

![overdue backups](/img/screen-overdue-backup-hover-card.png)

### Überfälligkeitsbenachrichtigungen auf Ihrem Telefon

![ntfy overdue message](/img/screen-overdue-notification.png)

## API-Referenz

Siehe die [API-Endpunkte-Dokumentation](api-reference/overview.md) für Details zu verfügbaren Endpunkten, Anfrage-/Antwortformaten und Beispielen.

## Entwicklung

Für Anweisungen zum Herunterladen, Ändern oder Ausführen des Codes siehe [Entwicklungseinrichtung](development/setup.md).

Dieses Projekt wurde hauptsächlich mit KI-Unterstützung erstellt. Um zu erfahren, wie, siehe [Wie ich diese Anwendung mit KI-Tools erstellt habe](development/how-i-build-with-ai).

## Danksagungen

- Zuallererst Dank an Kenneth Skovhede für die Entwicklung von Duplicati – diesem großartigen Backup-Tool. Dank auch an alle Mitwirkenden.

  💙 Wenn Sie [Duplicati](https://www.duplicati.com) nützlich finden, erwägen Sie bitte, den Entwickler zu unterstützen. Weitere Details finden Sie auf der Website oder GitHub-Seite.

- Duplicati SVG-Symbol von https://dashboardicons.com/icons/duplicati

- Notify SVG-Symbol von https://dashboardicons.com/icons/ntfy

- GitHub SVG-Symbol von https://github.com/logos

> [!NOTE]
> Alle Produktnamen, Marken und eingetragenen Marken sind Eigentum ihrer jeweiligen Inhaber. Symbole und Namen werden nur zu Identifikationszwecken verwendet und implizieren keine Unterstützung.

## Lizenz

Das Projekt ist unter der [Apache License 2.0](LICENSE.md) lizenziert.

**Copyright © 2025 Waldemar Scudeller Jr.**

