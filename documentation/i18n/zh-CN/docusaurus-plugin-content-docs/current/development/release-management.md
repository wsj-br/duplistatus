# 发布管理 {#release-management}

## 版本控制（语义化版本） {#versioning-semantic-versioning}

项目遵循语义化版本（SemVer），格式为 `MAJOR.MINOR.PATCH`：

- **主版本** (x.0.0)：进行不兼容的 API 变更时
- **次版本** (0.x.0)：以向后兼容方式添加功能时
- **补丁版本** (0.0.x)：进行向后兼容的错误修复时

## 发布前检查清单 {#pre-release-checklist}

发布新版本前，请确保完成以下事项：

- [ ] 所有更改已提交并推送到 `vMAJOR.MINOR.x` 分支。
- [ ] `package.json` 中的版本号已更新（使用 `scripts/update-version.sh` 在各文件间同步）。
- [ ] 所有测试通过（开发模式、本地、Docker 和 Podman）。
- [ ] 使用 `pnpm docker:up` 启动 Docker 容器，并运行 `scripts/compare-versions.sh` 验证开发环境与 Docker 容器之间的版本一致性（需要 Docker 容器正在运行）。此脚本仅按主版本比较 SQLite 版本（例如 3.45.1 与 3.51.1 视为兼容），并精确比较 Node、npm 和 Duplistatus 版本。
- [ ] 文档已更新，更新屏幕截图（使用 `pnpm take-screenshots`）
- [ ] 发布说明已准备在 `documentation/docs/release-notes/VERSION.md` 中。
- [ ] 运行 `scripts/generate-readme-from-intro.sh` 更新 `README.md`，包含新版本及 `documentation/docs/intro.md` 中的任何更改。此脚本还会自动生成 `README_dockerhub.md` 和 `RELEASE_NOTES_github_VERSION.md`。


## 发布流程概述 {#release-process-overview}

推荐的发布流程使用 **GitHub Pull Request 和 Release**（见下文）。这提供更好的可见性、审查能力，并自动触发 Docker 镜像构建。命令行方法可作为替代方案。

## 方法一：GitHub Pull Request 和 Release（推荐） {#method-1-github-pull-request-and-release-recommended}

这是首选方法，因为它提供更好的可追溯性并自动触发 Docker 构建。

### 步骤 1：创建 Pull Request {#step-1-create-pull-request}

1. 在 GitHub 上导航至 [duplistatus 仓库](https://github.com/wsj-br/duplistatus)。
2. 点击 **"Pull requests"** 标签。
3. 点击 **"New pull request."**
4. 将 **base 分支** 设置为 `master`，**compare 分支** 设置为 `vMAJOR.MINOR.x`。
5. 查看更改预览，确保一切正确。
6. 点击 **"Create pull request."**
7. 添加描述性标题（例如 "Release v1.2.0"）和总结更改的描述。
8. 再次点击 **"Create pull request"**。

### 步骤 2：合并 Pull Request {#step-2-merge-the-pull-request}

审查 pull request 后：

1. 若无冲突，点击绿色 **"Merge pull request"** 按钮。
2. 选择合并策略（通常为 "Create a merge commit"）。
3. 确认合并。

### 步骤 3：创建 GitHub Release {#step-3-create-github-release}

合并完成后，创建 GitHub release：

1. 在 GitHub 上导航至 [duplistatus 仓库](https://github.com/wsj-br/duplistatus)。
2. 进入 **"Releases"** 部分（或点击右侧边栏的 "Releases"）。
3. 点击 **"Draft a new release."**
4. 在 **"Choose a tag"** 字段中，输入 `vMAJOR.MINOR.PATCH` 格式的新版本号（例如 `v1.2.0`）。这将创建新标签。
5. 选择 `master` 作为目标分支。
6. 添加 **release 标题**（例如 "Release v1.2.0"）。
7. 添加**描述**，记录此版本的更改。您可以：
   - 从 `RELEASE_NOTES_github_VERSION.md` 复制内容（由 `scripts/generate-readme-from-intro.sh` 生成）
   - 或引用 `documentation/docs/release-notes/` 中的发布说明（但请注意相对链接在 GitHub release 中无法工作）
8. 点击 **"Publish release."**

**自动发生的事项：**
- 创建新的 Git 标签
- 触发 "Build and Publish Docker Image" 工作流
- 为 AMD64 和 ARM64 架构构建 Docker 镜像
- 镜像推送到：
  - Docker Hub：`wsjbr/duplistatus:VERSION` 和 `wsjbr/duplistatus:latest`（若此为最新 release）
  - GitHub Container Registry：`ghcr.io/wsj-br/duplistatus:VERSION` 和 `ghcr.io/wsj-br/duplistatus:latest`（若此为最新 release）

## 方法二：命令行（替代方案） {#method-2-command-line-alternative}

若偏好使用命令行，请按以下步骤操作：

### 步骤 1：更新本地 master 分支 {#step-1-update-local-master-branch}

确保本地 `master` 分支为最新：

```bash
# Checkout the master branch
git checkout master

# Pull the latest changes from the remote repository
git pull origin master
```

### 步骤 2：合并开发分支 {#step-2-merge-development-branch}

将 `vMAJOR.MINOR.x` 分支合并到 `master`：

```bash
# Merge the vMAJOR.MINOR.x branch into master
git merge vMAJOR.MINOR.x
```

若存在**合并冲突**，请手动解决：
1. 编辑冲突文件
2. 暂存已解决文件：`git add <file>`
3. 完成合并：`git commit`

### 步骤 3：标记 Release {#step-3-tag-the-release}

为新版本创建带注释的标签：

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

`-a` 标志创建带注释的标签（release 推荐），`-m` 标志添加消息。

### 步骤 4：推送到 GitHub {#step-4-push-to-github}

推送更新的 `master` 分支和新标签：

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

或一次性推送所有标签：`git push --tags`

### 步骤 5：创建 GitHub Release {#step-5-create-github-release}

推送标签后，创建 GitHub release（见方法一，步骤 3）以触发 Docker 构建工作流。

## 手动构建 Docker 镜像 {#manual-docker-image-build}

在不创建 release 的情况下手动触发 Docker 镜像构建工作流：

1. 在 GitHub 上导航至 [duplistatus 仓库](https://github.com/wsj-br/duplistatus)。
2. 点击 **"Actions"** 标签。
3. 选择 **"Build and Publish Docker Image"** 工作流。
4. 点击 **"Run workflow"**。
5. 选择要构建的分支（通常为 `master`）。
6. 再次点击 **"Run workflow"**。

**注意：** 手动构建不会自动将镜像标记为 `latest`，除非工作流判定其为最新 release。

## 发布文档 {#releasing-documentation}

文档托管在 [GitHub Pages](https://wsj-br.github.io/duplistatus/) 上，与应用程序 release 分开部署。请按以下步骤发布更新的文档：

### 先决条件 {#prerequisites}

1. 确保您拥有具有 `repo` 范围的 GitHub 个人访问令牌。
2. 设置 Git 凭据（一次性设置）：

```bash
cd documentation
./setup-git-credentials.sh
```

这将提示您输入 GitHub 个人访问令牌并安全存储。

### 部署文档 {#deploy-documentation}

1. 导航至 `documentation` 目录：

```bash
cd documentation
```

2. 确保所有文档更改已提交并推送到仓库。

3. 构建并部署文档：

```bash
pnpm run deploy
```

此命令将：
- 构建 Docusaurus 文档站点
- 将构建的站点推送到 `gh-pages` 分支
- 使文档在 [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/) 可用

### 何时部署文档 {#when-to-deploy-documentation}

在以下情况部署文档更新：
- 将文档更改合并到 `master` 后
- 发布新版本时（若文档已更新）
- 重大文档改进后

**注意：** 文档部署与应用程序 release 独立。您可以在应用程序 release 之间多次部署文档。

### 为 GitHub 准备发布说明 {#preparing-release-notes-for-github}

运行 `generate-readme-from-intro.sh` 脚本时会自动生成 GitHub 发布说明。它从 `documentation/docs/release-notes/VERSION.md` 读取发布说明（VERSION 从 `package.json` 提取），并在项目根目录创建 `RELEASE_NOTES_github_VERSION.md`。

**示例：**
```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

生成的发布说明文件可直接复制粘贴到 GitHub release 描述中。所有链接和图片在 GitHub release 上下文中均可正常工作。

**注意：** 生成的文件为临时文件，创建 GitHub release 后可删除。若不想提交这些文件，建议将 `RELEASE_NOTES_github_*.md` 添加到 `.gitignore`。

### 更新 README.md {#update-readmemd}

若您更改了 `documentation/docs/intro.md`，请重新生成仓库 `README.md`：

```bash
./scripts/generate-readme-from-intro.sh
```

此脚本会：
- 从 `package.json` 提取版本
- 从 `documentation/docs/intro.md` 生成 `README.md`（将 Docusaurus 提示块转换为 GitHub 风格警报，转换链接和图片）
- 为 Docker Hub 创建 `README_dockerhub.md`（采用 Docker Hub 兼容格式）
- 从 `documentation/docs/release-notes/VERSION.md` 生成 `RELEASE_NOTES_github_VERSION.md`（将链接和图片转换为绝对 URL）
- 使用 `doctoc` 更新目录

提交并推送更新的 `README.md` 以及您的 release。
