# E-mail {#email}

**duplistatus** prend en charge l'envoi de notifications par e-mail via SMTP comme alternative ou complément aux notifications NTFY. La configuration e-mail est maintenant gérée via l'interface web avec stockage chiffré dans la base de données pour une sécurité renforcée.

![Configuration e-mail](/img/screen-settings-email.png)

| Paramètre                  | Description                                                                                                                                                                                                                                                                                                                                                                                        |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hôte du serveur SMTP**   | Le serveur SMTP de votre fournisseur d'e-mail (par exemple, `smtp.gmail.com`).                                                                                                                                                                                                                                                                                  |
| **Port du serveur SMTP**   | Numéro de port (généralement `25` pour SMTP simple, `587` pour STARTTLS, ou `465` pour SSL/TLS direct).                                                                                                                                                                                                                                                         |
| **Type de connexion**      | Sélectionner entre SMTP simple, STARTTLS, ou SSL/TLS direct. Par défaut SSL/TLS direct pour les nouvelles configurations.                                                                                                                                                                                                                                          |
| **Authentification SMTP**  | Basculer pour activer ou désactiver l'authentification SMTP. Quand désactivé, les champs nom d'utilisateur et mot de passe ne sont pas requis.                                                                                                                                                                                                                     |
| **Nom d'utilisateur SMTP** | Votre adresse e-mail ou nom d'utilisateur (requis quand l'authentification est activée).                                                                                                                                                                                                                                                                        |
| **Mot de passe SMTP**      | Votre mot de passe e-mail ou mot de passe spécifique à l'application (requis quand l'authentification est activée).                                                                                                                                                                                                                                             |
| **Nom de l'expéditeur**    | Nom d'affichage affiché comme expéditeur dans les notifications par e-mail (facultatif, par défaut "duplistatus").                                                                                                                                                                                                                                              |
| **Adresse d'expéditeur**   | Adresse e-mail affichée comme expéditeur. Requis pour les connexions SMTP simple ou quand l'authentification est désactivée. Par défaut le nom d'utilisateur SMTP quand l'authentification est activée. Notez que certains fournisseurs d'e-mail remplaceront l'`Adresse d'expéditeur` par le `Nom d'utilisateur du serveur SMTP`. |
| **E-mail du destinataire** | L'adresse e-mail pour recevoir les notifications. Doit être un format d'adresse e-mail valide.                                                                                                                                                                                                                                                                     |

Une icône <IIcon2 icon="lucide:mail" color="green"/> verte à côté d'`E-mail` dans la barre latérale signifie que vos paramètres sont valides. Si l'icône est <IIcon2 icon="lucide:mail" color="yellow"/> jaune, vos paramètres ne sont pas valides ou ne sont pas configurés.

L'icône s'affiche en vert quand tous les champs requis sont définis : Hôte du serveur SMTP, Port du serveur SMTP, E-mail du destinataire, et soit (Nom d'utilisateur SMTP + Mot de passe quand l'authentification est requise) soit (Adresse d'expéditeur quand l'authentification n'est pas requise).

Quand la configuration n'est pas complètement configurée, une boîte d'alerte jaune s'affiche vous informant qu'aucun e-mail ne sera envoyé jusqu'à ce que les paramètres e-mail soient remplis correctement. Les cases à cocher E-mail dans l'onglet [`Notifications de sauvegarde`](backup-notifications-settings.md) seront également grisées et afficheront les étiquettes "(désactivé)".

<br/>

## Actions disponibles {#available-actions}

| Bouton                                                           | Description                                                                                                                                                                                                                                                                                                                                                                            |
| :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <IconButton label="Save Settings" />                             | Enregistrer les modifications apportées aux paramètres NTFY.                                                                                                                                                                                                                                                                                                           |
| <IconButton icon="lucide:mail" label="Send Test Email"/>         | Envoie un message e-mail de test en utilisant la configuration SMTP. L'e-mail de test affiche le nom d'hôte du serveur SMTP, le port, le type de connexion, le statut d'authentification, le nom d'utilisateur (le cas échéant), l'e-mail du destinataire, l'adresse d'expéditeur, le nom de l'expéditeur, et l'horodatage du test. |
| <IconButton icon="lucide:trash-2" label="Delete SMTP Settings"/> | Supprimer / Effacer la configuration SMTP.                                                                                                                                                                                                                                                                                                                             |

<br/>

:::info[IMPORTANT]
Vous devez utiliser le bouton <IconButton icon="lucide:mail" label="Send Test Email"/> pour vous assurer que votre configuration e-mail fonctionne avant de vous y fier pour les notifications.

Même si vous voyez une icône <IIcon2 icon="lucide:mail" color="green"/> verte et que tout semble configuré, les e-mails peuvent ne pas être envoyés.

`duplistatus` vérifie uniquement si vos paramètres SMTP sont remplis, pas si les e-mails peuvent réellement être livrés.
:::

<br/>

## Fournisseurs SMTP courants {#common-smtp-providers}

**Gmail :**

- Hôte : `smtp.gmail.com`
- Port : `587` (STARTTLS) ou `465` (SSL/TLS direct)
- Type de connexion : STARTTLS pour le port 587, SSL/TLS direct pour le port 465
- Nom d'utilisateur : Votre adresse Gmail
- Mot de passe : Utilisez un mot de passe d'application (pas votre mot de passe habituel). Générez-en un sur https://myaccount.google.com/apppasswords
- Authentification : Requise

**Outlook/Hotmail :**

- Hôte : `smtp-mail.outlook.com`
- Port : `587`
- Type de connexion : STARTTLS
- Nom d'utilisateur : Votre adresse e-mail Outlook
- Mot de passe : Votre mot de passe de compte
- Authentification : Requise

**Yahoo Mail :**

- Hôte : `smtp.mail.yahoo.com`
- Port : `587`
- Type de connexion : STARTTLS
- Nom d'utilisateur : Votre adresse e-mail Yahoo
- Mot de passe : Utilisez un mot de passe d'application
- Authentification : Requise

### Meilleures pratiques de sécurité {#security-best-practices}

- Envisagez d'utiliser un compte e-mail dédié pour les notifications
- Testez votre configuration en utilisant le bouton "Envoyer un e-mail de test"
- Les paramètres sont chiffrés et stockés de manière sécurisée dans la base de données
- **Utilisez des connexions chiffrées** - STARTTLS et SSL/TLS direct sont recommandés pour une utilisation en production
- Les connexions SMTP simple (port 25) sont disponibles pour les réseaux locaux de confiance mais ne sont pas recommandées pour une utilisation en production sur des réseaux non fiables

