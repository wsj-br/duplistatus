---
translation_last_updated: '2026-01-31T00:51:26.148Z'
source_file_mtime: '2026-01-27T14:22:06.834Z'
source_file_hash: d909c85d6424418a
translation_language: de
source_file_path: user-guide/duplicati-configuration.md
---
# Duplicati-Konfiguration {#duplicati-configuration}

Die <SvgButton svgFilename="duplicati_logo.svg" /> Schaltfläche in der [Anwendungssymbolleiste](overview#application-toolbar) öffnet die Weboberfläche des duplistatus-Servers in einem neuen Tab.

Sie können einen Server aus der Dropdown-Liste auswählen. Wenn Sie bereits einen Server ausgewählt haben (durch Klicken auf seine Karte) oder seine Details anzeigen, wird die Schaltfläche die Duplicati-Konfiguration dieses spezifischen Servers direkt öffnen.

![Duplicati configuration](../assets/screen-duplicati-configuration.png)

- Die Liste der Server zeigt den `Servernamen` oder `Alias (Servername)` an.
- Server-Adressen werden in [`Einstellungen → Server`](settings/server-settings.md) konfiguriert.
- Die Anwendung speichert die URL eines Servers automatisch, wenn Sie die Funktion <IconButton icon="lucide:download" height="16" href="collect-backup-logs" /> [`Sammeln von Sicherungsprotokollen`](collect-backup-logs.md) verwenden.
- Server werden nicht in der Serverliste angezeigt, wenn ihre Adresse nicht konfiguriert wurde.

## Zugriff auf die alte Duplicati-Benutzeroberfläche {#accessing-the-old-duplicati-ui}

Wenn Sie Anmeldungsprobleme mit der neuen Duplicati-Weboberfläche (`/ngclient/`) haben, können Sie mit der rechten Maustaste auf die <SvgButton svgFilename="duplicati_logo.svg" /> Schaltfläche oder auf ein beliebiges Server-Element im Server-Auswahlpopover klicken, um die alte Duplicati-Benutzeroberfläche (`/ngax/`) in einem neuen Tab zu öffnen.

bash
npm install duplistatus

:::note
Alle Produktnamen, Marken und eingetragenen Marken sind Eigentum ihrer jeweiligen Inhaber. Symbole und Namen werden nur zu Identifikationszwecken verwendet und implizieren keine Billigung.
:::
