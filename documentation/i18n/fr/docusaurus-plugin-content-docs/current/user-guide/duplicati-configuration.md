# Configuration Duplicati {#duplicati-configuration}

Le bouton <SvgButton svgFilename="duplicati_logo.svg" /> sur la [Barre d'outils de l'application](overview#application-toolbar) ouvre l'interface web du serveur Duplicati dans un nouvel onglet.

Vous pouvez Sélectionner un Serveur dans la liste déroulante. Si vous avez déjà Sélectionné un Serveur (en cliquant sur sa carte) ou que vous Affichage ses Détails, le bouton ouvrira la Configuration Duplicati de ce Serveur spécifique directement.

![Configuration Duplicati](/assets/screen-duplicati-configuration.png)

- La liste des Serveurs affichera le `Nom du serveur` ou `Alias du serveur (Nom du serveur)`.
- Les Adresses des serveurs sont Configurées dans [`Paramètres → Serveur`](settings/server-settings.md).
- L'application enregistre automatiquement l'URL d'un Serveur Quand vous utilisez la fonctionnalité <IconButton icon="lucide:download" height="16" href="collect-backup-logs" /> [`Collecter les journaux de sauvegarde`](collect-backup-logs.md).
- Les Serveurs n'apparaîtront pas dans la liste des Serveurs si leur adresse n'a pas été Configurée.

## Accès à l'ancienne interface utilisateur Duplicati {#accessing-the-old-duplicati-ui}

Si vous rencontrez des problèmes de Connexion avec la nouvelle interface web Duplicati (`/ngclient/`), vous pouvez faire un clic droit sur le bouton <SvgButton svgFilename="duplicati_logo.svg" /> ou sur n'importe quel élément de Serveur dans le popover de sélection des Serveurs pour ouvrir l'ancienne interface utilisateur Duplicati (`/ngax/`) dans un nouvel onglet.

<br/><br/>

:::note
Tous les noms de produits, marques commerciales et marques déposées sont la propriété de leurs propriétaires respectifs. Les icônes et les noms sont utilisés à des fins d'identification uniquement et n'impliquent pas une approbation.
:::

