# Flujo de trabajo de mantenimiento de traducciones {/* #translation-maintenance-workflow */}

Para comandos generales de documentación (compilar, implementar, capturas de pantalla, generación de README), consulte [Herramientas de documentación](documentation-tools.md).

## Vista general {/* #overview */}

La documentación utiliza i18n de Docusaurus con inglés como configuración regional predeterminada. La documentación fuente reside en `docs/`; las traducciones se escriben en `i18n/{locale}/`. Configuraciones regionales admitidas: en-GB (predeterminada), fr, de, es, pt-BR, hi, zh-Hans.

**Traducción por IA** para la interfaz de usuario de la aplicación, markdown/JSON de Docusaurus, recursos SVG y **plantillas de notificación predeterminadas** es manejada por [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) desde la **raíz del repositorio**, configurada en `ai-i18n-tools.config.json` (no dentro de `documentation/`). Establezca `OPENROUTER_API_KEY` al ejecutar comandos de traducción.

Para probar una versión no publicada en la misma máquina (predeterminado `../ai-i18n-tools`), cambie la dependencia con `pnpm i18n:tools --local` o `./scripts/link-ai-i18n-tools.sh --local`. Eso enlaza tanto la CLI (`pnpm i18n:*`) como la importación `ai-i18n-tools/runtime`. Vuelva a compilar el paquete de herramientas después de cambios en la fuente (`pnpm build` en esa versión). Restaure el último paquete npm con `--remote`. No confirme el especificador `link:`.

## Cuándo cambia la documentación en inglés {/* #when-english-documentation-changes */}

1. **Edite la fuente** en `documentation/docs/` (solo inglés).
2. **Cadenas de la interfaz de usuario de Docusaurus** (etiquetas del tema, barra de navegación, etc.): si es necesario, ejecute `pnpm write-translations` en `documentation/` para que `i18n/en/*.json` detecte nuevas claves.
3. **IDs de encabezados**: `pnpm write-heading-ids` (de `documentation/`).
4. **Traduzca** desde la **raíz del repositorio** (o use los accesos directos a continuación desde `documentation/`):
   - `pnpm i18n:extract` — actualice `src/locales/strings.json` desde `t('…')` en la aplicación Next.js.
   - `pnpm i18n:translate:docs` — traduzca markdown/JSON en `documentation/i18n/` según la configuración.
   - `pnpm i18n:translate:svg` — traduzca SVG bajo `documentation/static/img` según esté configurado.
   - `pnpm i18n:translate:json` — traduzca plantillas de notificación predeterminadas en `src/locales/templates/` desde `en-GB.json`.
   - O ejecute todo: `pnpm i18n:translate`.
5. **Compilación**: `cd documentation && pnpm build` (todos los idiomas).

Desde dentro de `documentation/`, los mismos flujos están conectados como `pnpm translate` → raíz `i18n:translate`, más `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## Plurales de la interfaz de usuario {/* #ui-plurals */}

Los plurales cardinales en la aplicación Next.js utilizan **ai-i18n-tools**, no claves `_one` / `_other` escritas manualmente.

Escriba una cadena fuente en inglés (generalmente el plural) y pase un **objeto literal simple** con `plurals: true` y un `count` numérico:

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

Reglas:

- No utilice matices `item(s)` ni pares `count === 1 ? t('…') : t('…')`.
- Las cuentas **numéricas** independientes necesitan llamadas separadas de `t()` — un eje plural no puede adaptar dos números (por ejemplo, 1 exitoso y 2 fallidos). Concatene los fragmentos:

```tsx
`${t("Tested {{count}} connections:", { plurals: true, count: total })} ` +
  `${t("{{count}} successful,", { plurals: true, count: successCount })} ` +
  `${t("{{count}} failed", { plurals: true, count: failureCount })}`
```

- Las interpolaciones no numéricas (nombres, etiquetas, etc.) están bien en la misma cadena plural que `{{count}}`.
- `pnpm i18n:extract` marca la fila del catálogo `"plural": true`. `pnpm i18n:translate:ui` completa formas CLDR y escribe `src/locales/en-GB.json` (solo claves plurales).
- `src/i18n.ts` y `src/lib/i18n-server.ts` cargan ese archivo como `sourcePluralFlatBundle` para que los singulares/plurales en inglés se resuelvan en tiempo de ejecución.

## Plantillas de notificación predeterminadas {/* #default-notification-templates */}

Configuración → Plantillas → **Restablecer** carga valores predeterminados desde `src/locales/templates/{locale}.json` (conectado en `src/lib/default-notification-templates.ts`).

1. Edite solo **`src/locales/templates/en-GB.json`** (fuente en inglés).
2. Ejecute **`pnpm i18n:translate:json`** (o **`pnpm i18n:translate`**) desde la raíz del repositorio.
3. Revise diferencias — los marcadores de posición como `{backup_name}` y `{problem_table}` deben permanecer sin cambios; `priority` y `tags` son omitidos por `keyPolicy` en `ai-i18n-tools.config.json`.
4. Ejecute **`pnpm i18n:status`** para ver la cobertura de bloques JSON.

Consulte la [guía JSON de ai-i18n-tools](https://wsj-br.github.io/ai-i18n-tools/guide/json.html) para indicadores (`--locale`, `--force`, etc.).

## Glosario {/* #glossary */}

- La **terminología de interfaz de usuario** para la documentación está guiada por `glossary.uiGlossary` en `ai-i18n-tools.config.json`, apuntando a `src/locales/strings.json` (el catálogo producido por `pnpm i18n:extract`).
- Las **anulaciones** están en `documentation/glossary-user.csv` (`glossary.userGlossary` en la configuración). Consulte la [documentación de glosario de ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) para el formato de columna.
- Genere una plantilla CSV: `pnpm i18n:glossary-generate` (raíz).

## Caché {/* #cache */}

La caché de traducción para ai-i18n-tools está en `.translation-cache/` en la raíz del repositorio (`cacheDir` en `ai-i18n-tools.config.json`). Está excluida de git. Utilice `pnpm i18n:status` y las banderas de `--force` / caché de la CLI según la documentación de [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) cuando necesite una actualización completa.

## IDs de encabezado y anclajes {/* #heading-ids-and-anchors */}

Utilice IDs explícitos para que los enlaces permanezcan estables entre idiomas. Prefiera la sintaxis de comentario MDX (`pnpm write-heading-ids` usa `--syntax mdx-comment`):

```markdown
## This is a heading {/* #this-is-a-heading */}
```

Coloque IDs en `h2` y niveles inferiores. Docusaurus `write-heading-ids` omite `h1` (el título de página/barra lateral). `documentation/docusaurus.config.ts` también elimina comentarios de ID de encabezado de títulos inferidos, porque la extracción de metadatos de Docusaurus aún solo elimina `{#id}` clásicos.

```bash
cd documentation
pnpm write-heading-ids
```

## Listas de exclusión {/* #ignore-lists */}

Utilice `.translate-ignore` en la raíz del repositorio (misma idea que `.gitignore`) para rutas que el traductor de documentación debería omitir, si agrega uno para su flujo de trabajo.

## JSON de tema Docusaurus {/* #docusaurus-theme-json */}

`pnpm write-translations` extrae cadenas de interfaz de usuario de Docusaurus en `documentation/i18n/en/`. El paso **ai-i18n-tools** `translate-docs` (con `markdownOutput.style: "docusaurus"`) rellena JSON traducido bajo cada configuración regional junto al markdown, según `ai-i18n-tools.config.json`.

## Solución de problemas {/* #troubleshooting */}

- `OPENROUTER_API_KEY` **no establecido** — expórtelo o añádalo a `.env.local` en la raíz del repositorio.
- **Modelo / calidad** — ajuste `openrouter.translationModels` y opciones relacionadas en `ai-i18n-tools.config.json`.
- **Glosario** — edite `documentation/glossary-user.csv` o regenere cadenas de interfaz de usuario y vuelva a ejecutar extract + translate.

## Añadir un nuevo idioma {/* #adding-a-new-language */}

1. Añada la configuración regional a Docusaurus `i18n.locales` y `localeConfigs` en `documentation/docusaurus.config.ts`.
2. Añada la misma configuración regional a `targetLocales` en `ai-i18n-tools.config.json` (raíz del repositorio).
3. Ejecute `pnpm i18n:generate-ui-languages` en la raíz, luego `pnpm i18n:extract` / comandos de traducción según sea necesario.
