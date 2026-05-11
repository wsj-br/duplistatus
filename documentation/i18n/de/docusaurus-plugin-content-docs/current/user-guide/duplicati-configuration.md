---
translation_last_updated: '2026-05-11T14:27:46.629Z'
source_file_mtime: '2026-05-06T23:18:51.430Z'
source_file_hash: ba54f9487a2894080dee40e174c35d9fcf1630e84c5ba9b08d4c4d2989626a61
translation_language: de
source_file_path: documentation/docs/user-guide/duplicati-configuration.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
  - 'stepfun/step-3.5-flash:free'
---
# Duplicati-Konfiguration {#duplicati-configuration}

Die Schaltfläche <SvgButton svgFilename="duplicati_logo.svg" /> auf der [Anwendungsleiste](overview.md#application-toolbar) öffnet die Web-Oberfläche des Duplicati-Servers in einem neuen Tab.

Sie können einen Server aus der Dropdown-Liste auswählen. Wenn Sie bereits einen Server ausgewählt haben (durch Klicken auf seine Karte) oder dessen Details anzeigen, öffnet die Schaltfläche die Duplicati-Konfiguration dieses spezifischen Servers direkt.

![Duplicati configuration](../assets/screen-duplicati-configuration.png)

- Die Liste der Server zeigt den `Servernamen` oder `Server-Alias (Servername)` an.
- Server-Adressen werden in [Einstellungen → Server](settings/server-settings.md) konfiguriert.
- Die Anwendung speichert die URL eines Servers automatisch, wenn Sie die Funktion <IconButton icon="lucide:download" height="16" href="collect-backup-logs" /> [Backup-Protokolle sammeln](collect-backup-logs.md) verwenden.
- Server werden nicht in der Serverliste angezeigt, wenn ihre Adresse nicht konfiguriert wurde.

## Zugriff auf die alte Duplicati-Benutzeroberfläche {#accessing-the-old-duplicati-ui}

Wenn Sie Probleme beim Anmelden mit der neuen Duplicati-Weboberfläche (`/ngclient/`) haben, können Sie mit der rechten Maustaste auf die <SvgButton svgFilename="duplicati_logo.svg" /> Schaltfläche oder auf ein beliebiges Server-Element im Server-Auswahlmenü klicken, um die alte Duplicati-Benutzeroberfläche (`/ngax/`) in einem neuen Tab zu öffnen.

<br/><br/>

:::note
Alle Produktnamen, Logos und Marken sind Eigentum ihrer jeweiligen Eigentümer. Symbole und Namen werden ausschließlich zu Identifikationszwecken verwendet und implizieren keine Billigung.
:::
