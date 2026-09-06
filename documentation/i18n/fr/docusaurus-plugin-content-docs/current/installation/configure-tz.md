# Fuseau horaire {#timezone}

L'interface utilisateur de l'application affiche la date et l'heure selon les paramètres du navigateur. Les journaux utilisent toujours la variable d'environnement `TZ`. Les notifications de Résumé quotidien utilisent le fuseau horaire IANA enregistré dans [Paramètres → Résumé quotidien](../user-guide/settings/daily-summary-settings.md), pas `TZ`. Les autres horodatages de notification qui ne sont pas des Résumés quotidiens suivent toujours `TZ`.

La valeur par défaut est `TZ=Europe/London` si cette variable d'environnement n'est pas définie.

:::note
Les paramètres de langue et de locale (formats des nombres et des dates) pour les Notifications peuvent être configurés dans [Paramètres → Modèles](../user-guide/settings/notification-templates.md).
:::

## Configuration du fuseau horaire {#configuring-the-timezone}

L'interface utilisateur de l'application affiche la date et l'heure selon les paramètres du navigateur. Les journaux utilisent toujours la variable d'environnement `TZ`. Les notifications de Résumé quotidien utilisent le fuseau horaire IANA enregistré dans [Paramètres → Résumé quotidien](../user-guide/settings/daily-summary-settings.md), pas `TZ`. Les autres horodatages de notification qui ne sont pas des Résumés quotidiens suivent toujours `TZ`.

La valeur par défaut est `TZ=Europe/London` si cette variable d'environnement n'est pas définie.

Par exemple, pour changer le fuseau horaire en São Paulo, ajoutez ces lignes au fichier `compose.yml` dans le répertoire `duplistatus` :

```yaml
environment:
  - TZ=America/Sao_Paulo
```

ou transmettez la variable d'environnement en ligne de commande (Docker ou Podman) :

```bash
  --env TZ=America/Sao_Paulo
```

### Utilisation de votre configuration Linux {#using-your-linux-configuration}

Pour obtenir la configuration de votre hôte Linux, vous pouvez exécuter :

```bash
echo TZ=\"$(</etc/timezone)\"
```

### Liste des fuseaux horaires {#list-of-timezones}

Vous pouvez trouver une liste des fuseaux horaires ici : [Wikipedia: List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)
