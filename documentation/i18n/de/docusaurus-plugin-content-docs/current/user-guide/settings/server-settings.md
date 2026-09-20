# Server {/* #server */}

Sie können hier einen alternativen Namen (Alias) für Ihre Server, eine Notiz zur Beschreibung der Funktion und die Webadressen Ihrer Duplicati-Server konfigurieren.

![Servereinstellungen](../../assets/screen-settings-server.png)

| Einstellung                     | Beschreibung                                                                                                                                                                                   |
|:--------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Server Name**                 | Servername, der im Duplicati-Server konfiguriert ist. Ein <IIcon2 icon="lucide:key-round" color="#42A5F5"/> erscheint, wenn ein Passwort für den Server festgelegt ist.                                        |
| **Alias**                       | Ein Spitzname oder ein menschenlesbarer Name Ihres Servers. Beim Überfahren eines Aliases mit der Maus wird dessen Name angezeigt; in einigen Fällen wird zur Verdeutlichung der Alias und der Name in Klammern angezeigt. |
| **Notiz**                       | Freitext zur Beschreibung der Serverfunktionalität, Installationsort oder andere Informationen. Bei Konfiguration wird dieser neben dem Namen oder Alias des Servers angezeigt.                  |
| **Version**                     | Die Duplicati-Version aus dem neuesten Sicherungsprotokoll, mit derselben Farbe und Tooltip wie das [Dashboard](../dashboard.md#duplicati-server-version). Ausgegrauter Text bedeutet aktuell oder nicht verfügbar; gelb als Warnung bedeutet veraltet. |
| **Webschnittstellen-Adresse (URL)** | Konfigurieren Sie die URL für den Zugriff auf die Benutzeroberfläche des Duplicati-Servers. Sowohl `HTTP` als auch `HTTPS` URLs werden unterstützt.                                                                                           |
| **Status**                      | Zeigt die Ergebnisse des Tests oder der Sicherungsprotokolle an                                                                                                                                              |
| **Aktionen**                    | Sie können testen, die Duplicati-Oberfläche öffnen, Protokolle sammeln und ein Passwort festlegen, siehe unten für weitere Details.                                                                                         |

<br/>

:::note
Falls die Webschnittstellen-Adresse (URL) nicht konfiguriert ist, wird der <SvgIcon svgFilename="duplicati_logo.svg" />-Button 
auf allen Seiten deaktiviert und der Server wird nicht in der [Duplicati-Konfiguration](../duplicati-configuration.md) <SvgButton svgFilename="duplicati_logo.svg" href="../duplicati-configuration"/> Liste angezeigt.
:::

<br/>

## Verfügbare Aktionen für jeden Server {/* #available-actions-for-each-server */}

| Button                                                                                                      | Beschreibung                                                          |
|:------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------|
| <IconButton icon="lucide:play" label="Test"/>                                                               | Testen Sie die Verbindung zum Duplicati-Server.                       |
| <SvgButton svgFilename="duplicati_logo.svg" />                                                              | Öffnet die Web-Oberfläche des Duplicati-Servers in einem neuen Browser-Tab.         |
| <IconButton icon="lucide:download" />                                                                       | Sammelt Sicherungsprotokolle vom Duplicati-Server.                    |
| <IconButton icon="lucide:rectangle-ellipsis" /> &nbsp; oder <IIcon2 icon="lucide:key-round" color="#42A5F5"/> | Ändern oder setzen Sie ein Passwort für den Duplicati-Server, um Sicherungen zu erstellen. |

<br/>

:::info[WICHTIG]

Zum Schutz Ihrer Sicherheit können Sie nur folgende Aktionen durchführen:
- Ein Passwort für den Server festlegen
- Das Passwort vollständig entfernen (löschen)
 
Das Passwort wird verschlüsselt in der Datenbank gespeichert und niemals in der Benutzeroberfläche angezeigt.
:::

<br/>

## Verfügbare Aktionen für alle Server {/* #available-actions-for-all-servers */}

| Button                                                     | Beschreibung                                    |
|:-----------------------------------------------------------|:------------------------------------------------|
| <IconButton label="Änderungen speichern" />                        | Speichert die Änderungen an den Servereinstellungen.|
| <IconButton icon="lucide:fast-forward" label="Alle testen"/>  | Testen Sie die Verbindung zu allen Duplicati-Servern.   |
| <IconButton icon="lucide:import" label="Alle sammeln (#)"/> | Sammeln Sie Backup-Protokolle von allen Duplicati-Servern. |

<br/>
