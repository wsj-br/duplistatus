---
translation_last_updated: '2026-01-31T00:51:29.309Z'
source_file_mtime: '2026-01-29T17:58:29.891Z'
source_file_hash: 48575e653bc418bc
translation_language: pt-BR
source_file_path: development/documentation-tools.md
---
# Ferramentas de Documentação {#documentation-tools}

A documentação é construída usando [Docusaurus](https://docusaurus.io/) e está localizada na pasta `documentation`. A documentação é hospedada em [GitHub Pages](https://wsj-br.github.io/duplistatus/) e não está mais incluída na imagem do contêiner Docker.

## Estrutura de Pastas {#folder-structure}

```
documentation/
├── docs/              # Documentation markdown files
│   ├── api-reference/
│   ├── development/
│   ├── installation/
│   ├── migration/
│   ├── release-notes/
│   └── user-guide/
├── src/               # React components and pages
│   ├── components/    # Custom React components
│   ├── css/           # Custom styles
│   └── pages/         # Additional pages (e.g., 404)
├── static/            # Static assets (images, files)
├── docusaurus.config.ts  # Docusaurus configuration
├── sidebars.ts        # Sidebar navigation configuration
└── package.json       # Dependencies and scripts
```

## Comandos Comuns {#common-commands}

Todos os comandos devem ser executados a partir do diretório `documentation`:

### Desenvolvimento {#development}

Inicie o servidor de desenvolvimento com hot-reload:

```bash
cd documentation
pnpm start
```

O site estará disponível em `http://localhost:3000` (ou a próxima porta disponível).

### Compilação {#build}

Construir o site de documentação para produção:

```bash
cd documentation
pnpm build
```

Isto gera arquivos HTML estáticos no diretório `documentation/build`.

### Servir Build de Produção {#serve-production-build}

Visualize a compilação de produção localmente:

```bash
cd documentation
pnpm serve
```

Isto serve o site construído a partir do diretório `documentation/build`.

### Outros Comandos Úteis {#other-useful-commands}

- `pnpm clear` - Limpar cache do Docusaurus
- `pnpm typecheck` - Executar verificação de tipos do TypeScript
- `pnpm write-heading-ids` - Adicionar IDs de títulos aos arquivos markdown para links de âncora

## Gerando README.md {#generating-readmemd}

O arquivo `README.md` do projeto é gerado automaticamente a partir de `documentation/docs/intro.md` para manter o README do repositório GitHub sincronizado com a documentação do Docusaurus.

Para gerar ou atualizar o arquivo README.md:

```bash
./scripts/generate-readme-from-intro.sh
```

Este script:
- Extrai a versão atual de `package.json` e adiciona um badge de versão
- Copia conteúdo de `documentation/docs/intro.md`
- Converte admonições do Docusaurus (note, tip, warning, etc.) para alertas no estilo GitHub
- Converte todos os links relativos do Docusaurus para URLs absolutas de documentação do GitHub (`https://wsj-br.github.io/duplistatus/...`)
- Converte caminhos de imagens de `/img/` para `documentation/static/img/` para compatibilidade com GitHub
- Remove o bloco IMPORTANTE de migração e adiciona uma seção Informações de Migração com um link para a documentação do Docusaurus
- Gera um índice de conteúdo usando `doctoc`
- Gera `README_dockerhub.md` com formatação compatível com Docker Hub (converte imagens e links para URLs absolutas, converte alertas do GitHub para formato baseado em emoji)
- Gera notas de lançamento do GitHub (`RELEASE_NOTES_github_VERSION.md`) de `documentation/docs/release-notes/VERSION.md` (converte links e imagens para URLs absolutas)

**Nota:** Você precisa ter `doctoc` instalado globalmente para a geração do TOC:

```bash
npm install -g doctoc
```

## Atualizar README para Docker Hub {#update-readme-for-docker-hub}

O script `generate-readme-from-intro.sh` gera automaticamente `README_dockerhub.md` com formatação compatível com Docker Hub. Ele:
- Copia `README.md` para `README_dockerhub.md`
- Converte caminhos de imagem relativos para URLs brutas absolutas do GitHub
- Converte links de documento relativos para URLs blob absolutas do GitHub
- Converte alertas no estilo GitHub (`[!NOTE]`, `[!WARNING]`, etc.) para formato baseado em emoji para melhor compatibilidade com Docker Hub
- Garante que todas as imagens e links funcionem corretamente no Docker Hub

## Gerar Notas de Lançamento do GitHub {#generate-github-release-notes}

O script `generate-readme-from-intro.sh` gera automaticamente notas de lançamento do GitHub quando executado. Ele:
- Lê as notas de lançamento de `documentation/docs/release-notes/VERSION.md` (onde VERSION é extraído de `package.json`)
- Altera o título de "# Versão xxxx" para "# Notas de Lançamento - Versão xxxxx"
- Converte links markdown relativos para URLs absolutas de documentação do GitHub (`https://wsj-br.github.io/duplistatus/...`)
- Converte caminhos de imagem para URLs brutas do GitHub (`https://raw.githubusercontent.com/wsj-br/duplistatus/main/documentation/static/img/...`) para exibição adequada em descrições de lançamento
- Trata caminhos relativos com prefixo `../`
- Preserva URLs absolutas (http:// e https://) inalteradas
- Cria `RELEASE_NOTES_github_VERSION.md` na raiz do projeto

# Tradução do Documento

```bash
# This will generate both README.md and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

O arquivo de notas de lançamento gerado pode ser copiado e colado diretamente na descrição de lançamento do GitHub. Todos os links e imagens funcionarão corretamente no contexto de lançamento do GitHub.

**Nota:** O arquivo gerado é temporário e pode ser deletado após criar a versão no GitHub. É recomendado adicionar `RELEASE_NOTES_github_*.md` ao `.gitignore` se você não deseja fazer commit desses arquivos.

## Tirar capturas de tela para documentação {#take-screenshots-for-documentation}

```bash
tsx scripts/take-screenshots.ts
```

Este script captura automaticamente screenshots da aplicação para fins de documentação. Ele:
- Inicia um navegador headless (Puppeteer)
- Faz login como admin e usuário regular
- Navega por várias páginas (painel, detalhes do servidor, configurações, etc.)
- Captura screenshots em diferentes tamanhos de viewport
- Salva screenshots em `documentation/static/img/`

**Requisitos:**
- O servidor de desenvolvimento deve estar em execução em `http://localhost:8666`
- As variáveis de ambiente devem ser definidas:
  - `ADMIN_PASSWORD`: Senha para a conta de admin
  - `USER_PASSWORD`: Senha para a conta de usuário regular

# Tradução do Documento

```bash
export ADMIN_PASSWORD="your-admin-password"
export USER_PASSWORD="your-user-password"
tsx scripts/take-screenshots.ts
```

# Capturas de Tela Geradas:

O script gera as seguintes capturas de tela (salvas em `documentation/static/img/`):

**Capturas de tela do Painel:**
- `screen-main-dashboard-card-mode.png` - Painel em modo de cartão/visão geral
- `screen-main-dashboard-table-mode.png` - Painel em modo de tabela
- `screen-overdue-backup-hover-card.png` - Cartão/tooltip de backup atrasado ao passar o mouse
- `screen-backup-tooltip.png` - Tooltip de backup regular (passar o mouse sobre backup na visualização de cartões)

**Detalhes do Servidor - Capturas de tela:**
- `screen-server-backup-list.png` - Página de lista de backups do Servidor
- `screen-backup-history.png` - Seção de tabela do Histórico de backups
- `screen-backup-detail.png` - Página de Detalhes de backup individual
- `screen-metrics.png` - Gráfico de Métricas mostrando métricas de backup ao longo do tempo

**Capturas de tela de Coletar/Configuração:**
- `screen-collect-button-popup.png` - Popup de coletar logs de backup
- `screen-collect-button-right-click-popup.png` - Menu de clique direito coletar todos
- `screen-collect-backup-logs.png` - Interface de coletar logs de backup
- `screen-duplicati-configuration.png` - Dropdown de Configuração do Duplicati

**Screenshots de Configurações:**
- `screen-settings-left-panel-admin.png` - Barra lateral de Configurações (visualização admin)
- `screen-settings-left-panel-non-admin.png` - Barra lateral de Configurações (visualização não-admin)
- `screen-settings-{tab}.png` - Páginas individuais de Configurações para cada aba:
  - `screen-settings-notifications.png`
  - `screen-settings-overdue.png`
  - `screen-settings-server.png`
  - `screen-settings-ntfy.png`
  - `screen-settings-email.png`
  - `screen-settings-templates.png`
  - `screen-settings-users.png`
  - `screen-settings-audit.png`
  - `screen-settings-audit-retention.png`
  - `screen-settings-display.png`
  - `screen-settings-database-maintenance.png`
- `screen-settings-ntfy-configure-device-popup.png` - Pop-up Configurar dispositivo NTFY
- `screen-settings-backup-notifications-detail.png` - Página de detalhes de Notificações de backup

## Implantando a Documentação {#deploying-the-documentation}

Para implantar a documentação no GitHub Pages, você precisará gerar um Token de Acesso Pessoal do GitHub. Acesse [GitHub Personal Access Tokens](https://github.com/settings/tokens) e crie um novo token com o escopo `repo`.

Quando você tiver o token, execute o seguinte comando para armazenar o token no armazenamento de credenciais do Git:

```bash
./setup-git-credentials.sh
```

Em seguida, para implantar a documentação no GitHub Pages, execute o seguinte comando:

```bash
pnpm run deploy
```

Isto irá compilar a documentação e enviá-la para o branch `gh-pages` do repositório, e a documentação estará disponível em [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/).

## Trabalhando com Documentação {#working-with-documentation}

- Os arquivos de documentação são escritos em Markdown (`.md`) e localizados em `documentation/docs/`
- A navegação da barra lateral é configurada em `documentation/sidebars.ts`
- A configuração do Docusaurus está em `documentation/docusaurus.config.ts`
- Componentes React personalizados podem ser adicionados a `documentation/src/components/`
- Ativos estáticos (imagens, PDFs, etc.) ficam em `documentation/static/`
- A página inicial principal da documentação é `documentation/docs/intro.md`, que é usada como fonte para gerar `README.md`
