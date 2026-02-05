---
translation_last_updated: '2026-02-05T00:21:07.915Z'
source_file_mtime: '2026-01-27T14:22:06.830Z'
source_file_hash: 1afab25f18ff213d
translation_language: pt-BR
source_file_path: development/development-guidelines.md
---
# Referência de Desenvolvimento {#development-reference}

## Organização do Código {#code-organisation}

- **Componentes**: `src/components/` com subdiretórios:
  - `ui/` - componentes shadcn/ui e elementos de interface reutilizáveis
  - `dashboard/` - Componentes específicos do Painel
  - `settings/` - Componentes da página de Configurações
  - `server-details/` - Componentes da página de Detalhes do Servidor
- **Rotas de API**: `src/app/api/` com estrutura de endpoints RESTful (veja [Referência de API](../api-reference/overview))
- **Banco de Dados**: SQLite com better-sqlite3, utilitários em `src/lib/db-utils.ts`, migrações em `src/lib/db-migrations.ts`
- **Tipos**: Interfaces TypeScript em `src/lib/types.ts`
- **Configuração**: Configurações padrão em `src/lib/default-config.ts`
- **Serviço Cron**: `src/cron-service/` (executa na porta 8667 dev, 9667 prod)
- **Scripts**: Scripts utilitários no diretório `scripts/`
- **Segurança**: Proteção CSRF em `src/lib/csrf-middleware.ts`, use o middleware `withCSRF` para endpoints protegidos

## Testes e Depuração {#testing-debugging}

- Geração de dados de teste: `pnpm generate-test-data --servers=N`
- Teste de notificações: endpoint `/api/notifications/test`
- Verificações de saúde do Cron: `curl http://localhost:8667/health` ou `curl http://localhost:8666/api/cron/health`
- Teste de backup atrasado: `pnpm run-overdue-check`
- Modo de desenvolvimento: registro detalhado e armazenamento em arquivo JSON
- Manutenção do banco de dados: use o menu de manutenção para operações de limpeza
- Pré-verificações: `scripts/pre-checks.sh` para solucionar problemas de inicialização

## Referências de Desenvolvimento {#development-references}

- Endpoints de API: Consulte [Referência de API](../api-reference/overview)
- Schema do banco de dados: Consulte [Schema do Banco de Dados](database)
- Siga os padrões em `src/lib/db-utils.ts` para operações de banco de dados

## Frameworks e Bibliotecas {#frameworks-libraries}

### Runtime & Gerenciamento de Pacotes {#runtime-package-management}
- Node.js >=24.12.0
- pnpm >=10.24.0 (packageManager: pnpm@10.28.0)

### Estruturas e Bibliotecas Principais {#core-frameworks-libraries}
- Next.js ^16.1.1 (App Router)
- React ^19.2.3 & React-DOM ^19.2.3
- Radix UI (@radix-ui/react-*): ^1.1.8 - ^2.2.6 (accordion ^1.2.12, alert-dialog ^1.1.15, avatar ^1.1.11, checkbox ^1.3.3, dialog ^1.1.15, dropdown-menu ^2.1.16, label ^2.1.8, menubar ^1.1.16, popover ^1.1.15, progress ^1.1.8, radio-group ^1.3.8, scroll-area ^1.2.10, select ^2.2.6, separator ^1.1.8, slider ^1.3.6, slot ^1.2.4, switch ^1.2.6, tabs ^1.1.13, toast ^1.2.15, tooltip ^1.2.8)
- Tailwind CSS ^4.1.18 + tailwindcss-animate ^1.0.7
- Better-sqlite3 ^12.6.0
- Recharts ^3.6.0, react-day-picker ^9.13.0, react-hook-form ^7.70.0, react-datepicker ^9.1.0
- lucide-react ^0.562.0, clsx ^2.1.1, class-variance-authority ^0.7.1
- date-fns ^4.1.0, uuid ^13.0.0
- express ^5.2.1 (serviço cron), node-cron ^4.2.1
- nodemailer ^7.0.12, qrcode ^1.5.4

### Verificação de Tipos e Linting {#type-checking-linting}
- TypeScript ^5.9.3
- TSX ^4.21.0
- ESLint ^9.39.2 (via `next lint`)

### Compilação e Implantação {#build-deployment}
- Saída standalone do Next.js (`output: 'standalone'`) com ponto de entrada do container iniciando `server.js`
- Docker (base node:alpine) com compilações multi-arquitetura (AMD64, ARM64)
- Fluxos de trabalho do GitHub Actions para CI/CD
- Inkscape para logotipos e imagens
- Docusaurus para documentação
- Greenfish Icon Editor para ícones

### Configuração do Projeto {#project-configuration}
- `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- `pnpm-workspace.yaml`, `components.json` (shadcn/ui)

## Recursos do Sistema {#system-features}

- **Serviço Cron**: Serviço separado para tarefas agendadas, reinicialização automática via `duplistatus-cron.sh`
- **Notificações**: integração ntfy.sh e e-mail SMTP (nodemailer), modelos configuráveis
- **Atualizar automaticamente**: Atualização automática configurável para o painel e páginas de detalhes
