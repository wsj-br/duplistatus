# Fuseau horaire {/* #timezone */}

L'interface utilisateur de l'application affichera la date et l'heure selon les paramètres du navigateur. La journalisation utilise toujours la variable d'environnement `TZ`. Les notifications du Résumé quotidien utilisent le fuseau horaire IANA enregistré dans [Paramètres → Résumé quotidien](../user-guide/settings/daily-summary-settings.md), et non `TZ`. Les autres horodatages de notifications qui ne sont pas du Résumé quotidien suivent toujours `TZ`.

La valeur par défaut est `TZ=Europe/London` si cette variable d'environnement n'est pas définie.

:::note
Les paramètres de langue et de locale (formats de nombre et de date) pour les notifications peuvent être configurés dans [Paramètres → Modèles](../user-guide/settings/notification-templates.md).
:::

## Configuration du fuseau horaire {/* #configuring-the-timezone */}

L'interface utilisateur de l'application affichera la date et l'heure selon les paramètres du navigateur. La journalisation utilise toujours la variable d'environnement `TZ`. Les notifications du Résumé quotidien utilisent le fuseau horaire IANA enregistré dans [Paramètres → Résumé quotidien](../user-guide/settings/daily-summary-settings.md), et non `TZ`. Les autres horodatages de notifications qui ne sont pas du Résumé quotidien suivent toujours `TZ`.

La valeur par défaut est `TZ=Europe/London` si cette variable d'environnement n'est pas définie.

Par exemple, pour changer le fuseau horaire en São Paulo, ajoutez ces lignes au `compose.yml` dans le répertoire `duplistatus` :

```yaml
environment:
  - TZ=America/Sao_Paulo
```

ou transmettez la variable d'environnement en ligne de commande (Docker ou Podman) :

```bash
  --env TZ=America/Sao_Paulo
```

### Utilisation de votre configuration Linux {/* #using-your-linux-configuration */}

Pour obtenir la configuration de votre hôte Linux, vous pouvez exécuter :

```bash
echo TZ=\"$(</etc/timezone)\"
```

### Liste des fuseaux horaires {/* #list-of-timezones */}

Vous pouvez trouver une liste des fuseaux horaires ici : [Wikipédia : Liste des fuseaux horaires de la base de données tz](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)
