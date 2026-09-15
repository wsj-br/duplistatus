# 开发设置 {/* #development-setup */}

## 先决条件 {/* #prerequisites */}

- Docker / Docker Compose
- Node.js (见 `engines.node` 在 `package.json`)
- pnpm (见 `engines.pnpm` / `packageManager` 在 `package.json`)
- SQLite3
- Inkscape (用于文档 SVG 翻译和 PNG 导出；仅在运行 `translate` 或 `translate:svg` 时需要)
- bat/batcat (显示 `translate:help` 的漂亮版本)
- direnv (自动加载 `.env*` 文件)
- Playwright Chromium (在 `pnpm install` 后运行 `pnpm take-screenshots:install`；这将运行 `playwright install chromium`)

## 步骤 {/* #steps */}

### 1. 克隆仓库：{/* #1-clone-the-repository */}

    ```bash
    git clone https://github.com/wsj-br/duplistatus.git
    cd duplistatus
    ```

### 2. 安装依赖项 (Debian/Ubuntu)：{/* #2-install-dependencies-debianubuntu */}

    ```bash
    sudo apt update
    sudo apt install sqlite3 git inkscape bat -y
    sudo apt install -y build-essential python3 python3-dev python3-setuptools make g++ gcc pkg-config 
    ```

### 3. 删除旧的 Node.js 安装 (如果您已经安装了它) {/* #3-remove-old-nodejs-installations-if-you-already-have-it-installed */}

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

### 4. 安装 Node.js 和 pnpm：{/* #4-install-nodejs-and-pnpm */}

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
    npm config set allow-scripts=pnpm --location=user
    npm install -g pnpm npm-check-updates doctoc
    ```

### 5. 设置 direnv 支持 {/* #5-set-up-direnv-support */}

将这些行添加到您的 `~/.bashrc` 文件

    ```bash 
    # direnv support (apt install direnv)
    eval "$(direnv hook bash)"
    ```

使用此命令：

    ```bash 
    (echo "# direnv support (apt install direnv)"; echo 'eval "$(direnv hook bash)') >> ~/.bashrc
    ```

在仓库基目录中运行：

    ```bash
    direnv allow
    ```

将这些行添加到您的 `~/.profile` 文件

    ```bash 
    # export the Bash environment (needed for code editor or AI Agents to load it).
    export BASH_ENV="$HOME/.bashrc"
    ```

使用此命令：

    ```bash 
    (echo "# export the Bash environment (needed for code editor or AI Agents to load it)."; \
     echo 'export BASH_ENV="$HOME/.bashrc"') >> ~/.profile
    ```

:::info
  您需要重新打开终端，或者可能需要关闭/重新打开代码编辑器 IDE (Visual Studio Code,
  Cursor, Lingma, Antigravity, Zed, ...) 以使这些更改生效。
:::

### 6. 在仓库基目录中创建 `.env` 文件，并使用这些变量。{/* #6-create-the-env-file-at-the-repository-basedir-with-these-variables */}

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

## 可用脚本 {/* #available-scripts */}

该项目包含几个用于不同开发任务的 npm 脚本：

### 开发脚本 {/* #development-scripts */}
- `pnpm dev` - 启动 Next.js 开发服务器（端口 8666）和 cron 服务（端口 8667）一起运行，通过 `concurrently`（包括预检查）。CTRL-C 停止两者。`NODE_OPTIONS` 用于 Next.js 加载 `scripts/dev-preload.cjs`，该脚本应用 `scripts/peer-ip.cjs`（TCP 对等地址用于 IP 允许列表）和请求日志时间戳。
- `pnpm dev:next` - 仅启动 Next.js 开发服务器（端口 8666，不包括 cron）。
- `pnpm build` - 为生产环境构建应用程序（包括预检查）。
- `pnpm lint` - 运行 ESLint 检查代码质量
- `pnpm typecheck` - 运行 TypeScript 类型检查
- `scripts/upgrade-dependencies.sh` — 安全升级所有工作区包（自动检测）。使用 `npm-check-updates` 解析最新版本，从工作区根目录安装，并仅保留通过每个包的 `typecheck`/`lint`（对等网关固定 `eslint` / `typescript` 当 lint 栈不允许最新主要版本时）的升级。然后运行 `pnpm audit` / `audit --fix` 并强制应用（并报告）任何需要代码更改的安全修复。刷新工作区锁文件和 browserslist。优先使用 `source ./scripts/upgrade-dependencies.sh` 以便 **nvm** 应用于您的 shell；在 CI 或自动化中使用 `CI=1` 或 `UPGRADE_ALLOW_EXEC=1` 直接执行文件时。另请参阅 `scripts/upgrade-tools.sh` 仅限 Node/pnpm 工具。
- `scripts/clean-workspace.sh` - 清理工作区

**注意：** `preinstall` 脚本自动强制使用 pnpm 作为包管理器。

### 文档脚本 {/* #documentation-scripts */}

这些脚本必须从 `documentation/` 目录运行：

- `pnpm start` - 以生产模式构建并提供文档站点（默认端口 3000）
- `pnpm start:en` - 启动英文文档开发服务器（启用热重载）
- `pnpm start:fr` - 启动法语文档开发服务器（启用热重载）
- `pnpm start:de` - 启动德语文档开发服务器（启用热重载）
- `pnpm start:es` - 启动西班牙语文档开发服务器（启用热重载）
- `pnpm start:pt-br` - 启动葡萄牙语（巴西）文档开发服务器（启用热重载）
- `pnpm build` - 为生产环境构建文档站点
- `pnpm write-translations` - 从文档中提取可翻译的字符串
- `pnpm translate` - 使用 AI 翻译文档文件（请参阅 [翻译工作流程](translation-workflow))
- `pnpm lint` - 在文档源文件上运行 ESLint

开发服务器（`start:*`）提供热模块替换以实现快速开发。默认端口为 3000。

### 生产脚本 {/* #production-scripts */}
- `pnpm build-local` - 为本地生产环境构建并准备（包括预检查，将静态文件复制到独立目录）
- `pnpm start-local` - 在本地启动生产服务器（端口 8666，包括预检查）。**注意：** 首先运行 `pnpm build-local`。使用 `--require ./scripts/peer-ip.cjs` 启动独立服务器。
- `pnpm start` - 使用相同的对等 IP 预加载启动生产服务器（端口 9666）。Docker 使用 `docker-entrypoint.sh` 加载相同的脚本。

### Docker 脚本 {/* #docker-scripts */}
- `pnpm docker:up` - 启动 Docker Compose 堆栈
- `pnpm docker:down` - 停止 Docker Compose 堆栈
- `pnpm docker:clean` - 清理 Docker 环境和缓存
- `pnpm docker:devel` - 构建标记为 `wsj-br/duplistatus:devel` 的开发 Docker 镜像

### Cron 服务脚本 {/* #cron-service-scripts */}
- `pnpm cron:start` - 以生产模式启动 cron 服务
- `pnpm cron:dev` - 仅以开发模式启动 cron 服务并启用文件监视（端口 8667）。通常在使用 `pnpm dev` 时不需要，因为它已经启动了 cron。
- `pnpm cron:start-local` - 为测试启动本地 cron 服务（端口 8667）

### 测试脚本 {/* #test-scripts */}
- `pnpm generate-test-data` - 生成测试备份数据（需要 --servers=N 参数）
- `pnpm validate-csv-export` - 验证 CSV 导出功能
- `pnpm test-entrypoint` - 在本地开发中测试 Docker 入口脚本（请参阅 [测试脚本](test-scripts))
- `pnpm take-screenshots` - 为文档拍摄截图（请参阅 [文档工具](documentation-tools))

过期检查、cron 健康检查和 SMTP 测试通过正在运行的应用程序和 `curl`（请参阅 [测试脚本](test-scripts))完成；旧的独立 `pnpm` 辅助工具已被移除。
