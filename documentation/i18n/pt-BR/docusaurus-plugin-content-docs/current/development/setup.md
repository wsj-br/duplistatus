# Configuração de Desenvolvimento {/* #development-setup */}

## Pré-requisitos {/* #prerequisites */}

- Docker / Docker Compose
- Node.js (veja `engines.node` em `package.json`)
- pnpm (veja `engines.pnpm` / `packageManager` em `package.json`)
- SQLite3
- Inkscape (para tradução de SVG e exportação de PNG da documentação; necessário apenas se você executar `translate` ou `translate:svg`)
- bat/batcat (para mostrar uma versão bonita do `translate:help`)
- direnv (para carregar automaticamente os arquivos `.env*`)
- Playwright Chromium (execute `pnpm take-screenshots:install` após `pnpm install`; isso executa `playwright install chromium`)

## Passos {/* #steps */}

### 1. Clone o repositório: {/* #1-clone-the-repository */}

    ```bash
    git clone https://github.com/wsj-br/duplistatus.git
    cd duplistatus
    ```

### 2. Instale as dependências (Debian/Ubuntu): {/* #2-install-dependencies-debianubuntu */}

    ```bash
    sudo apt update
    sudo apt install sqlite3 git inkscape bat -y
    sudo apt install -y build-essential python3 python3-dev python3-setuptools make g++ gcc pkg-config 
    ```

### 3. Remova instalações antigas do Node.js (se você já o tiver instalado) {/* #3-remove-old-nodejs-installations-if-you-already-have-it-installed */}

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

### 4. Instale o Node.js e o pnpm: {/* #4-install-nodejs-and-pnpm */}

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
    npm config set allow-scripts=pnpm --location=user
    npm install -g pnpm npm-check-updates doctoc
    ```

### 5. Configure o suporte ao direnv {/* #5-set-up-direnv-support */}

Adicione estas linhas ao seu arquivo `~/.bashrc`

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

Adicione estas linhas ao seu arquivo `~/.profile`

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
  Você precisa reabrir o terminal ou pode precisar fechar/reabrir o editor de código IDE (Visual Studio Code, 
  Cursor, Lingma, Antigravity, Zed, ...) para que estas alterações tenham efeito.
:::

### 6. Crie o arquivo `.env` no diretório base do repositório com estas variáveis. {/* #6-create-the-env-file-at-the-repository-basedir-with-these-variables */}

- Você pode usar qualquer valor para `VERSION`; ele será atualizado automaticamente ao usar os scripts de desenvolvimento.
- Use senhas aleatórias para o `ADMIN_PASSWORD` e o `USER_PASSWORD`; estas senhas serão usadas no script `pnpm take-screenshots`.
- Você pode obter a `OPENROUTER_API_KEY` em [openrouter.ai](https://openrouter.ai).

    ```bash
    VERSION=x.x.x

    # Development user passwords
    ADMIN_PASSWORD="admin_secret"
    USER_PASSWORD="user_secret"


    # Openrouter.ai API key for translation scripts in documentation 
    OPENROUTER_API_KEY=sk-or-v1-your-key-for-translate-files
    ```

## Scripts Disponíveis {/* #available-scripts */}

O projeto inclui vários scripts npm para diferentes tarefas de desenvolvimento:

### Scripts de Desenvolvimento {/* #development-scripts */}
- `pnpm dev` - Inicia o servidor de desenvolvimento Next.js (porta 8666) e o serviço cron (porta 8667) juntos via `concurrently` (inclui pré-verificações). CTRL-C para ambos. `NODE_OPTIONS` para Next.js carrega `scripts/dev-preload.cjs`, que aplica `scripts/peer-ip.cjs` (endereço de peer TCP para listas de permissões de IP) e carimbos de data/hora de solicitação.
- `pnpm dev:next` - Inicia apenas o servidor de desenvolvimento Next.js na porta 8666 (sem cron).
- `pnpm build` - Compila a aplicação para produção (inclui pré-verificações)
- `pnpm lint` - Executa ESLint para verificar a qualidade do código
- `pnpm typecheck` - Executa verificação de tipos TypeScript
- `scripts/upgrade-dependencies.sh` — Atualização segura de compilação de todos os pacotes do workspace (detectado automaticamente). Resolve as versões mais recentes com `npm-check-updates`, instala a partir da raiz do workspace e mantém apenas as atualizações que passam em cada `typecheck`/`lint` (portas de peer fixam `eslint` / `typescript` quando a pilha de lint não permite a versão principal mais recente). Em seguida, executa `pnpm audit` / `audit --fix` e força a aplicação (e relata) qualquer correção de segurança que precise de alterações no código. Atualiza o lockfile do workspace e o browserslist. Prefira `source ./scripts/upgrade-dependencies.sh` para que **nvm** seja aplicado ao seu shell; em CI ou automação, use `CI=1` ou `UPGRADE_ALLOW_EXEC=1` ao executar o arquivo diretamente. Veja também `scripts/upgrade-tools.sh` para ferramentas Node/pnpm apenas.
- `scripts/clean-workspace.sh` - Limpa o workspace

**Nota:** O script `preinstall` aplica automaticamente pnpm como gerenciador de pacotes.

### Scripts de Documentação {/* #documentation-scripts */}

Estes scripts devem ser executados a partir do diretório `documentation/`:

- `pnpm start` - Compila e serve o site de documentação em modo de produção (porta 3000 por padrão)
- `pnpm start:en` - Inicia o servidor de desenvolvimento de documentação em inglês (recarregamento em tempo real habilitado)
- `pnpm start:fr` - Inicia o servidor de desenvolvimento de documentação em francês (recarregamento em tempo real habilitado)
- `pnpm start:de` - Inicia o servidor de desenvolvimento de documentação em alemão (recarregamento em tempo real habilitado)
- `pnpm start:es` - Inicia o servidor de desenvolvimento de documentação em espanhol (recarregamento em tempo real habilitado)
- `pnpm start:pt-br` - Inicia o servidor de desenvolvimento de documentação em português (Brasil) (recarregamento em tempo real habilitado)
- `pnpm build` - Compila o site de documentação para produção
- `pnpm write-translations` - Extrai strings traduzíveis da documentação
- `pnpm translate` - Traduz arquivos de documentação usando IA (veja [Fluxo de Tradução](translation-workflow))
- `pnpm lint` - Executa ESLint em arquivos de origem de documentação

Os servidores de desenvolvimento (`start:*`) fornecem substituição de módulo em tempo real para desenvolvimento rápido. A porta padrão é 3000.

### Scripts de Produção {/* #production-scripts */}
- `pnpm build-local` - Compila e prepara para produção local (inclui pré-verificações, copia arquivos estáticos para diretório standalone)
- `pnpm start-local` - Inicia servidor de produção localmente (porta 8666, inclui pré-verificações). **Nota:** Execute `pnpm build-local` primeiro. Inicia o servidor standalone com `--require ./scripts/peer-ip.cjs`.
- `pnpm start` - Inicia servidor de produção (porta 9666) com o mesmo pré-carregamento de peer-ip. Docker usa `docker-entrypoint.sh` para carregar o mesmo script.

### Scripts Docker {/* #docker-scripts */}
- `pnpm docker:up` - Inicia pilha Docker Compose
- `pnpm docker:down` - Para pilha Docker Compose
- `pnpm docker:clean` - Limpa ambiente Docker e cache
- `pnpm docker:devel` - Compila uma imagem Docker de desenvolvimento com a tag `wsj-br/duplistatus:devel`

### Scripts de Serviço Cron {/* #cron-service-scripts */}
- `pnpm cron:start` - Inicia serviço cron em modo de produção
- `pnpm cron:dev` - Inicia apenas o serviço cron em modo de desenvolvimento com observação de arquivos (porta 8667). Geralmente desnecessário ao usar `pnpm dev`, que já inicia o cron.
- `pnpm cron:start-local` - Inicia serviço cron localmente para teste (porta 8667)

### Scripts de Teste {/* #test-scripts */}
- `pnpm generate-test-data` - Gera dados de backup para teste (requer parâmetro --servers=N)
- `pnpm validate-csv-export` - Valida funcionalidade de exportação CSV
- `pnpm test-entrypoint` - Testa script de entrada Docker em desenvolvimento local (veja [Scripts de Teste](test-scripts))
- `pnpm take-screenshots` - Captura screenshots para documentação (veja [Ferramentas de Documentação](documentation-tools))

Verificações atrasadas, verificações de saúde do cron e testes SMTP são feitos através da aplicação em execução e `curl` (veja [Scripts de Teste](test-scripts)); os antigos auxiliares standalone `pnpm` para esses foram removidos.
