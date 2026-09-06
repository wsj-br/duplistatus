# 翻译维护工作流 {#translation-maintenance-workflow}

有关一般文档命令（构建、部署、截图、README 生成），请参阅 [文档工具](documentation-tools.md)。

## 概览 {#overview}

本文档使用 Docusaurus i18n，并以英语作为默认语言区域。源文档位于 `docs/`；翻译内容编写在 `i18n/{locale}/` 下。支持的语言区域包括：en-GB (默认)、fr、de、es、pt-BR、hi、zh-Hans。

**AI translation** for the app UI, Docusaurus markdown/JSON, SVG assets, and **default notification templates** is handled by [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) from the **repository root**, configured in `ai-i18n-tools.config.json` (not inside `documentation/`). Set `OPENROUTER_API_KEY` when running translate commands.

## 何时英语文档更改 {#when-english-documentation-changes}

1. **编辑源** 在 `documentation/docs/`（仅英语）。
2. **Docusaurus UI 字符串**（主题标签、导航栏等）：如果需要，在 `documentation/` 中运行 `pnpm write-translations`，以便 `i18n/en/*.json` 获取新键。
3. **标题 ID**：`pnpm write-heading-ids`（来自 `documentation/`）。
4. **翻译** 从 **仓库根**（或使用以下 `documentation/` 的快捷方式）：
   - `pnpm i18n:extract` — refresh `src/locales/strings.json` from `t('…')` in the Next.js app.
   - `pnpm i18n:translate:docs` — translate markdown/JSON into `documentation/i18n/` per config.
   - `pnpm i18n:translate:svg` — translate SVGs under `documentation/static/img` as configured.
   - `pnpm i18n:translate:json` — translate default notification templates in `src/locales/templates/` from `en-GB.json`.
   - Or run everything: `pnpm i18n:translate`.
5. **Build**: `cd documentation && pnpm build` (all locales).

从 `documentation/` 内部，相同的流程被连接为 `pnpm translate` → 根 `i18n:translate`，加上 `pnpm translate:docs`、`translate:ui`、`translate:svg`、`translate:status`、`i18n:extract`、`i18n:sync`。

## UI 复数 {#ui-plurals}

Next.js 应用中的基数复数使用 **ai-i18n-tools**，而不是手动编写的 `_one` / `_other` 键。

编写一个英语源字符串（通常是复数）并传递一个 **纯对象字面量**，其中包含 `plurals: true` 和一个数字 `count`：

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

规则：

- 不要使用 `item(s)` 边际或 `count === 1 ? t('…') : t('…')` 对。
- 独立 **数字** 计数需要单独的 `t()` 调用——一个复数轴不能灵活处理两个数字（例如 1 个成功和 2 个失败）。连接这些片段：

```tsx
`${t("Tested {{count}} connections:", { plurals: true, count: total })} ` +
  `${t("{{count}} successful,", { plurals: true, count: successCount })} ` +
  `${t("{{count}} failed", { plurals: true, count: failureCount })}`
```

- 非数字插值（名称、标签等）可以与 `{{count}}` 在同一个复数字符串中使用。
- `pnpm i18n:extract` 标记目录行 `"plural": true`。`pnpm i18n:translate:ui` 填充 CLDR 表单并写入 `src/locales/en-GB.json`（仅复数键）。
- `src/i18n.ts` 和 `src/lib/i18n-server.ts` 将该文件加载为 `sourcePluralFlatBundle`，以便英语单数/复数在运行时解析。

## Default notification templates {#default-notification-templates}

设置 → 模板 → **重置** loads defaults from `src/locales/templates/{locale}.json` (wired in `src/lib/default-notification-templates.ts`).

1. Edit **`src/locales/templates/en-GB.json`** only (English source).
2. Run **`pnpm i18n:translate:json`** (or **`pnpm i18n:translate`**) from the repo root.
3. Review diffs — placeholders such as `{backup_name}` and `{problem_table}` must stay unchanged; `priority` and `tags` are skipped by `keyPolicy` in `ai-i18n-tools.config.json`.
4. Run **`pnpm i18n:status`** to see JSON block coverage.

See the [ai-i18n-tools JSON guide](https://wsj-br.github.io/ai-i18n-tools/guide/json.html) for flags (`--locale`, `--force`, etc.).

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
