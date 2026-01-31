---
translation_last_updated: '2026-01-31T00:51:20.002Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: 67bb94741185f3d9
translation_language: fr
source_file_path: installation/configure-tz-lang.md
---
# Fuseau horaire et Paramètres régionaux {#timezone-and-locale}

L'interface utilisateur de l'application affichera la date et l'heure selon les paramètres du navigateur. Cependant, à des fins de journalisation et de notification, l'application utilisera la valeur définie dans les variables d'environnement `TZ` et `LANG` pour utiliser les fuseaux horaires corrects et pour formater les valeurs numériques, de date et d'heure.

Les valeurs par défaut sont `TZ=Europe/London` et `LANG=en_GB` si ces variables d'environnement ne sont pas définies.

## Configuration du fuseau horaire {#configuring-the-timezone}

L'interface utilisateur de l'application affichera la date et l'heure en fonction des paramètres du navigateur. Cependant, à des fins de journalisation et de notification, l'application utilisera la valeur définie dans la variable d'environnement `TZ` pour formater les fuseaux horaires.

La valeur par défaut est `TZ=Europe/London` si cette variable d'environnement n'est pas définie.

Par exemple, pour modifier le fuseau horaire en São Paulo, ajoutez ces lignes au fichier `compose.yml` dans le répertoire `duplistatus` :

```yaml
environment:
  - TZ=America/Sao_Paulo
```

ou transmettez la variable d'environnement en ligne de commande :

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

## Configuration des paramètres régionaux {#configuring-the-locale}

L'interface utilisateur de l'application affichera les dates et les nombres selon les paramètres du navigateur. Cependant, à des fins de journalisation et de notification, l'application utilisera la valeur définie dans la variable d'environnement `LANG` pour formater les dates et les nombres.

La valeur par défaut est `LANG=en_GB` si cette variable d'environnement n'est pas définie.

Par exemple, pour changer la locale en portugais brésilien, ajoutez ces lignes au fichier `compose.yml` dans le répertoire `duplistatus` :

```yaml
environment:
  - LANG=pt_BR
```

ou transmettez la variable d'environnement en ligne de commande :

```bash
  --env LANG=pt_BR
```

### Utilisation de votre configuration Linux {#using-your-linux-configuration}

Pour obtenir la configuration de votre hôte Linux, vous pouvez exécuter :

```bash
echo ${LANG%.*}
```

### Liste des paramètres régionaux {#list-of-locales}

Vous pouvez trouver une liste de paramètres régionaux ici : [LocalePlanet: International Components for Unicode (ICU) Data](https://www.localeplanet.com/icu/)
