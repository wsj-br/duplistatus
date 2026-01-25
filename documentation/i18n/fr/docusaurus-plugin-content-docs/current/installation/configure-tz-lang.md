# Fuseau horaire et paramètres régionaux

La date et l'heure de l'interface utilisateur de l'application seront affichées selon les paramètres du navigateur. Cependant, à des fins de journalisation et de notification, l'application utilisera les valeurs définies dans les variables d'environnement `TZ` et `LANG` pour utiliser les fuseaux horaires corrects et pour formater les valeurs numériques, de date et d'heure.

Les valeurs par défaut sont `TZ=Europe/London` et `LANG=en_GB` si ces variables d'environnement ne sont pas définies.

## Configuration du fuseau horaire

La date et l'heure de l'interface utilisateur de l'application seront affichées selon les paramètres du navigateur. Cependant, à des fins de journalisation et de notification, l'application utilisera la valeur définie dans la variable d'environnement `TZ` pour formater les fuseaux horaires.

La valeur par défaut est `TZ=Europe/London` si cette variable d'environnement n'est pas définie.

Par exemple, pour changer le fuseau horaire vers São Paulo, ajoutez ces lignes au fichier `compose.yml` dans le répertoire `duplistatus` :

```yaml
environment:
  - TZ=America/Sao_Paulo
```

ou passez la variable d'environnement dans la ligne de commande :

```bash
  --env TZ=America/Sao_Paulo
```

### Utilisation de votre configuration Linux

Pour obtenir la configuration de votre hôte Linux, vous pouvez exécuter :

```bash
echo TZ=\"$(</etc/timezone)\"
```

### Liste des fuseaux horaires

Vous pouvez trouver une liste de fuseaux horaires ici : [Wikipedia: List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)

## Configuration des paramètres régionaux

Les dates et les nombres de l'interface utilisateur de l'application seront affichés selon les paramètres du navigateur. Cependant, à des fins de journalisation et de notification, l'application utilisera la valeur définie dans la variable d'environnement `LANG` pour formater les dates et les nombres.

La valeur par défaut est `LANG=en_GB` si cette variable d'environnement n'est pas définie.

Par exemple, pour changer les paramètres régionaux vers le portugais brésilien, ajoutez ces lignes au fichier `compose.yml` dans le répertoire `duplistatus` :

```yaml
environment:
  - LANG=pt_BR
```

ou passez la variable d'environnement dans la ligne de commande :

```bash
  --env LANG=pt_BR
```

### Utilisation de votre configuration Linux

Pour obtenir la configuration de votre hôte Linux, vous pouvez exécuter :

```bash
echo ${LANG%.*}
```

### Liste des paramètres régionaux

Vous pouvez trouver une liste de paramètres régionaux ici : [LocalePlanet: International Components for Unicode (ICU) Data](https://www.localeplanet.com/icu/)

