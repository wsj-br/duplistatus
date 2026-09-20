# Scripts de prueba {/* #test-scripts */}

El proyecto incluye varios scripts de prueba para ayudar con el desarrollo y las pruebas:

> [!NOTE]
> Se eliminaron los ayudantes de raíz del repositorio legado `pnpm` para la depuración de copias de seguridad vencidas, pruebas de matriz SMTP y comprobaciones de puerto cron. Utilice la interfaz de usuario de la aplicación (**Configuración → Monitoreo de copias de seguridad**), APIs HTTP autenticadas y `curl` contra el servicio cron como se documenta a continuación.

## Generar datos de prueba {/* #generate-test-data */}

```bash
pnpm generate-test-data --servers=N
```

Este script genera datos de copia de seguridad de prueba para múltiples servidores y copias de seguridad.

El parámetro `--servers=N` es **obligatorio** y especifica el número de servidores a generar (1-30).

Utilice la opción `--upload` para enviar los datos generados a la `/api/upload`

```bash
pnpm generate-test-data --servers=N --upload
pnpm generate-test-data --servers=N --upload --api-key=YOUR_UPLOAD_KEY
```

`--api-key` es requerido cuando Configuración → Claves de API está configurado para requerir claves. El script reintenta una vez en HTTP 429, por lo que una gran ejecución de `--upload` se mantiene dentro de los límites de tasa predeterminados.

**Ejemplos:**

```bash
# Generate data for 5 servers
pnpm generate-test-data --servers=5

# Generate data for 1 server with upload mode
pnpm generate-test-data --upload --servers=1

# Generate data for all 30 servers
pnpm generate-test-data --servers=30
```

El script asigna versiones de Duplicati **por servidor** (la misma cadena de informe se escribe en cada copia de seguridad para ese servidor):

- **70–80% actual**: utiliza la última versión estable en caché desde `configurations.duplicati_versions` cuando está disponible, de lo contrario, una copia de seguridad fijada (`2.1.0.5_stable`).
- **Restante más antiguo**: una versión estable estrictamente anterior para que la insignia del panel se compare como desactualizada (amarillo).
- El modo Direct-DB borra `configurations` primero, luego restaura o siembra la caché de versiones para que la comparación actual/desactualizada funcione de inmediato.
- Los conteos pequeños no siempre pueden caer en 70–80%: `--servers=1` es 100% actual; `--servers=2` o `3` mantiene al menos un servidor más antiguo; `--servers=6` es 5 actuales (83%). `--servers=12` (utilizado por `pnpm take-screenshots`) es **9 actuales / 3 más antiguos**.
- Cuando `pnpm take-screenshots` reduce más tarde el conjunto de datos a tres servidores, mantiene el servidor vencido protegido y **al menos un servidor de versión anterior**.

>[!CAUTION]
> Este script elimina todos los datos anteriores en la base de datos y los reemplaza con datos de prueba.
> Haga una copia de seguridad de su base de datos antes de ejecutar este script.

## Comprobaciones de vencimiento y conectividad cron (desarrollo) {/* #overdue-checks-and-cron-connectivity-development */}

### Ejecutar una comprobación de copia de seguridad vencida {/* #run-an-overdue-backup-check */}

Mientras la aplicación está en ejecución:

- **UI (recomendado):** abra **Configuración → Monitoreo de copias de seguridad** y use **Probar copias de seguridad vencidas**. Eso ejecuta la misma lógica que el trabajo programado a través de `POST /api/notifications/check-overdue` autenticado.

### Salud del servicio cron {/* #cron-service-health */}

```bash
curl http://localhost:8667/health
curl http://localhost:8666/api/cron/health
```

### Simulando una fecha u hora específica {/* #simulating-a-specific-date-or-time */}

No hay un CLI empaquetado para inyectar un tiempo “actual” simulado. Para el algoritmo e ideas de pruebas manuales, consulte el archivo del repositorio `dev/OVERDUE_DETECTION_ALGORITHM.md` y la implementación en `src/lib/overdue-backup-checker.ts`.

## Validar exportación CSV {/* #validate-csv-export */}

```bash
pnpm validate-csv-export
```

Este script valida la funcionalidad de exportación CSV. It:
- Prueba la generación de exportaciones CSV
- Verifica el formato y la estructura de los datos
- Comprueba la integridad de los datos en los archivos exportados

Útil para asegurar que las exportaciones CSV funcionen correctamente antes de las versiones.

## Bloquear temporalmente el servidor NTFY (para pruebas) {/* #temporarily-block-ntfy-server-for-testing */}

```bash
sudo ./scripts/temporary_ntfy.sh_block.sh
```

Este script bloquea temporalmente el acceso a la red saliente al servidor NTFY (`ntfy.sh`) para probar el mecanismo de reintento de notificaciones. It:
- Resuelve la dirección IP del servidor NTFY
- Agrega una regla de iptables para bloquear el tráfico saliente
- Bloquea durante 10 segundos (configurable)
- Elimina automáticamente la regla de bloqueo al salir
- Requiere privilegios de root (sudo)

>[!CAUTION]
> Este script modifica las reglas de iptables y requiere privilegios de root. Úselo solo para probar mecanismos de reintento de notificaciones.

## Pruebas de Migración de Base de Datos {/* #database-migration-testing */}

El proyecto incluye scripts para probar migraciones de base de datos de versiones anteriores a la versión actual. Estos scripts aseguran que las migraciones de base de datos funcionen correctamente y preserven la integridad de los datos.

### Generar Datos de Prueba de Migración {/* #generate-migration-test-data */}

```bash
./scripts/generate-migration-test-data.sh
```

Este script genera bases de datos de prueba para múltiples versiones históricas de la aplicación. It:

1. **Detiene y elimina** cualquier contenedor Docker existente
2. **Para cada versión** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Elimina los archivos de base de datos existentes
   - Crea un archivo de etiqueta de versión
   - Inicia un contenedor Docker con la versión específica
   - Espera a que el contenedor esté listo
   - Genera datos de prueba usando `pnpm generate-test-data`
   - Toma una captura de pantalla de la interfaz de usuario con datos de prueba
   - Detiene y elimina el contenedor
   - Limpia los archivos WAL y guarda el esquema de la base de datos
   - Copia el archivo de base de datos a `scripts/migration_test_data/`

**Requisitos:**
- Docker debe estar instalado y configurado
- Chromium (a través de Playwright) debe estar instalado
- Acceso root/sudo para operaciones de Docker
- El volumen de Docker `duplistatus_data` debe existir

**Salida:**
- Archivos de base de datos: `scripts/migration_test_data/backups_<VERSION>.db`
- Archivos de esquema: `scripts/migration_test_data/backups_<VERSION>.schema`
- Capturas de pantalla: `scripts/migration_test_data/duplistatus_test_data_<VERSION>.png`

**Configuración:**
- Número de servidores: Establecido a través de la variable `SERVERS` (predeterminada: 3)
- Directorio de datos: `/var/lib/docker/volumes/duplistatus_data/_data`
- Puerto: 9666 (puerto del contenedor Docker)

>[!CAUTION]
> Este script requiere Docker y detendrá/eliminará contenedores existentes. También requiere acceso sudo para operaciones de Docker y acceso al sistema de archivos. Ejecute `pnpm take-screenshots:install` primero para instalar el navegador Playwright Chromium si aún no lo ha hecho.

>[!IMPORTANT]
> Este script se suponía que debía ejecutarse solo una vez, ya que las nuevas versiones el desarrollador puede copiar el archivo de base de datos y las capturas de pantalla directamente al directorio `scripts/migration_test_data/`. Durante el desarrollo, simplemente ejecute el script `./scripts/test-migrations.sh` para probar las migraciones.

### Probar Migraciones de Base de Datos {/* #test-database-migrations */}

```bash
./scripts/test-migrations.sh
```

Este script prueba las migraciones de base de datos de versiones antiguas a la versión actual (4.0). It:

1. **Para cada versión** (v0.4.0, v0.5.0, v0.6.1, 0.7.27, 0.8.21):
   - Crea una copia temporal de la base de datos de prueba
   - Ejecuta el proceso de migración utilizando `test-migration.ts`
   - Valida la estructura de la base de datos migrada
   - Verifica las tablas y columnas requeridas
   - Comprueba que la versión de la base de datos sea 4.0
   - Limpia los archivos temporales

**Requisitos:**
- Las bases de datos de prueba deben existir en `scripts/migration_test_data/`
- Generadas al ejecutar `generate-migration-test-data.sh` primero

**Salida:**
- Resultados de prueba codificados por colores (verde para pasar, rojo para fallar)
- Resumen de versiones aprobadas y fallidas
- Mensajes de error detallados para migraciones fallidas
- Código de salida 0 si todas las pruebas pasan, 1 si alguna falla

**Lo que valida:**
- La versión de la base de datos es 4.0 después de la migración
- Todas las tablas requeridas existen: `servers`, `backups`, `configurations`, `users`, `sessions`, `audit_log`, `db_version`
- Las columnas requeridas existen en cada tabla
- La estructura de la base de datos es correcta

**Ejemplo de salida:**

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
> Este script utiliza el script de prueba de migración de TypeScript (`test-migration.ts`) internamente. El script de prueba valida la estructura de la base de datos después de la migración y asegura la integridad de los datos.

## SMTP y correo electrónico (desarrollo) {/* #smtp-and-email-development */}

Configura SMTP en **Configuración → Correo electrónico** y utiliza las pruebas de correo electrónico y los flujos de notificación en la aplicación. Los scripts auxiliares anteriores `pnpm set-smtp-test-config` y `pnpm test-smtp-connections` fueron eliminados del repositorio.

## Script de entrada de prueba de Docker {/* #test-docker-entrypoint-script */}

```bash
pnpm test-entrypoint
```

Este script proporciona un envoltorio de prueba para `docker-entrypoint.sh` en el desarrollo local. Configura el entorno para probar la funcionalidad de registro de entrada y asegura que los registros se escriban en `data/logs/` para que la aplicación pueda acceder a ellos.

**Lo que hace:**

1. **Siempre construye una nueva versión**: Ejecuta automáticamente `pnpm build-local` para crear una nueva compilación antes de probar (no es necesario construir manualmente primero)
2. **Construye el servicio cron**: Asegura que el servicio cron esté construido (`dist/cron-service.cjs`)
3. **Configura una estructura similar a Docker**: Crea los enlaces simbólicos y la estructura de directorios necesarios para imitar el entorno de Docker
4. **Ejecuta el script de entrada**: Ejecuta `docker-entrypoint.sh` con las variables de entorno adecuadas
5. **Limpia**: Elimina automáticamente los archivos temporales al salir

**Uso:**

```bash
# Run the test (builds fresh version automatically)
pnpm test-entrypoint
```

**Variables de entorno:**
- `PORT=8666` - Puerto para el servidor Next.js (coincide con `start-local`)
- `CRON_PORT=8667` - Puerto para el servicio cron
- `VERSION` - Se establece automáticamente en formato `test-YYYYMMDD-HHMMSS`

**Salida:**
- Los registros se escriben en `data/logs/application.log` (accesibles por la aplicación)
- La salida de la consola muestra la ejecución del script de entrada
- Presiona Ctrl+C para detener y probar el vaciado de registros

**Requisitos:**
- El script debe ejecutarse desde el directorio raíz del repositorio (pnpm maneja esto automáticamente)
- El script maneja automáticamente todos los requisitos previos (compilación, servicio cron, etc.)

**Casos de Uso:**
- Probar cambios en el script de entrypoint localmente antes del despliegue en Docker
- Verificar la rotación de logs y la funcionalidad de registro
- Probar el apagado controlado y el manejo de señales
- Depurar el comportamiento del script de entrypoint en un entorno local

## Resumen Diario validación {/* #daily-summary-validation */}

```bash
pnpm validate-daily-summary
```

Ejecuta comprobaciones deterministas para la programación del Resumen Diario (incluyendo DST), agregación de instantáneas (solo trabajos de copia de seguridad más recientes), poda de configuraciones de notificación sobrantes, filas de copia de seguridad/servidor huérfanas, saneamiento de Markdown, reclamaciones del libro de entregas y migración de esquema 4.1 → 4.2 con plantillas personalizadas. No envía correo electrónico ni NTFY.
