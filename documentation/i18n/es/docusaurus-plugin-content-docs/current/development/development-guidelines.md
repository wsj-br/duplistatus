# Referencia de desarrollo {/* #development-reference */}

## Organización del código {/* #code-organisation */}

- **Componentes**: `src/components/` con subdirectorios:
  - `ui/` - componentes de shadcn/ui y elementos de interfaz reutilizables
  - `dashboard/` - componentes específicos del panel de control
  - `settings/` - componentes de la página de configuración
  - `server-details/` - componentes de la página de detalles del servidor
- **Rutas de API**: `src/app/api/` con estructura de punto final RESTful (ver [Referencia de API](../api-reference/overview))
- **Base de datos**: SQLite con better-sqlite3, utilidades en `src/lib/db-utils.ts`, migraciones en `src/lib/db-migrations.ts`
- **Tipos**: interfaces de TypeScript en `src/lib/types.ts`
- **Configuración**: configuraciones predeterminadas en `src/lib/default-config.ts`
- **Servicio Cron**: `src/cron-service/` (se ejecuta en puerto 8667 desarrollo, 9667 producción)
- **Scripts**: scripts de utilidad en el directorio `scripts/`
- **Seguridad**: protección CSRF en `src/lib/csrf-middleware.ts`, usa middleware `withCSRF` para puntos finales protegidos

## Pruebas y depuración {/* #testing--debugging */}

- Generación de datos de prueba: `pnpm generate-test-data --servers=N`
- Pruebas de notificaciones: punto final `/api/notifications/test`
- Comprobaciones de salud de Cron: `curl http://localhost:8667/health` o `curl http://localhost:8666/api/cron/health`
- Pruebas de copias de seguridad vencidas: **Configuración → Monitoreo de copias de seguridad** (**Probar copias de seguridad vencidas**), o `POST /api/notifications/check-overdue` con autenticación
- Modo de desarrollo: registro detallado y almacenamiento en archivo JSON
- Mantenimiento de base de datos: usa el menú de mantenimiento para operaciones de limpieza
- Comprobaciones previas: `scripts/pre-checks.sh` para solucionar problemas de inicio

## Referencias de desarrollo {/* #development-references */}

- Puntos finales de API: consulta [Referencia de API](../api-reference/overview)
- Esquema de base de datos: consulta [Esquema de base de datos](database)
- Sigue los patrones en `src/lib/db-utils.ts` para operaciones de base de datos

## Marcos de trabajo y bibliotecas {/* #frameworks--libraries */}

:::info
Para versiones exactas, consulta [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json) (`dependencies`, `devDependencies`, `engines` y `packageManager`). La siguiente lista es intencionalmente ligera en versiones para mantenerse precisa en futuras actualizaciones de dependencias.
:::

### Entorno de ejecución y gestión de paquetes {/* #runtime--package-management */}
- Node.js (consulta `engines.node`)
- pnpm (aplicado mediante el script `preinstall`; consulta `engines.pnpm` / `packageManager`)

### Marcos de trabajo y bibliotecas principales {/* #core-frameworks--libraries */}
- Next.js (App Router)
- React y React-DOM
- Radix UI (primitivos `@radix-ui/react-*`)
- Tailwind CSS v4 + tailwindcss-animate
- better-sqlite3
- Recharts, react-day-picker, react-hook-form, react-datepicker
- lucide-react, clsx, class-variance-authority
- date-fns, uuid
- bcrypt
- express (servicio cron), node-cron
- nodemailer, qrcode
- ai-i18n-tools, i18next, react-i18next (canalización de traducción de interfaz de usuario y documentación)

### Verificación de tipos y linting {/* #type-checking--linting */}
- TypeScript (modo estricto)
- TSX (para ejecutar scripts de TypeScript)
- ESLint (configuración plana `eslint.config.mjs` + `eslint-config-next`; ejecuta mediante `pnpm lint` → `eslint .`)
- webpack

### Compilación e implementación {/* #build--deployment */}
- Salida independiente de Next.js (`output: 'standalone'`) con punto de entrada del contenedor iniciando `server.js`. El rastreo de archivos aún se ejecuta para la imagen de tiempo de ejecución de Docker; `outputFileTracingExcludes` en `next.config.ts` elimina paquetes solo de compilación (webpack, nativos del compilador SWC, esbuild, minificadores de CSS) y compilaciones previas de `better-sqlite3` que no sean Linux. No excluyas `@swc/helpers`, `sharp` o compilaciones previas de sqlite para Linux.
- Docker (base node:alpine) con compilaciones de múltiples arquitecturas (AMD64, ARM64). La imagen compila solo la aplicación Next.js (no el sitio Docusaurus); la versión de pnpm se toma de `packageManager` en `package.json`
- Flujos de trabajo de GitHub Actions para CI/CD
- Inkscape para logotipos e imágenes
- Docusaurus para documentación
- Greenfish Icon Editor para iconos

### Configuración del proyecto {/* #project-configuration */}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## Características del Sistema {/* #system-features */}

- **Cron Service**: Servicio independiente para tareas programadas, iniciado por `docker-entrypoint.sh` en implementaciones de Docker
- **Notificaciones**: Integración de ntfy.sh y correo electrónico SMTP (nodemailer), plantillas configurables
- **Actualización automática**: Actualización automática configurable para el panel de control y páginas de detalle
