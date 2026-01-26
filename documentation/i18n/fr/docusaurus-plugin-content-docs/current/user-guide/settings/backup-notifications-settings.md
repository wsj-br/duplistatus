# Notifications de sauvegarde {#backup-notifications}

Utilisez ces paramètres pour envoyer des notifications quand un [nouveau journal de sauvegarde est reçu](../../installation/duplicati-server-configuration.md).

![Alertes de sauvegarde](/img/screen-settings-notifications.png)

Le tableau des notifications de sauvegarde est organisé par serveur. Le format d'affichage dépend du nombre de sauvegardes qu'un serveur possède:

- **Plusieurs sauvegardes**: Affiche une ligne d'en-tête de serveur avec des lignes de sauvegarde individuelles en dessous. Cliquez sur l'en-tête du serveur pour développer ou réduire la liste des sauvegardes.
- **Sauvegarde unique**: Affiche une **ligne fusionnée** avec une bordure gauche bleue, montrant:
  - **Nom du serveur: Nom de sauvegarde** si aucun alias de serveur n'est configuré, ou
  - **Alias du serveur (Nom du serveur): Nom de sauvegarde** s'il est configuré.

Cette page dispose d'une fonction d'enregistrement automatique. Toutes les modifications que vous apportez seront enregistrées automatiquement.

<br/>

## Filtrer et rechercher {#filter-and-search}

Utilisez le champ **Filtrer par nom de serveur** en haut de la page pour trouver rapidement des sauvegardes spécifiques par nom de serveur ou alias. Le tableau se filtrera automatiquement pour afficher uniquement les entrées correspondantes.

<br/>

## Configurer les paramètres de notification par sauvegarde {#configure-per-backup-notification-settings}

| Paramètre                      | Description                                                                                          | Valeur par défaut |
| :----------------------------- | :--------------------------------------------------------------------------------------------------- | :---------------- |
| **Événements de notification** | Configurez quand envoyer des notifications pour les nouveaux journaux de sauvegarde. | `Avertissements`  |
| **NTFY**                       | Activez ou désactivez les notifications NTFY pour cette sauvegarde.                  | `Activé`          |
| **E-mail**                     | Activez ou désactivez les notifications par e-mail pour cette sauvegarde.            | `Activé`          |

**Options des événements de notification:**

- `tous`: Envoyer des notifications pour tous les événements de sauvegarde.
- `avertissements`: Envoyer des notifications pour les avertissements et erreurs uniquement (par défaut).
- `erreurs`: Envoyer des notifications pour les erreurs uniquement.
- `désactivé`: Désactiver les notifications pour les nouveaux journaux de sauvegarde pour cette sauvegarde.

<br/>

## Destinations supplémentaires {#additional-destinations}

Les destinations de notification supplémentaires vous permettent d'envoyer des notifications à des adresses e-mail spécifiques ou à des sujets NTFY au-delà des paramètres globaux. Le système utilise un modèle d'héritage hiérarchique où les sauvegardes peuvent hériter des paramètres par défaut de leur serveur, ou les remplacer par des valeurs spécifiques à la sauvegarde.

La configuration de destination supplémentaire est indiquée par des icônes contextuelles à côté des noms de serveur et de sauvegarde:

- **Icône de serveur** <IconButton icon="lucide:settings-2" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />: Apparaît à côté des noms de serveur quand les destinations supplémentaires par défaut sont configurées au niveau du serveur.

- **Icône de sauvegarde** <IconButton icon="lucide:external-link" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} /> (bleue): Apparaît à côté des noms de sauvegarde quand les destinations supplémentaires personnalisées sont configurées (remplaçant les valeurs par défaut du serveur).

- **Icône de sauvegarde** <IconButton icon="lucide:external-link" style={{border: 'none', padding: 0, color: '#64748b', background: 'transparent'}} /> (grise): Apparaît à côté des noms de sauvegarde quand la sauvegarde hérite des destinations supplémentaires des valeurs par défaut du serveur.

Si aucune icône n'est affichée, le serveur ou la sauvegarde n'a pas de destinations supplémentaires configurées.

![Destinations supplémentaires au niveau du serveur](/img/screen-settings-notifications-server.png)

### Valeurs par défaut au niveau du serveur {#server-level-defaults}

Vous pouvez configurer les destinations supplémentaires par défaut au niveau du serveur que toutes les sauvegardes sur ce serveur hériteront automatiquement.

1. Accédez à `Paramètres → Notifications de sauvegarde`.
2. Le tableau est groupé par serveur, avec des lignes d'en-tête de serveur distinctes affichant le nom du serveur, l'alias et le nombre de sauvegardes.
   - **Remarque**: Pour les serveurs avec une seule sauvegarde, une ligne fusionnée est affichée à la place d'un en-tête de serveur séparé. Les valeurs par défaut au niveau du serveur ne peuvent pas être configurées directement à partir des lignes fusionnées. Si vous devez configurer les valeurs par défaut du serveur pour un serveur avec une seule sauvegarde, vous pouvez le faire en ajoutant temporairement une autre sauvegarde à ce serveur, ou les destinations supplémentaires de la sauvegarde hériteront automatiquement de toutes les valeurs par défaut du serveur existantes.
3. Cliquez n'importe où dans une ligne de serveur pour développer la section **Destinations supplémentaires par défaut pour ce serveur**.
4. Configurez les paramètres par défaut suivants:
   - **Événement de notification**: Choisissez les événements qui déclenchent des notifications vers les destinations supplémentaires (`tous`, `avertissements`, `erreurs`, ou `désactivé`).
   - **E-mails supplémentaires**: Entrez une ou plusieurs adresses e-mail (séparées par des virgules) qui recevront des notifications pour toutes les sauvegardes sur ce serveur. Cliquez sur l'icône <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> pour envoyer un e-mail de test aux adresses du champ.
   - **Sujet NTFY supplémentaire**: Entrez un nom de sujet NTFY personnalisé où les notifications seront publiées pour toutes les sauvegardes sur ce serveur. Cliquez sur l'icône <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> pour envoyer une notification de test au sujet, ou cliquez sur l'icône <IconButton icon="lucide:qr-code" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> pour afficher un code QR pour le sujet afin de configurer votre appareil pour recevoir des notifications.

**Gestion des valeurs par défaut du serveur:**

- **Synchroniser avec tous**: Efface tous les remplacements de sauvegarde, ce qui fait que toutes les sauvegardes héritent des valeurs par défaut du serveur.
- **Effacer tous**: Efface toutes les destinations supplémentaires des valeurs par défaut du serveur et de toutes les sauvegardes tout en maintenant la structure d'héritage.

### Configuration par sauvegarde {#per-backup-configuration}

Les sauvegardes individuelles héritent automatiquement des valeurs par défaut du serveur, mais vous pouvez les remplacer pour des travaux de sauvegarde spécifiques.

1. Cliquez n'importe où dans une ligne de sauvegarde pour développer sa section **Destinations supplémentaires**.
2. Configurez les paramètres suivants:
   - **Événement de notification**: Choisissez les événements qui déclenchent des notifications vers les destinations supplémentaires (`tous`, `avertissements`, `erreurs`, ou `désactivé`).
   - **E-mails supplémentaires**: Entrez une ou plusieurs adresses e-mail (séparées par des virgules) qui recevront des notifications en plus du destinataire global. Cliquez sur l'icône <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> pour envoyer un e-mail de test aux adresses du champ.
   - **Sujet NTFY supplémentaire**: Entrez un nom de sujet NTFY personnalisé où les notifications seront publiées en plus du sujet par défaut. Cliquez sur l'icône <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> pour envoyer une notification de test au sujet, ou cliquez sur l'icône <IconButton icon="lucide:qr-code" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> pour afficher un code QR pour le sujet afin de configurer votre appareil pour recevoir des notifications.

**Indicateurs d'héritage:**

- **Icône de lien** <IconButton icon="lucide:link" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} /> en bleu: Indique que la valeur est héritée des valeurs par défaut du serveur. Cliquer sur le champ créera un remplacement pour l'édition.
- **Icône de lien cassé** <IconButton icon="lucide:link-2-off" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} /> en bleu: Indique que la valeur a été remplacée. Cliquez sur l'icône pour revenir à l'héritage.

**Comportement des destinations supplémentaires:**

- Les notifications sont envoyées aux paramètres globaux et aux destinations supplémentaires quand elles sont configurées.
- Le paramètre d'événement de notification pour les destinations supplémentaires est indépendant du paramètre d'événement de notification principal.
- Si les destinations supplémentaires sont définies sur `désactivé`, aucune notification ne sera envoyée à ces destinations, mais les notifications principales continueront à fonctionner selon les paramètres principaux.
- Quand une sauvegarde hérite des valeurs par défaut du serveur, toute modification des valeurs par défaut du serveur s'appliquera automatiquement à cette sauvegarde (sauf si elle a été remplacée).

<br/>

## Modification en masse {#bulk-edit}

Vous pouvez modifier les paramètres de destination supplémentaire pour plusieurs sauvegardes à la fois en utilisant la fonction de modification en masse. Ceci est particulièrement utile quand vous devez appliquer les mêmes destinations supplémentaires à de nombreux travaux de sauvegarde.

![Dialogue de modification en masse](/img/screen-settings-notifications-bulk.png)

1. Accédez à `Paramètres → Notifications de sauvegarde`.
2. Utilisez les cases à cocher dans la première colonne pour sélectionner les sauvegardes ou serveurs que vous souhaitez modifier.
   - Utilisez la case à cocher dans la ligne d'en-tête pour sélectionner ou désélectionner toutes les sauvegardes visibles.
   - Vous pouvez utiliser le filtre pour réduire la liste avant de sélectionner.
3. Une fois les sauvegardes sélectionnées, une barre d'action en masse apparaîtra affichant le nombre de sauvegardes sélectionnées.
4. Cliquez sur `Modification en masse` pour ouvrir le dialogue d'édition.
5. Configurez les paramètres de destination supplémentaire:
   - **Événement de notification**: Définissez l'événement de notification pour toutes les sauvegardes sélectionnées.
   - **E-mails supplémentaires**: Entrez les adresses e-mail (séparées par des virgules) à appliquer à toutes les sauvegardes sélectionnées.
   - **Sujet NTFY supplémentaire**: Entrez un nom de sujet NTFY à appliquer à toutes les sauvegardes sélectionnées.
   - Les boutons de test sont disponibles dans le dialogue de modification en masse pour vérifier les adresses e-mail et les sujets NTFY avant de les appliquer à plusieurs sauvegardes.
6. Cliquez sur `Enregistrer` pour appliquer les paramètres à toutes les sauvegardes sélectionnées.

**Effacement en masse:**

Pour supprimer tous les paramètres de destination supplémentaire des sauvegardes sélectionnées:

1. Sélectionnez les sauvegardes que vous souhaitez effacer.
2. Cliquez sur `Effacement en masse` dans la barre d'action en masse.
3. Confirmez l'action dans la boîte de dialogue.

Cela supprimera toutes les adresses e-mail supplémentaires, les sujets NTFY et l'événement de notification pour les sauvegardes sélectionnées. Après l'effacement, les sauvegardes reviendront à l'héritage des valeurs par défaut du serveur (si des valeurs sont configurées).

<br/>

