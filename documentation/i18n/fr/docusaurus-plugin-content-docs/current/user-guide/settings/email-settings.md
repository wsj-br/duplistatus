---
translation_last_updated: '2026-04-18T00:03:47.948Z'
source_file_mtime: '2026-03-05T22:33:28.423Z'
source_file_hash: b978c78a610418d49df860a0680c231bce4f9a5f2690a3736ca40ae39b5ace0d
translation_language: fr
source_file_path: documentation/docs/user-guide/settings/email-settings.md
translation_models:
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# E-mail {#email}

**duplistatus** prend en charge l'envoi de notifications par e-mail via SMTP comme alternative ou complément aux notifications NTFY. La configuration e-mail est maintenant gérée via l'interface web avec un stockage chiffré dans la base de données pour une sécurité renforcée.

![Email Configuration](../../assets/screen-settings-email.png)

| Paramètre | Description |
|:------------------------|:-----------------------------------------------------------------|
| **Serveur SMTP hôte** | Serveur SMTP de votre fournisseur de messagerie (par exemple, `smtp.gmail.com`). |
| **Port du serveur SMTP** | Numéro de port (généralement `25` pour SMTP standard, `587` pour STARTTLS ou `465` pour SSL/TLS direct). |
| **Type de connexion** | Sélectionnez entre SMTP standard, STARTTLS ou SSL/TLS direct. Par défaut, SSL/TLS direct est utilisé pour les nouvelles configurations. |
| **Authentification SMTP** | Activez ou désactivez l'authentification SMTP. Lorsqu'elle est désactivée, les champs de nom d'utilisateur et de mot de passe ne sont pas requis. |
| **Nom d'utilisateur SMTP** | Votre adresse e-mail ou nom d'utilisateur (requis si l'authentification est activée). |
| **Mot de passe SMTP** | Votre mot de passe e-mail ou mot de passe spécifique à l'application (requis si l'authentification est activée). |
| **Nom de l'expéditeur** | Nom affiché comme expéditeur dans les notifications par courriel (facultatif, valeur par défaut : "duplistatus"). |
| **Adresse d'expédition** | Adresse e-mail affichée comme expéditeur. Requise pour les connexions SMTP standard ou lorsque l'authentification est désactivée. Par défaut, utilise le nom d'utilisateur SMTP lorsque l'authentification est activée. Notez que certains fournisseurs de messagerie remplaceront le `From Address` par le `SMTP Server Username`. |
| **Courriel du destinataire** | Adresse e-mail qui recevra les notifications. Doit être au format d'adresse e-mail valide. |

Une icône <IIcon2 icon="lucide:mail" color="green"/> verte à côté d'**E-mail** dans la barre latérale signifie que vos paramètres sont valides. Si l'icône est <IIcon2 icon="lucide:mail" color="yellow"/> jaune, vos paramètres ne sont pas valides ou ne sont pas configurés.

L'icône s'affiche en vert quand tous les champs requis sont définis : SMTP Server Host, Port du serveur SMTP, E-mail du destinataire, et soit (Nom d'utilisateur SMTP + Mot de passe quand l'authentification est requise) soit (Adresse d'expéditeur quand l'authentification n'est pas requise).

Lorsque la configuration n'est pas entièrement configurée, une boîte d'alerte jaune s'affiche vous informant qu'aucun e-mail ne sera envoyé tant que les paramètres e-mail ne seront pas remplis correctement. Les cases à cocher E-mail dans l'onglet [Notifications de sauvegarde](backup-notifications-settings.md) seront également grisées et afficheront des étiquettes « (Désactivé) ».

<br/>

## Actions disponibles {#available-actions}

| Bouton                                                           | Description                                              |
|:-----------------------------------------------------------------|:---------------------------------------------------------|
| <IconButton label="Enregistrer les paramètres" />                             | Enregistrer les modifications apportées aux paramètres NTFY.              |
| <IconButton icon="lucide:mail" label="Envoyer un e-mail de test"/>         | Envoie un message e-mail de test en utilisant la configuration SMTP. L'e-mail de test affiche le nom d'hôte du serveur SMTP, le port, le type de connexion, le statut d'authentification, le nom d'utilisateur (le cas échéant), l'e-mail du destinataire, l'adresse d'expéditeur, le nom de l'expéditeur et l'horodatage du test. |
| <IconButton icon="lucide:trash-2" label="Supprimer les paramètres SMTP"/> | Supprimer / Effacer la configuration SMTP.                   |

<br/>

:::info[IMPORTANT]
  Vous devez utiliser le bouton <IconButton icon="lucide:mail" label="Envoyer un e-mail de test"/> pour vous assurer que votre configuration e-mail fonctionne avant de vous y fier pour les notifications.

 Même si vous voyez une icône verte <IIcon2 icon="lucide:mail" color="green"/> et que tout semble configuré, les e-mails peuvent ne pas être envoyés.
 
 **duplistatus** vérifie uniquement si vos paramètres SMTP sont remplis, pas si les e-mails peuvent réellement être livrés.
:::

<br/>

## Fournisseurs SMTP courants {#common-smtp-providers}

**Gmail :**

- Hôte : `smtp.gmail.com`
- Port : `587` (STARTTLS) ou `465` (SSL/TLS direct)
- Type de connexion : STARTTLS pour le port 587, SSL/TLS direct pour le port 465
- Nom d'utilisateur : Votre adresse Gmail
- Mot de passe : Utilisez un mot de passe d'application (pas votre mot de passe habituel). Générez-en un sur https://myaccount.google.com/apppasswords
- Authentification : Requis

**Outlook/Hotmail :**

- Hôte : `smtp-mail.outlook.com`
- Port : `587`
- Type de connexion : STARTTLS
- Nom d'utilisateur : Votre adresse e-mail Outlook
- Mot de passe : Votre mot de passe de compte
- Authentification : Requis

**Yahoo Mail :**

- Hôte : `smtp.mail.yahoo.com`
- Port : `587`
- Type de connexion : STARTTLS
- Nom d'utilisateur : Votre adresse e-mail Yahoo
- Mot de passe : Utiliser un mot de passe d'application
- Authentification : Requis

### Meilleures pratiques de sécurité {#security-best-practices}

- Envisagez d'utiliser un compte e-mail dédié pour les notifications
 - Testez votre configuration en utilisant le bouton « Envoyer un e-mail de test »
 - Les paramètres sont chiffrés et stockés de manière sécurisée dans la base de données
 - **Utilisez des connexions chiffrées** - STARTTLS et SSL/TLS direct sont recommandés pour une utilisation en production
 - Les connexions SMTP simple (port 25) sont disponibles pour les réseaux locaux de confiance, mais ne sont pas recommandées pour une utilisation en production sur des réseaux non fiables
