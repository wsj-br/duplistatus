# Referencia de desarrollo {/* #development-reference */}

## Organización del código {/* #code-organisation */}

- **Componentes**: `src/components/` con subdirectorios:
  - `ui/` - componentes shadcn/ui y elementos de interfaz reutilizables
  - `dashboard/` - componentes específicos del panel de control
  - `settings/` - componentes de la página de configuración
  - `server-details/` - componentes de la página de detalles del servidor
- **Rutas de API**: `src/app/api/` con estructura de puntos finales RESTful (ver [Referencia de API](../api-reference/overview))
- **Base de datos**: SQLite con better-sqlite3, utilidades en `src/lib/db-utils.ts`, migraciones en `src/lib/db-migrations.ts`
- **Tipos**: Interfaces de TypeScript en `src/lib/types.ts`
- **Configuración**: Configuraciones predeterminadas en `src/lib/default-config.ts`
- **Servicio Cron**: `src/cron-service/` (se ejecuta en el puerto 8667 en desarrollo, 9667 en producción)
- **Scripts**: Scripts de utilidad en el directorio `scripts/`
- **Seguridad**: Protección CSRF en `src/lib/csrf-middleware.ts`, usar el middleware `withCSRF` para puntos finales protegidos

## Pruebas y depuración {/* #testing--debugging */}

- Generación de datos de prueba: `pnpm generate-test-data --servers=N`
- Pruebas de notificaciones: punto final `/api/notifications/test`
- Comprobaciones de salud de Cron: `curl http://localhost:8667/health` o `curl http://localhost:8666/api/cron/health`
- Pruebas de copias de seguridad vencidas: **Configuración → Monitoreo de copias de seguridad** (**Probar copias de seguridad vencidas**), o `POST /api/notifications/check-overdue` con autenticación
- Modo de desarrollo: registro detallado y almacenamiento de archivos JSON
- Mantenimiento de la base de datos: usar el menú de mantenimiento para operaciones de limpieza
- Pre-verificaciones: `scripts/pre-checks.sh` para solucionar problemas de inicio

## Referencias de desarrollo {/* #development-references */}

- Puntos finales de API: Ver [Referencia de API](../api-reference/overview)
- Esquema de base de datos: Ver [Esquema de base de datos](database)
- Seguir patrones en `src/lib/db-utils.ts` para operaciones de base de datos

## Marcos y bibliotecas {/* #frameworks--libraries */}

:::info
Para versiones exactas, ver [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json) (`dependencies`, `devDependencies`, `engines`, y `packageManager`). La lista a continuación es intencionalmente liviana en versiones para que se mantenga precisa en las actualizaciones de dependencias.
:::

### Tiempo de ejecución y gestión de paquetes {/* #runtime--package-management */}
- Node.js (ver `engines.node`)
- pnpm (impuesto mediante el script `preinstall`; ver `engines.pnpm` / `packageManager`)

### Marcos y bibliotecas principales {/* #core-frameworks--libraries */}
- Next.js (App Router)
- React & React-DOM
- Radix UI (primitivas `@radix-ui/react-*`)
- Tailwind CSS v4 + tailwindcss-animate
- better-sqlite3
- Recharts, react-day-picker, react-hook-form, react-datepicker
- lucide-react, clsx, class-variance-authority
- date-fns, uuid
- bcrypt
- express (servicio cron), node-cron
- nodemailer, qrcode
- ai-i18n-tools, i18next, react-i18next (pipeline de traducción de UI + docs)

### Comprobación de tipos y linting {/* #type-checking--linting */}
- TypeScript (modo estricto)
- TSX (para ejecutar scripts de TypeScript)
- ESLint (configuración plana `eslint.config.mjs` + `eslint-config-next`; ejecutar mediante `pnpm lint` → `eslint .`)
- webpack

### Construcción y despliegue {/* #build--deployment */}
- Salida independiente de Next.js (`output: 'standalone'`) con punto de entrada de contenedor iniciando `server.js`. El seguimiento de archivos aún se ejecuta para la imagen de tiempo de ejecución de Docker; `outputFileTracingExcludes` en `next.config.ts` elimina paquetes solo de construcción (webpack, compiladores nativos de SWC, esbuild, minificadores de CSS) y precompilaciones no Linux de `better-sqlite3`. No excluir `@swc/helpers`, `sharp`, o precompilaciones de sqlite para Linux.
- Docker (base node:alpine) con compilaciones multiarquitectura (AMD64, ARM64). La imagen construye solo la aplicación Next.js (no el sitio Docusaurus); la versión de pnpm se toma de `packageManager` en `package.json`
- Flujos de trabajo de GitHub Actions para CI/CD
- Inkscape para logotipos y fotos
- Docusaurus para documentación
- Greenfish Icon Editor para iconos

### Configuración del Proyecto {/* #project-configuration */}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## Características del Sistema {/* #system-features */}

- **Servicio Cron**: Servicio separado para tareas programadas, iniciado por `docker-entrypoint.sh` en despliegues de Docker
- **Notificaciones**: integración con ntfy.sh y correo electrónico SMTP (nodemailer), plantillas configurables
- **Actualización automática**: actualización automática configurable para páginas de panel y detalles
