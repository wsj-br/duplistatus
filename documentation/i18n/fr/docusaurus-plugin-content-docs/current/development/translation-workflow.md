# Processus de maintenance de la traduction {/* #translation-maintenance-workflow */}

Pour les commandes générales de documentation (construction, déploiement, captures d'écran, génération de README), voir [Outils de documentation](documentation-tools.md).

## Aperçu {/* #overview */}

La documentation utilise Docusaurus i18n avec l'anglais comme langue par défaut. La documentation source se trouve dans `docs/` ; les traductions sont écrites sous `i18n/{locale}/`. Locales prises en charge : en-GB (par défaut), fr, de, es, pt-BR, hi, zh-Hans.

**Traduction** de l'interface utilisateur de l'application, des fichiers markdown/JSON de Docusaurus, des actifs SVG et des **modèles de notification par défaut** est gérée par [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) depuis la **racine du dépôt**, configurée dans `ai-i18n-tools.config.json` (pas à l'intérieur de `documentation/`). Définissez `OPENROUTER_API_KEY` lors de l'exécution des commandes de traduction.

## Quand la documentation anglaise change {/* #when-english-documentation-changes */}

1. **Modifier la source** dans `documentation/docs/` (Anglais uniquement).
2. **Chaînes d'interface utilisateur de Docusaurus** (étiquettes de thème, barre de navigation, etc.) : si nécessaire, exécutez `pnpm write-translations` dans `documentation/` afin que `i18n/en/*.json` prenne en charge les nouvelles clés.
3. **Identifiants de titres** : `pnpm write-heading-ids` (à partir de `documentation/`).
4. **Traduire** depuis la **racine du dépôt** (ou utilisez les raccourcis ci-dessous à partir de `documentation/`) :
   - `pnpm i18n:extract` — actualisez `src/locales/strings.json` à partir de `t('…')` dans l'application Next.js.
   - `pnpm i18n:translate:docs` — traduisez les fichiers markdown/JSON en `documentation/i18n/` selon la configuration.
   - `pnpm i18n:translate:svg` — traduisez les SVG sous `documentation/static/img` selon la configuration.
   - `pnpm i18n:translate:json` — traduisez les modèles de notification par défaut dans `src/locales/templates/` à partir de `en-GB.json`.
   - Ou exécutez tout : `pnpm i18n:translate`.
5. **Construisez** : `cd documentation && pnpm build` (toutes les locales).

Depuis l'intérieur de `documentation/`, les mêmes flux sont câblés comme `pnpm translate` → racine `i18n:translate`, plus `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## Pluriels de l'interface utilisateur {/* #ui-plurals */}

Les pluriels cardinaux dans l'application Next.js utilisent **ai-i18n-tools**, et non des clés `_one` / `_other` écrites à la main.

Écrivez une seule chaîne source en anglais (généralement le pluriel) et passez un **littéral d'objet simple** avec `plurals: true` et un `count` numérique :

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

Règles :

- Ne pas utiliser `item(s)` de réserves ou `count === 1 ? t('…') : t('…')` de paires.
- Les **comptes** numériques indépendants nécessitent des appels `t()` séparés — un axe pluriel ne peut pas flexer deux nombres (par exemple 1 réussi et 2 Échec). Concaténez les fragments :

```tsx
`${t("Tested {{count}} connections:", { plurals: true, count: total })} ` +
  `${t("{{count}} successful,", { plurals: true, count: successCount })} ` +
  `${t("{{count}} failed", { plurals: true, count: failureCount })}`
```

- Les interpolations non numériques (noms, étiquettes, etc.) sont acceptables dans la même chaîne de pluriel que `{{count}}`.
- `pnpm i18n:extract` marque la ligne du catalogue `"plural": true`. `pnpm i18n:translate:ui` remplit les formes CLDR et écrit `src/locales/en-GB.json` (clés de pluriel uniquement).
- `src/i18n.ts` et `src/lib/i18n-server.ts` chargent ce fichier comme `sourcePluralFlatBundle` afin que l'anglais singulier/pluriel se résolve à l'exécution.

## Modèles de notification par défaut {/* #default-notification-templates */}

Paramètres → Modèles → **Réinitialiser** charge les valeurs par défaut à partir de `src/locales/templates/{locale}.json` (câblé dans `src/lib/default-notification-templates.ts`).

1. Éditez **`src/locales/templates/en-GB.json`** uniquement (source anglaise).
2. Exécutez **`pnpm i18n:translate:json`** (ou **`pnpm i18n:translate`**) depuis la racine du dépôt.
3. Examinez les différences — les espaces réservés tels que `{backup_name}` et `{problem_table}` doivent rester inchangés ; `priority` et `tags` sont ignorés par `keyPolicy` dans `ai-i18n-tools.config.json`.
4. Exécutez **`pnpm i18n:status`** pour voir la couverture du bloc JSON.

Voir le [guide JSON de ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/guide/json.html) pour les indicateurs (`--locale`, `--force`, etc.).

## Glossaire {/* #glossary */}

- La **terminologie UI** pour la documentation est pilotée par `glossary.uiGlossary` dans `ai-i18n-tools.config.json`, pointant vers `src/locales/strings.json` (le catalogue produit par `pnpm i18n:extract`).
- Les **remplacements** se trouvent dans `documentation/glossary-user.csv` (`glossary.userGlossary` dans la configuration). Consultez la [documentation du glossaire ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) pour le format des colonnes.
- Générer un modèle CSV : `pnpm i18n:glossary-generate` (racine).

## Cache {/* #cache */}

Le cache de traduction pour ai-i18n-tools se trouve sous `.translation-cache/` à la racine du dépôt (`cacheDir` dans `ai-i18n-tools.config.json`). Il est ignoré par git. Utilisez `pnpm i18n:status` et les drapeaux `--force` / cache de la CLI selon la documentation [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) lorsque vous avez besoin d'une actualisation complète.

## ID de titres et ancres {/* #heading-ids-and-anchors */}

Utilisez des ID explicites pour que les liens restent stables entre les langues. Préférez la syntaxe de commentaire MDX (`pnpm write-heading-ids` utilise `--syntax mdx-comment`):

```markdown
## This is a heading {/* #this-is-a-heading */}
```

Placez les ID sur `h2` et en dessous. Docusaurus `write-heading-ids` saute `h1` (le titre de la page/barre latérale). `documentation/docusaurus.config.ts` supprime également les commentaires d'ID de titre des titres inférés, car l'extraction de métadonnées Docusaurus supprime encore uniquement les `{#id}` classiques.

```bash
cd documentation
pnpm write-heading-ids
```

## Listes d'ignorés {/* #ignore-lists */}

Utilisez `.translate-ignore` à la racine du dépôt (même idée que `.gitignore`) pour les chemins que le traducteur de documentation doit ignorer, si vous en ajoutez un pour votre workflow.

## JSON du thème Docusaurus {/* #docusaurus-theme-json */}

`pnpm write-translations` extrait les chaînes UI de Docusaurus en `documentation/i18n/en/`. L'étape **ai-i18n-tools** `translate-docs` (avec `markdownOutput.style: "docusaurus"`) remplit le JSON traduit sous chaque langue aux côtés des fichiers markdown, selon `ai-i18n-tools.config.json`.

## Dépannage {/* #troubleshooting */}

- `OPENROUTER_API_KEY` **non défini** — exportez-le ou ajoutez-le à `.env.local` à la racine du dépôt.
- **Modèle / qualité** — ajustez `openrouter.translationModels` et les options connexes dans `ai-i18n-tools.config.json`.
- **Glossaire** — éditez `documentation/glossary-user.csv` ou régénérez les chaînes UI et relancez l'extraction + traduction.

## Ajout d'une nouvelle langue {/* #adding-a-new-language */}

1. Ajoutez la langue à Docusaurus `i18n.locales` et `localeConfigs` dans `documentation/docusaurus.config.ts`.
2. Ajoutez la même langue à `targetLocales` dans `ai-i18n-tools.config.json` (racine du dépôt).
3. Exécutez `pnpm i18n:generate-ui-languages` à la racine, puis les commandes `pnpm i18n:extract` / traduction selon les besoins.
