---
translation_last_updated: '2026-05-11T14:27:48.326Z'
source_file_mtime: '2026-05-06T23:18:51.446Z'
source_file_hash: 3f2e9249dca9757c8c95acf36f66841a560491d15f0f0d1ecb24826a5628f983
translation_language: fr
source_file_path: documentation/docs/user-guide/settings/server-settings.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Serveur {#server}

Vous pouvez configurer un nom alternatif (alias) pour vos serveurs, une note pour décrire sa fonction et les adresses web de vos serveurs Duplicati ici.

![server settings](../../assets/screen-settings-server.png)

| Paramètre                         | Description                                                                                                                                                                                  |
|:--------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Nom du serveur**                 | Nom du serveur configuré dans le serveur Duplicati. Un <IIcon2 icon="lucide:key-round" color="#42A5F5"/> apparaîtra si un mot de passe est défini pour le serveur.                                         |
| **Alias**                       | Un surnom ou un nom lisible par l'humain pour votre serveur. Lorsque vous placez le curseur sur un alias, le nom s'affiche ; dans certains cas, pour plus de clarté, l'alias et le nom sont affichés entre parenthèses. |
| **Note**                        | Texte libre permettant de décrire les fonctionnalités du serveur, son emplacement d'installation ou toute autre information. Une fois configuré, il s'affiche à côté du nom ou de l'alias du serveur.                 |
| **Adresse de l'interface web (URL)** | Configurez l'URL pour accéder à l'interface utilisateur du serveur Duplicati. Les URL `HTTP` et `HTTPS` sont prises en charge.                                                                                           |
| **Statut**                      | Affiche les résultats du test ou de la collecte des journaux de sauvegarde                                                                                                                                              |
| **Actions**                     | Vous pouvez tester, ouvrir l'interface Duplicati, collecter les journaux et définir un mot de passe. Voir ci-dessous pour plus de détails.                                                                                         |

<br/>

:::note
Si l'Adresse de l'interface Web (URL) n'est pas configurée, le bouton <SvgIcon svgFilename="duplicati_logo.svg" /> 
sera désactivé sur toutes les pages et le serveur ne s'affichera pas dans la liste [Configuration Duplicati](../duplicati-configuration.md) <SvgButton svgFilename="duplicati_logo.svg" href="../duplicati-configuration"/>.
:::

<br/>

## Actions disponibles pour chaque serveur {#available-actions-for-each-server}

| Bouton                                                                                                      | Description                                                             |
|:------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------|
| <IconButton icon="lucide:play" label="Tester"/>                                                               | Tester la connexion au serveur Duplicati.                            |
| <SvgButton svgFilename="duplicati_logo.svg" />                                                              | Ouvrir l'interface web du serveur Duplicati dans un nouvel onglet du navigateur.         |
| <IconButton icon="lucide:download" />                                                                       | Collecter les journaux de sauvegarde depuis le serveur Duplicati.                          |
| <IconButton icon="lucide:rectangle-ellipsis" /> &nbsp; ou <IIcon2 icon="lucide:key-round" color="#42A5F5"/> | Modifier ou définir un mot de passe pour le serveur Duplicati afin de collecter les sauvegardes. |

<br/>

:::info[IMPORTANT]

Pour protéger votre sécurité, vous pouvez uniquement effectuer les actions suivantes :
- Définir un mot de passe pour le serveur
- Supprimer (supprimer) le mot de passe entièrement
 
Le mot de passe est stocké chiffré dans la base de données et n'est jamais affiché dans l'interface utilisateur.
:::

<br/>

## Actions disponibles pour tous les serveurs {#available-actions-for-all-servers}

| Bouton                                                     | Description                                     |
|:-----------------------------------------------------------|:------------------------------------------------|
| <IconButton label="Enregistrer les modifications" />                        | Enregistrer les modifications apportées aux paramètres du serveur.   |
| <IconButton icon="lucide:fast-forward" label="Tout tester"/>  | Tester la connexion à tous les serveurs Duplicati.   |
| <IconButton icon="lucide:import" label="Tout collecter (#)"/> | Collecter les journaux de sauvegarde depuis tous les serveurs Duplicati. |

<br/>
