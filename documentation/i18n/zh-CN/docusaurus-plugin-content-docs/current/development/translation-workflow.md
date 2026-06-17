# 翻译维护工作流 {#translation-maintenance-workflow}

有关常规文档命令（构建、部署、截图、README 生成），请参阅[文档工具](documentation-tools.md)。

## 概述 {#overview}

文档使用 Docusaurus i18n，默认语言为英语。源文档位于 `docs/`；翻译写入 `i18n/{locale}/`。支持的语言：en（默认）、fr、de、es、pt-BR、zh-CN。

应用 UI、Docusaurus markdown/JSON 和 SVG 资源的 **AI 翻译**由 [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) 在**仓库根目录**处理，配置位于 `ai-i18n-tools.config.json`（不在 `documentation/` 内）。运行翻译命令时需设置 `OPENROUTER_API_KEY`。

## 英语文档变更时 {#when-english-documentation-changes}

1. **编辑源文件**：在 `documentation/docs/` 中（仅英语）。
2. **Docusaurus UI 字符串**（主题标签、导航栏等）：如需要，在 `documentation/` 中运行 `pnpm write-translations`，使 `i18n/en/*.json` 获取新键。
3. **标题 ID**：`pnpm write-heading-ids`（在 `documentation/` 中运行）。
4. **翻译**：从**仓库根目录**（或在 `documentation/` 中使用下方快捷方式）：
   - `pnpm i18n:extract` — 从 Next.js 应用中的 `t('…')` 刷新 `src/locales/strings.json`。
   - `pnpm i18n:translate:docs` — 按配置将 markdown/JSON 翻译到 `documentation/i18n/`。
   - `pnpm i18n:translate:svg` — 按配置翻译 `documentation/static/img` 下的 SVG。
   - 或运行全部：`pnpm i18n:translate`。
5. **构建**：`cd documentation && pnpm build`（所有语言）。

在 `documentation/` 内部，相同流程通过 `pnpm translate` → 根目录 `i18n:translate`，以及 `pnpm translate:docs`、`translate:ui`、`translate:svg`、`translate:status`、`i18n:extract`、`i18n:sync` 实现。

## 术语表 {#glossary}

- 文档的 **UI 术语**由 `ai-i18n-tools.config.json` 中的 `glossary.uiGlossary` 驱动，指向 `src/locales/strings.json`（由 `pnpm i18n:extract` 生成的目录）。
- **覆盖项**位于 `documentation/glossary-user.csv`（配置中的 `glossary.userGlossary`）。列格式请参阅 [ai-i18n-tools 术语表文档](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md)。
- 生成 CSV 模板：`pnpm i18n:glossary-generate`（根目录）。

## 缓存 {#cache}

ai-i18n-tools 的翻译缓存位于仓库根目录的 `.translation-cache/`（`ai-i18n-tools.config.json` 中的 `cacheDir`）。已加入 gitignore。需要完全刷新时，使用 `pnpm i18n:status` 及 CLI 的 `--force` / 缓存标志，请参阅 [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) 文档。

## 标题 ID 与锚点 {#heading-ids-and-anchors}

使用显式 ID，以便各语言间链接保持稳定：

```markdown
## This is a heading {#this-is-a-heading}
```

```bash
cd documentation
pnpm write-heading-ids
```

## 忽略列表 {#ignore-lists}

在仓库根目录使用 `.translate-ignore`（与 `.gitignore` 相同思路），指定文档翻译器应跳过的路径（若您的工作流需要）。

## Docusaurus 主题 JSON {#docusaurus-theme-json}

`pnpm write-translations` 将 Docusaurus UI 字符串提取到 `documentation/i18n/en/`。**ai-i18n-tools** 的 `translate-docs` 步骤（`markdownOutput.style: "docusaurus"`）按 `ai-i18n-tools.config.json` 在各语言下填充翻译后的 JSON，与 markdown 并列。

## 故障排除 {#troubleshooting}

- `OPENROUTER_API_KEY` **未设置** — 导出或在仓库根目录的 `.env.local` 中添加。
- **模型 / 质量** — 调整 `ai-i18n-tools.config.json` 中的 `openrouter.translationModels` 及相关选项。
- **术语表** — 编辑 `documentation/glossary-user.csv`，或重新生成 UI 字符串并重新运行 extract + translate。

## 添加新语言 {#adding-a-new-language}

1. 在 `documentation/docusaurus.config.ts` 的 Docusaurus `i18n.locales` 和 `localeConfigs` 中添加该语言。
2. 在 `ai-i18n-tools.config.json`（仓库根目录）的 `targetLocales` 中添加相同语言。
3. 在根目录运行 `pnpm i18n:generate-ui-languages`，然后按需运行 `pnpm i18n:extract` / 翻译命令。
