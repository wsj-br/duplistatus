# Flux de travail de maintenance des traductions {/* #translation-maintenance-workflow */}

Pour les commandes de documentation générales (compilation, déploiement, captures d'écran, génération README), consultez [Outils de documentation](documentation-tools.md).

## Aperçu {/* #overview */}

La documentation utilise Docusaurus i18n avec l'anglais comme locale par défaut. La documentation source se trouve dans `docs/` ; les traductions sont écrites sous `i18n/{locale}/`. Locales prises en charge : en-GB (par défaut), fr, de, es, pt-BR, hi, zh-Hans.

La **traduction par IA** pour l'interface utilisateur de l'application, le markdown/JSON Docusaurus, les ressources SVG et les **modèles de notification par défaut** est gérée par [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) à partir de la **racine du référentiel**, configurée dans `ai-i18n-tools.config.json` (pas à l'intérieur de `documentation/`). Définissez `OPENROUTER_API_KEY` lors de l'exécution des commandes de traduction.

Pour essayer un checkout non publié sur la même machine (`../ai-i18n-tools` par défaut), remplacez la dépendance avec `pnpm i18n:tools --local` ou `./scripts/link-ai-i18n-tools.sh --local`. Cela lie à la fois la CLI (`pnpm i18n:*`) et l’import `ai-i18n-tools/runtime`. Reconstruisez le package tools après les modifications du code source (`pnpm build` dans ce checkout). Restaurez le package npm le plus récent avec `--remote`. Ne commitez pas le spécificateur `link:`.

## Quand la documentation anglaise change {/* #when-english-documentation-changes */}

1. **Modifier le code source** dans `documentation/docs/` (anglais uniquement).
2. **Chaînes d’interface Docusaurus** (libellés de thème, barre de navigation, etc.) : si nécessaire, exécutez `pnpm write-translations` dans `documentation/` pour que `i18n/en/*.json` récupère les nouvelles clés.
3. **ID des titres** : `pnpm write-heading-ids` (depuis `documentation/`).
4. **Traduire** depuis la **racine du dépôt** (ou utilisez les raccourcis ci-dessous depuis `documentation/`) :
   - `pnpm i18n:extract` — actualiser `src/locales/strings.json` depuis `t('…')` dans l’application Next.js.
   - `pnpm i18n:translate:docs` — traduire markdown/JSON en `documentation/i18n/` selon la configuration.
   - `pnpm i18n:translate:svg` — traduire les SVG sous `documentation/static/img` selon la configuration.
   - `pnpm i18n:translate:json` — traduire les modèles de notification par défaut dans `src/locales/templates/` depuis `en-GB.json`.
   - Ou exécutez tout : `pnpm i18n:translate`.
5. **Générer** : `cd documentation && pnpm build` (toutes les locales).

À partir de `documentation/`, les mêmes flux sont câblés comme `pnpm translate` → racine `i18n:translate`, plus `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## Pluriels d'interface utilisateur {/* #ui-plurals */}

Les pluriels cardinaux dans l'application Next.js utilisent **ai-i18n-tools**, pas les clés `_one` / `_other` écrites à la main.

Écrivez une chaîne source anglaise (généralement le pluriel) et transmettez un **objet littéral simple** avec `plurals: true` et un `count` numérique :

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

Règles :

- N'utilisez pas les couvertures `item(s)` ou les paires `count === 1 ? t('…') : t('…')`.
- Les **comptages numériques** indépendants nécessitent des appels `t()` séparés — un axe pluriel ne peut pas faire varier deux nombres (par exemple 1 réussi et 2 échoués). Concaténez les fragments :

```tsx
`${t("Tested {{count}} connections:", { plurals: true, count: total })} ` +
  `${t("{{count}} successful,", { plurals: true, count: successCount })} ` +
  `${t("{{count}} failed", { plurals: true, count: failureCount })}`
```

- Les interpolations non numériques (noms, étiquettes, etc.) sont correctes dans la même chaîne plurielle que `{{count}}`.
- `pnpm i18n:extract` marque la ligne du catalogue `"plural": true`. `pnpm i18n:translate:ui` remplit les formes CLDR et écrit `src/locales/en-GB.json` (clés plurielles uniquement).
- `src/i18n.ts` et `src/lib/i18n-server.ts` chargent ce fichier comme `sourcePluralFlatBundle` pour que le singulier/pluriel anglais se résolve à l'exécution.

## Modèles de notification par défaut {/* #default-notification-templates */}

Paramètres → Modèles → **Réinitialiser** charge les valeurs par défaut à partir de `src/locales/templates/{locale}.json` (câblé dans `src/lib/default-notification-templates.ts`).

1. Modifiez **`src/locales/templates/en-GB.json`** uniquement (source anglaise).
2. Exécutez **`pnpm i18n:translate:json`** (ou **`pnpm i18n:translate`**) à partir de la racine du référentiel.
3. Examinez les différences — les espaces réservés tels que `{backup_name}` et `{problem_table}` doivent rester inchangés ; `priority` et `tags` sont ignorés par `keyPolicy` dans `ai-i18n-tools.config.json`.
4. Exécutez **`pnpm i18n:status`** pour voir la couverture du bloc JSON.

Consultez le [guide JSON ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/guide/json.html) pour les drapeaux (`--locale`, `--force`, etc.).

## Glossaire {/* #glossary */}

- **Terminologie UI** pour la documentation est pilotée par `glossary.uiGlossary` dans `ai-i18n-tools.config.json`, pointant vers `src/locales/strings.json` (le catalogue produit par `pnpm i18n:extract`).
- **Les remplacements** se trouvent dans `documentation/glossary-user.csv` (`glossary.userGlossary` dans la config). Consultez la [documentation du glossaire ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) pour le format des colonnes.
- Générer un modèle CSV : `pnpm i18n:glossary-generate` (racine).

## Cache {/* #cache */}

Le cache de traduction pour ai-i18n-tools se trouve sous `.translation-cache/` à la racine du dépôt (`cacheDir` dans `ai-i18n-tools.config.json`). Il est ignoré par git. Utilisez `pnpm i18n:status` et les drapeaux `--force` / cache de la CLI selon la [documentation ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) quand vous avez besoin d'une actualisation complète.

## IDs de titre et ancres {/* #heading-ids-and-anchors */}

Utilisez des IDs explicites pour que les liens restent stables entre les langues. Préférez la syntaxe de commentaire MDX (`pnpm write-heading-ids` utilise `--syntax mdx-comment`) :

```markdown
## This is a heading {/* #this-is-a-heading */}
```

Placez les IDs sur `h2` et en dessous. Docusaurus `write-heading-ids` ignore `h1` (le titre de la page/barre latérale). `documentation/docusaurus.config.ts` supprime également les commentaires d'ID de titre des titres déduits, car l'extraction de métadonnées Docusaurus supprime toujours uniquement les `{#id}` classiques.

```bash
cd documentation
pnpm write-heading-ids
```

## Listes d'ignorance {/* #ignore-lists */}

Utilisez `.translate-ignore` à la racine du dépôt (même idée que `.gitignore`) pour les chemins que le traducteur de documentation doit ignorer, si vous en ajoutez un pour votre flux de travail.

## JSON de thème Docusaurus {/* #docusaurus-theme-json */}

`pnpm write-translations` extrait les chaînes UI Docusaurus dans `documentation/i18n/en/`. L'étape **ai-i18n-tools** `translate-docs` (avec `markdownOutput.style: "docusaurus"`) remplit le JSON traduit sous chaque locale aux côtés du markdown, selon `ai-i18n-tools.config.json`.

## Dépannage {/* #troubleshooting */}

- `OPENROUTER_API_KEY` **non défini** — exportez-le ou ajoutez-le à `.env.local` à la racine du dépôt.
- **Modèle / qualité** — ajustez `openrouter.translationModels` et les options associées dans `ai-i18n-tools.config.json`.
- **Glossaire** — modifiez `documentation/glossary-user.csv` ou régénérez les chaînes UI et relancez l'extraction + traduction.

## Ajouter une nouvelle langue {/* #adding-a-new-language */}

1. Ajoutez la locale à Docusaurus `i18n.locales` et `localeConfigs` dans `documentation/docusaurus.config.ts`.
2. Ajoutez la même locale à `targetLocales` dans `ai-i18n-tools.config.json` (racine du dépôt).
3. Exécutez `pnpm i18n:generate-ui-languages` à la racine, puis les commandes `pnpm i18n:extract` / traduction selon les besoins.
