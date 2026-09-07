# Referencia de desarrollo {/* #development-reference */}

## Organización del Código {/* #code-organisation */}

- **Componentes**: `src/components/` con subdirectorios:
  - `ui/` - componentes shadcn/ui y elementos de interfaz reutilizables
  - `dashboard/` - componentes específicos del panel de control
  - `settings/` - componentes de la página de configuración
  - `server-details/` - componentes de la página de detalles del servidor
- **Rutas de API**: `src/app/api/` con estructura de puntos de conexión RESTful (ver [Referencia de API](../api-reference/overview))
- **Base de datos**: SQLite con better-sqlite3, utilidades en `src/lib/db-utils.ts`, migraciones en `src/lib/db-migrations.ts`
- **Tipos**: interfaces de TypeScript en `src/lib/types.ts`
- **Configuración**: Configuraciones por defecto en `src/lib/default-config.ts`
- **Servicio Cron**: `src/cron-service/` (se ejecuta en el puerto 8667 en desarrollo, 9667 en producción)
- **Scripts**: Scripts de utilidad en el directorio `scripts/`
- **Seguridad**: Protección CSRF en `src/lib/csrf-middleware.ts`, usar middleware `withCSRF` para puntos de conexión protegidos

## Pruebas y Depuración {/* #testing--debugging */}

- Generación de datos de prueba: `pnpm generate-test-data --servers=N`
- Pruebas de notificaciones: punto de conexión `/api/notifications/test`
- Comprobaciones de estado del cron: `curl http://localhost:8667/health` o `curl http://localhost:8666/api/cron/health`
- Pruebas de copia de seguridad retrasada: **Configuración → Monitoreo de Copias de Seguridad** (**Probar respaldos atrasados**), o `POST /api/notifications/check-overdue` con autenticación
- Modo de desarrollo: registro detallado y almacenamiento en archivos JSON
- Mantenimiento de la base de datos: usar el menú de mantenimiento para operaciones de limpieza
- Preverificaciones: `scripts/pre-checks.sh` para solucionar problemas de inicio

## Referencias de Desarrollo {/* #development-references */}

- Puntos finales de API: Consulte [Referencia de API](../api-reference/overview)
- Esquema de base de datos: Consulte [Esquema de base de datos](database)
- Siga los patrones en `src/lib/db-utils.ts` para operaciones de base de datos

## Frameworks y Bibliotecas {/* #frameworks--libraries */}

:::info
Para obtener las versiones exactas, consulte [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json) (`dependencies`, `devDependencies`, `engines` y `packageManager`). La siguiente lista es intencionadamente ligera en cuanto a versiones para que siga siendo precisa tras las actualizaciones de dependencias.
:::

### Gestión de Runtime y Paquetes {/* #runtime--package-management */}
- Node.js (ver `engines.node`)
- pnpm (aplicado a través del script `preinstall`; ver `engines.pnpm` / `packageManager`)

### Frameworks y Bibliotecas Principales {/* #core-frameworks--libraries */}
- Next.js (App Router)
- React y React-DOM
- Radix UI (primitivas de `@radix-ui/react-*`)
- Tailwind CSS v4 + tailwindcss-animate
- better-sqlite3
- Recharts, react-day-picker, react-hook-form, react-datepicker
- lucide-react, clsx, class-variance-authority
- date-fns, uuid
- bcrypt
- express (servicio cron), node-cron
- nodemailer, qrcode
- ai-i18n-tools, i18next, react-i18next (pipeline de traducción de UI y documentación)

### Comprobación de Tipos y Linting {/* #type-checking--linting */}
- TypeScript (modo estricto)
- TSX (para ejecutar scripts de TypeScript)
- ESLint (configuración plana `eslint.config.mjs` + `eslint-config-next`; ejecutar a través de `pnpm lint` → `eslint .`)
- webpack

### Construcción e Implementación {/* #build--deployment */}
- Salida independiente de Next.js (`output: 'standalone'`) con punto de entrada de contenedor que comienza `server.js`
- Docker (base node:alpine) con compilaciones multiarquitectura (AMD64, ARM64). La imagen compila solo la aplicación Next.js (no el sitio Docusaurus); la versión de pnpm se toma de `packageManager` en `package.json`
- Flujos de trabajo de GitHub Actions para CI/CD
- Inkscape para logotipos e imágenes
- Docusaurus para documentación
- Greenfish Icon Editor para iconos

### Configuración del Proyecto {/* #project-configuration */}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## Características del Sistema {/* #system-features */}

- **Servicio Cron**: Servicio separado para tareas programadas, iniciado por `docker-entrypoint.sh` en implementaciones de Docker
- **Notificaciones**: Integración de ntfy.sh y correo electrónico SMTP (nodemailer), plantillas configurables
- **Actualización automática**: Actualización automática configurable para el panel de control y páginas de detalles
