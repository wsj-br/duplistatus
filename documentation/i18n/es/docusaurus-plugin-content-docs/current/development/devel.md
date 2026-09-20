# Comandos más utilizados {/* #most-used-commands */}

## Ejecutar en modo de desarrollo {/* #run-in-dev-mode */}

```bash
pnpm dev
```

Esto inicia tanto la aplicación Next.js (puerto 8666) como el servicio cron (puerto 8667). CTRL-C detiene ambos. Usa `pnpm dev:next` o `pnpm cron:dev` para ejecutar cualquiera de los procesos por separado.

- **Almacenamiento de archivos JSON**: Todos los datos de copia de seguridad recibidos se almacenan como archivos JSON en el directorio `data`. Estos archivos se nombran utilizando la marca de tiempo de cuándo fueron recibidos, en el formato `YYYY-MM-DDTHH-mm-ss-sssZ.json` (hora UTC). Esta función solo está activa en modo de desarrollo y ayuda con la depuración al preservar los datos sin procesar recibidos de Duplicati.

- **Registro detallado**: La aplicación registra información más detallada sobre operaciones de base de datos y solicitudes de API cuando se ejecuta en modo de desarrollo.

- **Actualización de versión**: El servidor de desarrollo actualiza automáticamente la información de versión antes de iniciarse, asegurando que se muestre la versión más reciente en la aplicación.

- **Eliminación de copia de seguridad**: En la página de detalles del servidor, aparece un botón de eliminar en la tabla de copias de seguridad que te permite eliminar copias de seguridad individuales. Esta función es especialmente útil para probar y depurar la funcionalidad de copias de seguridad pendientes.

## Iniciar el servidor de producción (en entorno de desarrollo) {/* #start-the-production-server-in-development-environment */}

Primero, compila la aplicación para producción local:

```bash
pnpm build-local
```

Luego inicia el servidor de producción:

```bash
pnpm start-local
```

## Iniciar una pila de Docker (Docker Compose) {/* #start-a-docker-stack-docker-compose */}

```bash
pnpm docker:up
```

O manualmente:

```bash
docker compose up --build -d
```

## Detener una pila de Docker (Docker Compose) {/* #stop-a-docker-stack-docker-compose */}

```bash
pnpm docker:down
```

O manualmente:

```bash
docker compose down
```

## Limpiar entorno de Docker {/* #clean-docker-environment */}

```bash
pnpm docker:clean
```

O manualmente:

```bash
./scripts/clean-docker.sh
```

Este script realiza una limpieza completa de Docker, que es útil para:
- Liberar espacio en disco
- Eliminar artefactos antiguos/no utilizados de Docker
- Limpiar después de sesiones de desarrollo o pruebas
- Mantener un entorno de Docker limpio

## Crear una imagen de desarrollo (para probar localmente o con Podman) {/* #create-a-development-image-to-test-locally-or-with-podman */}

```bash
export $(grep -v '^#' .env | xargs) && docker build . -t wsj-br/duplistatus:devel-$VERSION
```
