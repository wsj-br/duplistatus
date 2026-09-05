# Versions de Duplicati {#duplicati-versions}

Cette page affiche les dernières versions de Duplicati stockées dans le cache **duplistatus** et permet aux administrateurs de configurer la fréquence de mise à jour de ces versions depuis GitHub.

![Versions de Duplicati](../../assets/screen-settings-duplicati-versions.png)

Le cache est utilisé par le [tableau de bord](../dashboard.md#duplicati-server-version) et la [page Serveurs](server-settings.md) pour colorer chaque version de serveur et indiquer si elle est à jour ou obsolète.

## Dernières versions de la chaîne {#latest-channel-versions}

Le tableau liste la dernière version en cache pour chaque chaîne Duplicati :

| Chaîne        | Description                                      |
|:---------------|:-------------------------------------------------|
| **Stable**     | Dernière version stable                            |
| **Bêta**       | Dernière version bêta                              |
| **Expérimental** | Dernière version expérimentale                    |
| **Canary**     | Dernière version canary                            |

La dernière heure de mise à jour réussie de GitHub est affichée au-dessus du tableau. Si une chaîne n'a pas encore été trouvée, ou si le cache n'a jamais été mis à jour, la page indique que la version est indisponible.

Les administrateurs peuvent cliquer sur **Mettre à jour maintenant** pour récupérer les dernières versions immédiatement. Cela ne nécessite pas que le service cron soit en cours d'exécution. Si GitHub ne peut pas être atteint, **duplistatus** conserve le cache précédent.

## Planification de la vérification des versions {#version-check-schedule}

**Afficher la version sur le tableau de bord** active ou désactive le badge de version dans la vue en carte du [tableau de bord](../dashboard.md#duplicati-server-version). Le tableau du tableau de bord affiche toujours la colonne **Version**. Il est activé par défaut et est également disponible dans les [Paramètres d'affichage](display-settings.md). Il s'agit d'une préférence d'affichage par utilisateur.

Les administrateurs peuvent choisir la fréquence à laquelle **duplistatus** vérifie GitHub pour de nouvelles versions de Duplicati :

| Intervalle           | Exécutions                                                         |
|:-------------------|:-------------------------------------------------------------|
| **Une fois par jour**     | Une fois à l'heure de début configurée                            |
| **Toutes les 12 heures** | À l'heure de début et 12 heures plus tard                         |
| **Toutes les 6 heures**  | À l'heure de début et toutes les 6 heures après cela               |

L'heure de début est sélectionnée et affichée dans le fuseau horaire de votre navigateur. **duplistatus** stocke cette heure en UTC et le service cron exécute la vérification en UTC.

Exemples :

- Tous les jours avec une heure de début à 06:00 s'exécute à 06:00.
- Toutes les 12 heures avec une heure de début à 08:00 s'exécute à 08:00 et 20:00.
- Toutes les 6 heures avec une heure de début à 02:00 s'exécute à 02:00, 08:00, 14:00, et 20:00.

Au démarrage, **duplistatus** actualise également le cache s'il est plus ancien que l'intervalle sélectionné (24 heures, 12 heures ou 6 heures). Les actualisations échouées conservent les dernières versions en cache.

Les utilisateurs réguliers peuvent consulter les versions en cache et le planning, et peuvent activer ou désactiver **Afficher la version sur le tableau de bord**. Seuls les administrateurs peuvent modifier l'intervalle, l'heure de début ou forcer une mise à jour.

:::note
Changer le planning écrit une entrée `duplicati_version_check_updated` dans le [journal d'audit](audit-logs-viewer.md). Les mises à jour GitHub réussies et échouées sont enregistrées comme `duplicati_version_refresh` avec un déclencheur de `startup`, `cron`, ou `manual`.
:::
