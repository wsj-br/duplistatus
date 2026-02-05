---
translation_last_updated: '2026-02-05T00:21:00.223Z'
source_file_mtime: '2026-02-02T19:14:50.094Z'
source_file_hash: 4f0c83e8848eb7e7
translation_language: de
source_file_path: user-guide/settings/email-settings.md
---
# E-Mail {#email}

**duplistatus** unterstützt den Versand von E-Mail-Benachrichtigungen via SMTP als Alternative oder Ergänzung zu NTFY-Benachrichtigungen. Die E-Mail-Konfiguration wird jetzt über die Weboberfläche verwaltet, wobei die verschlüsselte Speicherung in der Datenbank für erhöhte Sicherheit sorgt.

![Email Configuration](../../assets/screen-settings-email.png)

| Einstellung                 | Beschreibung                                                      |
|:------------------------|:-----------------------------------------------------------------|
| **SMTP-Server-Host**    | Der SMTP-Server Ihres E-Mail-Anbieters (z. B. `smtp.gmail.com`).      |
| **SMTP-Server-Port**    | Portnummer (normalerweise `25` für Einfaches SMTP, `587` für STARTTLS oder `465` für Direktes SSL/TLS). |
| **Verbindungstyp**     | Auswählen zwischen Einfaches SMTP, STARTTLS oder Direktes SSL/TLS. Standardmäßig auf Direktes SSL/TLS für neue Konfigurationen eingestellt. |
| **SMTP-Authentifizierung** | Umschalten zum Aktivieren oder Deaktivieren der SMTP-Authentifizierung. Wenn deaktiviert, sind Benutzername und Passwort nicht erforderlich. |
| **SMTP-Benutzername**       | Ihre E-Mail-Adresse oder Ihr Benutzername (erforderlich, wenn die Authentifizierung aktiviert ist). |
| **SMTP-Passwort**       | Ihr E-Mail-Passwort oder App-spezifisches Passwort (erforderlich, wenn die Authentifizierung aktiviert ist). |
| **Absendername**         | Anzeigename, der als Absender in E-Mail-Benachrichtigungen angezeigt wird (optional, standardmäßig „duplistatus"). |
| **Absenderadresse**        | E-Mail-Adresse, die als Absender angezeigt wird. Erforderlich für Einfaches SMTP oder wenn die Authentifizierung deaktiviert ist. Standardmäßig auf SMTP-Benutzername eingestellt, wenn die Authentifizierung aktiviert ist. Hinweis: Einige E-Mail-Anbieter überschreiben die `Absenderadresse` mit dem `SMTP-Server-Benutzername`. |
| **Empfänger-E-Mail**     | Die E-Mail-Adresse zum Empfangen von Benachrichtigungen. Muss ein gültiges E-Mail-Adressformat sein. |

Ein <IIcon2 icon="lucide:mail" color="green"/> grünes Symbol neben `Email` in der Seitenleiste bedeutet, dass Ihre Einstellungen gültig sind. Wenn das Symbol <IIcon2 icon="lucide:mail" color="yellow"/> gelb ist, sind Ihre Einstellungen ungültig oder nicht konfiguriert.

Das Symbol wird grün angezeigt, wenn alle erforderlichen Felder gesetzt sind: SMTP Server Host, SMTP-Server-Port, Empfänger-E-Mail und entweder (SMTP-Benutzername + Passwort, wenn Authentifizierung erforderlich ist) oder (Absenderadresse, wenn Authentifizierung nicht erforderlich ist).

Wenn die Konfiguration nicht vollständig konfiguriert ist, wird ein gelbes Warnfeld angezeigt, das Sie darüber informiert, dass keine E-Mails versendet werden, bis die E-Mail-Einstellungen korrekt ausgefüllt sind. Die E-Mail-Kontrollkästchen auf der Registerkarte [`Backup Benachrichtigungen`](backup-notifications-settings.md) werden ebenfalls ausgegraut und zeigen „(Deaktiviert)"-Beschriftungen an.

<br/>

## Verfügbare Aktionen {#available-actions}

| Schaltfläche                                                   | Beschreibung                                              |
|:-----------------------------------------------------------------|:---------------------------------------------------------|
| <IconButton label="Einstellungen speichern" />                             | Speichert die Änderungen an den NTFY-Einstellungen.              |
| <IconButton icon="lucide:mail" label="Test-E-Mail senden"/>         | Sendet eine Test-E-Mail mit der SMTP-Konfiguration. Die Test-E-Mail zeigt den SMTP-Server-Hostname, Port, Verbindungstyp, Authentifizierungsstatus, Benutzername (falls zutreffend), Empfänger-E-Mail, Absenderadresse, Absendername und Testzeitstempel. |
| <IconButton icon="lucide:trash-2" label="SMTP-Einstellungen löschen"/> | Löscht / Entfernt die SMTP-Konfiguration.                   |

<br/>

:::info[Wichtig]
  Sie müssen die <IconButton icon="lucide:mail" label="Test-E-Mail senden"/> Schaltfläche verwenden, um sicherzustellen, dass Ihre E-Mail-Konfiguration funktioniert, bevor Sie sich auf sie für Benachrichtigungen verlassen.

 Auch wenn Sie ein grünes <IIcon2 icon="lucide:mail" color="green"/> Symbol sehen und alles konfiguriert aussieht, werden E-Mails möglicherweise nicht versendet.
 
 `duplistatus` prüft nur, ob Ihre SMTP-Einstellungen ausgefüllt sind, nicht ob E-Mails tatsächlich zugestellt werden können.
:::

<br/>

## Häufige SMTP-Anbieter {#common-smtp-providers}

**Gmail:**

- Host: `smtp.gmail.com`
- Port: `587` (STARTTLS) oder `465` (Direktes SSL/TLS)
- Verbindungstyp: STARTTLS für Port 587, Direktes SSL/TLS für Port 465
- Benutzername: Ihre Gmail-Adresse
- Passwort: Verwenden Sie ein App-Passwort (nicht Ihr reguläres Passwort). Generieren Sie eines unter https://myaccount.google.com/apppasswords
- Authentifizierung: Erforderlich

**Outlook/Hotmail:**

- Host: `smtp-mail.outlook.com`
- Port: `587`
- Verbindungstyp: STARTTLS
- Benutzername: Ihre Outlook-E-Mail-Adresse
- Passwort: Ihr Kontokennwort
- Authentifizierung: Erforderlich

**Yahoo Mail:**

- Host: `smtp.mail.yahoo.com`
- Port: `587`
- Verbindungstyp: STARTTLS
- Benutzername: Ihre Yahoo-E-Mail-Adresse
- Passwort: Verwenden Sie ein App-Passwort
- Authentifizierung: erforderlich

### Sicherheit – Best Practices {#security-best-practices}

- Erwägen Sie die Verwendung eines dedizierten E-Mail-Kontos für Benachrichtigungen
 - Testen Sie Ihre Konfiguration mit der Schaltfläche „Test-E-Mail senden"
 - Einstellungen sind verschlüsselt und sicher in der Datenbank gespeichert
 - **Verwenden Sie verschlüsselte Verbindungen** - STARTTLS und Direktes SSL/TLS werden für die Produktionsnutzung empfohlen
 - Einfache SMTP-Verbindungen (Port 25) sind für vertrauenswürdige lokale Netzwerke verfügbar, werden aber nicht für die Produktionsnutzung über nicht vertrauenswürdige Netzwerke empfohlen
