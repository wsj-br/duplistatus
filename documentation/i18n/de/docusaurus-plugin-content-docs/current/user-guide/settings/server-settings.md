---
translation_last_updated: '2026-01-31T00:51:26.347Z'
source_file_mtime: '2026-01-27T14:22:06.838Z'
source_file_hash: 4ebf820e9494ced0
translation_language: de
source_file_path: user-guide/settings/server-settings.md
---
# Server {#server}

Sie können hier einen alternativen Namen (Alias) für Ihre Server, einen Hinweis zur Beschreibung seiner Funktion und die Webadressen Ihrer Duplicati-Server konfigurieren.

![server settings](../../assets/screen-settings-server.png)

| Setting                         | Beschreibung                                                                                                                                                                                  |
|:--------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Servername**                  | Servername, der im Duplicati-Server konfiguriert ist. Ein <IIcon2 icon="lucide:key-round" color="#42A5F5"/> wird angezeigt, wenn ein Passwort für den Server festgelegt ist.                 |
| **Alias**                       | Ein Spitzname oder benutzerfreundlicher Name Ihres Servers. Beim Hovern über einen Alias wird sein Name angezeigt; in einigen Fällen wird zur Verdeutlichung der Alias und der Name in Klammern angezeigt. |
| **Hinweis**                     | Freier Text zur Beschreibung der Serverfunktionalität, des Installationsortes oder anderer Informationen. Wenn konfiguriert, wird er neben dem Namen oder Alias des Servers angezeigt.        |
| **Web-Interface-Adresse (URL)** | Konfigurieren Sie die URL für den Zugriff auf die Benutzeroberfläche des Duplicati-Servers. Sowohl `HTTP`- als auch `HTTPS`-URLs werden unterstützt.                                        |
| **Status**                      | Zeigt die Ergebnisse des Tests oder der Backup-Protokolle sammeln an                                                                                                                         |
| **Aktionen**                    | Sie können testen, die Duplicati-Schnittstelle öffnen, Protokolle sammeln und ein Passwort festlegen. Weitere Details finden Sie unten.                                                     |

<br/>

:::note
Wenn die Web-Interface-Adresse (URL) nicht konfiguriert ist, wird die <SvgIcon svgFilename="duplicati_logo.svg" /> Schaltfläche 
auf allen Seiten deaktiviert und der Server wird nicht in [`Duplicati Configuration`](../duplicati-configuration.md) <SvgButton svgFilename="duplicati_logo.svg" href="../duplicati-configuration"/> Liste angezeigt.
:::

<br/>

## Verfügbare Aktionen für jeden Server {#available-actions-for-each-server}

| Button                                                                                                      | Beschreibung                                                             |
|:------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------|
| <IconButton icon="lucide:play" label="Test"/>                                                               | Testen Sie die Verbindung zum duplistatus-Server.                            |
| <SvgButton svgFilename="duplicati_logo.svg" />                                                              | Öffnen Sie die Weboberfläche des duplistatus-Servers in einem neuen Browser-Tab.         |
| <IconButton icon="lucide:download" />                                                                       | Backup-Protokolle vom duplistatus-Server sammeln.                          |
| <IconButton icon="lucide:rectangle-ellipsis" /> &nbsp; or <IIcon2 icon="lucide:key-round" color="#42A5F5"/> | Ändern oder legen Sie ein Passwort für den duplistatus-Server für gesammelte Sicherungen fest. |

<br/>

:::info[WICHTIG]

Um Ihre Sicherheit zu schützen, können Sie nur die folgenden Aktionen ausführen:
- Ein Passwort für den Server festlegen
- Das Passwort vollständig entfernen (Löschen)
 
Das Passwort wird verschlüsselt in der Datenbank gespeichert und wird nie in der Benutzeroberfläche angezeigt.
:::

<br/>

## Verfügbare Aktionen für alle Server {#available-actions-for-all-servers}

| Button                                                     | Beschreibung                                     |
|:-----------------------------------------------------------|:------------------------------------------------|
| <IconButton label="Änderungen speichern" />                        | Speichern Sie die Änderungen an den Server-Einstellungen.   |
| <IconButton icon="lucide:fast-forward" label="Alle testen"/>  | Testen Sie die Verbindung zu allen Duplicati-Servern.   |
| <IconButton icon="lucide:import" label="Alle sammeln (#)"/> | Sammeln Sie Backup-Protokolle von allen Duplicati-Servern. |

<br/>
