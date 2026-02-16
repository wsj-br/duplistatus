---
translation_last_updated: '2026-02-16T00:13:28.162Z'
source_file_mtime: '2026-02-15T19:17:43.632Z'
source_file_hash: 2ddcfddd1763c2b6
translation_language: fr
source_file_path: installation/configure-tz.md
---
# Fuseau horaire {#timezone}

L'interface utilisateur de l'application affichera la date et l'heure selon les paramètres du navigateur. Cependant, à des fins de journalisation et de notification, l'application utilisera la valeur définie dans la variable d'environnement `TZ` pour formater les fuseaux horaires.

La valeur par défaut est `TZ=Europe/London` si cette variable d'environnement n'est pas définie.

:::note
Les paramètres de langue et de locale (formats des nombres et des dates) pour les Notifications peuvent être configurés dans [Paramètres → Modèles](../user-guide/settings/notification-templates.md).
:::

## Configuration du fuseau horaire {#configuring-the-timezone}

L'interface utilisateur de l'application affichera la date et l'heure selon les paramètres du navigateur. Cependant, à des fins de journalisation et de notification, l'application utilisera la valeur définie dans la variable d'environnement `TZ` pour formater les fuseaux horaires.

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
