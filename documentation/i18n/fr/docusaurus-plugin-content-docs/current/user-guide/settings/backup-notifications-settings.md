---
translation_last_updated: '2026-02-06T22:33:29.283Z'
source_file_mtime: '2026-02-02T01:09:34.944Z'
source_file_hash: 3916dd789d9d4bf2
translation_language: fr
source_file_path: user-guide/settings/backup-notifications-settings.md
---
# Notifications de sauvegarde {#backup-notifications}

Utilisez ces paramètres pour envoyer des notifications quand un [nouveau journal de sauvegarde est reçu](../../installation/duplicati-server-configuration.md).

![Backup alerts](../../assets/screen-settings-notifications.png)

Le tableau des notifications de sauvegarde est organisé par serveur. Le format d'affichage dépend du nombre de sauvegardes qu'un serveur possède :
- **Plusieurs sauvegardes** : Affiche une ligne d'en-tête du serveur avec des lignes de sauvegarde individuelles en dessous. Cliquez sur l'en-tête du serveur pour développer ou réduire la liste des sauvegardes.
- **Une seule sauvegarde** : Affiche une **ligne fusionnée** avec une bordure gauche bleue, montrant :
  - **Nom du serveur : Nom de sauvegarde** si aucun alias du serveur n'est configuré, ou
  - **Alias du serveur (Nom du serveur) : Nom de sauvegarde** s'il est configuré.

Cette page dispose d'une fonction d'enregistrement automatique. Toutes les modifications que vous apportez seront enregistrées automatiquement.

<br/>

## Filtrer et Rechercher {#filter-and-search}

Utilisez le champ **Filtrer par nom de serveur** en haut de la page pour trouver rapidement des sauvegardes spécifiques par nom de serveur ou alias. Le tableau se filtrera automatiquement pour afficher uniquement les entrées correspondantes.

<br/>

## Configurer les paramètres de notification par sauvegarde {#configure-per-backup-notification-settings}

| Paramètre                     | Description                                               | Valeur par défaut |
| :---------------------------- | :-------------------------------------------------------- | :------------ |
| **Événements de notification**       | Configurer quand envoyer des notifications pour les nouveaux journaux de sauvegarde. | `Avertissements`    |
| **NTFY**                      | Activer ou désactiver les notifications NTFY pour cette sauvegarde.     | `Activé`     |
| **E-mail**                     | Activer ou désactiver les notifications par e-mail pour cette sauvegarde.    | `Activé`    |

**Options des Événements de notification :**

- `all`: Envoyer des notifications pour tous les événements de sauvegarde.
- `warnings`: Envoyer des notifications pour les avertissements et les erreurs uniquement (par défaut).
- `errors`: Envoyer des notifications pour les erreurs uniquement.
- `off`: Désactiver les notifications pour les nouveaux journaux de sauvegarde pour cette sauvegarde.

<br/>

## Destinations supplémentaires {#additional-destinations}

Les destinations de notification supplémentaires vous permettent d'envoyer des notifications à des adresses e-mail spécifiques ou à des sujets NTFY au-delà des paramètres globaux. Le système utilise un modèle d'héritage hiérarchique où les sauvegardes peuvent hériter des paramètres par défaut de leur serveur, ou les remplacer par des valeurs spécifiques à la sauvegarde.

La configuration de destination supplémentaire est indiquée par des icônes contextuelles à côté des noms de serveur et de sauvegarde :

- **Icône de serveur** <IconButton icon="lucide:settings-2" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} />: Apparaît à côté des noms de serveur quand des Destinations supplémentaires par défaut sont configurées au niveau du serveur.

- **Icône de sauvegarde** <IconButton icon="lucide:external-link" style={{border: 'none', padding: 0, color: '#60a5fa', background: 'transparent'}} /> (bleu) : Apparaît à côté des noms de sauvegarde lorsque des Destinations supplémentaires personnalisées sont configurées (remplaçant les paramètres par défaut du Serveur).

- **Icône de sauvegarde** <IconButton icon="lucide:external-link" style={{border: 'none', padding: 0, color: '#64748b', background: 'transparent'}} /> (gris) : Apparaît à côté des noms de sauvegarde lorsque la sauvegarde hérite de Destinations supplémentaires à partir des paramètres par défaut du Serveur.

Si aucune icône n'est affichée, le serveur ou la sauvegarde n'a pas de destinations supplémentaires configurées.

![Server-level additional destinations](../../assets/screen-settings-notifications-server.png)

### Valeurs par défaut au niveau du serveur {#server-level-defaults}

Vous pouvez configurer des destinations supplémentaires par défaut au niveau du serveur que toutes les sauvegardes sur ce serveur hériteront automatiquement.

1. Accédez à `Paramètres → Notifications de sauvegarde`.
2. Le tableau est regroupé par serveur, avec des lignes d'en-tête de serveur distinctes affichant le nom du serveur, l'alias et le nombre de sauvegardes.
   - **Note** : Pour les serveurs avec une seule sauvegarde, une ligne fusionnée s'affiche à la place d'un en-tête de serveur distinct. Les paramètres par défaut au niveau du serveur ne peuvent pas être configurés directement à partir de lignes fusionnées. Si vous devez configurer les paramètres par défaut du serveur pour un serveur avec une seule sauvegarde, vous pouvez le faire en ajoutant temporairement une autre sauvegarde à ce serveur, ou les Destinations supplémentaires de la sauvegarde hériteront automatiquement de tous les paramètres par défaut du serveur existants.
3. Cliquez n'importe où dans une ligne de serveur pour développer la section **Destinations supplémentaires par défaut pour ce serveur**.
4. Configurez les paramètres par défaut suivants :
   - **Événement de notification** : Choisissez les événements qui déclenchent des notifications vers les destinations supplémentaires (`all`, `warnings`, `errors` ou `off`).
   - **E-mails supplémentaires** : Entrez une ou plusieurs adresses e-mail (séparées par des virgules) qui recevront des notifications pour toutes les sauvegardes sur ce serveur. Cliquez sur le bouton d'icône <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> pour envoyer un e-mail de test aux adresses du champ.
   - **Sujet NTFY supplémentaire** : Entrez un nom de sujet NTFY personnalisé où les notifications seront publiées pour toutes les sauvegardes sur ce serveur. Cliquez sur le bouton d'icône <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> pour envoyer une notification de test au sujet, ou cliquez sur le bouton d'icône <IconButton icon="lucide:qr-code" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> pour afficher un code QR du sujet afin de configurer votre appareil pour recevoir des notifications.

**Gestion par défaut du serveur :**

- **Sync to All**: Efface tous les remplacements de sauvegarde, ce qui permet à toutes les sauvegardes d'hériter des paramètres par défaut du serveur.
- **Clear All**: Efface toutes les destinations supplémentaires des paramètres par défaut du serveur et de toutes les sauvegardes tout en maintenant la structure d'héritage.

### Configuration par sauvegarde {#per-backup-configuration}

Les sauvegardes individuelles héritent automatiquement des paramètres par défaut du serveur, mais vous pouvez les remplacer pour des tâches de sauvegarde spécifiques.

1. Cliquez n'importe où dans une ligne de sauvegarde pour développer sa section **Destinations supplémentaires**.
2. Configurez les paramètres suivants :
   - **Notification event** : Choisissez les événements qui déclenchent des notifications vers les destinations supplémentaires (`all`, `warnings`, `errors`, ou `off`).
   - **Additional Emails** : Entrez une ou plusieurs adresses e-mail (séparées par des virgules) qui recevront des notifications en plus du destinataire global. Cliquez sur le bouton icône <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> pour envoyer un e-mail de test aux adresses du champ.
   - **Additional NTFY Topic** : Entrez un nom de sujet NTFY personnalisé où les notifications seront publiées en plus du sujet par défaut. Cliquez sur le bouton icône <IconButton icon="lucide:send-horizontal" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> pour envoyer une notification de test au sujet, ou cliquez sur le bouton icône <IconButton icon="lucide:qr-code" style={{border: 'none', padding: 0, color: 'inherit', background: 'transparent'}} /> pour afficher un code QR du sujet afin de configurer votre appareil pour recevoir des notifications.

**Indicateurs d'héritage :**

- **Icône de lien** <IconButton icon="lucide:link" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} /> en bleu : Indique que la valeur est héritée des paramètres par défaut du serveur. Cliquer sur le champ créera une substitution pour la modification.
- **Icône de lien brisé** <IconButton icon="lucide:link-2-off" style={{border: 'none', padding: 0, color: '#3b82f6', background: 'transparent'}} /> en bleu : Indique que la valeur a été substituée. Cliquer sur l'icône pour revenir à l'héritage.

**Comportement des Destinations supplémentaires :**

- Les notifications sont envoyées aux paramètres globaux et aux destinations supplémentaires lorsqu'elles sont configurées.
- Le paramètre d'événement de notification pour les destinations supplémentaires est indépendant du paramètre d'événement de notification principal.
- Si les destinations supplémentaires sont définies sur `off`, aucune notification ne sera envoyée à ces destinations, mais les notifications principales continueront de fonctionner selon les paramètres principaux.
- Quand une sauvegarde hérite des paramètres par défaut du serveur, toute modification des paramètres par défaut du serveur s'appliquera automatiquement à cette sauvegarde (sauf si elle a été remplacée).

<br/>

## Modification en masse {#bulk-edit}

Vous pouvez modifier les paramètres de destinations supplémentaires pour plusieurs sauvegardes à la fois en utilisant la fonction de modification en masse. Ceci est particulièrement utile quand vous devez appliquer les mêmes destinations supplémentaires à de nombreuses tâches de sauvegarde.

![Bulk edit dialog](../../assets/screen-settings-notifications-bulk.png)

1. Accédez à `Paramètres → Notifications de sauvegarde`.
2. Utilisez les cases à cocher de la première colonne pour sélectionner les sauvegardes ou serveurs que vous souhaitez modifier.
   - Utilisez la case à cocher de la ligne d'en-tête pour sélectionner ou désélectionner toutes les sauvegardes visibles.
   - Vous pouvez utiliser le filtre pour affiner la liste avant de sélectionner.
3. Une fois les sauvegardes sélectionnées, une barre d'action en masse apparaîtra indiquant le nombre de sauvegardes sélectionnées.
4. Cliquez sur `Modification en masse` pour ouvrir la boîte de dialogue de modification.
5. Configurez les paramètres de destination supplémentaires :
   - **Événement de notification** : Définissez l'événement de notification pour toutes les sauvegardes sélectionnées.
   - **E-mails supplémentaires** : Entrez les adresses e-mail (séparées par des virgules) à appliquer à toutes les sauvegardes sélectionnées.
   - **Sujet NTFY supplémentaire** : Entrez un nom de sujet NTFY à appliquer à toutes les sauvegardes sélectionnées.
   - Des boutons de test sont disponibles dans la boîte de dialogue de modification en masse pour vérifier les adresses e-mail et les sujets NTFY avant de les appliquer à plusieurs sauvegardes.
6. Cliquez sur `Enregistrer` pour appliquer les paramètres à toutes les sauvegardes sélectionnées.

**Effacement en masse :**

Pour supprimer tous les paramètres de destination supplémentaires des sauvegardes sélectionnées :

1. Sélectionner les sauvegardes que vous souhaitez effacer.
2. Cliquez sur « Bulk Clear » dans la barre d'action en masse.
3. Confirmez l'action dans la boîte de dialogue.

Cela supprimera toutes les adresses e-mail supplémentaires, les rubriques NTFY et les événements de notification pour les sauvegardes sélectionnées. Après suppression, les sauvegardes hériteront à nouveau des paramètres par défaut du serveur (s'ils sont configurés).

<br/>
