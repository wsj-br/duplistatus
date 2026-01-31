---
translation_last_updated: '2026-01-31T00:51:25.950Z'
source_file_mtime: '2026-01-28T15:01:51.247Z'
source_file_hash: d9d6e23762c8524f
translation_language: de
source_file_path: intro.md
---
# Willkommen bei duplistatus {#welcome-to-duplistatus}

**duplistatus** - Überwachen Sie mehrere [Duplicati](https://github.com/duplicati/duplicati)-Server von einem einzelnen Dashboard

## Funktionen {#features}

- **Schnelle Einrichtung**: Einfache containerisierte Bereitstellung mit Images auf Docker Hub und GitHub.
- **Einheitliches Dashboard**: Zeigen Sie den Sicherungsstatus, die Historie und Details für alle Server an einem Ort an.
- **Überwachung überfälliger Sicherungen**: Automatische Überprüfung und Benachrichtigungen für überfällige geplante Sicherungen.
- **Datenvisualisierung und Protokolle**: Interaktive Diagramme und automatische Protokollerfassung von Duplicati-Servern.
- **Benachrichtigungen und Warnungen**: Integrierte NTFY- und SMTP-E-Mail-Unterstützung für Sicherungswarnungen, einschließlich Benachrichtigungen für überfällige Sicherungen.
- **Benutzerzugriffskontrolle und Sicherheit**: Sicheres Authentifizierungssystem mit rollenbasierter Zugriffskontrolle (Admin-/Benutzerrollen), konfigurierbare Passwortrichtlinien, Kontosperrschutz und umfassende Benutzerverwaltung.
- **Audit-Protokollierung**: Vollständige Audit-Spur aller Systemänderungen und Benutzeraktionen mit erweiterten Filteroptionen, Exportfunktionen und konfigurierbaren Aufbewahrungszeiträumen.
- **Anwendungsprotokoll-Viewer**: Nur für Administratoren verfügbare Schnittstelle zum Anzeigen, Suchen und Exportieren von Anwendungsprotokollen direkt über die Weboberfläche mit Echtzeit-Überwachungsfunktionen.

## Installation {#installation}

Die Anwendung kann mit Docker, Portainer Stacks oder Podman bereitgestellt werden. 
Weitere Details finden Sie im [Installationsleitfaden](installation/installation.md).

- Wenn Sie von einer früheren Version aktualisieren, wird Ihre Datenbank während des Aktualisierungsvorgangs automatisch [migriert](migration/version_upgrade.md) zum neuen Schema.

- Wann Sie Podman verwenden (entweder als eigenständigen Container oder innerhalb eines Pod) und benutzerdefinierte DNS-Einstellungen erforderlich sind (z. B. für Tailscale MagicDNS, Unternehmensnetzwerke oder andere benutzerdefinierte DNS-Konfigurationen), können Sie DNS-Server und Suchdomänen manuell angeben. Weitere Details finden Sie in der Installationsanleitung.

## Duplicati-Server-Konfiguration (erforderlich) {#duplicati-servers-configuration-required}

Sobald Ihr **duplistatus**-Server läuft, müssen Sie Ihre **Duplicati**-Server so konfigurieren, dass sie Sicherungsprotokolle an **duplistatus** senden, wie im Abschnitt [Duplicati-Konfiguration](installation/duplicati-server-configuration.md) des Installationshandbuchs beschrieben. Ohne diese Konfiguration erhält das Dashboard keine Sicherungsdaten von Ihren Duplicati-Servern.

## Benutzerhandbuch {#user-guide}

Siehe das [Benutzerhandbuch](user-guide/overview.md) für detaillierte Anweisungen zur Konfiguration und Verwendung von **duplistatus**, einschließlich Ersteinrichtung, Funktionskonfiguration und Fehlerbehebung.

## Screenshots {#screenshots}

### Dashboard {#dashboard}

![dashboard](/assets/screen-main-dashboard-card-mode.png)

### Sicherungsverlauf {#backup-history}

![server-detail](/assets/screen-server-backup-list.png)

### Sicherungsdetails {#backup-details}

![backup-detail](/assets/screen-backup-detail.png)

### Überfällige Sicherungen {#overdue-backups}

![overdue backups](/assets/screen-overdue-backup-hover-card.png)

### Überfällige Benachrichtigungen auf Ihrem Telefon {#overdue-notifications-on-your-phone}

![ntfy overdue message](/img/screen-overdue-notification.png)

## API-Referenz {#api-reference}

Weitere Informationen zu verfügbaren Endpunkten, Request-/Response-Formaten und Beispielen finden Sie in der [API-Endpunkte-Dokumentation](api-reference/overview.md).

## Entwicklung {#development}

Anweisungen zum Herunterladen, Ändern oder Ausführen des Codes finden Sie unter [Development Setup](development/setup.md).

Dieses Projekt wurde hauptsächlich mit Hilfe von KI entwickelt. Weitere Informationen finden Sie unter [How I Built this Application using AI tools](development/how-i-build-with-ai).

## Danksagungen {#credits}

- Zunächst und vor allem danke an Kenneth Skovhede für die Erstellung von Duplicati – dieses erstaunliche Sicherungstool. Danke auch an alle Mitwirkenden.

💙 Falls Sie [Duplicati](https://www.duplicati.com) nützlich finden, erwägen Sie bitte, den Entwickler zu unterstützen. Weitere Details finden Sie auf der Website oder der GitHub-Seite.

- Duplicati SVG-Symbol von https://dashboardicons.com/icons/duplicati
- Notify SVG-Symbol von https://dashboardicons.com/icons/ntfy
- GitHub SVG-Symbol von https://github.com/logos

>[!NOTE]
> Alle Produktnamen, Marken und eingetragenen Marken sind Eigentum ihrer jeweiligen Inhaber. Symbole und Namen werden nur zu Identifikationszwecken verwendet und implizieren keine Billigung.

## Lizenz {#license}

Das Projekt ist unter der [Apache License 2.0](LICENSE.md) lizenziert.

**Copyright © 2025 Waldemar Scudeller Jr.**
