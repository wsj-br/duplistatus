# 翻译维护工作流程 {/* #translation-maintenance-workflow */}

有关一般文档命令（构建、部署、截图、README 生成），请参见[文档工具](documentation-tools.md)。

## 概述 {/* #overview */}

文档使用 Docusaurus i18n，以英语为默认区域设置。源文档位于 `docs/`；翻译写在 `i18n/{locale}/` 下。支持的区域设置：en-GB（默认）、fr、de、es、pt-BR、hi、zh-Hans。

**AI 翻译** 用于应用程序 UI、Docusaurus markdown/JSON、SVG 资源 和 **默认通知模板** 由 **仓库根目录** 的 [**ai-i18n-tools**](https://www.npmjs.com/package/ai-i18n-tools) 处理，在 `ai-i18n-tools.config.json` 中配置（不在 `documentation/` 内）。运行翻译命令时设置 `OPENROUTER_API_KEY`。

要在同一台机器上尝试未发布的检出版本（默认 `../ai-i18n-tools`），使用 `pnpm i18n:tools --local` 或 `./scripts/link-ai-i18n-tools.sh --local` 切换依赖项。这将链接 CLI（`pnpm i18n:*`）和 `ai-i18n-tools/runtime` 导入。源代码更改后重新构建工具包（在该检出版本中执行 `pnpm build`）。使用 `--remote` 恢复最新的 npm 包。不要提交 `link:` 说明符。

## 当英文文档更改时 {/* #when-english-documentation-changes */}

1. 在 `documentation/docs/` 中**编辑源文件**（仅英语）。
2. **Docusaurus UI 字符串**（主题标签、导航栏等）：如果需要，在 `documentation/` 中运行 `pnpm write-translations`，以便 `i18n/en/*.json` 获取新键。
3. **标题 ID**：`pnpm write-heading-ids`（来自 `documentation/`）。
4. 从 **仓库根目录** 进行**翻译**（或从 `documentation/` 使用以下快捷方式）：
   - `pnpm i18n:extract` — 从 Next.js 应用中的 `t('…')` 刷新 `src/locales/strings.json`。
   - `pnpm i18n:translate:docs` — 根据配置将 markdown/JSON 翻译到 `documentation/i18n/`。
   - `pnpm i18n:translate:svg` — 按配置翻译 `documentation/static/img` 下的 SVG。
   - `pnpm i18n:translate:json` — 从 `en-GB.json` 翻译 `src/locales/templates/` 中的默认通知模板。
   - 或运行全部：`pnpm i18n:translate`。
5. **构建**：`cd documentation && pnpm build`（所有区域设置）。

在 `documentation/` 内部，相同的流程连接为 `pnpm translate` → 根目录 `i18n:translate`，加上 `pnpm translate:docs`、`translate:ui`、`translate:svg`、`translate:status`、`i18n:extract`、`i18n:sync`。

## UI 复数 {/* #ui-plurals */}

Next.js 应用中的基数复数使用 **ai-i18n-tools**，而不是手写的 `_one` / `_other` 键。

编写一个英文源字符串（通常是复数形式）并传递一个带有 `plurals: true` 和数字 `count` 的**普通对象字面量**：

```tsx
t("{{count}} backups selected", { plurals: true, count: selectedBackups.size })
```

规则：

- 不要使用 `item(s)` 模糊表达或 `count === 1 ? t('…') : t('…')` 配对。
- 独立的**数字**计数需要单独的 `t()` 调用 — 一个复数轴不能同时处理两个数字（例如 1 成功和 2 失败）。连接片段：

```tsx
`${t("Tested {{count}} connections:", { plurals: true, count: total })} ` +
  `${t("{{count}} successful,", { plurals: true, count: successCount })} ` +
  `${t("{{count}} failed", { plurals: true, count: failureCount })}`
```

- 非数字插值（名称、标签等）可以在同一个复数字符串中与 `{{count}}` 一起使用。
- `pnpm i18n:extract` 标记目录行 `"plural": true`。`pnpm i18n:translate:ui` 填充 CLDR 形式并写入 `src/locales/en-GB.json`（仅复数键）。
- `src/i18n.ts` 和 `src/lib/i18n-server.ts` 将该文件作为 `sourcePluralFlatBundle` 加载，因此英语单复数在运行时解析。

## 默认通知模板 {/* #default-notification-templates */}

设置 → 模板 → **重置** 从 `src/locales/templates/{locale}.json` 加载默认值（在 `src/lib/default-notification-templates.ts` 中连接）。

1. 仅编辑 **`src/locales/templates/en-GB.json`**（英文源文件）。
2. 从仓库根目录运行 **`pnpm i18n:translate:json`**（或 **`pnpm i18n:translate`**）。
3. 审查差异 — 占位符如 `{backup_name}` 和 `{problem_table}` 必须保持不变；`priority` 和 `tags` 在 `ai-i18n-tools.config.json` 的 `keyPolicy` 中被跳过。
4. 运行 **`pnpm i18n:status`** 查看 JSON 块覆盖率。

请参阅 [ai-i18n-tools JSON 指南](https://wsj-br.github.io/ai-i18n-tools/guide/json.html) 了解标志（`--locale`、`--force` 等）。

## 词汇表 {/* #glossary */}

- 文档的**用户界面术语**由 `glossary.uiGlossary` 中的 `ai-i18n-tools.config.json` 驱动，指向 `src/locales/strings.json`（由 `pnpm i18n:extract` 生成的目录）。
- **覆盖项**位于 `documentation/glossary-user.csv`（配置中的 `glossary.userGlossary`）。有关列格式，请参阅 [ai-i18n-tools 词汇表文档](https://github.com/wsj-br/ai-i18n-tools/blob/main/docs/GETTING_STARTED.md)。
- 生成 CSV 模板：`pnpm i18n:glossary-generate`（根目录）。

## 缓存 {/* #cache */}

ai-i18n-tools 的翻译缓存位于仓库根目录下的 `.translation-cache/`（`ai-i18n-tools.config.json` 中的 `cacheDir`）。该缓存被 gitignore 忽略。当需要完全刷新时，请使用 `pnpm i18n:status` 和 CLI 的 `--force` / 缓存标志，具体请参考 [ai-i18n-tools](https://github.com/wsj-br/ai-i18n-tools) 文档。

## 标题 ID 和锚点 {/* #heading-ids-and-anchors */}

使用显式 ID 以便链接在不同语言间保持稳定。优先使用 MDX 注释语法（`pnpm write-heading-ids` 使用 `--syntax mdx-comment`）：

```markdown
## This is a heading {/* #this-is-a-heading */}
```

将 ID 放在 `h2` 及以下级别。Docusaurus `write-heading-ids` 会跳过 `h1`（页面/侧边栏标题）。`documentation/docusaurus.config.ts` 还会从推断的标题中删除标题 ID 注释，因为 Docusaurus 元数据提取仍然只移除传统的 `{#id}`。

```bash
cd documentation
pnpm write-heading-ids
```

## 忽略列表 {/* #ignore-lists */}

如果为您的工作流程添加了一个忽略列表，在仓库根目录使用 `.translate-ignore`（与 `.gitignore` 相同的概念），用于文档翻译器应跳过的路径。

## Docusaurus 主题 JSON {/* #docusaurus-theme-json */}

`pnpm write-translations` 将 Docusaurus UI 字符串提取到 `documentation/i18n/en/` 中。**ai-i18n-tools** 的 `translate-docs` 步骤（配合 `markdownOutput.style: "docusaurus"`）会根据 `ai-i18n-tools.config.json` 在每个区域设置下与 markdown 同级填充翻译后的 JSON。

## 故障排除 {/* #troubleshooting */}

- `OPENROUTER_API_KEY` **未设置** — 导出它或添加到仓库根目录的 `.env.local`。
- **模型/质量** — 调整 `ai-i18n-tools.config.json` 中的 `openrouter.translationModels` 和相关选项。
- **词汇表** — 编辑 `documentation/glossary-user.csv` 或重新生成 UI 字符串并重新运行提取 + 翻译。

## 添加新语言 {/* #adding-a-new-language */}

1. 在 `documentation/docusaurus.config.ts` 中将区域设置添加到 Docusaurus `i18n.locales` 和 `localeConfigs`。
2. 在 `ai-i18n-tools.config.json`（仓库根目录）的 `targetLocales` 中添加相同的区域设置。
3. 在根目录运行 `pnpm i18n:generate-ui-languages`，然后按需运行 `pnpm i18n:extract` / 翻译命令。
