# Configuração de Desenvolvimento {#development-setup}

## Pré-requisitos {#prerequisites}

- Docker / Docker Compose
- Node.js (consulte `engines.node` em `package.json`)
- pnpm (consulte `engines.pnpm` / `packageManager` em `package.json`)
- SQLite3
- Inkscape (para tradução de documentação SVG e exportação PNG; necessário apenas se você executar `translate` ou `translate:svg`)
- bat/batcat (para mostrar uma versão bonita do `translate:help`)
- direnv (para carregar automaticamente os arquivos `.env*`)
- Playwright Chromium (execute `pnpm take-screenshots:install` após `pnpm install`; isso executa `playwright install chromium`)

## Etapas {#steps}

### 1. Clonar o repositório: {#1-clone-the-repository}

    ```bash
    git clone https://github.com/wsj-br/duplistatus.git
    cd duplistatus
    ```

### 2. Instalar dependências (Debian/Ubuntu): {#2-install-dependencies-debianubuntu}

    ```bash
    sudo apt update
    sudo apt install sqlite3 git inkscape bat -y
    ```

### 3. Remover instalações antigas do Node.js (se já estiver instalado) {#3-remove-old-nodejs-installations-if-you-already-have-it-installed}

    ```bash
    sudo apt-get purge nodejs npm -y
    sudo apt-get autoremove -y
    sudo rm -rf /usr/local/bin/npm 
    sudo rm -rf /usr/local/share/man/man1/node* 
    sudo rm -rf /usr/local/lib/dtrace/node.d
    rm -rf ~/.npm
    rm -rf ~/.node-gyp
    sudo rm -rf /opt/local/bin/node
    sudo rm -rf /opt/local/include/node
    sudo rm -rf /opt/local/lib/node_modules
    sudo rm -rf /usr/local/lib/node*
    sudo rm -rf /usr/local/include/node*
    sudo rm -rf /usr/local/bin/node*
    ```

### 4. Instalar Node.js e pnpm: {#4-install-nodejs-and-pnpm}

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
    npm install -g pnpm npm-check-updates doctoc
    ```

### 5. Configurar suporte ao direnv {#5-set-up-direnv-support}

Adicione estas linhas ao arquivo `~/.bashrc`

    ```bash 
    # direnv support (apt install direnv)
    eval "$(direnv hook bash)"
    ```

com este comando:

    ```bash 
    (echo "# direnv support (apt install direnv)"; echo 'eval "$(direnv hook bash)') >> ~/.bashrc
    ```

no diretório base do repositório, execute:

    ```bash
    direnv allow
    ```

Adicione estas linhas ao arquivo `~/.profile`

    ```bash 
    # export the Bash environment (needed for code editor or AI Agents to load it).
    export BASH_ENV="$HOME/.bashrc"
    ```

com este comando:

    ```bash 
    (echo "# export the Bash environment (needed for code editor or AI Agents to load it)."; \
     echo 'export BASH_ENV="$HOME/.bashrc"') >> ~/.profile
    ```

:::info
  Você precisa reabrir o terminal ou pode precisar fechar/reabrir o IDE do editor de código (Visual Studio Code, 
  Cursor, Lingma, Antigravity, Zed, ...) para que essas alterações entrem em vigor.
:::

### 6. Criar o arquivo `.env` no diretório base do repositório com essas variáveis. {#6-create-the-env-file-at-the-repository-basedir-with-these-variables}

- Você pode usar qualquer valor para `VERSION`; ele será atualizado automaticamente ao usar os scripts de desenvolvimento.
- Use senhas aleatórias para `ADMIN_PASSWORD` e `USER_PASSWORD`; essas senhas serão usadas no script `pnpm take-screenshots`.
- Você pode obter a `OPENROUTER_API_KEY` em [openrouter.ai](https://openrouter.ai).

    ```bash
    VERSION=x.x.x

    # Development user passwords
    ADMIN_PASSWORD="admin_secret"
    USER_PASSWORD="user_secret"


    # Openrouter.ai API key for translation scripts in documentation 
    OPENROUTER_API_KEY=sk-or-v1-your-key-for-translate-files
    ```

## Scripts Disponíveis {#available-scripts}

O projeto inclui vários scripts npm para diferentes tarefas de desenvolvimento:

### Scripts de Desenvolvimento {#development-scripts}
- `pnpm dev` - Iniciar o servidor de desenvolvimento Next.js (porta 8666) e o serviço cron (porta 8667) juntos via `concurrently` (inclui pré-verificações). CTRL-C para parar ambos. `NODE_OPTIONS` para Next.js carrega `scripts/dev-preload.cjs`, que aplica `scripts/peer-ip.cjs` (endereço de par TCP para listas de permissão de IP) e timestamps do log de requisições.
- `pnpm dev:next` - Iniciar apenas o servidor de desenvolvimento Next.js na porta 8666 (sem cron).
- `pnpm build` - Construir a aplicação para produção (inclui pré-verificações)
- `pnpm lint` - Executar ESLint para verificar a qualidade do código
- `pnpm typecheck` - Executar verificação de tipos do TypeScript
- `scripts/upgrade-dependencies.sh` — Atualização segura de construção de cada pacote de workspace (detectado automaticamente). Resolve as versões mais recentes com `npm-check-updates`, instala a partir da raiz do workspace e mantém apenas atualizações que passam `typecheck`/`lint` de cada pacote (portões de par fixam `eslint` / `typescript` quando a pilha de lint não permite a versão mais recente). Em seguida, executa `pnpm audit` / `audit --fix` e aplica forçadamente (e relata) qualquer correção de segurança que necessite de alterações no código. Atualiza o arquivo de bloqueio do workspace e browserslist. Prefira `source ./scripts/upgrade-dependencies.sh` para que **nvm** se aplique ao seu shell; em CI ou automação use `CI=1` ou `UPGRADE_ALLOW_EXEC=1` ao executar o arquivo diretamente. Veja também `scripts/upgrade-tools.sh` apenas para ferramentas Node/pnpm.
- `scripts/clean-workspace.sh` - Limpar o workspace

**Nota:** O script `preinstall` aplica automaticamente o pnpm como gerenciador de pacotes.

### Scripts de Documentação {#documentation-scripts}

Estes scripts devem ser executados a partir do diretório `documentation/`:

- `pnpm start` - Compila e serve o site de documentação em modo de produção (porta 3000 por padrão)
- `pnpm start:en` - Inicia o servidor de desenvolvimento da documentação em inglês (recarga automática habilitada)
- `pnpm start:fr` - Inicia o servidor de desenvolvimento da documentação no idioma francês (recarga automática habilitada)
- `pnpm start:de` - Inicia o servidor de desenvolvimento da documentação no idioma alemão (recarga automática habilitada)
- `pnpm start:es` - Inicia o servidor de desenvolvimento da documentação no idioma espanhol (recarga automática habilitada)
- `pnpm start:pt-br` - Inicia o servidor de desenvolvimento da documentação no idioma português (Brasil) (recarga automática habilitada)
- `pnpm build` - Compila o site de documentação para produção
- `pnpm write-translations` - Extrai strings traduzíveis da documentação
- `pnpm translate` - Traduz arquivos de documentação usando IA (veja [Fluxo de Tradução](translation-workflow))
- `pnpm lint` - Executa o ESLint nos arquivos-fonte da documentação

Os servidores de desenvolvimento (`start:*`) fornecem substituição de módulo em tempo real para desenvolvimento rápido. A porta padrão é 3000.

### Scripts de Produção {#production-scripts}
- `pnpm build-local` - Construir e preparar para produção local (inclui pré-verificações, copia arquivos estáticos para um diretório independente)
- `pnpm start-local` - Iniciar servidor de produção localmente (porta 8666, inclui pré-verificações). **Nota:** Execute `pnpm build-local` primeiro. Inicia o servidor independente com `--require ./scripts/peer-ip.cjs`.
- `pnpm start` - Iniciar servidor de produção (porta 9666) com o mesmo pré-carregamento de peer-ip. O Docker usa `docker-entrypoint.sh` para carregar o mesmo script.

### Scripts do Docker {#docker-scripts}
- `pnpm docker:up` - Iniciar stack do Docker Compose
- `pnpm docker:down` - Parar stack do Docker Compose
- `pnpm docker:clean` - Limpar ambiente e cache do Docker
- `pnpm docker:devel` - Criar uma imagem Docker de desenvolvimento marcada como `wsj-br/duplistatus:devel`

### Scripts do Serviço Cron {#cron-service-scripts}
- `pnpm cron:start` - Iniciar o serviço cron em modo de produção
- `pnpm cron:dev` - Iniciar apenas o serviço cron em modo de desenvolvimento com monitoramento de arquivos (porta 8667). Geralmente desnecessário ao usar `pnpm dev`, que já inicia o cron.
- `pnpm cron:start-local` - Iniciar o serviço cron localmente para testes (porta 8667)

### Scripts de Teste {#test-scripts}
- `pnpm generate-test-data` - Gerar dados de backup de teste (requer parâmetro --servers=N)
- `pnpm validate-csv-export` - Validar funcionalidade de exportação CSV
- `pnpm test-entrypoint` - Testar script de entrada do Docker no desenvolvimento local (veja [Scripts de Teste](test-scripts))
- `pnpm take-screenshots` - Tirar capturas de tela para documentação (consulte [Ferramentas de Documentação](documentation-tools))

Verificações Atrasado, verificações de saúde do cron e testes SMTP são feitos através do aplicativo em execução e `curl` (consulte [Test Scripts](test-scripts)); os antigos auxiliares autônomos `pnpm` para esses foram removidos.
