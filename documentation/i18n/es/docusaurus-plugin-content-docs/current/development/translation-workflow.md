---
translation_last_updated: '2026-02-05T19:08:50.752Z'
source_file_mtime: '2026-02-05T19:05:51.758Z'
source_file_hash: c84ad8472108cfb5
translation_language: es
source_file_path: development/translation-workflow.md
---
# Flujo de trabajo de mantenimiento de traducción

Para comandos de documentación general (compilación, implementación, capturas de pantalla, generación de README), consulte [Herramientas de documentación](documentation-tools.md).

## Resumen

La documentación utiliza Docusaurus i18n con inglés como la configuración regional por defecto. La documentación fuente se encuentra en `docs/`; las traducciones se escriben en `i18n/{locale}/docusaurus-plugin-content-docs/current/`. Configuraciones regionales admitidas: en (por defecto), fr, de, es, pt-BR.

## Cuándo la Documentación en Inglés Cambia

1. **Actualizar archivos de origen** en `docs/`
2. **Ejecutar extracción** (si cambian las cadenas de la interfaz de Docusaurus): `pnpm write-translations`
3. **Actualizar glosario** (si cambian las traducciones de intlayer): `pnpm run translate:glossary-ui`
4. **Ejecutar traducción con IA**: `pnpm run translate` (traduce documentos y SVG; use `--no-svg` solo para documentos)
5. **Cadenas de interfaz de usuario** (si cambia Docusaurus): `pnpm write-translations` extrae nuevas claves; los documentos y SVG son traducidos por los scripts de IA anteriores
6. **Probar compilaciones**: `pnpm build` (compila todos los locales)
7. **Implementar**: Use su proceso de implementación (por ejemplo, `pnpm deploy` para GitHub Pages)

## Agregar nuevos idiomas

1. Añadir idioma a `docusaurus.config.ts` en el array `i18n.locales`
2. Añadir configuración de idioma en el objeto `localeConfigs`
3. Actualizar el array `language` del plugin de búsqueda (utilizar el código de idioma apropiado, p. ej. `pt` para pt-BR)
4. Añadir idioma a `translate.config.json` en `locales.targets` (para traducción con IA)
5. Ejecutar traducción con IA: `pnpm run translate` (traduce documentos y SVG)
6. Crear archivos de traducción de interfaz: `pnpm write-translations` (genera la estructura); traducir documentos y SVG con `pnpm run translate`

## Ignorar Archivos

- **`.translate-ignore`**: Patrones al estilo Gitignore para archivos a omitir durante la traducción con IA. Incluye tanto archivos de documentación (rutas relativas a `docs/`) como archivos SVG (nombres base en `static/img/`). Ejemplos: `api-reference/*`, `LICENSE.md`, `duplistatus_logo.svg`

## Gestión de Glosario

El glosario de terminología se genera automáticamente a partir de los diccionarios de intlayer para mantener la coherencia entre las traducciones de la interfaz de usuario de la aplicación y la documentación.

### Generación del Glosario

```bash
cd documentation
pnpm run translate:glossary-ui
```

Este script:

- Ejecuta `pnpm intlayer build` en la raíz del proyecto para generar diccionarios
- Extrae terminología de archivos `.intlayer/dictionary/*.json`
- Genera `glossary-ui.csv`
- Actualiza la tabla de glosario en `CONTRIBUTING-TRANSLATIONS.md` (si ese archivo existe)

### Cuándo Regenerar

- Después de actualizar las traducciones de intlayer en la aplicación
- Cuándo se agregan nuevos términos técnicos a la aplicación
- Antes del trabajo de traducción importante para garantizar la coherencia

### Anulaciones de Glosario de Usuario

`glossary-user.csv` le permite anular o añadir términos sin modificar el glosario de interfaz generado. Formato: `en`, `locale`, `translation` (una fila por término por configuración regional). Las entradas tienen prioridad sobre `glossary-ui.csv`.

## Traducción Impulsada por IA

El proyecto incluye un sistema de traducción automatizada que utiliza la API de OpenRouter y que puede traducir documentación al francés, alemán, español y portugués brasileño con almacenamiento en caché inteligente y aplicación de glosario.

### Requisitos previos

1. **Clave API de OpenRouter**: Establezca la variable de entorno `OPENROUTER_API_KEY`:

   ```bash
   export OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

2. **Instalar dependencias**: Las dependencias se encuentran en `package.json`. Instale con:

   ```bash
   cd documentation
   pnpm install
   ```

3. **Configuración**: El archivo `translate.config.json` contiene la configuración por defecto. Puede personalizar modelos, configuraciones regionales y rutas según sea necesario.

### Ayuda Rápida

Para ver un resumen de todos los comandos de traducción y las opciones del script de traducción:

```bash
pnpm run help
# or
pnpm run translate:help
```

Esto muestra `TRANSLATION-HELP.md`.

### Uso básico

**Traducir toda la documentación a todas las configuraciones regionales:**

```bash
cd documentation
pnpm run translate
```

**Traducir a una configuración regional específica:**

```bash
pnpm run translate --locale fr    # French
pnpm run translate --locale de    # German
pnpm run translate --locale es    # Spanish
pnpm run translate --locale pt-br # Brazilian Portuguese
```

**Traducir un archivo o directorio específico:**

```bash
pnpm translate --path docs/intro.md
pnpm translate --path docs/development/
```

**Vista previa sin realizar cambios (ejecución en seco):**

```bash
pnpm run translate:dry-run
```

### Logs de salida

Tanto `translate` como `translate:svg` escriben todos los resultados de la consola en archivos de registro en `.translation-cache/`:

- `translate_<timestamp>.log` – salida completa de `pnpm run translate`
- `translate-svg_<timestamp>.log` – salida completa de `pnpm run translate:svg` (independiente)

La ruta de los logs se imprime al inicio de cada ejecución. Los logs se añaden en tiempo real.

### Gestión de Caché

El sistema de traducción utiliza una caché de dos niveles (nivel de archivo y nivel de segmento) almacenada en `.translation-cache/cache.db` para minimizar los costos de API:

**Verificar estado de traducción:**

```bash
pnpm run translate:status
```

Esto genera una tabla que muestra el estado de traducción de todos los archivos de documentación:

- `✓` = Traducido y actualizado (el hash de la fuente coincide)
- `-` = Aún no traducido
- `●` = Traducido pero desactualizado (el archivo fuente cambió)
- `□` = Huérfano (existe en la carpeta de traducción pero no en la fuente)
- `i` = Ignorado (omitido por `.translate-ignore`)

El script compara `source_file_hash` en la portada del archivo traducido con el hash calculado del archivo fuente para detectar traducciones desactualizadas.

**Limpiar todos los cachés:**

```bash
pnpm translate --clear-cache
```

**Limpiar caché para una configuración regional específica:**

```bash
pnpm translate --clear-cache fr
```

**Forzar re-traducción (limpiar caché de archivo, no la caché de traducciones):**

```bash
pnpm translate --force
```

**Ignorar caché (forzar llamadas API, pero aún persistir nuevas traducciones):**

```bash
pnpm translate --no-cache
```

**Limpiar caché (eliminar entradas huérfanas y obsoletas):**

```bash
pnpm run translate:cleanup
```

o

```bash
pnpm run translate:clean
```

**Editar caché en una interfaz web:**

```bash
pnpm run translate:edit-cache
```

Esto sirve una aplicación web en el puerto 4000 (o el siguiente disponible) para examinar y editar la caché de traducción. Características: vista de tabla con filtros (nombre de archivo, configuración regional, source_hash, source_text, translated_text), edición en línea de texto traducido, eliminar entrada única, eliminar todas las traducciones de una ruta de archivo, paginación, tema oscuro. Un icono mostrar-enlaces imprime las rutas de archivos de origen y traducidos en la terminal para que pueda abrirlos en su editor. Ejecutar desde `documentation/`.

### Traducción SVG

La traducción de SVG se incluye en `pnpm run translate` por defecto (se ejecuta después de docs). Los archivos SVG en `static/img/` cuyos nombres comienzan con `duplistatus` se traducen.

**Omitir SVG** (solo documentación):

```bash
pnpm run translate --no-svg
```

**Solo SVG** (script independiente):

```bash
pnpm run translate:svg
```

Opciones: `--locale`, `--path`, `--dry-run`, `--no-cache`, `--force`, `--no-export-png`. Utiliza `.translate-ignore` para exclusiones. Opcionalmente exporta PNG a través de Inkscape CLI.

### Flujo de trabajo con traducción de IA

1. **Actualizar documentación en inglés** en `docs/`
2. **Actualizar glosario** (si es necesario): `pnpm run translate:glossary-ui`
3. **Ejecutar traducción con IA**: `pnpm run translate` (traduce documentos y SVG)
4. **Verificar** traducciones en `i18n/{locale}/docusaurus-plugin-content-docs/current/` (opcional)
5. **Probar compilaciones**: `pnpm build`
6. **Implementar** usando su proceso de implementación

### Selección de Modelo y Optimización de Costos

La configuración por defecto utiliza `anthropic/claude-haiku-4.5`. Puede modificar `translate.config.json` para utilizar diferentes modelos:

- **Por defecto**: `anthropic/claude-haiku-4.5`
- **Alternativa**: `google/gemma-3-27b-it`
- **Alto rendimiento**: `anthropic/claude-sonnet-4`
- **Económico**: `openai/gpt-4o-mini`

**Estrategia de optimización de costos:**

1. Primer paso: Utilizar modelo más económico (`gpt-4o-mini`) para la traducción inicial
2. Paso de calidad: Re-traducir archivos problemáticos con `claude-sonnet-4` si es necesario

### Solución de problemas

**"OPENROUTER_API_KEY no establecido"**

- Exportar la variable de entorno o añadir a `.env.local`

**Errores de límite de velocidad**

- El sistema incluye retrasos automáticos, pero es posible que deba reducir las solicitudes paralelas

**Problemas de calidad de traducción**

- Probar un modelo diferente en `translate.config.json`
- Añadir más términos a `glossary-ui.csv` o añadir anulaciones a `glossary-user.csv` (en, configuración regional, traducción)

**Corrupción de caché**

- Ejecute `pnpm translate --clear-cache` para restablecer
- Ejecute `pnpm run translate:cleanup` para eliminar entradas huérfanas
- Use `pnpm run translate:edit-cache` para editar traducciones en caché individuales sin volver a traducir

**Depuración del tráfico de OpenRouter**

- El registro de tráfico de depuración está **activado por defecto**. Los logs se escriben en `.translation-cache/debug-traffic-<timestamp>.log`. Utilice `--debug-traffic <path>` para especificar un nombre de archivo personalizado, o `--no-debug-traffic` para desactivar. Las claves API nunca se escriben.
- El tráfico se registra **solo cuando se envían segmentos a la API**. Si todos los segmentos se sirven desde la caché (por ejemplo, al usar `--force`, que borra la caché de archivos pero no la caché de segmentos), no se realizan llamadas a la API y el log solo contendrá un encabezado y una nota. Utilice `--no-cache` para forzar llamadas a la API y capturar el tráfico de solicitud/respuesta. Las nuevas traducciones de una ejecución con `--no-cache` se siguen escribiendo en la caché para futuras ejecuciones.
- Ejemplo: `pnpm run translate -- --locale pt-BR --debug-traffic my-debug.log --no-cache`

## Seguimiento del Estado de Traducción

Realice un seguimiento del progreso de la traducción con:

```bash
pnpm run translate:status
```

Esto genera una tabla y un resumen para todos los archivos de documentación.
