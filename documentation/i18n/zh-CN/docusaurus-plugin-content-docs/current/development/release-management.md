# 版本管理 {#release-management}

## 版本控制 (语义化版本) {#versioning-semantic-versioning}

本项目遵循语义化版本 (SemVer)，格式为 `MAJOR.MINOR.PATCH`：

- **主**版本 (x.0.0)：当你进行了不兼容的 API 更改时
- **次**版本 (0.x.0)：当你以向后兼容的方式添加功能时
- **修订**版本 (0.0.x)：当你进行了向后兼容的错误修复时

## 发布前检查清单 {#pre-release-checklist}

在发布新版本之前，请确保已完成以下事项：

- [ ] 全部更改已提交并推送到 `vMAJOR.MINOR.x` 分支。
- [ ] `package.json` 中的版本数字已更新（使用 `scripts/update-version.sh` 在各文件中进行同步）。
- [ ] 全部测试通过（在开发模式、本地、docker 和 podman 中）。
- [ ] 使用 `pnpm docker:up` 启动 Docker 容器并运行 `scripts/compare-versions.sh`，以验证开发环境与 Docker 容器之间的版本一致性（需要 Docker 容器正在运行）。该脚本仅通过主版本号比较 SQLite 版本（例如，3.45.1 和 3.51.1 被视为兼容），并精确比较 Node、npm 和 duplistatus 版本。
- [ ] 文档已更新，更新截图（使用 `pnpm take-screenshots`）
- [ ] `documentation/docs/release-notes/VERSION.md` 中已准备好发布说明。
- [ ] 运行 `scripts/generate-readme-from-intro.sh` 以使用新版本和来自 `documentation/docs/intro.md` 的任何更改来更新 `README.md`。该脚本还会自动生成 `README_dockerhub.md` 和 `RELEASE_NOTES_github_VERSION.md`。

## 发布流程概览 {#release-process-overview}

推荐的发布流程使用 **GitHub Pull Requests 和 Releases**（见下文）。这提供了更好的可见性、审核能力，并能自动触发 Docker 镜像构建。命令行方法可作为替代方案。

## 方法 1：GitHub Pull Request 和 Release（推荐） {#method-1-github-pull-request-and-release-recommended}

这是首选方法，因为它提供了更好的可追溯性并能自动触发 Docker 构建。

### 步骤 1：创建 Pull Request {#step-1-create-pull-request}

1. 导航至 GitHub 上的 [duplistatus 仓库](https://github.com/wsj-br/duplistatus)。
2. 点击 **"Pull requests"** 选项卡。
3. 点击 **"New pull request."**
4. 将 **base branch**（基准分支）设置为 `master`，将 **compare branch**（比较分支）设置为 `vMAJOR.MINOR.x`。
5. 查看更改预览以确保一切正确。
6. 点击 **"Create pull request."**
7. 添加描述性标题（例如 "Release v1.2.0"）和总结更改的描述。
8. 再次点击 **"Create pull request"**。

### 步骤 2：合并 Pull Request {#step-2-merge-the-pull-request}

在审核 Pull Request 后：

1. 如果没有冲突，点击绿色的 **"Merge pull request"** 按钮。
2. 选择合并策略（通常为 "Create a merge commit"）。
3. 确认合并。

### 步骤 3：创建 GitHub Release {#step-3-create-github-release}

合并完成后，创建 GitHub release：

1. 导航到 GitHub 上的 [duplistatus 仓库](https://github.com/wsj-br/duplistatus)。
2. 转到 **"发行版"** 部分（或在右侧边栏中点击"发行版"）。
3. 点击 **"起草新版本"**。
4. 在 **"选择标签"** 字段中，以 `vMAJOR.MINOR.PATCH` 格式输入新的版本号（例如，`v1.2.0`）。这将创建一个新标签。
5. 选择 `master` 作为目标分支。
6. 添加 **发行版标题**（例如，"发行版 v1.2.0"）。
7. 添加 **描述** 记录此版本的更改。你可以：
   - 复制 `RELEASE_NOTES_github_VERSION.md`（由 `scripts/generate-readme-from-intro.sh` 生成）的内容
   - 或引用 `documentation/docs/release-notes/` 的发行说明（但请注意，相对链接在 GitHub 发行版中无法工作）
8. 点击 **"发布发行版"**。

**自动发生的事项：**
- 创建一个新的 Git 标签
- 触发"构建和发布 Docker 镜像"工作流
- 为 AMD64 和 ARM64 架构构建 Docker 镜像
- 镜像将推送到：
  - Docker Hub：`wsjbr/duplistatus:VERSION` 和 `wsjbr/duplistatus:latest`（如果这是最新发行版）
  - GitHub 容器注册表：`ghcr.io/wsj-br/duplistatus:VERSION` 和 `ghcr.io/wsj-br/duplistatus:latest`（如果这是最新发行版）

## 方法 2：命令行（替代方案） {#method-2-command-line-alternative}

如果你更喜欢使用命令行，请按照以下步骤操作：

### 步骤 1：更新本地主分支 {#step-1-update-local-master-branch}

确保你的本地 `master` 分支是最新的：

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

如果存在 **合并冲突**，请手动解决：
1. 编辑冲突的文件
2. 暂存已解决的文件：`git add <file>`
3. 完成合并：`git commit`

### 步骤 3：为发行版打标签 {#step-3-tag-the-release}

为新版本创建带注释的标签：

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

`-a` 标志创建带注释的标签（发行版推荐），`-m` 标志添加消息。

### 步骤 4：推送到 GitHub {#step-4-push-to-github}

推送更新后的 `master` 分支和新标签：

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

或者，一次性推送所有标签：`git push --tags`

### 步骤 5：创建 GitHub 发行版 {#step-5-create-github-release}

推送标签后，创建 GitHub 发行版（参见方法 1，步骤 3）以触发 Docker 构建工作流。

## 手动构建 Docker 镜像 {#manual-docker-image-build}

若要在不创建发布版本的情况下手动触发 Docker 镜像构建工作流：

1. 导航至 GitHub 上的 [duplistatus 仓库](https://github.com/wsj-br/duplistatus)。
2. 点击 **"操作"** 选项卡。
3. 选择 **"Build and Publish Docker Image"** 工作流。
4. 点击 **"Run workflow"**。
5. 选择要构建的分支（通常为 `master`）。
6. 再次点击 **"Run workflow"**。

**注意：** 除非工作流确定该版本为最新发布版本，否则手动构建不会自动将镜像标记为 `latest`。

## 发布文档 {#releasing-documentation}

文档托管在 [GitHub Pages](https://wsj-br.github.io/duplistatus/) 上，并与应用程序发布独立部署。请按照以下步骤发布更新后的文档：

### 前提条件 {#prerequisites}

1. 确保您拥有具有 `repo` 权限范围的 GitHub 个人访问令牌 (Personal Access Token)。
2. 设置 Git 凭据（一次性设置）：

```bash
cd documentation
./setup-git-credentials.sh
```

系统将提示您输入 GitHub 个人访问令牌并将其安全存储。

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
- 将构建好的站点推送到 `gh-pages` 分支
- 使文档可通过 [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/) 访问

### 时间部署文档 {#when-to-deploy-documentation}

在以下情况部署文档更新：
- 将文档更改合并到 `master` 后
- 发布新版本时（如果文档已更新）
- 对文档进行重大改进后

**注意：** 文档部署独立于应用程序发布。您可以在两次应用程序发布之间多次部署文档。

### 为 GitHub 准备发布说明 {#preparing-release-notes-for-github}

运行 `generate-readme-from-intro.sh` 脚本时会自动生成 GitHub 发布说明。它会从 `documentation/docs/release-notes/VERSION.md`（其中 VERSION 从 `package.json` 中提取）读取发布说明，并在项目根目录下创建 `RELEASE_NOTES_github_VERSION.md`。

**示例：**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

生成的发行说明文件可直接复制粘贴到 GitHub 发行版描述中。所有链接和图片在 GitHub 发行版环境中均可正常显示。

**注意：** 生成的文件是临时的，在创建 GitHub release 后可以将其删除。如果您不想提交这些文件，建议将 `RELEASE_NOTES_github_*.md` 添加到 `.gitignore` 中。

### 更新 README.md {#update-readmemd}

如果您对 `documentation/docs/intro.md` 进行了更改，请重新生成仓库 `README.md`：

```bash
./scripts/generate-readme-from-intro.sh
```

此脚本将：
- 从 `package.json` 中提取版本
- 根据 `documentation/docs/intro.md` 生成 `README.md`（将 Docusaurus 警告转换为 GitHub 风格的警报，并转换链接和图像）
- 为 Docker Hub 创建 `README_dockerhub.md`（采用与 Docker Hub 兼容的格式）
- 根据 `documentation/docs/release-notes/VERSION.md` 生成 `RELEASE_NOTES_github_VERSION.md`（将链接和图像转换为绝对 URL）
- 使用 `doctoc` 更新目录

将更新后的 `README.md` 与您的 release 一起提交并推送。
