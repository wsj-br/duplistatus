# Referência de Desenvolvimento {#development-reference}

## Organização do Código {#code-organisation}

- **Componentes**: `src/components/` com subdiretórios:
  - `ui/` - componentes shadcn/ui e elementos de interface reutilizáveis
  - `dashboard/` - componentes específicos do painel
  - `settings/` - componentes da página de configurações
  - `server-details/` - componentes da página de detalhes do servidor
- **Rotas da API**: `src/app/api/` com estrutura de endpoints RESTful (veja [Referência da API](../api-reference/overview))
- **Banco de Dados**: SQLite com better-sqlite3, utilitários em `src/lib/db-utils.ts`, migrações em `src/lib/db-migrations.ts`
- **Tipos**: interfaces TypeScript em `src/lib/types.ts`
- **Configuração**: configurações padrão em `src/lib/default-config.ts`
- **Serviço Cron**: `src/cron-service/` (executa na porta 8667 em desenvolvimento, 9667 em produção)
- **Scripts**: scripts utilitários no diretório `scripts/`
- **Segurança**: proteção CSRF em `src/lib/csrf-middleware.ts`, use o middleware `withCSRF` para endpoints protegidos

## Testes e Depuração {#testing--debugging}

- Geração de dados de teste: `pnpm generate-test-data --servers=N`
- Teste de notificações: endpoint `/api/notifications/test`
- Verificações de saúde do cron: `curl http://localhost:8667/health` ou `curl http://localhost:8666/api/cron/health`
- Teste de backup atrasado: **Configurações → Monitoramento de Backup** (**Testar backups atrasados**), ou `POST /api/notifications/check-overdue` com autenticação
- Modo de desenvolvimento: logs detalhados e armazenamento em arquivos JSON
- Manutenção do banco de dados: use o menu de manutenção para operações de limpeza
- Pré-verificações: `scripts/pre-checks.sh` para solução de problemas na inicialização

## Referências de Desenvolvimento {#development-references}

- Endpoints de API: Consulte [Referência de API](../api-reference/overview)
- Schema do banco de dados: Consulte [Schema do Banco de Dados](database)
- Siga os padrões em `src/lib/db-utils.ts` para operações de banco de dados

## Frameworks e Bibliotecas {#frameworks--libraries}

:::info
Para versões exatas, consulte [`package.json`](https://github.com/wsj-br/duplistatus/blob/master/package.json) (`dependencies`, `devDependencies`, `engines` e `packageManager`). A lista abaixo é intencionalmente simplificada em relação às versões para que permaneça precisa após atualizações de dependências.
:::

### Runtime e Gerenciamento de Pacotes {#runtime--package-management}
- Node.js (consulte `engines.node`)
- pnpm (imposto via script `preinstall`; consulte `engines.pnpm` / `packageManager`)

### Frameworks e Bibliotecas Principais {#core-frameworks--libraries}
- Next.js (App Router)
- React e React-DOM
- Radix UI (primitivos `@radix-ui/react-*`)
- Tailwind CSS v4 + tailwindcss-animate
- better-sqlite3
- Recharts, react-day-picker, react-hook-form, react-datepicker
- lucide-react, clsx, class-variance-authority
- date-fns, uuid
- bcrypt
- express (serviço de cron), node-cron
- nodemailer, qrcode
- ai-i18n-tools, i18next, react-i18next (pipeline de tradução de UI e docs)

### Verificação de Tipos e Linting {#type-checking--linting}
- TypeScript (modo estrito)
- TSX (para executar scripts TypeScript)
- ESLint (flat config `eslint.config.mjs` + `eslint-config-next`; execute via `pnpm lint` → `eslint .`)
- webpack

### Compilação e Implantação {#build--deployment}
- Saída standalone do Next.js (`output: 'standalone'`) com ponto de entrada do contêiner iniciando `server.js`
- Docker (base node:alpine) com compilações multiarquitetura (AMD64, ARM64)
- Fluxos de trabalho do GitHub Actions para CI/CD
- Inkscape para logos e imagens
- Docusaurus para documentação
- Greenfish Icon Editor para ícones

### Configuração do Projeto {#project-configuration}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## Recursos do Sistema {#system-features}

- **Serviço Cron**: Serviço separado para tarefas agendadas, iniciado por `docker-entrypoint.sh` em implantações Docker
- **Notificações**: Integração com ntfy.sh e E-mail SMTP (nodemailer), modelos configuráveis
- **Atualização automática**: Atualização automática configurável para o painel e páginas de detalhes
