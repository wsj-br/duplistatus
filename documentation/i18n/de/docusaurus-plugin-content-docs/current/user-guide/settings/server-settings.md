# Server {/* #server */}

Hier können Sie einen alternativen Namen (Alias) für Ihre Server, eine Notiz zur Beschreibung ihrer Funktion und die Webadressen Ihrer Duplicati-Server konfigurieren.

![Servereinstellungen](../../assets/screen-settings-server.png)

| Einstellung                     | Beschreibung                                                                                                                                                                                  |
|:--------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Servername**                 | Servername, der im Duplicati-Server konfiguriert ist. Ein <IIcon2 icon="lucide:key-round" color="#42A5F5"/> wird angezeigt, wenn ein Passwort für den Server gesetzt ist.                                         |
| **Alias**                       | Ein Spitzname oder ein menschenlesbarer Name Ihres Servers. Bei der Überfahrt über einen Alias wird sein Name angezeigt; in einigen Fällen wird der Alias und der Name in Klammern angezeigt. |
| **Notiz**                        | Freitext zur Beschreibung der Serverfunktionalität, des Installationsorts oder anderer Informationen. Wenn konfiguriert, wird es neben dem Namen oder Alias des Servers angezeigt.                 |
| **Version**                     | Die Duplicati-Version aus dem neuesten Backup-Protokoll, mit der gleichen Farbe und dem gleichen Tooltip wie im [Dashboard](../dashboard.md#duplicati-server-version). Getönter Text ist aktuell oder nicht verfügbar; Warnung gelb ist veraltet. |
| **Webschnittstellen-Adresse (URL)** | Konfigurieren Sie die URL, um auf die Benutzeroberfläche des Duplicati-Servers zuzugreifen. Sowohl `HTTP` als auch `HTTPS` URLs werden unterstützt.                                                                                           |
| **Status**                      | Anzeige der Testergebnisse oder der gesammelten Backup-Protokolle                                                                                                                                              |
| **Aktionen**                     | Sie können die Verbindung testen, die Duplicati-Oberfläche öffnen, Protokolle sammeln und ein Passwort festlegen, siehe unten für weitere Details.                                                                                         |

<br/>

:::note
Wenn die Webschnittstellen-Adresse (URL) nicht konfiguriert ist, wird die <SvgIcon svgFilename="duplicati_logo.svg" /> Schaltfläche 
in allen Seiten deaktiviert und der Server wird nicht in der [Duplicati-Konfiguration](../duplicati-configuration.md) <SvgButton svgFilename="duplicati_logo.svg" href="../duplicati-configuration"/> Liste angezeigt.
:::

<br/>

## Verfügbare Aktionen für jeden Server {/* #available-actions-for-each-server */}

| Schaltfläche                                                                                                      | Beschreibung                                                             |
|:------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------|
| <IconButton icon="lucide:play" label="Test"/>                                                               | Testen Sie die Verbindung zum Duplicati-Server.                            |
| <SvgButton svgFilename="duplicati_logo.svg" />                                                              | Öffnen Sie die Webschnittstelle des Duplicati-Servers in einem neuen Browser-Tab.         |
| <IconButton icon="lucide:download" />                                                                       | Sammeln Sie Backup-Protokolle vom Duplicati-Server.                          |
| <IconButton icon="lucide:rectangle-ellipsis" /> &nbsp; oder <IIcon2 icon="lucide:key-round" color="#42A5F5"/> | Ändern oder setzen Sie ein Passwort für den Duplicati-Server, um Backups zu sammeln. |

<br/>

:::info[WICHTIG]

Um Ihre Sicherheit zu schützen, können Sie nur die folgenden Aktionen ausführen:
- Setzen Sie ein Passwort für den Server
- Entfernen (löschen) Sie das Passwort vollständig
 
Das Passwort wird verschlüsselt in der Datenbank gespeichert und wird nie in der Benutzeroberfläche angezeigt.
:::

<br/>

## Verfügbare Aktionen für alle Server {/* #available-actions-for-all-servers */}

| Schaltfläche                                                     | Beschreibung                                     |
|:-----------------------------------------------------------|:------------------------------------------------|
| <IconButton label="Änderungen speichern" />                        | Speichern Sie die Änderungen an den Servereinstellungen.   |
| <IconButton icon="lucide:fast-forward" label="Alle testen"/>  | Testen Sie die Verbindung zu allen Duplicati-Servern.   |
| <IconButton icon="lucide:import" label="Alle sammeln (#)"/> | Sammeln Sie Backup-Protokolle von allen Duplicati-Servern. |

<br/>
