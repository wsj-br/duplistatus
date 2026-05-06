---
translation_last_updated: '2026-05-06T23:20:01.497Z'
source_file_mtime: '2026-05-06T23:18:51.394Z'
source_file_hash: e7d139a531d71a9356831027194544c2e1d3243ed71eb529ff1aafbad09db413
translation_language: fr
source_file_path: documentation/docs/development/translation-workflow.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Workflow de Maintenance des Traductions {#translation-maintenance-workflow}

Pour les commandes de documentation générale (build, deploy, screenshots, génération README), voir [Documentation Tools](documentation-tools.md).

## Vue d'ensemble {#overview}

La documentation utilise Docusaurus i18n avec le français comme langue par défaut. La documentation source se trouve dans `docs/` ; les traductions sont écrites sous `i18n/{locale}/`. Langues prises en charge : en (par défaut), fr, de, es, pt-BR.

**Traduction IA** pour l'interface utilisateur de l'application, le markdown/JSON Docusaurus et les ressources SVG est gérée par [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) depuis la **racine du dépôt**, configurée dans `ai-i18n-tools.config.json` (pas à l'intérieur de `documentation/`). Définissez `OPENROUTER_API_KEY` lors de l'exécution des commandes de traduction.

## Quand la documentation française change {#when-english-documentation-changes}

1. **Modifier la source** dans `documentation/docs/` (anglais uniquement).
2. **Chaînes d'interface Docusaurus** (libellés du thème, barre de navigation, etc.) : si nécessaire, exécutez `pnpm write-translations` dans `documentation/` pour que `i18n/en/*.json` récupère les nouvelles clés.
3. **Identifiants de titres** : `pnpm write-heading-ids` (à partir de `documentation/`).
4. **Traduire** depuis la **racine du dépôt** (ou utilisez les raccourcis ci-dessous depuis `documentation/`) :
   - `pnpm i18n:extract` — actualiser `src/locales/strings.json` depuis `t('…')` dans l'application Next.js.
   - `pnpm i18n:translate:docs` — traduire les fichiers markdown/JSON en `documentation/i18n/` selon la configuration.
   - `pnpm i18n:translate:svg` — traduire les fichiers SVG situés dans `documentation/static/img` selon la configuration.
   - Ou exécutez tout : `pnpm i18n:translate`.
5. **Construire** : `cd documentation && pnpm build` (toutes les langues).

Depuis l'intérieur de `documentation/`, les mêmes flux sont connectés comme `pnpm translate` → racine `i18n:translate`, plus `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## Glossaire {#glossary}

- **Terminologie de l'interface** pour la documentation est pilotée par `glossary.uiGlossary` dans `ai-i18n-tools.config.json`, pointant vers `src/locales/strings.json` (le catalogue produit par `pnpm i18n:extract`).
- **Remplacements** se trouvent dans `documentation/glossary-user.csv` (`glossary.userGlossary` dans la configuration). Consultez la [documentation du glossaire ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) pour le format des colonnes.
- Générer un modèle CSV : `pnpm i18n:glossary-generate` (racine).

## Cache {#cache}

Le cache de traduction pour ai-i18n-tools se trouve dans `.translation-cache/` à la racine du dépôt (`cacheDir` dans `ai-i18n-tools.config.json`). Il est ignoré par git. Utilisez `pnpm i18n:status` et les options `--force` / cache de l'interface en ligne de commande selon la documentation [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) lorsque vous avez besoin d'un rafraîchissement complet.

## Identifiants de titres et ancres {#heading-ids-and-anchors}

Utilisez des identifiants explicites afin que les liens restent stables entre les langues :

```markdown
## This is a heading {#this-is-a-heading}
```

```bash
cd documentation
pnpm write-heading-ids
```

## Listes d'ignorance {#ignore-lists}

Utilisez `.translate-ignore` à la racine du dépôt (même principe que `.gitignore`) pour indiquer les chemins que le traducteur de documentation doit ignorer, si vous en ajoutez un pour votre flux de travail.

## Thème JSON Docusaurus {#docusaurus-theme-json}

`pnpm write-translations` extrait les chaînes d'interface Docusaurus dans `documentation/i18n/en/`. L'étape **ai-i18n-tools** `translate-docs` (avec `markdownOutput.style: "docusaurus"`) remplit les JSON traduits sous chaque langue à côté du markdown, selon `ai-i18n-tools.config.json`.

## Dépannage {#troubleshooting}

- `OPENROUTER_API_KEY` **non défini** — exportez-la ou ajoutez-la à `.env.local` à la racine du dépôt.
- **Modèle / qualité** — ajustez `openrouter.translationModels` et les options associées dans `ai-i18n-tools.config.json`.
- **Glossaire** — modifiez `documentation/glossary-user.csv` ou régénérez les chaînes d'interface, puis relancez extract + translate.

## Ajout d'une nouvelle langue {#adding-a-new-language}

1. Ajoutez la langue à la configuration Docusaurus `i18n.locales` et `localeConfigs` dans `documentation/docusaurus.config.ts`.
2. Ajoutez la même langue à `targetLocales` dans `ai-i18n-tools.config.json` (racine du dépôt).
3. Exécutez `pnpm i18n:generate-ui-languages` à la racine, puis les commandes `pnpm i18n:extract` / traduire selon les besoins.
