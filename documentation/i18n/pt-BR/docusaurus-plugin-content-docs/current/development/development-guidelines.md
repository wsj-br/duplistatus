# Referência de Desenvolvimento {/* #development-reference */}

## Organização do Código {/* #code-organisation */}

- **Componentes**: `src/components/` com subdiretórios:
  - `ui/` - componentes shadcn/ui e elementos de UI reutilizáveis
  - `dashboard/` - componentes específicos do painel
  - `settings/` - componentes da página de configurações
  - `server-details/` - componentes da página de detalhes do servidor
- **Rotas de API**: `src/app/api/` com estrutura de endpoint RESTful (veja [Referência de API](../api-reference/overview))
- **Banco de Dados**: SQLite com better-sqlite3, utilitários em `src/lib/db-utils.ts`, migrações em `src/lib/db-migrations.ts`
- **Tipos**: Interfaces TypeScript em `src/lib/types.ts`
- **Configuração**: Configurações padrão em `src/lib/default-config.ts`
- **Serviço Cron**: `src/cron-service/` (executa na porta 8667 dev, 9667 prod)
- **Scripts**: Scripts utilitários em diretório `scripts/`
- **Segurança**: Proteção CSRF em `src/lib/csrf-middleware.ts`, use middleware `withCSRF` para endpoints protegidos

## Testes e Depuração {/* #testing--debugging */}

- Geração de dados de teste: `pnpm generate-test-data --servers=N`
- Teste de notificações: endpoint `/api/notifications/test`
- Verificação de saúde do Cron: `curl http://localhost:8667/health` ou `curl http://localhost:8666/api/cron/health`
- Teste de backups atrasados: **Configurações → Monitoramento de Backup** (**Testar backups atrasados**), ou `POST /api/notifications/check-overdue` com autenticação
- Modo de desenvolvimento: registro detalhado e armazenamento em arquivo JSON
- Manutenção do banco de dados: use o menu de manutenção para operações de limpeza
- Pré-verificações: `scripts/pre-checks.sh` para solucionar problemas de inicialização

## Referências de Desenvolvimento {/* #development-references */}

- Endpoints de API: Veja [Referência de API](../api-reference/overview)
- Esquema do banco de dados: Veja [Esquema do Banco de Dados](database)
- Siga os padrões em `src/lib/db-utils.ts` para operações de banco de dados

## Frameworks e Bibliotecas {/* #frameworks--libraries */}

:::info
Para versões exatas, veja [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json) (`dependencies`, `devDependencies`, `engines`, e `packageManager`). A lista abaixo é propositalmente leve em versões para ficar precisa em atualizações de dependências.
:::

### Runtime e Gerenciamento de Pacotes {/* #runtime--package-management */}
- Node.js (veja `engines.node`)
- pnpm (imposto via script `preinstall`; veja `engines.pnpm` / `packageManager`)

### Frameworks e Bibliotecas Principais {/* #core-frameworks--libraries */}
- Next.js (App Router)
- React & React-DOM
- Radix UI (primitivas `@radix-ui/react-*`)
- Tailwind CSS v4 + tailwindcss-animate
- better-sqlite3
- Recharts, react-day-picker, react-hook-form, react-datepicker
- lucide-react, clsx, class-variance-authority
- date-fns, uuid
- bcrypt
- express (serviço cron), node-cron
- nodemailer, qrcode
- ai-i18n-tools, i18next, react-i18next (pipeline de tradução de UI + docs)

### Verificação de Tipos e Linting {/* #type-checking--linting */}
- TypeScript (modo estrito)
- TSX (para executar scripts TypeScript)
- ESLint (configuração flat `eslint.config.mjs` + `eslint-config-next`; execute via `pnpm lint` → `eslint .`)
- webpack

### Build e Implantação {/* #build--deployment */}
- Saída standalone do Next.js (`output: 'standalone'`) com entrypoint do container iniciando `server.js`. O rastreamento de arquivos ainda é executado para a imagem de runtime Docker; `outputFileTracingExcludes` em `next.config.ts` remove pacotes apenas de build (webpack, compiladores nativos SWC, esbuild, minificadores CSS) e prebuilds não-Linux `better-sqlite3`. Não exclua `@swc/helpers`, `sharp`, ou prebuilds Linux sqlite.
- Docker (base node:alpine) com builds multi-arquitetura (AMD64, ARM64). A imagem constrói apenas o aplicativo Next.js (não o site Docusaurus); a versão do pnpm é tomada de `packageManager` em `package.json`
- Fluxos de trabalho do GitHub Actions para CI/CD
- Inkscape para logotipos e imagens
- Docusaurus para documentação
- Greenfish Icon Editor para ícones

### Configuração do Projeto {/* #project-configuration */}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## Recursos do Sistema {/* #system-features */}

- **Serviço Cron**: Serviço separado para tarefas agendadas, iniciado por `docker-entrypoint.sh` em implantações Docker
- **Notificações**: integração ntfy.sh e e-mail SMTP (nodemailer), modelos configuráveis
- **Atualização automática**: atualização automática configurável para páginas de painel e detalhes
