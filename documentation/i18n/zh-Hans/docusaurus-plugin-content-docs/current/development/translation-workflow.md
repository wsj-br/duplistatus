# 翻译维护工作流 {#translation-maintenance-workflow}

有关一般文档命令（构建、部署、截图、README 生成），请参阅 [文档工具](documentation-tools.md)。

## 概览 {#overview}

文档使用 Docusaurus i18n，英语为默认语言环境。源文档位于 `docs/`；翻译位于 `i18n/{locale}/` 下。支持的语言环境：en-GB（默认）、fr、de、es、pt-BR、hi-Latn、zh-Hans。

**AI 翻译**用于应用程序 UI、Docusaurus markdown/JSON 和 SVG 资产，处理由 [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) 从 **仓库根** 处理，配置在 `ai-i18n-tools.config.json`（不在 `documentation/` 内）。运行翻译命令时设置 `OPENROUTER_API_KEY`。

## 何时英语文档更改 {#when-english-documentation-changes}

1. **编辑源** 在 `documentation/docs/`（仅英语）。
2. **Docusaurus UI 字符串**（主题标签、导航栏等）：如果需要，在 `documentation/` 中运行 `pnpm write-translations`，以便 `i18n/en/*.json` 获取新键。
3. **标题 ID**：`pnpm write-heading-ids`（来自 `documentation/`）。
4. **翻译** 从 **仓库根**（或使用以下 `documentation/` 的快捷方式）：
   - `pnpm i18n:extract` — 刷新 `src/locales/strings.json` 从 `t('…')` 在 Next.js 应用程序中。
   - `pnpm i18n:translate:docs` — 将 markdown/JSON 翻译成 `documentation/i18n/`，如配置所示。
   - `pnpm i18n:translate:svg` — 将 SVG 翻译成 `documentation/static/img`，如配置所示。
   - 或运行所有内容：`pnpm i18n:translate`。
5. **构建**：`cd documentation && pnpm build`（所有语言）。

从 `documentation/` 内部，相同的流程被连接为 `pnpm translate` → 根 `i18n:translate`，加上 `pnpm translate:docs`、`translate:ui`、`translate:svg`、`translate:status`、`i18n:extract`、`i18n:sync`。

## 词汇表 {#glossary}

- **UI 术语**用于文档，驱动由 `glossary.uiGlossary` 在 `ai-i18n-tools.config.json` 中指向 `src/locales/strings.json`（由 `pnpm i18n:extract` 生成的目录）。
- **覆盖**存活在 `documentation/glossary-user.csv`（配置中的 `glossary.userGlossary`）。请参阅 [ai-i18n-tools 词汇表文档](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md) 以获取列格式。
- 生成 CSV 模板：`pnpm i18n:glossary-generate`（根目录）。

## 缓存 {#cache}

ai-i18n-tools 的翻译缓存位于 `.translation-cache/` 的仓库根目录下（`cacheDir` 在 `ai-i18n-tools.config.json` 中）。它被 git 忽略。需要完全刷新时，请使用 `pnpm i18n:status` 和 CLI 的 `--force` / 缓存标志，按照 [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) 文档进行操作。

## 标题 ID 和锚点 {#heading-ids-and-anchors}

使用显式 ID 以便链接在语言之间保持稳定：

```markdown
## This is a heading {#this-is-a-heading}
```

```bash
cd documentation
pnpm write-heading-ids
```

## 忽略列表 {#ignore-lists}

使用 `.translate-ignore` 在仓库根目录下（与 `.gitignore` 的想法相同），用于文档翻译器应跳过的路径，如果您为工作流添加了一个。

## Docusaurus 主题 JSON {#docusaurus-theme-json}

`pnpm write-translations` 提取 Docusaurus UI 字符串到 `documentation/i18n/en/`。**ai-i18n-tools** `translate-docs` 步骤（带有 `markdownOutput.style: "docusaurus"`）填充翻译后的 JSON 在每个语言的 markdown 旁边，按照 `ai-i18n-tools.config.json` 进行。

## 故障排除 {#troubleshooting}

- `OPENROUTER_API_KEY` **未设置** — 导出它或将其添加到仓库根目录的 `.env.local` 中。
- **模型 / 质量** — 调整 `ai-i18n-tools.config.json` 中的 `openrouter.translationModels` 和相关选项。
- **术语表** — 编辑 `documentation/glossary-user.csv` 或重新生成 UI 字符串，然后重新运行提取和翻译。

## 添加新语言 {#adding-a-new-language}

1. 将区域设置添加到 `documentation/docusaurus.config.ts` 中的 Docusaurus `i18n.locales` 和 `localeConfigs`。
2. 将相同的区域设置添加到 `ai-i18n-tools.config.json`（仓库根目录）中的 `targetLocales`。
3. 在根目录运行 `pnpm i18n:generate-ui-languages`，然后根据需要运行 `pnpm i18n:extract` / translate 命令。
