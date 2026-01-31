---
translation_last_updated: '2026-01-31T00:51:26.561Z'
source_file_mtime: '2026-01-29T17:58:29.895Z'
source_file_hash: 6f3df4c1ef3576bd
translation_language: es
source_file_path: development/test-scripts.md
---
# Scripts de Prueba {#test-scripts}

El proyecto incluye varios scripts de prueba para ayudar con el desarrollo y las pruebas:

## Generar Datos de Prueba {#generate-test-data}

```bash
pnpm generate-test-data --servers=N
```

Este script genera datos de backup de prueba para múltiples servidores y backups.

El parámetro `--servers=N` es **obligatorio** y especifica la cantidad de servidores a generar (1-30).

Utilice la opción `--upload` para enviar los datos generados a `/api/upload`

```bash
pnpm generate-test-data --servers=N --upload
```

**Ejemplos:**

```bash
# Generate data for 5 servers
pnpm generate-test-data --servers=5

# Generate data for 1 server with upload mode
pnpm generate-test-data --upload --servers=1

# Generate data for all 30 servers
pnpm generate-test-data --servers=30
```

>[!CAUTION]
> Este script elimina todos los datos anteriores en la base de datos y los reemplaza con datos de prueba.
> Realice una copia de seguridad de su base de datos antes de ejecutar este script.

## Mostrar el contenido de las notificaciones retrasadas (para depurar el sistema de notificaciones) {#show-the-overdue-notifications-contents-to-debug-notification-system}

```bash
pnpm show-overdue-notifications
```

## Ejecutar verificación de retrasado en una fecha/hora específica (para depurar el sistema de notificaciones) {#run-overdue-check-at-a-specific-datetime-to-debug-notification-system}

```bash
pnpm run-overdue-check "YYYY-MM-DD HH:MM:SS"
``` 

## Probar conectividad del puerto del servicio cron {#test-cron-service-port-connectivity}

Para probar la conectividad del servicio cron, puede:

1. Verificar si el servicio cron está en ejecución:

```bash
curl http://localhost:8667/health
```

2. O utilice directamente los puntos finales de la API del servicio cron a través de la aplicación principal:

```bash
curl http://localhost:8666/api/cron/health
```

3. Utilice el script de prueba para verificar la conectividad del puerto:

```bash
pnpm test-cron-port
```

Este script prueba la conectividad al puerto del servicio cron y proporciona información detallada sobre el estado de la conexión.

## Probar detección de retrasado {#test-overdue-detection}

```bash
pnpm test-overdue-detection
```

Este script prueba la lógica de detección de backup retrasado. Verifica:
- Identificación de backup retrasado
- Activación de notificaciones
- Cálculos de fecha/hora para estado retrasado

Útil para depurar sistemas de detección y notificación de backups retrasados.

## Validar exportación CSV {#validate-csv-export}

```bash
pnpm validate-csv-export
```

Este script valida la funcionalidad de exportación de CSV. Realiza lo siguiente:
- Prueba la generación de exportación de CSV
- Verifica el formato y la estructura de los datos
- Comprueba la integridad de los datos en los Archivos exportados

Útil para garantizar que las exportaciones de CSV funcionen correctamente antes de los lanzamientos.

## Bloquear temporalmente el servidor NTFY (para pruebas) {#temporarily-block-ntfy-server-for-testing}

```bash
sudo ./scripts/temporary_ntfy.sh_block.sh
```

Este script bloquea temporalmente el acceso de red saliente al servidor de NTFY (`ntfy.sh`) para probar el mecanismo de reintento de notificaciones. Realiza lo siguiente:
- Resuelve la dirección IP del servidor de NTFY
- Añade una regla de iptables para bloquear el tráfico saliente
- Bloquea durante 10 segundos (configurable)
- Elimina automáticamente la regla de bloqueo al salir
- Requiere privilegios de root (sudo)

>[!CAUTION]
> Este script modifica reglas de iptables y requiere privilegios de root. Úselo solo para probar mecanismos de reintentos de notificaciones.

## Pruebas de Migración de Base de Datos {#database-migration-testing}

El proyecto incluye scripts para probar migraciones de base de datos desde versiones anteriores a la versión actual. Estos scripts garantizan que las migraciones de base de datos funcionen correctamente y preserven la integridad de los datos.

### Generar Datos de Prueba de Migración {#generate-migration-test-data}

```bash
./scripts/generate-migration-test-data.sh
```

Este script genera bases de datos de prueba para múltiples Versiones históricas de la aplicación. Lo hace:

1. **Detiene y elimina** cualquier contenedor Docker existente
2. **Para cada versión** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Elimina archivos de base de datos existentes
   - Crea un archivo de etiqueta de versión
   - Inicia un contenedor Docker con la versión específica
   - Espera a que el contenedor esté listo
   - Genera datos de prueba utilizando `pnpm generate-test-data`
   - Toma una captura de pantalla de la interfaz de usuario con datos de prueba
   - Detiene y elimina el contenedor
   - Vacía archivos WAL y guarda el esquema de la base de datos
   - Copia el archivo de base de datos a `scripts/migration_test_data/`

**Requisitos:**
- Docker debe estar instalado y configurado
- Google Chrome (a través de Puppeteer) debe estar instalado
- Acceso root/sudo para operaciones de Docker
- El volumen de Docker `duplistatus_data` debe existir

**Salida:**
- Archivos de base de datos: `scripts/migration_test_data/backups_<VERSION>.db`
- Archivos de esquema: `scripts/migration_test_data/backups_<VERSION>.schema`
- Capturas de pantalla: `scripts/migration_test_data/duplistatus_test_data_<VERSION>.png`

**Configuración:**
- Número de servidores: Se establece mediante la variable `SERVERS` (por defecto: 3)
- Directorio de datos: `/var/lib/docker/volumes/duplistatus_data/_data`
- Puerto: 9666 (puerto del contenedor Docker)

>[!CAUTION]
> Este script requiere Docker y detendrá/eliminará contenedores existentes. También requiere acceso sudo para operaciones de Docker y acceso al sistema de archivos. Es necesario ejecutar primero el script `pnpm take-screenshots` para instalar Google Chrome si aún no lo ha hecho.

>[!IMPORTANT]
> Este script estaba diseñado para ejecutarse una sola vez. En nuevas versiones, el desarrollador puede copiar el archivo de base de datos y las capturas de pantalla directamente al directorio `scripts/migration_test_data/`. Durante el desarrollo, simplemente ejecute el script `./scripts/test-migrations.sh` para probar las migraciones.

### Probar Migraciones de Base de Datos {#test-database-migrations}

```bash
./scripts/test-migrations.sh
```

Este script prueba migraciones de base de datos desde versiones antiguas hasta la versión actual (4.0). Lo hace:

1. **Para cada versión** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Crea una copia temporal de la base de datos de prueba
   - Ejecuta el proceso de migración utilizando `test-migration.ts`
   - Valida la estructura de la base de datos migrada
   - Verifica las tablas y columnas requeridas
   - Comprueba que la versión de la base de datos sea 4.0
   - Limpia los archivos temporales

**Requisitos:**
- Las bases de datos de prueba deben existir en `scripts/migration_test_data/`
- Se generan ejecutando primero `generate-migration-test-data.sh`

**Resultado:**
- Resultados de prueba codificados por color (verde para aprobado, rojo para fallido)
- Resumen de versiones aprobadas y fallidas
- Mensajes de error detallados para migraciones fallidas
- Código de salida 0 si todas las pruebas se aprueban, 1 si alguna falla

**Lo que valida:**
- La versión de la base de datos es 4.0 después de la migración
- Todos los requeridos existen: `servers`, `backups`, `configurations`, `users`, `sessions`, `audit_log`, `db_version`
- Las columnas requeridas existen en cada tabla
- La estructura de la base de datos es correcta

**Salida de ejemplo:**

```
==========================================
Database Migration Test Suite
==========================================

Testing migrations from old versions to version 4.0
Test data directory: /path/to/migration_test_data
Temporary directory: /path/to/migration_test_data/.tmp

----------------------------------------
Testing version: v0.4.0
----------------------------------------
  Copying database file to temporary location...
  Running migration test...
✅ Version v0.4.0: Migration test PASSED

==========================================
Test Summary
==========================================

✅ Passed versions (5):
  ✓ v0.4.0
  ✓ v0.5.0
  ✓ v0.6.1
  ✓ 0.7.27
  ✓ 0.8.21

All migration tests passed!
```

**Uso:**

```bash
# Run all migration tests
./scripts/test-migrations.sh

# Check exit code
echo $?  # 0 = all passed, 1 = some failed
```

>[!NOTE]
> Este script utiliza internamente el script de prueba de migración de TypeScript (`test-migration.ts`). El script de prueba valida la estructura de la base de datos después de la migración y garantiza la integridad de los datos.

## Configurar la Prueba de Configuración SMTP {#set-smtp-test-configuration}

```bash
pnpm set-smtp-test-config <connectionType>
```

Este script establece la configuración de prueba SMTP a partir de variables de entorno. Acepta un parámetro `connectionType` (`plain`, `starttls` o `ssl`) y lee las variables de entorno correspondientes con prefijos (`PLAIN_`, `STARTTLS_`, `SSL_`) para actualizar la configuración SMTP en la base de datos.

Para conexiones simples, el script lee la variable de entorno `PLAIN_SMTP_FROM` para establecer la Dirección de remitente requerida. Esto facilita la prueba de diferentes tipos de conexión SMTP sin actualizaciones manuales de la base de datos.

**Uso:**

```bash
# Set Plain SMTP configuration
PLAIN_SMTP_HOST=smtp.example.com \
PLAIN_SMTP_PORT=25 \
PLAIN_SMTP_FROM=noreply@example.com \
pnpm set-smtp-test-config plain

# Set STARTTLS configuration
STARTTLS_SMTP_HOST=smtp.example.com \
STARTTLS_SMTP_PORT=587 \
STARTTLS_SMTP_USERNAME=user@example.com \
STARTTLS_SMTP_PASSWORD=password \
pnpm set-smtp-test-config starttls

# Set Direct SSL/TLS configuration
SSL_SMTP_HOST=smtp.example.com \
SSL_SMTP_PORT=465 \
SSL_SMTP_USERNAME=user@example.com \
SSL_SMTP_PASSWORD=password \
pnpm set-smtp-test-config ssl
```

**Requisitos:**
- La aplicación debe estar en ejecución
- Las variables de entorno deben configurarse con el prefijo apropiado para el Tipo de conexión
- Para conexiones simples, `PLAIN_SMTP_FROM` es requerido

## Probar compatibilidad cruzada del Tipo de conexión SMTP {#test-smtp-connection-type-cross-compatibility}

```bash
pnpm test-smtp-connections
```

Este script realiza una prueba exhaustiva de matriz 3x3 que valida si las configuraciones destinadas a un tipo de conexión funcionan correctamente con diferentes tipos de conexión. Para cada tipo de configuración base (plain, starttls, ssl), el script:

1. Lee variables de entorno con prefijos correspondientes (`PLAIN_*`, `STARTTLS_*`, `SSL_*`)
2. Prueba todos los tres tipos de conexión modificando únicamente el campo `connectionType`
3. Envía correos electrónicos de prueba a través de la API
4. Registra los resultados en un formato de matriz
5. Muestra una tabla de resumen
6. Guarda los resultados detallados en `smtp-test-results.json`

**Uso:**

```bash
# Set environment variables for all three connection types
PLAIN_SMTP_HOST=smtp.example.com \
PLAIN_SMTP_PORT=25 \
PLAIN_SMTP_FROM=noreply@example.com \
STARTTLS_SMTP_HOST=smtp.example.com \
STARTTLS_SMTP_PORT=587 \
STARTTLS_SMTP_USERNAME=user@example.com \
STARTTLS_SMTP_PASSWORD=password \
SSL_SMTP_HOST=smtp.example.com \
SSL_SMTP_PORT=465 \
SSL_SMTP_USERNAME=user@example.com \
SSL_SMTP_PASSWORD=password \
pnpm test-smtp-connections
```

**Requisitos:**
- La aplicación debe estar en ejecución
- Las variables de entorno deben estar configuradas para los tres tipos de conexión
- El script valida la configuración que se utiliza a través de registros detallados

**Comportamiento Esperado:**
Las configuraciones deben funcionar únicamente con su tipo de conexión previsto (por ejemplo, la configuración plain funciona con connectionType plain pero falla con STARTTLS/ssl).

**Salida:**
- Salida de consola con una tabla de resumen que muestra los resultados de las pruebas
- Archivo `smtp-test-results.json` con resultados detallados de las pruebas para cada combinación de configuración y Tipo de conexión

## Probar Script de Punto de Entrada Docker {#test-docker-entrypoint-script}

```bash
pnpm test-entrypoint
```

Este script proporciona un contenedor de prueba para `docker-entrypoint.sh` en desarrollo local. Configura el entorno para probar la funcionalidad de registro de logs del punto de entrada y garantiza que los logs se escriban en `data/logs/` para que la aplicación pueda acceder a ellos.

# ¿Qué hace?

1. **Siempre construye una versión nueva**: Ejecuta automáticamente `pnpm build-local` para crear una compilación nueva antes de realizar pruebas (no es necesario compilar manualmente primero)
2. **Construye el servicio cron**: Garantiza que el servicio cron esté compilado (`dist/cron-service.cjs`)
3. **Configura la estructura similar a Docker**: Crea los enlaces simbólicos y la estructura de directorios necesarios para emular el entorno Docker
4. **Ejecuta el script de punto de entrada**: Ejecuta `docker-entrypoint.sh` con las variables de entorno adecuadas
5. **Limpia**: Elimina automáticamente los archivos temporales al salir

**Uso:**

```bash
# Run the test (builds fresh version automatically)
pnpm test-entrypoint
```

**Variables de Entorno:**
- `PORT=8666` - Puerto para el Servidor Next.js (coincide con `start-local`)
- `CRON_PORT=8667` - Puerto para el servicio cron
- `VERSION` - Se establece automáticamente en formato `test-YYYYMMDD-HHMMSS`

**Salida:**
- Los Logs se escriben en `data/logs/application.log` (accesible por la aplicación)
- La salida de consola muestra la ejecución del script de punto de entrada
- Presione Ctrl+C para detener y probar el vaciado de Logs

**Requisitos:**
- El script debe ejecutarse desde el directorio raíz del repositorio (pnpm lo maneja automáticamente)
- El script maneja automáticamente todos los requisitos previos (compilación, servicio cron, etc.)

**Casos de uso:**
- Probar cambios en el script de punto de entrada localmente antes de la implementación en Docker
- Verificar la rotación de registros y la funcionalidad de registro
- Probar el cierre elegante y el manejo de señales
- Depurar el comportamiento del script de punto de entrada en un entorno local
