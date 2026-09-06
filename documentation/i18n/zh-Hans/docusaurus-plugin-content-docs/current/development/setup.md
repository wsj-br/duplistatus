# 开发设置 {#development-setup}

## 先决条件 {#prerequisites}

- Docker / Docker Compose
- Node.js (参见 `engines.node` 在 `package.json`)
- pnpm (参见 `engines.pnpm` / `packageManager` 在 `package.json`)
- SQLite3
- Inkscape（用于文档SVG翻译和PNG导出；仅在运行`translate`或`translate:svg`时需要）
- bat/batcat（用于显示`translate:help`的漂亮版本）
- direnv（用于自动加载`.env*`文件）
- Playwright Chromium（在`pnpm install`后运行`pnpm take-screenshots:install`；这将运行`playwright install chromium`）

## 步骤 {#steps}

### 1. 克隆仓库： {#1-clone-the-repository}

    ```bash
    git clone https://github.com/wsj-br/duplistatus.git
    cd duplistatus
    ```

### 2. 安装依赖项（Debian/Ubuntu）： {#2-install-dependencies-debianubuntu}

    ```bash
    sudo apt update
    sudo apt install sqlite3 git inkscape bat -y
    ```

### 3. 删除旧的 Node.js 安装（如果您已经安装）： {#3-remove-old-nodejs-installations-if-you-already-have-it-installed}

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

### 4. 安装 Node.js 和 pnpm： {#4-install-nodejs-and-pnpm}

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
    npm install -g pnpm npm-check-updates doctoc
    ```

### 5. 设置 direnv 支持 {#5-set-up-direnv-support}

将这些行添加到您的 `~/.bashrc` 文件中

    ```bash 
    # direnv support (apt install direnv)
    eval "$(direnv hook bash)"
    ```

使用以下命令：

    ```bash 
    (echo "# direnv support (apt install direnv)"; echo 'eval "$(direnv hook bash)') >> ~/.bashrc
    ```

在仓库的基本目录中运行：

    ```bash
    direnv allow
    ```

将这些行添加到您的 `~/.profile` 文件中

    ```bash 
    # export the Bash environment (needed for code editor or AI Agents to load it).
    export BASH_ENV="$HOME/.bashrc"
    ```

使用以下命令：

    ```bash 
    (echo "# export the Bash environment (needed for code editor or AI Agents to load it)."; \
     echo 'export BASH_ENV="$HOME/.bashrc"') >> ~/.profile
    ```

:::info
  您需要重新打开终端或可能需要关闭/重新打开代码编辑器 IDE（Visual Studio Code，
  Cursor，Lingma，Antigravity，Zed，...）以使这些更改生效。
:::

### 6. 在仓库的基本目录中创建 `.env` 文件，包含这些变量。 {#6-create-the-env-file-at-the-repository-basedir-with-these-variables}

- 您可以为 `VERSION` 使用任何值；它将在使用开发脚本时自动更新。
- 为 `ADMIN_PASSWORD` 和 `USER_PASSWORD` 使用随机密码；这些密码将在 `pnpm take-screenshots` 脚本中使用。
- 您可以从 [openrouter.ai](https://openrouter.ai) 获取 `OPENROUTER_API_KEY`。

    ```bash
    VERSION=x.x.x

    # Development user passwords
    ADMIN_PASSWORD="admin_secret"
    USER_PASSWORD="user_secret"


    # Openrouter.ai API key for translation scripts in documentation 
    OPENROUTER_API_KEY=sk-or-v1-your-key-for-translate-files
    ```

## 可用的脚本 {#available-scripts}

该项目包括几个 npm 脚本，用于不同的开发任务：

### 开发脚本 {#development-scripts}
- `pnpm dev` - 启动 Next.js 开发服务器（端口 8666）和 cron 服务（端口 8667），通过 `concurrently` 一起启动（包括预检查）。CTRL-C 停止两者。`NODE_OPTIONS` 对于 Next.js 加载 `scripts/dev-preload.cjs`，应用 `scripts/peer-ip.cjs`（IP 允许列表的 TCP 对等地址）和请求日志时间戳。
- `pnpm dev:next` - 仅在端口 8666 启动 Next.js 开发服务器（不使用 cron）。
- `pnpm build` - 为生产构建应用程序（包括预检查）
- `pnpm lint` - 运行 ESLint 检查代码质量
- `pnpm typecheck` - 运行 TypeScript 类型检查
- `scripts/upgrade-dependencies.sh` — 安全构建升级每个工作区包（自动检测）。解析最新版本并使用 `npm-check-updates`，从工作区根目录安装，并仅保留通过每个包的 `typecheck`/`lint` 的升级（对等门控在 lint 堆栈不允许最新主要版本时固定 `eslint` / `typescript`）。然后运行 `pnpm audit` / `audit --fix` 并强制应用（并报告）任何需要代码更改的安全修复。刷新工作区锁定文件和浏览器列表。优先使用 `source ./scripts/upgrade-dependencies.sh` 以便 **nvm** 应用于你的 shell；在 CI 或自动化中直接执行文件时使用 `CI=1` 或 `UPGRADE_ALLOW_EXEC=1`。另见 `scripts/upgrade-tools.sh` 仅适用于 Node/pnpm 工具。
- `scripts/clean-workspace.sh` - 清理工作区

**注意：** `preinstall` 脚本自动强制使用 pnpm 作为包管理器。

### 文档脚本 {#documentation-scripts}

这些脚本必须从 `documentation/` 目录运行：

- `pnpm start` - 以生产模式构建和提供文档站点（默认端口 3000）
- `pnpm start:en` - 启动英文文档开发服务器（启用热重载）
- `pnpm start:fr` - 启动法语区域设置文档开发服务器（启用热重载）
- `pnpm start:de` - 启动德语区域设置文档开发服务器（启用热重载）
- `pnpm start:es` - 启动西班牙语区域设置文档开发服务器（启用热重载）
- `pnpm start:pt-br` - 启动葡萄牙语（巴西）区域设置文档开发服务器（启用热重载）
- `pnpm build` - 为生产环境构建文档站点
- `pnpm write-translations` - 从文档中提取可翻译的字符串
- `pnpm translate` - 使用 AI 翻译文档文件（请参阅 [翻译工作流](translation-workflow))
- `pnpm lint` - 在文档源文件上运行 ESLint

开发服务器（`start:*`）提供热模块替换以实现快速开发。默认端口为 3000。

### 生产脚本 {#production-scripts}
- `pnpm build-local` - 构建并准备本地生产环境（包括预检查，将静态文件复制到独立目录）
- `pnpm start-local` - 在本地启动生产服务器（端口 8666，包括预检查）。 **注意：** 先运行 `pnpm build-local`。 启动独立服务器并加载 `--require ./scripts/peer-ip.cjs`。
- `pnpm start` - 在端口 9666 上启动生产服务器，并使用相同的对等 IP 预加载。 Docker 使用 `docker-entrypoint.sh` 加载相同的脚本。

### Docker 脚本 {#docker-scripts}
- `pnpm docker:up` - 启动 Docker Compose 堆栈
- `pnpm docker:down` - 停止 Docker Compose 堆栈
- `pnpm docker:clean` - 清理 Docker 环境和缓存
- `pnpm docker:devel` - 构建一个开发 Docker 镜像，标记为 `wsj-br/duplistatus:devel`

### Cron 服务脚本 {#cron-service-scripts}
- `pnpm cron:start` - 在生产模式下启动 cron 服务
- `pnpm cron:dev` - 在开发模式下仅启动 cron 服务并进行文件监视（端口 8667）。在使用 `pnpm dev` 时通常不必要，因为它已经启动了 cron。
- `pnpm cron:start-local` - 在本地启动 cron 服务以进行测试（端口 8667）

### 测试脚本 {#test-scripts}
- `pnpm generate-test-data` - 生成测试备份数据（需要 --servers=N 参数）
- `pnpm validate-csv-export` - 验证 CSV 导出功能
- `pnpm test-entrypoint` - 在本地开发中测试 Docker 入口脚本（请参阅 [测试脚本](test-scripts))
- `pnpm take-screenshots` - 为文档拍摄截图（请参阅 [文档工具](documentation-tools))

逾期检查、Cron 健康检查和 SMTP 测试都是通过运行的应用程序和 `curl` 完成的（请参阅 [测试脚本](test-scripts)）；旧的独立 `pnpm` 帮助程序已被删除。
