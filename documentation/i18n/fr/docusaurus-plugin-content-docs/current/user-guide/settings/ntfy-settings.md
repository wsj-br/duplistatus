# NTFY {/* #ntfy */}

[NTFY](https://github.com/binwiederhier/ntfy) est un service de notification simple qui peut envoyer des notifications push à votre téléphone ou bureau. Cette section vous permet de configurer la connexion à votre serveur de notifications et l'authentification.

![Paramètres NTFY](../../assets/screen-settings-ntfy.png)

| Paramètre               | Description                                                                                                                                   |
|:----------------------|:----------------------------------------------------------------------------------------------------------------------------------------------|
| **URL NTFY**          | L'URL de votre serveur NTFY (par défaut, le serveur public `https://ntfy.sh/`).                                                                      |
| **Topic NTFY**        | Un identifiant unique pour vos notifications. Le système générera automatiquement un topic aléatoire si ce champ est laissé vide, ou vous pouvez en spécifier un. |
| **Jeton d'accès NTFY** | Un jeton d'accès optionnel pour les serveurs NTFY nécessitant une authentification. Laissez ce champ vide si votre serveur n'exige pas d'authentification.               |

<br/>

Une icône verte <IIcon2 icon="lucide:message-square" color="green"/> à côté de **NTFY** dans la barre latérale signifie que vos paramètres sont valides. Si l'icône est <IIcon2 icon="lucide:message-square" color="yellow"/> jaune, vos paramètres ne sont pas valides.
Quand la configuration n'est pas valide, les cases à cocher NTFY dans l'onglet [`Backup Notifications`](backup-notifications-settings.md) seront également grisées.

## Actions disponibles {/* #available-actions */}

| Bouton                                                                | Description                                                                                                  |
|:----------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------|
| <IconButton label="Enregistrer les paramètres" />                                  | Enregistrer les modifications apportées aux paramètres NTFY.                                                                  |
| <IconButton icon="lucide:send-horizontal" label="Envoyer un message de test"/> | Envoyer un message de test à votre serveur NTFY pour vérifier votre configuration.                                         |
| <IconButton icon="lucide:qr-code" label="Configurer l'appareil"/>          | Afficher un code QR qui vous permet de configurer rapidement votre appareil mobile ou bureau pour les notifications NTFY. |

## Configuration de l'appareil {/* #device-configuration */}

Vous devez installer l'application NTFY sur votre appareil avant de le configurer ([voir ici](https://ntfy.sh/)). En cliquant sur le bouton <IconButton icon="lucide:qr-code" label="Configurer l'appareil"/>, ou en faisant un clic droit sur l'icône <SvgButton svgFilename="ntfy.svg" /> dans la barre d'outils de l'application, un code QR s'affichera. Scanner ce code QR configurera automatiquement votre appareil avec le bon topic NTFY pour les notifications.

<br/>

<br/>

:::caution
Si vous utilisez le serveur public **ntfy.sh** sans jeton d'accès, toute personne connaissant le nom de votre topic pourra voir vos
notifications. 
 
Pour offrir un certain niveau de confidentialité, un topic aléatoire de 12 caractères est généré, offrant plus de
3 sextillions (3,000,000,000,000,000,000,000) de combinaisons possibles, rendant difficile la devinette.

Pour une sécurité améliorée, envisagez d'utiliser [l'authentification par jeton d'accès](https://docs.ntfy.sh/config/#access-tokens) et [les listes de contrôle d'accès](https://docs.ntfy.sh/config/#access-control-list-acl) pour protéger vos topics, ou [hébergez NTFY vous-même](https://docs.ntfy.sh/install/#docker) pour un contrôle total.

⚠️ **Vous êtes responsable de la sécurisation de vos topics NTFY. Veuillez utiliser ce service à votre propre discrétion.**
:::

<br/>
<br/>

:::note
 Tous les noms de produits, logos et marques de commerce sont la propriété de leurs propriétaires respectifs. Les icônes et noms sont utilisés à des fins d'identification uniquement et n'impliquent pas d'approbation.
:::
