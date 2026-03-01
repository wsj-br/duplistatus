---
translation_last_updated: '2026-03-01T00:17:17.385Z'
source_file_mtime: '2026-03-01T00:09:27.997Z'
source_file_hash: 6d8b0e530d4c1ecb
translation_language: pt-BR
source_file_path: development/setup.md
---
# Configuração de Desenvolvimento {#development-setup}

## Pré-requisitos {#prerequisites}

- Docker / Docker Compose
- Node.js >=24.12.0
- pnpm >=10.24.0 (packageManager: pnpm@10.30.3)
- SQLite3
- Inkscape (para tradução de SVG de documentação e exportação de PNG; obrigatório apenas se você executar `translate` ou `translate:svg`)
- bat/batcat (para mostrar uma versão bonita do `translate:help`)
- direnv (para carregar automaticamente os arquivos `.env*`)

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
- `pnpm dev` - Iniciar servidor de desenvolvimento na porta 8666 (inclui pré-verificações)
- `pnpm build` - Compilar a aplicação para produção (inclui pré-verificações)
- `pnpm lint` - Executar ESLint para verificar a qualidade do código
- `pnpm typecheck` - Executar verificação de tipos do TypeScript
- `scripts/upgrade-dependencies.sh` - Atualizar todos os pacotes para a versão mais recente, verificar vulnerabilidades e corrigi-las automaticamente
- `scripts/clean-workspace.sh` - Limpar o espaço de trabalho

**Nota:** O script `preinstall` aplica automaticamente o pnpm como gerenciador de pacotes.

### Scripts de Documentação {#documentation-scripts}

Estes scripts devem ser executados a partir do diretório `documentation/`:

- `pnpm start` - Construir e servir o site de documentação em modo de produção (porta 3000 por padrão)
- `pnpm start:en` - Iniciar o servidor de desenvolvimento da documentação em inglês (hot reloading habilitado)
- `pnpm start:fr` - Iniciar o servidor de desenvolvimento da documentação em francês (hot reloading habilitado)
- `pnpm start:de` - Iniciar o servidor de desenvolvimento da documentação em alemão (hot reloading habilitado)
- `pnpm start:es` - Iniciar o servidor de desenvolvimento da documentação em espanhol (hot reloading habilitado)
- `pnpm start:pt-br` - Iniciar o servidor de desenvolvimento da documentação em português (Brasil) (hot reloading habilitado)
- `pnpm build` - Construir o site de documentação para produção
- `pnpm write-translations` - Extrair strings traduzíveis da documentação
- `pnpm translate` - Traduzir arquivos de documentação usando IA (consulte [Fluxo de Trabalho de Tradução](translation-workflow))
- `pnpm lint` - Executar ESLint nos arquivos de origem da documentação

Os servidores de desenvolvimento (`start:*`) fornecem substituição de módulo em tempo real para desenvolvimento rápido. A porta padrão é 3000.

### Scripts de Produção {#production-scripts}
- `pnpm build-local` - Compilar e preparar para produção local (inclui pré-verificações, copia arquivos estáticos para diretório standalone)
- `pnpm start-local` - Iniciar servidor de produção localmente (porta 8666, inclui pré-verificações). **Nota:** Execute `pnpm build-local` primeiro.
- `pnpm start` - Iniciar servidor de produção (porta 9666)

### Scripts Docker {#docker-scripts}
- `pnpm docker:up` - Iniciar pilha Docker Compose
- `pnpm docker:down` - Parar pilha Docker Compose
- `pnpm docker:clean` - Limpar ambiente Docker e cache
- `pnpm docker:devel` - Construir uma imagem Docker de desenvolvimento marcada como `wsj-br/duplistatus:devel`

### Scripts do Serviço Cron {#cron-service-scripts}
- `pnpm cron:start` - Iniciar serviço cron em modo de produção
- `pnpm cron:dev` - Iniciar serviço cron em modo de desenvolvimento com observação de arquivos (porta 8667)
- `pnpm cron:start-local` - Iniciar serviço cron localmente para testes (porta 8667)

### Scripts de Teste {#test-scripts}
- `pnpm generate-test-data` - Gerar dados de backup de teste (requer parâmetro --servers=N)
- `pnpm show-overdue-notifications` - Mostrar conteúdo de notificações atrasadas
- `pnpm run-overdue-check` - Executar verificação de atraso em uma data/hora específica
- `pnpm test-cron-port` - Testar conectividade da porta de serviço cron
- `pnpm test-overdue-detection` - Testar lógica de detecção de backup atrasado
- `pnpm validate-csv-export` - Validar funcionalidade de exportação CSV
- `pnpm set-smtp-test-config` - Definir configuração de teste SMTP a partir de variáveis de ambiente (ver [Scripts de Teste](test-scripts))
- `pnpm test-smtp-connections` - Testar compatibilidade cruzada de tipo de conexão SMTP (ver [Scripts de Teste](test-scripts))
- `pnpm test-entrypoint` - Testar script de entrypoint do Docker no desenvolvimento local (ver [Scripts de Teste](test-scripts))
- `pnpm take-screenshots` - Capturar screenshots para documentação (ver [Ferramentas de Documentação](documentation-tools))
