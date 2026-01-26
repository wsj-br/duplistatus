# Vue d'ensemble {#overview}

La Page Paramètres offre une interface unifiée pour configurer tous les aspects de **duplistatus**. Vous pouvez y accéder en cliquant sur le bouton <IconButton icon="lucide:settings" /> `Paramètres` dans la [Barre d'outils de l'application](../overview#application-toolbar). Notez que les Utilisateurs réguliers verront un menu simplifié avec moins d'options par rapport aux administrateurs.

## Affichage administrateur {#administrator-view}

Les administrateurs voient tous les Paramètres disponibles.

<table>
  <tbody><tr>
    <td>
      <img src="/assets/screen-settings-left-panel-admin.png" alt="Settings Sidebar - Admin View" />
    </td>
    <td>
      <ul>
        <li><strong>Notifications</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Notifications de sauvegarde</a> : Configurer les Paramètres de notification par sauvegarde</li>
            <li><a href="overdue-settings.md">Surveillance des sauvegardes en retard</a> : Configurer la détection des sauvegardes en retard et les Alertes</li>
            <li><a href="notification-templates.md">Modèles</a> : Personnaliser les Modèles de message de Notifications</li>
          </ul>
        </li><br/>
        <li><strong>Intégrations</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a> : Configurer le service de Notifications push NTFY</li>
            <li><a href="email-settings.md">E-mail</a> : Configurer les Notifications par e-mail SMTP</li>
          </ul>
        </li><br/>
        <li><strong id="system">Système</strong>
          <ul>
            <li><a href="server-settings.md">Serveurs</a> : Gérer les configurations de serveur Duplicati</li>
            <li><a href="display-settings.md">Affichage</a> : Configurer les préférences d'affichage</li>
            <li><a href="database-maintenance.md">Maintenance de la base de données</a> : Effectuer le nettoyage de la base de données (Admin uniquement)</li>
            <li><a href="user-management-settings.md">Utilisateurs</a> : Gérer les comptes Utilisateur (Admin uniquement)</li>
            <li><a href="audit-logs-viewer.md">Journal d'Audit</a> : Afficher les Journaux d'audit du Système</li>
            <li><a href="audit-logs-retention.md">Rétention du journal d'audit</a> : Configurer la Rétention des Journaux du journal d'audit (Admin uniquement)</li>
            <li><a href="application-logs-settings.md">Journaux d'application</a> : Afficher et Exporter les Journaux d'application (Admin uniquement)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</tbody></table>

## Affichage non-administrateur {#non-administrator-view}

Les Utilisateurs réguliers voient un ensemble limité de Paramètres.

<table>
  <tbody><tr>
    <td>
      <img src="/assets/screen-settings-left-panel-non-admin.png" alt="Settings Sidebar - Non-Admin View" />
    </td>
    <td>
      <ul>
        <li><strong>Notifications</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Notifications de sauvegarde</a> : Afficher les Paramètres de notification par sauvegarde (lecture seule)</li>
            <li><a href="overdue-settings.md">Surveillance des sauvegardes en retard</a> : Afficher les Paramètres de sauvegarde en retard (lecture seule)</li>
            <li><a href="notification-templates.md">Modèles</a> : Afficher les Modèles de notification (lecture seule)</li>
          </ul>
        </li><br/>
        <li><strong>Intégrations</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a> : Afficher les Paramètres NTFY (lecture seule)</li>
            <li><a href="email-settings.md">E-mail</a> : Afficher les Paramètres e-mail (lecture seule)</li>
          </ul>
        </li><br/>
        <li><strong id="system">Système</strong>
          <ul>
            <li><a href="server-settings.md">Serveurs</a> : Afficher les configurations de serveur (lecture seule)</li>
            <li><a href="display-settings.md">Affichage</a> : Configurer les préférences d'affichage</li>
            <li><a href="audit-logs-viewer.md">Journal d'Audit</a> : Afficher les Journaux d'audit du Système (lecture seule)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</tbody></table>

## Icônes de Statut {#status-icons}

La barre latérale affiche les icônes de Statut à côté des paramètres d'intégration **NTFY** et **E-mail** :

- <IIcon2 icon="lucide:message-square" color="green"/> <IIcon2 icon="lucide:mail" color="green"/> **Icône verte** : Vos Paramètres sont valides et configurés correctement
- <IIcon2 icon="lucide:message-square" color="yellow"/> <IIcon2 icon="lucide:mail" color="yellow"/> **Icône jaune** : Vos Paramètres ne sont pas valides ou ne sont pas configurés

Quand la configuration n'est pas valide, les cases à cocher correspondantes dans l'onglet [`Notifications de sauvegarde`](backup-notifications-settings.md) seront grisées et Désactivé. Pour plus de Détails, consultez les Pages [Paramètres NTFY](ntfy-settings.md) et [Paramètres e-mail](email-settings.md).

<br/>

:::important
Une icône verte ne signifie pas nécessairement que les Notifications fonctionnent correctement. Utilisez toujours les fonctionnalités de Tester disponibles pour Confirmer que vos Notifications fonctionnent avant de vous y fier.
:::

<br/>

