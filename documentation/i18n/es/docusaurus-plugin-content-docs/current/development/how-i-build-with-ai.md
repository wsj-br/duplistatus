# Cómo construí esta aplicación usando herramientas de IA {/* #how-i-build-this-application-using-ai-tools */}

# Motivación {/* #motivation */}

Empecé a usar Duplicati como herramienta de copia de seguridad para mis servidores domésticos. Probé el [panel de control oficial de Duplicati](https://app.duplicati.com/) y [Duplicati Monitoring](https://www.duplicati-monitoring.com/), pero tenía dos requisitos principales: (1) autoalojado; y (2) una API expuesta para la integración con [Homepage](https://gethomepage.dev/), ya que lo uso para la página principal de mi laboratorio doméstico.

También intenté conectarme directamente a cada servidor Duplicati en la red, pero el método de autenticación no era compatible con Homepage (o no pude configurarlo correctamente).

Como también estaba experimentando con herramientas de código de IA, decidí intentar usar IA para construir esta herramienta. Aquí está el proceso que utilicé...

# Herramientas utilizadas {/* #tools-used */}

1. Para la interfaz de usuario: [Google's Firebase Studio](https://firebase.studio/)
2. Para la implementación: Cursor (https://www.cursor.com/)

:::note
Usé Firebase para la interfaz de usuario, pero también puedes usar [v0.app](https://v0.app/) o cualquier otra herramienta para generar el prototipo. Usé Cursor para generar la implementación, pero puedes usar otras herramientas, como VS Code/Copilot, Windsurf, ...
:::

# Interfaz de usuario {/* #ui */}

Creé un nuevo proyecto en [Firebase Studio](https://studio.firebase.google.com/) y usé este aviso en la función "Prototipar una aplicación con IA":

> Una aplicación de panel web utilizando tailwind/react para consolidar en una base de datos sqllite3 el resultado de la copia de seguridad enviada por la solución de copia de seguridad duplicati utilizando la opción --send-http-url (formato json) de varias máquinas, mantener el seguimiento del estado de la copia de seguridad, tamaño, tamaños de carga.
> 
> La primera página del panel debe tener una tabla con la última copia de seguridad de cada máquina en la primera página, incluyendo el nombre de la máquina, el número de copias de seguridad almacenadas en la base de datos, el estado de la última copia de seguridad, duración (hh:mm:ss), número de advertencias y errores.
> 
> Al hacer clic en una línea de máquina, mostrar una página de detalles de la máquina seleccionada con una lista de las copias de seguridad almacenadas (paginadas), incluyendo el nombre de la copia de seguridad, fecha y hora de la copia de seguridad, incluyendo hace cuánto tiempo fue, el estado, número de advertencias y errores, número de archivos, el tamaño de los archivos, tamaño cargado y el tamaño total del almacenamiento. También incluir en la página de detalles un gráfico utilizando Tremor con la evolución de los campos: tamaño cargado; duración en minutos, número de archivos examinados, tamaño de los archivos examinados. El gráfico debe mostrar un campo a la vez, con un menú desplegable para seleccionar el campo deseado a graficar. También el gráfico tiene que presentar todas las copias de seguridad almacenadas en la base de datos, no solo las que se muestran en la tabla paginada.
> 
> La aplicación tiene que exponer un punto final de la API para recibir la publicación del servidor duplicati y otro punto final de la API para recuperar todos los detalles de la última copia de seguridad de una máquina como un json.
> 
> El diseño debe ser moderno, adaptable y incluir iconos y otras ayudas visuales para facilitar la lectura. El código debe ser limpio, conciso y fácil de mantener. Usar herramientas modernas como pnpm para manejar las dependencias.
> 
> La aplicación debe tener un tema seleccionable de claro y oscuro.
> 
> La base de datos debe almacenar estos campos recibidos por el json de duplicati:

```json
"{ "Data": { "DeletedFiles": 0, "DeletedFolders": 0, "ModifiedFiles": 0, "ExaminedFiles": 15399, "OpenedFiles": 1861, "AddedFiles": 1861, "SizeOfModifiedFiles": 0, "SizeOfAddedFiles": 13450481, "SizeOfExaminedFiles": 11086692615, "SizeOfOpenedFiles": 13450481, "NotProcessedFiles": 0, "AddedFolders": 419, "TooLargeFiles": 0, "FilesWithError": 0, "ModifiedFolders": 0, "ModifiedSymlinks": 0, "AddedSymlinks": 0, "DeletedSymlinks": 0, "PartialBackup": false, "Dryrun": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "EndTime": "2025-04-21T23:46:38.3568274Z", "BeginTime": "2025-04-21T23:45:46.9712217Z", "Duration": "00:00:51.3856057", "WarningsActualLength": 0, "ErrorsActualLength": 0, "BackendStatistics": { "BytesUploaded": 8290314, "BytesDownloaded": 53550393, "KnownFileSize": 9920312634, "LastBackupDate": "2025-04-22T00:45:46+01:00", "BackupListCount": 6, "ReportedQuotaError": false, "ReportedQuotaWarning": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "BeginTime": "2025-04-21T23:45:46.9712252Z", "Duration": "00:00:00", "WarningsActualLength": 0, "ErrorsActualLength": 0 } }, "Extra": { "OperationName": "Backup", "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", "machine-name": "WSJ-SER5", "backup-name": "WSJ-SER5 Local files", "backup-id": "DB-2" } } "
```

esto generó un Esquema de Aplicación, que luego modifiqué ligeramente (como se muestra a continuación) antes de hacer clic en `Prototype this App`:

![appblueprint](/img/app-blueprint.png)

Más tarde utilicé estos avisos para ajustar y refinar el diseño y el comportamiento:

> eliminar el botón "ver detalles" de la página de vista general del panel y el enlace en el nombre de la máquina, si el usuario hace clic en cualquier parte de la fila, se mostrará la página de detalles.

> al presentar tamaños en bytes, usar una escala automática (KB, MB, GB, TB).

> en la página de detalles, mover el gráfico después de la tabla. Cambiar el color del gráfico de barras a otro color compatible con temas claros y oscuros.

> en la página de detalles, reducir el número de filas para presentar 5 copias de seguridad por página.

> en la vista general del panel, poner un resumen en la parte superior con el número de máquinas en la base de datos, el número total de copias de seguridad de todas las máquinas, el tamaño total cargado de todas las copias de seguridad y el almacenamiento total utilizado por todas las máquinas. Incluir iconos para facilitar la visualización.

> por favor, persistir el tema seleccionado por el usuario. también, agregar algunos márgenes laterales y hacer que la interfaz de usuario use el 90% del ancho disponible.

> en la tarjeta de encabezado de detalles de la máquina, incluir un resumen con el total de copias de seguridad almacenadas para esta máquina, una estadística del estado de las copias de seguridad, el número de advertencias y errores de la última copia de seguridad, la duración promedio en hh:mm:ss, el tamaño total cargado de todas las copias de seguridad y el tamaño de almacenamiento usado basado en la información de la última copia de seguridad recibida.

> hacer el resumen más pequeño y compacto para reducir el espacio utilizado.

> al presentar la fecha de la última copia de seguridad, mostrar en la misma celda, en una fuente gris pequeña, hace cuánto tiempo ocurrió la copia de seguridad (por ejemplo, hace x minutos, hace x horas, hace x días, hace x semanas, hace x meses, hace x años).

> en el panel de control de vista general, colocar la fecha de la última copia de seguridad antes del estado de la última copia de seguridad.

Después de iterar a través de estos indicadores, Firebase generó el prototipo como se muestra en las capturas de pantalla a continuación:

![prototipo](/img/screen-prototype.png)

![prototipo-detalle](/img/screen-prototype-detail.png)

:::note
Un punto interesante fue que, desde la primera interacción, Firebase Studio generó datos aleatorios para poblar las páginas/graficos, haciendo que el prototipo funcione como una aplicación en vivo.
:::

Después de completar el prototipo inicial, accedí al código fuente haciendo clic en el botón `</>` en la interfaz. Luego utilicé la extensión Git para exportar el código y enviarlo a un repositorio privado en [GitHub](https://www.github.com).

# Backend {/* #backend */}

## Configuración {/* #setup */}

Descargué el código desde GitHub (usando el comando `git clone`) a una carpeta local (en mi caso, una Raspberry Pi 5 ejecutando Linux) e instalé las dependencias Node.js, npm y pnpm. Ver más detalles en [DEVELOPMENT.md](../development/setup.md).

Configuré Cursor para acceder a la carpeta de código desde mi máquina Windows usando una conexión SSH.

Copié una muestra del JSON enviado por Duplicati en un archivo (ver el documento [muestra de informe de copia de seguridad](../api-reference/database-values)), limpiando algunos campos no deseados.

## Implementación {/* #implementation */}

Utilicé un indicador inicial para comenzar la implementación, enfocándome en persistencia, correcciones y nuevas características. Fue un proceso largo pero muy interesante.

### Usando IA para generar el indicador {/* #using-ai-to-generate-the-prompt */}

Creé un indicador detallado usando Cursor Chat (modo `Manual`, modelo `Auto`):

> mejorar este texto como un indicador para la herramienta de IA de cursor para generar la implementación de un prototipo de aplicación:
> 
> por favor crea un plan para generar la implementación completa de un prototipo de aplicación Next.js a partir de esta base de código. Tu implementación debe analizar a fondo la base de código proporcionada para mantener exactamente los aspectos visuales, la experiencia de usuario y el flujo de navegación. Para el almacenamiento de datos, utiliza SQLite3. Genera la base de datos y puebla con ella usando la estructura y contenido encontrados en el documento [muestra de informe de copia de seguridad](../api-reference/database-values), asegurándote de que cada campo del JSON esté completamente integrado y persistido.

La IA generó el siguiente indicador:

>Crea un plan de implementación completo para un prototipo de aplicación Next.js con los siguientes requisitos:
>
>1. Pila tecnológica:
>   - Next.js 14+ con App Router
>   - TypeScript para la seguridad de tipos
>   - SQLite3 para la persistencia de datos
>   - TailwindCSS para el estilo
>   - Componentes de servidor React donde sea apropiado
>   - Componentes de cliente para elementos interactivos
>
>2. Diseño de la base de datos:
>   - Analiza el documento de informe de copia de seguridad de ejemplo para crear un esquema SQLite óptimo
>   - Diseña tablas para almacenar eficientemente todos los datos de copia de seguridad
>   - Incluye índices para consultas comunes
>   - Implementa la validación de datos y la seguridad de tipos
>
>3. Estructura de la aplicación:
>   - Implementa la interfaz de usuario/Experiencia de usuario exacta del código base proporcionado
>   - Crea componentes reutilizables para elementos comunes
>   - Configura el enrutamiento adecuado usando App Router
>   - Implementa diseños responsivos
>   - Añade soporte para temas oscuro/claro
>
>4. Funcionalidades principales:
>   - Panel de control con tabla de estado de la máquina
>   - Vista detallada de la máquina con historial de copias de seguridad
>   - Visualización de datos usando gráficos
>   - Actualizaciones en tiempo real del estado de las copias de seguridad
>   - Manejo adecuado de errores y estados de carga
>
>5. Gestión de datos:
>   - Crea rutas API para operaciones de datos
>   - Implementa estrategias eficientes de obtención de datos
>   - Añade validación de datos adecuada
>   - Incluye manejo de errores para operaciones de base de datos
>
>Por favor, proporciona un plan de implementación detallado que cubra todos estos aspectos manteniendo el diseño visual y la experiencia de usuario existentes.

Copié el prompt generado al portapapeles.

### Comienza el viaje de implementación {/* #start-the-implementation-journey */}

Creé un nuevo chat haciendo clic en el botón `+`, cambié al modo `Agent` y pegué el prompt usando Ctrl+Shift+V (como texto).

Después de que se generó el plan, escribí `please, implement this plan` en el chat para comenzar la implementación.

:::note
Solo incluí el punto de partida ya que no grabé todos los prompts utilizados. Hubo muchos de ellos.
:::

# Notas {/* #notes */}

- Algunos modelos pueden atascarse al corregir errores. "claude-3.5" y "claude-4" suelen ser mejores, pero a veces tienes que probar con otro modelo (GPT, Gemini, etc.).
Para errores o problemas complejos, usa un prompt para analizar las posibles causas del error en lugar de simplemente pedir que lo solucione.
- Cuando realices modificaciones complejas, usa un prompt para crear un plan y luego pide al agente de IA que lo implemente. Esto siempre funciona mejor.
- Sé específico al cambiar el código fuente. Si es posible, selecciona la parte relevante del código en el editor y presiona Ctrl+L para incluirla en el chat como contexto.
- También incluye una referencia al archivo que estás mencionando en el chat para ayudar al agente de IA a enfocarse en la parte relevante del código y evitar hacer cambios en otras partes del código.
- Tengo la tendencia a antropomorfizar al agente de IA dado que usa persistentemente 'we', 'our code' y 'would you like me to...'. Esto también es para mejorar mis posibilidades de supervivencia en caso (o [when](https://ai-2027.com/)) Skynet se vuelva consciente y se invente el Terminator.
- A veces, usa [Gemini](https://gemini.google.com/app), [Deepseek](https://chat.deepseek.com/), [ChatGPT](https://chat.openai.com/), [Manus](https://manus.im/app),... para generar prompts con instrucciones mejores para el agente de IA.
