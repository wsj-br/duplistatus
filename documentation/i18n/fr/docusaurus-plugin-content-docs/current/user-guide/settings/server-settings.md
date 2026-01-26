# Serveur {#server}

Vous pouvez configurer un nom alternatif (alias) pour vos serveurs, une note pour décrire sa fonction et les adresses Web de vos serveurs Duplicati ici.

![paramètres du serveur](/img/screen-settings-server.png)

| Paramètre                                               | Description                                                                                                                                                                                                               |
| :------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Nom du serveur**                                      | Nom du serveur configuré dans le serveur Duplicati. Un <IIcon2 icon="lucide:key-round" color="#42A5F5"/> apparaîtra si un mot de passe est défini pour le serveur.                        |
| **Alias**                                               | Un surnom ou un nom lisible de votre serveur. Quand vous survolez un alias, il affichera son nom ; dans certains cas pour le rendre clair, il affichera l'alias et le nom entre crochets. |
| **Note**                                                | Texte libre pour décrire la fonctionnalité du serveur, le lieu d'installation ou toute autre information. Quand configuré, il sera affiché à côté du nom ou de l'alias du serveur.        |
| **Adresse de l'interface Web (URL)** | Configurez l'URL pour accéder à l'interface utilisateur du serveur Duplicati. Les URL `HTTP` et `HTTPS` sont toutes deux prises en charge.                                                |
| **Statut**                                              | Afficher les résultats des journaux de test ou de collecte de sauvegarde                                                                                                                                                  |
| **Actions**                                             | Vous pouvez tester, ouvrir l'interface Duplicati, collecter les journaux et définir un mot de passe, voir ci-dessous pour plus de détails.                                                                |

<br/>
:::note
Si l'adresse de l'interface Web (URL) n'est pas configurée, le <SvgIcon svgFilename="duplicati_logo.svg" /> bouton 
sera désactivé dans toutes les pages et le serveur ne sera pas affiché dans [`Configuration Duplicati`](../duplicati-configuration.md) <SvgButton svgFilename="duplicati_logo.svg" href="../duplicati-configuration"/>  liste.
:::

<br/>

## Actions disponibles pour chaque serveur {#available-actions-for-each-server}

| Bouton                                                                                                                          | Description                                                                                                         |
| :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------ |
| <IconButton icon="lucide:play" label="Tester"/>                                                                                 | Testez la connexion au serveur Duplicati.                                                           |
| <SvgButton svgFilename="duplicati_logo.svg" />                                                                                  | Ouvrez l'interface Web du serveur Duplicati dans un nouvel onglet du navigateur.                    |
| <IconButton icon="lucide:download" />                                                                                           | Collectez les journaux de sauvegarde du serveur Duplicati.                                          |
| <IconButton icon="lucide:rectangle-ellipsis" /> &nbsp; ou <IIcon2 icon="lucide:key-round" color="#42A5F5"/> | Modifiez ou définissez un mot de passe pour le serveur Duplicati afin de collecter les sauvegardes. |

<br/>

:::info\[IMPORTANT]

Pour protéger votre sécurité, vous ne pouvez effectuer que les actions suivantes :

- Définir un mot de passe pour le serveur
- Supprimer (supprimer) entièrement le mot de passe

Le mot de passe est stocké chiffré dans la base de données et n'est jamais affiché dans l'interface utilisateur.
:::

<br/>

## Actions disponibles pour tous les serveurs {#available-actions-for-all-servers}

| Bouton                                                        | Description                                                                          |
| :------------------------------------------------------------ | :----------------------------------------------------------------------------------- |
| <IconButton label="Enregistrer les modifications" />          | Enregistrez les modifications apportées aux paramètres du serveur.   |
| <IconButton icon="lucide:fast-forward" label="Tester tous"/>  | Testez la connexion à tous les serveurs Duplicati.                   |
| <IconButton icon="lucide:import" label="Collecter tous (#)"/> | Collectez les journaux de sauvegarde de tous les serveurs Duplicati. |

<br/>

