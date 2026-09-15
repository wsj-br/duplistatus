# NTFY {/* #ntfy */}

[NTFY](https://github.com/binwiederhier/ntfy) ist ein einfacher Benachrichtigungsdienst, der Push-Benachrichtigungen an Ihr Handy oder Desktop senden kann. In diesem Abschnitt können Sie die Verbindung zu Ihrem Benachrichtigungsserver und die Authentifizierung einrichten.

![NTFY-Einstellungen](../../assets/screen-settings-ntfy.png)

| Einstellung            | Beschreibung                                                                                                                                   |
|:----------------------|:----------------------------------------------------------------------------------------------------------------------------------------------|
| **NTFY-URL**          | Die URL Ihres NTFY-Servers (Standardmäßig auf den öffentlichen `https://ntfy.sh/`).                                                                      |
| **NTFY-Thema**        | Ein eindeutiger Bezeichner für Ihre Benachrichtigungen. Das System generiert automatisch ein zufälliges Thema, wenn dieses Feld leer gelassen wird, oder Sie können Ihr eigenes angeben. |
| **NTFY-Zugriffstoken** | Ein optionales Zugriffstoken für authentifizierte NTFY-Server. Lassen Sie dieses Feld leer, wenn Ihr Server keine Authentifizierung erfordert.               |

<br/>

Ein <IIcon2 icon="lucide:message-square" color="green"/> grünes Symbol neben **NTFY** in der Seitenleiste bedeutet, dass Ihre Einstellungen gültig sind. Wenn das Symbol <IIcon2 icon="lucide:message-square" color="yellow"/> gelb ist, sind Ihre Einstellungen nicht gültig.
Wenn die Konfiguration nicht gültig ist, sind die NTFY-Kontrollkästchen im [`Backup Notifications`](backup-notifications-settings.md) Reiter auch deaktiviert.

## Verfügbare Aktionen {/* #available-actions */}

| Schaltfläche                                                                | Beschreibung                                                                                                  |
|:----------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------|
| <IconButton label="Einstellungen speichern" />                                  | Speichern Sie alle Änderungen an den NTFY-Einstellungen.                                                                  |
| <IconButton icon="lucide:send-horizontal" label="Testnachricht senden"/> | Senden Sie eine Testnachricht an Ihren NTFY-Server, um Ihre Konfiguration zu überprüfen.                                         |
| <IconButton icon="lucide:qr-code" label="Gerät konfigurieren"/>          | Zeigt einen QR-Code an, der es Ihnen ermöglicht, Ihr mobiles Gerät oder Desktop schnell für NTFY-Benachrichtigungen zu konfigurieren. |

## Gerätekonfiguration {/* #device-configuration */}

Sie sollten die NTFY-Anwendung auf Ihrem Gerät installieren, bevor Sie es konfigurieren ([siehe hier](https://ntfy.sh/)). Durch Klicken auf die <IconButton icon="lucide:qr-code" label="Gerät konfigurieren"/>-Schaltfläche oder durch Rechtsklicken auf das <SvgButton svgFilename="ntfy.svg" />-Symbol in der Anwendungsleiste wird ein QR-Code angezeigt. Durch Scannen dieses QR-Codes wird Ihr Gerät automatisch mit dem richtigen NTFY-Thema für Benachrichtigungen konfiguriert.

<br/>

<br/>

:::caution
Wenn Sie den öffentlichen **ntfy.sh**-Server ohne Zugriffstoken verwenden, kann jeder mit Ihrem Themennamen Ihre
Benachrichtigungen anzeigen. 
 
Um ein gewisses Maß an Privatsphäre zu gewährleisten, wird ein zufälliges 12-stelliges Thema generiert, das über
3 Sextillionen (3.000.000.000.000.000.000.000) mögliche Kombinationen bietet, wodurch das Raten erschwert wird.

Für verbesserte Sicherheit sollten Sie [Zugriffstoken-Authentifizierung](https://docs.ntfy.sh/config/#access-tokens) und [Zugriffssteuerungslisten](https://docs.ntfy.sh/config/#access-control-list-acl) verwenden, um Ihre Themen zu schützen, oder [NTFY selbst hosten](https://docs.ntfy.sh/install/#docker) für vollständige Kontrolle.

⚠️ **Sie sind verantwortlich für die Sicherung Ihrer NTFY-Themen. Bitte nutzen Sie diesen Dienst auf eigenes Risiko.**
:::

<br/>
<br/>

:::note
 Alle Produktnamen, Logos und Markenzeichen sind Eigentum ihrer jeweiligen Inhaber. Symbole und Namen werden ausschließlich zur Identifikation verwendet und implizieren keine Unterstützung.
:::
