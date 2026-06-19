# Flujo de Trabajo de Mantenimiento de Traducciones {#translation-maintenance-workflow}

Para comandos de documentación general (compilación, implementación, capturas de pantalla, generación de README), consulte [Herramientas de documentación](documentation-tools.md).

## Resumen {#overview}

La documentación utiliza i18n de Docusaurus con el inglés como configuración regional Predeterminada. La documentación de origen se encuentra en `docs/`; las traducciones se escriben en `i18n/{locale}/`. Configuraciones regionales compatibles: en (predeterminada), fr, de, es, pt-BR, zh-CN.

**Traducción por IA** para la interfaz de usuario de la aplicación, markdown/JSON de Docusaurus y recursos SVG es manejada por [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) desde la **raíz del repositorio**, configurada en `ai-i18n-tools.config.json` (no dentro de `documentation/`). Establezca `OPENROUTER_API_KEY` al ejecutar comandos de traducción.

## Cuándo cambia la documentación en Español {#when-english-documentation-changes}

1. **Editar fuente** en `documentation/docs/` (solo Español).
2. **Cadenas de interfaz de Docusaurus** (etiquetas de tema, barra de navegación, etc.): si es necesario, ejecutar `pnpm write-translations` en `documentation/` para que `i18n/en/*.json` detecte las nuevas claves.
3. **IDs de encabezados**: `pnpm write-heading-ids` (desde `documentation/`).
4. **Traducir** desde la **raíz del repositorio** (o usar los accesos directos a continuación desde `documentation/`):
   - `pnpm i18n:extract` — actualizar `src/locales/strings.json` desde `t('…')` en la aplicación Next.js.
   - `pnpm i18n:translate:docs` — traducir markdown/JSON a `documentation/i18n/` según la configuración.
   - `pnpm i18n:translate:svg` — traducir SVGs dentro de `documentation/static/img` según la configuración.
   - O ejecutar todo: `pnpm i18n:translate`.
5. **Construir**: `cd documentation && pnpm build` (todos los idiomas).

Desde dentro de `documentation/`, los mismos flujos están conectados como `pnpm translate` → raíz `i18n:translate`, más `pnpm translate:docs`, `translate:ui`, `translate:svg`, `translate:status`, `i18n:extract`, `i18n:sync`.

## Glosario {#glossary}

- **Terminología de la interfaz de usuario** para la documentación está controlada por `glossary.uiGlossary` en `ai-i18n-tools.config.json`, apuntando a `src/locales/strings.json` (el catálogo producido por `pnpm i18n:extract`).
- **Sobrescrituras** se encuentran en `documentation/glossary-user.csv` (`glossary.userGlossary` en la configuración). Consulte la [documentación del glosario de ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) para el formato de columnas.
- Genere una plantilla CSV: `pnpm i18n:glossary-generate` (raíz).

## Caché {#cache}

La caché de traducción para ai-i18n-tools se encuentra en `.translation-cache/` en la raíz del repositorio (`cacheDir` en `ai-i18n-tools.config.json`). Está incluida en .gitignore. Usa `pnpm i18n:status` y las opciones `--force` / caché de la CLI según la documentación de [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) cuando necesites una actualización completa.

## IDs de encabezados y anclas {#heading-ids-and-anchors}

Use IDs explícitos para que los enlaces permanezcan estables entre idiomas:

```markdown
## This is a heading {#this-is-a-heading}
```

```bash
cd documentation
pnpm write-heading-ids
```

## Listas de exclusión {#ignore-lists}

Usa `.translate-ignore` en la raíz del repositorio (misma idea que `.gitignore`) para rutas que el traductor de documentación debe omitir, si agregas una para tu flujo de trabajo.

## Tema JSON de Docusaurus {#docusaurus-theme-json}

`pnpm write-translations` extrae las cadenas de interfaz de usuario de Docusaurus en `documentation/i18n/en/`. El paso `translate-docs` de **ai-i18n-tools** (con `markdownOutput.style: "docusaurus"`) completa los JSON traducidos en cada configuración regional junto con el markdown, según `ai-i18n-tools.config.json`.

## Solución de problemas {#troubleshooting}

- `OPENROUTER_API_KEY` **no establecido** — exporta la variable o añádela a `.env.local` en la raíz del repositorio.
- **Modelo / calidad** — ajusta `openrouter.translationModels` y opciones relacionadas en `ai-i18n-tools.config.json`.
- **Glosario** — edita `documentation/glossary-user.csv` o regenera las cadenas de interfaz y vuelve a ejecutar extract + translate.

## Agregar un nuevo idioma {#adding-a-new-language}

1. Añade la configuración regional a Docusaurus `i18n.locales` y `localeConfigs` en `documentation/docusaurus.config.ts`.
2. Añade la misma configuración regional a `targetLocales` en `ai-i18n-tools.config.json` (raíz del repositorio).
3. Ejecuta `pnpm i18n:generate-ui-languages` en la raíz, luego los comandos `pnpm i18n:extract` / translate según sea necesario.
