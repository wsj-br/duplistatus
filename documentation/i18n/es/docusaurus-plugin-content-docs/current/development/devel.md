# Comandos más utilizados {/* #most-used-commands */}

## Ejecutar en modo desarrollo {/* #run-in-dev-mode */}

```bash
pnpm dev
```

Esto inicia tanto la aplicación Next.js (puerto 8666) como el servicio cron (puerto 8667). CTRL-C detiene ambos. Usa `pnpm dev:next` o `pnpm cron:dev` para ejecutar cada proceso por separado.

- **Almacenamiento de archivos JSON**: Todos los datos de copia de seguridad recibidos se almacenan como archivos JSON en el directorio `data`. Estos archivos se nombran utilizando la marca de tiempo de cuando se recibieron, en el formato `YYYY-MM-DDTHH-mm-ss-sssZ.json` (hora UTC). Esta función solo está activa en modo desarrollo y ayuda con la depuración al preservar los datos crudos recibidos de Duplicati.

- **Registro detallado**: La aplicación registra información más detallada sobre las operaciones de la base de datos y las solicitudes de API cuando se ejecuta en modo desarrollo.

- **Actualización de versión**: El servidor de desarrollo actualiza automáticamente la información de la versión antes de iniciar, asegurando que la versión más reciente se muestre en la aplicación.

- **Eliminación de copias de seguridad**: En la página de detalles del servidor, aparece un botón de eliminar en la tabla de copias de seguridad que permite eliminar copias de seguridad individuales. Esta función es especialmente útil para probar y depurar la funcionalidad de copias de seguridad pendientes.

## Iniciar el servidor de producción (en entorno de desarrollo) {/* #start-the-production-server-in-development-environment */}

Primero, construye la aplicación para producción local:

```bash
pnpm build-local
```

Luego, inicia el servidor de producción:

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

## Limpiar el entorno de Docker {/* #clean-docker-environment */}

```bash
pnpm docker:clean
```

O manualmente:

```bash
./scripts/clean-docker.sh
```

Este script realiza una limpieza completa de Docker, lo cual es útil para:
- Liberar espacio en disco
- Eliminar artefactos de Docker antiguos/no utilizados
- Limpiar después de sesiones de desarrollo o pruebas
- Mantener un entorno de Docker limpio

## Crear una imagen de desarrollo (para probar localmente o con Podman) {/* #create-a-development-image-to-test-locally-or-with-podman */}

```bash
export $(grep -v '^#' .env | xargs) && docker build . -t wsj-br/duplistatus:devel-$VERSION
```
