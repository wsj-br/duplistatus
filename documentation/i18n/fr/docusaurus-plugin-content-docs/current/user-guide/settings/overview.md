# Aperçu {/* #overview */}

La page Paramètres offre une interface unifiée pour configurer tous les aspects de **duplistatus**. Vous pouvez y accéder en cliquant sur le bouton <IconButton icon="lucide:settings" /> **Paramètres** dans la [barre d'outils de l'application](../overview.md#application-toolbar). Notez que les utilisateurs réguliers verront un menu simplifié avec moins d'options par rapport aux administrateurs.

## Vue Administrateur {/* #administrator-view */}

Les administrateurs voient tous les paramètres disponibles.

<table>
  <tr>
    <td>
      ![Barre latérale des paramètres - Vue administrateur](../../assets/screen-settings-left-panel-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Notifications</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Notifications de sauvegarde</a> : Configurer les paramètres de notification par sauvegarde</li>
            <li><a href="backup-monitoring-settings.md">Surveillance des sauvegardes</a> : Configurer la détection des sauvegardes en retard et les alertes</li>
            <li><a href="daily-summary-settings.md">Résumé quotidien</a> : Snapshot quotidien facultatif qui remplace les e-mails pour le destinataire par défaut (les destinations supplémentaires continuent)</li>
            <li><a href="notification-templates.md">Modèles</a> : Personnaliser les modèles de messages de notification</li>
          </ul>
        </li><br/>
        <li>
          <strong>Intégrations</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a> : Configurer le service de notification push NTFY</li>
            <li><a href="email-settings.md">E-mail</a> : Configurer les notifications par e-mail SMTP</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">Système</strong>
          <ul>
            <li><a href="server-settings.md">Serveurs</a> : Gérer les configurations des serveurs Duplicati</li>
            <li><a href="display-settings.md">Paramètres d'affichage</a> : Configurer le thème, la plage de temps du graphique, le style de graphique, les paramètres régionaux, l'intervalle d'actualisation automatique, l'ordre de tri des cartes et le début de la semaine</li>
            <li><a href="duplicati-versions.md">Versions de Duplicati</a> : Afficher les versions de sortie de Duplicati en cache et configurer l'horaire de vérification des versions</li>
            <li><a href="database-maintenance.md">Maintenance de la base de données</a> : Effectuer le nettoyage de la base de données (réservé aux administrateurs)</li>
            <li><a href="api-keys-settings.md">Clés API</a> : Gérer les clés étendues et la protection des API externes (réservé aux administrateurs)</li>
            <li><a href="ip-allowlist-settings.md">Liste d'adresses IP autorisées</a> : Restreindre l'interface d'administration et les API externes (réservé aux administrateurs)</li>
            <li><a href="user-management-settings.md">Utilisateurs</a> : Gérer les comptes utilisateur (réservé aux administrateurs)</li>
            <li><a href="audit-logs-viewer.md">Journal d'audit</a> : Afficher les journaux d'audit du système</li>
            <li><a href="audit-logs-retention.md">Conservation des journaux d'audit</a> : Configurer la conservation des journaux d'audit (réservé aux administrateurs)</li>
            <li><a href="application-logs-settings.md">Journaux de l'application</a> : Afficher et exporter les journaux de l'application (réservé aux administrateurs)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Vue Non-Administrateur {/* #non-administrator-view */}

Les utilisateurs réguliers voient un ensemble limité de paramètres.

<table>
  <tr>
    <td>
      ![Barre latérale Paramètres - Vue non administrateur](../../assets/screen-settings-left-panel-non-admin.png)
    </td>
    <td>
      <ul>
        <li>
          <strong>Notifications</strong>
          <ul>
            <li><a href="backup-notifications-settings.md">Notifications de sauvegarde</a>: Afficher les paramètres de notification par sauvegarde (en lecture seule)</li>
            <li><a href="backup-monitoring-settings.md">Surveillance des sauvegardes</a>: Afficher les paramètres de sauvegarde en retard (en lecture seule)</li>
            <li><a href="daily-summary-settings.md">Résumé quotidien</a>: Afficher les paramètres de résumé quotidien (en lecture seule)</li>
            <li><a href="notification-templates.md">Modèles</a>: Afficher les modèles de notification (en lecture seule)</li>
          </ul>
        </li><br/>
        <li>
          <strong>Intégrations</strong>
          <ul>
            <li><a href="ntfy-settings.md">NTFY</a>: Afficher les paramètres NTFY (en lecture seule)</li>
            <li><a href="email-settings.md">E-mail</a>: Afficher les paramètres de messagerie (en lecture seule)</li>
          </ul>
        </li><br/>
        <li>
          <strong id="system">Système</strong>
          <ul>
            <li><a href="server-settings.md">Serveurs</a>: Afficher les configurations de serveur (en lecture seule)</li>
            <li><a href="display-settings.md">Affichage</a>: Configurer le thème, la plage de temps du graphique, le style de graphique, les paramètres régionaux, l'intervalle d'actualisation automatique, l'ordre de tri des cartes et le début de la semaine</li>
            <li><a href="duplicati-versions.md">Versions de Duplicati</a>: Afficher les versions de Duplicati en cache (les modifications de planification sont réservées aux administrateurs)</li>
            <li><a href="audit-logs-viewer.md">Journal d'audit</a>: Afficher les journaux d'audit du système (en lecture seule)</li>
          </ul>
        </li>
      </ul>
    </td>
  </tr>
</table>

## Icônes d'état {/* #status-icons */}

La barre latérale affiche des icônes d'état à côté des paramètres d'intégration **NTFY** et **E-mail**:
- <IIcon2 icon="lucide:message-square" color="green"/> <IIcon2 icon="lucide:mail" color="green"/> **Icône verte**: Vos paramètres sont valides et correctement configurés
- <IIcon2 icon="lucide:message-square" color="yellow"/> <IIcon2 icon="lucide:mail" color="yellow"/> **Icône jaune**: Vos paramètres ne sont pas valides ou ne sont pas configurés

Lorsque la configuration est invalide, les cases à cocher correspondantes dans l'onglet [Notifications de sauvegarde](backup-notifications-settings.md) seront grisées et désactivées. Pour plus de détails, consultez les pages [Paramètres NTFY](ntfy-settings.md) et [Paramètres de messagerie](email-settings.md).

<br/>

:::important
Une icône verte ne signifie pas nécessairement que les notifications fonctionnent correctement. Utilisez toujours les fonctionnalités de test disponibles pour confirmer que vos notifications fonctionnent avant de vous y fier. 
:::

<br/>
