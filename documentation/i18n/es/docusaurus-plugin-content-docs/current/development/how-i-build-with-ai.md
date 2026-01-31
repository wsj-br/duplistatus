---
translation_last_updated: '2026-01-31T00:51:26.482Z'
source_file_mtime: '2026-01-31T00:39:06.593Z'
source_file_hash: 6f3eb23dd0d60ee8
translation_language: es
source_file_path: development/how-i-build-with-ai.md
---
# Cómo construí esta aplicación utilizando herramientas de IA {#how-i-build-this-application-using-ai-tools}

# Motivación {#motivation}

Comencé a utilizar Duplicati como herramienta de backup para mis servidores domésticos. Probé el [Panel de control oficial de Duplicati](https://app.duplicati.com/) y [Duplicati Monitoring](https://www.duplicati-monitoring.com/), pero tenía dos requisitos principales: (1) auto-hospedado; y (2) una API expuesta para integración con [Homepage](https://gethomepage.dev/), ya que la utilizo para la página de inicio de mi laboratorio doméstico.

También intenté conectarme directamente a cada servidor Duplicati en la red, pero el método de autenticación no era compatible con Homepage (o no fui capaz de configurarlo correctamente).

Como también estaba experimentando con herramientas de código impulsadas por IA, decidí intentar usar IA para construir esta herramienta. Este es el proceso que utilicé...

# Herramientas utilizadas {#tools-used}

1. Para la interfaz de usuario: [Google's Firebase Studio](https://firebase.studio/)
2. Para la implementación: Cursor (https://www.cursor.com/)

:::note
Utilicé Firebase para la interfaz de usuario, pero también puede usar [v0.app](https://v0.app/) o cualquier otra herramienta para generar el prototipo. Utilicé Cursor para generar la implementación, pero puede usar otras herramientas, como VS Code/Copilot, Windsurf, ...
:::

# IU {#ui}

Creé un nuevo proyecto en [Firebase Studio](https://studio.firebase.google.com/) y utilicé este mensaje en la función "Prototype an app with AI":

> Una aplicación de panel de control web que utiliza tailwind/react para consolidar en una base de datos sqllite3 los resultados de backup enviados por la solución de backup duplicati utilizando la opción --send-http-url (formato json) de varias máquinas, manteniendo un seguimiento del estado del backup, tamaño y tamaños cargados.
> 
> La primera página del panel de control debe tener una tabla con el último backup de cada máquina, incluyendo el nombre de la máquina, número de backups almacenados en la base de datos, el estado del último backup, duración (hh:mm:ss), número de advertencias y errores.
> 
> Al hacer clic en una línea de máquina, mostrar una página de detalles de la máquina seleccionada con una lista de los backups almacenados (paginados), incluyendo el nombre de backup, fecha y hora del backup, incluyendo cuánto tiempo hace que se realizó, el estado, número de advertencias y errores, número de archivos, el tamaño de los archivos, tamaño cargado y el tamaño total del almacenamiento. También incluir en la página de detalles un gráfico utilizando Tremor con la evolución de los campos: tamaño cargado; duración en minutos, número de archivos examinados, tamaño de los archivos examinados. El gráfico debe mostrar un campo a la vez, con un cuadro desplegable para seleccionar el campo deseado a mostrar. Además, el gráfico debe presentar todos los backups almacenados en la base de datos, no solo los que se muestran en la tabla paginada.
> 
> La aplicación debe exponer un endpoint de api para recibir los posts del servidor duplicati y otro endpoint de api para recuperar todos los detalles del último backup de una máquina como json.
> 
> El diseño debe ser moderno, responsivo e incluir iconos y otras ayudas visuales para facilitar la lectura. El código debe ser limpio, conciso y fácil de mantener. Utilice herramientas modernas como pnpm para gestionar las dependencias.
> 
> La aplicación debe tener un tema seleccionable oscuro y claro.
> 
> La base de datos debe almacenar estos campos recibidos por el json de duplicati:

```json
"{ "Data": { "DeletedFiles": 0, "DeletedFolders": 0, "ModifiedFiles": 0, "ExaminedFiles": 15399, "OpenedFiles": 1861, "AddedFiles": 1861, "SizeOfModifiedFiles": 0, "SizeOfAddedFiles": 13450481, "SizeOfExaminedFiles": 11086692615, "SizeOfOpenedFiles": 13450481, "NotProcessedFiles": 0, "AddedFolders": 419, "TooLargeFiles": 0, "FilesWithError": 0, "ModifiedFolders": 0, "ModifiedSymlinks": 0, "AddedSymlinks": 0, "DeletedSymlinks": 0, "PartialBackup": false, "Dryrun": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "EndTime": "2025-04-21T23:46:38.3568274Z", "BeginTime": "2025-04-21T23:45:46.9712217Z", "Duration": "00:00:51.3856057", "WarningsActualLength": 0, "ErrorsActualLength": 0, "BackendStatistics": { "BytesUploaded": 8290314, "BytesDownloaded": 53550393, "KnownFileSize": 9920312634, "LastBackupDate": "2025-04-22T00:45:46+01:00", "BackupListCount": 6, "ReportedQuotaError": false, "ReportedQuotaWarning": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "BeginTime": "2025-04-21T23:45:46.9712252Z", "Duration": "00:00:00", "WarningsActualLength": 0, "ErrorsActualLength": 0 } }, "Extra": { "OperationName": "Backup", "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", "machine-name": "WSJ-SER5", "backup-name": "WSJ-SER5 Local files", "backup-id": "DB-2" } } "
```

esto generó un App Blueprint, que luego modifiqué ligeramente (como se muestra a continuación) antes de hacer clic en `Prototype this App`:

![appblueprint](/img/app-blueprint.png)

Posteriormente utilicé estos indicadores para ajustar y refinar el diseño y el comportamiento:

Elimine el botón "Ver detalles" de la página de resumen del panel de control y el enlace en el nombre de la máquina. Si el usuario hace clic en cualquier parte de la fila, se mostrará la página de detalles.

> Cuándo presente tamaños en bytes, utilice una escala automática (KB, MB, GB, TB).

En la página de detalle, mueva el gráfico después de la tabla. Cambie el color del gráfico de barras a otro color compatible con los temas Claro y Oscuro.

En la página de detalle, reduzca la cantidad de filas para presentar 5 backups por página.

En el resumen del Panel de control, coloque un resumen en la parte superior con el número de máquinas en la base de datos, el número total de Backups de todas las máquinas, el Total enviado de todas las copias de seguridad y el Almacenamiento total usado por todas las máquinas. Incluya iconos para facilitar la visualización.

> por favor, persista la selección de tema del usuario. además, añada algunos márgenes laterales y haga que la interfaz de usuario utilice el 90% del ancho disponible.

en la tarjeta de encabezado de detalles de la máquina, incluir un resumen con el total de backups almacenados para esta máquina, una estadística del Estado de los backups, el número de advertencias y Errores del último backup, la Duración promedio en hh:mm:ss, el Total enviado de todas las copias de seguridad y el Tamaño de almacenamiento usado basado en la Información del backup más recibida.

haga que el resumen sea más pequeño y compacto para reducir el espacio utilizado.

Cuándo se presenta la fecha del último backup, mostrar en la misma celda, con una fuente pequeña de color gris, el tiempo transcurrido desde que ocurrió el backup (por ejemplo, hace x minuto, hace x horas, hace x días, hace x semanas, hace x meses, hace x años).

en el panel de control resumen poner fecha del último backup antes de estado del último backup

Después de iterar a través de estos indicadores, Firebase generó el prototipo como se muestra en las capturas de pantalla a continuación:

![prototype](/assets/screen-prototype.png)

![prototype-detail](/assets/screen-prototype-detail.png)

:::note
Un punto interesante fue que, desde la primera interacción, Firebase Studio generó datos aleatorios para poblar las páginas/gráficos, haciendo que el prototipo funcionara como una aplicación en vivo.
:::

Después de completar el prototipo inicial, accedí al código fuente haciendo clic en el botón `</>` en la interfaz. Luego utilicé la extensión de Git para exportar el código e insertarlo en un repositorio privado en [GitHub](https://www.github.com).

# Backend {#backend}

## Configuración {#setup}

Descargué el código de GitHub (utilizando el comando `git clone`) a una carpeta local (en mi caso, una Raspberry Pi 5 ejecutando Linux) e instalé las dependencias Node.js, npm y pnpm. Consulte más detalles en [DEVELOPMENT.md](../development/setup.md).

Configuré Cursor para acceder a la carpeta de código desde mi máquina Windows utilizando una conexión SSH.

Copié una muestra del JSON enviado por Duplicati en un archivo (consulte el documento [informe de backup de ejemplo](../api-reference/database-values)), eliminando algunos campos no deseados.

## Implementación {#implementation}

Utilicé un mensaje inicial para comenzar la implementación, enfocándome en la persistencia, correcciones y nuevas funcionalidades. Fue un proceso largo pero muy interesante.

### Uso de IA para generar el mensaje {#using-ai-to-generate-the-prompt}

Creé un mensaje detallado usando Cursor Chat (modo `Manual`, modelo `Auto`):

> mejore este texto como un prompt para la herramienta Cursor AI para generar la implementación de un prototipo de aplicación:
> 
> por favor cree un plan y genere la implementación completa de un prototipo de aplicación Next.js a partir de esta base de código. Su implementación debe analizar minuciosamente la base de código proporcionada para mantener la estética visual exacta, la experiencia del usuario y el flujo de navegación. Para el almacenamiento de datos, utilice SQLite3. Genere la base de datos y complétela utilizando la estructura y el contenido que se encuentran en el documento [informe de backup de ejemplo](../api-reference/database-values), asegurando que cada campo del JSON esté completamente integrado y persistido.

La IA generó el siguiente prompt:

>Crear un plan de implementación integral para un prototipo de aplicación Next.js con los siguientes requisitos:
>
>1. Stack técnico:
>   - Next.js 14+ con App Router
>   - TypeScript para seguridad de tipos
>   - SQLite3 para persistencia de datos
>   - TailwindCSS para estilos
>   - React Server Components donde sea apropiado
>   - Componentes cliente para elementos interactivos
>
>2. Diseño de base de datos:
>   - Analizar el documento de informe de backup de ejemplo para crear un esquema SQLite óptimo
>   - Diseñar tablas para almacenar eficientemente todos los datos de backup
>   - Incluir índices para consultas comunes
>   - Implementar validación de datos y seguridad de tipos
>
>3. Estructura de la aplicación:
>   - Implementar la interfaz de usuario/experiencia exacta de la base de código proporcionada
>   - Crear componentes reutilizables para elementos comunes
>   - Configurar el enrutamiento adecuado usando App Router
>   - Implementar diseños responsivos
>   - Añadir soporte de tema claro/oscuro
>
>4. Características principales:
>   - Panel de control con tabla de estado de máquinas
>   - Vista detallada de máquina con historial de backups
>   - Visualización de datos mediante gráficos
>   - Actualizaciones de estado de backup en tiempo real
>   - Manejo adecuado de errores y estados de carga
>
>5. Gestión de datos:
>   - Crear rutas API para operaciones de datos
>   - Implementar estrategias eficientes de obtención de datos
>   - Añadir validación de datos adecuada
>   - Incluir manejo de errores para operaciones de base de datos
>
>Proporcione un plan de implementación detallado que cubra todos estos aspectos mientras se mantiene el diseño visual existente y la experiencia del usuario.

He copiado el mensaje generado al portapapeles.

### Iniciar el viaje de implementación {#start-the-implementation-journey}

Creé un nuevo chat haciendo clic en el botón `+`, cambié al modo `Agent` y pegué el mensaje usando Ctrl+Shift+V (como texto).

Después de que se generó el plan, escribí `please, implement this plan` en el chat para comenzar la implementación.

:::note
Solo incluí el punto de partida ya que no registré todos los mensajes utilizados. Hubo muchos de ellos.
:::

# Notas {#notes}

- Algunos modelos pueden quedarse atascados al corregir errores. "claude-3.5" y "claude-4" suelen ser mejores, pero a veces hay que probar otro modelo (GPT, Gemini, etc.).
Para errores complejos, utilice un mensaje para analizar las posibles causas del error en lugar de simplemente pedir que lo corrija.
- Al realizar modificaciones complejas, utilice un mensaje para crear un plan y luego pida al agente de IA que lo implemente. Esto siempre funciona mejor.
- Sea específico al cambiar el código fuente. Si es posible, seleccione la parte relevante del código en el editor y presione Ctrl+L para incluirlo en el chat como contexto.
- También incluya una referencia al archivo que está mencionando en el chat para ayudar al agente de IA a enfocarse en la parte relevante del código y evitar hacer cambios en otras partes del código.
- Tengo la tendencia a antropomorfizar al agente de IA dado que persistentemente utiliza 'nosotros', 'nuestro código' y '¿le gustaría que...?'. Esto también es para mejorar mis probabilidades de supervivencia en caso de que (o [cuándo](https://ai-2027.com/)) Skynet se vuelva consciente y se invente Terminator.
- A veces, utilice [Gemini](https://gemini.google.com/app), [Deepseek](https://chat.deepseek.com/), [ChatGPT](https://chat.openai.com/), [Manus](https://manus.im/app),... para generar mensajes con mejores instrucciones para el agente de IA.
