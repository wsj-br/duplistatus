---
translation_last_updated: '2026-05-06T23:19:54.744Z'
source_file_mtime: '2026-05-06T23:18:51.406Z'
source_file_hash: c7ae1bc72c936d2aee0a62300df6c52bf8f2bbcc98ea4f2271e966cc459510be
translation_language: pt-BR
source_file_path: documentation/docs/development/development-guidelines.md
translation_models:
  - anthropic/claude-3.5-haiku
  - anthropic/claude-haiku-4.5
  - qwen/qwen3-235b-a22b-2507
---
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

### Tempo de Execução e Gerenciamento de Pacotes {#runtime--package-management}
- Node.js >=24.12.0
- pnpm >=10.24.0 (packageManager: pnpm@10.30.3)

### Frameworks e Bibliotecas Principais {#core-frameworks--libraries}
- Next.js ^16.1.6 (App Router)
- React ^19.2.4 & React-DOM ^19.2.4
- Radix UI (`@radix-ui/react-*`): ^1.1.8 - ^2.2.6 (accordion ^1.2.12, alert-dialog ^1.1.15, avatar ^1.1.11, checkbox ^1.3.3, dialog ^1.1.15, dropdown-menu ^2.1.16, label ^2.1.8, menubar ^1.1.16, popover ^1.1.15, progress ^1.1.8, radio-group ^1.3.8, scroll-area ^1.2.10, select ^2.2.6, separator ^1.1.8, slider ^1.3.6, slot ^1.2.4, switch ^1.2.6, tabs ^1.1.13, toast ^1.2.15, tooltip ^1.2.8)
- Tailwind CSS ^4.2.1 + tailwindcss-animate ^1.0.7
- Better-sqlite3 ^12.6.2
- Recharts ^3.7.0, react-day-picker ^9.14.0, react-hook-form ^7.71.2, react-datepicker ^9.1.0
- lucide-react ^0.575.0, clsx ^2.1.1, class-variance-authority ^0.7.1
- date-fns ^4.1.0, uuid ^13.0.0
- express ^5.2.1 (serviço cron), node-cron ^4.2.1
- nodemailer ^8.0.1, qrcode ^1.5.4
- ai-i18n-tools ^1.x, i18next ^26.x, react-i18next ^17.x (pipeline de tradução para interface e documentação)

### Verificação de Tipos e Análise de Código {#type-checking--linting}
- TypeScript ^5.9.3
- TSX ^4.21.0
- ESLint ^9.16.0 (via `next lint`)
- webpack ^5.105.3

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
