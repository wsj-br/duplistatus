# Fuseau horaire et Locale {#timezone-and-locale}

La date et l'heure de l'interface utilisateur de l'application s'afficheront selon les paramètres du navigateur. Cependant, à des fins de journalisation et de notifications, l'application utilisera la valeur définie dans les variables d'environnement `TZ` et `LANG` pour utiliser les fuseaux horaires corrects et pour formater les valeurs de nombre, de date et d'heure.

Les valeurs par défaut sont `TZ=Europe/London` et `LANG=en_GB` si ces variables d'environnement ne sont pas définies.

## Configuration du Fuseau horaire {#configuring-the-timezone}

La date et l'heure de l'interface utilisateur de l'application s'afficheront selon les paramètres du navigateur. Cependant, à des fins de journalisation et de notifications, l'application utilisera la valeur définie dans la variable d'environnement `TZ` pour formater les fuseaux horaires.

La valeur par défaut est `TZ=Europe/London` si cette variable d'environnement n'est pas définie.

Par exemple, pour modifier le fuseau horaire en São Paulo, ajoutez ces lignes au `compose.yml` dans le répertoire `duplistatus` :

```yaml
environment:
  - TZ=America/Sao_Paulo
```

ou passez la variable d'environnement en ligne de commande :

```bash
  --env TZ=America/Sao_Paulo
```

### Utilisation de votre Configuration Linux {#using-your-linux-configuration}

Pour obtenir la configuration de votre hôte Linux, vous pouvez exécuter :

```bash
echo TZ=\"$(</etc/timezone)\"
```

### Liste des Fuseaux horaires {#list-of-timezones}

Vous pouvez trouver une liste des fuseaux horaires ici : [Wikipedia: List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)

## Configuration de la Locale {#configuring-the-locale}

Les dates et les nombres de l'interface utilisateur de l'application s'afficheront selon les paramètres du navigateur. Cependant, à des fins de journalisation et de notifications, l'application utilisera la valeur définie dans la variable d'environnement `LANG` pour formater les dates et les nombres.

La valeur par défaut est `LANG=en_GB` si cette variable d'environnement n'est pas définie.

Par exemple, pour modifier la locale en portugais brésilien, ajoutez ces lignes au `compose.yml` dans le répertoire `duplistatus` :

```yaml
environment:
  - LANG=pt_BR
```

ou passez la variable d'environnement en ligne de commande :

```bash
  --env LANG=pt_BR
```

### Utilisation de votre Configuration Linux {#using-your-linux-configuration}

Pour obtenir la configuration de votre hôte Linux, vous pouvez exécuter :

```bash
echo ${LANG%.*}
```

### Liste des Locales {#list-of-locales}

Vous pouvez trouver une liste des locales ici : [LocalePlanet: International Components for Unicode (ICU) Data](https://www.localeplanet.com/icu/)

