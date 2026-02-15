---
translation_last_updated: '2026-02-15T20:57:31.067Z'
source_file_mtime: '2026-02-15T19:32:35.362Z'
source_file_hash: f6b2901b63a4b18c
translation_language: fr
source_file_path: development/translation-workflow.md
---
# Workflow de Maintenance des Traductions {#translation-maintenance-workflow}

Pour les commandes de documentation générale (build, deploy, screenshots, génération README), voir [Documentation Tools](documentation-tools.md).

## Vue d'ensemble {#overview}

La documentation utilise Docusaurus i18n avec l'anglais comme locale par défaut. La documentation source se trouve dans `docs/` ; les traductions sont écrites dans `i18n/{locale}/docusaurus-plugin-content-docs/current/`. Locales supportées : en (par défaut), fr, de, es, pt-BR.

## Quand la Documentation Anglaise Change {#when-english-documentation-changes}

1. **Mettre à jour les fichiers sources** dans `docs/`
2. **Lancer l'extraction** (si les chaînes de l'interface Docusaurus ont changé) : `pnpm write-translations`
3. **Mettre à jour le glossaire** (si les traductions intlayer ont changé) : `pnpm translate:glossary-ui`
4. **Ajouter les ID de titres** : `pnpm heading-ids`
5. **Lancer la traduction par IA** : `pnpm translate` (traduit les docs, les chaînes d'interface JSON et les SVG ; utilisez `--no-svg` pour les docs uniquement, `--no-json` pour ignorer les chaînes d'interface)
6. **Chaînes d'interface** (si l'interface Docusaurus a changé) : `pnpm write-translations` extrait les nouvelles clés ; les docs, les chaînes d'interface JSON et les SVG sont traduits par les scripts IA ci-dessus
7. **Tester les builds** : `pnpm build` (construit tous les locales)
8. **Déployer** : Utilisez votre processus de déploiement (par exemple `pnpm deploy` pour GitHub Pages)

<br/>

## Ajout de Nouvelles Langues {#adding-new-languages}

1. Ajouter le locale dans `docusaurus.config.ts` dans le tableau `i18n.locales`
2. Ajouter la configuration du locale dans l'objet `localeConfigs`
3. Mettre à jour le tableau de langue du plugin de recherche (utiliser le code de langue approprié, par exemple `pt` pour pt-BR)
4. Ajouter le locale dans `translate.config.json` dans `locales.targets` (pour la traduction IA)
5. Exécuter la traduction IA : `pnpm translate` (traduit les docs, les chaînes d'interface JSON et les SVG)
6. Créer les fichiers de traduction d'interface : `pnpm write-translations` (génère la structure) ; traduire les docs, les chaînes d'interface JSON et les SVG avec `pnpm translate`

<br/>

## Traduction Alimentée par IA {#ai-powered-translation}

Le projet inclut un système de traduction automatisé utilisant l'API OpenRouter qui peut traduire la documentation en français, allemand, espagnol et portugais brésilien avec mise en cache intelligente et application de glossaire.

### Conditions préalables {#prerequisites}

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

Pour voir un résumé de toutes les commandes de traduction et les options du script de traduction :

   ```bash
   pnpm help
   # or
   pnpm translate:help
   ```

### Utilisation de Base {#basic-usage}

**Traduire toute la documentation vers toutes les locales :**

      ```bash
      cd documentation
      pnpm translate
      ```

**Traduire vers une locale spécifique :**

      ```bash
      pnpm translate --locale fr    # French
      pnpm translate --locale de    # German
      pnpm translate --locale es    # Spanish
      pnpm translate --locale pt-br # Brazilian Portuguese
      ```

**Traduire un fichier ou un répertoire spécifique :**

      ```bash
      pnpm translate --path docs/intro.md
      pnpm translate --path docs/development/
      ```

**Aperçu sans apporter de modifications (exécution à blanc) :**

      ```bash
      pnpm translate --dry-run
      ```

### Configuration du Modèle {#model-configuration}

Le système de traduction utilise des modèles configurés dans `translate.config.json`, un principal et un de secours.

| Configuration | Notes                               | Modèle par Défaut           |
|---------------|-------------------------------------|------------------------------|
| defaultModel  | Modèle principal pour les traductions | `anthropic/claude-3.5-haiku` |
| fallbackModel | Modèle de secours utilisé si le modèle principal échoue | `anthropic/claude-haiku-4.5` |

Consultez la liste de tous les modèles disponibles et leurs coûts associés sur la [page Openrouter.ai](https://openrouter.ai/models)

### Tester la Qualité de la Traduction {#testing-the-quality-of-the-translation}

Pour tester la qualité d'un nouveau modèle, modifiez le `defaultModel` dans le `translate.config.json` et lancez la traduction pour un fichier, par exemple :

```bash
pnpm translate --force --path docs/intro.md --no-cache --locale pt-BR
```

et vérifiez le fichier traduit dans `i18n/pt-BR/docusaurus-plugin-content-docs/current/intro.md`

### Ignorer des Fichiers {#ignore-files}

Ajoutez les fichiers à ignorer pendant la traduction par IA dans le fichier `.translate-ignore` (dans le même style que `.gitignore`).

Exemple :

```bash
# Documentation files
# Keep the license in English
LICENSE.md

# Don't translate the API reference
api-reference/*

# Dashboard/table diagram - not referenced in docs
duplistatus_dash-table.svg
```

### Gestion du Glossaire {#glossary-management}

Le glossaire de terminologie est généré automatiquement à partir des dictionnaires intlayer pour maintenir la cohérence entre les traductions de l'interface utilisateur de l'application et la documentation.

#### Génération du Glossaire {#generating-the-glossary}

```bash
cd documentation
pnpm translate:glossary-ui
```

Ce script :

- Exécute `pnpm intlayer build` à la racine du projet pour générer les dictionnaires
- Extrait la terminologie des fichiers `.intlayer/dictionary/*.json`
- Génère `glossary-ui.csv`
- Met à jour la table du glossaire dans `CONTRIBUTING-TRANSLATIONS.md` (si ce fichier existe)

#### Quand Régénérer {#when-to-regenerate}

- Après la mise à jour des traductions intlayer dans l'application
- Lors de l'ajout de nouveaux termes techniques à l'application
- Avant les travaux de traduction majeurs pour assurer la cohérence

#### Remplacements du Glossaire Utilisateur {#user-glossary-overrides}

Le fichier `glossary-user.csv` vous permet de remplacer ou d'ajouter des termes sans modifier le glossaire d'interface généré. Format : `en`, `locale`, `traduction` (une ligne par terme par langue). Utilisez `*` comme langue pour appliquer un terme à toutes les langues configurées. Les entrées prennent le pas sur `glossary-ui.csv`.

### Gestion du Cache {#cache-management}

Le système de traduction utilise un cache à deux niveaux (niveau fichier et niveau segment) stocké dans `.translation-cache/cache.db` pour minimiser les coûts d'API. Ce fichier est inclus dans le dépôt Git pour réduire les coûts de traduction futurs.

Commandes de gestion du cache :

| Commande                                | Description                                                           |
|-----------------------------------------|-----------------------------------------------------------------------|
| `pnpm translate --clear-cache <locale>` | Effacer le cache pour une locale spécifique                           |
| `pnpm translate --clear-cache`          | Effacer **tous** les caches (fichier et segment)                      |
| `pnpm translate --force`                | Forcer la re-traduction (efface le cache fichier, conserve le cache segment) |
| `pnpm translate --no-cache`             | Contourner le cache entièrement (forcer les appels API, sauvegarde toujours les nouvelles traductions) |
| `pnpm translate:editor`             | Révision manuelle, supprimer ou modifier les entrées du cache                           |

### Supprimer les caches orphelins et obsolètes {#remove-orphaned-and-stale-cache}

Lorsque des modifications sont apportées aux documents existants, les entrées de cache peuvent devenir orphelines ou obsolètes. Utilisez les commandes pour supprimer les entrées qui ne sont plus nécessaires, réduisant ainsi la taille du cache de traduction.

```bash
pnpm translate --force
pnpm translate:cleanup
```

:::warning
Avant d'exécuter le script de nettoyage, assurez-vous d'avoir exécuté `pnpm translate --force`. Cette étape est cruciale pour éviter de supprimer accidentellement des entrées valides marquées comme obsolètes.

Le script crée automatiquement une sauvegarde dans le dossier `.translation-cache`, vous permettant de récupérer les données supprimées si nécessaire.
:::

<br/>

### Révision manuelle du cache {#manual-review-of-the-cache}

Lors de la révision des traductions, utilisez l'outil d'édition de cache web pour afficher les traductions de termes spécifiques, supprimer des entrées de cache, supprimer des entrées à l'aide des filtres disponibles ou supprimer des fichiers spécifiques. Cela vous permet de retraduire uniquement les textes ou fichiers souhaités.

Par exemple, si un modèle a traduit incorrectement un terme, vous pouvez filtrer toutes les entrées pour ce terme, modifier le modèle dans le fichier `translate.config.json` et retraduire uniquement les lignes contenant ces termes à l'aide du nouveau modèle.

```bash
pnpm translate:editor
```

Cela ouvrira une interface utilisateur web pour parcourir et modifier manuellement le cache (port 4000 ou 4000+), afin que vous puissiez :
   - Vue tableau avec capacités de filtrage
   - Édition en ligne du texte traduit
   - Supprimer une seule entrée, les traductions d'un fichier spécifique ou des entrées filtrées
   - Imprimer les chemins des fichiers sources et traduits dans le terminal pour un accès rapide à l'éditeur

![Translate Edit-Cache App](/img/screenshot-translate-edit-cache.png)

<br/>

### ID et ancres de titres {#heading-ids-and-anchors}

Des liens d'ancrage cohérents (ID) sont essentiels pour les références croisées, la table des matières et les liens profonds. Lorsque le contenu est traduit, le texte des titres change, ce qui modifierait normalement les ID d'ancrage générés automatiquement entre les langues.

```markdown
 ## This is a Heading {#this-is-a-heading}
```

Après avoir mis à jour ou créé un nouveau fichier source en anglais, exécutez ceci pour garantir des ID explicites :

```bash
cd documentation
pnpm heading-ids   # Adds {#id} to all headings without explicit IDs
```

:::note
Utilisez toujours l'ID généré lors de références croisées entre sections de la documentation.
:::

<br/>

### Traduction SVG {#svg-translation}

La traduction SVG est incluse par défaut dans `pnpm translate` (s'exécute après les docs). Les fichiers SVG dans `static/img/` dont les noms commencent par `duplistatus` sont traduits.

**Ignorer SVG** (docs uniquement) :

```bash
pnpm translate --no-svg
```

**SVG uniquement** (script autonome) :

```bash
pnpm translate:svg
```

Options : `--locale`, `--path`, `--dry-run`, `--no-cache`, `--force`, `--no-export-png`. Utilise `.translate-ignore` pour les exclusions.

<br/>

### Traduction des chaînes d'interface (JSON) {#ui-strings-translation-json}

Les chaînes d'interface utilisateur Docusaurus et les étiquettes de composants personnalisés sont stockées dans des fichiers de traduction JSON. Ils sont générés automatiquement par `pnpm write-translations` puis traduits par le système d'IA.

**Fonctionnement :**

1. **Extraction** : `pnpm write-translations` analyse les fichiers de thème Docusaurus et les composants React personnalisés à la recherche de chaînes traduisibles (comme « Suivant », « Précédent », « Rechercher », étiquettes de boutons) et les écrit dans `i18n/en/` sous forme de fichiers JSON. Chaque fichier correspond à un plugin ou un thème Docusaurus.
2. **Traduction** : `pnpm translate` (avec prise en charge JSON activée) traduit ces fichiers JSON dans toutes les locales cibles à l'aide du modèle d'IA, en respectant le glossaire.
3. **Utilisation** : Docusaurus charge automatiquement les fichiers JSON de la locale appropriée au moment de l'exécution pour afficher l'interface utilisateur dans la langue sélectionnée.

**Fichiers JSON principaux** (tous dans `i18n/{locale}/`) :
- `docusaurus-plugin-content-docs/current.json` - Chaînes d'interface utilisateur de documentation (recherche, navigation, table des matières)
- `docusaurus-theme-classic/navbar.json` - Éléments de la barre de navigation
- `docusaurus-theme-classic/footer.json` - Éléments de pied de page
- `code.json` - Étiquettes de bloc de code (copier, réduire, développer)
- Autres fichiers JSON spécifiques aux plugins

**Ignorer la traduction JSON** (documentation uniquement) :

```bash
pnpm translate --no-json
```

**Important** : Les chaînes d'interface utilisateur sont généralement stables, mais si vous ajoutez de nouveaux composants personnalisés avec du texte traduisible, vous devez exécuter `pnpm write-translations` pour extraire ces nouvelles chaînes avant d'exécuter `pnpm translate`. Sinon, les nouvelles chaînes n'apparaîtront qu'en anglais pour toutes les locales.

<br/>

La commande `translate` enregistre toutes les sorties de console et le trafic API dans des fichiers du répertoire `.translation-cache/`. Les journaux incluent :

- `translate_<timestamp>.log` : Un journal complet de la sortie de la commande `pnpm translate`.
- `debug-traffic-<timestamp>.log` : Un journal de tout le trafic envoyé et reçu du modèle d'IA.

Notez que le trafic API n'est enregistré que lorsque des segments sont envoyés à l'API. 
   Si tous les segments sont récupérés depuis le cache (par exemple, lors de l'utilisation de l'option `--force` qui 
   écrase le cache de fichiers, mais pas les traductions du cache de segments), aucun appel API n'est effectué, et 
   le journal ne contiendra qu'un en-tête et une note.

Pour forcer les appels API et capturer le trafic de requête/réponse, 
   utilisez l'option `--no-cache`.

<br/>

## Workflow avec traduction par IA {#workflow-with-ai-translation}

1. **Mettre à jour la documentation anglaise** dans `docs/`
2. **Mettre à jour le glossaire** (si nécessaire) : `pnpm translate:glossary-ui` et `glossary-user.csv`.
3. **Mettre à jour les ID de titres** : `pnpm headings-ids`
4. **Lancer la traduction par IA** : `pnpm translate` (traduit docs, json et SVGs)
5. **Vérifier** les traductions dans `i18n/{locale}/docusaurus-plugin-content-docs/current/` (optionnel)
6. **Tester les builds** : `pnpm build`
7. **Déployer** en utilisant votre processus de déploiement

<br/>

## Dépannage {#troubleshooting}

**« OPENROUTER_API_KEY Non défini »**

- Exporter la variable d'environnement ou ajouter à `.env.local`

**Problèmes de qualité de traduction**

- Essayez un modèle différent dans `translate.config.json`
- Supprimez les entrées du cache et utilisez un autre modèle
- Révisez le document en anglais et réécrivez-le pour clarifier la traduction
- Ajoutez plus de termes à `glossary-ui.csv` ou ajoutez des remplacements à `glossary-user.csv` (en, locale, traduction)

**Corruption du cache**

- Exécutez `pnpm translate --clear-cache` pour réinitialiser
- Exécutez `pnpm translate:cleanup` pour supprimer les entrées orphelines
- Utilisez `pnpm translate:editor` pour corriger/supprimer les traductions en cache individuelles sans re-traduire le document entier

**Débogage du trafic OpenRouter**

- Les journaux sont écrits dans `.translation-cache/debug-traffic-<timestamp>.log`. 
- Utilisez ce journal pour vérifier si le problème de traduction est lié au script, aux invites utilisées ou au modèle.

## Suivi du statut de traduction {#translation-status-tracking}

Suivre la progression de la traduction avec :

```bash
pnpm translate:status
```

Ceci génère un tableau montrant le statut de traduction pour tous les fichiers de documentation. Par exemple :

![Translate Status](/img/screenshot-translate-status.png)
