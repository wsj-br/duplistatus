# Flujo de mantenimiento de traducción {/* #translation-maintenance-workflow */}

Para comandos generales de documentación (construcción, despliegue, capturas de pantalla, generación de README), consulte [Herramientas de Documentación](documentation-tools.md).

## Vista general {/* #overview */}

La documentación utiliza Docusaurus i18n con inglés como la configuración regional predeterminada. La documentación fuente se encuentra en `docs/`; las traducciones se escriben bajo `i18n/{locale}/`. Configuraciones regionales admitidas: en-GB (predeterminada), fr, de, es, pt-BR, hi, zh-Hans.

**Traducción de IA** para la interfaz de usuario de la aplicación, documentos de Docusaurus en markdown/JSON, activos SVG y **plantillas de notificación predeterminadas** se gestiona mediante [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) desde la raíz del **repositorio**, configurado en `ai-i18n-tools.config.json` (no dentro de `documentation/`). Establezca `OPENROUTER_API_KEY` al ejecutar comandos de traducción.

## Cuándo cambia la documentación en inglés {/* #when-english-documentation-changes */}

1. **Edite el origen** en `documentation/docs/` (solo inglés).
2. **Cadenas de UI de Docusaurus** (etiquetas de tema, barra de navegación, etc.): si es necesario, ejecute `pnpm write-translations` en `documentation/` para que `i18n/en/*.json` recoja las nuevas claves.
3. **IDs de encabezados**: `pnpm write-heading-ids` (de `documentation/`).
4. **Traduce** desde la **raíz del repositorio** (o use los atajos a continuación desde `documentation/`):
   - `pnpm i18n:extract` — actualice `src/locales/strings.json` desde `t('…')` en la aplicación Next.js.
   - `pnpm i18n:translate:docs` — traduzca markdown/JSON a `documentation/i18n/` según la configuración.
   - `pnpm i18n:translate:svg` — traduzca SVGs bajo `documentation/static/img` según la configuración.
   - `pnpm i18n:translate:json` — traduzca las plantillas de notificación predeterminadas en `src/locales/templates/` desde `en-GB.json`.
   - O ejecute todo: `pnpm i18n:translate`.
5. **Construir**: `cd documentation && pnpm build` (todas las configuraciones regionales).

Desde dentro de `documentation/`, los mismos flujos están conectados como `pnpm translate` → raíz `i18n:translate`, más `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## Plurales de UI {/* #ui-plurals */}

Los plurales cardinales en la aplicación Next.js usan **ai-i18n-tools**, no claves `_one` / `_other` escritas a mano.

Escriba una cadena de origen en inglés (generalmente el plural) y pase un **objeto literal plano** con `plurals: true` y un `count` numérico:

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

Reglas:

- No utilices `item(s)` rodeos ni `count === 1 ? t('…') : t('…')` pares.
- Los recuentos **numéricos** independientes necesitan llamadas `t()` separadas: un solo eje plural no puede flexibilizar dos números (por ejemplo, 1 exitoso y 2 fallidos). Concatena los fragmentos:

```tsx
`${t("Tested {{count}} connections:", { plurals: true, count: total })} ` +
  `${t("{{count}} successful,", { plurals: true, count: successCount })} ` +
  `${t("{{count}} failed", { plurals: true, count: failureCount })}`
```

- Las interpolaciones no numéricas (nombres, etiquetas, etc.) están bien en la misma cadena plural como `{{count}}`.
- `pnpm i18n:extract` marca la fila del catálogo `"plural": true`. `pnpm i18n:translate:ui` llena los formularios CLDR y escribe `src/locales/en-GB.json` (solo claves de plural).
- `src/i18n.ts` y `src/lib/i18n-server.ts` cargan ese archivo como `sourcePluralFlatBundle` para que el singular/plural en inglés se resuelva en tiempo de ejecución.

## Plantillas de notificación predeterminadas {/* #default-notification-templates */}

Configuración → Plantillas → **Restablecer** carga los valores predeterminados desde `src/locales/templates/{locale}.json` (conectado en `src/lib/default-notification-templates.ts`).

1. Edite solo **`src/locales/templates/en-GB.json`** (origen en inglés).
2. Ejecute **`pnpm i18n:translate:json`** (o **`pnpm i18n:translate`**) desde la raíz del repositorio.
3. Revise las diferencias — los marcadores de posición como `{backup_name}` y `{problem_table}` deben mantenerse sin cambios; `priority` y `tags` son omitidos por `keyPolicy` en `ai-i18n-tools.config.json`.
4. Ejecute **`pnpm i18n:status`** para ver la cobertura del bloque JSON.

Consulte la [guía JSON de ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/guide/json.html) para banderas (`--locale`, `--force`, etc.).

## Glosario {/* #glossary */}

- La **terminología de la interfaz de usuario** para la documentación se basa en `glossary.uiGlossary` en `ai-i18n-tools.config.json`, apuntando a `src/locales/strings.json` (el catálogo producido por `pnpm i18n:extract`).
- Las **sobrescripciones** se encuentran en `documentation/glossary-user.csv` (`glossary.userGlossary` en la configuración). Consulte la [documentación del glosario de ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) para el formato de columna.
- Genere una plantilla CSV: `pnpm i18n:glossary-generate` (raíz).

## Caché {/* #cache */}

La caché de traducción para ai-i18n-tools está bajo `.translation-cache/` en la raíz del repositorio (`cacheDir` en `ai-i18n-tools.config.json`). Está ignorada por git. Usa `pnpm i18n:status` y las banderas de caché `--force` de la CLI según la documentación de [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) cuando necesites una actualización completa.

## IDs de encabezados y anclajes {/* #heading-ids-and-anchors */}

Use IDs explícitos para que los enlaces sean estables entre idiomas. Prefiera la sintaxis de comentario MDX (`pnpm write-heading-ids` usa `--syntax mdx-comment`):

```markdown
## This is a heading {/* #this-is-a-heading */}
```

Ponga IDs en `h2` y debajo. Docusaurus `write-heading-ids` omite `h1` (el título de la página/barra lateral). `documentation/docusaurus.config.ts` también elimina los comentarios de heading-id de los títulos inferidos, porque la extracción de metadatos de Docusaurus aún solo elimina los `{#id}` clásicos.

```bash
cd documentation
pnpm write-heading-ids
```

## Listas de ignorar {/* #ignore-lists */}

Use `.translate-ignore` en la raíz del repositorio (misma idea que `.gitignore`) para las rutas que el traductor de documentos debe omitir, si agrega una para su flujo de trabajo.

## JSON del tema Docusaurus {/* #docusaurus-theme-json */}

`pnpm write-translations` extrae las cadenas de interfaz de usuario de Docusaurus en `documentation/i18n/en/`. El paso **ai-i18n-tools** `translate-docs` (con `markdownOutput.style: "docusaurus"`) rellena el JSON traducido bajo cada idioma junto con el markdown, según `ai-i18n-tools.config.json`.

## Solución de problemas {/* #troubleshooting */}

- `OPENROUTER_API_KEY` **no establecido** — exporte o agregue a `.env.local` en la raíz del repositorio.
- **Modelo / calidad** — ajuste `openrouter.translationModels` y las opciones relacionadas en `ai-i18n-tools.config.json`.
- **Glosario** — edite `documentation/glossary-user.csv` o vuelva a generar las cadenas de interfaz de usuario y vuelva a ejecutar extraer + traducir.

## Agregar un nuevo idioma {/* #adding-a-new-language */}

1. Agregue el idioma a Docusaurus `i18n.locales` y `localeConfigs` en `documentation/docusaurus.config.ts`.
2. Agregue el mismo idioma a `targetLocales` en `ai-i18n-tools.config.json` (raíz del repositorio).
3. Ejecute `pnpm i18n:generate-ui-languages` en la raíz, luego los comandos `pnpm i18n:extract` / traducir según sea necesario.
