---
translation_last_updated: '2026-02-05T00:20:49.395Z'
source_file_mtime: '2026-02-04T21:12:31.724Z'
source_file_hash: f568b098bf1d9861
translation_language: fr
source_file_path: development/translation-workflow.md
---
# Flux de travail de maintenance de traduction

Pour les commandes de documentation générale (build, deploy, screenshots, génération README), voir [Documentation Tools](documentation-tools.md).

## Vue d'ensemble

La documentation utilise Docusaurus i18n avec l'anglais comme locale par défaut. La documentation source se trouve dans `docs/` ; les traductions sont écrites dans `i18n/{locale}/docusaurus-plugin-content-docs/current/`. Locales supportées : en (par défaut), fr, de, es, pt-BR.

## Quand la documentation anglaise change

1. **Mettre à jour les fichiers source** dans `docs/`
2. **Exécuter l'extraction** (si les chaînes de l'interface utilisateur Docusaurus ont changé) : `pnpm write-translations`
3. **Mettre à jour le glossaire** (si les traductions intlayer ont changé) : `./scripts/generate-glossary.sh` (exécuter depuis `documentation/`)
4. **Exécuter la traduction IA** : `pnpm run translate` (traduit les documents et les SVG ; utilisez `--no-svg` pour les documents uniquement)
5. **Chaînes de l'interface utilisateur** (si l'interface utilisateur Docusaurus a changé) : `pnpm write-translations` extrait les nouvelles clés ; les documents et les SVG sont traduits par les scripts IA ci-dessus
6. **Tester les compilations** : `pnpm build` (compile tous les paramètres régionaux)
7. **Déployer** : Utilisez votre processus de déploiement (par exemple `pnpm deploy` pour GitHub Pages)

## Ajout de nouvelles langues

1. Ajouter la locale à `docusaurus.config.ts` dans le tableau `i18n.locales`
2. Ajouter la configuration de locale dans l'objet `localeConfigs`
3. Mettre à jour le tableau `language` du plugin de recherche (utiliser le code de langue approprié, par exemple `pt` pour pt-BR)
4. Ajouter la locale à `translate.config.json` dans `locales.targets` (pour la traduction par IA)
5. Exécuter la traduction par IA : `pnpm run translate` (traduit les documents et les SVG)
6. Créer les fichiers de traduction de l'interface utilisateur : `pnpm write-translations` (génère la structure) ; traduire les documents et les SVG avec `pnpm run translate`

## Ignorer les Fichiers

- **`.translate.ignore`** : Motifs de style Gitignore pour les fichiers de documentation à ignorer lors de la traduction par IA. Les chemins sont relatifs à `docs/`. Exemple : `api-reference/*`, `LICENSE.md`
- **`.translate-svg.ignore`** : Motifs pour les fichiers SVG dans `static/img/` à ignorer lors de `translate:svg`. Exemple : `duplistatus_logo.svg`

## Gestion du Glossaire

Le glossaire de terminologie est généré automatiquement à partir des dictionnaires intlayer pour maintenir la cohérence entre les traductions de l'interface utilisateur de l'application et la documentation.

### Génération du glossaire

```bash
cd documentation
./scripts/generate-glossary.sh
```

Ce script :

- Exécute `pnpm intlayer build` à la racine du projet pour générer les dictionnaires
- Extrait la terminologie des fichiers `.intlayer/dictionary/*.json`
- Génère `glossary.csv` et `scripts/glossary-table.md`
- Met à jour le tableau de glossaire dans `CONTRIBUTING-TRANSLATIONS.md` (si ce fichier existe)

### Quand Régénérer

- Après la mise à jour des traductions intlayer dans l'application
- Lors de l'ajout de nouveaux termes techniques à l'application
- Avant les travaux de traduction majeurs pour assurer la cohérence

## Traduction Alimentée par l'IA

Le projet inclut un système de traduction automatisé utilisant l'API OpenRouter qui peut traduire la documentation en français, allemand, espagnol et portugais brésilien avec mise en cache intelligente et application de glossaire.

### Conditions préalables

1. **Clé API OpenRouter** : Définissez la variable d'environnement `OPENROUTER_API_KEY` :

   ```bash
   export OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

2. **Installer les dépendances** : Les dépendances se trouvent dans `package.json`. Installez-les avec :

   ```bash
   cd documentation
   pnpm install
   ```

3. **Configuration** : Le fichier `translate.config.json` contient les paramètres par défaut. Vous pouvez personnaliser les modèles, les paramètres régionaux et les chemins selon vos besoins.

### Aide rapide

Pour voir un résumé de toutes les commandes de traduction et les options du script de traduction :

```bash
pnpm run help
# or
pnpm run translate:help
```

Ceci affiche `TRANSLATION-HELP.md`.

### Utilisation de base

**Traduire toute la documentation vers toutes les locales :**

```bash
cd documentation
pnpm run translate
```

**Traduire vers une locale spécifique :**

```bash
pnpm run translate --locale fr    # French
pnpm run translate --locale de    # German
pnpm run translate --locale es    # Spanish
pnpm run translate --locale pt-br # Brazilian Portuguese
```

**Traduire un fichier ou un répertoire spécifique :**

```bash
pnpm translate --path docs/intro.md
pnpm translate --path docs/development/
```

**Aperçu sans apporter de modifications (exécution à blanc) :**

```bash
pnpm run translate:dry-run
```

### Journaux

Les deux `translate` et `translate:svg` écrivent tous les résultats de la console dans les fichiers journaux dans `.translation-cache/` :

- `translate_<timestamp>.log` – sortie complète de `pnpm run translate`
- `translate-svg_<timestamp>.log` – sortie complète de `pnpm run translate:svg` (autonome)

Le chemin de journalisation est affiché au démarrage de chaque exécution. Les journaux sont ajoutés en temps réel.

### Gestion du cache

Le système de traduction utilise un cache à deux niveaux (au niveau des fichiers et au niveau des segments) stocké dans `.translation-cache/cache.db` pour minimiser les coûts des API :

**Vérifier le statut de la traduction :**

```bash
pnpm run translate:status
```

Ceci génère un tableau affichant le statut de traduction pour tous les fichiers de documentation :

- `✓` = Traduit et à jour (le hash source correspond)
- `-` = Non traduit
- `●` = Traduit mais obsolète (le fichier source a changé)
- `□` = Orphelin (existe dans le dossier de traduction mais pas dans la source)
- `i` = Ignoré (ignoré par `.translate.ignore`)

Le script compare le `source_file_hash` dans l'en-tête de la traduction avec le hash calculé du fichier source pour détecter les traductions obsolètes.

**Effacer tous les caches :**

```bash
pnpm translate --clear-cache
```

**Effacer le cache pour une locale spécifique :**

```bash
pnpm translate --clear-cache fr
```

**Forcer la re-traduction (effacer le cache des fichiers, pas le cache des traductions) :**

```bash
pnpm translate --force
```

**Ignorer le cache (forcer les appels API, mais persister quand même les nouvelles traductions) :**

```bash
pnpm translate --no-cache
```

**Nettoyer le cache (supprimer les entrées orphelines et obsolètes) :**

```bash
pnpm run translate:cleanup
```

ou

```bash
pnpm run translate:clean
```

**Modifier le cache dans une interface web :**

```bash
pnpm run translate:edit-cache
```

Cela sert une application web sur le port 4000 (ou le suivant disponible) pour parcourir et modifier le cache de traduction. Fonctionnalités : vue tableau avec filtres (nom de fichier, locale, source_hash, source_text, translated_text), modification en ligne du texte traduit, suppression d'une seule entrée, suppression de toutes les traductions pour un chemin de fichier, pagination, thème sombre. Une icône afficher les liens imprime les chemins de fichiers source et traduits dans le terminal afin que vous puissiez les ouvrir dans votre éditeur. Exécutez à partir de `documentation/`.

### Traduction SVG

La traduction SVG est incluse dans `pnpm run translate` par défaut (s'exécute après les docs). Les fichiers SVG dans `static/img/` dont les noms commencent par `duplistatus` sont traduits.

**Ignorer SVG** (docs uniquement) :

```bash
pnpm run translate --no-svg
```

**SVG uniquement** (script autonome) :

```bash
pnpm run translate:svg
```

Options : `--locale`, `--path`, `--dry-run`, `--no-cache`, `--force`, `--no-export-png`. Utilise `.translate-svg.ignore` pour les exclusions. Exporte optionnellement PNG via l'interface de ligne de commande Inkscape.

### Flux de travail avec traduction IA

1. **Mettre à jour la documentation anglaise** dans `docs/`
2. **Mettre à jour le glossaire** (si nécessaire) : `./scripts/generate-glossary.sh`
3. **Exécuter la traduction IA** : `pnpm run translate` (traduit les documents et les SVG)
4. **Vérifier** les traductions dans `i18n/{locale}/docusaurus-plugin-content-docs/current/` (optionnel)
5. **Tester les compilations** : `pnpm build`
6. **Déployer** en utilisant votre processus de déploiement

### Sélection du modèle et optimisation des coûts

La configuration par défaut utilise `anthropic/claude-haiku-4.5`. Vous pouvez modifier `translate.config.json` pour utiliser différents modèles :

- **Par défaut** : `anthropic/claude-haiku-4.5`
- **Secours** : `google/gemma-3-27b-it`
- **Qualité élevée** : `anthropic/claude-sonnet-4`
- **Économique** : `openai/gpt-4o-mini`

**Stratégie d'optimisation des coûts :**

1. Premier passage : Utiliser le modèle moins cher (`gpt-4o-mini`) pour la traduction initiale
2. Passage de qualité : Re-traduire les fichiers problématiques avec `claude-sonnet-4` si nécessaire

### Dépannage

**« OPENROUTER_API_KEY Non défini »**

- Exporter la variable d'environnement ou ajouter à `.env.local`

**Erreurs de limite de débit**

- Le Système inclut des délais automatiques, mais vous devrez peut-être réduire les demandes parallèles

**Problèmes de qualité de traduction**

- Essayez différents modèles dans `translate.config.json`
- Ajoutez d'autres termes à `glossary.csv`

**Corruption du cache**

- Exécutez `pnpm translate --clear-cache` pour réinitialiser
- Exécutez `pnpm run translate:cleanup` pour supprimer les entrées orphelines
- Utilisez `pnpm run translate:edit-cache` pour modifier les traductions en cache individuelles sans retraduite

**Débogage du trafic OpenRouter**

- La journalisation du trafic de débogage est **activée par défaut**. Les journaux sont écrits dans `.translation-cache/debug-traffic-<timestamp>.log`. Utilisez `--debug-traffic <path>` pour spécifier un nom de fichier personnalisé, ou `--no-debug-traffic` pour désactiver. Les clés API ne sont jamais écrites.
- Le trafic est journalisé **uniquement quand les segments sont envoyés à l'API**. Si tous les segments sont servis à partir du cache (par exemple lors de l'utilisation de `--force`, qui efface le cache de fichiers mais non le cache de segments), aucun appel API n'est effectué et le journal ne contiendra qu'un en-tête et une note. Utilisez `--no-cache` pour forcer les appels API et capturer le trafic des requêtes/réponses. Les nouvelles traductions d'une exécution `--no-cache` sont toujours écrites dans le cache pour les exécutions futures.
- Exemple : `pnpm run translate -- --locale pt-BR --debug-traffic my-debug.log --no-cache`

## Suivi du Statut de Traduction

Suivre la progression de la traduction avec :

```bash
pnpm run translate:status
```

Ceci affiche un tableau et un résumé pour tous les fichiers de documentation.
