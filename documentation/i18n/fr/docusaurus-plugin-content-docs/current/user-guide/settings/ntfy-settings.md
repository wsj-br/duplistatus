---
translation_last_updated: '2026-01-31T00:51:23.097Z'
source_file_mtime: '2026-01-27T14:22:06.838Z'
source_file_hash: 07586afae4356ecc
translation_language: fr
source_file_path: user-guide/settings/ntfy-settings.md
---
# NTFY {#ntfy}

NTFY est un [service de notification](https://github.com/binwiederhier/ntfy) open-source simple qui peut envoyer des notifications push vers votre téléphone ou votre ordinateur de bureau. Cette section vous permet de configurer votre connexion au serveur de notifications et l'authentification.

![Ntfy settings](../../assets/screen-settings-ntfy.png)

| Paramètre             | Description                                                                                                                                   |
|:----------------------|:----------------------------------------------------------------------------------------------------------------------------------------------|
| **URL NTFY**          | L'URL de votre serveur NTFY (par défaut, le serveur public `https://ntfy.sh/`).                                                              |
| **Sujet NTFY**        | Un identifiant unique pour vos notifications. Le système générera automatiquement un sujet aléatoire s'il est laissé vide, ou vous pouvez spécifier le vôtre. |
| **Jeton d'accès NTFY** | Un jeton d'accès optionnel pour les serveurs NTFY authentifiés. Laissez ce champ vide si votre serveur ne nécessite pas d'authentification.               |

<br/>

A <IIcon2 icon="lucide:message-square" color="green"/> icône verte à côté de `NTFY` dans la barre latérale signifie que vos paramètres sont valides. Si l'icône est <IIcon2 icon="lucide:message-square" color="yellow"/> jaune, vos paramètres ne sont pas valides.
Quand la configuration n'est pas valide, les cases à cocher NTFY dans l'onglet [`Notifications de sauvegarde`](backup-notifications-settings.md) seront également désactivées.

## Actions disponibles {#available-actions}

| Bouton                                                                | Description                                                                                                  |
|:----------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------|
| <IconButton label="Enregistrer les paramètres" />                                  | Enregistrer toute modification apportée aux paramètres NTFY.                                                                  |
| <IconButton icon="lucide:send-horizontal" label="Envoyer un message de test"/> | Envoyer un message de test à votre serveur NTFY pour vérifier votre configuration.                                         |
| <IconButton icon="lucide:qr-code" label="Configurer l'appareil"/>          | Afficher un code QR qui vous permet de configurer rapidement votre appareil mobile ou de bureau pour les notifications NTFY. |

## Configuration de l'appareil {#device-configuration}

Vous devez installer l'application NTFY sur votre appareil avant de la configurer ([voir ici](https://ntfy.sh/)). En cliquant sur le bouton <IconButton icon="lucide:qr-code" label="Configure Device"/>, ou en effectuant un clic droit sur l'icône <SvgButton svgFilename="ntfy.svg" /> dans la barre d'outils de l'application, un code QR s'affichera. En scannant ce code QR, votre appareil sera automatiquement configuré avec le sujet NTFY correct pour les notifications.

<br/>

<br/>

:::caution
Si vous utilisez le serveur public `ntfy.sh` sans jeton d'accès, toute personne connaissant le nom de votre sujet peut afficher vos notifications.

Pour offrir un certain degré de confidentialité, un sujet aléatoire de 12 caractères est généré, offrant plus de 3 sextillions (3 000 000 000 000 000 000 000) de combinaisons possibles, ce qui rend difficile la deviner.

Pour une sécurité améliorée, envisagez d'utiliser [l'authentification par jeton d'accès](https://docs.ntfy.sh/config/#access-tokens) et les [listes de contrôle d'accès](https://docs.ntfy.sh/config/#access-control-list-acl) pour protéger vos sujets, ou [auto-héberger NTFY](https://docs.ntfy.sh/install/#docker) pour un contrôle total.

⚠️ **Vous êtes responsable de la sécurisation de vos sujets NTFY. Veuillez utiliser ce service à votre discrétion.**
:::

<br/>
<br/>

:::note
Tous les noms de produits, marques commerciales et marques déposées sont la propriété de leurs propriétaires respectifs. Les icônes et les noms sont utilisés à titre d'identification uniquement et n'impliquent pas une approbation.
:::
