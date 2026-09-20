# Serveur {/* #server */}

Vous pouvez configurer un nom alternatif (alias) pour vos serveurs, une note décrivant leur fonction et les adresses web de vos serveurs Duplicati ici.

![paramètres du serveur](../../assets/screen-settings-server.png)

| Paramètre                       | Description                                                                                                                                                                                  |
|:--------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Nom du serveur**              | Nom du serveur configuré dans le serveur Duplicati. Un <IIcon2 icon="lucide:key-round" color="#42A5F5"/> apparaîtra si un mot de passe est défini pour le serveur.                                         |
| **Alias**                       | Un surnom ou un nom lisible par l'humain pour votre serveur. Lorsque vous survolez un alias, son nom s'affichera ; dans certains cas, pour plus de clarté, l'alias et le nom entre parenthèses seront affichés. |
| **Note**                        | Texte libre pour décrire la fonctionnalité du serveur, l'endroit d'installation ou toute autre information. Une fois configuré, il sera affiché à côté du nom ou de l'alias du serveur.                 |
| **Version**                     | La version de Duplicati issue du dernier journal de sauvegarde, avec la même couleur et infobulle que le [tableau de bord](../dashboard.md#duplicati-server-version). Le texte grisé indique actuel ou indisponible ; le jaune d'avertissement signifie obsolète. |
| **Adresse de l'interface web (URL)** | Configurez l'URL pour accéder à l'interface utilisateur du serveur Duplicati. Les URL `HTTP` et `HTTPS` sont prises en charge.                                                                                           |
| **Statut**                      | Affiche les résultats des tests ou de la collecte des journaux de sauvegarde                                                                                                                                              |
| **Actions**                     | Vous pouvez tester, ouvrir l'interface Duplicati, collecter les journaux et définir un mot de passe, voir ci-dessous pour plus de détails.                                                                                         |

<br/>

:::note
Si l'adresse de l'interface web (URL) n'est pas configurée, le bouton <SvgIcon svgFilename="duplicati_logo.svg" /> 
sera désactivé sur toutes les pages et le serveur ne sera pas affiché dans la liste [Configuration de Duplicati](../duplicati-configuration.md) <SvgButton svgFilename="duplicati_logo.svg" href="../duplicati-configuration"/> .
:::

<br/>

## Actions disponibles pour chaque serveur {/* #available-actions-for-each-server */}

| Bouton                                                                                                        | Description                                                             |
|:--------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------|
| <IconButton icon="lucide:play" label="Test"/>                                                               | Tester la connexion au serveur Duplicati.                            |
| <SvgButton svgFilename="duplicati_logo.svg" />                                                              | Ouvrir l'interface web du serveur Duplicati dans un nouvel onglet du navigateur.         |
| <IconButton icon="lucide:download" />                                                                       | Collecter les journaux de sauvegarde depuis le serveur Duplicati.                          |
| <IconButton icon="lucide:rectangle-ellipsis" /> &nbsp; ou <IIcon2 icon="lucide:key-round" color="#42A5F5"/> | Modifier ou définir un mot de passe pour le serveur Duplicati afin de collecter les sauvegardes. |

<br/>

:::info[IMPORTANT]

Pour protéger votre sécurité, vous ne pouvez effectuer que les actions suivantes :
- Définir un mot de passe pour le serveur
- Supprimer (effacer) entièrement le mot de passe
 
Le mot de passe est stocké chiffré dans la base de données et n'est jamais affiché dans l'interface utilisateur.
:::

<br/>

## Actions disponibles pour tous les serveurs {/* #available-actions-for-all-servers */}

| Bouton                                                     | Description                                     |
|:-----------------------------------------------------------|:------------------------------------------------|
| <IconButton label="Save Changes" />                        | Enregistrer les modifications apportées aux paramètres du serveur.   |
| <IconButton icon="lucide:fast-forward" label="Tout tester"/>  | Tester la connexion à tous les serveurs Duplicati.   |
| <IconButton icon="lucide:import" label="Tout collecter (N°)"/> | Collecter les journaux de sauvegarde de tous les serveurs Duplicati. |

<br/>
