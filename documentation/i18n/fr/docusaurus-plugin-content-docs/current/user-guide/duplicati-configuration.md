# Configuration de Duplicati {/* #duplicati-configuration */}

Le bouton <SvgButton svgFilename="duplicati_logo.svg" /> sur la [barre d'outils de l'application](overview.md#application-toolbar) ouvre l'interface web du serveur Duplicati dans un nouvel onglet.

Vous pouvez sélectionner un serveur dans la liste déroulante. Si vous avez déjà sélectionné un serveur (en cliquant sur sa carte) ou que vous consultez ses détails, le bouton ouvrira directement la configuration Duplicati de ce serveur spécifique.

![Configuration de Duplicati](../assets/screen-duplicati-configuration.png)

- La liste des serveurs affichera le `server name` ou le `server alias (server name)`.
- Les adresses des serveurs sont configurées dans [Paramètres → Serveur](settings/server-settings.md).
- L'application enregistre automatiquement l'URL d'un serveur lorsque vous utilisez la fonctionnalité <IconButton icon="lucide:download" height="16" href="collect-backup-logs" /> [Collecter les journaux de sauvegarde](collect-backup-logs.md).
- Les serveurs n'apparaîtront pas dans la liste des serveurs si leur adresse n'a pas été configurée.

## Accéder à l'ancienne interface utilisateur Duplicati {/* #accessing-the-old-duplicati-ui */}

Si vous rencontrez des problèmes de connexion avec la nouvelle interface web Duplicati (`/ngclient/`), vous pouvez faire un clic droit sur le bouton <SvgButton svgFilename="duplicati_logo.svg" /> ou sur n'importe quel élément de serveur dans la fenêtre contextuelle de sélection du serveur pour ouvrir l'ancienne interface utilisateur Duplicati (`/ngax/`) dans un nouvel onglet.

<br/><br/>

:::note
 Tous les noms de produits, logos et marques commerciales sont la propriété de leurs propriétaires respectifs. Les icônes et les noms sont utilisés à des fins d'identification uniquement et n'impliquent pas une approbation.
:::
