# 版本管理 {/* #release-management */}

## 版本控制（语义化版本控制） {/* #versioning-semantic-versioning */}

项目遵循语义化版本控制（SemVer），格式为 `MAJOR.MINOR.PATCH`：

- **主版本号**（x.0.0）：当您进行不兼容的 API 更改时
- **次版本号**（0.x.0）：当您以向后兼容的方式添加功能时
- **修订版本号**（0.0.x）：当您进行向后兼容的错误修复时

## 发布前检查清单 {/* #pre-release-checklist */}

在发布新版本之前，请确保您已完成以下操作：

- [ ] 所有更改都已提交并推送到 `vMAJOR.MINOR.x` 分支。
- [ ] 版本号已在 `package.json` 中更新（使用 `scripts/update-version.sh` 在文件间同步）。
- [ ] 所有测试均已通过（在开发模式、本地、docker 和 podman 中）。
- [ ] 使用 `pnpm docker:up` 启动一个 Docker 容器并运行 `scripts/compare-versions.sh`，以验证开发环境和 Docker 容器之间的版本一致性（需要 Docker 容器正在运行）。此脚本仅按主要版本比较 SQLite 版本（例如，3.45.1 和 3.51.1 被视为兼容），并精确比较 Node、npm 和 duplistatus 版本。
- [ ] 文档已更新，更新截图（使用 `pnpm take-screenshots`）
- [ ] 发行说明已在 `documentation/docs/release-notes/VERSION.md` 中准备。
- [ ] 运行 `scripts/generate-readme-from-intro.sh` 以使用新版本和来自 `documentation/docs/intro.md` 的任何更改更新 `README.md`。此脚本还会自动生成 `README_dockerhub.md` 和 `RELEASE_NOTES_github_VERSION.md`。

## 发布流程概述 {/* #release-process-overview */}

推荐的发布流程使用 **GitHub 拉取请求和发行版**（见下文）。这提供了更好的可见性、审查功能，并自动触发 Docker 镜像构建。命令行方法可作为替代方案。

## 方法 1：GitHub 拉取请求和发行版（推荐） {/* #method-1-github-pull-request-and-release-recommended */}

这是首选方法，因为它提供更好的可追溯性并自动触发 Docker 构建。

### 步骤 1：创建拉取请求 {/* #step-1-create-pull-request */}

1. 导航到 GitHub 上的 [duplistatus 仓库](https://github.com/wsj-br/duplistatus)。
2. 单击 **"Pull requests"** 标签页。
3. 单击 **"New pull request"**。
4. 将 **基础分支** 设置为 `master`，将 **比较分支** 设置为 `vMAJOR.MINOR.x`。
5. 查看更改预览以确保一切看起来正确。
6. 单击 **"Create pull request"**。
7. 添加描述性标题（例如，"Release v1.2.0"）和总结更改的描述。
8. 再次单击 **"Create pull request"**。

### 步骤 2：合并拉取请求 {/* #step-2-merge-the-pull-request */}

审查拉取请求后：

1. 如果没有冲突，请单击绿色的 **"Merge pull request"** 按钮。
2. 选择您的合并策略（通常为"Create a merge commit"）。
3. 确认合并。

### 步骤 3：创建 GitHub 发行版 {/* #step-3-create-github-release */}

合并完成后，创建一个 GitHub 发行版：

1. 导航到 GitHub 上的 [duplistatus 仓库](https://github.com/wsj-br/duplistatus)。
2. 转到 **"Releases"** 部分（或单击右侧边栏中的 "Releases"）。
3. 单击 **"Draft a new release."**
4. 在 **"Choose a tag"** 字段中，以 `vMAJOR.MINOR.PATCH` 格式输入新版本号（例如，`v1.2.0`）。这将创建一个新标签。
5. 选择 `master` 作为目标分支。
6. 添加 **发布标题**（例如，"Release v1.2.0"）。
7. 添加 **描述** 记录此版本的更改。您可以：
   - 复制 `RELEASE_NOTES_github_VERSION.md` 的内容（由 `scripts/generate-readme-from-intro.sh` 生成）
   - 或引用 `documentation/docs/release-notes/` 的发布说明（但请注意 GitHub 发布中相对链接不起作用）
8. 单击 **"Publish release."**

**自动发生的事情：**
- 创建新的 Git 标签
- 触发 "Build and Publish Docker Image" 工作流程
- 为 AMD64 和 ARM64 架构构建 Docker 镜像
- 镜像推送到：
  - Docker Hub：`wsjbr/duplistatus:VERSION` 和 `wsjbr/duplistatus:latest`（如果是最新发布）
  - GitHub 容器注册表：`ghcr.io/wsj-br/duplistatus:VERSION` 和 `ghcr.io/wsj-br/duplistatus:latest`（如果是最新发布）

## 方法 2：命令行（替代方案） {/* #method-2-command-line-alternative */}

从应发布的提交（通常为已推送的 `master`）开始，保持干净的工作树和就绪的 `documentation/docs/release-notes/VERSION.md`：

```bash
pnpm release:github:dry   # print the planned tag, notes file, and gh command
pnpm release:github       # generate GitHub notes, tag vVERSION at HEAD, publish the release, and deploy the docs
```

`scripts/release.mjs` 从 `package.json` 中读取版本，运行 `scripts/generate-readme-from-intro.sh`（以便 `RELEASE_NOTES_github_VERSION.md` 包含绝对链接），并创建 GitHub release。发布该 release 会启动 Docker 镜像工作流。随后脚本会在 `documentation/` 中运行 `pnpm run deploy` 以构建 Docusaurus 站点并推送到 `gh-pages`。如果标签 `vVERSION` 或该 GitHub release 已存在，脚本将删除它们并在当前 HEAD 重新创建标签。传入 `--verify-clean=false` 可跳过工作树干净状态检查。

以下步骤为手动执行的相同操作。

### 步骤 1：更新本地主分支 {/* #step-1-update-local-master-branch */}

确保您的本地 `master` 分支是最新的：

```bash
# Checkout the master branch
git checkout master

# Pull the latest changes from the remote repository
git pull origin master
```

### 步骤 2：合并开发分支 {/* #step-2-merge-development-branch */}

将 `vMAJOR.MINOR.x` 分支合并到 `master`：

```bash
# Merge the vMAJOR.MINOR.x branch into master
git merge vMAJOR.MINOR.x
```

如果有 **合并冲突**，请手动解决：
1. 编辑冲突文件
2. 暂存已解决的文件：`git add <file>`
3. 完成合并：`git commit`

### 步骤 3：标记发布 {/* #step-3-tag-the-release */}

为新版本创建带注释的标签：

```bash
# Create an annotated tag for the new version
git tag -a vMAJOR.MINOR.PATCH -m "Release vMAJOR.MINOR.PATCH - Brief description"
```

`-a` 标志创建带注释的标签（发布推荐），`-m` 标志添加消息。

### 步骤 4：推送到 GitHub {/* #step-4-push-to-github */}

同时推送更新的 `master` 分支和新标签：

```bash
# Push the updated master branch
git push origin master

# Push the new tag
git push origin vMAJOR.MINOR.PATCH
```

或者，一次推送所有标签：`git push --tags`

### 步骤 5：创建 GitHub 发布 {/* #step-5-create-github-release */}

推送标签后，创建 GitHub 发布（参见方法 1，第 3 步）以触发 Docker 构建工作流程。

## 手动 Docker 镜像构建 {/* #manual-docker-image-build */}

要手动触发 Docker 镜像构建工作流程而不创建发布版本：

1. 导航到 GitHub 上的 [duplistatus 仓库](https://github.com/wsj-br/duplistatus)。
2. 点击 **"Actions"** 标签页。
3. 选择 **"Build and Publish Docker Image"** 工作流程。
4. 点击 **"Run workflow"**。
5. 选择要构建的分支（通常为 `master`）。
6. 再次点击 **"Run workflow"**。

**注意：** 手动构建不会自动将镜像标记为 `latest`，除非工作流程确定这是最新发布版本。

## 发布文档 {/* #releasing-documentation */}

文档托管在 [GitHub Pages](https://wsj-br.github.io/duplistatus/) 上。`pnpm release:github` 会在发布 GitHub release 后对其进行部署。如需在两次应用程序版本发布之间更新站点，请按以下步骤操作：

### 先决条件 {/* #prerequisites */}

1. 确保您拥有具有 `repo` 范围的 GitHub 个人访问令牌。
2. 设置 Git 凭据（一次性设置）：

```bash
cd documentation
./setup-git-credentials.sh
```

这将提示您输入 GitHub 个人访问令牌并安全存储。

### 部署文档 {/* #deploy-documentation */}

1. 导航到 `documentation` 目录：

```bash
cd documentation
```

2. 确保所有文档更改都已提交并推送到仓库。

3. 构建并部署文档：

```bash
pnpm run deploy
```

此命令将：
- 构建 Docusaurus 文档站点
- 将构建的站点推送到 `gh-pages` 分支
- 在 [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/) 提供文档访问

### 何时部署文档 {/* #when-to-deploy-documentation */}

部署文档更新：
- 在将文档更改合并到 `master` 后
- 发布新版本时（如果文档已更新）
- 在重要文档改进后

**注意：** 文档部署与应用程序发布独立。您可以在应用程序发布之间多次部署文档。

### 为 GitHub 准备发布说明 {/* #preparing-release-notes-for-github */}

`generate-readme-from-intro.sh` 脚本在运行时会自动生成 GitHub 发布说明。它从 `documentation/docs/release-notes/VERSION.md` 读取发布说明（其中 VERSION 从 `package.json` 提取）并在项目根目录创建 `RELEASE_NOTES_github_VERSION.md`。

**示例：**

```bash
# This will generate README.md, README_dockerhub.md, and RELEASE_NOTES_github_VERSION.md
./scripts/generate-readme-from-intro.sh
```

生成的发布说明文件可以直接复制粘贴到 GitHub 发布描述中。所有链接和图像在 GitHub 发布环境中都能正常工作。

**注意：** 生成的文件是临时的，在创建 GitHub 发布后可以删除。如果您不想提交这些文件，建议将 `RELEASE_NOTES_github_*.md` 添加到 `.gitignore` 中。

### 更新 README.md {/* #update-readmemd */}

如果您已对 `documentation/docs/intro.md` 进行了更改，请重新生成仓库 `README.md`：

```bash
./scripts/generate-readme-from-intro.sh
```

此脚本：
- 从 `package.json` 提取版本
- 从 `documentation/docs/intro.md` 生成 `README.md`（将 Docusaurus 注释转换为 GitHub 风格的警报，转换链接和图像）
- 为 Docker Hub 创建 `README_dockerhub.md`（使用 Docker Hub 兼容格式）
- 从 `documentation/docs/release-notes/VERSION.md` 生成 `RELEASE_NOTES_github_VERSION.md`（将链接和图像转换为绝对 URL）
- 使用 `doctoc` 更新目录

提交并推送更新后的 `README.md` 以及您的发布。
