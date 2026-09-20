# Cómo construyo esta aplicación utilizando herramientas de IA {/* #how-i-build-this-application-using-ai-tools */}

# Motivación {/* #motivation */}

Comencé a usar Duplicati como una herramienta de copia de seguridad para mis servidores domésticos. Probé el [panel de control de Duplicati](https://app.duplicati.com/) y [monitoreo de Duplicati](https://www.duplicati-monitoring.com/), pero tenía dos requisitos principales: (1) autoalojado; y (2) una API expuesta para la integración con [Página de inicio](https://gethomepage.dev/), ya que la utilizo para la página de inicio de mi laboratorio en casa.

También intenté conectarme directamente a cada servidor Duplicati en la red, pero el método de autenticación no era compatible con la Página de inicio (o no pude configurarlo correctamente).

Dado que también estaba experimentando con herramientas de código de IA, decidí intentar usar IA para construir esta herramienta. Aquí está el proceso que utilicé...

# Herramientas utilizadas {/* #tools-used */}

1. Para la interfaz de usuario: [Firebase Studio de Google](https://firebase.studio/)
2. Para la implementación: Cursor (https://www.cursor.com/)

:::note
Usé Firebase para la interfaz de usuario, pero también puedes usar [v0.app](https://v0.app/) o cualquier otra herramienta para generar el prototipo. Usé Cursor para generar la implementación, pero puedes usar otras herramientas, como VS Code/Copilot, Windsurf, ...
:::

# Interfaz de usuario {/* #ui */}

Creé un nuevo proyecto en [Firebase Studio](https://studio.firebase.google.com/) y utilicé este aviso en la función "Prototipar una aplicación con IA":

> Una aplicación de panel web utilizando tailwind/react para consolidar en una base de datos sqllite3 el resultado de copia de seguridad enviado por la solución de copia de seguridad duplicati utilizando la opción --send-http-url (formato json) de varias máquinas, manteniendo un seguimiento del estado de la copia de seguridad, tamaño, tamaños de carga.
> 
> La primera página del panel debería tener una tabla con la última copia de seguridad de cada máquina en la primera página, incluyendo el nombre de la máquina, número de copias de seguridad almacenadas en la base de datos, el estado de la última copia de seguridad, duración (hh:mm:ss), número de advertencias y errores.
> 
> Al hacer clic en una línea de máquina, mostrar una página de detalles de la máquina seleccionada con una lista de las copias de seguridad almacenadas (paginadas), incluyendo el nombre de la copia de seguridad, fecha y hora de la copia de seguridad, incluyendo cuánto tiempo ha pasado, el estado, número de advertencias y errores, número de archivos, el tamaño de los archivos, tamaño subido y el tamaño total del almacenamiento. También incluir en la página de detalles un gráfico utilizando Tremor con la evolución de los campos: tamaño subido; duración en minutos, número de archivos examinados, tamaño de los archivos examinados. El gráfico debe trazar un campo a la vez, con un cuadro desplegable para seleccionar el campo deseado para trazar. Además, el gráfico debe presentar todas las copias de seguridad almacenadas en la base de datos, no solo las que se muestran en la tabla paginada.
> 
> La aplicación debe exponer un endpoint de API para recibir el post del servidor duplicati y otro endpoint de API para recuperar todos los detalles de la última copia de seguridad de una máquina como un json.
> 
> El diseño debe ser moderno, responsivo e incluir íconos y otras ayudas visuales para facilitar la lectura. El código debe ser limpio, conciso y fácil de mantener. Utiliza herramientas modernas como pnpm para gestionar las dependencias.
> 
> La aplicación debe tener un tema oscuro y claro seleccionable.
> 
> La base de datos debe almacenar estos campos recibidos por el json de duplicati:

```json
"{ "Data": { "DeletedFiles": 0, "DeletedFolders": 0, "ModifiedFiles": 0, "ExaminedFiles": 15399, "OpenedFiles": 1861, "AddedFiles": 1861, "SizeOfModifiedFiles": 0, "SizeOfAddedFiles": 13450481, "SizeOfExaminedFiles": 11086692615, "SizeOfOpenedFiles": 13450481, "NotProcessedFiles": 0, "AddedFolders": 419, "TooLargeFiles": 0, "FilesWithError": 0, "ModifiedFolders": 0, "ModifiedSymlinks": 0, "AddedSymlinks": 0, "DeletedSymlinks": 0, "PartialBackup": false, "Dryrun": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "EndTime": "2025-04-21T23:46:38.3568274Z", "BeginTime": "2025-04-21T23:45:46.9712217Z", "Duration": "00:00:51.3856057", "WarningsActualLength": 0, "ErrorsActualLength": 0, "BackendStatistics": { "BytesUploaded": 8290314, "BytesDownloaded": 53550393, "KnownFileSize": 9920312634, "LastBackupDate": "2025-04-22T00:45:46+01:00", "BackupListCount": 6, "ReportedQuotaError": false, "ReportedQuotaWarning": false, "MainOperation": "Backup", "ParsedResult": "Success", "Interrupted": false, "Version": "2.1.0.5 (2.1.0.5_stable_2025-03-04)", "BeginTime": "2025-04-21T23:45:46.9712252Z", "Duration": "00:00:00", "WarningsActualLength": 0, "ErrorsActualLength": 0 } }, "Extra": { "OperationName": "Backup", "machine-id": "66f5ffc7ff474a73a3c9cba4ac7bfb65", "machine-name": "WSJ-SER5", "backup-name": "WSJ-SER5 Local files", "backup-id": "DB-2" } } "
```

esto generó un plano de aplicación, que luego modifiqué ligeramente (como se muestra a continuación) antes de hacer clic en `Prototype this App`:

![appblueprint](/img/app-blueprint.png)

Más tarde utilicé estos avisos para ajustar y refinar el diseño y el comportamiento:

> eliminar el botón "ver detalles" de la página de vista general del panel y el enlace en el nombre de la máquina, si el usuario hace clic en cualquier parte de la fila, mostrará la página de detalles.

> al presentar tamaños en bytes, usar una escala automática (KB, MB, GB, TB).

> en la página de detalles, mover el gráfico después de la tabla. Cambiar el color del gráfico de barras a otro color compatible con los temas claros y oscuros.

> en la página de detalles, reducir el número de filas para presentar 5 copias de seguridad por página.

> en la vista general del panel, poner un resumen en la parte superior con el número de máquinas en la base de datos, el número total de copias de seguridad de todas las máquinas, el tamaño total subido de todas las copias de seguridad y el almacenamiento total utilizado por todas las máquinas. Incluir íconos para facilitar la visualización.

> por favor, persistir la selección de tema por parte del usuario. además, añadir algunos márgenes laterales y hacer que la interfaz de usuario utilice el 90% del ancho disponible.

> en la tarjeta de encabezado de detalles de la máquina, incluye un resumen con el total de copias de seguridad almacenadas para esta máquina, una estadística del estado de la copia de seguridad, el número de advertencias y errores de la última copia de seguridad, la duración promedio en hh:mm:ss, el tamaño total cargado de todas las copias de seguridad y el tamaño de almacenamiento usado basado en la última información de copia de seguridad recibida.

> haz el resumen más pequeño y compacto para reducir el espacio utilizado.

> al presentar la fecha de la última copia de seguridad, muestra en la misma celda, en una fuente gris pequeña, el tiempo transcurrido desde que se realizó la copia de seguridad (por ejemplo, hace x minuto, hace x horas, hace x días, hace x semanas, hace x meses, hace x años).

> en la vista general del panel, coloca la fecha de la última copia de seguridad antes del estado de la última copia de seguridad.

Después de iterar a través de estos mensajes, Firebase generó el prototipo como se muestra en las capturas de pantalla a continuación:

![prototipo](/img/screen-prototype.png)

![detalle del prototipo](/img/screen-prototype-detail.png)

:::note
Un punto interesante fue que, desde la primera interacción, Firebase Studio generó datos aleatorios para poblar las páginas/gráficos, haciendo que el prototipo funcionara como una aplicación en vivo.
:::

Después de completar el prototipo inicial, accedí al código fuente haciendo clic en el botón `</>` en la interfaz. Luego utilicé la extensión de Git para exportar el código y enviarlo a un repositorio privado en [GitHub](https://www.github.com).

# Backend {/* #backend */}

## Configuración {/* #setup */}

Descargué el código de GitHub (usando el comando `git clone`) a una carpeta local (en mi caso, una Raspberry Pi 5 ejecutando Linux) e instalé las dependencias Node.js, npm y pnpm. Consulta más detalles en [DEVELOPMENT.md](../development/setup.md).

Configuré Cursor para acceder a la carpeta de código desde mi máquina con Windows utilizando una conexión SSH.

Copié una muestra del JSON enviado por Duplicati en un archivo (consulta el documento [informe de copia de seguridad de muestra](../api-reference/database-values)), eliminando algunos campos no deseados.

## Implementación {/* #implementation */}

Utilicé un mensaje inicial para comenzar la implementación, centrándome en la persistencia, correcciones y nuevas características. Fue un proceso largo pero muy interesante.

### Usando IA para generar el mensaje {/* #using-ai-to-generate-the-prompt */}

Creé un mensaje detallado usando Cursor Chat (modo `Manual`, modelo `Auto`):

> mejora este texto como un mensaje para la herramienta de IA de Cursor para generar la implementación de un prototipo de aplicación:
> 
> por favor crea un plan para generar la implementación completa de un prototipo de aplicación Next.js a partir de esta base de código. Tu implementación debe analizar a fondo la base de código proporcionada para mantener la estética visual exacta, la experiencia del usuario y el flujo de navegación. Para el almacenamiento de datos, utiliza SQLite3. Genera la base de datos y pópula utilizando la estructura y contenido encontrados en el documento [informe de copia de seguridad de muestra](../api-reference/database-values), asegurando que cada campo del JSON esté completamente integrado y persistido.

La IA generó el siguiente mensaje:

>Crea un plan de implementación completo para un prototipo de aplicación Next.js con los siguientes requisitos:
>
>1. Pila Técnica:
>   - Next.js 14+ con App Router
>   - TypeScript para seguridad de tipos
>   - SQLite3 para persistencia de datos
>   - TailwindCSS para estilos
>   - Componentes del Servidor de React donde sea apropiado
>   - Componentes del cliente para elementos interactivos
>
>2. Diseño de Base de Datos:
>   - Analiza el documento de informe de copia de seguridad de muestra para crear un esquema óptimo de SQLite
>   - Diseña tablas para almacenar eficientemente todos los datos de copia de seguridad
>   - Incluye índices para consultas comunes
>   - Implementa validación de datos y seguridad de tipos
>
>3. Estructura de la Aplicación:
>   - Implementa la UI/UX exacta del código proporcionado
>   - Crea componentes reutilizables para elementos comunes
>   - Configura el enrutamiento adecuado utilizando App Router
>   - Implementa diseños responsivos
>   - Añade soporte para temas oscuro/claro
>
>4. Características Principales:
>   - Vista general del panel de control con tabla de estado de máquinas
>   - Vista detallada de la máquina con historial de copias de seguridad
>   - Visualización de datos utilizando gráficos
>   - Actualizaciones de estado de copia de seguridad en tiempo real
>   - Manejo adecuado de errores y estados de carga
>
>5. Gestión de Datos:
>   - Crea rutas API para operaciones de datos
>   - Implementa estrategias de obtención de datos eficientes
>   - Añade validación de datos adecuada
>   - Incluye manejo de errores para operaciones de base de datos
>
>Por favor, proporciona un plan de implementación detallado que cubra todos estos aspectos mientras mantiene el diseño visual y la experiencia del usuario existentes.

Copié el mensaje generado en el portapapeles.

### Comienza el viaje de implementación {/* #start-the-implementation-journey */}

Creé un nuevo chat haciendo clic en el botón `+`, cambié a modo `Agent` y pegué el mensaje usando Ctrl+Shift+V (como texto).

Después de que se generó el plan, escribí `please, implement this plan` en el chat para comenzar la implementación.

:::note
Solo incluí el punto de partida ya que no registré todos los mensajes utilizados. Hubo muchos de ellos.
:::

# Notas {/* #notes */}

- Algunos modelos pueden quedarse atascados al corregir errores. "claude-3.5" y "claude-4" suelen ser mejores, pero a veces tienes que probar otro modelo (GPT, Gemini, etc.).
Para errores o fallos complejos, utiliza un mensaje para analizar las posibles causas del error en lugar de simplemente pedir que lo arreglen.
- Al hacer modificaciones complejas, utiliza un mensaje para crear un plan y luego pide al agente de IA que lo implemente. Esto siempre funciona mejor.
- Sé específico al cambiar el código fuente. Si es posible, selecciona la parte relevante del código en el editor y presiona Ctrl+L para incluirla en el chat como contexto.
- También incluye una referencia al archivo que mencionas en el chat para ayudar al agente de IA a centrarse en la parte relevante del código y evitar hacer cambios en otras partes del código.
- Tengo la tendencia a antropomorfizar al agente de IA dado que utiliza persistentemente 'nosotros', 'nuestro código' y '¿te gustaría que...'. Esto también es para mejorar mis probabilidades de supervivencia en caso (o [cuando](https://ai-2027.com/)) Skynet se vuelva consciente y se invente el Terminator.
- A veces, utiliza [Gemini](https://gemini.google.com/app), [Deepseek](https://chat.deepseek.com/), [ChatGPT](https://chat.openai.com/), [Manus](https://manus.im/app),... para generar mensajes con mejores instrucciones para el agente de IA.
