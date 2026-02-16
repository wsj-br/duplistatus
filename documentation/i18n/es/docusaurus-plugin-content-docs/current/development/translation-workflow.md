---
translation_last_updated: '2026-02-16T02:21:39.359Z'
source_file_mtime: '2026-02-16T00:30:39.430Z'
source_file_hash: f6b2901b63a4b18c
translation_language: es
source_file_path: development/translation-workflow.md
---
# Flujo de Trabajo de Mantenimiento de Traducciones {#translation-maintenance-workflow}

Para comandos de documentación general (compilación, implementación, capturas de pantalla, generación de README), consulte [Herramientas de documentación](documentation-tools.md).

## Resumen {#overview}

La documentación utiliza Docusaurus i18n con inglés como la configuración regional por defecto. La documentación fuente se encuentra en `docs/`; las traducciones se escriben en `i18n/{locale}/docusaurus-plugin-content-docs/current/`. Configuraciones regionales admitidas: en (por defecto), fr, de, es, pt-BR.

## Cuándo Cambia la Documentación en Inglés {#when-english-documentation-changes}

1. **Actualizar archivos de origen** en `docs/`
2. **Ejecutar extracción** (si cambian las cadenas de la interfaz de Docusaurus): `pnpm write-translations`
3. **Actualizar glosario** (si cambian las traducciones de intlayer): `pnpm translate:glossary-ui`
4. **Añadir los IDs de Encabezado**: `pnpm heading-ids`
5. **Ejecutar traducción con IA**: `pnpm translate` (traduce documentos, cadenas de interfaz JSON y SVGs; use `--no-svg` solo para documentos, `--no-json` para omitir cadenas de interfaz)
6. **Cadenas de interfaz** (si cambia Docusaurus): `pnpm write-translations` extrae nuevas claves; documentos, cadenas de interfaz JSON y SVGs son traducidos por los scripts de IA anteriores
7. **Probar compilaciones**: `pnpm build` (compila todos los idiomas)
8. **Desplegar**: Use su proceso de despliegue (por ejemplo, `pnpm deploy` para GitHub Pages)

<br/>

## Añadir Nuevos Idiomas {#adding-new-languages}

1. Añadir idioma a `docusaurus.config.ts` en el array `i18n.locales`
2. Añadir configuración de idioma en el objeto `localeConfigs`
3. Actualizar el array de idiomas del complemento de búsqueda (use el código de idioma apropiado, por ejemplo, `pt` para pt-BR)
4. Añadir idioma a `translate.config.json` en `locales.targets` (para traducción con IA)
5. Ejecutar traducción con IA: `pnpm translate` (traduce documentos, cadenas de interfaz JSON y SVG)
6. Crear archivos de traducción de interfaz: `pnpm write-translations` (genera estructura); traducir documentos, cadenas de interfaz JSON y SVG con `pnpm translate`

<br/>

## Traducción con IA {#ai-powered-translation}

El proyecto incluye un sistema de traducción automatizada que utiliza la API de OpenRouter y que puede traducir documentación al francés, alemán, español y portugués brasileño con almacenamiento en caché inteligente y aplicación de glosario.

### Requisitos previos {#prerequisites}

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

Para ver un resumen de todos los comandos de traducción y las opciones del script de traducción:

   ```bash
   pnpm help
   # or
   pnpm translate:help
   ```

### Uso Básico {#basic-usage}

**Traducir toda la documentación a todas las configuraciones regionales:**

      ```bash
      cd documentation
      pnpm translate
      ```

**Traducir a una configuración regional específica:**

      ```bash
      pnpm translate --locale fr    # French
      pnpm translate --locale de    # German
      pnpm translate --locale es    # Spanish
      pnpm translate --locale pt-br # Brazilian Portuguese
      ```

**Traducir un archivo o directorio específico:**

      ```bash
      pnpm translate --path docs/intro.md
      pnpm translate --path docs/development/
      ```

**Vista previa sin realizar cambios (ejecución en seco):**

      ```bash
      pnpm translate --dry-run
      ```

### Configuración del Modelo {#model-configuration}

El sistema de traducción utiliza modelos configurados en `translate.config.json`, uno principal y uno de respaldo.

| Configuración | Notas                               | Modelo por Defecto           |
|---------------|-------------------------------------|------------------------------|
| defaultModel  | Modelo principal para traducciones  | `anthropic/claude-3.5-haiku` |
| fallbackModel | Respaldo usado si falla el modelo principal | `anthropic/claude-haiku-4.5` |

Verifique la lista de todos los modelos disponibles y sus costos asociados en la [página de Openrouter.ai](https://openrouter.ai/models)

### Probar la Calidad de la Traducción {#testing-the-quality-of-the-translation}

Para probar la calidad de un nuevo modelo, cambie el `defaultModel` en `translate.config.json` y ejecute la traducción para un archivo, por ejemplo:

```bash
pnpm translate --force --path docs/intro.md --no-cache --locale pt-BR
```

y verifique el archivo traducido en `i18n/pt-BR/docusaurus-plugin-content-docs/current/intro.md`

### Omitir Archivos {#ignore-files}

Añada los archivos a omitir durante la traducción con IA en el archivo `.translate-ignore` (con el mismo estilo de `.gitignore`).

Ejemplo:

```bash
# Documentation files
# Keep the license in English
LICENSE.md

# Don't translate the API reference
api-reference/*

# Dashboard/table diagram - not referenced in docs
duplistatus_dash-table.svg
```

### Gestión de Glosario {#glossary-management}

El glosario de terminología se genera automáticamente a partir de los diccionarios de intlayer para mantener la coherencia entre las traducciones de la interfaz de usuario de la aplicación y la documentación.

#### Generando el Glosario {#generating-the-glossary}

```bash
cd documentation
pnpm translate:glossary-ui
```

Este script:

- Ejecuta `pnpm intlayer build` en la raíz del proyecto para generar diccionarios
- Extrae terminología de archivos `.intlayer/dictionary/*.json`
- Genera `glossary-ui.csv`
- Actualiza la tabla de glosario en `CONTRIBUTING-TRANSLATIONS.md` (si ese archivo existe)

#### Cuándo Regenerar {#when-to-regenerate}

- Después de actualizar las traducciones de intlayer en la aplicación
- Cuándo se agregan nuevos términos técnicos a la aplicación
- Antes del trabajo de traducción importante para garantizar la coherencia

#### Anulaciones de Glosario de Usuario {#user-glossary-overrides}

`glossary-user.csv` le permite anular o añadir términos sin modificar el glosario de interfaz generado. Formato: `en`, `locale`, `translation` (una fila por término por configuración regional). Use `*` como configuración regional para aplicar un término a todas las configuraciones regionales configuradas. Las entradas tienen prioridad sobre `glossary-ui.csv`.

### Gestión de Caché {#cache-management}

El sistema de traducción utiliza una caché de dos niveles (nivel de archivo y nivel de segmento) almacenada en `.translation-cache/cache.db` para minimizar los costos de API. Este archivo se incluye en el repositorio Git para reducir los costos de traducción futuros.

Comandos de Gestión de Caché:

| Comando                                 | Descripción                                                           |
|-----------------------------------------|-----------------------------------------------------------------------|
| `pnpm translate --clear-cache <locale>` | Borrar caché para una locale específica                                       |
| `pnpm translate --clear-cache`          | Borrar **todos** los cachés (archivo y segmento)                           |
| `pnpm translate --force`                | Forzar re-traducción (borra caché de archivo, mantiene caché de segmento)         |
| `pnpm translate --no-cache`             | Omitir caché completamente (forzar llamadas API, aún guarda nuevas traducciones) |
| `pnpm translate:editor`             | Revisión manual, eliminar o editar entradas de caché                           |

### Eliminar caché huérfana y obsoleta {#remove-orphaned-and-stale-cache}

Cuando se realizan cambios en documentos existentes, las entradas de caché pueden quedar huérfanas u obsoletas. Use los comandos para eliminar entradas que ya no son necesarias, reduciendo el tamaño de la caché de traducción.

```bash
pnpm translate --force
pnpm translate:cleanup
```

:::warning
Antes de ejecutar el script de limpieza, asegúrese de haber ejecutado `pnpm translate --force`. Este paso es crucial para evitar eliminar accidentalmente entradas válidas que están marcadas como obsoletas.

El script crea automáticamente una copia de seguridad en la carpeta `.translation-cache`, lo que le permite recuperar cualquier dato eliminado si es necesario.
:::

<br/>

### Revisión manual de la caché {#manual-review-of-the-cache}

Al revisar traducciones, use la herramienta de edición de caché basada en web para ver traducciones de términos específicos, eliminar entradas de caché, eliminar entradas usando los filtros disponibles o eliminar archivos específicos. Esto le permite volver a traducir solo los textos o archivos deseados.

Por ejemplo, si un modelo ha traducido un término incorrectamente, puede filtrar todas las entradas para ese término, cambiar el modelo en el archivo `translate.config.json` y volver a traducir solo las líneas que contienen esos términos utilizando el nuevo modelo.

```bash
pnpm translate:editor
```

Esto abrirá una interfaz web para navegar y editar la caché manualmente (puerto 4000 o 4000+), para que pueda:
   - Vista de tabla con capacidades de filtrado
   - Edición en línea de texto traducido
   - Eliminar una entrada única, traducciones para un archivo específico o entradas filtradas
   - Imprimir rutas de archivos de origen y traducidos en la terminal para un acceso rápido al editor

![Translate Edit-Cache App](/img/screenshot-translate-edit-cache.png)

<br/>

### IDs y Anclajes de Encabezados {#heading-ids-and-anchors}

Los enlaces de anclaje (IDs) consistentes son cruciales para referencias cruzadas, tabla de contenidos y enlaces profundos. Cuando el contenido se traduce, el texto del encabezado cambia, lo que normalmente haría que los IDs de anclaje generados automáticamente difieran entre idiomas.

```markdown
 ## This is a Heading {#this-is-a-heading}
```

Después de actualizar o crear un nuevo archivo fuente en inglés, ejecute esto para asegurar IDs explícitos:

```bash
cd documentation
pnpm heading-ids   # Adds {#id} to all headings without explicit IDs
```

:::note
Utilice siempre el ID generado al hacer referencias cruzadas entre secciones de la documentación.
:::

<br/>

### Traducción de SVG {#svg-translation}

La traducción de SVG está incluida en `pnpm translate` por defecto (se ejecuta después de los documentos). Se traducen los archivos SVG en `static/img/` cuyos nombres comienzan con `duplistatus`.

**Omitir SVG** (solo documentación):

```bash
pnpm translate --no-svg
```

**Solo SVG** (script independiente):

```bash
pnpm translate:svg
```

Opciones: `--locale`, `--path`, `--dry-run`, `--no-cache`, `--force`, `--no-export-png`. Usa `.translate-ignore` para exclusiones.

<br/>

### Traducción de Cadenas de Interfaz de Usuario (JSON) {#ui-strings-translation-json}

Las cadenas de interfaz de usuario de Docusaurus y las etiquetas de componentes personalizados se almacenan en archivos de traducción JSON. Estos se generan automáticamente con `pnpm write-translations` y luego son traducidos por el sistema de IA.

**Cómo funciona:**

1. **Extracción**: `pnpm write-translations` escanea archivos de tema de Docusaurus y componentes React personalizados en busca de cadenas traducibles (como "Siguiente", "Anterior", "Buscar", etiquetas de botones) y las escribe en `i18n/en/` como archivos JSON. Cada archivo corresponde a un complemento o tema de Docusaurus.
2. **Traducción**: `pnpm translate` (con soporte JSON habilitado) traduce estos archivos JSON a todos los idiomas de destino usando el modelo de IA, respetando el glosario.
3. **Uso**: Docusaurus carga automáticamente los archivos JSON del idioma apropiado en tiempo de ejecución para mostrar la interfaz de usuario en el idioma seleccionado.

**Archivos JSON clave** (todos en `i18n/{locale}/`):
- `docusaurus-plugin-content-docs/current.json` - Cadenas de interfaz de usuario de documentación (búsqueda, navegación, tabla de contenidos)
- `docusaurus-theme-classic/navbar.json` - Elementos de la barra de navegación
- `docusaurus-theme-classic/footer.json` - Elementos de pie de página
- `code.json` - Etiquetas de bloque de código (copiar, contraer, expandir)
- Otros archivos JSON específicos de complementos

**Omitir traducción JSON** (solo documentos):

```bash
pnpm translate --no-json
```

**Importante**: Las cadenas de interfaz de usuario suelen ser estables, pero si agrega nuevos componentes personalizados con texto traducible, debe ejecutar `pnpm write-translations` para extraer esas nuevas cadenas antes de ejecutar `pnpm translate`. De lo contrario, las nuevas cadenas solo aparecerán en inglés para todos los idiomas.

<br/>

El comando `translate` registra toda la salida de consola y el tráfico de API en archivos en el directorio `.translation-cache/`. Los logs incluyen:

- `translate_<timestamp>.log`: Un log completo de la salida del comando `pnpm translate`.
- `debug-traffic-<timestamp>.log`: Un log de todo el tráfico enviado y recibido del modelo de IA.

Tenga en cuenta que el tráfico de API solo se registra cuando los segmentos se envían a la API. 
   Si todos los segmentos se recuperan de la caché (por ejemplo, al usar la opción `--force`, que 
   sobrescribe la caché de archivos, pero no la caché de traducciones), no se realizan llamadas API, y 
   el log solo contendrá un encabezado y una nota.

Para forzar llamadas API y capturar el tráfico de solicitud/respuesta, 
   use la opción `--no-cache`.

<br/>

## Flujo de Trabajo con Traducción de IA {#workflow-with-ai-translation}

1. **Actualizar documentación en inglés** en `docs/`
2. **Actualizar glosario** (si es necesario): `pnpm translate:glossary-ui` y `glossary-user.csv`.
3. **Actualizar los IDs de encabezados**: `pnpm headings-ids`
4. **Ejecutar traducción de IA**: `pnpm translate` (traduce docs, json y SVGs)
5. **Verificar** traducciones en `i18n/{locale}/docusaurus-plugin-content-docs/current/` (opcional)
6. **Probar compilaciones**: `pnpm build`
7. **Desplegar** usando su proceso de implementación

<br/>

## Solución de problemas {#troubleshooting}

**"OPENROUTER_API_KEY no establecido"**

- Exportar la variable de entorno o añadir a `.env.local`

**Problemas de calidad de traducción**

- Probar un modelo diferente en `translate.config.json`
- Eliminar entradas en la caché y usar otro modelo
- Revisar el documento en inglés y reescribirlo para hacer la traducción más clara
- Añadir más términos a `glossary-ui.csv` o añadir reemplazos a `glossary-user.csv` (en, locale, traducción)

**Corrupción de caché**

- Ejecute `pnpm translate --clear-cache` para restablecer
- Ejecute `pnpm translate:cleanup` para eliminar entradas huérfanas
- Use `pnpm translate:editor` para corregir/eliminar traducciones en caché individuales sin re-traducir el documento completo

**Depuración del tráfico de OpenRouter**

- Los logs se escriben en `.translation-cache/debug-traffic-<timestamp>.log`. 
- Use este log para verificar si el problema de traducción está relacionado con el script, los avisos utilizados o el modelo.

## Seguimiento del Estado de Traducción {#translation-status-tracking}

Realice un seguimiento del progreso de la traducción con:

```bash
pnpm translate:status
```

Esto genera una tabla que muestra el estado de traducción para todos los archivos de documentación. Por ejemplo:

![Translate Status](/img/screenshot-translate-status.png)
