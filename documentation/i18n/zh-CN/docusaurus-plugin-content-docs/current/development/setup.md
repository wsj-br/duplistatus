

# 开发环境设置 {#development-setup}

## 先决条件 {#prerequisites}

- Docker / Docker Compose
- Node.js >=24.12.0
- pnpm >=10.24.0 (packageManager: pnpm@10.30.3)
- SQLite3
- Inkscape（用于文档 SVG 翻译和 PNG 导出；仅在运行 `translate` 或 `translate:svg` 时需要）
- bat/batcat（用于美观显示 `translate:help`）
- direnv（用于自动加载 `.env*` 文件）



## 步骤 {#steps}

### 1. 克隆仓库： {#1-clone-the-repository}
    ```bash
    git clone https://github.com/wsj-br/duplistatus.git
    cd duplistatus
    ```


### 2. 安装依赖（Debian/Ubuntu）： {#2-install-dependencies-debianubuntu}
    ```bash
    sudo apt update
    sudo apt install sqlite3 git inkscape bat -y
    ```

### 3. 移除旧版 Node.js 安装（若已安装） {#3-remove-old-nodejs-installations-if-you-already-have-it-installed}

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

将以下行添加到 `~/.bashrc` 文件

    ```bash 
    # direnv support (apt install direnv)
    eval "$(direnv hook bash)"
    ```

    使用此命令：

    ```bash 
    (echo "# direnv support (apt install direnv)"; echo 'eval "$(direnv hook bash)') >> ~/.bashrc
    ```

    在仓库根目录运行：

    ```bash
    direnv allow
    ```

将以下行添加到 `~/.profile` 文件

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
  需要重新打开终端，或可能需要关闭/重新打开代码编辑器 IDE（Visual Studio Code、
  Cursor、Lingma、Antigravity、Zed 等），这些更改才能生效。
  :::

### 6. 在仓库根目录创建 `.env` 文件，包含以下变量。 {#6-create-the-env-file-at-the-repository-basedir-with-these-variables}

- 可以为 `VERSION` 使用任意值；使用开发脚本时会自动更新。
- 为 `ADMIN_PASSWORD` 和 `USER_PASSWORD` 使用随机密码；这些密码将用于 `pnpm take-screenshots` 脚本。
- 可以从 [openrouter.ai](https://openrouter.ai) 获取 `OPENROUTER_API_KEY`。


    ```bash
    VERSION=x.x.x

    # Development user passwords
    ADMIN_PASSWORD="admin_secret"
    USER_PASSWORD="user_secret"


    # Openrouter.ai API key for translation scripts in documentation 
    OPENROUTER_API_KEY=sk-or-v1-your-key-for-translate-files
    ```


## 可用脚本 {#available-scripts}

项目包含多个 npm 脚本，用于不同的开发任务：

### 开发脚本 {#development-scripts}
- `pnpm dev` - 在端口 8666 上启动开发服务器（包含预检查）
- `pnpm build` - 构建生产环境应用程序（包含预检查）
- `pnpm lint` - 运行 ESLint 检查代码质量
- `pnpm typecheck` - 运行 TypeScript 类型检查
- `scripts/upgrade-dependencies.sh` — 升级根目录和 `documentation/` 软件包（`npm-check-updates`），刷新工作区锁文件，更新 browserslist，并运行 `pnpm audit` / fix。建议使用 `source ./scripts/upgrade-dependencies.sh`，以便 **nvm** 应用于 shell；在 CI 或自动化中直接执行文件时使用 `CI=1` 或 `DUPLISTATUS_UPGRADE_ALLOW_EXEC=1`。另请参阅 `scripts/upgrade-tools.sh`，仅用于 Node/pnpm 工具。
- `scripts/clean-workspace.sh` - 清理工作区

**注意：** `preinstall` 脚本自动强制使用 pnpm 作为包管理器。

### 文档脚本 {#documentation-scripts}

这些脚本必须在 `documentation/` 目录中运行：

- `pnpm start` - 以生产模式构建并提供文档站点（默认端口 3000）
- `pnpm start:en` - 以英语启动文档开发服务器（启用热重载）
- `pnpm start:fr` - 以法语启动文档开发服务器（启用热重载）
- `pnpm start:de` - 以德语启动文档开发服务器（启用热重载）
- `pnpm start:es` - 以西班牙语启动文档开发服务器（启用热重载）
- `pnpm start:pt-br` - 以巴西葡萄牙语启动文档开发服务器（启用热重载）
- `pnpm build` - 构建生产环境文档站点
- `pnpm write-translations` - 从文档中提取可翻译字符串
- `pnpm translate` - 使用 AI 翻译文档文件（请参阅[翻译工作流](translation-workflow)）
- `pnpm lint` - 对文档源文件运行 ESLint

开发服务器（`start:*`）提供热模块替换以加速开发。默认端口为 3000。


### 生产脚本 {#production-scripts}
- `pnpm build-local` - 构建并准备本地生产环境（包含预检查，将静态文件复制到 standalone 目录）
- `pnpm start-local` - 在本地启动生产服务器（端口 8666，包含预检查）。**注意：** 需先运行 `pnpm build-local`。
- `pnpm start` - 启动生产服务器（端口 9666）

### Docker 脚本 {#docker-scripts}
- `pnpm docker:up` - 启动 Docker Compose 堆栈
- `pnpm docker:down` - 停止 Docker Compose 堆栈
- `pnpm docker:clean` - 清理 Docker 环境和缓存
- `pnpm docker:devel` - 构建标记为 `wsj-br/duplistatus:devel` 的开发 Docker 镜像

### Cron 服务脚本 {#cron-service-scripts}
- `pnpm cron:start` - 以生产模式启动 cron 服务
- `pnpm cron:dev` - 以开发模式启动 cron 服务，支持文件监视（端口 8667）
- `pnpm cron:start-local` - 在本地启动 cron 服务用于测试（端口 8667）

### 测试脚本 {#test-scripts}
- `pnpm generate-test-data` - 生成测试备份数据（需要 --servers=N 参数）
- `pnpm validate-csv-export` - 验证 CSV 导出功能
- `pnpm test-entrypoint` - 在本地开发中测试 Docker 入口点脚本（请参阅[测试脚本](test-scripts)）
- `pnpm take-screenshots` - 为文档截取屏幕截图（请参阅[文档工具](documentation-tools)）

逾期检查、cron 健康检查和 SMTP 测试通过运行中的应用程序和 `curl` 完成（请参阅[测试脚本](test-scripts)）；用于这些功能的旧版独立 `pnpm` 辅助脚本已移除。
