# Versions de Duplicati {/* #duplicati-versions */}

Cette page affiche les dernières versions de Duplicati stockées dans le cache **duplistatus** et permet aux administrateurs de configurer la fréquence de rafraîchissement de ces versions depuis GitHub.

![Versions de Duplicati](../../assets/screen-settings-duplicati-versions.png)

Le cache est utilisé par la [page d'accueil](../dashboard.md#duplicati-server-version) et la page [Serveurs](server-settings.md) pour colorer chaque version de serveur et indiquer si elle est actuelle ou obsolète.

## Dernières versions de la chaîne {/* #latest-channel-versions */}

Le tableau répertorie la dernière version mise en cache pour chaque chaîne Duplicati :

| Chaîne         | Description                                      |
|:---------------|:-------------------------------------------------|
| **Stable**     | Dernière version stable publiée                  |
| **Bêta**       | Dernière version bêta publiée                    |
| **Expérimental** | Dernière version expérimentale publiée          |
| **Canary**     | Dernière version canary publiée                  |

L'heure de la dernière mise à jour réussie depuis GitHub est affichée au-dessus du tableau. Si une chaîne n'a pas encore été trouvée, ou si le cache n'a jamais été mis à jour, la page indique que la version est indisponible.

Les administrateurs peuvent cliquer sur **Mettre à jour maintenant** pour récupérer immédiatement les dernières versions. Cela ne nécessite pas que le service cron soit en cours d'exécution. Si GitHub est inaccessible, **duplistatus** conserve le cache précédent.

## Programmation de la vérification des versions {/* #version-check-schedule */}

**Afficher la version sur le tableau de bord** active ou désactive l'indicateur de version dans la vue carte du [tableau de bord](../dashboard.md#duplicati-server-version). Le tableau du tableau de bord affiche toujours la colonne **Version**. Cette option est activée par défaut et est également disponible dans les [Paramètres d'affichage](display-settings.md). Il s'agit d'une préférence d'affichage par utilisateur.

Les administrateurs peuvent choisir la fréquence à laquelle **duplistatus** vérifie les nouvelles versions de Duplicati sur GitHub :

| Intervalle         | Exécutions                                                     |
|:-------------------|:-------------------------------------------------------------|
| **Une fois par jour** | Une fois à l'heure de début configurée                      |
| **Toutes les 12 heures** | À l'heure de début et 12 heures plus tard                   |
| **Toutes les 6 heures**  | À l'heure de début et toutes les 6 heures après cela        |

L'heure de début est choisie selon le fuseau horaire de votre navigateur en utilisant le même contrôle horaire compact que pour le Résumé quotidien. Sélectionnez n'importe quelle heure `HH:mm`. **duplistatus** stocke cette valeur en UTC et le service cron exécute la vérification en UTC.

Exemples :

- Quotidien avec une heure de début à 06:00 s'exécute à 06:00.
- Quotidien avec une heure de début à 06:30 s'exécute à 06:30.
- Toutes les 12 heures avec une heure de début à 08:15 s'exécute à 08:15 et 20:15.
- Toutes les 6 heures avec une heure de début à 02:45 s'exécute à 02:45, 08:45, 14:45 et 20:45.

Au démarrage, **duplistatus** rafraîchit également le cache s'il est plus ancien que l'intervalle sélectionné (24 heures, 12 heures ou 6 heures), y compris sur une nouvelle base de données vide. Les échecs transitoires de GitHub tels que HTTP 504 sont réessayés. Les actualisations ayant échoué conservent les dernières versions mises en cache.

Les utilisateurs réguliers peuvent consulter les versions mises en cache et le planning, et peuvent activer ou désactiver **Afficher la version sur le tableau de bord**. Seuls les administrateurs peuvent modifier l'intervalle, l'heure de début ou forcer une mise à jour.

:::note
La modification du planning écrit une entrée `duplicati_version_check_updated` dans le [journal d'audit](audit-logs-viewer.md). Les mises à jour GitHub réussies et échouées sont enregistrées en tant que `duplicati_version_refresh` avec un déclencheur de `startup`, `cron` ou `manual`.
:::
