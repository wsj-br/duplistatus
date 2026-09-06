# Workflow de Maintenance des Traductions {#translation-maintenance-workflow}

Pour les commandes de documentation générale (build, deploy, screenshots, génération README), voir [Documentation Tools](documentation-tools.md).

## Vue d'ensemble {#overview}

La documentation utilise l'i18n de Docusaurus avec l'anglais comme locale par défaut. La documentation source se trouve dans `docs/` ; les traductions sont écrites sous `i18n/{locale}/`. Locales prises en charge : en-GB (par défaut), fr, de, es, pt-BR, hi, zh-Hans.

La **traduction par IA** pour l'interface utilisateur de l'application, le markdown/JSON de Docusaurus, les ressources SVG et les **modèles de notification par défaut** est gérée par [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) depuis la **racine du dépôt**, configurée dans `ai-i18n-tools.config.json` (et non à l'intérieur de `documentation/`). Définissez `OPENROUTER_API_KEY` lors de l'exécution des commandes de traduction.

## Quand la documentation française change {#when-english-documentation-changes}

1. **Modifier la source** dans `documentation/docs/` (anglais uniquement).
2. **Chaînes d'interface Docusaurus** (libellés du thème, barre de navigation, etc.) : si nécessaire, exécutez `pnpm write-translations` dans `documentation/` pour que `i18n/en/*.json` récupère les nouvelles clés.
3. **Identifiants de titres** : `pnpm write-heading-ids` (à partir de `documentation/`).
4. **Traduire** depuis la **racine du dépôt** (ou utilisez les raccourcis ci-dessous depuis `documentation/`) :
   - `pnpm i18n:extract` — actualiser `src/locales/strings.json` à partir de `t('…')` dans l'application Next.js.
   - `pnpm i18n:translate:docs` — traduire markdown/JSON en `documentation/i18n/` selon la configuration.
   - `pnpm i18n:translate:svg` — traduire les SVGs sous `documentation/static/img` comme configuré.
   - `pnpm i18n:translate:json` — traduire les modèles de notification par défaut dans `src/locales/templates/` à partir de `en-GB.json`.
   - Ou exécutez tout : `pnpm i18n:translate`.
5. **Build** : `cd documentation && pnpm build` (toutes les locales).

Depuis l'intérieur de `documentation/`, les mêmes flux sont connectés comme `pnpm translate` → racine `i18n:translate`, plus `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## Pluriels dans l'interface utilisateur {#ui-plurals}

Les pluriels cardinaux dans l'application Next.js utilisent **ai-i18n-tools**, et non des clés `_one` / `_other` écrites à la main.

Écrivez une seule chaîne source en anglais (généralement le pluriel) et passez un **objet littéral simple** avec `plurals: true` et un `count` numérique :

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

Règles :

- Ne pas utiliser `item(s)` des réserves ou `count === 1 ? t('…') : t('…')` des paires.
- Les **comptes** numériques indépendants nécessitent des appels `t()` séparés — un axe pluriel ne peut pas gérer deux nombres (par exemple 1 réussi et 2 échecs). Concaténez les fragments :

```tsx
`${t("Tested {{count}} connections:", { plurals: true, count: total })} ` +
  `${t("{{count}} successful,", { plurals: true, count: successCount })} ` +
  `${t("{{count}} failed", { plurals: true, count: failureCount })}`
```

- Les interpolations non numériques (noms, étiquettes, etc.) sont acceptables dans la même chaîne plurielle que `{{count}}`.
- `pnpm i18n:extract` marque la ligne du catalogue `"plural": true`. `pnpm i18n:translate:ui` remplit les formulaires CLDR et écrit `src/locales/en-GB.json` (clés pluriels uniquement).
- `src/i18n.ts` et `src/lib/i18n-server.ts` chargent ce fichier en tant que `sourcePluralFlatBundle` afin que le singulier/pluriel anglais se résolve à l'exécution.

## Modèles de notification par défaut {#default-notification-templates}

Paramètres → Modèles → **Réinitialiser** charge les valeurs par défaut depuis `src/locales/templates/{locale}.json` (connecté dans `src/lib/default-notification-templates.ts`).

1. Modifiez uniquement **`src/locales/templates/en-GB.json`** (source en anglais).
2. Exécutez **`pnpm i18n:translate:json`** (ou **`pnpm i18n:translate`**) depuis la racine du dépôt.
3. Vérifiez les différences — les espaces réservés tels que `{backup_name}` et `{problem_table}` doivent rester inchangés ; `priority` et `tags` sont ignorés par `keyPolicy` dans `ai-i18n-tools.config.json`.
4. Exécutez **`pnpm i18n:status`** pour voir la couverture du bloc JSON.

Consultez le [guide JSON de ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/guide/json.html) pour les indicateurs (`--locale`, `--force`, etc.).

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
