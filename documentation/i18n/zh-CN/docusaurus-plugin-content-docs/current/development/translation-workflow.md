# 翻译维护工作流 {#translation-maintenance-workflow}

有关通用文档命令（构建、部署、截图、README 生成），请参阅 [Documentation Tools](documentation-tools.md)。

## 概览 {#overview}

文档使用 Docusaurus i18n，默认语言为英语。源文档位于 `docs/`；翻译内容编写在 `i18n/{locale}/` 下。支持的语言区域：en（默认）、fr、de、es、pt-BR、zh-CN。

针对应用 UI、Docusaurus markdown/JSON 和 SVG 资源的 **AI 翻译**，由 **仓库根目录**下的 [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) 处理，并在 `ai-i18n-tools.config.json` 中配置（不在 `documentation/` 内部）。运行翻译命令时请设置 `OPENROUTER_API_KEY`。

## 时间 英语文档发生变更 {#when-english-documentation-changes}

1. 在 `documentation/docs/` 中 **编辑源文件**（仅限英语）。
2. **Docusaurus UI 字符串**（主题标签、导航栏等）：如有需要，在 `documentation/` 中运行 `pnpm write-translations`，以便 `i18n/en/*.json` 获取新键值。
3. **标题 ID**：`pnpm write-heading-ids`（来自 `documentation/`）。
4. 从 **仓库根目录**执行 **翻译**（或在 `documentation/` 中使用以下快捷方式）：
   - `pnpm i18n:extract` — 在 Next.js 应用中根据 `t('…')` 刷新 `src/locales/strings.json`。
   - `pnpm i18n:translate:docs` — 根据配置将 markdown/JSON 翻译为 `documentation/i18n/`。
   - `pnpm i18n:translate:svg` — 根据配置翻译 `documentation/static/img` 下的 SVG。
   - 或运行全部：`pnpm i18n:translate`。
5. **构建**：`cd documentation && pnpm build`（全部语言区域）。

在 `documentation/` 内部，相同的流程被映射为 `pnpm translate` $\to$ 根目录 `i18n:translate`，以及 `pnpm translate:docs`、`translate:ui`、`translate:svg`、`translate:status`、`i18n:extract`、`i18n:sync`。

## 术语表 {#glossary}

- 文档的 **UI 术语**由 `ai-i18n-tools.config.json` 中的 `glossary.uiGlossary` 驱动，指向 `src/locales/strings.json`（由 `pnpm i18n:extract` 生成的目录）。
- **覆盖项**位于 `documentation/glossary-user.csv`（配置中的 `glossary.userGlossary`）。有关列格式，请参阅 [ai-i18n-tools glossary docs](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md)。
- 生成 CSV 模板：`pnpm i18n:glossary-generate`（根目录）。

## 缓存 {#cache}

ai-i18n-tools 的翻译缓存位于仓库根目录的 `.translation-cache/`（`ai-i18n-tools.config.json` 中的 `cacheDir`）。该目录已被 gitignore。当需要完全刷新时，请根据 [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) 文档使用 `pnpm i18n:status` 和 CLI 的 `--force` / cache 标志。

## 标题 ID 和锚点 {#heading-ids-and-anchors}

使用显式 ID 以确保链接在不同语言之间保持稳定：

```markdown
## This is a heading {#this-is-a-heading}
```

```bash
cd documentation
pnpm write-heading-ids
```

## 忽略列表 {#ignore-lists}

如果您在工作流中添加了忽略列表，请在仓库根目录使用 `.translate-ignore`（与 `.gitignore` 类似），用于指定文档翻译器应跳过的路径。

## Docusaurus 主题 JSON {#docusaurus-theme-json}

`pnpm write-translations` 将 Docusaurus UI 字符串提取到 `documentation/i18n/en/` 中。**ai-i18n-tools** 的 `translate-docs` 步骤（配合 `markdownOutput.style: "docusaurus"`）会根据 `ai-i18n-tools.config.json`，在每个语言区域下与 markdown 并列填充翻译后的 JSON。

## 故障排除 {#troubleshooting}

- `OPENROUTER_API_KEY` **未设置** — 请导出该变量或将其添加到仓库根目录的 `.env.local` 中。
- **模型 / 质量** — 请在 `ai-i18n-tools.config.json` 中调整 `openrouter.translationModels` 和相关选项。
- **术语表** — 请编辑 `documentation/glossary-user.csv`，或重新生成 UI 字符串并重新运行提取和翻译。

## 添加新语言 {#adding-a-new-language}

1. 在 `documentation/docusaurus.config.ts` 的 Docusaurus `i18n.locales` 和 `localeConfigs` 中添加该区域设置。
2. 在 `ai-i18n-tools.config.json`（仓库根目录）的 `targetLocales` 中添加相同的区域设置。
3. 在根目录下运行 `pnpm i18n:generate-ui-languages`，然后根据需要运行 `pnpm i18n:extract` / 翻译命令。
