# Échecs de livraison {/* #delivery-failures */}

Un bouton <IconButton icon="lucide:siren" tone="alert" /> avec une légère teinte rouge apparaît dans la [barre d'outils de l'application](overview.md#application-toolbar) pour les administrateurs quand la livraison par e-mail ou NTFY est en échec. Il reste masqué quand les deux canaux sont opérationnels, et il n'est pas affiché sur la page de connexion. Les utilisateurs standards ne le voient pas.

![Échecs de livraison](../assets/screen-delivery-failures.png)

Cliquez sur le bouton pour afficher une carte par chaîne en échec (E-mail, ntfy), et non une ligne pour chaque entrée d'audit. Chaque carte affiche :

- L'erreur, et une **Erreur d'origine** en police à chasse fixe lorsque la réponse SMTP a été journalisée
- L'hôte SMTP ou le topic NTFY
- L'heure du dernier échec
- Le nombre de distributions ayant échoué depuis le dernier succès, ou depuis que vous avez effacé cette chaîne pour la dernière fois

**Ouvrir les paramètres de messagerie** mène à [Paramètres → E-mail](settings/email-settings.md). **Ouvrir les paramètres NTFY** mène à [Paramètres → NTFY](settings/ntfy-settings.md).

**Fermer** ferme uniquement le panneau. **Effacer** masque les chaînes répertoriées jusqu'à ce qu'un nouvel échec soit journalisé, même si le texte de l'erreur est identique. Une distribution réussie ultérieure maintient le bouton masqué. Cela inclut `email_sent`, `notification_sent` et l'envoi réussi d'un [Résumé quotidien](settings/daily-summary-settings.md) pour cette chaîne.

La liste se charge avec la page et s'actualise environ une fois par minute tant que l'onglet du navigateur est visible.
