---
translation_last_updated: '2026-04-18T00:01:45.134Z'
source_file_mtime: '2026-04-16T19:04:53.276Z'
source_file_hash: 5ab3aefe73273ae2660374b90a091f43326249c300a85e0a531363030a9ca392
translation_language: es
source_file_path: documentation/docs/development/translation-workflow.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
# Flujo de Trabajo de Mantenimiento de Traducciones {#translation-maintenance-workflow}

Para comandos de documentación general (compilación, implementación, capturas de pantalla, generación de README), consulte [Herramientas de documentación](documentation-tools.md).

## Resumen {#overview}

La documentación utiliza Docusaurus i18n con Español como configuración regional predeterminada. La documentación fuente se encuentra en `docs/`; las traducciones se escriben en `i18n/{locale}/`. Configuraciones regionales compatibles: en (por defecto), fr, de, es, pt-BR.

**Traducción por IA** para la interfaz de usuario de la aplicación, markdown/JSON de Docusaurus y recursos SVG es manejada por [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) desde la **raíz del repositorio**, configurada en `ai-i18n-tools.config.json` (no dentro de `documentation/`). Establezca `OPENROUTER_API_KEY` al ejecutar comandos de traducción.

## Cuándo cambia la documentación en Español {#when-english-documentation-changes}

1. **Edite el origen** en `documentation/docs/` (solo Español).
2. **Cadenas de interfaz de usuario de Docusaurus** (etiquetas del tema, barra de navegación, etc.): si es necesario, ejecute `pnpm write-translations` en `documentation/` para que `i18n/en/*.json` detecte las nuevas claves.
3. **IDs de encabezados**: `pnpm write-heading-ids` (desde `documentation/`).
4. **Traduzca** desde la **raíz del repositorio** (o use los accesos directos a continuación desde `documentation/`):
   - `pnpm i18n:extract` — actualizar `src/locales/strings.json` desde `t('…')` en la aplicación Next.js.
   - `pnpm i18n:translate:docs` — traducir markdown/JSON a `documentation/i18n/` según la configuración.
   - `pnpm i18n:translate:svg` — traducir SVGs dentro de `documentation/static/img` según lo configurado.
   - O ejecute todo: `pnpm i18n:translate`.
5. **Compilar**: `cd documentation && pnpm build` (todas las configuraciones regionales).

Desde dentro de `documentation/`, los mismos flujos están conectados como `pnpm translate` → raíz `i18n:translate`, más `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## Glosario {#glossary-management}

- **Terminología de la interfaz de usuario** para la documentación está controlada por `glossary.uiGlossary` en `ai-i18n-tools.config.json`, apuntando a `src/locales/strings.json` (el catálogo producido por `pnpm i18n:extract`).
- **Sobrescrituras** se encuentran en `documentation/glossary-user.csv` (`glossary.userGlossary` en la configuración). Consulte la [documentación del glosario de ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) para el formato de columnas.
- Genere una plantilla CSV: `pnpm i18n:glossary-generate` (raíz).

## Caché {#cache-management}

La caché de traducción para ai-i18n-tools se encuentra en **`.translation-cache/`** en la raíz del repositorio (`cacheDir` en `ai-i18n-tools.config.json`). Está ignorada por git. Use `pnpm i18n:status` y las banderas de `--force` / caché del CLI según la documentación de [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) cuando necesite una actualización completa.

## IDs de encabezados y anclas {#heading-ids-and-anchors}

Use IDs explícitos para que los enlaces permanezcan estables entre idiomas:

```markdown
## This is a heading {#this-is-a-heading}
```

```bash
cd documentation
pnpm write-heading-ids
```

## Listas de exclusión {#ignore-files}

Use **`.translate-ignore`** en la raíz del repositorio (misma idea que `.gitignore`) para rutas que el traductor de documentación debe omitir, si agrega una para su flujo de trabajo.

## JSON del tema de Docusaurus {#ui-strings-translation-json}

`pnpm write-translations` extrae las cadenas de interfaz de usuario de Docusaurus en `documentation/i18n/en/`. El paso `translate-docs` de **ai-i18n-tools** (con `markdownOutput.style: "docusaurus"`) completa los JSON traducidos en cada configuración regional junto con el markdown, según `ai-i18n-tools.config.json`.

## Solución de problemas {#troubleshooting}

- **`OPENROUTER_API_KEY` no establecido** — expórtelo o agréguelo a `.env.local` en la raíz del repositorio.
- **Modelo / calidad** — ajuste `openrouter.translationModels` y opciones relacionadas en `ai-i18n-tools.config.json`.
- **Glosario** — edite `documentation/glossary-user.csv` o regenere las cadenas de interfaz de usuario y vuelva a ejecutar extraer + traducir.

## Agregar un nuevo idioma {#adding-new-languages}

1. Agregue la configuración regional a Docusaurus `i18n.locales` y `localeConfigs` en `documentation/docusaurus.config.ts`.
2. Agregue la misma configuración regional a `targetLocales` en **`ai-i18n-tools.config.json`** (raíz del repositorio).
3. Ejecute `pnpm i18n:generate-ui-languages` en la raíz, luego `pnpm i18n:extract` / comandos de traducción según sea necesario.
